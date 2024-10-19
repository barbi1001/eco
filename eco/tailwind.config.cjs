const colors = require('tailwindcss/colors')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			
				animation: {
				  flip: "flip 6s infinite steps(2, end)",
				  kitrotate: "kitrotate 3s linear infinite both",
				},
				keyframes: {
				  flip: {
					to: {
					  transform: "rotate(360deg)",
					},
				  },
				  kitrotate: {
					to: {
					  transform: "rotate(90deg)",
					},
				  },
				},
				backgroundImage: {
					goldGrad:
					  'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771c, #FBF5B7, #B38728, #FCF6BA, #BF953F)',
					  goldTobr:
					  'linear-gradient(to bottom right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771c, #FBF5B7, #B38728, #FCF6BA, #BF953F)',
					  liteGoldTobr:
					  'linear-gradient(to bottom right, #BF953F, #EEE8AA, #B38728)',
					  goldShain:
					  'linear-gradient(110deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771c, #FBF5B7, #B38728, #FCF6BA, #BF953F)',
					customGradient:
					  'linear-gradient(to right, #ff7e5f, #feb47b, #86e3ce, #d4a5a5, #ffdfd3, #d4a5a5, #86e3ce, #feb47b, #ff7e5f)'
				  },
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
