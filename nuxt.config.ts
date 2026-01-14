// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json';
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
  ],

  colorMode: {
    preference: 'dark',
  },
  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Counter Time Walk', // default fallback title
      htmlAttrs: {
        lang: 'pt-br',
      },
      link: [
        { rel: 'icon', type: 'image/png', href: (import.meta.env.NUXT_APP_BASE_URL ? import.meta.env.NUXT_APP_BASE_URL : '/') + 'favicon.ico' },
      ],
    },
  },
})