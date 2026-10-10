import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
export { loadKeymap } from './api'

export function parseKeymap(keymap) {
  return { ...keymap, layers: keymap.layers.map(layer => layer.map(parseKeyBinding)) }
}

function parseKeyBinding(binding) {
  const paramsPattern = /\((.+)\)/
  function parse(code) {
    const value = code.replace(paramsPattern, '')
    const params = ((code.match(paramsPattern) || [])[1] || '').split(',')
      .map(s => s.trim()).filter(Boolean).map(parse)
    return { value, params }
  }
  const value = binding.match(/^(&.+?)\b/)[1]
  const params = binding.replace(/^&.+?\b\s*/, '').split(' ').filter(Boolean).map(parse)
  return { value, params }
}

export function encodeBindValue(parsed) {
  const params = (parsed.params || []).map(encodeBindValue)
  const paramString = params.length > 0 ? `(${params.join(',')})` : ''
  return parsed.value + paramString
}

export function encodeKeyBinding(parsed) {
  const { value, params } = parsed
  return `${value} ${params.map(encodeBindValue).join(' ')}`.trim()
}

export function encodeKeymap(keymap) {
  return { ...keymap, layers: keymap.layers.map(layer => layer.map(encodeKeyBinding)) }
}

export function getBehaviourParams(parsedParams, behaviour) {
  if (!behaviour) return []
  const firstParsedParam = get(parsedParams, '[0]', {})
  const commands = keyBy(behaviour.commands, 'code')
  return [].concat(
    behaviour.params,
    get(behaviour, 'params[0]') === 'command'
      ? get(commands[firstParsedParam.value], 'additionalParams', [])
      : []
  )
}
