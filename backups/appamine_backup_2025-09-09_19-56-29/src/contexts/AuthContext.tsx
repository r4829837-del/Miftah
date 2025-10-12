import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authenticateUser } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithChatbot: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Créer une Map pour stocker les sessions actives
const activeSessions = new Map<string, User>();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      const sessionUser = activeSessions.get(sessionId);
      if (sessionUser) {
        setUser(sessionUser);
      } else {
        // Si la session n'existe plus, nettoyer le localStorage
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authenticatedUser = await authenticateUser(email, password);
      if (!authenticatedUser) {
        throw new Error('كلمة المرور غير صحيحة');
      }
      
      // Créer un ID de session unique
      const sessionId = Math.random().toString(36).substring(2);
      
      // Stocker la session
      activeSessions.set(sessionId, authenticatedUser);
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      setUser(authenticatedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithChatbot = async () => {
    try {
      // Créer un utilisateur admin pour la connexion par chatbot
      const chatbotUser: User = {
        id: 'chatbot-admin',
        email: 'admin@school.com',
        name: 'المدير الذكي',
        role: 'admin',
        avatar: '🤖'
      };
      
      // Créer un ID de session unique
      const sessionId = Math.random().toString(36).substring(2);
      
      // Stocker la session
      activeSessions.set(sessionId, chatbotUser);
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('user', JSON.stringify(chatbotUser));
      
      setUser(chatbotUser);
    } catch (error) {
      console.error('Chatbot login error:', error);
      throw error;
    }
  };

  const logout = () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      activeSessions.delete(sessionId);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithChatbot, logout, isLoading }}>
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