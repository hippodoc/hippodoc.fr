// Remplace @astrojs/tailwind (déprécié, incompatible Astro 7) : même pipeline PostCSS.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
