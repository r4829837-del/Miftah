import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useSync } from '../lib/sync';

export const SyncIndicator: React.FC = () => {
  const { status, forceSync } = useSync();

  const getStatusIcon = () => {
    if (status.syncInProgress) {
      return <RefreshCw className="animate-spin text-blue-500" size={16} />;
    }
    
    if (!status.isOnline) {
      return <WifiOff className="text-red-500" size={16} />;
    }
    
    if (status.error) {
      return <AlertCircle className="text-orange-500" size={16} />;
    }
    
    if (status.pendingChanges) {
      return <Wifi className="text-yellow-500" size={16} />;
    }
    
    return <CheckCircle className="text-green-500" size={16} />;
  };

  const getStatusText = () => {
    if (status.syncInProgress) {
      return 'Synchronisation...';
    }
    
    if (!status.isOnline) {
      return 'Hors ligne';
    }
    
    if (status.error) {
      return status.error;
    }
    
    if (status.pendingChanges) {
      return 'Changements en attente';
    }
    
    if (status.lastSync) {
      const lastSyncDate = new Date(status.lastSync);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSyncDate.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return 'Synchronisé à l\'instant';
      } else if (diffMinutes < 60) {
        return `Synchronisé il y a ${diffMinutes} min`;
      } else {
        return `Synchronisé à ${lastSyncDate.toLocaleTimeString()}`;
      }
    }
    
    return 'Prêt à synchroniser';
  };

  const handleSyncClick = async () => {
    if (!status.syncInProgress && status.isOnline) {
      await forceSync();
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getStatusIcon()}
      <span className="text-gray-600">{getStatusText()}</span>
      
      {status.isOnline && !status.syncInProgress && (
        <button
          onClick={handleSyncClick}
          className="text-blue-500 hover:text-blue-600 transition-colors"
          title="Synchroniser maintenant"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
};