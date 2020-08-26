import * as search from './search.js'
import { loadKeymap, setKeycode } from './keymap.js'
import { addLayer, selectLayer } from './layers.js'
import { loadLayout } from './layout.js'
import { createComboKeyInput } from './combo-key-input.js'

/* global Terminal */

async function main() {
  // const keycodes = await loadKeycodes()
  // const keycodesIndex = keycodes.reduce((map, keycode) => Object.assign(map, { [keycode.code]: keycode }), {})
  // const layout = await loadLayout()

  const layout = await loadLayout()
  const keymap = await loadKeymap()
  let active

  const socket = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}/console`)
  const terminal = new Terminal({ disableStdin: true, rows: 12, cols: 104 })
  terminal.open(document.querySelector('#terminal > div'))

  socket.onopen = () => console.log(new Date(), 'connected to console')
  socket.onclose = () => console.log(new Date(), 'disconnected from server')
  socket.onmessage = (message) => terminal.write(message.data.replace(/\n/g, '\r\n'))
  socket.onerror = err => console.error(new Date(), err)

  setInterval(() => socket.send('ping'), 10000)

  document.body.appendChild(createComboKeyInput())

  search.onSelect(code => {
    if (active) {
      setKeycode(active, code)
      // recalculateDepth(active)
    }
  })

  // addLayer(layout, keymap)
  // document.getElementById('layers').appendChild(renderLayout(layout))
  for (let layer of keymap.layers) {
    addLayer(layout, layer)
  }
  selectLayer(0)

  document.body.addEventListener('click', event => {
    if (event.target.classList.contains('key') || event.target.classList.contains('code')) {
      active = event.target
      search.activate(event.target)
    }
  })

  document.querySelector('#layer-selector button').addEventListener('click', () => {
    addLayer(layout, [])
  })

  function extractCode (code) {
    const paramsElement = code.querySelector('.params')
    if (!paramsElement) {
      return code.dataset.code
    }

    const params = [...paramsElement.children].map(extractCode)
    return `${code.dataset.code}(${params.join(',')})`
  }

  function buildKeymap () {
    const layers = []
    for (let layer of [...document.querySelectorAll('#layers .layer')]) {
      const layerExport = []
      for (let key of [...layer.childNodes]) {
        layerExport.push(extractCode(key.querySelector('.code')))
      }

      layers.push(layerExport)
    }

    return Object.assign({}, keymap, { layers })
  }

  function compile ({ flash = false } = {}) {
    const keymap = buildKeymap()
    document.querySelector('#compile').disabled = true
    document.querySelector('#flash').disabled = true

    terminal.clear()
    toggleTerminal(true)
    fetch(flash ? '/keymap?flash' : '/keymap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(keymap)
    }).then(() => {
      document.querySelector('#compile').disabled = false
      document.querySelector('#flash').disabled = false
    })
  }

  function toggleTerminal (forceOpen = false) {
    const button = document.getElementById('toggle')
    const element = document.querySelector('#terminal > div')
    const collapse = !forceOpen && !element.classList.contains('collapsed')

    button.textContent = collapse ? '⇡' : '⇣'
    element.classList.toggle('collapsed', collapse)
  }

  document.querySelector('#export').addEventListener('click', () => {
    const keymap = buildKeymap()
    const file = new File([JSON.stringify(newKeymap, null, 2)], 'default.json', {
      type: 'application/octet-stream'
    })

    location.href = URL.createObjectURL(file)
  })

  document.querySelector('#compile').addEventListener('click', () => compile())
  document.querySelector('#flash').addEventListener('click', () => compile({ flash: true }))

  document.querySelector('#toggle').addEventListener('click', () => toggleTerminal())
}

main()
