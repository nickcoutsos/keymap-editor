
<script>
export default {
  props: ['layers', 'onSelect'],
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
