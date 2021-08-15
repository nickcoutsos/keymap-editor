
<template>
  <div class="layer">
    <key-thing
      v-for="(key, i) in layout"
      :key="i"
      :position="position(key)"
      :rotation="rotation(key)"
      :size="size(key)"
      :label="key.label"
      :code="keys[i]"
      @select-key="handleSelectKey(key, i, $event)"
    >
    </key-thing>
  </div>
</template>

<script>
import Key from './key.vue'
export default {
  props: ['layout', 'keys'],
  inject: ['onSelectKey'],
  components: {
    'key-thing': Key,
  },
  methods: {
    position(key) {
      const { x, y } = key
      return { x, y }
    },
    rotation(key) {
      const { rx, ry, r } = key
      return { x: rx, y: ry, a: r }
    },
    size(key) {
      const { u, h } = key
      return { u, h }
    },
    handleSelectKey(key, index, { target, param,  code }) {
      this.onSelectKey({ key, index, target, param, code })
    }
  }
}
</script>