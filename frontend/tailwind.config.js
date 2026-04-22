/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
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
      backgroundImage: {
        grain: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
};
