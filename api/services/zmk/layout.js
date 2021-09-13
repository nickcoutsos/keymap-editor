function renderTable (layout, layer, opts={}) {
  const {
    useQuotes = false,
    linePrefix = '',
    columnSeparator = ','
  } = opts
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
      + columnSeparator.length
      + (useQuotes ? 2 : 0) // wrapping with quotes adds 2 characters
      + (i === 6 ? 10 : 0) // sloppily add a little space between halves (right half starts at column 6)
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

module.exports = { renderTable }
