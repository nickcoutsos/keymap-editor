import map from 'lodash/map'

const DEFAULT_SIZE = 65;
const DEFAULT_PADDING = 5;

export function getComputedParams (position, size, rotation = {}) {
  return {
    x: position.x * (DEFAULT_SIZE + DEFAULT_PADDING),
    y: position.y * (DEFAULT_SIZE + DEFAULT_PADDING),
    u: size.u * DEFAULT_SIZE + DEFAULT_PADDING * (size.u - 1),
    h: size.h * DEFAULT_SIZE + DEFAULT_PADDING * (size.h - 1),
    rx: (position.x - (rotation.x || position.x)) * -(DEFAULT_SIZE + DEFAULT_PADDING),
    ry: (position.y - (rotation.y || position.y)) * -(DEFAULT_SIZE + DEFAULT_PADDING),
    a: rotation.a || 0
  }
}

export function getKeyStyles (position, size, rotation) {
  const { x, y, u, h, a, rx, ry } = getComputedParams (position, size, rotation)

  return {
    top: `${y}px`,
    left: `${x}px`,
    width: `${u}px`,
    height: `${h}px`,
    transformOrigin: `${rx}px ${ry}px`,
    transform: `rotate(${a || 0}deg)`
  }
}

export function getKeyBoundingBox(position, size, rotation) {
  const { x, y, u, h, a, rx, ry } = getComputedParams(position, size, rotation)

  const points = [
    { x: 0, y: 0 },
    { x: u, y: 0 },
    { x: u, y: h },
    { x: 0, y: h }
  ]

  function translate(point) {
    return {
      x: point.x + x,
      y: point.y + y
    }
  }

  function rotate(point) {
    const x = point.x - rx
    const y = point.y - ry
    const angle = Math.PI * a / 180

    return {
      x: rx + x * Math.cos(angle) - y * Math.sin(angle),
      y: ry + y * Math.cos(angle) + x * Math.sin(angle)
    }
  }

  const transformed = points.map(rotate).map(translate)
  const xValues = map(transformed, 'x')
  const yValues = map(transformed, 'y')
  const min = {
    x: Math.min(...xValues),
    y: Math.min(...yValues)
  }
  const max = {
    x: Math.max(...xValues),
    y: Math.max(...yValues)
  }

  return { min, max }
}
