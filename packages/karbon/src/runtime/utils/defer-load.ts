export async function waitIdle() {
  await windowLoaded()
  await idle()
}

type WindowEventName = keyof WindowEventMap
const interactiveEvents: WindowEventName[] = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']

export function waitFirstInteractive() {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const handler = () => {
      interactiveEvents.forEach((event) => window.removeEventListener(event, handler, { capture: true }))

      resolve()
    }

    interactiveEvents.forEach((event) =>
      window.addEventListener(event, handler, { capture: true, once: true, passive: true }),
    )

    const visibilityChangeHandler = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler, { capture: true })
        handler()
      }
    }

    document.addEventListener('visibilitychange', visibilityChangeHandler, { capture: true, passive: true })
  })
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
