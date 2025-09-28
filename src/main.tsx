import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Gestion d'erreur pour l'initialisation
try {
  // Initialiser le système de persistance automatique de manière sécurisée
  import('./lib/persistence').then(async ({ initializePersistence }) => {
    try {
      await initializePersistence();
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation de la persistance:', error);
    }
  }).catch((error) => {
    console.warn('Impossible de charger le module de persistance:', error);
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Erreur critique lors du démarrage de l\'application:', error);
  // Fallback: afficher un message d'erreur
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
      <h1>Erreur de chargement</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <p>Veuillez recharger la page.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
        Recharger la page
      </button>
    </div>
  `;
}
