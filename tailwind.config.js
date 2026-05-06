/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Jamaica-primary palette with pan-Caribbean accents.
        // Jamaica flag (green / gold / black) leads brand identity;
        // Caribbean sea blue + coral remain as secondary accents.
        // Calibrated for WCAG AA on body text and interactive surfaces.
        jm: {
          black: '#0B0B0B',
          'black-soft': '#1A1A1A',
          green: '#009B3A',
          'green-deep': '#007A2D',
          'green-soft': '#E6F5EC',
          gold: '#FED100',
          'gold-deep': '#C9A100',
          'gold-soft': '#FFF6CC'
        },
        cb: {
          ink: '#1A1A1A',
          slate: '#3D3D3D',
          mute: '#5C6873',
          line: '#D8D2BD',
          sand: '#F2EEDF',
          surface: '#FBF9F2',
          paper: '#FFFFFF',
          // 'sea'/'teal' aliases now resolve to Jamaica green/black so
          // existing text-cb-sea, text-cb-teal classes pick up the primary
          // brand without sweeping refactors. Pure Caribbean blue lives
          // on under cb-ocean / cb-aqua-blue when needed.
          sea: '#0B0B0B',
          'sea-deep': '#000000',
          teal: '#009B3A',
          'teal-deep': '#007A2D',
          ocean: '#0B2E4F',
          'ocean-deep': '#072037',
          aqua: '#4FB3BF',
          'aqua-soft': '#E6F5EC',
          sun: '#FED100',
          'sun-deep': '#C9A100',
          'sun-soft': '#FFF6CC',
          coral: '#E76F51',
          palm: '#009B3A',
          red: '#C8102E'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      maxWidth: {
        prose: '72ch'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both'
      }
    }
  },
  plugins: []
};
