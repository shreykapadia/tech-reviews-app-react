// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // This line ensures Tailwind scans your React files
  ],
  theme: {
    extend: {
      colors: {
        'brand-light-gray': 'var(--brand-light-gray)',
        'brand-primary': '#0f4c81',
        'brand-primary-dark': '#0b365d',
        'brand-accent': '#ff7a45',
        'brand-secondary': '#2f6f9c',
        'brand-text': 'var(--brand-text)',
        'brand-surface': 'var(--brand-surface)',
        'brand-surface-soft': 'var(--brand-surface-soft)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [],
}
