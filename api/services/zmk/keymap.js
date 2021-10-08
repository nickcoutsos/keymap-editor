const filter = require('lodash/filter')
const get = require('lodash/get')
const map = require('lodash/map')

const paramsPattern = /\((.+)\)/

function parse(code) {
  const params = filter(
    get(code.match(paramsPattern), '[1]', '')
      .split(',')
      .map(s => s.trim())
  )

  return {
    value: code.replace(paramsPattern, ''),
    params: params.map(parse)
  }
}

/**
 * Parse a key binding into a nested structure of values and parameters
 * @param {String} binding the raw bind string (e.g. `&kp LS(A)`)
 * @returns {Array}
 */
function parseKeyBinding (binding) {
  const value = binding.match(/^(&.+?)\b/)[1]
  const paramBinds = filter(binding.replace(/^&.+?\b\s*/, '').split(' '))
  const params = map(paramBinds, parse)

  return { binding, value, params }
}

function parseKeymap (keymap) {
  return Object.assign({}, keymap, {
    layers: keymap.layers.map(layer => {
      return layer.map(binding => {
        return parseKeyBinding(binding, this.sources)
      })
    })
  })
}

const { renderTable } = require('./layout')

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

module.exports = {
  parseKeymap,
  generateKeymap
}
