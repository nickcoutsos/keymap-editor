
export function loadKeymap () {
  return fetch('/keymap')
    .then(response => response.json())
}

/**
 * Parse a bind string into a tree of key codes/parameters
 * @param {String} binding
 * @param {Map<code:obj>} indexedKeycodes
 * @returns {Object}
 */
export function parseKeyBinding(binding, indexedKeycodes) {
  const paramsPattern = /\((.+)\)/
  const DEFAULT_CODE = 'KC_TRNS'

  function parse(code, parent) {
    const value = code.replace(paramsPattern, '')
    const keycode = indexedKeycodes[value]
    const params = (code.match(paramsPattern) || ['', ''])[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s)

    const tree = { value, keycode, parent }

    if (keycode && keycode.params.length > 0) {
      tree.fn = value
      tree.params = keycode.params.map((_, i) => {
        return parse(params[i] || DEFAULT_CODE, tree)
      })
    }

    return tree
  }

  const parsed = parse(binding)
  parsed._index = indexKeyBinding(parsed)
  return parsed
}

/**
 * Traverse the tree of a parsed key binding and return a flat index.
 * @param {Object} tree
 * @returns {Array}
 */
export function indexKeyBinding(tree) {
  let index = []

  return (function traverse(tree) {
    tree.index = index.length
    index.push(tree)
    const params = tree.params || []
    params.forEach(traverse)
    return index
  })(tree)
}

export function updateKeyCode(key, index, code, param, indexedKeycodes) {
  const keyValue = key.parsed._index[index]

  keyValue.value = code
  delete keyValue.params

  if (param !== 'layer') {
    const keycode = indexedKeycodes[code]
    keyValue.keycode = keycode
    if (keycode.params.length > 0) {
      keyValue.params = keycode.params.map(() => ({
        value: 'KC_TRNS',
        keycode: indexedKeycodes.KC_TRNS
      }))
    }
  }
  key.parsed._index = indexKeyBinding(key.parsed)
}

export function encode(parsedKeymap) {
  function encodeBinding(parsed) {
    const params = (parsed.params || []).map(encodeBinding)
    const paramString = params.length > 0 ? `(${params.join(',')})` : ''
    return parsed.value + paramString
  }

  return parsedKeymap.map(layer => layer.map(key => encodeBinding(key.parsed)))
}
