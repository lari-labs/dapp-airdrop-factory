const { fontFamily } = require('tailwindcss/defaultTheme');

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
        baumans: ['"Baumans", system-ui'],
        kanit: ['"Gemunu Libre", sans-serif'],
        ksg: ['"ksg", sans-serif'],
      },

      colors: {
        local_blue: '#3EC5FF',
        local_pink: '#FF009A',
        local_green: '#19F000',
        local_violet: '#9177F6',
        local_dark_pink: '94388B',
      },
    },
    fontFamily: {
      poppins: ['Poppins', ...fontFamily.sans],
      oswald: ['Oswald', ...fontFamily.sans],
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    prefix: 'daisyui-',
  },
};
