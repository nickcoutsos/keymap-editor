
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
    >
    </key-thing>
  </div>
</template>

<script>
import Key from './key.vue'
export default {
  props: ['layout', 'keys'],
  components: {
    'key-thing': Key,
  }
}
</script>