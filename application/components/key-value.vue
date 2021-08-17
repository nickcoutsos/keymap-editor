<template>
  <span
    class="code"
    :data-depth="depth"
    :data-code="value"
    :data-empty="value === undefined"
    @click.stop="onSelect({ target: $event.target, codeIndex: index, code: value, param })"
  >
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
  props: ['param', 'keycode', 'index', 'value', 'depth', 'onSelect']
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