import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ── Dev server proxy — /api calls jate hain backend pe ──────
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/api') // not needed
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
