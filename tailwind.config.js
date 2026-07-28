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
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'float-medium': 'float 8s ease-in-out infinite',
        'float-fast': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%, 90%': { opacity: '0.8' },
          '33%': { transform: 'translateY(-20px) translateX(15px)' },
          '66%': { transform: 'translateY(10px) translateX(-15px)' },
        }
      }
    },
  },
  plugins: [],
}
