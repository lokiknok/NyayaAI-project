/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nyaya: {
          navy: {
            900: '#0A192F', // Deepest background
            800: '#0F2744', // Card & sidebar background
            700: '#16355C', // Elevated surface
            600: '#1E4678', // Hover state
            500: '#2A5D9E', // Primary interactive
            100: '#E8F1FA',
            50: '#F4F8FC'
          },
          gold: {
            500: '#C5A880', // Legal emblem accent
            400: '#D8BE9B',
            600: '#B0936A',
          },
          parchment: '#FAF8F5',
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

