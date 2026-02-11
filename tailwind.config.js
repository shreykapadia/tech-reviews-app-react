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
        'brand-light-gray': '#eef4f8',
        'brand-primary': '#0f4c81',
        'brand-primary-dark': '#0b365d',
        'brand-accent': '#ff7a45',
        'brand-secondary': '#2f6f9c',
        'brand-text': '#12243a',
        'brand-surface': '#ffffff',
        'brand-surface-soft': '#f5f9fc',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [],
}
