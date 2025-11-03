import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
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
