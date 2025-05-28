/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#E6FFFC',
          100: '#B3FFF7',
          200: '#80FFF2',
          300: '#4DFFED',
          400: '#1AFFE8',
          500: '#00BFAD', // Algorand teal
          600: '#00A699',
          700: '#008C85',
          800: '#007370',
          900: '#005A5C',
        },
        secondary: {
          50: '#EFEDFF',
          100: '#D1CBFF',
          200: '#B3A9FF',
          300: '#9587FF',
          400: '#7765FF',
          500: '#6851FF', // Complementary purple
          600: '#5341CC',
          700: '#3F3199',
          800: '#2B2266',
          900: '#171233',
        },
        accent: {
          50: '#FFECE6',
          100: '#FFCEBF',
          200: '#FFAF99',
          300: '#FF9173',
          400: '#FF724D',
          500: '#FF4000', // Accent orange
          600: '#CC3300',
          700: '#992600',
          800: '#661A00',
          900: '#330D00',
        },
        success: {
          500: '#10B981',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};