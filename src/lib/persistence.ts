import localforage from 'localforage';
import { exportDatabase } from './storage';

// Configuration pour la persistance
const PERSISTENCE_CONFIG = {
  AUTO_SAVE_INTERVAL: 30000, // 30 secondes
  MAX_BACKUPS: 10,
  BACKUP_PREFIX: 'backup_',
  EXPORT_PREFIX: 'export_'
};

// Interface pour les métadonnées de sauvegarde
interface BackupMetadata {
  id: string;
  timestamp: number;
  cycle: string;
  size: number;
  version: string;
}

// Instance LocalForage pour les sauvegardes
const backupDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'backups'
});

// Instance LocalForage pour les exports
const exportDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'exports'
});

/**
 * Crée une sauvegarde automatique des données
 */
export const createAutoBackup = async (cycle?: string): Promise<void> => {
  try {
    const data = await exportDatabase(cycle);
    const timestamp = Date.now();
    const backupId = `${PERSISTENCE_CONFIG.BACKUP_PREFIX}${timestamp}`;
    
    // Créer les métadonnées de sauvegarde
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      cycle: cycle || 'default',
      size: JSON.stringify(data).length,
      version: '1.0'
    };

    // Sauvegarder les données et les métadonnées
    await Promise.all([
      backupDB.setItem(backupId, data),
      backupDB.setItem(`${backupId}_metadata`, metadata)
    ]);

    console.log(`✅ Sauvegarde automatique créée: ${backupId}`);
    
    // Nettoyer les anciennes sauvegardes
    await cleanupOldBackups();
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde automatique:', error);
  }
};

/**
 * Crée un export complet des données
 */
export const createFullExport = async (cycle?: string): Promise<string> => {
  try {
    const data = await exportDatabase(cycle);
    const timestamp = Date.now();
    const exportId = `${PERSISTENCE_CONFIG.EXPORT_PREFIX}${timestamp}`;
    
    // Sauvegarder l'export
    await exportDB.setItem(exportId, data);
    
    // Créer un fichier téléchargeable
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    // Télécharger automatiquement
    const a = document.createElement('a');
    a.href = url;
    a.download = `appamine_backup_${new Date(timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Export complet créé: ${exportId}`);
    return exportId;
  } catch (error) {
    console.error('❌ Erreur lors de l\'export complet:', error);
    throw error;
  }
};

/**
 * Restaure les données depuis une sauvegarde
 */
export const restoreFromBackup = async (backupId: string): Promise<void> => {
  try {
    const data = await backupDB.getItem(backupId);
    if (!data) {
      throw new Error('Sauvegarde non trouvée');
    }

    // Importer les données restaurées
    const { importDatabase } = await import('./storage');
    await importDatabase(data);
    
    console.log(`✅ Données restaurées depuis: ${backupId}`);
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    throw error;
  }
};

/**
 * Liste toutes les sauvegardes disponibles
 */
export const listBackups = async (): Promise<BackupMetadata[]> => {
  try {
    const backups: BackupMetadata[] = [];
    
    await backupDB.iterate((value, key) => {
      if (key.endsWith('_metadata')) {
        backups.push(value as BackupMetadata);
      }
    });
    
    // Trier par timestamp décroissant
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('❌ Erreur lors de la liste des sauvegardes:', error);
    return [];
  }
};

/**
 * Supprime les anciennes sauvegardes pour économiser l'espace
 */
const cleanupOldBackups = async (): Promise<void> => {
  try {
    const backups = await listBackups();
    
    if (backups.length > PERSISTENCE_CONFIG.MAX_BACKUPS) {
      const toDelete = backups.slice(PERSISTENCE_CONFIG.MAX_BACKUPS);
      
      await Promise.all(
        toDelete.map(async (backup) => {
          await Promise.all([
            backupDB.removeItem(backup.id),
            backupDB.removeItem(`${backup.id}_metadata`)
          ]);
        })
      );
      
      console.log(`🧹 ${toDelete.length} anciennes sauvegardes supprimées`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

/**
 * Sauvegarde dans le localStorage comme backup supplémentaire
 */
export const saveToLocalStorage = async (cycle?: string): Promise<void> => {
  try {
    const data = await exportDatabase(cycle);
    const key = `appamine_backup_${cycle || 'default'}_${Date.now()}`;
    
    // Sauvegarder dans localStorage (limité à ~5-10MB)
    localStorage.setItem(key, JSON.stringify(data));
    
    // Nettoyer les anciennes sauvegardes localStorage
    const keys = Object.keys(localStorage).filter(k => k.startsWith('appamine_backup_'));
    if (keys.length > 5) {
      keys.slice(0, keys.length - 5).forEach(k => localStorage.removeItem(k));
    }
    
    console.log(`✅ Sauvegarde localStorage créée: ${key}`);
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error);
  }
};

/**
 * Restaure depuis localStorage
 */
export const restoreFromLocalStorage = async (key: string): Promise<void> => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      throw new Error('Sauvegarde localStorage non trouvée');
    }

    const parsedData = JSON.parse(data);
    const { importDatabase } = await import('./storage');
    await importDatabase(parsedData);
    
    console.log(`✅ Données restaurées depuis localStorage: ${key}`);
  } catch (error) {
    console.error('❌ Erreur restauration localStorage:', error);
    throw error;
  }
};

/**
 * Initialise le système de persistance automatique
 */
export const initializePersistence = (): void => {
  // Sauvegarde automatique toutes les 30 secondes
  setInterval(() => {
    createAutoBackup();
  }, PERSISTENCE_CONFIG.AUTO_SAVE_INTERVAL);

  // Sauvegarde lors de la fermeture de la page
  window.addEventListener('beforeunload', () => {
    createAutoBackup();
    saveToLocalStorage();
  });

  // Sauvegarde lors des changements de visibilité
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      createAutoBackup();
    }
  });

  console.log('🔄 Système de persistance automatique initialisé');
};

/**
 * Sauvegarde manuelle déclenchée par l'utilisateur
 */
export const manualBackup = async (): Promise<void> => {
  try {
    await Promise.all([
      createAutoBackup(),
      saveToLocalStorage(),
      createFullExport()
    ]);
    
    console.log('✅ Sauvegarde manuelle complète effectuée');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde manuelle:', error);
    throw error;
  }
};

/**
 * Vérifie l'intégrité des données
 */
export const checkDataIntegrity = async (): Promise<boolean> => {
  try {
    const data = await exportDatabase();
    
    // Vérifications basiques
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    if (!Array.isArray(data.students) || !Array.isArray(data.users)) {
      return false;
    }
    
    console.log('✅ Intégrité des données vérifiée');
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification intégrité:', error);
    return false;
  }
};