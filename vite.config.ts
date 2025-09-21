import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Base path pour Netlify
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Désactiver les source maps en production
    minify: 'esbuild', // Utiliser esbuild pour une meilleure compatibilité
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'uuid'],
          charts: ['chart.js', 'react-chartjs-2'],
          pdf: ['jspdf', 'html2canvas', 'jspdf-autotable'],
          excel: ['xlsx'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Optimisations pour la production
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: true
  },
  // Configuration pour le serveur de développement
  server: {
    port: 5173,
    host: true
  },
  // Configuration pour la prévisualisation
  preview: {
    port: 4173,
    host: true
  }
});
