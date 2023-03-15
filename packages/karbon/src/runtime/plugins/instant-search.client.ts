import InstantSearch from 'vue-instantsearch/vue3/es'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(InstantSearch)
})
