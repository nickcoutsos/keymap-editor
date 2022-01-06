
<script>
export default {
  props: ['layers', 'activeLayer', 'onSelect'],
  emits: ['select', 'new-layer', 'delete-layer'],
  data() {
    return {
      renaming: false
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  unmounted() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleSelect(layer) {
      if (layer === this.activeLayer) {
        this.renaming = true
        return
      }

      this.renaming = false
      this.$emit('select', layer)
    },
    handleAdd() {
      this.$emit('new-layer')
    },
    handleDelete(layerIndex, layerName) {
      const confirmation = confirm(`really delete layer: ${layerName}?`);
      confirmation && this.$emit("delete-layer", layerIndex);
    },
    handleClickOutside({ target }) {
      const input = this.$el.querySelector('.active input.name')
      if (this.renaming && input !== target) {
        this.renaming = false
      }
    }
  }
}
</script>

<template>
  <div id="layer-selector" :data-renaming="renaming">
    <p>Layers:</p>
    <ul>
      <li
        v-for="(name, i) in layers"
        :class="{ active: activeLayer == i }"
        :key="`layer-${i}`"
        :data-layer="i"
        @click.stop="handleSelect(i)"
      >
        <span class="index">{{i}}</span>
        <input
          v-if="activeLayer == i && renaming"
          v-model="layers[i]"
          :ref="input => input && input.focus()"
          class="name"
        />
        <span class="name" v-else>
          {{name}}
          <span
            class="delete fa fa-times-circle"
            @click.stop="handleDelete(i, name)"
          />
        </span>
      </li>
      <li @click="handleAdd">
        <span class="index fa fa-plus" />
        <span class="name">Add Layer</span>
      </li>
    </ul>
  </div>
</template>

<style>

#layer-selector {
  position: absolute;
  z-index: 2;
}

#layer-selector ul {
  display: inline-block;
	list-style-type: none;
	margin: 0;
	padding: 0;
}
#layer-selector li {
	cursor: pointer;
	background-color: rgba(201, 201, 201, 0.85);
	color: darkgray;
	border-radius: 15px;
  height: 30px;
	padding: 0px;
	margin: 4px 2px;

}
#layer-selector li:hover {
  background-color: rgba(60, 179, 113, 0.85);
  color: white;
}
#layer-selector li.active {
	background-color: rgb(60, 179, 113);
	color: white;
}

#layer-selector li * {
  display: inline-block;
}
#layer-selector li .index {
  overflow: auto;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}
#layer-selector li .name {
  overflow: hidden;
  width: 0;
  height: 30px;
  line-height: 30px;
  padding: 0;
  font-variant: small-caps;
}
#layer-selector:hover li .name, #layer-selector[data-renaming="true"] li .name {
  transition: .15s ease-in;
  width: 120px;
  padding: 0 0 0 10px;
}

#layer-selector button {
  width: 30px;
  height: 30px;
  line-height: 30px;
  padding: 0;
  text-align: center;
  border-radius: 15px;
}

#layer-selector input.name {
  vertical-align: top;
  width: 100px;
  border: none;
  outline: none;
  background: transparent;
  color: white;
}

#layer-selector .delete {
  float: right;
  height: 30px;
  line-height: 30px;
  width: 30px;
}

#layer-selector li.active .name {
  cursor: text;
}
</style>