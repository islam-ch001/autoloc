import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Désactive sourcemap en prod (gain : ~20% taille)
    sourcemap: false,

    // Minification agressive (oxc est le minifier par défaut de Vite 8)
    minify: true,
    target: 'es2020',

    // Augmente la limite de warning pour les chunks
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Code splitting : sépare les grosses libs en chunks dédiés
        // → permet au navigateur de charger en parallèle et de mettre en cache
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'react-vendor';
            if (id.includes('react-dom') || id.match(/[\\/]react[\\/]/)) return 'react-vendor';
            if (id.includes('recharts') || id.includes('d3-')) return 'recharts';
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('lucide-react')) return 'lucide';
          }
        },
      },
    },
  },

  // Pré-bundling des deps fréquentes pour dev rapide
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'date-fns', 'lucide-react'],
  },
})
