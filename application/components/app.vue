<script>
import KeyboardLayout from './keyboard-layout.vue'
import LayerSelector from './layer-selector.vue'

export default {
  components: {
    'keyboard-layout': KeyboardLayout,
    'layer-selector': LayerSelector
  },
  data() {
    return {
      activeLayer: 0,
      layout: [],
      layers: []
    }
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