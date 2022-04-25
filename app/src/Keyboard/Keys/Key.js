import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import pick from 'lodash/pick'
import { useContext, useState } from 'react'

import { DefinitionsContext, SearchContext } from '../../providers'
import { getBehaviourParams } from '../../keymap'
import { getKeyStyles } from '../../key-units'

import KeyParamlist from './KeyParamlist'
import Modal from '../../Common/Modal'
import ValuePicker from '../../ValuePicker'

import styles from './styles.module.css'


function makeIndex (tree) {
  const index = []
  ;(function traverse(tree) {
    const params = tree.params || []
    index.push(tree)
    params.forEach(traverse)
  })(tree)

  return index
}

function isSimple(normalized) {
  const [first] = normalized.params
  const symbol = get(first, 'source.symbol', get(first, 'source.code', ''))
  const shortSymbol = symbol.length === 1
  const singleParam = normalized.params.length === 1
  return singleParam && shortSymbol
}

function isComplex(normalized, behaviourParams) {
  const [first] = normalized.params
  const symbol = get(first, 'source.symbol', get(first, 'value', ''))
  const isLongSymbol = symbol.length > 4
  const isMultiParam = behaviourParams.length > 1
  const isNestedParam = get(first, 'params', []).length > 0

  return isLongSymbol || isMultiParam || isNestedParam
}

function createPromptMessage(param) {
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

export default function Key(props) {
  const { keycodes, behaviours } = useContext(DefinitionsContext)
  const { getSearchTargets } = useContext(SearchContext)
  const  { position, rotation, size } = props
  const { label, value, params, onUpdate } = props
  const sources = {
    behaviours: behaviours.indexed,
    code: keycodes.indexed
  }
  const [editing, setEditing] = useState(null)

  const bind = value
  const behaviour = get(behaviours.indexed, bind)
  const behaviourParams = getBehaviourParams(params, behaviour)

  const commands = keyBy(behaviour.commands, 'code')

  function getSourceValue(value, as) {
    if (as === 'command') return commands[value]
    if (as === 'raw' || as.enum) return { code: value }
    return sources?.[as]?.[value]
  }

  function normalize(node, as) {
    if (!node) {
      return { value: undefined, params: [] }
    }
    const { value, params } = node
    const source = getSourceValue(value, as)

    return {
      value,
      source,
      params: get(source, 'params', []).map((as, i) => (
        normalize(params[i], as)
      ))
    }
  }

  const normalized = {
    value,
    source: behaviour,
    params: behaviourParams.map((as, i) => (
      normalize(params[i], as)
    ))
  }

  const index = makeIndex(normalized)
  const positioningStyle = getKeyStyles(position, size, rotation)

  function handleSelectCode(event) {
    const editing = pick(event, ['target', 'codeIndex', 'code', 'param'])
    editing.targets = getSearchTargets(editing.param, value)
    setEditing(editing)
  }
  function handleSelectBehaviour(event) {
    event.stopPropagation()
    setEditing({
      target: event.target,
      targets: getSearchTargets('behaviour', value),
      codeIndex: 0,
      code: value,
      param: 'behaviour'
    })
  }
  function handleSelectValue(source) {
    const { codeIndex } = editing
    const updated = cloneDeep(normalized)
    const index = makeIndex(updated)
    const targetCode = index[codeIndex]

    targetCode.value = source.code
    targetCode.params = []
    index.forEach(node => {
      delete node.source
    })

    setEditing(null)
    onUpdate(pick(updated, ['value', 'params']))
  }

  return (
    <div
      className={styles.key}
      data-label={label}
      data-u={size.u}
      data-h={size.h}
      data-simple={isSimple(normalized)}
      data-long={isComplex(normalized, behaviourParams)}
      style={positioningStyle}
      // @mouseover="onMouseOver"
      // @mouseleave="onMouseLeave"
    >
    {behaviour ? (
      <span
        className={styles['behaviour-binding']}
        onClick={handleSelectBehaviour}
      >
        {behaviour.code}
      </span>
    ) : null}
    <KeyParamlist
      root={true}
      index={index}
      params={behaviourParams}
      values={normalized.params}
      onSelect={handleSelectCode}
    />
    {editing && (
      <Modal>
        <ValuePicker
          target={editing.target}
          value={editing.code}
          param={editing.param}
          choices={editing.targets}
          prompt={createPromptMessage(editing.param)}
          searchKey="code"
          onSelect={handleSelectValue}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    )}
  </div>
  )
}

