/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0c4a6e",   // أزرق رسمي
        secondary: "#f97316", // برتقالي
        background: "#f5f5f5",
        primaryDark: "#0a3b58"
      },
    },
  },
  plugins: [],
}

