import { setKeycode } from './keymap.js'
import { renderLayout } from './layout.js'

const layers = document.querySelector('#layers')
const layerSelector = document.querySelector('#layer-selector ul')

const setActiveClasses = targetIndex => (element, i) => {
  element.classList.toggle('prev', i < targetIndex)
  element.classList.toggle('next', i > targetIndex)
  element.classList.toggle('active', i == targetIndex)
}

export function selectLayer (index) {
  const adjustment = setActiveClasses(index)
  Array.from(layers.children).forEach(adjustment)
  Array.from(layerSelector.children).forEach(adjustment)
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
    const code = layer[i] || 'KC_TRNS'
    const keyElement = layerElement.children[i]

    setKeycode(keyElement, code)

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
