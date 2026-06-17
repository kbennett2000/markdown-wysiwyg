import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes the built asset URLs relative, so the app works when served
// from any path. All deps + fonts are bundled, keeping the build fully offline.
export default defineConfig({
  base: './',
  plugins: [react()],
})
