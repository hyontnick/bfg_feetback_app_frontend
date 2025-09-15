import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://bfg-feetback-serveur.onrender.com', // URL de votre backend Render
        changeOrigin: true,
        secure: true,
      },
    },
  },
})