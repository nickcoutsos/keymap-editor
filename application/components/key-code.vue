<template>
  <span class="code" :data-depth="depth" @click.stop="handleClick">
    {{(param == 'layer') ? code : ''}}
    <template v-if="param !== 'layer' && keycode">
      <span v-if="keycode.faIcon" class="['fa', `fa-${keycode.faIcon}" />
      <template v-else>{{keycode.symbol}}</template>
      <span v-if="params.length > 0" class="params">
        <template class="param" v-for="(param, i) in keycode.params">
          <key-code v-if="isFunctionCall(params[i])" :key="`param-${i}`" :code="params[i]" :param="param" />
          <span v-else class="param code" :key="`param-${i}`" :param="param" :value="params[i]">
            {{this.paramLabel(param, params[i])}}
          </span>
        </template>
      </span>
    </template>
  </span>
</template>

<script>
const paramsPattern = /\((.+)\)/

module.exports = {
  name: 'key-code',
  emits: ['select-code'],
  props: ['code', 'param', 'value'],
  inject: ['indexedKeycodes'],
  computed: {
    params() {
      return this.code.params || []
    },
    withoutParams() {
      return this.code.fn || this.code
    },
    keycode() {
      return this.indexedKeycodes[this.code.fn || this.code]
    },
    depth() {
      function getDepth(code) {
        const childDepths = (code.params || []).map(getDepth)
        return code.fn
          ? 1 + Math.max(0, ...childDepths)
          : 0
      }
      return getDepth(this.code)
    }
  },
  methods: {
    isFunctionCall(value) {
      return value && !!value.fn
    },
    paramLabel(param, value) {
      const paramKeycode = this.indexedKeycodes[value] || {}
      return param === 'layer' ? value : (paramKeycode.symbol || value)
    },
    handleClick(event) {
      Array.from(document.querySelectorAll('.active'))
        .forEach(element => element.classList.remove('active') )

      event.target.classList.add('active')

      this.$emit('select-code', {
        target: event.target,
        code: this.code
      })
    }
  }
}
</script>
