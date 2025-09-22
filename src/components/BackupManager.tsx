import React, { useState, useEffect } from 'react';
import { 
  listBackups, 
  restoreFromBackup, 
  manualBackup, 
  createFullExport,
  checkDataIntegrity 
} from '../lib/persistence';
import { BackupMetadata } from '../lib/persistence';
import { Download, Upload, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

interface BackupManagerProps {
  onClose: () => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ onClose }) => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<boolean | null>(null);

  useEffect(() => {
    loadBackups();
    checkIntegrity();
  }, []);

  const loadBackups = async () => {
    try {
      const backupList = await listBackups();
      setBackups(backupList);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des sauvegardes' });
    }
  };

  const checkIntegrity = async () => {
    try {
      const isIntact = await checkDataIntegrity();
      setIntegrityStatus(isIntact);
    } catch (error) {
      setIntegrityStatus(false);
    }
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    try {
      await manualBackup();
      await loadBackups();
      setMessage({ type: 'success', text: 'Sauvegarde manuelle effectuée avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde manuelle' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action remplacera toutes les données actuelles.')) {
      return;
    }

    setIsLoading(true);
    try {
      await restoreFromBackup(backupId);
      setMessage({ type: 'success', text: 'Sauvegarde restaurée avec succès' });
      await checkIntegrity();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la restauration' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      await createFullExport();
      setMessage({ type: 'success', text: 'Export téléchargé avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'export' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Sauvegardes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Statut d'intégrité */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            {integrityStatus === true ? (
              <Shield className="text-green-500" size={20} />
            ) : integrityStatus === false ? (
              <AlertTriangle className="text-red-500" size={20} />
            ) : (
              <RefreshCw className="text-gray-500 animate-spin" size={20} />
            )}
            <span className="font-medium">
              Intégrité des données: 
              {integrityStatus === true && <span className="text-green-600 ml-2">✓ Intacte</span>}
              {integrityStatus === false && <span className="text-red-600 ml-2">✗ Corrompue</span>}
              {integrityStatus === null && <span className="text-gray-600 ml-2">Vérification...</span>}
            </span>
          </div>
        </div>

        {/* Message de statut */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleManualBackup}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
            Sauvegarde Manuelle
          </button>
          
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download size={20} />
            Exporter les Données
          </button>
          
          <button
            onClick={checkIntegrity}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            <Shield size={20} />
            Vérifier l'Intégrité
          </button>
        </div>

        {/* Liste des sauvegardes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Sauvegardes Disponibles</h3>
          
          {backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune sauvegarde disponible</p>
              <p className="text-sm">Les sauvegardes automatiques apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-800">
                          Cycle: {backup.cycle}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({formatSize(backup.size)})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(backup.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Version: {backup.version}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(backup.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
                      >
                        <Upload size={16} />
                        Restaurer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations sur la persistance */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">ℹ️ À propos de la persistance</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Sauvegarde automatique toutes les 30 secondes</li>
            <li>• Sauvegarde lors de la fermeture de l'application</li>
            <li>• Sauvegarde dans IndexedDB et localStorage</li>
            <li>• Conservation des 10 dernières sauvegardes automatiques</li>
            <li>• Export téléchargeable pour sauvegarde externe</li>
          </ul>
        </div>
      </div>
    </div>
  );
};