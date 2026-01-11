/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",   // أزرق رسمي
        secondary: "#f97316", // برتقالي
        background: "#f5f5f5"
      },
    },
  },
  plugins: [],
}

