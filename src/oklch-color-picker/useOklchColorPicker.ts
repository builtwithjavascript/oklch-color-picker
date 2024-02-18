import { useConvertRange } from '@builtwithjavascript/convert-range'
import { useClickOutside } from '../others/useClickOutside'

import { useSvgSliding } from '../sliding/useSvgSliding'
import { useSvgSlidingOnPath } from '../sliding/useSvgSlidingOnPath'

type TOklchColor = {
  l: number
  c: number
  h: number
  o: number
}

type TBuildSvgResults = {
  cont: HTMLElement
  svg: Element
  control: Element
  initialPositionX: number
}

const getCssOklchVarExpressions = (id: string) => {
  const var_l = `var(--bwj-oklch-picker-${id}-l)`
  const var_c = `var(--bwj-oklch-picker-${id}-c)`
  const var_h = `var(--bwj-oklch-picker-${id}-h)`
  const var_o = `var(--bwj-oklch-picker-${id}-o)`
  return {
    var_l,
    var_c,
    var_h,
    var_o
  }
}

const getFullOklchExpression = (id: string, opacity: number = 1) => {
  const { var_l, var_c, var_h } = getCssOklchVarExpressions(id)
  return `oklch(${var_l} ${var_c} ${var_h} / ${opacity})`
}

const getHueLinearGradient = (id: string) => {
  const { var_l, var_c } = getCssOklchVarExpressions(id)
  return `linear-gradient(to right, oklch(${var_l} ${var_c} 0), oklch(${var_l} ${var_c} 60), oklch(${var_l} ${var_c} 120), oklch(${var_l} ${var_c} 180), oklch(${var_l} ${var_c} 240), oklch(${var_l} ${var_c} 300), oklch(${var_l} ${var_c} 360))`
}

const buildLightnessSvg = (
  id: string,
  initialValue: number,
  cb: (result: { value: number; svg: SVGSVGElement }) => any
): TBuildSvgResults => {
  const { beginSlidingOnPath, stopSlidingOnPath } = useSvgSlidingOnPath()
  // this is to convert the returned value:
  const inRange = { min: 9, max: 43 }
  const outRange = { min: 0.0, max: 1.0 } // we need to return a value between 0 and 1
  const { convertRange } = useConvertRange(inRange, outRange)
  // this is used to find the initial position of the control based on the initial color value
  const { convertRange: getInitialPosition } = useConvertRange(outRange, inRange, 0)
  const initialPositionX = getInitialPosition(initialValue)

  const direction = 1
  const handlePointerDown = (ev: any) =>
    beginSlidingOnPath(svg_l, control_l, path_l, ev, direction, (info) => {
      cb({
        value: convertRange(info.value),
        svg: svg_l
      })
    })

  const handlePointerUp = (ev: any) => {
    stopSlidingOnPath(ev)
  }

  // light: div
  const cont_l = document.createElement('div')
  cont_l.setAttribute('id', `${id}-cont-l`)
  cont_l.setAttribute('style', `grid-area: 1/1; margin-left: 0px; margin-top: 0px; width: 6rem;outline: solid 0px red;`)

  // light: svg
  const svg_l = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg_l.setAttribute('id', `${id}-svg-l`)
  svg_l.setAttribute('fill', `none`)
  svg_l.setAttribute('viewBox', `0 0 52 24`)
  svg_l.setAttribute('style', `cursor: pointer;`)
  cont_l.appendChild(svg_l)

  /// light: path
  const path_l = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path_l.setAttribute('id', `${id}-path-l`)
  path_l.setAttribute('stroke', `oklch(0.5 0 0 / 0.5)`)
  path_l.setAttribute('stroke-width', `1`)
  path_l.setAttribute('d', `M 9 14 A 24 8 0 0 1 43 14`)
  svg_l.appendChild(path_l)

  // light: circle
  const { var_l } = getCssOklchVarExpressions(id)
  const control_l = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  control_l.setAttribute('id', `${id}-control-l`)
  control_l.setAttribute('r', `6`)
  control_l.setAttribute('cx', `${initialPositionX}`)
  control_l.setAttribute('cy', `10`)
  control_l.setAttribute('stroke', `#eeeeee`)
  control_l.setAttribute('stroke-width', `0`)
  control_l.setAttribute('pointer-events', `fill`)
  control_l.setAttribute('fill', `oklch(${var_l} 0 0 / 0.9)`)
  control_l.ontouchstart = handlePointerDown
  control_l.onpointerdown = handlePointerDown

  control_l.onpointerup = handlePointerUp
  control_l.ontouchend = handlePointerUp

  control_l.onmouseenter = () => {
    control_l.setAttribute('style', 'filter: drop-shadow(0px 0px 1px oklch(1 0 0)')
  }
  control_l.onmouseleave = () => {
    control_l.removeAttribute('style')
  }
  svg_l.appendChild(control_l)

  // set initial position
  const domPoint = path_l.getPointAtLength(initialPositionX)
  // round
  const point = {
    x: Number(domPoint.x.toFixed(2)),
    y: Number(domPoint.y.toFixed(2))
  }
  //control_l.setAttribute('cx', `${point.x}`)
  control_l.setAttribute('cy', `${point.y}`)

  return {
    cont: cont_l,
    svg: svg_l,
    control: control_l,
    initialPositionX
  }
}

