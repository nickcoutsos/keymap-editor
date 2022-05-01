import filter from 'lodash/filter'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy'
import times from 'lodash/times'
import PropTypes from 'prop-types'
import { useContext, useMemo, useState } from 'react'

import KeyboardLayout from './KeyboardLayout'
import LayerSelector from './LayerSelector'
import { getKeyBoundingBox } from '../key-units'
import { DefinitionsContext, SearchContext } from '../providers'

function Keyboard(props) {
  const { layout, keymap, onUpdate } = props
  const [activeLayer, setActiveLayer] = useState(0)
  const {keycodes, behaviours} = useContext(DefinitionsContext)

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

  // TODO: this may be unnecessary
  const isReady = useMemo(() => function() {
    return (
      Object.keys(keycodes.indexed).length > 0 &&
      Object.keys(behaviours.indexed).length > 0 &&
      get(keymap, 'layers.length', 0) > 0
    )
  }, [keycodes, behaviours, keymap])

  const searchTargets = useMemo(() => {
    return {
      behaviour: behaviours,
      layer: availableLayers,
      mod: filter(keycodes, 'isModifier'),
      code: keycodes
    }
  }, [behaviours, keycodes, availableLayers])

  const getSearchTargets = useMemo(() => function (param, behaviour) {
    // Special case for behaviour commands which can dynamically add another
    // parameter that isn't defined at the root level of the behaviour.
    // Currently this is just `&bt BT_SEL` and is only represented as an enum.
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

  const boundingBox = useMemo(() => function () {
    return layout.map(key => getKeyBoundingBox(
      { x: key.x, y: key.y },
      { u: key.u || key.w || 1, h: key.h || 1 },
      { x: key.rx, y: key.ry, a: key.r }
    )).reduce(({ x, y }, { max }) => ({
      x: Math.max(x, max.x),
      y: Math.max(y, max.y)
    }), { x: 0, y: 0 })
  }, [layout])

  const getWrapperStyle = useMemo(() => function () {
    const bbox = boundingBox()
    return {
      width: `${bbox.x}px`,
      height: `${bbox.y}px`,
      margin: '0 auto',
      padding: '40px'
    }
  }, [boundingBox])

  const handleCreateLayer = useMemo(() => function () {
    const layer = keymap.layers.length
    const binding = '&trans'
    const makeKeycode = () => ({ value: binding, params: [] })

    const newLayer = times(layout.length, makeKeycode)
    const updatedLayerNames = [ ...keymap.layer_names, `Layer #${layer}` ]
    const layers = [ ...keymap.layers, newLayer ]

    onUpdate({ ...keymap, layer_names: updatedLayerNames, layers })
  }, [keymap, layout, onUpdate])

  const handleUpdateLayer = useMemo(() => function(layerIndex, updatedLayer) {
    const original = keymap.layers
    const layers = [
      ...original.slice(0, layerIndex),
      updatedLayer,
      ...original.slice(layerIndex + 1)
    ]

    onUpdate({ ...keymap, layers })
  }, [keymap, onUpdate])

  const handleRenameLayer = useMemo(() => function (layerName) {
    const layer_names = [
      ...keymap.layer_names.slice(0, activeLayer),
      layerName,
      ...keymap.layer_names.slice(activeLayer + 1)
    ]

    onUpdate({ ...keymap, layer_names })
  }, [keymap, activeLayer, onUpdate])

  const handleDeleteLayer = useMemo(() => function (layerIndex) {
    const layer_names = [...keymap.layer_names]
    layer_names.splice(layerIndex, 1)

    const layers = [...keymap.layers]
    layers.splice(layerIndex, 1)

    if (activeLayer > layers.length - 1) {
      setActiveLayer(Math.max(0, layers.length - 1))
    }

    onUpdate({ ...keymap, layers, layer_names })
  }, [keymap, activeLayer, setActiveLayer, onUpdate])

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
        <div style={getWrapperStyle()}>
          {isReady() && (
            <KeyboardLayout
              data-layer={activeLayer}
              layout={layout}
              bindings={keymap.layers[activeLayer]}
              onUpdate={event => handleUpdateLayer(activeLayer, event)}
            />
          )}
        </div>
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
