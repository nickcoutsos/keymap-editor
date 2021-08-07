<template>
  <div
    class="key"
    :class="[uClass, hClass]"
    :data-label="label"
    :data-u="u"
    :data-h="h"
    :style="positioningStyle"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <key-code :code="code" />
  </div>
</template>

<script>
import KeyCode from './key-code.vue'

export default {
  props: ['x', 'y', 'rx', 'ry', 'r', 'u', 'h', 'label', 'code'],
  components: { 'key-code': KeyCode },
  computed: {
    uClass() { return `key-${this.u}u` },
    hClass() { return `key-${this.h}h` },
    positioningStyle() {
      const x = this.x * 65
      const y = this.y * 65
      const rx = (this.x - (this.rx || this.x)) * -65
      const ry = (this.y - (this.ry || this.y)) * -65

      return {
        top: `${y}px`,
        left: `${x}px`,
        transformOrigin: `${rx}px ${ry}px`,
        transform: `rotate(${this.r || 0}deg)`
      }
    }
  },
  methods: {
    onMouseOver(event) {
      const old = document.querySelector('.highlight')
      old && old.classList.remove('highlight')
      event.target.classList.add('highlight')
    },
    onMouseLeave(event) {
      event.target.classList.remove('highlight')
    }
  }
}
</script>
