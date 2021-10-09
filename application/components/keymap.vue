<script>
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy'
import times from 'lodash/times'

import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'

import {
  parseKeyBinding,
  encode
} from '../keymap'

export default {
  name: 'keymap',
  components: {
    'layer-selector': LayerSelector,
    'keyboard-layout': KeyboardLayout
  },
  props: ['layout', 'keymap'],
  emits: ['update'],
  inject: [
    'keycodes',
    'behaviours',
    'indexedKeycodes',
    'indexedBehaviours'
  ],
  provide() {
    return {
      getSearchTargets: this.getSearchTargets,
      sources: this.sources
    }
  },
  data() {
    return {
      activeLayer: 0,
      editing: null
    }
  },
  computed: {
    availableLayers() {
      return !isEmpty(this.keymap) && this.keymap.layers.map((_, i) => ({
        code: i,
        description: this.keymap.layer_names[i] || `Layer ${i}`
      }))
    },
    sources() {
      return {
        kc: this.indexedKeycodes,
        code: this.indexedKeycodes,
        mod: keyBy(filter(this.keycodes, 'isModifier'), 'code'),
        behaviours: this.indexedBehaviours,
        layer: keyBy(this.availableLayers, 'code')
      }
    },
    parsedLayers() {
      const ready = (
        !isEmpty(this.keymap) &&
        !isEmpty(this.indexedBehaviours) &&
        !isEmpty(this.indexedKeycodes)
      )

      return ready ? this.keymap.layers.map((layer, i) => {
        return layer.map((binding, j) => {
          const parsed = parseKeyBinding(binding, this.sources)
          return { layer: i, index: j, binding, parsed }
        })
      }) : []
    }
  },
  methods: {
    getSearchTargets(param, key) {
      const { keycodes } = this
      if (param.enum) {
        return param.enum.map(v => ({ code: v }))
      }
      switch (param) {
        case 'behaviour':
          return this.behaviours
        case 'layer':
          return this.availableLayers
        case 'mod':
          return filter(keycodes, 'isModifier')
        case 'command':
          return (key.parsed.behaviour.commands || [])
        case 'kc':
        default:
          return keycodes
      }
    },
    handleCreateLayer() {
      const layer = this.parsedLayers.length
      const binding = '&trans'
      const makeKeycode = index => ({
        layer, index, binding, parsed: parseKeyBinding(binding, this.sources)
      })

      const newLayer = times(this.layout.length, makeKeycode)
      const updatedLayerNames = [ ...this.keymap.layer_names, `Layer #${layer}` ]
      const updatedLayers = [ ...this.parsedLayers, newLayer ]

      this.$emit('update', {
        ...this.keymap,
        layer_names: updatedLayerNames,
        layers: encode(updatedLayers)
      })
    },
    handleUpdateLayer(layerIndex, updatedLayer) {
      this.$emit('update', {
        ...this.keymap,
        layers: encode([
          ...this.parsedLayers.slice(0, layerIndex),
          updatedLayer,
          ...this.parsedLayers.slice(layerIndex + 1)
        ])
      })
    }
  }
}
</script>

<template>
  <div>
    <layer-selector
      :layers="keymap.layer_names"
      :activeLayer="activeLayer"
      @select="activeLayer = $event"
      @new-layer="handleCreateLayer"
    />
    <keyboard-layout
      v-if="parsedLayers[activeLayer]"
      :data-layer="activeLayer"
      :layout="layout"
      :keys="parsedLayers[activeLayer]"
      @update="handleUpdateLayer(activeLayer, $event)"
      class="active"
    />
  </div>
</template>