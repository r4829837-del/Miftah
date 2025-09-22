import React from 'react';
import { exportDatabase, importDatabase } from './storage';

// Configuration pour la synchronisation serveur
const SYNC_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SYNC_SERVER_URL || 'http://localhost:3001/api',
  SYNC_INTERVAL: 60000, // 1 minute
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000 // 5 secondes
};

interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingChanges: boolean;
  syncInProgress: boolean;
  error: string | null;
}

interface ServerResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

class SyncManager {
  private status: SyncStatus = {
    isOnline: false,
    lastSync: null,
    pendingChanges: false,
    syncInProgress: false,
    error: null
  };

  private listeners: ((status: SyncStatus) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSync();
  }

  /**
   * Initialise le système de synchronisation
   */
  private initializeSync(): void {
    // Vérifier la connectivité
    this.checkConnectivity();
    
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.status.error = null;
      this.notifyListeners();
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.notifyListeners();
    });

    // Synchronisation périodique
    this.startPeriodicSync();
  }

  /**
   * Vérifie la connectivité au serveur
   */
  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch(`${SYNC_CONFIG.SERVER_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      this.status.isOnline = response.ok;
      this.status.error = response.ok ? null : 'Serveur indisponible';
    } catch (error) {
      this.status.isOnline = false;
      this.status.error = 'Connexion impossible';
    }
    
    this.notifyListeners();
  }

  /**
   * Démarre la synchronisation périodique
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.status.isOnline && !this.status.syncInProgress) {
        this.syncData();
      }
    }, SYNC_CONFIG.SYNC_INTERVAL);
  }

  /**
   * Synchronise les données avec le serveur
   */
  public async syncData(): Promise<boolean> {
    if (!this.status.isOnline || this.status.syncInProgress) {
      return false;
    }

    this.status.syncInProgress = true;
    this.status.error = null;
    this.notifyListeners();

    try {
      // 1. Exporter les données locales
      const localData = await exportDatabase();
      
      // 2. Envoyer au serveur
      const serverResponse = await this.sendToServer(localData);
      
      if (serverResponse.success) {
        // 3. Récupérer les données du serveur
        const serverData = await this.getFromServer();
        
        if (serverData.success && serverData.data) {
          // 4. Fusionner les données (stratégie simple: serveur prioritaire)
          await this.mergeData(serverData.data, localData);
        }
        
        this.status.lastSync = Date.now();
        this.status.pendingChanges = false;
        console.log('✅ Synchronisation réussie');
        return true;
      } else {
        throw new Error(serverResponse.error || 'Erreur serveur');
      }
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Erreur de synchronisation';
      console.error('❌ Erreur de synchronisation:', error);
      return false;
    } finally {
      this.status.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Envoie les données au serveur
   */
  private async sendToServer(data: any): Promise<ServerResponse> {
    const response = await fetch(`${SYNC_CONFIG.SERVER_URL}/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        timestamp: Date.now(),
        clientId: this.getClientId()
      })
    });

    return await response.json();
  }

  /**
   * Récupère les données du serveur
   */
  private async getFromServer(): Promise<ServerResponse> {
    const response = await fetch(`${SYNC_CONFIG.SERVER_URL}/sync/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return await response.json();
  }

  /**
   * Fusionne les données locales et serveur
   */
  private async mergeData(serverData: any, localData: any): Promise<void> {
    try {
      // Stratégie de fusion simple: serveur prioritaire pour les conflits
      // Vous pouvez implémenter une logique plus sophistiquée ici
      
      if (serverData.timestamp > (localData.timestamp || 0)) {
        // Les données serveur sont plus récentes
        await importDatabase(serverData);
        console.log('📥 Données serveur importées');
      } else {
        // Les données locales sont plus récentes, les envoyer au serveur
        await this.sendToServer(localData);
        console.log('📤 Données locales envoyées au serveur');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la fusion:', error);
      throw error;
    }
  }

  /**
   * Force une synchronisation manuelle
   */
  public async forceSync(): Promise<boolean> {
    await this.checkConnectivity();
    return await this.syncData();
  }

  /**
   * Marque qu'il y a des changements en attente
   */
  public markPendingChanges(): void {
    this.status.pendingChanges = true;
    this.notifyListeners();
  }

  /**
   * Obtient l'ID unique du client
   */
  private getClientId(): string {
    let clientId = localStorage.getItem('appamine_client_id');
    if (!clientId) {
      clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('appamine_client_id', clientId);
    }
    return clientId;
  }

  /**
   * Ajoute un écouteur pour les changements de statut
   */
  public addStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Supprime un écouteur
   */
  public removeStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notifie tous les écouteurs
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.status }));
  }

  /**
   * Obtient le statut actuel
   */
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Arrête la synchronisation périodique
   */
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Instance globale du gestionnaire de synchronisation
export const syncManager = new SyncManager();

// Hook React pour utiliser la synchronisation
export const useSync = () => {
  const [status, setStatus] = React.useState<SyncStatus>(syncManager.getStatus());

  React.useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    syncManager.addStatusListener(handleStatusChange);
    
    return () => {
      syncManager.removeStatusListener(handleStatusChange);
    };
  }, []);

  const forceSync = React.useCallback(async () => {
    return await syncManager.forceSync();
  }, []);

  const markPendingChanges = React.useCallback(() => {
    syncManager.markPendingChanges();
  }, []);

  return {
    status,
    forceSync,
    markPendingChanges
  };
};

// Fonction utilitaire pour marquer les changements
export const markDataChanged = () => {
  syncManager.markPendingChanges();
};

export default syncManager;