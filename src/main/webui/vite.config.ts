import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// When Quinoa manages Vite (`./mvnw quarkus:dev`), do NOT proxy API calls back to
// Quarkus — that creates a Quinoa↔Vite deadlock and hangs every SPA request on :8080.
// For separate frontend mode, start with: VITE_PROXY_API=1 npm run dev
const proxyApi = process.env.VITE_PROXY_API === '1'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind IPv4 so Quinoa's HTTP proxy (127.0.0.1:3000) can reach Vite.
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    // Quinoa websocket proxy is disabled; HMR talks to Vite directly.
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 3000,
      clientPort: 3000,
    },
    ...(proxyApi
      ? {
          proxy: {
            '/api': 'http://127.0.0.1:8080',
            '/q': 'http://127.0.0.1:8080',
          },
        }
      : {}),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
