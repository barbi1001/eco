import preprocess from 'svelte-preprocess';
import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
// import { preprocessThrelte } from '@threlte/preprocess'; // Temporarily disabled for Svelte 5 compatibility
import seqPreprocessor from 'svelte-sequential-preprocessor';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: process.env.TAURI_PLATFORM ? adapterStatic() : adapterVercel(),
		paths: {
			base: process.env.TAURI_PLATFORM ? './' : '', // חשוב ל-Tauri
		}
	},

	preprocess: seqPreprocessor([preprocess()])
};

export default config;
