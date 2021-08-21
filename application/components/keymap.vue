<script>
import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'
import Search from './search.vue'

import { loadIndexedBehaviours, loadIndexedKeycodes } from '../keycodes'
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
  props: ['layout', 'layers'],
  emits: ['keymap-updated'],
  inject: ['keycodes', 'indexedBehaviours'],
  provide() {
    return {
      onSelectKey: this.handleSelectKey
    }
  },
  data() {
    return {
      activeLayer: 0,
      indexedKeycodes: {},
      parsedKeymap: {},
      editing: null
    }
  },
  methods: {
    handleSelectKey(event) {
      const targets = this.getSearchTargets(event.param)
      this.editing = { ...event, targets }
    },
    getSearchTargets(param) {
      const { keycodes, layers } = this
      switch (param) {
        case 'layer':
          return layers.map((_, i) => ({ code: i, description: `Layer ${i}` }))
        case 'mod':
          return keycodes.filter(keycode => keycode.isModifier)
        case 'kc':
        default:
          return keycodes
      }
    },
    handleChangeBinding(code) {
      const { index, codeIndex, param } = this.editing
      const key = this.parsedKeymap[this.activeLayer][index]
      updateKeyCode(key, codeIndex, code, param, this.indexedKeycodes)
      this.editing = null
      this.$emit('keymap-updated', Object.assign({}, this.keymap, {
        layers: encode(this.parsedKeymap)
      }))
    },
    handleCreateLayer() {
      const layer = this.parsedKeymap.length
      const binding = 'KC_TRNS'
      this.parsedKeymap.push(this.layout.map((_, index) => ({
        layer, index, binding, parsed: parseKeyBinding(binding, this.indexedKeycodes, this.indexedBehaviours)
      })))

      this.$emit('keymap-updated', Object.assign({}, this.keymap, {
        layers: encode(this.parsedKeymap)
      }))
    }
  },
  async beforeMount() {
    const indexedKeycodes = await loadIndexedKeycodes()
    const indexedBehaviours = await loadIndexedBehaviours()
    Object.assign(this.indexedKeycodes, indexedKeycodes)
    Object.assign(this.indexedBehaviours, indexedBehaviours)

    this.parsedKeymap = this.layers.map((layer, i) => {
      return layer.map((binding, j) => {
        const parsed = parseKeyBinding(binding, indexedKeycodes, indexedBehaviours)
        return { layer: i, index: j, binding, parsed }
      })
    })
  }
}
</script>

<template>
  <div>
    <layer-selector
      :layers="layers"
      :activeLayer="activeLayer"
      @select="activeLayer = $event"
      @new-layer="handleCreateLayer"
    />
    <keyboard-layout
      v-if="parsedKeymap[activeLayer]"
      :data-layer="activeLayer"
      :layout="layout"
      :keys="parsedKeymap[activeLayer]"
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