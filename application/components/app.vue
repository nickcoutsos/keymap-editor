<script>
import Keymap from './keymap.vue'
import Terminal from './terminal.vue'

const { loadKeycodes, loadIndexedKeycodes } = require('../keycodes')

export default {
  components: {
    keymap: Keymap,
    terminal: Terminal
  },
  provide() {
    return {
      keycodes: this.keycodes,
      indexedKeycodes: this.indexedKeycodes
    }
  },
  data() {
    return {
      keycodes: [],
      indexedKeycodes: {},
      keymap: {},
      layout: [],
      layers: [],
      terminalOpen: false,
      socket: null
    }
  },
  async beforeMount() {
    const keycodes = await loadKeycodes()
    const indexedKeycodes = await loadIndexedKeycodes()

    this.keycodes.splice(0, this.keycodes.length, ...keycodes)
    Object.assign(this.indexedKeycodes, indexedKeycodes)
  },
  watched: {},
  methods: {
    handleKeymapUpdated(keymap) {
      this.layers.splice(0, this.layers.length, ...keymap.layers)
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
    <keymap
      :layout="layout"
      :layers="layers"
      @keymap-updated="handleKeymapUpdated"
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