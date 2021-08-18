const childProcess = require('child_process')
const fs = require('fs')
const { renderTable } = require('./layout')

const ZMK_PATH = 'zmk-config'
const KEYBOARD = 'dactyl'

function loadLayout () {
  const layoutPath = 'application/data/layout.json'
  return JSON.parse(fs.readFileSync(layoutPath))
}

function loadKeymap () {
  const keymapPath = `${ZMK_PATH}/config`
  return JSON.parse(fs.readFileSync(`${keymapPath}/__keymap.json`))
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
  const layers = keymap.layers.map((layer, i) => {
    const name = i === 0 ? 'default_layer' : `layer_${i}`
    const rendered = renderTable(layout, layer, {
      linePrefix: ''
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
  const keymapPath = `${ZMK_PATH}/config`

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(`${keymapPath}/__keymap.json`, generatedKeymap.json)
  fs.writeFileSync(`${keymapPath}/${KEYBOARD}.keymap`, generatedKeymap.code)

  return childProcess.execFile('git', ['status'], { cwd: ZMK_PATH }, callback)
}

module.exports = {
  loadLayout,
  loadKeymap,
  generateKeymap,
  exportKeymap
}
