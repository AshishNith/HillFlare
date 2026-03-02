/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'hf-bg': '#F7F8FA',
        'hf-border': '#EAECEF',
        'hf-text': '#111111',
        'hf-muted': '#6B7280',
        'hf-accent': '#F07A83',
        'hf-charcoal': '#1F2023',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(17,17,17,0.08)',
        glow: '0 0 40px rgba(240, 122, 131, 0.2)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'serif'],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'serif'],
      },
    },
  },
  plugins: [],
};
