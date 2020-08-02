import { setKeycode } from './keymap.js'
import { renderLayout } from './layout.js'

const layers = document.querySelector('#layers')
const layerSelector = document.querySelector('#layer-selector ul')

export function selectLayer (index) {
  const activeLayer = layers.querySelector('.layer.active')
  const activeLayerTab = layerSelector.querySelector('.active')
  const layer = layers.querySelector(`[data-layer="${index}"]`)
  const layerTab = layerSelector.querySelector(`[data-layer="${index}"]`)

  console.log({
    activeLayer,
    activeLayerTab,
    layer,
    layerTab
  })

  activeLayer && activeLayer.classList.remove('active')
  activeLayerTab && activeLayerTab.classList.remove('active')
  layer && layer.classList.add('active')
  layerTab && layerTab.classList.add('active')
}

export function addLayer (layout, layer) {
  const layerElement = renderLayout(layout)
  const li = document.createElement('li')
  const layerIndex = layers.children.length

  layerElement.classList.add('layer')
  layerElement.dataset.layer = li.dataset.layer = li.textContent = layerIndex

  layers.appendChild(layerElement)
  layerSelector.appendChild(li)
  selectLayer(layerIndex)

  layerSelector.addEventListener('click', event => {
    if (event.target.dataset.layer !== undefined) {
      selectLayer(event.target.dataset.layer)
    }
  })

  for (let i = 0; i < layout.length; i++) {
    // const key = layout[i]
    const code = layer[i] || 'KC_TRNS'
    // const keyElement = document.createElement('div')
    const keyElement = layerElement.children[i]

    // const x = key.x * 65
    // const y = key.y * 65
    // const rx = (key.x - (key.rx || key.x)) * -65
    // const ry = (key.y - (key.ry || key.y)) * -65

    setKeycode(keyElement, code)
    // keyElement.classList.add('key')
    // keyElement.classList.add(`key-${key.u}u`)
    // keyElement.classList.add(`key-${key.h}h`)

    // keyElement.style.top = `${y}px`
    // keyElement.style.left = `${x}px`
    // keyElement.style.transformOrigin = `${rx}px ${ry}px`
    // keyElement.style.transform = `rotate(${key.r || 0}deg)`
    // keyElement.dataset.u = key.u
    // keyElement.dataset.h = key.h
    // layerElement.appendChild(keyElement)
    // recalculateDepth(keyElement)

    keyElement.addEventListener('mouseover', event => {
      const old = document.querySelector('.highlight')
      old && old.classList.remove('highlight')
      event.target.classList.add('highlight')
    }, true)

    keyElement.addEventListener('mouseleave', event => {
      event.target.classList.remove('highlight')
    }, true)
  }

  return layerElement
}
