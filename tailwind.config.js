/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{css,js}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
}