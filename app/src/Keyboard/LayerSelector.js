import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Icon from '../Common/Icon'
import styles from './styles.module.css'

function stop(fn) {
  return function(event) {
    event.stopPropagation()
    fn()
  }
}

function onKey(mapping) {
  return function(event) {
    if (mapping[event.key]) {
      mapping[event.key]()
    }
  }
}

function LayerSelector(props) {
  const ref = useRef(null)
  const { activeLayer, layers } = props
  const { onSelect, onNewLayer, onRenameLayer, onDeleteLayer } = props
  const [renaming, setRenaming] = useState(false)
  const [editing, setEditing] = useState('')

  const handleSelect = useMemo(() => function(layer) {
    if (layer === activeLayer) {
      setEditing(layers[activeLayer])
      setRenaming(true)
      return
    }

    setRenaming(false)
    onSelect(layer)
  }, [layers, activeLayer, setEditing, setRenaming, onSelect])

  const handleAdd = useMemo(() => function() {
    onNewLayer()
  }, [onNewLayer])

  const handleDelete = useMemo(() => function(layerIndex, layerName) {
    const confirmation = `Really delete layer: ${layerName}?`
    window.confirm(confirmation) && onDeleteLayer(layerIndex)
  }, [onDeleteLayer])

  const finishEditing = useCallback(() => {
    if (!renaming) {
      return
    }

    setEditing('')
    setRenaming(false)
    onRenameLayer(editing)
  }, [editing, renaming, setEditing, setRenaming, onRenameLayer])

  const cancelEditing = useCallback(() => {
    if (!renaming) {
      return
    }

    setEditing('')
    setRenaming(false)
  }, [renaming, setEditing, setRenaming])

  const handleClickOutside = useMemo(() => function(event) {
    const clickedOutside = ref.current && !ref.current.contains(event.target)
    if (!clickedOutside) {
      return
    }

    cancelEditing()
  }, [ref, cancelEditing])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  const focusInput = useCallback(node => {
    if (node) {
      node.focus()
      node.select()
    }
  }, [])

  return (
    <div
      className={styles['layer-selector']}
      data-renaming={renaming}
      ref={ref}
    >
      <p>Layers:</p>
      <ul>
        {layers.map((name, i) => (
          <li
            key={`layer-${i}`}
            className={activeLayer === i ? styles.active : ''}
            data-layer={i}
            onClick={stop(() => handleSelect(i))}
          >
            <span className={styles.index}>{i}</span>
            {(activeLayer === i && renaming) ? (
              <input
                ref={focusInput}
                className={styles.name}
                onChange={e => setEditing(e.target.value)}
                onKeyDown={onKey({
                  Enter: finishEditing,
                  Escape: cancelEditing
                })}
                value={
                  (activeLayer === i && renaming)
                    ? editing
                    : layers[i]
                }
              />
            ) : (
              <span className={styles.name}>
                {name}
                <Icon
                  name="times-circle"
                  className={styles.delete}
                  onClick={stop(() => handleDelete(i, name))}
                />
              </span>
            )}
          </li>
        ))}
        <li onClick={handleAdd}>
          <Icon className={styles.index} name="plus" />
          <span className={styles.name}>Add Layer</span>
        </li>
      </ul>
    </div>
  )
}

LayerSelector.propTypes = {
  layers: PropTypes.array.isRequired,
  activeLayer: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onNewLayer: PropTypes.func.isRequired,
  onRenameLayer: PropTypes.func.isRequired,
  onDeleteLayer: PropTypes.func.isRequired
}

export default LayerSelector
