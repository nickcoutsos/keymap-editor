import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
export { loadKeymap } from './api'

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
