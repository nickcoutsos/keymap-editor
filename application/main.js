import * as search from './search.js'
import { loadKeymap, setKeycode } from './keymap.js'
import { addLayer, selectLayer } from './layers.js'
import { loadLayout } from './layout.js'


async function main() {
  // const keycodes = await loadKeycodes()
  // const keycodesIndex = keycodes.reduce((map, keycode) => Object.assign(map, { [keycode.code]: keycode }), {})
  // const layout = await loadLayout()

  const layout = await loadLayout()
  const keymap = await loadKeymap()
  let active

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

  document.querySelector('#export').addEventListener('click', () => {
    const layers = []
    for (let layer of [...document.querySelectorAll('#layers .layer')]) {
      const layerExport = []
      for (let key of [...layer.childNodes]) {
        layerExport.push(extractCode(key.querySelector('.code')))
      }

      layers.push(layerExport)
    }

    const newKeymap = Object.assign({}, keymap, { layers })
    // const blob = new Blob([JSON.stringify(newKeymap, null, 2)], {
    //   type: 'application/octet-stream',
    //   name: 'default.json'
    // })
    const file = new File([JSON.stringify(newKeymap, null, 2)], 'default.json', {
      type: 'application/octet-stream'
    })

    location.href = URL.createObjectURL(file)
  })
}

main()
