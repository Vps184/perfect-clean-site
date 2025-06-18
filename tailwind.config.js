/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#13304E',
        'navy-footer': '#13304E',
        'snow': '#F8F9FA',
        'silver': '#B0B0B0',
        'navy-light': '#0F2A40'
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif']
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-in',
        'slideInRight': 'slideInRight 0.3s ease'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}