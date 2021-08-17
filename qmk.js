const childProcess = require('child_process')
const fs = require('fs')

const QMK_PATH = 'qmk_firmware'
const KEYBOARD = 'handwired/dactyl_reduced'

function loadLayout () {
  const layoutPath = 'application/data/layout.json'
  return JSON.parse(fs.readFileSync(layoutPath))
}

function renderLayer (layout, layer, opts={}) {
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


function loadKeymap () {
  const keymapPath = `${QMK_PATH}/keyboards/${KEYBOARD}/keymaps/generated`
  return JSON.parse(fs.readFileSync(`${keymapPath}/__keymap.json`))
}

function generateKeymap (layout, keymap) {
  return {
    code: generateKeymapCode(layout, keymap),
    json: generateKeymapJSON(layout, keymap)
  }
}

function generateKeymapCode (layout, keymap) {
  const layers = keymap.layers.map((layer, i) => {
    const rendered = renderLayer(layout, layer, {
      linePrefix: '\t\t'
    })

    return `\n\t[${i}] = ${keymap.layout}(\n${rendered}\n\t)`
  })

  const keymapOut = `#include QMK_KEYBOARD_H

/* THIS FILE WAS GENERATED!
 *
 * This file was generated automatically. You may or may not want to
 * edit it directly.
 */

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
  ${layers}
};`

  return keymapOut
}

function generateKeymapJSON (layout, keymap) {
  const base = JSON.stringify(Object.assign({}, keymap, { layers: null }), null, 2)
  const layers = keymap.layers.map(layer => {
    const rendered = renderLayer(layout, layer, {
      useQuotes: true,
      linePrefix: '      '
    })

    return `[\n${rendered}\n    ]`
  })

  return base.replace('"layers": null', `"layers": [\n    ${layers.join(', ')}\n  ]`)
}

function exportKeymap (generatedKeymap, flash, callback) {
  const keymapPath = `${QMK_PATH}/keyboards/${KEYBOARD}/keymaps/generated`
  const makeArgs = [`${KEYBOARD}:generated${flash ? ':avrdude': ''}`]

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(`${keymapPath}/__keymap.json`, generatedKeymap.json)
  fs.writeFileSync(`${keymapPath}/keymap.c`, generatedKeymap.code)

  return childProcess.execFile('make', makeArgs, { cwd: QMK_PATH }, callback)
}

module.exports = {
  loadKeymap,
  loadLayout,
  generateKeymap,
  exportKeymap
}
