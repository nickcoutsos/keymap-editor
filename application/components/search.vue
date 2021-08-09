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
  props: ['target'],
  emits: ['select-keycode'],
  inject: ['keycodes'],
  data() {
    return {
      query: null
    }
  },
  computed: {
    param() {
      const target = document.querySelector('.active')
      console.log('what is it', target.dataset.code, target)
      return target.dataset.param || 'kc'
    },
    prompt() {
      const target = document.querySelector('.active')
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
      console.log('querying', this.query, options)
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
      this.$emit('select-keycode', result.obj.code)
    },
    handleKeyPress(event) {
      setTimeout(() => {
        this.query = event.target.value
      console.log('after event', event.target.value, this.query)
      })
    }
  },
  watch: {
    target(target, old) {
      console.log('new target',  target, old)
      // this.query = target.dataset.code
    }
  }
}
</script>

<template>
  <div id="search" :style="style" :data-foo="target">
    <p>{{prompt}}</p>
    <input
      type="text"
      :value="query !== null ? query : target.dataset.code"
      @keypress="handleKeyPress"
    />
    <ul class="search-results">
      <li
        :key="`result-${i}`"
        v-for="(result, i) in results"
        v-html="highlight(result)"
        @click="handleClickResult"
      />
    </ul>
  </div>
</template>