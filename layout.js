function renderTable (layout, layer, opts={}) {
  const { useQuotes = false, linePrefix = '' } = opts
  const minWidth = useQuotes ? 9 : 7
  const table = layer.reduce((map, code, i) => {
    const { row, col } = layout[i]
    map[row] = map[row] || []
    map[row][col] = code
    return map
  }, [])

  const columns = Math.max(...table.map(row => row.length))
  const columnIndices = '.'.repeat(columns-1).split('.').map((_, i) => i)
  const columnWidths = columnIndices.map(i => Math.max(
    ...table.map(row => (
      (row[i] || []).length
      + (useQuotes ? 3 : 1) // wrapping with quotes adds 2 characters, comma adds 1
      + (i === 6 ? 10 : 0) // sloppily add a little space between halves (right half starts at column 6)
    ))
  ))

  const block = table.map(row => {
    return linePrefix + columnIndices.map(i => {
      const isLast = row.slice(i).every(col => col === undefined)
      const padding = Math.max(minWidth, columnWidths[i])

      if (isLast) return ''
      if (!row[i]) return ' '.repeat(padding + 1)
      return (useQuotes ? `"${row[i]}"` : row[i]).padStart(padding) + ','
    }).join('')
  }).join('\n')

  return block.substr(0, block.length - 1)
}

module.exports = { renderTable }
