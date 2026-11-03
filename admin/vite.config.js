import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const adminRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-router-dom$/,
        replacement: resolve(adminRoot, 'node_modules/react-router-dom/dist/index.mjs')
      },
      {
        find: /^@phosphor-icons\/react$/,
        replacement: resolve(adminRoot, 'node_modules/@phosphor-icons/react')
      },
      {
        find: /^@mux\/mux-player$/,
        replacement: resolve(adminRoot, 'node_modules/@mux/mux-player')
      }
    ],
    dedupe: ['react', 'react-dom']
  },
  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
