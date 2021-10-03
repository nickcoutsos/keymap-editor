import * as config from './config'

export function loadBehaviours() {
  return fetch(`${config.apiBaseUrl}/behaviors?firmware=${config.library}`).then(response => response.json())
}

export function loadKeycodes() {
  return fetch(`${config.apiBaseUrl}/keycodes?firmware=${config.library}`).then(response => response.json())
}

export function loadKeymap() {
  return fetch(`${config.apiBaseUrl}/keymap?firmware=${config.library}`)
    .then(response => response.json())
}

export function loadLayout() {
  return fetch(`${config.apiBaseUrl}/layout?firmware=${config.library}`)
    .then(response => response.json())
}
