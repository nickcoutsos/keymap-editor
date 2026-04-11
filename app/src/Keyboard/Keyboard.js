import filter from 'lodash/filter'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy'
import times from 'lodash/times'
import PropTypes from 'prop-types'
import { useCallback, useContext, useMemo, useState } from 'react'

import KeyboardLayout from './KeyboardLayout'
import LayerSelector from './LayerSelector'
import LayerDisplay from './LayerDisplay'
import { getKeyBoundingBox } from '../key-units'
import { DefinitionsContext, SearchContext } from '../providers'
import styles from './styles.module.css'

function Keyboard(props) {
  const { layout, keymap, onUpdate } = props
  const [activeLayer, setActiveLayer] = useState(0)
  const [showLayerDisplay, setShowLayerDisplay] = useState(false)
  const { keycodes, behaviours } = useContext(DefinitionsContext)

  const availableLayers = useMemo(() => isEmpty(keymap) ? [] : (
    keymap.layers.map((_, i) => ({
      code: i,
      description: keymap.layer_names[i] || `Layer ${i}`
    }))
  ), [keymap])

  const sources = useMemo(() => ({
    kc: keycodes.indexed,
    code: keycodes.indexed,
    mod: keyBy(filter(keycodes, 'isModifier'), 'code'),
    behaviours: behaviours.indexed,
    layer: keyBy(availableLayers, 'code')
  }), [keycodes, behaviours, availableLayers])

  const searchTargets = useMemo(() => ({
    behaviour: behaviours,
    layer: availableLayers,
    mod: filter(keycodes, 'isModifier'),
    code: keycodes
  }), [behaviours, keycodes, availableLayers])

  const getSearchTargets = useCallback((param, behaviour) => {
    if (param.enum) {
      return param.enum.map(v => ({ code: v }))
    }
    if (param === 'command') {
      return get(sources, ['behaviours', behaviour, 'commands'], [])
    }
    if (!searchTargets[param]) {
      console.log('cannot find target for', param)
    }
    return searchTargets[param]
  }, [searchTargets, sources])

  const resolvedBindings = useMemo(() => {
    if (activeLayer === 0) return null
    return keymap.layers[activeLayer].map((binding, i) => {
      if (binding.value !== '&trans') return null
      for (let l = activeLayer - 1; l >= 0; l--) {
        const b = keymap.layers[l][i]
        if (b && b.value !== '&trans') return b
      }
      return null
    })
  }, [keymap.layers, activeLayer])

  const wrapperStyle = useMemo(() => {
    const { x, y } = layout.map(key => getKeyBoundingBox(
      { x: key.x, y: key.y },
      { u: key.u || key.w || 1, h: key.h || 1 },
      { x: key.rx, y: key.ry, a: key.r }
    )).reduce(({ x, y }, { max }) => ({
      x: Math.max(x, max.x),
      y: Math.max(y, max.y)
    }), { x: 0, y: 0 })
    return { width: `${x}px`, height: `${y}px`, margin: '0 auto', padding: '40px' }
  }, [layout])

  const handleCreateLayer = useCallback(() => {
    const layer = keymap.layers.length
    const newLayer = times(layout.length, () => ({ value: '&trans', params: [] }))
    onUpdate({
      ...keymap,
      layer_names: [...keymap.layer_names, `Layer #${layer}`],
      layers: [...keymap.layers, newLayer]
    })
  }, [keymap, layout, onUpdate])

  const handleUpdateLayer = useCallback((layerIndex, updatedLayer) => {
    const layers = [
      ...keymap.layers.slice(0, layerIndex),
      updatedLayer,
      ...keymap.layers.slice(layerIndex + 1)
    ]
    onUpdate({ ...keymap, layers })
  }, [keymap, onUpdate])

  const handleUpdateActiveLayer = useCallback(
    updatedLayer => handleUpdateLayer(activeLayer, updatedLayer),
    [handleUpdateLayer, activeLayer]
  )

  const handleRenameLayer = useCallback((layerName) => {
    const layer_names = [
      ...keymap.layer_names.slice(0, activeLayer),
      layerName,
      ...keymap.layer_names.slice(activeLayer + 1)
    ]
    onUpdate({ ...keymap, layer_names })
  }, [keymap, activeLayer, onUpdate])

  const handleDeleteLayer = useCallback((layerIndex) => {
    const layers = keymap.layers.filter((_, i) => i !== layerIndex)
    const layer_names = keymap.layer_names.filter((_, i) => i !== layerIndex)

    if (activeLayer > layers.length - 1) {
      setActiveLayer(Math.max(0, layers.length - 1))
    }

    onUpdate({ ...keymap, layers, layer_names })
  }, [keymap, activeLayer, onUpdate])

  return (
    <>
      <LayerSelector
        layers={keymap.layer_names}
        activeLayer={activeLayer}
        onSelect={setActiveLayer}
        onNewLayer={handleCreateLayer}
        onRenameLayer={handleRenameLayer}
        onDeleteLayer={handleDeleteLayer}
      />
      <SearchContext.Provider value={{ getSearchTargets, sources }}>
        <div style={wrapperStyle}>
          <KeyboardLayout
            data-layer={activeLayer}
            layout={layout}
            bindings={keymap.layers[activeLayer]}
            resolvedBindings={resolvedBindings}
            onUpdate={handleUpdateActiveLayer}
          />
        </div>
        <div className={styles['layer-display-toggle-row']}>
          <button
            className={styles['layer-display-toggle']}
            onClick={() => setShowLayerDisplay(v => !v)}
          >
            {showLayerDisplay ? 'Hide Layer Display' : 'Show Layer Display'}
          </button>
        </div>
        {showLayerDisplay && (
          <LayerDisplay
            layout={layout}
            layers={keymap.layers}
            activeLayer={activeLayer}
            layerNames={keymap.layer_names}
          />
        )}
      </SearchContext.Provider>
    </>
  )
}

Keyboard.propTypes = {
  layout: PropTypes.array.isRequired,
  keymap: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default Keyboard
