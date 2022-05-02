import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useContext, useState } from 'react'

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
  const { label, value, params, onUpdate } = props
  const [editing, setEditing] = useState(null)

  const bind = value
  const behaviour = get(sources.behaviours, bind)
  const behaviourParams = getBehaviourParams(params, behaviour)

  const normalized = hydrateTree(value, params, sources)

  const index = makeIndex(normalized)
  const positioningStyle = getKeyStyles(position, size, rotation)

  function onMouseOver(event) {
    const old = document.querySelector(`.${styles.highlight}`)
    old && old.classList.remove(styles.highlight)
    event.target.classList.add(styles.highlight)
  }
  function onMouseLeave(event) {
    event.target.classList.remove(styles.highlight)
  }

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
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
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
