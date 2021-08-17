<script>
import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'
import Search from './search.vue'
import Terminal from './terminal.vue'

const { loadKeycodes, loadIndexedKeycodes } = require('../keycodes')

export default {
  components: {
    'keyboard-layout': KeyboardLayout,
    'layer-selector': LayerSelector,
    search: Search,
    terminal: Terminal
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
      editingKey: null,
      terminalOpen: false,
      socket: null
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
          parsed: this.parseKeyBinding(key, indexedKeycodes)
        }
      })
    })

    this.parsedLayers = parsedLayers
  },
  watched: {},
  methods: {
    handleSelectLayer(layer) {
      this.activeLayer = layer
    },
    handleSelectKey(target) {
      this.editingKey = target
    },
    handleCancelKeySelection() { this.editingKey = null },
    handleConfirmKeySelection(newCode) {
      const { layer, index, codeIndex, param } = this.editingKey
      const key = this.parsedLayers[layer][index]
      const keyValue = key.parsed._index[codeIndex]

      keyValue.value = newCode
      delete keyValue.params
      if (param !== 'layer') {
        const keycode = this.indexedKeycodes[newCode]
        keyValue.keycode = keycode
        if (keycode.params.length > 0) {
          keyValue.params = keycode.params.map(() => ({
            value: 'KC_TRNS',
            keycode: this.indexedKeycodes.KC_TRNS
          }))
        }
      }
      key.parsed._index = this.indexKeyBinding(key.parsed)

      this.editingKey = null
    },
    handleCompile() {
      function encode(parsed) {
        const params = (parsed.params || []).map(encode)
        const paramString = params.length > 0 ? `(${params.join(',')})` : ''
        return parsed.value + paramString
      }

      const layers = this.parsedLayers.map(layer => layer.map(key => encode(key.parsed)))
      const keymap = Object.assign({}, this.keymap, { layers })

      // terminal.clear()
      // toggleTerminal(true)
      fetch('/keymap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(keymap)
      })
    },
    parseKeyBinding(binding, indexedKeycodes) {
      const paramsPattern = /\((.+)\)/

      function parse(code, parent) {
        const value = code.replace(paramsPattern, '')
        const keycode = indexedKeycodes[value]
        const params = (code.match(paramsPattern) || ['', ''])[1]
          .split(',')
          .map(s => s.trim())
          .filter(s => !!s)

        const tree = { value, keycode, parent }

        if (keycode && keycode.params.length > 0) {
          tree.fn = value
          tree.params = keycode.params.map((_, i) => {
            return parse(params[i] || 'KC_TRANS', tree)
          })
        }

        return tree
      }

      const parsed = parse(binding)
      parsed._index = this.indexKeyBinding(parsed)
      return parsed
    },
    indexKeyBinding(key) {
      let index = []

      function traverse(tree) {
        tree.index = index.length
        index.push(tree)
        const params = tree.params || []
        params.forEach(traverse)
      }
      traverse(key)

      return index
    }
  }
}
</script>

<template>
  <div>
    <layer-selector :layers="layers" :activeLayer="activeLayer" @select="handleSelectLayer" />
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
    <terminal
      :open="terminalOpen"
      :socket="socket"
      @new-message="terminalOpen = true"
    />
    <div id="actions">
      <button id="compile" @click="handleCompile">Compile</button>
      <button id="flash">Flash</button>
      <button id="export">Export</button>
      <button id="toggle" @click="terminalOpen = !terminalOpen">{{ !terminalOpen ? '⇡' : '⇣' }}</button>
    </div>
  </div>
</template>