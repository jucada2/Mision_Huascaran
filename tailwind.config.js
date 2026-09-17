/** @type {import('tailwindcss').Config} */
// Tokens de diseño SICEDU. Cualquier color fuera de este archivo es un error de
// implementación (ver PROMPT_FRONTEND_SICEDU.md §4.1).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0A2249', 800: '#0E2E5E', 700: '#123A75' },
        brand: { 700: '#10428F', 600: '#1D4ED8', 500: '#2563EB', 100: '#E6EEFB', 50: '#F2F6FD' },
        ink: { 900: '#0F1E3D', 700: '#33415A', 500: '#5B6577', 400: '#8A94A6' },
        surface: { 0: '#FFFFFF', 50: '#F5F8FD', 100: '#EEF2F9' },
        line: { DEFAULT: '#E2E8F2', strong: '#CFD8E6' },
        success: { 600: '#17795A', 500: '#1E9E6A', 100: '#E3F6EC' },
        warning: { 600: '#946200', 500: '#E9A23B', 100: '#FDF3DC' },
        danger: { 600: '#B3261E', 500: '#DC3545', 100: '#FDE7E9' },
        info: { 600: '#1D4ED8', 100: '#E6EFFD' },
        lvl: {
          preinicio: '#6D28D9', preinicioBg: '#EDE9FE',
          inicio: '#B3261E', inicioBg: '#FDE7E9',
          proceso: '#946200', procesoBg: '#FDF3DC',
          logrado: '#17795A', logradoBg: '#E3F6EC',
          destacado: '#10428F', destacadoBg: '#E6EEFB',
        },
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,30,61,0.04), 0 8px 24px rgba(15,30,61,0.06)',
        drawer: '-8px 0 32px rgba(15,30,61,0.12)',
      },
      borderRadius: { xl: '12px' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in-right': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        'slide-up': { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'slide-up': 'slide-up 180ms ease-out',
      },
    },
  },
  plugins: [],
}
