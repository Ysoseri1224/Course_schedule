/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'schedule-header': '#D6E4F5',
        'schedule-border': '#333333',
      },
    },
  },
  plugins: [],
}
