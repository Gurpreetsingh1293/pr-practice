/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand palette — GraminLink earthy-vibrant theme
        brand: {
          green: {
            50:  '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          amber: {
            50:  '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          earth: {
            50:  '#faf5f0',
            100: '#f0e6d3',
            200: '#e2cdb0',
            300: '#ccab82',
            400: '#b58555',
            500: '#a06c3a',
            600: '#8a5a2e',
            700: '#714828',
            800: '#5e3c24',
            900: '#4e3220',
          },
          teal: {
            500: '#0d9488',
            600: '#0f766e',
          },
        },
        // Dark surface colors
        surface: {
          900: '#0a0f0a',
          800: '#111611',
          700: '#1a211a',
          600: '#243024',
          500: '#2e3d2e',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0f0a 0%, #1a211a 50%, #14532d 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(22,163,74,0.1) 0%, rgba(245,158,11,0.05) 100%)',
        'amber-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'green-gradient': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
