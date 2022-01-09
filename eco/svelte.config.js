import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import vercel from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: vercel(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	},

	preprocess: [preprocess({})]
};

export default config;
