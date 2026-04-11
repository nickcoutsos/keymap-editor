import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useCallback, useContext, useState } from 'react'

import { SearchContext } from '../../providers'
import { getBehaviourParams } from '../../keymap'
import { getKeyStyles } from '../../key-units'

import KeyParamlist from './KeyParamlist'
import * as keyPropTypes from './keyPropTypes'
import {
  createPromptMessage,
  hydrateTree,
  isSimple,
  isComplex,
  makeIndex
} from './util'
import styles from './styles.module.css'

import Modal from '../../Common/Modal'
import ValuePicker from '../../ValuePicker'

function Key(props) {
  const { getSearchTargets, sources } = useContext(SearchContext)
  const { position, rotation, size } = props
  const { label, value, params, onUpdate, resolvedBinding } = props
  const [editing, setEditing] = useState(null)

  const behaviour = get(sources.behaviours, value)
  const behaviourParams = getBehaviourParams(params, behaviour)

  const normalized = hydrateTree(value, params, sources)

  const resolvedNormalized = resolvedBinding ? hydrateTree(resolvedBinding.value, resolvedBinding.params, sources) : null
  const resolvedBehaviour = resolvedBinding ? get(sources.behaviours, resolvedBinding.value) : null
  const resolvedBehaviourParams = resolvedNormalized ? getBehaviourParams(resolvedBinding.params, resolvedBehaviour) : []
  const resolvedIndex = resolvedNormalized ? makeIndex(resolvedNormalized) : []

  const index = makeIndex(normalized)
  const positioningStyle = getKeyStyles(position, size, rotation)

  const onMouseOver = useCallback((event) => {
    const old = document.querySelector(`.${styles.highlight}`)
    old && old.classList.remove(styles.highlight)
    event.target.classList.add(styles.highlight)
  }, [])

  const onMouseLeave = useCallback((event) => {
    event.target.classList.remove(styles.highlight)
  }, [])

  const handleSelectCode = useCallback((event) => {
    const editing = pick(event, ['target', 'codeIndex', 'code', 'param'])
    editing.targets = getSearchTargets(editing.param, value)
    setEditing(editing)
  }, [getSearchTargets, value])

  const handleSelectBehaviour = useCallback((event) => {
    event.stopPropagation()
    setEditing({
      target: event.target,
      targets: getSearchTargets('behaviour', value),
      codeIndex: 0,
      code: value,
      param: 'behaviour'
    })
  }, [getSearchTargets, value])

  const handleSelectValue = useCallback((source) => {
    const { codeIndex } = editing
    const updated = cloneDeep(normalized)
    const nodes = makeIndex(updated)
    const targetCode = nodes[codeIndex]

    targetCode.value = source.code
    targetCode.params = []
    nodes.forEach(node => {
      delete node.source
    })

    setEditing(null)
    onUpdate(pick(updated, ['value', 'params']))
  }, [editing, normalized, onUpdate])

  return (
    <div
      className={styles.key}
      data-label={label}
      data-u={size.u}
      data-h={size.h}
      data-simple={isSimple(normalized)}
      data-long={isComplex(normalized, behaviourParams)}
      data-trans={value === '&trans'}
      style={positioningStyle}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
    {behaviour ? (
      <span
        className={styles['behaviour-binding']}
        onClick={handleSelectBehaviour}
      >
        {behaviour.symbol || behaviour.code}
      </span>
    ) : null}
    {value === '&trans' && !resolvedNormalized && (
      <span className={styles['trans-badge']}>▽</span>
    )}
    {value === '&trans' && resolvedNormalized ? (
      <div className={styles['trans-resolved']}>
        {resolvedBehaviour && (
          <span className={styles['behaviour-binding']} style={{ pointerEvents: 'none' }}>
            {resolvedBehaviour.symbol || resolvedBehaviour.code}
          </span>
        )}
        <KeyParamlist
          root={true}
          index={resolvedIndex}
          params={resolvedBehaviourParams}
          values={resolvedNormalized.params}
          onSelect={() => {}}
        />
      </div>
    ) : (
      <KeyParamlist
        root={true}
        index={index}
        params={behaviourParams}
        values={normalized.params}
        onSelect={handleSelectCode}
      />
    )}
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

Key.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  rotation: PropTypes.shape({
    a: PropTypes.number,
    rx: PropTypes.number,
    ry: PropTypes.number
  }),
  size: PropTypes.shape({
    u: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired
  }),
  label: PropTypes.string,
  value: keyPropTypes.value.isRequired,
  params: PropTypes.arrayOf(keyPropTypes.node),
  onUpdate: PropTypes.func.isRequired
}

export default Key
