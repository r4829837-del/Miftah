import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Base path relatif pour Netlify
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'localforage',
      'date-fns',
      'uuid'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Désactiver les source maps en production
    minify: 'esbuild', // Utiliser esbuild pour une meilleure compatibilité
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React et React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Chart.js et dépendances
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }
          // PDF et dépendances
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('pdf-lib') || id.includes('pdfmake')) {
            return 'pdf';
          }
          // Excel et dépendances
          if (id.includes('xlsx') || id.includes('file-saver')) {
            return 'excel';
          }
          // UI et icônes
          if (id.includes('lucide-react')) {
            return 'ui';
          }
          // Utilitaires
          if (id.includes('date-fns') || id.includes('uuid') || id.includes('localforage')) {
            return 'utils';
          }
          // Composants de l'application - diviser en chunks plus petits
          if (id.includes('/components/')) {
            if (id.includes('/components/tests/')) {
              return 'components-tests';
            }
            if (id.includes('Analysis') || id.includes('Reports')) {
              return 'components-analysis';
            }
            if (id.includes('Student') || id.includes('Group')) {
              return 'components-management';
            }
            return 'components-other';
          }
          // Services et libs
          if (id.includes('/lib/') || id.includes('/services/')) {
            return 'services';
          }
          // Node modules restants
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
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
