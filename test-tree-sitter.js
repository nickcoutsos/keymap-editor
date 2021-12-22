const { filter } = require('lodash')
const TreeSitter = require('web-tree-sitter')

const keymapText = `
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: MIT
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/outputs.h>
#include <dt-bindings/zmk/bt.h>

#define DEF 0
#define LWR 1
#define RSE 2
#define ADJ 3

&lt { quick_tap_ms = <200>; };
&mt { quick_tap_ms = <200>; };

/ {
  combos {
    compatible = "zmk,combos";
    combo_btclr {
      timeout-ms = <TIMEOUT>;
      key-positions = <1 6>;
      bindings = <&bt BT_CLR>;
    };
    combo_reset {
      timeout-ms = <TIMEOUT>;
      key-positions = <1 3>;
      bindings = <&reset>;
    };
  };
  
  sensors {
    compatible = "zmk,keymap-sensors";
    sensors = <&encoder_1 &encoder_2>;
  };
  
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "foo";
      bindings = <&kp TAB &kp Q &kp W &kp E &kp R &kp T>;
    };

    layer_fps {
      bindings = <&trans &trans &kp Q &kp W &kp E &kp R>;
      sensor-bindings = <&inc_dec_kp C_VOL_UP C_VOL_DN &inc_dec_kp PG_UP PG_DN>;
    };

    layer_numpad {
      bindings = <&trans &trans &kp GRAVE &kp MINUS &kp EQUAL &trans>;
    };
  };
};
`

function findNodeProperty(node, property) {
  return node.children.find(node => (
    node.type === 'property' &&
    node.children[0].text === property
  ))
}

function findChildrenByIdentifier(node, nameOrMatch) {
  const match = typeof nameOrMatch === 'string'
    ? text => text === nameOrMatch
    : nameOrMatch

  return node.namedChildren.filter(node => (
    node.type === 'node' &&
    node.children.find(sub => (
      sub.type === 'identifier' &&
      match(sub.text)
    ))
  ))
}

function findChildByIdentifier(node, nameOrMatch) {
  return findChildrenByIdentifier(node, nameOrMatch)[0]
}

function parseLayer(node) {
  const identifier = node.children[0].text
  const labelNode = node.children.find(node => node.type === 'property' && node.children[0].text === 'label')
  const bindingsNode = findNodeProperty(node, 'bindings')
  const sensorBindingsNode = findNodeProperty(node, 'sensor-bindings')

  function parseBindings(node) {
    return node.children[2].children.slice(1, -1)
      .map(node => node.text)
      .reduce((bindings, node) => {
        if (node.startsWith('&')) {
          bindings.push([node])
        } else {
          const last = bindings[bindings.length - 1]
          last.push(node)
        }

        return bindings
      }, [])
      .map(binding => binding.join(' '))
  }

  return Object.assign(
    { identifier },
    labelNode && { label: labelNode.children[2].text.slice(1, -1) },
    bindingsNode && {
      bindings: parseBindings(bindingsNode)
    },
    sensorBindingsNode && {
      sensorBindings: parseBindings(sensorBindingsNode)
    }
  )
}

function listNodes(nodes, opts = {}) {
  const { stripNewlines = true, limit = 50 } = opts
  for (let node of nodes) {
    value = node.text
    if (stripNewlines) value = value.replace(/\n/g, '')
    if (limit) value = value.slice(0, limit)

    console.log(node.id, `[${node.type}]`, '->', value)
  }
}

async function main() {
  await TreeSitter.init()
  const parser = new TreeSitter()
  const deviceTree = await TreeSitter.Language.load('./tree-sitter-devicetree.wasm')
  parser.setLanguage(deviceTree)

  const tree = parser.parse(keymapText)
  const root = findChildByIdentifier(tree.rootNode, '/')  
  const keymap = findChildByIdentifier(root, 'keymap')
  const layers = keymap.namedChildren
    .filter(node => node.type === 'node')
    .map(layer => parseLayer(layer))

  const includes = filter(tree.rootNode.children, { type: 'preproc_include' })
  const behaviourIncludes = includes.filter(node => node.children[1].text.startsWith('<dt-bindings'))
  
  listNodes(behaviourIncludes)
  console.log(layers)
}

main()
