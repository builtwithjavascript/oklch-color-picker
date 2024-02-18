import { useEventListener } from './useEventListener'
import { Fn, noop, isIOS } from './shared'

export interface OnClickOutsideOptions {
  ignore?: string[]
  capture?: boolean
  detectIframe?: boolean
}

export type OnClickOutsideHandler<
  T extends { detectIframe: OnClickOutsideOptions['detectIframe'] } = { detectIframe: false }
> = (evt: T['detectIframe'] extends true ? PointerEvent | FocusEvent : PointerEvent) => void

let _iOSWorkaround = false

export function useClickOutside<T extends OnClickOutsideOptions>(
  target: Element,
  handler: OnClickOutsideHandler<{ detectIframe: T['detectIframe'] }>,
  options: T = {} as T
) {
  const { ignore = [], capture = true, detectIframe = false } = options

  if (!document) {
    return noop
  }

  // Fixes: https://github.com/vueuse/vueuse/issues/1520
  // How it works: https://stackoverflow.com/a/39712411
  if (isIOS && !_iOSWorkaround) {
    _iOSWorkaround = true
    Array.from(window.document.body.children).forEach((el) => el.addEventListener('click', noop))
    window.document.documentElement.addEventListener('click', noop)
  }

  let shouldListen = true

  const shouldIgnore = (event: PointerEvent) => {
    return ignore.some((target) => {
      if (typeof target === 'string') {
        return Array.from(document.querySelectorAll(target)).some(
          (el) => el === event.target || event.composedPath().includes(el)
        )
      } else {
        const el = target
        return el && (event.target === el || event.composedPath().includes(el))
      }
    })
  }

  const listener = (event: PointerEvent) => {
    const el = target

    if (!el || el === event.target || event.composedPath().includes(el)) {
      return
    }

    if (event.detail === 0) {
      shouldListen = !shouldIgnore(event)
    }

    if (!shouldListen) {
      shouldListen = true
      return
    }

    handler(event)
  }

  const cleanup = [
    useEventListener(document, 'click', listener, { passive: true, capture }),
    useEventListener(
      document,
      'pointerdown',
      (e) => {
        const el = target
        shouldListen = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el))
      },
      { passive: true }
    ),
    detectIframe &&
      useEventListener(document, 'blur', (event) => {
        setTimeout(() => {
          const el = target
          if (document.activeElement?.tagName === 'IFRAME' && !el?.contains(document.activeElement))
            handler(event as any)
        }, 0)
      })
  ].filter(Boolean) as Fn[]

  const stop = () => cleanup.forEach((fn) => fn())

  return stop
}
