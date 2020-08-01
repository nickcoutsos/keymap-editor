import { loadIndexedKeycodes } from './keycodes.js'

let keycodesIndex_ = loadIndexedKeycodes()

export function loadKeymap () {
  return fetch('data/keymap.json')
    .then(response => response.json())
}

function findParentKey (element) {
  const isRoot = node => node == document.body
  const isKey = node => node.classList.contains('key')
  let node = element

  while (!isRoot(node) && !isKey(node)) { node = node.parentNode }

  if (isRoot(node)) {
    console.error('Could not find parent key for', element)
  }

  return node
}

export function recalculateDepth (element) {
  function getDepth (node) {
    const childDepths = Array.from(node.childNodes).map(node => getDepth(node))
    return node.nodeName !== '#text'
      ? 1 + Math.max(0, ...childDepths)
      : 0
  }

  const key = findParentKey(element)
  key.dataset.depth = getDepth(key) - 1
}

export async function setKeycode(element, code) {
  const keycodesIndex = await keycodesIndex_
  const paramsPattern = /\((.+)\)/
  const keycode = keycodesIndex[code.replace(paramsPattern, '')]
  const params = (code.match(paramsPattern) || ['', ''])[1]
    .split(',')
    .map(s => s.trim())
    .filter(s => !!s)

  if (element.classList.contains('param') && element.dataset.param === 'layer') {
    element.dataset.code = code
    element.textContent = code
    return
  }

  if (!keycode) {
    console.warn('wtf', code, code.replace(paramsPattern, ''))
    return
  }

  if (!element.classList.contains('code')) {
    for (let child of [...element.childNodes]) {
      element.removeChild(child)
    }

    const codeElement = document.createElement('span')
    codeElement.classList.add('code')
    element.appendChild(codeElement)
    element = codeElement
  }

  element.textContent = keycode.symbol
  element.dataset.code = keycode.code
  element.dataset.keycode = code

  if (keycode.params.length > 0) {
    const paramsElement = document.createElement('span')
    element.appendChild(paramsElement)
    paramsElement.classList.add('params')

    for (let i = 0; i < keycode.params.length; i++) {
      const value = params[i]

      const paramElement = document.createElement('span')
      paramElement.classList.add('param', 'code')

      if (value && value.match(/.+\(.+\)/)) {
        setKeycode(paramElement, value)
      } else {
        const param = keycode.params[i]
        const label = param === 'layer' ? value : ((keycodesIndex[value] || {}).symbol || value)
        paramElement.textContent = label
        paramElement.dataset.param = param
        paramElement.dataset.code = value
      }

      paramsElement.appendChild(paramElement)
    }
  }

  recalculateDepth(element)
}
