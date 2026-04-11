import { useMemo } from 'react'
import layoutData from '../data/totem.json'
import { getKeyBoundingBox } from '../key-units'

const layout = layoutData.layouts.LAYOUT.layout
const SCALE = 70 // DEFAULT_SIZE + DEFAULT_PADDING from key-units.js

// Precompute full keyboard bounding box once
const bboxAll = layout.map(key =>
  getKeyBoundingBox(
    { x: key.x, y: key.y },
    { u: key.w || 1, h: key.h || 1 },
    { x: key.rx, y: key.ry, a: key.r }
  )
)
const FULL_W = Math.max(...bboxAll.map(b => b.max.x))
const FULL_H = Math.max(...bboxAll.map(b => b.max.y))

/**
 * A scaled-down SVG rendering of the Totem keyboard.
 * @param {number[]} positions  - highlighted key indices
 * @param {function} onToggle   - if provided, keys are clickable
 * @param {number}   width      - display width in px (height is auto)
 * @param {boolean}  showIndex  - render key index numbers when no label available
 * @param {string[]} labels     - per-key label text (overrides showIndex)
 */
function MiniKeyboard({ positions = [], onToggle, width = 200, showIndex = false, labels = [] }) {
  const height = Math.ceil((FULL_H / FULL_W) * width)
  const posSet = useMemo(() => new Set(positions), [positions])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${FULL_W} ${FULL_H}`}
      style={{ display: 'block' }}
    >
      {layout.map((key, i) => {
        const px = key.x * SCALE
        const py = key.y * SCALE
        const kw = (key.w || 1) * SCALE - 5
        const kh = (key.h || 1) * SCALE - 5
        const r = key.r || 0
        const rcx = (key.rx !== undefined ? key.rx : key.x) * SCALE
        const rcy = (key.ry !== undefined ? key.ry : key.y) * SCALE
        const selected = posSet.has(i)
        const displayText = labels[i] !== undefined ? labels[i] : (showIndex ? String(i) : null)

        return (
          <g
            key={i}
            transform={r ? `rotate(${r}, ${rcx}, ${rcy})` : undefined}
            onClick={() => onToggle && onToggle(i)}
            style={{ cursor: onToggle ? 'pointer' : 'default' }}
          >
            <rect
              x={px} y={py} width={kw} height={kh}
              fill={selected ? '#4a9eff' : '#3a3a3a'}
              stroke={selected ? '#6ab4ff' : '#555'}
              strokeWidth={selected ? 4 : 2}
              rx={4}
            />
            {displayText && (
              <text
                x={px + kw / 2}
                y={py + kh / 2 + 7}
                textAnchor="middle"
                fontSize={showIndex && !labels[i] ? 20 : 16}
                fill={selected ? 'white' : '#bbb'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {displayText}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default MiniKeyboard
