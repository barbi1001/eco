const colors = require('tailwindcss/colors')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				barb: '#FF0066',
				cachol: '#01003d',
				sof: 'rgb(254, 132, 169)'
			}
		}
	},

	plugins: []
};

module.exports = config;
