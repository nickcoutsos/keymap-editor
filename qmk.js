const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { renderTable } = require('./layout')

const QMK_PATH = 'qmk_firmware'
const KEYBOARD = process.env.KEYBOARD || 'handwired/dactyl_reduced'
const KEYMAP = process.env.KEYMAP || 'generated'
const LAYOUT = process.env.LAYOUT || 'LAYOUT'

function loadBehaviors() {
  return JSON.parse(fs.readFileSync('./data/qmk-behaviors.json'))
}

function loadKeycodes() {
  return JSON.parse(fs.readFileSync('./data/qmk-keycodes.json'))
}

function loadLayout () {
  const layoutPath = path.join(QMK_PATH, 'keyboards', KEYBOARD, 'info.json')
  return JSON.parse(fs.readFileSync(layoutPath)).layouts[LAYOUT].layout
}

function loadKeymap () {
  const keymapPath = path.join(QMK_PATH, 'keyboards', KEYBOARD, 'keymaps', KEYMAP, 'keymap.json')
  return JSON.parse(fs.readFileSync(keymapPath))
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
  const keymapPath = path.join(QMK_PATH, 'keyboards', KEYBOARD, 'keymaps', KEYMAP)
  const makeArgs = [`${KEYBOARD}:generated${flash ? ':avrdude': ''}`]

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(path.join(keymapPath, 'keymap.json'), generatedKeymap.json)
  fs.writeFileSync(path.join(keymapPath, 'keymap.c'), generatedKeymap.code)

  // Note: This doesn't currently work in my own environment. I think that the
  // build target behaves differently if a keymap.json is detected, and in that
  // situation requires the qmk CLI to be installed.
  return childProcess.execFile('make', makeArgs, { cwd: QMK_PATH }, callback)
}

// WIP: recursively search the locally cloned qmk_firmware repo for keyboards
// that have provided info.json (including "layouts"), and keymap.json files if
// they exist. Use this later to dynamically choose a keyboard to edit
function findLayouts() {
  function search(dir, target) {
    const entries = fs.readdirSync(dir, {withFileTypes: true})
    if (entries.find(entry => entry.name === target)) {
      return [dir]
    }

    return entries.reduce((results, entry) => {
      if (entry.isDirectory()) {
        results.push(...search(path.join(dir, entry.name), target))
      }

      return results
    }, [])
  }

  return search(path.join(QMK_PATH, 'keyboards'), 'info.json')
    .reduce((results, keyboard) => {
      let info
      try {
        info = JSON.parse(fs.readFileSync(path.join(keyboard, 'info.json')))
      } catch {
        // Do I want to warn that a keyboard has invalid JSON?
      }
      
      if (info && !!info.layouts) {
        const keymaps = search(keyboard, 'keymap.json')
        results.push({ keyboard, keymaps })
      }

      return results
    }, [])
}

module.exports = {
  loadBehaviors,
  loadKeycodes,
  loadKeymap,
  loadLayout,
  findLayouts,
  generateKeymap,
  exportKeymap
}
