<script>
import filter from 'lodash/filter'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
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
      getSources: () => this.sources
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
      if (isEmpty(this.keymap)) {
        return []
      }

      return this.keymap.layers.map((_, i) => ({
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
    }
  },
  methods: {
    isReady() {
      return (
        Object.keys(this.indexedKeycodes).length > 0 &&
        Object.keys(this.indexedBehaviours).length > 0 &&
        get(this.keymap, 'layers.length', 0) > 0
      )
    },
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
          get(this.sources, ['behaviours', key.parsed.value, 'commands'], [])
        case 'kc':
        default:
          return keycodes
      }
    },
    handleCreateLayer() {
      const layer = this.keymap.layers.length
      const binding = '&trans'
      const makeKeycode = () => ({ value: binding, params: [] })

      const newLayer = times(this.layout.length, makeKeycode)
      const updatedLayerNames = [ ...this.keymap.layer_names, `Layer #${layer}` ]
      const layers = [ ...this.keymap.layers, newLayer ]

      this.$emit('update', { ...this.keymap, layer_names: updatedLayerNames, layers })
    },
    handleUpdateLayer(layerIndex, updatedLayer) {
      const original = this.keymap.layers
      const layers = [
        ...original.slice(0, layerIndex),
        updatedLayer,
        ...original.slice(layerIndex + 1)
      ]

      this.$emit('update', { ...this.keymap, layers })
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
      v-if="isReady()"
      :data-layer="activeLayer"
      :layout="layout"
      :keys="keymap.layers[activeLayer]"
      @update="handleUpdateLayer(activeLayer, $event)"
      class="active"
    />
  </div>
</template>