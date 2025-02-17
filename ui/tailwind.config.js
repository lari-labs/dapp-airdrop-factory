import { fontFamily } from 'tailwindcss/defaultTheme';
import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        baumans: ['Baumans', ...fontFamily.sans],
        kanit: ['Gemunu Libre', ...fontFamily.sans],
        ksg: ['ksg', ...fontFamily.serif],
        poppins: ['Poppins', ...fontFamily.sans],
        oswald: ['Oswald', ...fontFamily.sans],
      },

      colors: {
        local_blue: '#3EC5FF',
        local_pink: '#FF009A',
        local_green: '#19F000',
        local_violet: '#9177F6',
        local_dark_pink: '94388B',
      },
    },
    fontFamily: {},
  },
  plugins: [daisyui, typography],
  daisyui: {
    prefix: 'daisyui-',
  },
};
