<script>
import fuzzysort from 'fuzzysort'

const cycle = (array, index, step=1) => {
  const next = (index + step) % array.length
  return next < 0 ? array.length + next : next
}

export default {
  name: 'value-picker',
  emits: ['cancel', 'select'],
  props: {
    target: Object,
    choices: Array,
    param: [String, Object],
    value: String,
    prompt: String,
    searchKey: String,
    searchThreshold: {
      type: Number,
      default: 10
    },
    showAllThreshold: {
      type: Number,
      default: 50,
      validator: value => value >= 0
    }
  },
  data() {
    return {
      query: null,
      highlighted: null,
      showAll: false
    }
  },
  mounted() {
    document.body.addEventListener('click', this.handleClickOutside, true)

    if (this.$refs.searchBox) {
      this.$refs.searchBox.focus()
    }
  },
  unmounted() {
    document.body.removeEventListener('click', this.handleClickOutside, true)
  },
  computed: {
    results() {
      const { query, choices } = this
      const options = { key: this.searchKey, limit: 30 }
      const filtered = fuzzysort.go(query, choices, options)
      const showAll = this.showAll || this.searchThreshold > choices.length

      if (showAll) {
        return choices
      } else if (!query) {
        return choices.slice(0, this.searchThreshold)
      }

      return filtered.map(result => ({
        ...result.obj,
        search: result
      }))
    },
    enableShowAllButton() {
      return (
        !this.showAll &&
        this.choices.length > this.searchThreshold &&
        this.choices.length <= this.showAllThreshold
      )
    },
    style() {
      const rect = this.target.getBoundingClientRect()
      return  {
        // display: 'block',
        // top: `${window.scrollY + (rect.top + rect.bottom) / 2}px`,
        // left: `${window.scrollX + (rect.left + rect.right) / 2}px`
      }
    }
  },
  methods: {
    highlight(result) {
      return fuzzysort.highlight(result)
    },
    handleClickResult(result) {
      this.$emit('select', result)
    },
    handleKeyPress(event) {
      setTimeout(() => {
        this.query = event.target.value
      })
    },
    handleSelectActive() {
      if (this.results.length > 0 && this.highlighted !== null) {
        this.handleClickResult(this.results[this.highlighted])
      }
    },
    handleHighlightNext() {
      this.setHighlight(0, 1)
    },
    handleHighlightPrev() {
      this.setHighlight(this.results.length - 1, -1)
    },
    setHighlight(initial, offset) {
      if (this.results.length === 0) {
        this.highlighted = null
        return
      }
      if (offset === undefined) {
        this.highlighted = initial
        return
      }

      this.highlighted = this.highlighted === null ? initial : cycle(this.results, this.highlighted, offset)
      this.scrollIntoViewIfNeeded(this.$el.querySelector(`.results li[data-result-index="${this.highlighted}`), false)
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.cancel()
      }
    },
    cancel() {
      this.$emit('cancel', 'select')
    },
    scrollIntoViewIfNeeded (element, alignToTop) {
      const scroll = element.offsetParent.scrollTop
      const height = element.offsetParent.offsetHeight
      const top = element.offsetTop
      const bottom = top + element.scrollHeight

      if (top < scroll || bottom > scroll + height) {
        element.scrollIntoView(alignToTop)
      }
    }
  }
}
</script>

<template>
  <div
    class="dialog"
    :style="style"
    @keydown.down.prevent="handleHighlightNext"
    @keydown.up.prevent="handleHighlightPrev"
    @keydown.enter.prevent="handleSelectActive"
    @keydown.esc.prevent="cancel"
  >
    <p>{{prompt}}</p>
    <input
      v-if="choices.length > searchThreshold"
      ref="searchBox"
      type="text"
      :value="query !== null ? query : value"
      @keypress="handleKeyPress"
    />
    <ul class="results">
      <li
        :key="`result-${i}`"
        :class="{ highlighted: highlighted === i }"
        :title="result.description"
        :data-result-index="i"
        v-for="(result, i) in results"
        @click="handleClickResult(result)"
        @mouseover="setHighlight(i)"
      >
        <span v-if="result.search" v-html="highlight(result.search)" />
        <span v-else v-text="result[searchKey]" />
      </li>
    </ul>
    <div
      v-if="choices.length > searchThreshold"
      class="choices-counter"
    >
      Total choices: {{choices.length}}.
      <a
        v-if="enableShowAllButton"
        v-text="`Show all`"
        @click.stop="showAll = true"
      />
    </div>
  </div>
</template>

<style>

.dialog {
  width: 300px;
}
.dialog p {
	margin: 0;
	font-size: 90%;
	font-weight: bold;
}
.dialog input {
	display: block;
	width: 100%;
	height: 30px;
	line-height: 30px;

	font-size: 120%;
	margin: 0;
	padding: 4px;
	border: none;
	border-radius: 4px;
  box-sizing: border-box;
}
ul.results {
	font-family: monospace;
	list-style-position: inside;
	list-style-type: none;
	max-height: 200px;
	overflow: scroll;
	padding: 4px;
  margin: 4px 0;
	background: rgba(0, 0, 0, 0.8);
	border-radius: 4px;
}
.results li {
	cursor: pointer;
	color: white;
	padding: 5px;
}
.results li:hover, .results li.highlighted {
	background: white;
	color: black;
}
.results li b { color: red; }

.choices-counter {
  font-size: 10px;
}

.choices-counter a {
  color: var(--selection);
  border-bottom: 1px dotted var(--selection);
  cursor: pointer;
}

</style>