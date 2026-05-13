/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008cba',
          hover: '#60e5ff',
          dark: '#005f7a',
        },
        bg: {
          dark: '#191818',
          card: '#262626',
        },
        accent: {
          orange: '#ed982b',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
