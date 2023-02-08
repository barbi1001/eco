import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import vercel from '@sveltejs/adapter-vercel';
import { preprocessThrelte } from '@threlte/preprocess'
import seqPreprocessor from 'svelte-sequential-preprocessor'


/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: vercel(),
	},

	preprocess: seqPreprocessor([preprocess(), preprocessThrelte()])
};

export default config;
