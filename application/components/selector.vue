<template>
  <div class="selector">
    <label :for="id" v-text="label" />
    <select
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="({ id, name }, i) in choices"
        :key="i"
        :value="id"
        v-text="name"
      />
    </select>
  </div>
</template>

<script>
export default {
  name: 'Selector',
  props: {
    id: String,
    label: String,
    choices: Array,
    modelValue: [String, Number, Object]
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.selector {
  display: inline-block;
  width: auto;
  margin: 5px;
}

.selector label {
  display: block;
  width: 100%;
  font-size: 120%;
  color: #555;
}
</style>