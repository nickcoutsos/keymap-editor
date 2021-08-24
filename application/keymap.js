import keyBy from 'lodash/keyBy'
import filter from 'lodash/filter'
import * as config from './config'

export function loadKeymap () {
  return fetch(`/keymap?${config.library}`, )
    .then(response => response.json())
    .then(keymap => {
      keymap.layer_names = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
      return keymap
    })
}

/**
 * Parse a bind string into a tree of source values/parameters
 * @param {String} binding
 * @param {Map<code:obj>} sources
 * @returns {Object}
 */
export function parseKeyBinding(binding, sources) {
  const paramsPattern = /\((.+)\)/
  const DEFAULT_CODE = 'KC_TRNS'

  const isZmk = binding.startsWith('&')
  const parameters = isZmk
    ? filter(binding.replace(/^&.+?\b\s*/, '').split(' '))
    : [binding]
  const bind = isZmk ? binding.match(/^(&.+?)\b/)[1] : '&kp'
  const behaviour = sources.behaviours[bind]
  const commands = keyBy(behaviour.commands || [], 'code')

  function getSourceValue(value, as) {
    if (as === 'command') return commands[value]
    if (as === 'raw') return { code: value }
    return sources[as][value]
  }

  function parse(code, as) {
    const value = code.replace(paramsPattern, '')
    const source = getSourceValue(value, as)
    const params = (code.match(paramsPattern) || ['', ''])[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s)


    const tree = { value, source }

    if (source && (source.params || []).length > 0) {
      tree.fn = value
      tree.params = source.params.map((param, i) => {
        return parse(params[i] || DEFAULT_CODE, param)
      })
    }

    return tree
  }

  const parsed = {
    behaviour,
    params: parameters.map((code, i) => parse(code, behaviour.params[i]))
  }

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

export function updateKeyCode(key, index, source, param) {
  const keyValue = key.parsed._index[index]
  keyValue.value = source.code
  delete keyValue.params

  if (param !== 'layer') {
    keyValue.source = source
    if (source && source.params.length > 0) {
      keyValue.params = source.params.map(() => ({
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

  return parsedKeymap.map(layer => layer.map(key => {
    const { behaviour, params } = key.parsed
    if (config.library === 'qmk') {
      return encodeBinding(params[0])
    }

    return `${behaviour.bind} ${params.map(encodeBinding).join(' ')}`.trim()
  }))
}
