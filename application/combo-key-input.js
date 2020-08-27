import { loadKeycodes } from './keycodes.js'
import { setKeycode } from './keymap.js'
import ChipInput from './chip-input.js'

/* global fuzzysort */

function chipRenderer (value) {
  const element = document.createElement('span')
  element.classList.add('chip')
  setKeycode(element, value)
  return element
}

function createDomElements (values) {
  const container = document.createElement('div')
  const chipInput = ChipInput({ chipRenderer, initialValues: values })
  const results = document.createElement('ul')

  container.classList.add('combo-selector')
  results.classList.add('search-results')

  container.appendChild(chipInput.element)
  container.appendChild(results)

  return { container, chipInput, results }
}

export function createComboKeyInput (values = []) {
  const { container, chipInput, results } = createDomElements(values)
  const input = chipInput.element.querySelector('input')
  let keycodes = []

  function hideResults () { results.style.display = 'none' }
  function showResults () { results.style.display = 'block' }

  function handleInput () {
    const searchResults = fuzzysort.go(input.value, keycodes, {
      key: 'code',
      limit: 30
    })

    results.length === 0
      ? hideResults()
      : showResults()

    for (let node of [...results.childNodes]) {
      results.removeChild(node)
    }

    for (let result of searchResults) {
      const item = document.createElement('li')
      item.innerHTML = fuzzysort.highlight(result)
      item.dataset.code = result.obj.code
      results.appendChild(item)
    }
  }

  function handleSelect (event) {
    if (event.target.nodeName.toLowerCase() === 'li') {
      input.value = ''
      chipInput.addChip(event.target.dataset.code)
      hideResults()
    }
  }

  function activate (event) {
    chipInput.element.classList.add('active')
    event.stopPropagation()
    input.focus()
  }

  function deactivate (event) {
    chipInput.element.classList.remove('active')
  }

  (async function init () {
    hideResults()
    input.focus()
    input.addEventListener('input', handleInput)
    results.addEventListener('click', handleSelect, { useCapture: true })
    container.addEventListener('click', activate)
    input.addEventListener('blur', deactivate)

    keycodes = await loadKeycodes()
  }())

  return container
}
