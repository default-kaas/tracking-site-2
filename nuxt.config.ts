// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui", // "@nuxtjs/eslint-module",
    "@vueuse/nuxt", 
    // "@nuxtjs/supabase"
    // "@prisma/nuxt",
  ],
  build: {
    transpile: ['trpc-nuxt']
  },
  typescript: {
    typeCheck: true
  },
  runtimeConfig: {
    // The private keys which are only available server-side
    supabaseUrl: '',
    supabaseKey: '',
  }
})