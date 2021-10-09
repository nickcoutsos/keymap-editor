const filter = require('lodash/filter')
const get = require('lodash/get')
const { renderTable } = require('./layout')

function encodeBindValue(parsed) {
  const params = (parsed.params || []).map(encodeBindValue)
  const paramString = params.length > 0 ? `(${params.join(',')})` : ''
  return parsed.value + paramString
}

function encodeKeyBinding(parsed) {
  const { value, params } = parsed

  return `${value} ${params.map(encodeBindValue).join(' ')}`.trim()
}

function encodeKeymap(parsedKeymap) {
  return Object.assign({}, parsedKeymap, {
    layers: parsedKeymap.layers.map(layer => layer.map(encodeKeyBinding))
  })
}

/**
 * Parse a bind string into a tree of values and parameters
 * @param {String} binding
 * @returns {Object}
 */
function parseKeyBinding(binding) {
  const paramsPattern = /\((.+)\)/

  function parse(code) {
    const value = code.replace(paramsPattern, '')
    const params = get(code.match(paramsPattern), '[1]', '').split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(parse)

    return { value, params }
  }

  const value = binding.match(/^(&.+?)\b/)[1]
  const params = filter(binding.replace(/^&.+?\b\s*/, '')
    .split(' '))
    .map(parse)

  return { value, params }
}

function parseKeymap (keymap) {
  return Object.assign({}, keymap, {
    layers: keymap.layers.map(layer =>  {
      return layer.map(parseKeyBinding)
    })
  })
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

`

function generateKeymap (layout, keymap) {
  const encoded = encodeKeymap(keymap)
  return {
    code: generateKeymapCode(layout, encoded),
    json: generateKeymapJSON(layout, encoded)
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
  encodeKeymap,
  parseKeymap,
  generateKeymap
}
