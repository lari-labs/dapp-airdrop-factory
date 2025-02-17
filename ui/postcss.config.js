export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ['postcss-font-magician']: {
      variants: {
        ' Titillium Web ': {
          300: [],
          400: [],
          500: [],
          600: [],
          700: [],
        },
      },
      foundries: ['google'],
    },
  },
};
