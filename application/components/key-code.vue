<template>
  <span class="code" :data-code="code" @click="handleClick">
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
  emits: ['select-key'],
  props: ['code', 'param', 'value'],
  inject: ['indexedKeycodes', 'onSelectKey'],
  computed: {
    params() {
      return (this.code.match(paramsPattern) || ['', ''])[1]
        .split(',')
        .map(s => s.trim())
        .filter(s => !!s)
    },
    withoutParams() {
      return this.code.replace(paramsPattern, '')
    },
    keycode() {
      return this.indexedKeycodes[this.withoutParams]
    }
  },
  methods: {
    isFunctionCall(value) {
      return value && value.match(/.+\(.+\)/)
    },
    paramLabel(param, value) {
      const paramKeycode = this.indexedKeycodes[value] || {}
      return param === 'layer' ? value : (paramKeycode.symbol || value)
    },
    handleClick(event) {
      console.log('handling click')
      Array.from(document.querySelectorAll('.active')).forEach(element =>element.classList.remove('active') )
      event.target.classList.add('active')
      this.onSelectKey(event.target)
    }
  }
}
</script>
