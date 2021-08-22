<script>
import Keymap from './keymap.vue'
import Terminal from './terminal.vue'

import * as config from '../config'
const { loadKeycodes, loadIndexedKeycodes, loadIndexedBehaviours } = require('../keycodes')

export default {
  components: {
    keymap: Keymap,
    terminal: Terminal
  },
  provide() {
    return {
      keycodes: this.keycodes,
      indexedKeycodes: this.indexedKeycodes,
      indexedBehaviours: this.indexedBehaviours
    }
  },
  data() {
    return {
      keycodes: [],
      indexedKeycodes: {},
      behaviours: [],
      indexedBehaviours: {},
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
    Object.assign(this.indexedBehaviours, await loadIndexedBehaviours())
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
      fetch(`/keymap?${config.library}`, {
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
      :keymap="keymap"
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