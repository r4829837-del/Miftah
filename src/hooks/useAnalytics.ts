import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

/**
 * Hook pour tracker automatiquement les visites de pages et les actions utilisateur
 */
export const useAnalytics = () => {
  const location = useLocation();

  // Tracker les changements de page
  useEffect(() => {
    analyticsService.trackPageVisit(location.pathname);
  }, [location.pathname]);

  // Fonction pour tracker des actions spécifiques
  const trackAction = (action: string) => {
    analyticsService.trackAction(action);
  };

  return { trackAction };
};