import * as config from './config'

export function loadBehaviours () {
  return import('./data/zmk-behaviours.json')
    .then(behaviours => behaviours.default)
}

export function loadKeycodes () {
  const library = config.library === 'zmk'
    ? loadZMKKeycodes()
    : loadQMKKeycodes()

  return library
}

function loadQMKKeycodes() { return import('./data/keycodes.json').then(keycodes => keycodes.default).then(normalizeKeycodes) }
function loadZMKKeycodes() { return import('./data/zmk-keycodes.json').then(keycodes => keycodes.default).then(normalizeZmkKeycodes) }

export async function loadIndexedKeycodes() {
  return loadKeycodes()
    .then(keycodes => (
      keycodes.reduce((map, keycode) => Object.assign(map, { [keycode.code]: keycode }), {})
    ))
}

export async function loadIndexedBehaviours() {
  return loadBehaviours()
    .then(behaviours => (
      behaviours.reduce((map, behaviour) => Object.assign(map, { [behaviour.bind]: behaviour }), {})
    ))
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
