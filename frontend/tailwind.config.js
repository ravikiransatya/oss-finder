/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8196f8',
          500: '#6271f1',
          600: '#4f52e5',
          700: '#4140ca',
          800: '#3636a3',
          900: '#303281',
          950: '#1e1d4d',
        },
        accent: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        surface: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          800: '#18181b',
          900: '#09090b',
          950: '#030303',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'shimmer':    'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
