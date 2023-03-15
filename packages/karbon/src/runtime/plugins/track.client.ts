import type { TrackSubscriberActivityInput } from '../api/track'
import { track } from '../api/track'
import { defineNuxtPlugin, useRouter } from '#imports'

export default defineNuxtPlugin(() => {
  let previous = ''
  const router = useRouter()
  router.beforeEach((from, _to, next) => {
    previous = from.fullPath
    next()
  })

  function trackReferer(input: TrackSubscriberActivityInput) {
    const objectData = typeof input.data === 'string' ? JSON.parse(input?.data || '{}') : input?.data || {}
    return track({
      ...input,
      data: {
        ...objectData,
        referer: previous || document.referrer,
      },
    })
  }

  return {
    provide: {
      tracker: { track, withReferer: trackReferer },
    },
  }
})
