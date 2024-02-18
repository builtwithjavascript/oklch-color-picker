import { Fn, Arrayable, noop, isObject } from './shared'

interface InferEventTarget<Events> {
  addEventListener(event: Events, fn?: any, options?: any): any
  removeEventListener(event: Events, fn?: any, options?: any): any
}

export type WindowEventName = keyof WindowEventMap
export type DocumentEventName = keyof DocumentEventMap

export interface GeneralEventListener<E = Event> {
  (evt: E): void
}

export function useEventListener<E extends keyof WindowEventMap>(
  event: Arrayable<E>,
  listener: Arrayable<(this: Window, ev: WindowEventMap[E]) => any>,
  options?: boolean | AddEventListenerOptions
): Fn

export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: Arrayable<E>,
  listener: Arrayable<(this: Window, ev: WindowEventMap[E]) => any>,
  options?: boolean | AddEventListenerOptions
): Fn

export function useEventListener<E extends keyof DocumentEventMap>(
  target: DocumentOrShadowRoot,
  event: Arrayable<E>,
  listener: Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>,
  options?: boolean | AddEventListenerOptions
): Fn

export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: HTMLElement | null | undefined,
  event: Arrayable<E>,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[E]) => any,
  options?: boolean | AddEventListenerOptions
): () => void

export function useEventListener<Names extends string, EventType = Event>(
  target: InferEventTarget<Names>,
  event: Arrayable<Names>,
  listener: Arrayable<GeneralEventListener<EventType>>,
  options?: boolean | AddEventListenerOptions
): Fn

export function useEventListener<EventType = Event>(
  target: EventTarget | null | undefined,
  event: Arrayable<string>,
  listener: Arrayable<GeneralEventListener<EventType>>,
  options?: boolean | AddEventListenerOptions
): Fn

export function useEventListener(...args: any[]) {
  let target: EventTarget | undefined
  let events: Arrayable<string>
  let listeners: Arrayable<Function>
  let options: boolean | AddEventListenerOptions | undefined

  if (typeof args[0] === 'string' || Array.isArray(args[0])) {
    ;[events, listeners, options] = args
    target = window
  } else {
    ;[target, events, listeners, options] = args
  }

  if (!target) return noop

  if (!Array.isArray(events)) {
    events = [events]
  }
  if (!Array.isArray(listeners)) {
    listeners = [listeners]
  }

  const cleanups: Function[] = []
  const cleanup = () => {
    cleanups.forEach((fn) => fn())
    cleanups.length = 0
  }

  const register = (el: any, event: string, listener: any, options: any) => {
    el.addEventListener(event, listener, options)
    return () => el.removeEventListener(event, listener, options)
  }

  const init = (el: EventTarget | undefined) => {
    cleanup()
    if (!el) {
      return
    }
    // create a clone of options, to avoid it being changed reactively on removal
    const optionsClone = isObject(options) ? { ...options } : options
    cleanups.push(
      ...(events as string[]).flatMap((event) => {
        return (listeners as Function[]).map((listener) => register(el, event, listener, optionsClone))
      })
    )
  }

  const stop = () => {
    init(target)
    cleanup()
  }

  init(target)

  return stop
}
