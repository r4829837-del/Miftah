import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Utilisateurs autorisés
const authorizedUsers = [
  {
    id: '1',
    email: 'harounsolution@gmail.com',
    password: '00000',
    role: 'admin',
    name: 'هارون الحلول'
  },
  {
    id: '2',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    name: 'المدير'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (session locale)
    const savedUser = localStorage.getItem('appamine_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        localStorage.removeItem('appamine_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simuler un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier les identifiants
      const foundUser = authorizedUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('كلمة المرور غير صحيحة');
      }

      const mappedUser: User = {
        id: foundUser.id,
        email: foundUser.email,
        password: '',
        role: foundUser.role as 'admin' | 'teacher',
        createdAt: new Date().toISOString(),
      };

      // Sauvegarder la session
      localStorage.setItem('appamine_user', JSON.stringify(mappedUser));
      setUser(mappedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('appamine_user');
    setUser(null);
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