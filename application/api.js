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
}

export function loadLayout() {
  return fetch(`/layout?firmware=${config.library}`)
    .then(response => response.json())
}
