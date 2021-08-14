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
    <key-code :code="parsed" @select-code="handleSelectCode" />
  </div>
</template>

<script>
import KeyCode from './key-code.vue'

const paramsPattern = /\((.+)\)/

function parse(code) {
  const fn = code.replace(paramsPattern, '')
  const params = (code.match(paramsPattern) || ['', ''])[1]
    .split(',')
    .map(s => s.trim())
    .filter(s => !!s)

  return params.length > 0
    ? { fn, params: params.map(parse) }
    : code
}

export default {
  props: ['x', 'y', 'rx', 'ry', 'r', 'u', 'h', 'label', 'code'],
  inject: ['onSelectKey'],
  emits: ['select-key'],
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
    },
    parsed() {
      return parse(this.code)
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
    },
    handleSelectCode({ target, code }) {
      this.$emit('select-key', { target, code })
    }
  }
}
</script>

<style>
[data-u="1"] { width: 60px; }
[data-u="2"] { width: 125px; }
[data-h="1"] { height: 60px; }
[data-h="2"] { height: 125px; }

.key {
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;

	color: #999;
	font-size: 110%;
	border: 1px solid lightgray;
	border-radius: 5px;
}
.key:hover {
	background-color: var(--dark-red);
	/*transition: 250ms;*/
	z-index: 1;
}
.key:hover .code {
	background-color: var(--dark-red);
	color: white;
}
.key > .code {
	padding: 5px;
}

.key[data-depth="3"] { font-size: 90%; }
.key[data-depth="5"] { font-size: 75%; }
</style>