/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#0b0e19', 900: '#14192b', 800: '#1d2440', 700: '#2a3357' },
        gold: { 300: '#e3cf9a', 400: '#c9ad6c', 500: '#a58747', 600: '#86692f' },
        stone: { 50: '#f7f5f0' },
        lime: { DEFAULT: '#f3ede2', deep: '#e8dfcf' },
        brick: '#9c3d24',
        terracotta: '#c8693f',
        charcoal: '#23201d',
        soot: '#161412',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
