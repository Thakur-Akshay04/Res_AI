/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── AI Resume Builder — Intelligence Palette ─────────────────────────
        // Deep slate foundation | Electric teal accents | Clean professional
        neu: {
          // Backgrounds — Dark mode
          bg: 'var(--neu-bg)',
          'bg-dark': 'var(--neu-bg-dark)',
          'bg-panel': 'var(--neu-bg-panel)',
          'bg-raise': 'var(--neu-bg-raise)',
          surface: 'var(--neu-surface)',

          // Typography — Dark mode
          text: 'var(--neu-text)',
          'text-light': 'var(--neu-text-light)',
          'text-muted': 'var(--neu-text-muted)',

          // Primary accent (Electric Teal — AI energy)
          primary: 'var(--neu-primary)',
          'primary-light': 'var(--neu-primary-light)',
          'primary-dark': 'var(--neu-primary-dark)',
          'primary-glow': 'var(--neu-primary-glow)',

          // Secondary (Deep slate for contrast)
          secondary: 'var(--neu-secondary)',

          // Semantic
          accent: 'var(--neu-accent)',
          success: 'var(--neu-success)',
          warning: 'var(--neu-warning)',
          danger: 'var(--neu-danger)',

          // Graph paper grid accent
          grid: 'rgba(255, 255, 255, 0.04)',
        },
        cyan: require('tailwindcss/colors').zinc,
        teal: require('tailwindcss/colors').neutral,
        emerald: require('tailwindcss/colors').stone,
        blue: require('tailwindcss/colors').gray,
      },
      fontSize: {
        'xs': ['0.85rem', { lineHeight: '1.25rem' }],
        'sm': ['0.95rem', { lineHeight: '1.35rem' }],
        'base': ['1.05rem', { lineHeight: '1.5rem' }],
        'lg': ['1.2rem', { lineHeight: '1.75rem' }],
        'xl': ['1.35rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.6rem', { lineHeight: '2.1rem' }],
        '3xl': ['2rem', { lineHeight: '2.4rem' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        'widest-2': '0.2em',
        'widest-3': '0.3em',
      },
      borderRadius: {
        'neu': '6px',
        'neu-lg': '8px',
        'neu-xl': '12px',
      },
      boxShadow: {
        'exec-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'exec': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'exec-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'exec-glow': '0 0 20px rgba(255, 255, 255, 0.1)',
        'glow-sm': '0 0 12px rgba(255, 255, 255, 0.1)',
        'glow-md': '0 0 24px rgba(255, 255, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':        'fadeIn 0.3s ease-out',
        'scale-in':       'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':        'shimmer 2s linear infinite',
        'score-fill':     'scoreFill 1.5s ease-out forwards',
        'pulse-soft':     'pulseSoft 3s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',
        'glow-pulse':     'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: 0 },
          '100%': { transform: 'translateY(0)',    opacity: 1 },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(16px)', opacity: 0 },
          '100%': { transform: 'translateX(0)',    opacity: 1 },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.96)', opacity: 0 },
          '100%': { transform: 'scale(1)',    opacity: 1 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        scoreFill: {
          '0%':   { 'stroke-dashoffset': '283' },
          '100%': { 'stroke-dashoffset': 'var(--score-offset)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.6 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(255, 255, 255, 0.1)' },
          '50%':      { boxShadow: '0 0 24px rgba(255, 255, 255, 0.2)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
        'grid-pattern-lg': 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid': '24px 24px',
        'grid-lg': '48px 48px',
      },
    },
  },
  plugins: [],
}