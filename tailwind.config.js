/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4736",   
        secondary: "#f97316", // برتقالي
        background: "#f5f5f5",
        primaryDark: "#051F20",
        navbar:"#E9F5DB"
      },
    },
  },
  plugins: [],
}

