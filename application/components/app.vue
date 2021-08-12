<script>
import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'
import Search from './search.vue'

const { loadKeycodes, loadIndexedKeycodes } = require('../keycodes')

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
      editingKey: null
    }
  },
  async beforeMount() {
    const keycodes = await loadKeycodes()
    const indexedKeycodes = await loadIndexedKeycodes()
    
    this.keycodes.splice(0, this.keycodes.length, ...keycodes)
    Object.assign(this.indexedKeycodes, indexedKeycodes)
  },
  methods: {
    handleSelectLayer(layer) {
      this.activeLayer = layer
    },
    handleSelectKey(target) {
      this.editingKey = target
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
        v-for="(layer, i) in layers"
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
    />
    <div id="actions">
      <button id="compile" @click="handleCompile">Compile</button>
      <button id="flash">Flash</button>
      <button id="export">Export</button>
      <button id="toggle">⇡</button>
    </div>
  </div>
</template>