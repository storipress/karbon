import { useRequestEvent } from '#imports'

const GLOBAL_ONCE = new WeakMap<() => unknown, unknown>()
const EVENT_ONCE_KEY = '__event_based_once__'

export function useEventOnce<T>(fn: () => T): () => T {
  return () => {
    const event = useRequestEvent()
    if (!event) {
      if (!GLOBAL_ONCE.has(fn)) {
        GLOBAL_ONCE.set(fn, fn())
      }
      return GLOBAL_ONCE.get(fn) as T
    }

    const map: WeakMap<() => T, T> = (event.context[EVENT_ONCE_KEY] ??= new WeakMap<() => unknown, unknown>())
    if (!map.has(fn)) {
      map.set(fn, fn())
    }
    return map.get(fn) as T
  }
}

const EVENT_GLOBAL_KEY = '__event_based_global__'

export function useEventGlobal<T>(key: string, defaultFactory: () => T): () => T {
  if (process.client) {
    const globalValue = defaultFactory()
    return () => globalValue
  }

  return () => {
    const event = useRequestEvent()
    if (!event) {
      return defaultFactory()
    }

    const map: Map<string, T> = (event.context[EVENT_GLOBAL_KEY] ??= new Map<string, unknown>())
    if (!map.has(key)) {
      map.set(key, defaultFactory())
    }
    return map.get(key) as T
  }
}
