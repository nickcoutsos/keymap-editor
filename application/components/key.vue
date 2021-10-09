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
      v-if="behaviour"
      v-text="behaviour.code"
      class="behaviour-binding"
      @click.stop="handleSelectBehaviour"
    />
    <key-paramlist
      :root="true"
      :index="index"
      :params="behaviourParams"
      :values="normalized.params"
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
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import pick from 'lodash/pick'

import { getBehaviourParams } from '../keymap'

import KeyValue from './key-value.vue'
import KeyParamlist from './key-paramlist.vue'
import Search from './search.vue'

function makeIndex (tree) {
  const index = []
  ;(function traverse(tree) {
    const params = tree.params || []
    index.push(tree)
    params.forEach(traverse)
  })(tree)

  return index
}

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
  inject: ['getSearchTargets', 'getSources'],
  computed: {
    normalized() {
      const { value, params } = this.parsed
      const sources = this.getSources()
      const commands = keyBy(this.behaviour.commands, 'code')

      function getSourceValue(value, as) {
        if (as === 'command') return commands[value]
        if (as === 'raw' || as.enum) return { code: value }
        return sources[as][value]
      }

      function normalize(node, as) {
        if (!node) {
          return { value: undefined, params: [] }
        }
        const { value, params } = node
        const source = getSourceValue(value, as)

        return {
          value,
          source,
          params: get(source, 'params', []).map((as, i) => (
            normalize(params[i], as)
          ))
        }
      }

      return {
        value,
        source: this.behaviour,
        params: this.behaviourParams.map((as, i) => (
          normalize(params[i], as)
        ))
      }
    },
    index() {
      return makeIndex(this.normalized)
    },
    behaviour() {
      const bind = this.parsed.value
      const sources = this.getSources()
      return get(sources, ['behaviours', bind])
    },
    behaviourParams() {
      return getBehaviourParams(this.parsed, this.behaviour)
    },
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
      const [first] = this.normalized.params
      return (
        this.normalized.params.length === 1
        && first.source && (first.source.symbol || first.source.code).length === 1
      )
    },
    isComplex() {
      const [first] = this.normalized.params
      const symbol = (get(first, 'source.symbol', first.value) || '')
      const isLongSymbol = symbol.length > 4
      const isMultiParam = this.behaviourParams.length > 1
      const isNestedParam = get(first, 'params', []).length > 0

      return isLongSymbol || isMultiParam || isNestedParam
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
        code: this.parsed.value,
        param: 'behaviour'
      }
    },
    handleSelectValue(source) {
      const { normalized } = this
      const { codeIndex } = this.editing
      const updated = cloneDeep(normalized)
      const index = makeIndex(updated)
      const targetCode = index[codeIndex]

      targetCode.value = source.code
      targetCode.params = []

      this.editing = null
      this.$emit('update', updated)
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