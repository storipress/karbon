export async function waitIdle() {
  await windowLoaded()
  await idle()
}

function idle() {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve(), { timeout: 1000 })
    } else {
      setTimeout(resolve, 300)
    }
  })
}

function windowLoaded() {
  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener(
        'load',
        () => {
          resolve()
        },
        { once: true },
      )
    } else {
      setTimeout(resolve, 300)
    }
  })
}
