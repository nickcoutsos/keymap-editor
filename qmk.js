const childProcess = require('child_process')
const fs = require('fs')
const { renderTable } = require('./layout')

const QMK_PATH = 'qmk_firmware'
const KEYBOARD = 'handwired/dactyl_reduced'

function loadBehaviors() {
  return JSON.parse(fs.readFileSync('./data/qmk-behaviors.json'))
}

function loadKeycodes() {
  return JSON.parse(fs.readFileSync('./data/qmk-keycodes.json'))
}

function loadLayout () {
  const layoutPath = 'application/data/layout.json'
  return JSON.parse(fs.readFileSync(layoutPath))
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
    const rendered = renderTable(layout, layer, {
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
    const rendered = renderTable(layout, layer, {
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
  loadBehaviors,
  loadKeycodes,
  loadKeymap,
  loadLayout,
  generateKeymap,
  exportKeymap
}
