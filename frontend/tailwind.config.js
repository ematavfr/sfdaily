/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beige': {
          50: '#fdf9f5',
          100: '#f9ede1',
          200: '#f2d4bd',
          300: '#eab991',
          400: '#df9669',
          500: '#d47644',
          600: '#c55c2d',
          700: '#a44925',
          800: '#813c26',
          900: '#6a3322',
        },
        'brown': {
          50: '#faf8f6',
          100: '#f5ede8',
          200: '#e8d3c8',
          300: '#d8b399',
          400: '#c58c6b',
          500: '#b8704d',
          600: '#a85c42',
          700: '#8e4a3a',
          800: '#744033',
          900: '#5f342d',
          950: '#321914',
        }
      }
    },
  },
  plugins: [],
}

