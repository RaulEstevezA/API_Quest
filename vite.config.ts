import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [
    react(),
    {
      name: 'cloudflare-web-analytics',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler: () => [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              'data-cf-beacon': JSON.stringify({ token: 'e39c213b71d04ecea667fe1a7c72f355' }),
            },
            injectTo: 'body',
          },
        ],
      },
    },
  ],
  base: command === 'build' || isPreview ? '/games/API-Quest/' : '/',
  test: {
    environment: 'jsdom',
  },
}))
