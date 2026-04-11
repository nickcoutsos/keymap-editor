import keycodes from './data/zmk-keycodes.json'
import { getDanishOutput } from './data/dk-layout'

export function loadKeycodes () {
  return Promise.resolve(keycodes).then(normalizeZmkKeycodes)
}

function shortestAlias (aliases) {
  const shortest = [...aliases]
    .sort((a, b) => a.length - b.length)[0]

  // Explicitly handle KC_LGUI and KC_RGUI
  if (shortest === 'KC_LGUI' || shortest === 'KC_RGUI') {
    return '⌘';
  }

  return shortest.replace(/^KC_/, '')
}

function normalizeZmkKeycodes (keycodes) {
  const fnPattern = /^(.+?)\((code)\)$/

  return keycodes.reduce((keycodes, keycode) => {
    const { description, context, symbol, faIcon } = keycode
    const aliases = keycode.names.filter(name => !name.match(fnPattern))
    const fnCode = keycode.names.map(name => name.match(fnPattern)).filter(v => !!v)[0]
    const base = { aliases, description, context, faIcon, symbol: symbol || shortestAlias(aliases), params: [] }

    for (let code of aliases) {
      keycodes.push(Object.assign({}, base, {
        code,
        danish: getDanishOutput(code),
        isModifier: !!fnCode
      }))
    }

    if (fnCode) {
      keycodes.push(Object.assign({}, base, {
        code: fnCode[1],
        params: fnCode[2].split(','),
        isModifier: true
      }))
    }

    return keycodes
  }, [])
}
