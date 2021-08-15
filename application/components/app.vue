<script>
import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'
import Search from './search.vue'

const { loadKeycodes, loadIndexedKeycodes } = require('../keycodes')

const paramsPattern = /\((.+)\)/

function parse(code, indexedKeycodes, index=0) {
  const value = code.replace(paramsPattern, '')
  const keycode = indexedKeycodes[value]
  const params = (code.match(paramsPattern) || ['', ''])[1]
    .split(',')
    .map(s => s.trim())
    .filter(s => !!s)

  return params.length === 0
    ? { value, keycode, index }
    : { value, keycode, index, fn: value, params: params.reduce((params, param) => {
      const sub = parse(param, indexedKeycodes, index + 1)
      index = sub.index + 1
      params.push(sub)
      return params
    }, []) }
}

export default {
  components: {
    'keyboard-layout': KeyboardLayout,
    'layer-selector': LayerSelector,
    search: Search
  },
  provide() {
    return {
      keycodes: this.keycodes,
      indexedKeycodes: this.indexedKeycodes,
      onSelectKey: this.handleSelectKey
    }
  },
  data() {
    return {
      activeLayer: 0,
      keycodes: [],
      indexedKeycodes: {},
      keymap: {},
      layout: [],
      layers: [],
      parsedLayers: [],
      editingKey: null
    }
  },
  async beforeMount() {
    const keycodes = await loadKeycodes()
    const indexedKeycodes = await loadIndexedKeycodes()
    
    this.keycodes.splice(0, this.keycodes.length, ...keycodes)
    Object.assign(this.indexedKeycodes, indexedKeycodes)

    const parsedLayers = this.layers.map((layer, i) => {
      return layer.map((key, j) => {
        return {
          layer: i,
          index: j,
          binding: key,
          parsed: parse(key, indexedKeycodes)
        }
      })
    })

    this.parsedLayers = parsedLayers
    console.log(this.parsedLayers)
  },
  watched: {},
  methods: {
    handleSelectLayer(layer) {
      this.activeLayer = layer
    },
    handleSelectKey(target) {
      this.editingKey = target
    },
    processKeymap() {},
    handleCancelKeySelection() { this.editingKey = null },
    handleConfirmKeySelection(newCode) {
      const { layer, index, codeIndex, code } = this.editingKey
      const keymap = this.layers[this.activeLayer]
      console.log('want to edit', {
        layer,
        index,
        codeIndex,
        code,
        newCode
      })
      keymap[index] = keymap[index].replace(code, newCode)
      this.editingKey = null
    },
    handleCompile() {
      const keymap = Object.assign({}, this.keymap, { layers: this.layers })

      // terminal.clear()
      // toggleTerminal(true)
      fetch('/keymap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(keymap)
      })
    }
  }
}
</script>

<template>
  <div>
    <layer-selector :layers="layers" @select="handleSelectLayer" />
    <div id="layers">
      <keyboard-layout
        v-for="(layer, i) in parsedLayers"
        :key="`layer-${i}`"
        :data-layer="i"
        :layout="layout"
        :keys="layer"
        :class="{
          prev: i < activeLayer,
          next: i > activeLayer,
          active: i == activeLayer
        }"
      />
    </div>
    <search
      v-if="editingKey"
      :target="editingKey.target"
      :code="editingKey.code"
      :param="editingKey.param"
      @select="handleConfirmKeySelection"
      @cancel="handleCancelKeySelection"
    />
    <div id="actions">
      <button id="compile" @click="handleCompile">Compile</button>
      <button id="flash">Flash</button>
      <button id="export">Export</button>
      <button id="toggle">⇡</button>
    </div>
  </div>
</template>