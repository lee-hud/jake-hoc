import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/mark.svg'],
      manifest: {
        name: 'Jake Học · Luyện HSK 1–6',
        short_name: 'Jake Học',
        description: 'Học 5.000 từ HSK bằng tiếng Việt: flashcard, luyện gõ, quiz và phát âm.',
        theme_color: '#f7f4ec',
        background_color: '#f7f4ec',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'vi',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,webmanifest}'],
        globIgnores: ['**/audio/**'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /^\/audio\/hsk[1-6]\.zip$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'hanzi-hsk-audio-packs',
              expiration: { maxEntries: 6, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  preview: { host: '0.0.0.0', port: 3000, strictPort: true },
})
