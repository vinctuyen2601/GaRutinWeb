import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Đặt ở font-sans để mọi thứ chưa khai font đều thừa hưởng, không phải
        // đi gắn class cho từng chỗ.
        sans: ['var(--font-be-vietnam)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
