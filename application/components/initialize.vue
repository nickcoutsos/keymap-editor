<script>
import keyBy from 'lodash/keyBy'

import * as config from '../config'
import * as github from '../github'

import { healthcheck, loadBehaviours } from '../api'
import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'
import { loadKeycodes } from '../keycodes'

import Loader from './loader.vue'

export default {
  name: 'Initialize',
  components: { Loader },
  data () {
    return {
      keycodes: [],
      behaviours: [],
      indexedKeycodes: {},
      indexedBehaviours: {},
      repositories: [],
      selectedRepository: null,
      keymap: {},
      layers: [],
      layout: []
    }
  },
  provide() {
    return {
      keycodes: this.keycodes,
      behaviours: this.behaviours,
      indexedKeycodes: this.indexedKeycodes,
      indexedBehaviours: this.indexedBehaviours
    }
  },
  methods: {
    async doReadyCheck() {
      await healthcheck()
      await this.loadAppData()
      await this.loadKeyboardData()
    },
    async loadAppData () {
      await github.init()
      const [ keycodes, behaviours ] = await Promise.all([
        loadKeycodes(),
        loadBehaviours()
      ])

      this.keycodes.splice(0, this.keycodes.length, ...keycodes)
      this.behaviours.splice(0, this.behaviours.length, ...behaviours)
      Object.assign(this.indexedKeycodes, keyBy(this.keycodes, 'code'))
      Object.assign(this.indexedBehaviours, keyBy(this.behaviours, 'code'))
    },
    async loadKeyboardData() {
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

      const { layout, keymap } = await loadKeyboardData()

      this.layout.splice(0, this.layout.length, ...layout.map(key => (
        { ...key, u: key.u || key.w || 1, h: key.h || 1 }
      )))

      const layerNames = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
      Object.assign(this.layers, keymap.layers)
      Object.assign(this.keymap, keymap, {
        layer_names: layerNames
      })
    }
  }
}
</script>

<template>
  <loader :load="doReadyCheck">
    <slot
      :keymap="keymap"
      :layers="layers"
      :layout="layout"
    />
  </loader>
</template>