const buildHueSvg = (
  id: string,
  initialValue: number,
  cb: (result: { value: number; svg: SVGSVGElement }) => any
): TBuildSvgResults => {
  // use sliding utils
  const { beginSliding, stopSliding } = useSvgSliding()

  // this is to convert the returned value:
  const inRange = { min: 18, max: 108 }
  const outRange = { min: 0, max: 360 } // we need to return a value between 0 and 1
  const { convertRange } = useConvertRange(inRange, outRange, 0)
  // this is used to find the initial position of the control based on the initial color value
  const { convertRange: getInitialPosition } = useConvertRange(outRange, inRange, 0)
  const initialPositionX = getInitialPosition(initialValue)

  const handlePointerDown = (ev: any) => {
    beginSliding(svg_h, ev, { minX: inRange.min, maxX: inRange.max }, (info) => {
      cb({
        value: convertRange(info.value),
        svg: svg_h
      })
    })
  }

  const handlePointerUp = (ev: any) => {
    stopSliding(ev)
  }

  // hue: div
  const cont_h = document.createElement('div')
  cont_h.setAttribute('id', `${id}-cont-h`)
  cont_h.setAttribute(
    'style',
    `position: relative; grid-area: 1/1; margin-top: 45px; width: 12rem; padding-right: 5rem`
  )

  // hue: div with gradient bg
  const gradient_h = document.createElement('div')
  gradient_h.setAttribute('id', `${id}-gradient-bg-h`)
  gradient_h.setAttribute('class', `bg-gradient`)
  gradient_h.setAttribute(
    'style',
    `position: absolute; top:1.125rem; left:1.625rem; right:1.625rem; height:0.75rem; border-radius:0.5rem;background-image:${getHueLinearGradient(id)};`
  )
  cont_h.appendChild(gradient_h)

  // hue: svg
  const svg_h = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg_h.setAttribute('id', `${id}-svg-h`)
  svg_h.setAttribute('fill', `none`)
  svg_h.setAttribute('viewBox', `0 0 128 32`)
  svg_h.setAttribute('style', `position: absolute; top:0; left:0;cursor:pointer;`)
  cont_h.appendChild(svg_h)

  // const bar_h = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  // bar_h.setAttribute('id', `${id}-bar-h`)
  // bar_h.setAttribute('fill', `none`)
  // bar_h.setAttribute('width', `12rem`)
  // bar_h.setAttribute('height', `0.25rem`)
  // bar_h.setAttribute('style', `${getHueBackgroundImage()}`)
  // svg_h.appendChild(bar_h)

  // hue: circle
  const control_h = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  control_h.setAttribute('id', `${id}-control-h`)
  control_h.setAttribute('r', `12`)
  control_h.setAttribute('cx', `${initialPositionX}`)
  control_h.setAttribute('cy', `16`)
  control_h.setAttribute('stroke', `oklch(1 0 0 / 0.5)`)
  control_h.setAttribute('stroke-width', `1`)
  control_h.setAttribute('fill', getFullOklchExpression(id))
  control_h.setAttribute('pointer-events', `fill`)

  control_h.onpointerdown = handlePointerDown
  control_h.ontouchstart = handlePointerDown

  control_h.onpointerup = handlePointerUp
  control_h.ontouchend = handlePointerUp

  control_h.onmouseenter = () => {
    control_h.setAttribute('style', 'filter: drop-shadow(0px 0px 2px oklch(1 0 0)')
  }
  control_h.onmouseleave = () => {
    control_h.removeAttribute('style')
  }

  svg_h.appendChild(control_h)
  return {
    cont: cont_h,
    svg: svg_h,
    control: control_h,
    initialPositionX
  }
}

