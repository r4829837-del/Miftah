import React from 'react';
import { User, LogOut, Users, GraduationCap, School } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentCycle } from '../lib/storage';

export const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getUserType = (email: string) => {
    if (email.includes('lyce.')) return 'Lycée';
    if (email.includes('cem.')) return 'CEM';
    return 'Utilisateur';
  };

  const getUserDisplayName = (email: string) => {
    // Extraire le nom de l'établissement depuis l'email
    const parts = email.split('@')[0].split('.');
    if (parts.length > 1) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return email.split('@')[0];
  };

  const getCycleInfo = (email: string) => {
    const currentCycle = getCurrentCycle();
    if (email.includes('lyce.')) {
      return { cycle: 'ثانوي', label: 'Secondaire', icon: GraduationCap };
    } else if (email.includes('cem.')) {
      return { cycle: 'متوسط', label: 'Collège', icon: School };
    }
    return { cycle: currentCycle, label: 'Cycle actuel', icon: Users };
  };

  const cycleInfo = getCycleInfo(user.email);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-full">
            <User size={20} />
          </div>
          <div>
            <div className="font-medium text-gray-800">
              {getUserDisplayName(user.email)}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Users size={14} />
              {getUserType(user.email)}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <cycleInfo.icon size={14} />
              Cycle {cycleInfo.label} ({cycleInfo.cycle})
            </div>
            <div className="text-xs text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          title="Changer d'utilisateur"
        >
          <LogOut size={16} />
          <span>Changer</span>
        </button>
      </div>
      
      <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
        <strong>ℹ️ Session isolée :</strong> Vos données sont séparées des autres utilisateurs. 
        Cycle automatiquement sélectionné selon votre type d'établissement.
      </div>
    </div>
  );
};