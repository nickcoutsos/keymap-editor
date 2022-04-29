const isNumber = require('lodash/isNumber')

class InfoValidationError extends Error {
  constructor (errors) {
    super()
    this.name = 'InfoValidationError'
    this.errors = errors
  }
}

function renderTable (layout, layer, opts={}) {
  const {
    useQuotes = false,
    linePrefix = '',
    columnSeparator = ','
  } = opts
  const minWidth = useQuotes ? 9 : 7
  const table = layer.reduce((map, code, i) => {
    // TODO: this would be better as a loop over `layout`, checking for a
    // matching element in the `layer` array. Or, alternatively, an earlier
    // validation that asserts each layer is equal in length to the number of
    // keys in the layout.
    if (layout[i]) {
      const { row = 0, col } = layout[i]
      map[row] = map[row] || []
      map[row][col || map[row].length] = code
    }

    return map
  }, [])

  const columns = Math.max(...table.map(row => row.length))
  const columnIndices = '.'.repeat(columns-1).split('.').map((_, i) => i)
  const columnWidths = columnIndices.map(i => Math.max(
    ...table.map(row => (
      (row[i] || []).length
      + columnSeparator.length
      + (useQuotes ? 2 : 0) // wrapping with quotes adds 2 characters
    ))
  ))

  return table.map((row, rowIndex) => {
    const isLastRow = rowIndex === table.length - 1
    return linePrefix + columnIndices.map(i => {
      const noMoreValues = row.slice(i).every(col => col === undefined)
      const noFollowingValues = row.slice(i+1).every(col => col === undefined)
      const padding = Math.max(minWidth, columnWidths[i])

      if (noMoreValues) return ''
      if (!row[i]) return ' '.repeat(padding + 1)
      const column =  (useQuotes ? `"${row[i]}"` : row[i]).padStart(padding)
      const suffix = (isLastRow && noFollowingValues) ? '' : columnSeparator
      return column + suffix
    }).join('').replace(/\s+$/, '')
  }).join('\n')
}

function validateInfoJson(info) {
  const errors = []

  if (typeof info !== 'object' || info === null) {
    errors.push('info.json root must be an object')
  } else if (!info.layouts) {
    errors.push('info must define "layouts"')
  } else if (typeof info.layouts !== 'object' || info.layouts === null) {
    errors.push('layouts must be an object')
  } else if (Object.values(info.layouts).length === 0) {
    errors.push('layouts must define at least one layout')
  } else {
    for (let name in info.layouts) {
      const layout = info.layouts[name]
      if (typeof layout !== 'object' || layout === null) {
        errors.push(`layout ${name} must be an object`)
      } else if (!Array.isArray(layout.layout)) {
        errors.push(`layout ${name} must define "layout" array`)
      } else {
        const anyKeyHasPosition = layout.layout.some(key => (
          key?.row !== undefined ||
          key?.col !== undefined
        ))

        for (let i in layout.layout) {
          const key = layout.layout[i]
          const keyPath = `layouts[${name}].layout[${i}]`

          if (typeof key !== 'object' || key === null) {
            errors.push(`Key definition at ${keyPath} must be an object`)
          } else {
            const optionalNumberProps = ['u', 'h', 'r', 'rx', 'ry']
            if (!isNumber(key.x)) {
              errors.push(`Key definition at ${keyPath} must include "x" position`)
            }
            if (!isNumber(key.y)) {
              errors.push(`Key definition at ${keyPath} must include "y" position`)
            }
            for (let prop of optionalNumberProps) {
              if (prop in key && !isNumber(key[prop])) {
                errors.push(`Key definition at ${keyPath} optional "${prop}" must be number`)
              }
            }
            for (let prop of ['row', 'col']) {
              if (anyKeyHasPosition && !(prop in key)) {
                errors.push(`Key definition at ${keyPath} is missing "${prop}"`)
              } else if (prop in key && (!Number.isInteger(key[prop]) || key[prop] < 0)) {
                errors.push(`Key definition at ${keyPath} "${prop}" must be a non-negative integer`)
              }
            }
          }
        }
      }
    }
  }

  if (errors.length) {
    throw new InfoValidationError(errors)
  }
}

module.exports = {
  InfoValidationError,
  renderTable,
  validateInfoJson
}
