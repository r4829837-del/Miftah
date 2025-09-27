import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App-test.tsx';
import './index.css';

// Version de test sans persistance pour diagnostiquer
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
