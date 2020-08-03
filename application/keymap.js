import { loadIndexedKeycodes } from './keycodes.js'

let keycodesIndex_ = loadIndexedKeycodes()

export function loadKeymap () {
  return fetch('/keymap')
    .then(response => response.json())
}

const Icon = (name) => {
  const element = document.createElement('span')
  element.classList.add('fa', `fa-${name}`)
  return element
}

const Code = () => {
  const element = document.createElement('span')
  element.classList.add('code')

  return element
}

const Params = () => {
  const element = document.createElement('span')
  element.classList.add('params')
  return element
}

const Param = () => {
  const element = document.createElement('span')
  element.classList.add('param', 'code')
  return element
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

    const codeElement = Code()
    element.appendChild(codeElement)
    element = codeElement
  }

  element.setAttribute('title', keycode.description)
  element.dataset.code = keycode.code
  element.dataset.keycode = code
  if (keycode.faIcon) {
    element.appendChild(Icon(keycode.faIcon))
  } else {
    element.textContent = keycode.symbol
  }

  if (keycode.params.length > 0) {
    const paramsElement = Params()
    element.appendChild(paramsElement)

    for (let i = 0; i < keycode.params.length; i++) {
      const value = params[i]
      const paramElement = Param()

      if (value && value.match(/.+\(.+\)/)) {
        setKeycode(paramElement, value)
      } else {
        const param = keycode.params[i]
        const paramKeycode = keycodesIndex[value] || {}
        const label = param === 'layer' ? value : (paramKeycode.symbol || value)
        paramElement.textContent = label
        paramElement.dataset.param = param
        paramElement.dataset.code = value
        if (paramKeycode.faIcon) {
          paramElement.appendChild(Icon(paramKeycode.faIcon))
        } else {
          paramElement.textContent = label
        }
      }

      paramsElement.appendChild(paramElement)
    }
  }

  recalculateDepth(element)
}
