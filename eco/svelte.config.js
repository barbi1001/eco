const mode = process.argv[2] || 'vercel';
//import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import vercel from '@sveltejs/adapter-vercel';
import { preprocessThrelte } from '@threlte/preprocess'
import seqPreprocessor from 'svelte-sequential-preprocessor'
import adapterStatic from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess'
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter:  adapterStatic({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}) ,
		paths: {
			base: '',
		}
	},
	prerender: {entries: ['/1/7','/1']},
	preprocess: seqPreprocessor([sveltePreprocess(), preprocessThrelte()])
};

export default config;
