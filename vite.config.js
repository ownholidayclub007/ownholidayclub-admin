import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Force reload for axios installation

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    postcss: {
      plugins: [], // override parent postcss.config.js - use @tailwindcss/vite instead
    },
  },
})
