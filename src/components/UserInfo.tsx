import React from 'react';
import { User, Users, GraduationCap, School } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentCycle } from '../lib/storage';

export const UserInfo: React.FC = () => {
  const { user } = useAuth();

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
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2">
        <div className="bg-blue-500 text-white p-1.5 rounded-full">
          <User size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-800 text-sm">
            {getUserDisplayName(user.email)}
          </div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Users size={12} />
            {getUserType(user.email)}
          </div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <cycleInfo.icon size={12} />
            Cycle {cycleInfo.label} ({cycleInfo.cycle})
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user.email}
          </div>
        </div>
      </div>
      

    </div>
  );
};