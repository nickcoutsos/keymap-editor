<script>
import keyBy from 'lodash/keyBy'

import Keymap from './keymap.vue'
import Loader from './loader.vue'

import * as config from '../config'
import * as github from '../github'

import { healthcheck, loadBehaviours } from '../api'
import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'
import { loadKeycodes } from '../keycodes'

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
  computed: {
    githubAuthorized() {
      return !!github.isGitHubAuthorized()
    }
  },
  methods: {
    async loadData() {
      await github.init()
      const loadKeyboardData = async () => {
        if (config.enableGitHub && github.isGitHubAuthorized()) {
          return github.fetchLayoutAndKeymap()
        } else if (config.enableLocal) {
          const [layout, keymap] = await Promise.all([
            loadLayout(),
            loadKeymap()
          ])
          return { layout, keymap }
        } else {
          return { layout: [], keymap: { layers: [] } }
        }
      }

      const [
        keycodes,
        behaviours,
        { layout, keymap }
      ] = await Promise.all([
        loadKeycodes(),
        loadBehaviours(),
        loadKeyboardData()
      ])

      this.keycodes.splice(0, this.keycodes.length, ...keycodes)
      this.behaviours.splice(0, this.behaviours.length, ...behaviours)
      Object.assign(this.indexedKeycodes, keyBy(this.keycodes, 'code'))
      Object.assign(this.indexedBehaviours, keyBy(this.behaviours, 'code'))

      this.layout.splice(0, this.layout.length, ...layout.map(key => (
        { ...key, u: key.u || key.w || 1, h: key.h || 1 }
      )))

      const layerNames = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
      Object.assign(this.layers, keymap.layers)
      Object.assign(this.keymap, keymap, {
        layer_names: layerNames
      })
    },
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
    async doReadyCheck() {
      await healthcheck()
      await this.loadData()
    }
  }
}
</script>

<template>
  <loader :load="doReadyCheck">
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
    </div>
  </loader>
</template>