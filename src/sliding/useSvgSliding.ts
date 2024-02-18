import { TSlideValueInfo } from './shared'
import { getPageToSvgPoint } from './getPageToSvgPoint'

export const useSvgSliding = () => {
  const slide = (
    svg: SVGGraphicsElement,
    ev: MouseEvent | TouchEvent,
    range: { minX: number; maxX: number },
    cb: (info: TSlideValueInfo) => any
  ) => {
    let rawPoint = {
      x: 0,
      y: 0
    }
    if (ev instanceof TouchEvent) {
      rawPoint.x = ev.touches[0].clientX
      rawPoint.y = ev.touches[0].clientY
    } else {
      rawPoint.x = ev.clientX
      rawPoint.y = ev.clientY
    }

    const point = getPageToSvgPoint(svg, rawPoint)
    let x = Number(point.x.toFixed(2))
    if (x < range.minX) {
      x = range.minX
    } else if (x > range.maxX) {
      x = range.maxX
    }
    // _logger.log('onpointermove', ev.pointerId, ev.currentTarget.id, x)
    const target = ev.currentTarget as SVGGraphicsElement
    target.setAttribute('cx', `${x}`)
    cb({
      value: x
    })
  }

  const beginSliding = (
    svg: SVGGraphicsElement,
    ev: MouseEvent & { pointerId: number },
    range: { minX: number; maxX: number },
    cb: (info: TSlideValueInfo) => any
  ) => {
    const target = ev.currentTarget as SVGGraphicsElement
    target.onpointermove = (pme) => slide(svg, pme, range, cb)
    target.ontouchmove = (pme) => slide(svg, pme, range, cb)
    target.setPointerCapture(ev.pointerId)
  }

  const stopSliding = (ev: MouseEvent & { pointerId: number }) => {
    const target = ev.currentTarget as SVGGraphicsElement
    target.onpointermove = null
    target.ontouchmove = null
    target.releasePointerCapture(ev.pointerId)
  }

  return {
    beginSliding,
    stopSliding
  }
}
