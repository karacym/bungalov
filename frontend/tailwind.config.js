/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#2E5E4E',
        earth: '#8B6B4A',
      },
    },
  },
  plugins: [],
};
