<script>
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy'
import times from 'lodash/times'

import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'
import Search from './search.vue'

import {
  parseKeyBinding,
  updateKeyCode,
  encode
} from '../keymap'

export default {
  name: 'keymap',
  components: {
    'layer-selector': LayerSelector,
    'keyboard-layout': KeyboardLayout,
    'search': Search
  },
  props: ['layout', 'keymap'],
  emits: ['keymap-updated'],
  inject: [
    'keycodes',
    'behaviours',
    'indexedKeycodes',
    'indexedBehaviours'
  ],
  provide() {
    return {
      onSelectKey: this.handleSelectKey
    }
  },
  data() {
    return {
      activeLayer: 0,
      editing: null
    }
  },
  computed: {
    layers() {
      return this.keymap.layers.map((_, i) => ({ code: i, description: `Layer ${i}` }))
    },
    sources() {
      return {
        kc: this.indexedKeycodes,
        code: this.indexedKeycodes,
        mod: keyBy(filter(this.keycodes, 'isModifier'), 'code'),
        behaviours: this.indexedBehaviours,
        layer: keyBy(this.layers, 'code')
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
    handleSelectKey(event) {
      const key = this.parsedLayers[event.layer][event.index]
      const targets = this.getSearchTargets(event.param, key)
      this.editing = { ...event, targets }
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
          return this.layers
        case 'mod':
          return filter(keycodes, 'isModifier')
        case 'command':
          return (key.parsed.behaviour.commands || [])
        case 'kc':
        default:
          return keycodes
      }
    },
    handleChangeBinding(source) {
      const { index, codeIndex } = this.editing
      const layer = this.parsedLayers[this.activeLayer]
      const key = layer[index]

      const updatedKey = updateKeyCode(key, codeIndex, source, this.sources)
      const updatedLayer = [...layer.slice(0, index), updatedKey, ...layer.slice(index + 1)]
      const updatedLayers = [
        ...this.parsedLayers.slice(0, this.activeLayer),
        updatedLayer,
        ...this.parsedLayers.slice(this.activeLayer + 1)
      ]

      this.editing = null
      this.$emit('keymap-updated', Object.assign({}, this.keymap, {
        layers: encode(updatedLayers)
      }))
    },
    handleCreateLayer() {
      const layer = this.parsedLayers.length
      const binding = '&trans'

      const updatedLayerNames = [ ...this.keymap.layer_names, `Layer #${layer}` ]
      const updatedLayers = [
        ...this.parsedLayers,
        times(this.layout.length, index => ({
          layer, index, binding, parsed: parseKeyBinding(binding, this.sources)
        }))
      ]

      this.$emit('keymap-updated', Object.assign({}, this.keymap, {
        layer_names: updatedLayerNames,
        layers: encode(updatedLayers)
      }))
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
      class="active"
    />
    <search
      v-if="editing"
      :target="editing.target"
      :code="editing.code"
      :param="editing.param"
      :targets="editing.targets"
      :keycodes="keycodes"
      @select="handleChangeBinding"
      @cancel="editing = null"
    />
  </div>
</template>