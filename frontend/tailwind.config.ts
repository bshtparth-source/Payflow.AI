import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F108E',
          container: '#3730A3',
          light: '#E0E7FF',
          hover: '#312E81',
        },
        secondary: {
          DEFAULT: '#006A61',
          container: '#0D9488',
          light: '#CCFBF1',
          dark: '#004D40',
        },
        surface: {
          DEFAULT: '#FAF8FF',
          dim: '#D2D9F4',
          bright: '#FAF8FF',
          container: '#EAEDFF',
          'container-low': '#F2F3FF',
          'container-lowest': '#FFFFFF',
          'container-high': '#E2E7FF',
          'container-highest': '#DAE2FD',
        },
        'on-surface': {
          DEFAULT: '#131B2E',
          variant: '#464553',
        },
        outline: {
          DEFAULT: '#777584',
          variant: '#C8C4D5',
        },
        reliability: {
          highly: '#16A34A',
          'highly-bg': '#DCFCE7',
          'highly-text': '#15803D',
          reliable: '#65A30D',
          'reliable-bg': '#ECFCCB',
          'reliable-text': '#4D7C0F',
          moderate: '#D97706',
          'moderate-bg': '#FEF3C7',
          'moderate-text': '#B45309',
          attention: '#EA580C',
          'attention-bg': '#FFEDD5',
          'attention-text': '#C2410C',
          risk: '#DC2626',
          'risk-bg': '#FEE2E2',
          'risk-text': '#B91C1C',
          insufficient: '#64748B',
          'insufficient-bg': '#F1F5F9',
          'insufficient-text': '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
