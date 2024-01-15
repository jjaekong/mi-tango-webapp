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
    require("@tailwindcss/forms")
  ],
}