const buildChromaSvg = (
  id: string,
  initialValue: number,
  cb: (result: { value: number; svg: SVGSVGElement }) => any
): TBuildSvgResults => {
  const { beginSlidingOnPath, stopSlidingOnPath } = useSvgSlidingOnPath()
  // this is to convert the returned value:
  const inRange = { min: 9, max: 43 }
  const outRange = { min: 0.0, max: 0.37 } // we need to return a value between 0 and 0.37
  const { convertRange } = useConvertRange(inRange, outRange)
  // this is used to find the initial position of the control based on the initial color value
  const { convertRange: getInitialPosition } = useConvertRange(outRange, inRange, 0)
  const initialPositionX = getInitialPosition(initialValue)

  const direction = -1
  const handlePointerDown = (ev: any) =>
    beginSlidingOnPath(svg_c, control_c, path_c, ev, direction, (info) => {
      cb({
        value: convertRange(info.value),
        svg: svg_c
      })
    })

  const handlePointerUp = (ev: any) => {
    stopSlidingOnPath(ev)
  }

  // chroma: div
  const cont_c = document.createElement('div')
  cont_c.setAttribute('id', `${id}-cont-c`)
  cont_c.setAttribute(
    'style',
    `grid-area: 1/1; margin-left: 0px; margin-top: 93px; width: 6rem; outline: solid 0px lightgray;`
  )

  // chroma: svg
  const svg_c = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg_c.setAttribute('id', `${id}-svg-c`)
  svg_c.setAttribute('fill', `none`)
  svg_c.setAttribute('viewBox', `0 0 52 24`)
  svg_c.setAttribute('style', `cursor: pointer;`)
  cont_c.appendChild(svg_c)

  /// chroma: path
  const path_c = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path_c.setAttribute('id', `${id}-path-c`)
  path_c.setAttribute('stroke', `oklch(0.5 0 0 / 0.5)`)
  path_c.setAttribute('stroke-width', `1`)
  path_c.setAttribute('d', `M 43 10 A 24 8 180 0 1 9 10`) // here we inverted the path
  svg_c.appendChild(path_c)

  // chroma: circle
  const control_c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  control_c.setAttribute('id', `${id}-control-c`)
  control_c.setAttribute('r', `6`)
  control_c.setAttribute('cx', `${initialPositionX}`)
  control_c.setAttribute('cy', `10`)
  control_c.setAttribute('stroke', `oklch(1 0 0 / 0.5)`)
  control_c.setAttribute('stroke-width', `0`)
  control_c.setAttribute('pointer-events', `fill`)
  control_c.setAttribute('fill', getFullOklchExpression(id))
  control_c.ontouchstart = handlePointerDown
  control_c.onpointerdown = handlePointerDown

  control_c.onpointerup = handlePointerUp
  control_c.ontouchend = handlePointerUp

  control_c.onmouseenter = () => {
    control_c.setAttribute('style', 'filter: drop-shadow(0px 0px 1px oklch(1 0 0)')
  }
  control_c.onmouseleave = () => {
    control_c.removeAttribute('style')
  }
  svg_c.appendChild(control_c)

  // set initial position
  const domPoint = path_c.getPointAtLength(initialPositionX)
  // round
  const point = {
    x: Number(domPoint.x.toFixed(2)),
    y: Number(domPoint.y.toFixed(2))
  }
  //control_l.setAttribute('cx', `${point.x}`)
  control_c.setAttribute('cy', `${point.y}`)

  return {
    cont: cont_c,
    svg: svg_c,
    control: control_c,
    initialPositionX
  }
}

