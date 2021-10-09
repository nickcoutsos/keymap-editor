<template>
  <div
    class="key"
    :class="[uClass, hClass]"
    :data-label="label"
    :data-u="size.u"
    :data-h="size.h"
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
      @click.stop="handleSelectBehaviour"
    />
    <key-paramlist
      :root="true"
      :params="parsed.behaviourParams"
      :values="parsed.params"
      :onSelect="handleSelectCode"
    />
    <teleport to="body">
      <search
        v-if="editing"
        :target="editing.target"
        :code="editing.code"
        :param="editing.param"
        :targets="editing.targets"
        @select="handleSelectValue"
        @cancel="editing = null"
      />
    </teleport>
  </div>
</template>

<script>
import pick from 'lodash/pick'

import KeyValue from './key-value.vue'
import KeyParamlist from './key-paramlist.vue'
import Search from './search.vue'

import { updateKeyCode } from '../keymap'

export default {
  props: [
    'position',
    'rotation',
    'size',
    'label',
    'parsed'
  ],
  emits: ['update'],
  components: {
    'key-value': KeyValue,
    'key-paramlist': KeyParamlist,
    'search': Search
  },
  data () {
    return {
      editing: null
    }
  },
  inject: ['getSearchTargets', 'sources'],
  computed: {
    uClass() { return `key-${this.size.u}u` },
    hClass() { return `key-${this.size.h}h` },
    positioningStyle() {
      // TODO: fix padding
      const x = this.position.x * 65
      const y = this.position.y * 65
      const u = this.size.u * 60 + 5 * (this.size.u - 1);
      const h = this.size.h * 60 + 5 * (this.size.h - 1);
      const rx = (this.position.x - (this.rotation.x || this.position.x)) * -65
      const ry = (this.position.y - (this.rotation.y || this.position.y)) * -65

      return {
        top: `${y}px`,
        left: `${x}px`,
        width: `${u}px`,
        height: `${h}px`,
        transformOrigin: `${rx}px ${ry}px`,
        transform: `rotate(${this.rotation.a || 0}deg)`
      }
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
      this.editing = pick(event, ['target', 'codeIndex', 'code', 'param'])
      this.editing.targets = this.getSearchTargets(this.editing.param)
    },
    handleSelectBehaviour(event) {
      this.editing = {
        target: event.target,
        targets: this.getSearchTargets('behaviour'),
        codeIndex: 0,
        code: this.parsed.bindCode,
        param: 'behaviour'
      }
    },
    handleSelectValue(source) {
      const { parsed, sources } = this
      const { codeIndex } = this.editing
      const updated = updateKeyCode({ parsed }, codeIndex, source, sources)

      this.editing = null
      this.$emit('update', updated.parsed)
    }
  }
}
</script>

<style>
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

.key[data-simple="true"] { font-size: 140%; }
.key[data-long="true"] { font-size: 60%; }

.behaviour-binding {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 10px;
  font-variant: smallcaps;
  padding: 2px;
  opacity: 0.5;
}

.behaviour-binding:hover {
  cursor: pointer;
  color: var(--dark-red);
  background-color: white;
  border-radius: 5px 0;
  opacity: 1;
}
</style>