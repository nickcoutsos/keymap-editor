<template>
  <span class="code" :data-depth="depth" @click.stop="onSelect({ target: $event.target, code: value, param })">
    {{(param == 'layer') ? value : ''}}
    <template v-if="param !== 'layer' && keycode">
      <span v-if="keycode.faIcon" class="['fa', `fa-${keycode.faIcon}" />
      <template v-else>{{keycode.symbol}}</template>
    </template>
  </span>
</template>

<script>
export default {
  name: 'key-value',
  props: ['param', 'value', 'depth', 'onSelect'],
  inject: ['indexedKeycodes'],
  computed: {
    keycode() {
      return this.value && this.indexedKeycodes[this.value]
    }
  }
}
</script>