import { loadKeycodes } from './keycodes.js'

/* global fuzzysort */
const root = document.querySelector('#search')
export const prompt = root.querySelector('p')
export const input = root.querySelector('input')
export const results = root.querySelector('ul')
let param = null
let onSelect_ = null

export function onSelect (callback) {
  onSelect_ = callback
}

const clear = () => {
  for (let node of [...results.childNodes]) {
    results.removeChild(node)
  }
}

const getOptions = (param, keycodes) => {
  switch (param) {
    case 'layer':
      return [{code: '1' }, {code: '2' }, {code: '3' }]
    case 'mod':
      return keycodes.filter(keycode => keycode.isModifier)
    case 'kc':
    default:
      return keycodes
  }
}

async function query () {
  const keycodes = await loadKeycodes()
  const options = getOptions(param, keycodes)
  const searchResults = fuzzysort.go(input.value, options, {
    key: 'code',
    limit: 30
  })

  clear()
  for (let result of searchResults) {
    const item = document.createElement('li')
    item.innerHTML = fuzzysort.highlight(result)
    item.addEventListener('click', () => {
      onSelect_ && onSelect_(result.obj.code)
      hide()
    })

    results.appendChild(item)
  }
}

export const hide = () => {
  root.style.display = 'none'
}

export const activate = function activate (target) {
  const rect = target.getBoundingClientRect()
  if (target.classList.contains('key')) {
    target = target.querySelector('.code')
  }

  param = target.dataset.param || 'kc'
  if (target.dataset.param === 'layer') {
    prompt.textContent = 'Select layer...'
  } else if (target.dataset.param === 'mod') {
    prompt.textContent = 'Select modifier...'
  } else {
    prompt.textContent = 'Select key code...'
  }

  root.style.display = 'block'
  root.style.top = `${window.scrollY + (rect.top + rect.bottom) / 2}px`
  root.style.left = `${window.scrollX + (rect.left + rect.right) / 2}px`
  input.value = target.dataset.code

  clear()
  setTimeout(() => {
    input.focus()
    input.select()
  })
}

function debounce(fn, limit) {
  let delay = null
  let delayed = null

  return function debounced(...args) {
    delayed = () => fn(...args)
    if (!delay) {
      delay = setTimeout(() => {
        delay = null
        delayed()
      }, limit)
    }
  }
}

input.addEventListener('keypress', debounce(() => query(input.value), 250))
document.body.addEventListener('click', (event) => {
  const inactive = root.style.display === 'none'
  const child = root.contains(event.target)
  if (inactive || child) {
    return
  }

  hide()
}, true)
