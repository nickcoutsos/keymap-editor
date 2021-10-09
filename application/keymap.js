import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import filter from 'lodash/filter'
export { loadKeymap } from './api'

const paramsPattern = /\((.+)\)/

/**
 * Parse a bind string into a tree of source values/parameters
 * @param {String} binding
 * @param {Map<code:obj>} sources
 * @returns {Object}
 */
export function parseKeyBinding(binding, sources) {
  function parse(code) {
    const value = code.replace(paramsPattern, '')
    const params = get(code.match(paramsPattern), '[1]', '').split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(parse)
    
    return { value, params }
  }
  
  const value = binding.match(/^(&.+?)\b/)[1]
  const params = filter(binding.replace(/^&.+?\b\s*/, '')
    .split(' '))
    .map(parse)

  return { value, params }
}

export function getBehaviourParams(parsed, behaviour) {
  const firstParsedParam = get(parsed, 'params[0]', {})
  const commands = keyBy(behaviour.commands, 'code')
  return [].concat(
    behaviour.params,
    get(behaviour, 'params[0]') === 'command'
      ? get(commands[firstParsedParam.value], 'additionalParams', [])
      : []
  )
}

function encodeBindValue(parsed) {
  const params = (parsed.params || []).map(encodeBindValue)
  const paramString = params.length > 0 ? `(${params.join(',')})` : ''
  return parsed.value + paramString
}

function encodeKeyBinding(parsed) {
  const { value, params } = parsed

  return `${value} ${params.map(encodeBindValue).join(' ')}`.trim()
}

export function encode(parsedKeymap) {
  return parsedKeymap.map(layer => layer.map(encodeKeyBinding))
}
