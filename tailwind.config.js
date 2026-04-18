/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        pink: {
          300: '#FBCFE8',
          400: '#F9A8D4',
          500: '#F472B6',
        },
      },
    },
  },
  plugins: [],
}
