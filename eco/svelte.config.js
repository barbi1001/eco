import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import vercel from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: vercel(),
	},

	preprocess: [preprocess({})]
};

export default config;
