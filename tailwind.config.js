// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // This line ensures Tailwind scans your React files
  ],
  theme: {
    extend: {
      colors: {
        'brand-light-gray': '#F0F2F5',
        'brand-primary': '#0052CC',
        'brand-text': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Lora', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [],
}