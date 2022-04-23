import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'

import styles from './styles.module.css'

function LayerSelector(props) {
  const { activeLayer, layers, onSelect, onNewLayer, onDeleteLayer } = props
  const [renaming, setRenaming] = useState(false)

  const handleSelect = useMemo(() => function(layer) {
    if (layer === activeLayer) {
      setRenaming(true)
      return
    }

    setRenaming(false)
    onSelect(layer)
  }, [activeLayer, setRenaming, onSelect])

  const handleAdd = useMemo(() => function() {
    onNewLayer()
  }, [onNewLayer])

  const handleDelete = useMemo(() => function(layerIndex, layerName) {
    const confirmation = `Really delete layer: ${layerName}?`
    window.confirm(confirmation) && onDeleteLayer(layerIndex)
  }, [onDeleteLayer])

  const handleClickOutside = useMemo(() => function(event) {
    // // TODO: ref?
    // const input = this.$el.querySelector('.active input.name')
    // if (renaming && input !== target) {
    //   setRenaming(false)
    // }
  }, [renaming, setRenaming])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  return (
    <div className={styles['layer-selector']} data-renaming={renaming}>
      <p>Layers:</p>
      <ul>
        {layers.map((name, i) => (
          <li
            key={`layer-${i}`}
            className={activeLayer == i && 'active' || ''}
            data-layer={i}
            onClick={() => handleSelect(i)}
          >
            <span className={styles.index}>{i}</span>
            {(activeLayer == i && renaming) ? (
              <input
                // v-model="layers[i]"
                // :ref="input => input && input.focus()"
                className={styles.name}
                value={layers[i]}
              />
            ) : (
              <span className={styles.name}>
                {name}
                <span
                  className={`${styles.delete} fa fa-times-circle`}
                  onClick={() => handleDelete(i, name)}
                />
              </span>
            )}
          </li>
        ))}
        <li onClick={handleAdd}>
          <span className={`${styles.index} fa fa-plus`} />
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
  onDeleteLayer: PropTypes.func.isRequired
}

export default LayerSelector
