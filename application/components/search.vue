<script>
const getOptions = (param, keycodes) => {
  switch (param) {
    case 'layer':
      return [{code: '1' }, {code: '2' }, {code: '3' }]
    case 'mod':
      return keycodes.filter(keycode => keycode.isModifier)
    case 'kc':
    default:
      return keycodes
  }
}

export default {
  name: 'search',
  emits: ['cancel', 'select'],
  props: ['target', 'code'],
  inject: ['keycodes'],
  data() {
    return {
      query: null
    }
  },
  mounted() {
    document.body.addEventListener('click', this.cancel)
  },
  unmounted() {
    document.body.removeEventListener('click', this.cancel)
  },
  computed: {
    param() {
      return this.code.fn || this.code || 'kc'
    },
    prompt() {
      const target = this.target// document.querySelector('.active')
      if (target.dataset.param === 'layer') {
        return 'Select layer...'
      } else if (target.dataset.param === 'mod') {
        return 'Select modifier...'
      } else {
        return 'Select key code...'
      }
    },
    results() {
      const options = getOptions(this.param, this.keycodes)
      return fuzzysort.go(this.query, options, {
        key: 'code',
        limit: 30
      })
    },
    style() {
      const rect = this.target.getBoundingClientRect()
      return  {
        display: 'block',
        top: `${window.scrollY + (rect.top + rect.bottom) / 2}px`,
        left: `${window.scrollX + (rect.left + rect.right) / 2}px`
      }
    }
  },
  methods: {
    highlight(result) {
      return fuzzysort.highlight(result)
    },
    handleClickResult(result) {
      this.$emit('select', result.obj.code)
    },
    handleKeyPress(event) {
      setTimeout(() => {
        this.query = event.target.value
      })
    },
    cancel() {
      this.$emit('cancel', 'select')
    }
  }
}
</script>

<template>
  <div class="dialog" :style="style">
    <p>{{prompt}}</p>
    <input
      type="text"
      :value="query !== null ? query : code"
      @keypress="handleKeyPress"
    />
    <ul class="results">
      <li
        :key="`result-${i}`"
        v-for="(result, i) in results"
        v-html="highlight(result)"
        @click="handleClickResult(result)"
      />
    </ul>
  </div>
</template>

<style scoped>

.dialog {
	position: absolute;
	transform: translate(-60px, -30px);
	z-index: 2;
}
.dialog p {
	margin: 0;
	font-size: 90%;
	font-weight: bold;
}
.dialog input {
	display: block;
	padding: 0;
	margin: 0;
	width: 120px;
	height: 60px;
	font-size: 120%;
	border: 2px solid steelblue;
	border-radius: 4px;

	text-align: center;
	line-height: 60px;
}
ul.results {
	font-family: monospace;
	list-style-position: inside;
	list-style-type: none;
	max-height: 200px;
	overflow: scroll;
	padding: 4px;
	background: rgba(0, 0, 0, 0.8);
	border-radius: 4px;
}
.results li {
	cursor: pointer;
	color: white;
	padding: 5px;
}
.results li:hover {
	background: white;
	color: black;
}
.results li b { color: red; }

</style>