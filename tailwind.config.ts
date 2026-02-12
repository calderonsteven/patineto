import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        deck: {
          950: '#05070f',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          300: '#cbd5e1',
          200: '#e5e7eb',
        },
        hype: {
          cyan: '#22d3ee',
          purple: '#a78bfa',
          pink: '#f472b6',
        },
      },
    },
  },
  plugins: [],
};

export default config;
