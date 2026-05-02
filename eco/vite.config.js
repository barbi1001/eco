import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo.jpg'],
      manifest: {
        name: 'BarB עיצוב אישי ואומנות',
        short_name: 'BarB',
        description: 'סטודיו לעיצוב אישי ואומנות בטבריה, צפון ישראל. סדנאות תכשיטים, רקמה ואומנות יצירתית.',
        theme_color: '#c9a96e',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        lang: 'he',
        dir: 'rtl',
        orientation: 'portrait',
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['shopping', 'lifestyle', 'education'],
        screenshots: [
          {
            src: '/images/screenshot.jpg',
            sizes: '1280x720',
            type: 'image/jpeg',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,ttf}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/strapi-7iq2\.onrender\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'strapi-api',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }
            }
          }
        ]
      }
    })
  ],
  ssr: {
    noExternal: ['three', 'troika-three-text', '@threlte/core', '@threlte/extras']
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/loaders/DRACOLoader', '@threlte/core', '@threlte/extras'],
    exclude: ['@threlte/core', '@threlte/extras']
  },
  resolve: {
    alias: {
      'three/examples': 'three/examples'
    }
  },
  server: {
    fs: {
      strict: false
    }
  }
}

export default config
