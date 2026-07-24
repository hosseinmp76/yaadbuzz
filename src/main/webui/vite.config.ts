import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    // Used when the Vite app is run separately from Quarkus (`npm run dev`).
    // Quinoa's integrated mode already proxies through http://localhost:8080.
    proxy: {
      '/graphql': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      '/q': 'http://localhost:8080',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
