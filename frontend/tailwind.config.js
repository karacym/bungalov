/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
    './i18n/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: '#2E5E4E',
        earth: '#8B6B4A',
        bgl: {
          cream: '#f6f4ef',
          mist: '#e6e2d8',
          sand: '#c9b49a',
          moss: '#3d5749',
          mossDark: '#2a3d33',
          ink: '#1a2420',
          muted: '#5c665f',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(26, 36, 32, 0.12)',
        card: '0 8px 32px -8px rgba(26, 36, 32, 0.14)',
      },
    },
  },
  plugins: [],
};
