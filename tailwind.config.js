/** @type {import('tailwindcss').Config} */
module.exports = {
  	content: [
		"./public/**/*.html",
		"./src/**/*.{js,css}"
	],
  	theme: {
    	extend: {},
  	},
  	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
		require('@tailwindcss/aspect-ratio'),
		require('@tailwindcss/container-queries'),
	],
}