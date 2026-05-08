/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        'card-dark': '#181818',
        'section-dark': '#111111',
        red: {
          DEFAULT: '#D81E1E',
          bright: '#FF2020',
        },
        gold: '#C0A050',
        cream: '#F5F0ED',
      },
      fontFamily: {
        display: ['"Black Han Sans"', 'Impact', 'Arial Black', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        body: ['"Barlow Condensed"', 'Arial Narrow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
