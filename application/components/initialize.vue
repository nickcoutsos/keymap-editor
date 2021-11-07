<script>
import keyBy from 'lodash/keyBy'

import * as github from '../github'

import { healthcheck, loadBehaviours } from '../api'
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
      indexedBehaviours: {}
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
    }
  }
}
</script>

<template>
  <loader :load="doReadyCheck">
    <slot />
  </loader>
</template>
