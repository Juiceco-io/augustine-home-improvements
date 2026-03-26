import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#671609',
          'red-dark': '#4d1006',
          'red-mid': '#8d1e0c',
          brick: '#b79a93',
          cream: '#faf7f5',
          charcoal: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #671609 0%, #8d1e0c 50%, #b33d1e 100%)',
      },
    },
  },
  plugins: [],
}

export default config
