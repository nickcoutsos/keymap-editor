
<template>
  <div class="layer">
    <key-thing
      v-for="(key, i) in layout"
      :key="i"
      :x="key.x"
      :y="key.y"
      :rx="key.rx"
      :ry="key.ry"
      :r="key.r"
      :u="key.u"
      :h="key.h"
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
    handleSelectKey(key, index, { target, code }) {
      this.onSelectKey({ key, index, target, code })
    }
  }
}
</script>