/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // macOS Window Button Colors - Violet, Pink, Cyan Gradient
        macos: {
          red: '#8B5CF6',
          yellow: '#EC4899',
          green: '#06B6D4',
        },
        // Gray Scale - macOS inspired
        gray: {
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D2D2D7',
          300: '#AEAEB2',
          400: '#8E8E93',
          500: '#636366',
          600: '#48484A',
          700: '#3A3A3C',
          800: '#2C2C2E',
          900: '#1C1C1E',
          950: '#000000',
        },
        // Accent Colors
        accent: {
          blue: '#007AFF',
          purple: '#AF52DE',
          pink: '#FF2D55',
          orange: '#FF9500',
        },
      },
      boxShadow: {
        'macos': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'macos-strong': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'macos': '12px',
        'macos-lg': '18px',
      },
    },
  },
  plugins: [],
}
