<template>
  <span class="params">
    <template class="param" v-for="(param, i) in params">
      <key-value
        :key="`param-${i}`"
        :param="param"
        :value="values && values[i] && values[i].value"
        :index="values && values[i] && values[i].index"
        :keycode="values && values[i] && values[i].keycode"
        :onSelect="onSelect"
      />

      <key-paramlist
        v-if="values && values[i] && values[i].params"
        :key="`param-${i}-paramslist`"
        :params="params"
        :values="values && values[i] && values[i].params"
        :onSelect="onSelect"
      />
    </template>
  </span>
</template>

<script>
import KeyValue from './key-value.vue'

export default {
  name: 'key-paramlist',
  components: {
    'key-value': KeyValue
  },
  props: ['params', 'values', 'onSelect']
}
</script>

<style>

.params::before { content: '('; opacity: 0.4; font-weight: bold; margin: 2px; }
.params::after { content: ')'; opacity: 0.4; font-weight: bold; margin: 2px; }
.param:not(:last-child)::after { content: ','; }
.param[data-code="undefined"]::before { content: '∅'; font-size: 80%; }

</style>