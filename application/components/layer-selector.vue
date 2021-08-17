
<script>
export default {
  props: ['layers', 'activeLayer', 'onSelect'],
  emits: ['select', 'new-layer'],
  methods: {
    handleSelect(layer) {
      this.$emit('select', layer)
    },
    handleAdd() {
      this.$emit('new-layer')
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
        @click="handleSelect(i)"
      >
        {{i}}
      </li>
    </ul>
    <button @click="handleAdd">Add layer</button>
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