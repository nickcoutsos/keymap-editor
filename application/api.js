import * as config from './config'

export function loadBehaviours() {
  return fetch(`/behaviors?firmware=${config.library}`).then(response => response.json())
}

export function loadKeycodes() {
  return fetch(`/keycodes?firmware=${config.library}`).then(response => response.json())
}

export function loadKeymap() {
  return fetch(`/keymap?firmware=${config.library}`)
    .then(response => response.json())
    .then(keymap => Object.assign(keymap, {
      layer_names: keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
    }))
}

export function loadLayout() {
  return fetch(`/layout?firmware=${config.library}`)
    .then(response => response.json())
    .then(layout => (
      layout.map(key => (
        { ...key, u: key.u || key.w || 1, h: key.h || 1 }
      ))
    ))
}
