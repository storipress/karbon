import { useStorage } from '@vueuse/core'
import { computed, defineNuxtPlugin, ref } from '#imports'

enum ArticlePlan {
  Free = 'free',
  Member = 'member',
  Subscriber = 'subscriber',
}

interface Article {
  id: string
  plan: ArticlePlan
}

export default defineNuxtPlugin(() => {
  const paywall = ref(null)
  const token = useStorage('storipress-token', '')
  const authInfo = ref<Record<string, any> | null | undefined>(null)

  return {
    provide: {
      paywall: {
        paywall,
        authInfo: computed<Record<string, any> | undefined | null>({
          get() {
            if (authInfo.value) {
              return authInfo.value
            }
            if (token.value) {
              return { token: token.value }
            }
            return null
          },
          set(val) {
            authInfo.value = val
          },
        }),
        mount() {},
        enable() {},
        signUp(_email: string) {},
        checkQuery() {},
        setArticle(_article: Article) {},
        reload() {},
        disable() {},
      },
    },
  }
})
