<script>
import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'
const { loadIndexedKeycodes } = require('../keycodes')

export default {
  components: {
    'keyboard-layout': KeyboardLayout,
    'layer-selector': LayerSelector
  },
  provide() {
    return {
      indexedKeycodes: this.indexedKeycodes
    }
  },
  data() {
    return {
      activeLayer: 0,
      indexedKeycodes: {},
      layout: [],
      layers: []
    }
  },
  beforeMount() {
    loadIndexedKeycodes().then(keycodes => {
      Object.assign(this.indexedKeycodes, keycodes)
    })
  },
  methods: {
    handleSelectLayer(layer) {
      this.activeLayer = layer
    }
  }
}
</script>

<template>
  <div>
    <layer-selector :layers="layers" @select="handleSelectLayer" />
    <div id="layers">
      <keyboard-layout
        v-for="(layer, i) in layers"
        :key="`layer-${i}`"
        :data-layer="i"
        :layout="layout"
        :keys="layer"
        :class="{
          prev: i < activeLayer,
          next: i > activeLayer,
          active: i == activeLayer
        }"
      />
    </div>
  </div>
</template>