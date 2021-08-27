<script>
import filter from 'lodash/filter'
import keyBy from 'lodash/keyBy'
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
  props: ['layout', 'keymap'],
  emits: ['keymap-updated'],
  inject: ['keycodes', 'behaviours', 'indexedBehaviours'],
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
    }
  },
  methods: {
    handleSelectKey(event) {
      const key = this.parsedKeymap[event.layer][event.index]
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
      const key = this.parsedKeymap[this.activeLayer][index]
      updateKeyCode(key, codeIndex, source, this.sources)
      this.editing = null
      this.$emit('keymap-updated', Object.assign({}, this.keymap, {
        layers: encode(this.parsedKeymap)
      }))
    },
    handleCreateLayer() {
      const layer = this.parsedKeymap.length
      const binding = 'KC_TRNS'
      this.parsedKeymap.push(this.layout.map((_, index) => ({
        layer, index, binding, parsed: parseKeyBinding(binding, this.sources)
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

    this.parsedKeymap = this.keymap.layers.map((layer, i) => {
      return layer.map((binding, j) => {
        const parsed = parseKeyBinding(binding, this.sources)
        return { layer: i, index: j, binding, parsed }
      })
    })
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