export type Fn = () => void
export type Arrayable<T> = T[] | T
export type AnyFn = (...args: any[]) => any
export const noop = () => {}

export const isObject = (val: any): val is object => toString.call(val) === '[object Object]'
export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

export function toValue<T>(r: T): T {
  return typeof r === 'function' ? (r as AnyFn)() : r
}

const getIsIOS = () => {
  return (
    isClient &&
    window?.navigator?.userAgent &&
    (/iP(ad|hone|od)/.test(window.navigator.userAgent) ||
      // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
      // https://github.com/vueuse/vueuse/issues/3577
      (window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent)))
  )
}

export const isIOS = getIsIOS()
