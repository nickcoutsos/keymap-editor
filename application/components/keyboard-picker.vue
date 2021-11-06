<template>
  <div>
    <selector
      v-model="source"
      label="Source"
      :id="source"
      :choices="sourceChoices"
    />

    <github-picker
      v-if="source == 'github'"
      @select="handleKeyboardSelected"
    />
  </div>
</template>

<script>
import compact from 'lodash/compact'

import * as config from '../config'
import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'

import GithubPicker from './github-picker.vue'
import Selector from './selector.vue'

export default {
  name: 'KeyboardPicker',
  components: { GithubPicker, Selector },
  emits: ['select'],
  data() {
    const sourceChoices = compact([
      config.enableLocal ? { id: 'local', name: 'Local' } : null,
      config.enableGitHub ? { id: 'github', name: 'GitHub' } : null
    ])

    const selectedSource = localStorage.getItem('selectedSource')
    const onlySource = sourceChoices.length === 1 ? sourceChoices[0].id : null

    return {
      sourceChoices,
      source: onlySource || (
        sourceChoices.find(source => source.id === selectedSource)
          ? selectedSource.id
          : null
      )
    }
  },
  mounted() {
    if (this.source === 'local') {
      this.fetchLocalKeyboard()
    }
  },
  watch: {
    source(value) {
      localStorage.setItem('selectedSource', value)
      if (value === 'local') {
        this.fetchLocalKeyboard()
      }
    }
  },
  methods: {
    async fetchLocalKeyboard() {
      const { source } = this
      const [layout, keymap] = await Promise.all([
        loadLayout(),
        loadKeymap()
      ])

      this.handleKeyboardSelected({ source, layout, keymap })
    },
    handleKeyboardSelected(event) {
      const { source } = this
      const { layout, keymap, ...rest } = event

      const layerNames = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
      Object.assign(keymap, {
        layer_names: layerNames
      })

      this.$emit('select', { source, layout, keymap, ...rest })
    }
  }
}
</script>
