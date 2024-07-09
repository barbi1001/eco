const colors = require('tailwindcss/colors')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				barb: '#FF0066',
				cachol: '#01003d',
				love:"#FF0065",
				nice:'rgb(255, 131, 168)',
				sof: 'rgb(254, 132, 169)',
				pinki: "#fb6298"
			}
		}
	},

	plugins: []
};

module.exports = config;
