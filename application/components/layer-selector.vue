
<script>
export default {
  props: ['layers', 'activeLayer', 'onSelect'],
  emits: ['select'],
  methods: {
    handleSelect(event) {
      this.$emit('select', event.target.dataset.layer)
    }
  }
}
</script>

<template>
  <div id="layer-selector">
    <label>Layers:</label>
    <ul>
      <li
        v-for="(layer, i) in layers"
        :class="{ active: activeLayer == i }"
        :key="`layer-${i}`"
        :data-layer="i"
        @click="handleSelect"
      >
        {{i}}
      </li>
    </ul>
    <button>Add layer</button>
  </div>
</template>

<style>

#layer-selector { position: relative; z-index: 2; }
#layer-selector * { display: inline-block; }
#layer-selector ul {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
#layer-selector li {
	cursor: pointer;
	background-color: lightgray;
	color: darkgray;
	border-radius: 5px;
	padding: 5px;
	margin: 2px;
}
#layer-selector li.active {
	background-color: mediumseagreen;
	color: white;
}
</style>