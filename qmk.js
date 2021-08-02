const childProcess = require('child_process')
const fs = require('fs')

const QMK_PATH = 'qmk_firmware'
const KEYBOARD = 'handwired/dactyl_reduced'

function loadKeymap () {
  const keymapPath = `${QMK_PATH}/keyboards/${KEYBOARD}/keymaps/generated`
  return JSON.parse(fs.readFileSync(`${keymapPath}/__keymap.json`))
}

function generateKeymap (keymap) {
  const layers = keymap.layers.map((layer, i) => {
    return `\n\t[${i}] = ${keymap.layout}(\n\t\t${layer.join(',\n\t\t')}\n\t)`
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

function exportKeymap (keymap, keymapCode, flash, callback) {
  const keymapPath = `${QMK_PATH}/keyboards/${KEYBOARD}/keymaps/generated`
  const makeArgs = [`${KEYBOARD}:generated${flash ? ':avrdude': ''}`]

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(`${keymapPath}/__keymap.json`, JSON.stringify(keymap, null, 2))
  fs.writeFileSync(`${keymapPath}/keymap.c`, keymapCode)

  return childProcess.execFile('make', makeArgs, { cwd: QMK_PATH }, callback)
}

module.exports = {
  loadKeymap,
  generateKeymap,
  exportKeymap
}
