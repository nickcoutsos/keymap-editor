import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

import Key from './Keys/Key'

const position = key => pick(key, ['x', 'y'])
const rotation = key => {
  const { rx, ry, r } = key
  return { x: rx, y: ry, a: r }
}
const size = key => {
  const { w = 1, u = w, h = 1 } = key
  return { u, h }
}

function KeyboardLayout(props) {
  const { layout, bindings, onUpdate } = props
  const normalized = layout.map((_, i) => (
    bindings[i] || {
      value: '&none',
      params: []
    }
  ))

  const handleUpdateBind = useMemo(() => function(keyIndex, updateBinding) {
    onUpdate([
      ...normalized.slice(0, keyIndex),
      updateBinding,
      ...normalized.slice(keyIndex + 1)
    ])
  }, [normalized, onUpdate])

  return (
    <div style={{ position: 'relative' }}>
      {layout.map((key, i) => (
        <Key
          key={i}
          position={position(key)}
          rotation={rotation(key)}
          size={size(key)}
          label={key.label}
          value={normalized[i].value}
          params={normalized[i].params}
          onUpdate={bind => handleUpdateBind(i, bind)}
        />
      ))}
    </div>
  )
}

KeyboardLayout.propTypes = {
  layout: PropTypes.array.isRequired,
  bindings: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default KeyboardLayout
