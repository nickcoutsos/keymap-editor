<script>
import Keymap from './keymap.vue'
import Terminal from './terminal.vue'

import * as config from '../config'
import * as github from '../github'
import { loadBehaviours } from '../api'
const { loadKeycodes, loadIndexedKeycodes, loadIndexedBehaviours } = require('../keycodes')

export default {
  components: {
    keymap: Keymap,
    terminal: Terminal
  },
  provide() {
    return {
      keycodes: this.keycodes,
      behaviours: this.behaviours,
      indexedKeycodes: this.indexedKeycodes,
      indexedBehaviours: this.indexedBehaviours
    }
  },
  data() {
    return {
      config,
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
    this.behaviours.splice(0, this.behaviours.length, ...await loadBehaviours())
    Object.assign(this.indexedKeycodes, indexedKeycodes)
    Object.assign(this.indexedBehaviours, await loadIndexedBehaviours())
  },
  computed: {
    githubAuthorized() {
      return !!github.isGitHubAuthorized()
    }
  },
  methods: {
    handleKeymapUpdated(keymap) {
      this.layers.splice(0, this.layers.length, ...keymap.layers)
    },
    handleGithubAuthorize() {
      localStorage.removeItem('auth_token')
      location.href = `${config.apiBaseUrl}/github/authorize`
    },
    handleCommitChanges() {
      const keymap = Object.assign({}, this.keymap, { layers: this.layers })
      github.commitChanges(this.layout, keymap)
    },
    handleCompile() {
      const keymap = Object.assign({}, this.keymap, { layers: this.layers })

      // terminal.clear()
      // toggleTerminal(true)
      fetch(`/keymap?firmware=${config.library}`, {
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
      <button id="compile" @click="handleCompile">Save Local</button>
      <button
        v-if="config.enableGitHub && !githubAuthorized"
        v-text="`Authorize GitHub`"
        @click="handleGithubAuthorize"
        title="Install as a GitHub app to edit a zmk-config repository."

      />
      <button
        v-if="config.enableGitHub && githubAuthorized"
        v-text="`Commit Changes`"
        @click="handleCommitChanges"
        title="Commit keymap changes to GitHub repository"
      />
      <button id="toggle" @click="terminalOpen = !terminalOpen">{{ !terminalOpen ? '⇡' : '⇣' }}</button>
    </div>
  </div>
</template>