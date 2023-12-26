import { createEventHook } from '@vueuse/core'
import { reactive, ref } from '#imports'

interface LoadMoreOptions {
  preload?: boolean
}
export function useLoadMore<T>(GeneratorSource: () => AsyncGenerator<T>, option?: LoadMoreOptions) {
  const { preload } = option ?? {}

  const loading = ref(false)
  const isDone = ref(false)
  const source = GeneratorSource()
  const list = reactive([]) as T[]
  const loadMoreEvent = createEventHook<T | T[]>()
  const loadDoneEvent = createEventHook<void>()

  async function loadMore() {
    if (loading.value || isDone.value) {
      return
    }
    loading.value = true

    const { done, value } = await source.next()

    if (done) {
      preload ? loadMoreEvent.trigger([value]) : loadMoreEvent.trigger(value)
      value && list.push(value)
      loading.value = false

      isDone.value = true
      loadDoneEvent.trigger()
      return
    }

    if (preload) {
      const { done: nextDone, value: nextValue } = await source.next()
      if (nextDone) {
        isDone.value = true
        loadDoneEvent.trigger()
        return
      }
      list.push(value, nextValue)
      loadMoreEvent.trigger([nextValue, nextValue])
      loading.value = false

      return
    }

    list.push(value)
    loadMoreEvent.trigger(value)
    loading.value = false
  }

  return {
    loading,
    isDone,
    list,
    loadMore,
    onLoadMore: loadMoreEvent.on,
    onLoadDone: loadDoneEvent.on,
  }
}
