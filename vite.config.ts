import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === 'build' || isPreview ? '/games/API-Quest/' : '/',
  test: {
    environment: 'jsdom',
  },
}))