const tryParseOklchString = (inputValue: string, defaultOklchColor: TOklchColor): TOklchColor => {
  let parsedOklchColor = defaultOklchColor
  try {
    const regex = /oklch\(\s*([\d\.]+)+\s+([\d\.]+)+\s+([\d\.]+)+\s*\/*\s*([\d\.]+)*/
    const matches = inputValue.match(regex)
    if (matches && matches.length >= 4) {
      parsedOklchColor.l = Number(matches[1])
      parsedOklchColor.c = Number(matches[2])
      parsedOklchColor.h = Number(matches[3])
      if (!isNaN(matches[4] as any)) {
        parsedOklchColor.o = Number(matches[4])
      }
    }
  } catch {
    console.warn(`tryParseOklchString: could not parse input value: "${inputValue}"`)
  } finally {
    return parsedOklchColor
  }
}

type TOklchColorPickerOptions = {
  id: string
  element: HTMLElement | null
  initialColor: string | null
  cb: (c: string) => any
}

type TOklchColorPicker = {
  get oklchString(): string
  get oklch(): TOklchColor
  element: HTMLElement
}

export const useOklchColorPicker = (options: TOklchColorPickerOptions): TOklchColorPicker => {
  // private:
  let _oklchColor: TOklchColor = {
    l: 0.5,
    c: 0.17,
    h: 0,
    o: 1
  }
  const getOklchString = () => {
    const { l, c, h, o } = _oklchColor
    return `oklch(${l} ${c} ${h} / ${o})`
  }

  // get parameters:
  const { id, cb } = options
  let element = options.element
  if (!element) {
    console.warn('useOklchColorPicker invalid element argument', element)
    element = document.createElement('div')
  }

  let containerHorizontalPadding = '2.5rem'

  let _initialized = false
  const _invokeCb = () => {
    if (_initialized) {
      const value = getOklchString()
      cb(value)
    }
  }
  const _roundVal = (v: number) => {
    return Number(v.toFixed(2))
  }

  const setCssVarValueOnDocument = (what: 'l' | 'c' | 'h' | 'o', value: number) => {
    const expr = `--bwj-oklch-picker-${id}-${what}`
    document.documentElement.style.setProperty(expr, `${value}`)
    _invokeCb()
  }

  const internalState: {
    l: number
    c: number
    h: number
    o: number
  } = {
    get l() {
      return _oklchColor.l
    },
    set l(v: number) {
      _oklchColor.l = _roundVal(v)
      setCssVarValueOnDocument('l', _oklchColor.l)
    },

    get c() {
      return _oklchColor.c
    },
    set c(v: number) {
      _oklchColor.c = _roundVal(v)
      setCssVarValueOnDocument('c', _oklchColor.c)
    },

    get h() {
      return _oklchColor.h
    },
    set h(v: number) {
      _oklchColor.h = _roundVal(v)
      setCssVarValueOnDocument('h', _oklchColor.h)
    },

    get o() {
      return _oklchColor.o
    },
    set o(v: number) {
      _oklchColor.o = _roundVal(v)
      setCssVarValueOnDocument('o', _oklchColor.o)
    }
  }

  let initialColor = (options.initialColor || '').trim().toLowerCase()
  if (initialColor.indexOf('oklch') > -1) {
    _oklchColor = tryParseOklchString(initialColor, _oklchColor)
    internalState.l = _oklchColor.l
    internalState.c = _oklchColor.c
    internalState.h = _oklchColor.h
    internalState.o = _oklchColor.o
  }

  let control_h: Element

  // light:
  const domLight = buildLightnessSvg(id, internalState.l, (result) => (internalState.l = result.value))

  // chroma:
  const domChroma = buildChromaSvg(id, internalState.c, (result) => (internalState.c = result.value))

  // hue:
  const adjustmentOffset = 28
  const adjustDomLightPosition = () => {
    const x = control_h.getBoundingClientRect().x - (element?.offsetLeft || 0) - adjustmentOffset
    // move the lightness/chroma dom with the hue control
    domLight.cont.style.transform = `translate(calc(${x}px - ${containerHorizontalPadding}), 0)`
    domChroma.cont.style.transform = `translate(calc(${x}px - ${containerHorizontalPadding}), 0)`
  }

  const domHue = buildHueSvg(id, internalState.h, (result) => {
    internalState.h = result.value
    // move the lightness dom along
    adjustDomLightPosition()
  })
  // @ts-ignore
  //control_h = [...cont_h.firstChild?.children].find(c => c.id === `${id}-control-h`) as Element
  control_h = domHue.control

  const innerContainer = document.createElement('div')
  innerContainer.setAttribute('style', `display: grid; align-items: start;`)
  innerContainer.appendChild(domHue.cont)
  innerContainer.appendChild(domLight.cont)
  innerContainer.appendChild(domChroma.cont)

  // container
  const container = document.createElement('div')
  container.setAttribute('id', id)
  container.setAttribute(
    'style',
    `width:min-content; padding: 1rem ${containerHorizontalPadding}; border-radius: 1.5rem; background: oklch(0 0 0 / 0.3); backdrop-filter:blur(20px);`
  )
  container.appendChild(innerContainer)

  const name = document.createElement('div')
  name.setAttribute('style', 'position:absolute; right: 10px; bottom: 10px; pointer-events: none;')
  name.innerText = 'Oklch Picker'
  container.appendChild(name)
  // add to target element
  element.appendChild(container)

  // element.setAttribute('style', `display: grid; align-items: start;`)
  // element.appendChild(domHue.cont)
  // element.appendChild(domLight.cont)
  // element.appendChild(domChroma.cont)

  adjustDomLightPosition()

  _initialized = true
  _invokeCb()

  setTimeout(() => {
    const _clickOutsideHandle = useClickOutside(innerContainer, () => {
      _clickOutsideHandle()
      element?.remove()
    })
  }, 250)

  return {
    get oklchString(): string {
      return getOklchString()
    },
    get oklch(): TOklchColor {
      return _oklchColor
    },
    element
  }
}
