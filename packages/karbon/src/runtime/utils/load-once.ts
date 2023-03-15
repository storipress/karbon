export function createLoadOnce<T>(cache: Map<string, T> = new Map()) {
  const promiseCache = new Map()

  return async (cacheKey: string, loader: () => Promise<T>): Promise<T> => {
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as T
    }

    try {
      const promise: Promise<T> = promiseCache.get(cacheKey) ?? loader()
      promiseCache.set(cacheKey, promise)
      const res = await promise
      cache.set(cacheKey, res)
      return res
    } catch (error) {
      cache.delete(cacheKey)
      throw error
    } finally {
      promiseCache.delete(cacheKey)
    }
  }
}
