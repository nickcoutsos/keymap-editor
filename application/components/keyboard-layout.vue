
<template>
  <div class="layer">
    <key-thing
      v-for="(key, i) in layout"
      :key="i"
      :position="position(key)"
      :rotation="rotation(key)"
      :size="size(key)"
      :label="key.label"
      :parsed="keys[i].parsed"
      @update="handleUpdateBind(i, $event)"
    >
    </key-thing>
  </div>
</template>

<script>
import map from 'lodash/map'

import Key from './key.vue'

export default {
  props: ['layout', 'keys'],
  emits: ['update'],
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
    handleUpdateBind(keyIndex, parsed) {
      const parsedKeys = map(this.keys, 'parsed')
      this.$emit('update', [
        ...parsedKeys.slice(0, keyIndex),
        { ...parsedKeys[keyIndex], ...parsed },
        ...parsedKeys.slice(keyIndex + 1)
      ])
    }
  }
}
</script>

<style>
.layer {
  position: relative;
  left: 40px;
  top: 40px;
}
</style>