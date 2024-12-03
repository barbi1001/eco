import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['three', 'troika-three-text']
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/loaders/DRACOLoader']
  },
  resolve: {
    alias: {
      'three/examples': 'three/examples'
    }
  }
}

export default config
