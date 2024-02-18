import { TSlideValueInfo } from './shared'

export const useSvgSlidingOnPath = () => {
  const slideOnPath = (
    svg: SVGGraphicsElement,
    control: SVGCircleElement,
    path: SVGPathElement,
    ev: MouseEvent | TouchEvent,
    direction: number,
    cb: (info: TSlideValueInfo) => any
  ) => {
    const getPathLength = () => path.getTotalLength()
    const getPointAtLength = (len: number) => path.getPointAtLength(len)

    let rawPoint = {
      x: 0,
      y: 0
    }
    if (ev instanceof TouchEvent) {
      rawPoint.x = ev.touches[0].clientX
      rawPoint.y = ev.touches[0].clientY
    } else {
      rawPoint.x = ev.clientX - 30 * direction
      rawPoint.y = ev.clientY
    }

    // Calculate the cursor position relative to the SVG element
    const svgRect = svg.getBoundingClientRect()
    const diff_x = Number(direction === 1 ? rawPoint.x - svgRect.left : svgRect.right - rawPoint.x)
    const x = Number(diff_x.toFixed(2))

    // This is a simple example and works for horizontal movement. For following the path accurately,
    // you would need a more complex calculation to find the nearest point on the path.
    const pathLength = Number(getPathLength().toFixed(2))
    const circlePos = Math.min(Math.max(0, x), pathLength) // Ensure the position is within path bounds

    // Ideally, find the closest point on the path to the cursor position for y as well
    const domPoint = getPointAtLength(circlePos)
    // round
    const point = {
      x: Number(domPoint.x.toFixed(2)),
      y: Number(domPoint.y.toFixed(2))
    }

    // Update the circle's position
    control.setAttribute('cx', `${point.x}`)
    control.setAttribute('cy', `${point.y}`)
    cb({
      debug_x: x,
      value: point.x
    })
  }

  const beginSlidingOnPath = (
    svg: SVGGraphicsElement,
    control: SVGCircleElement,
    path: SVGPathElement,
    ev: MouseEvent & { pointerId: number },
    direction: number,
    cb: (info: TSlideValueInfo) => any
  ) => {
    const target = ev.currentTarget as SVGGraphicsElement
    target.ontouchmove = (pme) => slideOnPath(svg, control, path, pme, direction, cb)
    target.onpointermove = (pme) => slideOnPath(svg, control, path, pme, direction, cb)
    target.setPointerCapture(ev.pointerId)
  }

  const stopSlidingOnPath = (ev: (MouseEvent | TouchEvent) & { pointerId: number }) => {
    const target = ev.currentTarget as SVGGraphicsElement
    target.ontouchmove = null
    target.onpointermove = null
    target.releasePointerCapture(ev.pointerId)
  }

  return {
    slideOnPath,
    beginSlidingOnPath,
    stopSlidingOnPath
  }
}
