<script>
import Keymap from './keymap.vue'
import Loader from './loader.vue'

import * as config from '../config'
import * as github from '../github'
import { healthcheck, loadBehaviours } from '../api'
const { loadKeycodes, loadIndexedKeycodes, loadIndexedBehaviours } = require('../keycodes')

export default {
  components: {
    keymap: Keymap,
    Loader
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
    handleUpdateKeymap(keymap) {
      Object.assign(this.keymap, keymap)
    },
    handleGithubAuthorize() {
      github.beginLoginFlow()
    },
    handleCommitChanges() {
      github.commitChanges(this.layout, this.keymap)
    },
    handleCompile() {
      fetch('/keymap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.keymap)
      })
    },
    doHealthCheck() {
      return healthcheck()
    }
  }
}
</script>

<template>
  <loader :load="doHealthCheck">
    <keymap :layout="layout" :keymap="keymap" @update="handleUpdateKeymap" />
    <div id="actions">
      <button
        v-if="config.enableLocal"
        v-text="`Save Local`"
        id="compile"
        @click="handleCompile"
      />
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
  </loader>
</template>