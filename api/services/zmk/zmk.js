const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { renderTable } = require('./layout')

const ZMK_PATH = path.join(__dirname, '..', '..', '..', 'zmk-config')
const KEYBOARD = 'dactyl'

function loadBehaviors() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-behaviors.json')))
}

function loadKeycodes() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-keycodes.json')))
}

function loadLayout (layout = 'LAYOUT') {
  const layoutPath = path.join(ZMK_PATH, 'config', 'info.json')
  return JSON.parse(fs.readFileSync(layoutPath)).layouts[layout].layout
}

function loadKeymap () {
  const keymapPath = path.join(ZMK_PATH, 'config', 'keymap.json')
  return JSON.parse(fs.readFileSync(keymapPath))
}

const header = `
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: MIT
 */


/* THIS FILE WAS GENERATED!
 *
 * This file was generated automatically. You may or may not want to
 * edit it directly.
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>
#include <dt-bindings/zmk/outputs.h>

#define BASE 0
#define FPS 1
#define SYMB 2
#define MDIA 3
#define FN 4

`

function generateKeymap (layout, keymap) {
  return {
    code: generateKeymapCode(layout, keymap),
    json: generateKeymapJSON(layout, keymap)
  }
}

function generateKeymapCode (layout, keymap) {
  const { layer_names: names = [] } = keymap
  const layers = keymap.layers.map((layer, i) => {
    const name = i === 0 ? 'default_layer' : `layer_${names[i] || i}`
    const rendered = renderTable(layout, layer, {
      linePrefix: '',
      columnSeparator: ' '
    })

    return `
        ${name} {
            bindings = <
${rendered}
            >;
        };
`
  })

  const keymapOut = `${header}
/ {
    keymap {
        compatible = "zmk,keymap";

${layers.join('')}
    };
};
`

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
  const keymapPath = path.join(ZMK_PATH, 'config')

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(path.join(keymapPath, 'keymap.json'), generatedKeymap.json)
  fs.writeFileSync(path.join(keymapPath, `${KEYBOARD}.keymap`), generatedKeymap.code)

  // Note: This isn't really helpful. In the QMK version I had this actually
  // calling `make` and piping the output in realtime but setting up a ZMK dev
  // environment proved to be more complex than I had patience for, so for now
  // I'm writing changes to a zmk-config repo and counting on the predefined
  // GitHub action to actually compile.
  return childProcess.execFile('git', ['status'], { cwd: ZMK_PATH }, callback)
}

module.exports = {
  loadBehaviors,
  loadKeycodes,
  loadLayout,
  loadKeymap,
  generateKeymap,
  exportKeymap
}
