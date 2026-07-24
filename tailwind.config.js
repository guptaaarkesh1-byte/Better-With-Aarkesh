/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090909',
        card: '#111111',
        heading: '#F5F2EB',
        paragraph: '#B8B1A7',
        accent: {
          gold: '#B98A56',
          hover: '#C79A63',
        },
        border: 'rgba(255,255,255,0.10)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      letterSpacing: {
        widest: '.2em',
      }
    },
  },
  plugins: [],
}
