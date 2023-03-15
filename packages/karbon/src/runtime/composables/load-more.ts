import { createEventHook } from '@vueuse/core'
import { reactive, ref } from '#imports'

export function useLoadMore<T>(GeneratorSource: () => AsyncGenerator<T>) {
  const loading = ref(false)
  const isDone = ref(false)
  const source = GeneratorSource()
  const list = reactive([]) as T[]
  const loadMoreEvent = createEventHook<T>()
  const loadDoneEvent = createEventHook<void>()

  async function loadMore() {
    if (loading.value || isDone.value) {
      return
    }
    loading.value = true

    const { done, value } = await source.next()
    loading.value = false
    if (done) {
      isDone.value = true
      loadDoneEvent.trigger()
      return
    }

    list.push(value)
    loadMoreEvent.trigger(value)

    return value
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
