import get from 'lodash/get'
import { useContext, useMemo } from 'react'

import { SearchContext } from '../providers'
import { getKeyBoundingBox, getKeyStyles } from '../key-units'
import { hydrateTree } from './Keys/util'
import styles from './styles.module.css'

const SCALE = 0.6

function getKeyLabel(binding, resolvedBinding, sources) {
  const effective = (binding.value === '&trans' && resolvedBinding) ? resolvedBinding : binding
  if (effective.value === '&trans') return '▽'
  if (effective.value === '&none') return '⦸'

  const normalized = hydrateTree(effective.value, effective.params, sources)
  const firstParam = normalized.params[0]
  if (!firstParam) {
    return normalized.source?.symbol || normalized.source?.code || effective.value
  }
  const src = firstParam.source
  if (!src) return firstParam.value || ''
  return src.danish?.split(' ')[0] || src.symbol || src.code || firstParam.value || ''
}

function DisplayKey({ layoutKey, binding, resolvedBinding, sources }) {
  const position = { x: layoutKey.x, y: layoutKey.y }
  const size = { u: layoutKey.u || layoutKey.w || 1, h: layoutKey.h || 1 }
  const rotation = { a: layoutKey.r, x: layoutKey.rx, y: layoutKey.ry }
  const positionStyle = getKeyStyles(position, size, rotation)

  const isTrans = binding.value === '&trans' && !resolvedBinding
  const isNone = binding.value === '&none'
  const label = getKeyLabel(binding, resolvedBinding, sources)

  return (
    <div
      className={[
        styles['display-key'],
        isTrans ? styles['display-key-trans'] : '',
        isNone ? styles['display-key-none'] : '',
      ].filter(Boolean).join(' ')}
      style={positionStyle}
    >
      <span>{label}</span>
    </div>
  )
}

function LayerDisplay({ layout, layers, activeLayer, layerNames }) {
  const { sources } = useContext(SearchContext)

  const resolvedBindings = useMemo(() => {
    if (activeLayer === 0) return null
    return layers[activeLayer].map((binding, i) => {
      if (binding.value !== '&trans') return null
      for (let l = activeLayer - 1; l >= 0; l--) {
        const b = layers[l][i]
        if (b && b.value !== '&trans') return b
      }
      return null
    })
  }, [layers, activeLayer])

  const { width, height } = useMemo(() => {
    const { x, y } = layout.map(key => getKeyBoundingBox(
      { x: key.x, y: key.y },
      { u: key.u || key.w || 1, h: key.h || 1 },
      { x: key.rx, y: key.ry, a: key.r }
    )).reduce(({ x, y }, { max }) => ({
      x: Math.max(x, max.x),
      y: Math.max(y, max.y)
    }), { x: 0, y: 0 })
    return { width: x, height: y }
  }, [layout])

  const PAD = 40
  const naturalWidth = width + PAD * 2
  const naturalHeight = height + PAD * 2
  const scaledHeight = naturalHeight * SCALE

  return (
    <div className={styles['layer-display']}>
      <div className={styles['layer-display-header']}>
        Layer {activeLayer} — {layerNames[activeLayer]}
      </div>
      <div style={{ height: `${scaledHeight}px`, overflow: 'visible' }}>
        <div style={{
          width: `${naturalWidth}px`,
          height: `${naturalHeight}px`,
          margin: '0 auto',
          transform: `scale(${SCALE})`,
          transformOrigin: 'top center',
          position: 'relative',
          padding: `${PAD}px`,
          boxSizing: 'border-box',
        }}>
          {layout.map((key, i) => (
            <DisplayKey
              key={i}
              layoutKey={key}
              binding={layers[activeLayer][i] || { value: '&none', params: [] }}
              resolvedBinding={resolvedBindings ? resolvedBindings[i] : null}
              sources={sources}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LayerDisplay
