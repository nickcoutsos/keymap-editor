<template>
  <span
    class="code"
    :data-depth="depth"
    :data-code="value"
    :data-empty="value === undefined"
    :title="source && `(${source.code}) ${source.description}`"
    @click.stop="onSelect({ target: $event.target, codeIndex: index, code: value, param })"
  >
    {{(param == 'layer') ? value : (!source ? '⦸' : '')}}
    <template v-if="param !== 'layer' && source">
      <span v-if="source.faIcon" class="['fa', `fa-${source.faIcon}" />
      <template v-else>{{source.symbol || source.code}}</template>
    </template>
  </span>
</template>

<script>
export default {
  name: 'key-value',
  props: ['param', 'source', 'index', 'value', 'depth', 'onSelect']
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

[data-empty="true"]::before { content: '∅'; font-size: 80%; }
</style>