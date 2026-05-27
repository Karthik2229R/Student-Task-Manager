/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg))',
        surface: 'rgb(var(--surface))',
        panel: 'rgb(var(--panel))',
        text: 'rgb(var(--text))',
        muted: 'rgb(var(--muted))',
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 50px -30px rgba(15, 23, 42, 0.35)',
        soft: '0 12px 30px -20px rgba(15, 23, 42, 0.4)',
      },
    },
  },
  plugins: [],
}
