import get from 'lodash/get'
import keyBy from 'lodash/keyBy'

import { getBehaviourParams } from '../../keymap'

export function makeIndex (tree) {
  const index = []
  ;(function traverse(tree) {
    const params = tree.params || []
    index.push(tree)
    params.forEach(traverse)
  })(tree)

  return index
}

export function isSimple(normalized) {
  const [first] = normalized.params
  const symbol = get(first, 'source.symbol', get(first, 'source.code', ''))
  const shortSymbol = symbol.length === 1
  const singleParam = normalized.params.length === 1
  return singleParam && shortSymbol
}

export function isComplex(normalized, behaviourParams) {
  const [first] = normalized.params
  const symbol = get(first, 'source.symbol', get(first, 'value', ''))
  const isLongSymbol = symbol.length > 4
  const isMultiParam = behaviourParams.length > 1
  const isNestedParam = get(first, 'params', []).length > 0

  return isLongSymbol || isMultiParam || isNestedParam
}

export function createPromptMessage(param) {
  const promptMapping = {
    layer: 'Select layer',
    mod: 'Select modifier',
    behaviour: 'Select behaviour',
    command: 'Select command',
    keycode: 'Select key code'
  }

  if (param.name) {
    return `Select ${param.name}`
  }

  return (
    promptMapping[param] ||
    promptMapping.keycode
  )
}

export function hydrateTree(value, params, sources) {
  const bind = value
  const behaviour = get(sources.behaviours, bind)
  const behaviourParams = getBehaviourParams(params, behaviour)
  const commands = keyBy(behaviour.commands, 'code')

  function getSourceValue(value, as) {
    if (as === 'command') return commands[value]
    if (as === 'raw' || as.enum) return { code: value }
    return sources?.[as]?.[value]
  }

  function hydrateNode(node, as) {
    if (!node) {
      return { value: undefined, params: [] }
    }
    const { value, params } = node
    const source = getSourceValue(value, as)

    return {
      value,
      source,
      params: get(source, 'params', []).map((as, i) => (
        hydrateNode(params[i], as)
      ))
    }
  }

  return {
    value,
    source: behaviour,
    params: behaviourParams.map((as, i) => (
      hydrateNode(params[i], as)
    ))
  }
}
