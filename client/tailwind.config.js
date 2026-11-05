/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2d8a4e',
          600: '#25743f',
          700: '#1d5e32',
          800: '#164826',
          900: '#0f321a',
        },
        terracotta: {
          50: '#fdf4f0',
          100: '#fbe8df',
          200: '#f5c8b3',
          300: '#eda882',
          400: '#e07c4a',
          500: '#c4622e',
          600: '#a34f24',
          700: '#823d1c',
          800: '#632e15',
          900: '#4a220f',
        },
        warm: {
          50: '#fefcf9',
          100: '#fdf8f0',
          200: '#faf0e1',
        },
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
        sans: ['"Noto Sans Devanagari"', '"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
