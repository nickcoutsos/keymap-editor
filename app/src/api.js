import * as config from './config'
import keycodes from './data/zmk-keycodes.json'

export function healthcheck() {
  return fetch(`${config.apiBaseUrl}/health`)
}

export function loadBehaviours() {
  return fetch(`${config.apiBaseUrl}/behaviors`)
    .then(response => response.json())
}

export function loadKeycodes() {
  return Promise.resolve(keycodes)
}

export function loadKeymap() {
  return fetch(`${config.apiBaseUrl}/keymap`)
    .then(response => response.json())
}

export function loadLayout() {
  return fetch(`${config.apiBaseUrl}/layout`)
    .then(response => response.json())
}

export function loadMacros() {
  return fetch(`${config.apiBaseUrl}/macros`)
    .then(response => response.json())
}

export async function saveMacros(macros) {
  const res = await fetch(`${config.apiBaseUrl}/macros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(macros)
  })
  if (!res.ok) throw new Error(`Failed to save macros (${res.status})`)
}

export function loadAliases() {
  return fetch(`${config.apiBaseUrl}/aliases`)
    .then(res => res.json())
}

export function loadCombos() {
  return fetch(`${config.apiBaseUrl}/combos`)
    .then(response => response.json())
}

export async function saveCombos(combos) {
  const res = await fetch(`${config.apiBaseUrl}/combos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(combos)
  })
  if (!res.ok) throw new Error(`Failed to save combos (${res.status})`)
}

export async function saveKeymap(keymap) {
  const res = await fetch(`${config.apiBaseUrl}/keymap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keymap)
  })
  if (res.status === 400) {
    const body = await res.json()
    const message = body.errors ? body.errors.join('\n') : 'Keymap validation failed'
    throw new Error(message)
  }
  if (!res.ok) throw new Error(`Failed to save keymap (${res.status})`)
}

export async function gitPush() {
  const res = await fetch(`${config.apiBaseUrl}/git/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || body.stderr || `Push failed (${res.status})`)
  }
  return res.json()
}
