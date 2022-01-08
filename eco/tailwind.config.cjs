const colors = require('tailwindcss/colors')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				barb: '#FF0066',
				cachol: '#01003d'
			}
		}
	},

	plugins: []
};

module.exports = config;
