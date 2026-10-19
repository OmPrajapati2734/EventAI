import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBF8F3',
          100: '#F5EFE3',
          200: '#EADEC6',
          300: '#DCC7A1',
          400: '#CAAB75',
          500: '#B88F4D',
          600: '#9E743A',
          700: '#7E5A2D',
          800: '#644726',
          900: '#4F3820',
          gold: '#F59E0B',
          amber: '#D97706',
        },
        celebration: {
          wedding: '#E879F9',
          weddingDark: '#86198F',
          birthday: '#38BDF8',
          birthdayDark: '#0369A1',
          community: '#34D399',
          communityDark: '#065F46',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        pulseSlow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
