/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./App.tsx', './app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brick: {
          50: '#fbf4f5',
          100: '#f6e5e7',
          200: '#eccdd1',
          300: '#dea6ae',
          400: '#cb7481',
          500: '#b44d5c',
          600: '#9b111e',
          700: '#810e19',
          800: '#6b1019',
          900: '#5b1219',
          950: '#31070b',
        },
      },
    },
  },
  plugins: [],
};
