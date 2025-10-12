import localforage from 'localforage';

export interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  loginTime: string;
  logoutTime?: string;
  duration?: number; // en minutes
  pagesVisited: string[];
  actionsPerformed: string[];
  userAgent: string;
  ipAddress?: string;
  schoolType: 'lyce' | 'cem';
  cycle: string;
}

export interface DailyStats {
  date: string;
  totalLogins: number;
  uniqueUsers: number;
  totalSessionTime: number; // en minutes
  averageSessionTime: number; // en minutes
  mostVisitedPages: { page: string; visits: number }[];
  mostActiveUsers: { email: string; sessions: number; totalTime: number }[];
  schoolTypeStats: {
    lyce: { logins: number; users: number };
    cem: { logins: number; users: number };
  };
}

export interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalSessionTime: number;
  averageSessionTime: number;
  dailyStats: DailyStats[];
  topUsers: { email: string; sessions: number; totalTime: number }[];
  schoolTypeDistribution: {
    lyce: number;
    cem: number;
  };
  lastUpdated: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private analyticsDB: LocalForage;
  private currentSession: UserSession | null = null;

  private constructor() {
    this.analyticsDB = localforage.createInstance({
      name: 'appamine_analytics',
      storeName: 'sessions'
    });
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Démarrer une nouvelle session utilisateur
   */
  public async startSession(userId: string, userEmail: string, schoolType: 'lyce' | 'cem', cycle: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      userId,
      userEmail,
      loginTime: new Date().toISOString(),
      pagesVisited: ['/login'],
      actionsPerformed: ['login'],
      userAgent: navigator.userAgent,
      schoolType,
      cycle
    };

    // Sauvegarder la session
    await this.analyticsDB.setItem(sessionId, this.currentSession);
    
    // Mettre à jour les statistiques quotidiennes
    await this.updateDailyStats('login', userEmail, schoolType);
    
    console.log(`📊 Session démarrée: ${userEmail} (${schoolType})`);
    return sessionId;
  }

  /**
   * Terminer la session actuelle
   */
  public async endSession(): Promise<void> {
    if (!this.currentSession) return;

    const logoutTime = new Date();
    const loginTime = new Date(this.currentSession.loginTime);
    const duration = Math.round((logoutTime.getTime() - loginTime.getTime()) / (1000 * 60)); // en minutes

    this.currentSession.logoutTime = logoutTime.toISOString();
    this.currentSession.duration = duration;

    // Sauvegarder la session mise à jour
    await this.analyticsDB.setItem(this.currentSession.id, this.currentSession);
    
    // Mettre à jour les statistiques quotidiennes
    await this.updateDailyStats('logout', this.currentSession.userEmail, this.currentSession.schoolType, duration);
    
    console.log(`📊 Session terminée: ${this.currentSession.userEmail} - Durée: ${duration} minutes`);
    
    this.currentSession = null;
  }

  /**
   * Enregistrer une visite de page
   */
  public async trackPageVisit(page: string): Promise<void> {
    if (!this.currentSession) return;

    if (!this.currentSession.pagesVisited.includes(page)) {
      this.currentSession.pagesVisited.push(page);
      await this.analyticsDB.setItem(this.currentSession.id, this.currentSession);
    }
  }

  /**
   * Enregistrer une action utilisateur
   */
  public async trackAction(action: string): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.actionsPerformed.push(`${action}_${new Date().toISOString()}`);
    await this.analyticsDB.setItem(this.currentSession.id, this.currentSession);
  }

  /**
   * Mettre à jour les statistiques quotidiennes
   */
  private async updateDailyStats(event: 'login' | 'logout', userEmail: string, schoolType: 'lyce' | 'cem', sessionDuration?: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyStatsKey = `daily_${today}`;
    
    let dailyStats: DailyStats = await this.analyticsDB.getItem(dailyStatsKey) || {
      date: today,
      totalLogins: 0,
      uniqueUsers: 0,
      totalSessionTime: 0,
      averageSessionTime: 0,
      mostVisitedPages: [],
      mostActiveUsers: [],
      schoolTypeStats: {
        lyce: { logins: 0, users: 0 },
        cem: { logins: 0, users: 0 }
      }
    };

    if (event === 'login') {
      dailyStats.totalLogins++;
      
      // Compter les utilisateurs uniques
      const userExists = dailyStats.mostActiveUsers.find(u => u.email === userEmail);
      if (!userExists) {
        dailyStats.uniqueUsers++;
        dailyStats.mostActiveUsers.push({
          email: userEmail,
          sessions: 1,
          totalTime: 0
        });
      } else {
        userExists.sessions++;
      }

      // Statistiques par type d'établissement
      dailyStats.schoolTypeStats[schoolType].logins++;
      if (!dailyStats.mostActiveUsers.find(u => u.email === userEmail)) {
        dailyStats.schoolTypeStats[schoolType].users++;
      }
    }

    if (event === 'logout' && sessionDuration) {
      dailyStats.totalSessionTime += sessionDuration;
      dailyStats.averageSessionTime = dailyStats.totalLogins > 0 
        ? Math.round(dailyStats.totalSessionTime / dailyStats.totalLogins) 
        : 0;

      // Mettre à jour le temps total de l'utilisateur
      const user = dailyStats.mostActiveUsers.find(u => u.email === userEmail);
      if (user) {
        user.totalTime += sessionDuration;
      }
    }

    await this.analyticsDB.setItem(dailyStatsKey, dailyStats);
  }

  /**
   * Obtenir les statistiques globales
   */
  public async getAnalyticsData(): Promise<AnalyticsData> {
    const allSessions: UserSession[] = [];
    const dailyStats: DailyStats[] = [];
    
    try {
      // Récupérer toutes les sessions
      await this.analyticsDB.iterate((value: UserSession) => {
        if (value.id.startsWith('session_')) {
          allSessions.push(value);
        } else if (value.id.startsWith('daily_')) {
          dailyStats.push(value as any);
        }
      });
    } catch (error) {
      console.log('Aucune donnée analytics trouvée, utilisation des données de démonstration');
    }

    // Si aucune donnée n'existe, utiliser des données de démonstration
    if (allSessions.length === 0) {
      return this.getDemoAnalyticsData();
    }

    // Calculer les statistiques globales
    const totalUsers = new Set(allSessions.map(s => s.userEmail)).size;
    const totalSessions = allSessions.length;
    const totalSessionTime = allSessions
      .filter(s => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionTime = totalSessions > 0 ? Math.round(totalSessionTime / totalSessions) : 0;

    // Top utilisateurs
    const userStats = new Map<string, { sessions: number; totalTime: number }>();
    allSessions.forEach(session => {
      const existing = userStats.get(session.userEmail) || { sessions: 0, totalTime: 0 };
      userStats.set(session.userEmail, {
        sessions: existing.sessions + 1,
        totalTime: existing.totalTime + (session.duration || 0)
      });
    });

    const topUsers = Array.from(userStats.entries())
      .map(([email, stats]) => ({ email, ...stats }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    // Distribution par type d'établissement
    const schoolTypeDistribution = {
      lyce: allSessions.filter(s => s.schoolType === 'lyce').length,
      cem: allSessions.filter(s => s.schoolType === 'cem').length
    };

    return {
      totalUsers,
      totalSessions,
      totalSessionTime,
      averageSessionTime,
      dailyStats: dailyStats.sort((a, b) => b.date.localeCompare(a.date)),
      topUsers,
      schoolTypeDistribution,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Obtenir des données de démonstration pour les analytics
   */
  private getDemoAnalyticsData(): AnalyticsData {
    const today = new Date();
    const dailyStats: DailyStats[] = [];
    
    // Générer des données de démonstration pour les 30 derniers jours
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats.push({
        date: dateStr,
        totalLogins: Math.floor(Math.random() * 20) + 5,
        uniqueUsers: Math.floor(Math.random() * 15) + 3,
        totalSessionTime: Math.floor(Math.random() * 300) + 100,
        averageSessionTime: Math.floor(Math.random() * 30) + 10,
        mostVisitedPages: [
          { page: '/', visits: Math.floor(Math.random() * 50) + 20 },
          { page: '/students', visits: Math.floor(Math.random() * 30) + 10 },
          { page: '/analysis', visits: Math.floor(Math.random() * 20) + 5 }
        ],
        mostActiveUsers: [
          { email: 'admin@example.com', sessions: Math.floor(Math.random() * 5) + 1, totalTime: Math.floor(Math.random() * 120) + 30 }
        ],
        schoolTypeStats: {
          lyce: { logins: Math.floor(Math.random() * 10) + 2, users: Math.floor(Math.random() * 8) + 1 },
          cem: { logins: Math.floor(Math.random() * 8) + 1, users: Math.floor(Math.random() * 6) + 1 }
        }
      });
    }

    return {
      totalUsers: 15,
      totalSessions: 89,
      totalSessionTime: 1247,
      averageSessionTime: 14,
      dailyStats,
      topUsers: [
        { email: 'admin@example.com', sessions: 12, totalTime: 180 },
        { email: 'user1@example.com', sessions: 8, totalTime: 120 },
        { email: 'user2@example.com', sessions: 6, totalTime: 90 }
      ],
      schoolTypeDistribution: {
        lyce: 45,
        cem: 44
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Obtenir les statistiques d'un utilisateur spécifique
   */
  public async getUserStats(userEmail: string): Promise<{
    totalSessions: number;
    totalTime: number;
    averageSessionTime: number;
    lastLogin: string;
    pagesVisited: string[];
    actionsPerformed: string[];
  }> {
    const userSessions = await this.analyticsDB.iterate((value: UserSession) => {
      if (value.id.startsWith('session_') && value.userEmail === userEmail) {
        return value;
      }
      return null;
    });

    const sessions = userSessions.filter(s => s !== null) as UserSession[];
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionTime = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;
    const lastLogin = sessions.length > 0 ? sessions.sort((a, b) => 
      new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    )[0].loginTime : '';

    const allPages = sessions.flatMap(s => s.pagesVisited);
    const uniquePages = [...new Set(allPages)];

    const allActions = sessions.flatMap(s => s.actionsPerformed);

    return {
      totalSessions,
      totalTime,
      averageSessionTime,
      lastLogin,
      pagesVisited: uniquePages,
      actionsPerformed: allActions
    };
  }

  /**
   * Nettoyer les anciennes données (plus de 90 jours)
   */
  public async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    await this.analyticsDB.iterate((value: UserSession, key: string) => {
      if (key.startsWith('session_') && value.loginTime) {
        const sessionDate = new Date(value.loginTime);
        if (sessionDate < cutoffDate) {
          this.analyticsDB.removeItem(key);
        }
      }
    });

    console.log('📊 Nettoyage des anciennes données d\'analytics terminé');
  }

  /**
   * Exporter les données d'analytics
   */
  public async exportAnalyticsData(): Promise<{
    sessions: UserSession[];
    dailyStats: DailyStats[];
    summary: AnalyticsData;
  }> {
    const sessions: UserSession[] = [];
    const dailyStats: DailyStats[] = [];

    await this.analyticsDB.iterate((value: any, key: string) => {
      if (key.startsWith('session_')) {
        sessions.push(value);
      } else if (key.startsWith('daily_')) {
        dailyStats.push(value);
      }
    });

    const summary = await this.getAnalyticsData();

    return {
      sessions,
      dailyStats,
      summary
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();