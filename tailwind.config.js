/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tn-bg': 'var(--bg-main)',
        'tn-bg-hl': 'var(--bg-highlight)',
        'tn-fg': 'var(--fg-main)',
        'tn-muted': 'var(--fg-muted)',
        'tn-red': 'var(--color-red)',
        'tn-green': 'var(--color-green)',
        'tn-yellow': 'var(--color-yellow)',
        'tn-blue': 'var(--color-blue)',
      },
    },
  },
  plugins: [],
}
