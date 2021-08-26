<template>
  <span class="params" :data-is-root="!!root" :data-param-count="params.length">
    <span :key="`param-${i}`" class="param" v-for="(param, i) in params">
      <key-value
        :key="`param-${i}`"
        :param="param"
        :value="getValueProperty(i, 'value')"
        :index="getValueProperty(i, 'index')"
        :source="getValueProperty(i, 'source')"
        :onSelect="onSelect"
      />

      <key-paramlist
        v-if="getValueProperty(i, 'source.params.length') > 0"
        :key="`param-${i}-paramslist`"
        :params="getValueProperty(i, 'source.params')"
        :values="getValueProperty(i, 'params')"
        :onSelect="onSelect"
      />
    </span>
  </span>
</template>

<script>
import get from 'lodash/get'
import KeyValue from './key-value.vue'

export default {
  name: 'key-paramlist',
  components: {
    'key-value': KeyValue
  },
  props: ['params', 'values', 'onSelect', 'root'],
  methods: {
    getValueProperty(index, property) {
      return get(this.values[index], property)
    }
  }
}
</script>

<style>

.params:not([data-is-root="true"][data-param-count="1"])::before { content: '('; opacity: 0.4; font-weight: bold; margin: 2px; }
.params:not([data-is-root="true"][data-param-count="1"])::after { content: ')'; opacity: 0.4; font-weight: bold; margin: 2px; }
.param:not(:last-child)::after { content: ','; }

.code { padding: 0px 4px; margin-left: -2px; margin-right: -2px; }
</style>