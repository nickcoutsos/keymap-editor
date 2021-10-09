<template>
  <span
    class="code"
    :title="source && `(${source.code}) ${source.description}`"
    @click.stop="onSelect({ target: $event.target, codeIndex: index, code: value, param })"
  >
    <template v-if="source">
      <span v-if="source.faIcon" class="['fa', `fa-${source.faIcon}" />
      <template v-else>{{source.symbol || source.code}}</template>
    </template>
    <template v-else>⦸</template>
  </span>
</template>

<script>
import get from 'lodash/get'

export default {
  name: 'key-value',
  props: ['param', 'index', 'value', 'onSelect'],
  inject: ['getSources'],
  computed: {
    source() {
      return get(this.getSources(), [this.param, this.value])
    }
  }
}
</script>

<style>
.code {
	cursor: pointer;
	display: inline-block;
	box-sizing: content-box;
	min-width: 0.5em;
	text-align: center;
	border-radius: 4px;
}
.code.highlight {
	background-color: white !important;
	color: var(--dark-red) !important;
}

</style>