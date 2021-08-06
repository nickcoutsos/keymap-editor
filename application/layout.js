export function loadLayout () {
  return import('./data/layout.json')
    .then(layout => layout.default)
    .then(layout => layout.map(key => ({
      ...key,
      u: key.u || 1,
      h: key.h || 1
    })))
}

export function renderLayout (layout) {
  const layerElement = document.createElement('div')

  for (let i = 0; i < layout.length; i++) {
    const key = layout[i]

    const x = key.x * 65
    const y = key.y * 65
    const rx = (key.x - (key.rx || key.x)) * -65
    const ry = (key.y - (key.ry || key.y)) * -65

    const keyElement = document.createElement('div')
    keyElement.classList.add('key')
    keyElement.classList.add(`key-${key.u}u`)
    keyElement.classList.add(`key-${key.h}h`)

    keyElement.style.top = `${y}px`
    keyElement.style.left = `${x}px`
    keyElement.style.transformOrigin = `${rx}px ${ry}px`
    keyElement.style.transform = `rotate(${key.r || 0}deg)`

    keyElement.dataset.label = key.label
    keyElement.dataset.u = key.u
    keyElement.dataset.h = key.h

    const codeElement = document.createElement('span')
    codeElement.classList.add('code')
    keyElement.appendChild(codeElement)
    layerElement.appendChild(keyElement)
  }

  return layerElement
}
