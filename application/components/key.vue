<template>
  <div
    class="key"
    :class="[uClass, hClass]"
    :data-label="label"
    :data-u="size.u"
    :data-h="size.h"
    :data-depth="depth"
    :data-simple="isSimple"
    :data-long="isComplex"
    :style="positioningStyle"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <span
      v-if="parsed.behaviour"
      v-text="parsed.behaviour.code"
      class="behaviour-binding"
      @click.stop="handleSelectBinding"
    />
    <key-paramlist
      :root="true"
      :params="parsed.behaviourParams"
      :values="parsed.params"
      :onSelect="handleSelectCode"
    />
  </div>
</template>

<script>
import KeyValue from './key-value.vue'
import KeyParamlist from './key-paramlist.vue'

export default {
  props: ['position', 'rotation', 'size', 'label', 'parsed', 'mapping'],
  emits: ['select-key'],
  components: {
    'key-value': KeyValue,
    'key-paramlist': KeyParamlist
  },
  computed: {
    uClass() { return `key-${this.size.u}u` },
    hClass() { return `key-${this.size.h}h` },
    positioningStyle() {
      const x = this.position.x * 65
      const y = this.position.y * 65
      const rx = (this.position.x - (this.rotation.x || this.position.x)) * -65
      const ry = (this.position.y - (this.rotation.y || this.position.y)) * -65

      return {
        top: `${y}px`,
        left: `${x}px`,
        transformOrigin: `${rx}px ${ry}px`,
        transform: `rotate(${this.rotation.a || 0}deg)`
      }
    },
    depth() {
      function getDepth(code) {
        const childDepths = (code.params || []).map(getDepth)
        return code.fn
          ? 2 + Math.max(0, ...childDepths)
          : 1
      }
      return getDepth(this.mapping.parsed)
    },
    isSimple() {
      const [first] = this.parsed.params
      return (
        this.parsed.params.length === 1
        && first.source && (first.source.symbol || first.source.code).length === 1
      )
    },
    isComplex() {
      const [first] = this.parsed.params
      return first && (
        this.parsed.params.length > 1
        || (first.source && (first.source.symbol || first.source.code).length > 4)
        || (first.params || []).length > 0
      )
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
    handleSelectCode(event) {
      this.$emit('select-key', {
        layer: this.mapping.layer,
        index: this.mapping.index,
        ...event
      })
    },
    handleSelectBinding(event) {
      this.$emit('select-key', {
        layer: this.mapping.layer,
        index: this.mapping.index,
        target: event.target,
        codeIndex: 0,
        code: this.parsed.bindCode,
        param: 'behaviour'
      })
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
	color: white;
}
.key > .code {
	padding: 5px;
}

.key[data-depth="3"] { font-size: 90%; }
.key[data-depth="5"] { font-size: 75%; }
.key[data-simple="true"] { font-size: 140%; }
.key[data-long="true"] { font-size: 60%; }

.behaviour-binding {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 10px;
  font-variant: smallcaps;
  opacity: 0.5;
}
</style>