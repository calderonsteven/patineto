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
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          200: '#e5e7eb',
        },
      },
    },
  },
  plugins: [],
};

export default config;
