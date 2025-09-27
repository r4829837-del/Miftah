// Utilitaire de logging pour la production
const isDev = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Les erreurs sont toujours loggées, même en production
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger;