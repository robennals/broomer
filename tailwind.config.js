/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#252525',
        'bg-tertiary': '#2d2d2d',
        'border': '#3a3a3a',
        'text-primary': '#e0e0e0',
        'text-secondary': '#a0a0a0',
        'accent': '#4a9eff',
        'status-working': '#4ade80',
        'status-waiting': '#facc15',
        'status-idle': '#6b7280',
        'status-error': '#f87171',
      }
    },
  },
  plugins: [],
}
