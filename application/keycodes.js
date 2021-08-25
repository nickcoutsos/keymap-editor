import keyBy from 'lodash/keyBy'
import * as api from './api'
import * as config from './config'

export function loadBehaviours () {
  return api.loadBehaviours()
}

export function loadKeycodes () {
  return api.loadKeycodes().then((
    config.library === 'zmk'
      ? normalizeZmkKeycodes
      : normalizeKeycodes
  ))
}

export function loadIndexedKeycodes() {
  return loadKeycodes().then(keycodes => keyBy(keycodes, 'code'))
}

export function loadIndexedBehaviours() {
  return loadBehaviours().then(behaviours => keyBy(behaviours, 'bind'))
}

function shortestAlias (aliases) {
  return [...aliases]
    .sort((a, b) => a.length - b.length)[0]
    .replace(/^KC_/, '')
}

function normalizeKeycodes (keycodes) {
  return keycodes.map(keycode => {
    keycode.params = (keycode.code.match(/\((.+?)\)/) || ['', ''])[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => !!t)

    keycode.aliases = [keycode.code, ...(keycode.aliases || [])]
      .map(code => code.replace(/`/g, ''))
      .map(code => code.replace(/\(.+\)/, ''))

    keycode.symbol = keycode.symbol || shortestAlias(keycode.aliases)
    return keycode
  })
  .reduce((keycodes, keycode) => {
    for (let alias of keycode.aliases) {
      keycodes.push(Object.assign({}, keycode, { code: alias }))
    }

    return keycodes
  }, [])
}

function normalizeZmkKeycodes (keycodes) {
  const fnPattern = /^(.+?)\((code)\)$/

  return keycodes.reduce((keycodes, keycode) => {
    const { description, context, symbol } = keycode
    const aliases = keycode.names.filter(name => !name.match(fnPattern))
    const fnCode = keycode.names.map(name => name.match(fnPattern)).filter(v => !!v)[0]
    const base = { aliases, description, context, symbol: symbol || shortestAlias(aliases), params: [] }

    for (let code of aliases) {
      keycodes.push(Object.assign({}, base, {
        code,
        isModifier: !!fnCode
      }))
    }

    if (fnCode) {
      keycodes.push(Object.assign({}, base, {
        code: fnCode[1],
        params: fnCode[2].split(',')
      }))
    }

    return keycodes
  }, [])
}
