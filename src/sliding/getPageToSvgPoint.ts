export const getPageToSvgPoint = (
  element: SVGGraphicsElement,
  point: { x: number; y: number },
  offset?: { x: number; y: number }
) => {
  const offset_x = offset?.x || 0
  const offset_y = offset?.y || 0
  const pt = new DOMPoint(Math.round(point.x + offset_x), Math.round(point.y + offset_y))
  return pt.matrixTransform(element.getScreenCTM()?.inverse())
}
