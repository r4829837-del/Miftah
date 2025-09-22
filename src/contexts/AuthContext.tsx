import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/storage';
import localforage from 'localforage';
import { AUTHORIZED_USERS } from '../lib/authorizedUsers';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Créer une instance LocalForage pour l'authentification
const authDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'auth'
});

// Fonction utilitaire pour détecter le type d'établissement et le cycle
const detectSchoolTypeAndCycle = (email: string): { cycle: 'متوسط' | 'ثانوي', type: string, confidence: 'high' | 'medium' | 'low' } => {
  const emailLower = email.toLowerCase();
  
  // Détection haute confiance (patterns exacts)
  if (emailLower.includes('lyce.') || emailLower.includes('lycée') || emailLower.includes('lycee')) {
    return { cycle: 'ثانوي', type: 'Lycée', confidence: 'high' };
  }
  
  if (emailLower.includes('cem.') || emailLower.includes('college') || emailLower.includes('collège')) {
    return { cycle: 'متوسط', type: 'CEM', confidence: 'high' };
  }
  
  // Détection moyenne confiance (patterns partiels)
  if (emailLower.includes('lyce') || emailLower.includes('lycée')) {
    return { cycle: 'ثانوي', type: 'Lycée', confidence: 'medium' };
  }
  
  if (emailLower.includes('cem') || emailLower.includes('college')) {
    return { cycle: 'متوسط', type: 'CEM', confidence: 'medium' };
  }
  
  // Fallback par défaut
  return { cycle: 'متوسط', type: 'CEM', confidence: 'low' };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Vérifier si un utilisateur est déjà connecté depuis localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr) as User;
          setUser(currentUser);
          
          // Définir le cycle automatiquement selon le type d'établissement
          const detection = detectSchoolTypeAndCycle(currentUser.email);
          const defaultCycle = detection.cycle;
          const detectedType = detection.type;
          
          // Définir le cycle automatiquement si pas déjà défini
          const currentCycle = localStorage.getItem('currentCycle');
          if (!currentCycle) {
            localStorage.setItem('currentCycle', defaultCycle);
            const confidenceIcon = detection.confidence === 'high' ? '🎯' : detection.confidence === 'medium' ? '⚠️' : '❓';
            console.log(`${confidenceIcon} Cycle automatique défini au chargement: ${defaultCycle} (${detectedType}) pour ${currentUser.email} - Confiance: ${detection.confidence}`);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Écouter les changements d'authentification depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          try {
            const newUser = JSON.parse(e.newValue) as User;
            console.log(`🔄 Utilisateur changé depuis un autre onglet: ${newUser.email}`);
            setUser(newUser);
            
            // Définir le cycle automatiquement selon le type d'établissement
            const detection = detectSchoolTypeAndCycle(newUser.email);
            const defaultCycle = detection.cycle;
            const detectedType = detection.type;
            
            // Forcer la mise à jour du cycle
            localStorage.setItem('currentCycle', defaultCycle);
            const confidenceIcon = detection.confidence === 'high' ? '🎯' : detection.confidence === 'medium' ? '⚠️' : '❓';
            console.log(`${confidenceIcon} Cycle automatique défini depuis un autre onglet: ${defaultCycle} (${detectedType}) pour ${newUser.email} - Confiance: ${detection.confidence}`);
          } catch (error) {
            console.error('Erreur lors du parsing de l\'utilisateur depuis un autre onglet:', error);
          }
        } else {
          // Déconnexion depuis un autre onglet
          console.log('🔄 Déconnexion depuis un autre onglet');
          setUser(null);
        }
      }
    };

    // Écouter les changements de localStorage depuis d'autres onglets
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Chercher l'utilisateur dans la liste des utilisateurs autorisés
      const foundUser = AUTHORIZED_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('كلمة المرور غير صحيحة أو المستخدم غير مخول');
      }

      // Déterminer le cycle automatiquement selon le type d'établissement
      const detection = detectSchoolTypeAndCycle(email);
      const defaultCycle = detection.cycle;
      const detectedType = detection.type;

      // Définir le cycle automatiquement
      localStorage.setItem('currentCycle', defaultCycle);
      
      // Logs avec niveau de confiance
      const confidenceIcon = detection.confidence === 'high' ? '🎯' : detection.confidence === 'medium' ? '⚠️' : '❓';
      console.log(`${confidenceIcon} Cycle automatique défini: ${defaultCycle} (${detectedType}) pour ${email} - Confiance: ${detection.confidence}`);
      
      // Afficher une notification à l'utilisateur
      if (detection.confidence === 'low') {
        console.warn(`⚠️ Détection automatique avec faible confiance pour ${email}. Cycle par défaut: ${defaultCycle}`);
      } else {
        console.log(`✅ Connexion réussie - Cycle ${defaultCycle} (${detectedType}) détecté automatiquement avec confiance ${detection.confidence}`);
      }

      // Créer un objet utilisateur sans le mot de passe pour la session
      const sessionUser: User = {
        id: foundUser.id,
        email: foundUser.email,
        password: '', // Ne pas stocker le mot de passe en session
        role: foundUser.role,
        createdAt: new Date().toISOString(),
      };

      // Sauvegarder l'utilisateur connecté avec son ID unique pour l'isolation
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      await authDB.setItem('currentUser', sessionUser);
      setUser(sessionUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('currentUser');
      await authDB.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};