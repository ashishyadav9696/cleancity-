import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // SPA mode: dev server & preview server both fall back to index.html
  // instead of returning 404 when the user refreshes a React Router URL.
  appType: 'spa',

  server: {
    port: 5173,
    // Serve index.html for any unknown path (React Router handles it)
    historyApiFallback: true,
  },

  preview: {
    port: 4173,
    // Same fallback for `vite preview` (production build preview)
    historyApiFallback: true,
  },
})
