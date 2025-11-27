/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        artifact: '#8B4513',
        author: '#4169E1',
        guide: '#228B22',
      },
    },
  },
  plugins: [],
}

