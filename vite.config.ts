import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base keeps the build portable: GitHub Pages subpaths, Cloudflare
// Pages, or opening dist/index.html from a local server all work.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
  },
})
