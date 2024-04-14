import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    SvelteKitPWA({/* pwa options */})
  ],
}

export default config
