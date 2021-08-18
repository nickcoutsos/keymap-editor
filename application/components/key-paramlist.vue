<template>
  <span class="params" :data-is-root="!!root" :data-param-count="params.length">
    <span :key="`param-${i}`" class="param" v-for="(param, i) in params">
      <key-value
        :key="`param-${i}`"
        :param="param"
        :value="getValueProperty(i, 'value')"
        :index="getValueProperty(i, 'index')"
        :keycode="getValueProperty(i, 'keycode')"
        :onSelect="onSelect"
      />

      <key-paramlist
        v-if="getValueProperty(i, 'params')"
        :key="`param-${i}-paramslist`"
        :params="getValueProperty(i, 'keycode') && values[i].keycode.params"
        :values="getValueProperty(i, 'params')"
        :onSelect="onSelect"
      />
    </span>
  </span>
</template>

<script>
import KeyValue from './key-value.vue'

export default {
  name: 'key-paramlist',
  components: {
    'key-value': KeyValue
  },
  props: ['params', 'values', 'onSelect', 'root'],
  methods: {
    getValueProperty(index, property) {
      return this.values && this.values[index] && this.values[index][property]
    }
  }
}
</script>

<style>

.params:not([data-is-root="true"][data-param-count="1"])::before { content: '('; opacity: 0.4; font-weight: bold; margin: 2px; }
.params:not([data-is-root="true"][data-param-count="1"])::after { content: ')'; opacity: 0.4; font-weight: bold; margin: 2px; }
.param:not(:last-child)::after { content: ','; }
.param[data-code="undefined"]::before { content: '∅'; font-size: 80%; }

</style>