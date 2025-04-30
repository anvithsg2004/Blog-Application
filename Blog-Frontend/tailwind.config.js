import animatePlugin from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{ts,tsx,jsx,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        platinum: '#E5E4E2',
        mercury: '#D8D8D8',
        transparent: 'transparent',
        current: 'currentColor',
      },
      borderRadius: {
        none: '0',
      },
      boxShadow: {
        brutal: '0 24px 64px -24px rgba(255,255,255,0.2)',
        neumorph: '2px 2px 5px rgba(0,0,0,0.5), -2px -2px 5px rgba(255,255,255,0.1)',
        inset: 'inset 2px 2px 5px rgba(255,255,255,0.05), inset -3px -3px 7px rgba(0,0,0,0.6)',
      },
      transitionTimingFunction: {
        brutal: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-wipe': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
        'gradient-wipe': 'gradient-wipe 1.5s ease-in-out',
      },
    },
  },
  plugins: [animatePlugin],
};
