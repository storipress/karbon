import { until, useEventBus, useStorage } from '@vueuse/core'
import { once } from 'remeda'
import '@storipress/builder-component/dist/style.css'
import { waitFirstInteractive } from '../utils/defer-load'
import {
  computed,
  defineNuxtPlugin,
  reactive,
  ref,
  useRoute,
  useRouter,
  useRuntimeConfig,
  useSite,
  useSubscriberClient,
} from '#imports'

enum ArticlePlan {
  Free = 'free',
  Member = 'member',
  Subscriber = 'subscriber',
}

interface Article {
  id: string
  plan: ArticlePlan
}

export default defineNuxtPlugin((_nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const router = useRouter()
  const route = useRoute()

  const token = useStorage('storipress-token', '')
  const authInfo = ref<Record<string, any> | null | undefined>(null)
  const paywall = ref()
  const site = useSite()
  const client = useSubscriberClient()

  const { emit } = useEventBus('disqus-bus')
  const { on } = useEventBus('disqus-count-bus')

  const comment = reactive({
    enable: false,
    count: 0,
    onClick: () => {
      emit()
    },
  })

  on((count) => {
    if (typeof count === 'number') {
      comment.enable = true
      comment.count = count
    } else {
      comment.enable = false
      comment.count = 0
    }
  })

  const { storipress } = runtimeConfig.public
  const mount = once(async () => {
    if (!storipress.paywall.enable) {
      return
    }
    const { action, token: tokenQuery } = route.query
    if (!(action === 'sign-in' && tokenQuery)) {
      await waitFirstInteractive()
    }
    const { mountPaywall, setStripeKey } = await import('@storipress/builder-component')
    const paywallLogoPath = _nuxtApp.$config.public?.storipress?.paywall?.logo
    let paywallLogo
    if (paywallLogoPath.startsWith('http')) {
      paywallLogo = paywallLogoPath
    } else {
      // @ts-expect-error no type
      paywallLogo = (await import('#build/paywall-logo')).default
    }
    setStripeKey(runtimeConfig.public.storipress.stripeKey)

    const { push, currentRoute } = router
    const { fullPath, path, query } = currentRoute.value
    const routerLink = {
      push,
      currentRoute: {
        fullPath,
        path,
        query,
      },
    }
    await until(client).toBeTruthy({ timeout: 2000 })
    if (!client.value) return

    paywall.value = mountPaywall({
      el: '#paywall',
      router: routerLink,
      client: client.value,
      favicon: runtimeConfig.public.storipress.paywall.logo,
      logo: paywallLogo,
      token,
      comment,
    })
  })

  function setArticle(article: Article) {
    paywall.value?.setArticle(
      site.value?.plan === 'free' && article?.plan === 'subscriber' ? { ...article, plan: 'member' } : article,
    )
  }

  return {
    provide: {
      paywall: {
        paywall,
        mount,
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
        async enable() {
          if (typeof storipress.paywall === 'boolean' && !storipress.paywall) {
            return
          }
          await mount()
          paywall.value?.setInArticle(true)
        },
        signUp(email: string) {
          paywall.value?.signUp(email)
        },
        showUserDialog() {
          paywall.value?.showUserDialog()
        },
        checkQuery() {
          paywall.value?.check()
        },
        setArticle,
        mountArticlePaywall(id: string, article: Article) {
          paywall.value?.mountArticlePaywall(id, article)
        },
        reload() {
          paywall.value?.reload()
        },
        disable() {
          setArticle({ id: '', plan: ArticlePlan.Free })
          paywall.value?.setInArticle(false)
          paywall.value?.unmountAllArticlePaywall()
        },
      },
    },
  }
})
