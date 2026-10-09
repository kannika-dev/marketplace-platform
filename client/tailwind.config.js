/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#F0F9F7',
          100: '#D8F3DC',
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788',
          600: '#40916C',
          primary: '#2A9D8F',
          dark: '#1B4332',
        },
        peach: {
          light: '#F8EDEB',
          50: '#FFF5F0',
          100: '#FFE8D6',
          200: '#FFD7BA',
          300: '#FEC89A',
          400: '#F4A261',
          primary: '#E76F51',
          hover: '#D95D3F',
          dark: '#C1492E',
        },
        sunlight: {
          cream: '#FFF9EC',
          yellow: '#FFE6A7',
          amber: '#FFD166',
        },
        bggradient: {
          start: '#FAF9F6',
          mid: '#F4F9F4',
          end: '#FFF9F3',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Kanit', 'system-ui', 'sans-serif'],
        display: ['Kanit', 'Prompt', 'sans-serif'],
      },
      boxShadow: {
        'clay-sm': '0 4px 14px 0 rgba(42, 157, 143, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
        'clay-card': '0 10px 30px -5px rgba(42, 157, 143, 0.1), 0 4px 10px -2px rgba(231, 111, 81, 0.05), inset 0 2px 2px rgba(255, 255, 255, 0.8)',
        'clay-card-hover': '0 20px 40px -10px rgba(42, 157, 143, 0.18), 0 8px 16px -4px rgba(231, 111, 81, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
        'clay-peach': '0 10px 20px -5px rgba(231, 111, 81, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.4)',
        'clay-peach-hover': '0 15px 25px -5px rgba(231, 111, 81, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
        'clay-botanical': '0 10px 20px -5px rgba(42, 157, 143, 0.35), inset 0 2px 2px rgba(255, 255, 255, 0.4)',
        'glow-sun': '0 0 30px rgba(255, 230, 167, 0.6)',
        'glow-peach': '0 0 40px rgba(244, 162, 97, 0.35)',
        'glow-botanical': '0 0 40px rgba(42, 157, 143, 0.35)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
