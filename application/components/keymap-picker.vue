<template>
  <div>
    <ol>
      <li
        v-for="(stage, i) in stages"
        v-text="displayStage(i)"
        :key="`picker-stage-${i}`"
        @click="handleClick($event, stages[i], i)"
        :disabled="i > activeStage"
        :data-current="i === activeStage"
      />
      <li v-if="activeStage === stages.length" :data-current="true">
        <button @click="handleConfirm"><i class="fa fa-check-circle" /></button>
      </li>
    </ol>
    <template v-if="editing">
      <search
        @select="handleSelect"

        :target="editing.target"
        :targets="editing.targets"
        :param="editing.param"
      />
    </template>
  </div>
</template>

<script>
import get from 'lodash/get'
import Search from './search.vue'
import { loadKeyboards } from '../api'

export default {
  name: 'keymap-picker',
  components: { 'search': Search },
  emits: ['select-keymap'],
  props: ['firmware', 'keyboard', 'layout', 'keymap'],
  data () {
    return {
      pending: null,
      editing: null,
      loading: false,
      keyboards: [],
      layouts: [],
      keymaps: [],
      stages: [
        {
          prop: 'firmware',
          prompt: 'Select Firmware'
        },
        {
          prop: 'keyboard',
          prompt: 'Select Keyboard'
        },
        {
          prop: 'layout',
          prompt: 'Select Layout'
        },
        {
          prop: 'keymap',
          prompt: 'Select Keymap'
        }
      ]
    }
  },
  computed: {
    activeStage() {
      if (!this.pending) return 0
      for (let i = this.stages.length - 1; i >= 0; i--) {
        if (this.pending[this.stages[i].prop]) {
          return i + 1
        }
      }
    },
    displayedFirmware() { return get(this.pending, 'firmware', this.selected.firmware) },
    displayedKeyboard() { return get(this.pending, 'keyboard', this.selected.keyboard) },
    displayedLayout() { return get(this.pending, 'layout', this.selected.layout) },
    displayedKeymap() { return get(this.pending, 'keymap', this.selected.keymap) }
  },
  methods: {
    handleClick(event, stage, i) {
      if (i > this.activeStage) {
        return
      }

      this.editing = {
        target: event.target,
        targets: this.getTargets(stage),
        param: stage.prop
      }
    },
    displayStage(i) {
      return get(this.pending, this.stages[i].prop, this[this.stages[i].prop]) || this.stages[i].prompt
    },
    getTargets(stage) {
      switch (stage.prop) {
        case 'firmware':
          return [
            { code: 'qmk', description: 'QMK Firmware' },
            { code: 'zmk', description: 'ZMK Firmware' }
          ]
        case 'keyboard':
          return this.keyboards.map(keyboard => ({
            code: keyboard.name
          }))
        case 'layout':
          return this.layouts.map(name => ({ code: name }))
        case 'keymap':
          return this.keymaps.map(name => ({ code: name }))
      }
    },
    async handleSelect(result) {
      switch (this.editing.param) {
        case 'firmware':
          this.pending = { firmware: result.code }
          this.keyboards = []
          this.keymaps = []
          this.layouts = []
          await this.loadKeyboards(result.code)
          break
        case 'keyboard':
          this.pending = {
            firmware: get(this.pending, 'firmware', this.firmware),
            keyboard: result.code
          }
          this.layouts = this.keyboards.find(keyboard => keyboard.name === result.code).layouts
          this.keymaps = this.keyboards.find(keyboard => keyboard.name === this.pending.keyboard).keymaps
          break
        case 'layout':
          this.pending = {
            firmware: get(this.pending, 'firmware', this.firmware),
            keyboard: get(this.pending, 'keyboard', this.keyboard),
            layout: result.code
          }
          break
        case 'keymap':
          this.pending = {
            firmware: get(this.pending, 'firmware', this.firmware),
            keyboard: get(this.pending, 'keyboard', this.keyboard),
            layout: get(this.pending, 'layout', this.layout),
            keymap: result.code
          }
          break
      }

      if (!this.pending.keyboard && this.keyboards && this.keyboards.length === 1) {
        this.pending.keyboard = this.keyboards[0].name
        this.layouts = this.keyboards[0].layouts
        this.keymaps = this.keyboards[0].keymaps
      }

      if (!this.pending.layout && this.layouts && this.layouts.length === 1) {
        this.pending.layout = this.layouts[0]
      }

      if (!this.pending.keymap && this.keymaps && this.keymaps.length === 1) {
        this.pending.keymap = this.keymaps[0]
      }

      this.editing = null
    },
    handlePickFirmware(event) {
      this.editing = {
        param: 'firmware',
        target: event.target,
        targets: [
          { code: 'qmk', description: 'QMK Firmware' },
          { code: 'zmk', description: 'ZMK Firmware' }
        ]
      }
    },
    handlePickKeyboard(event) {
      this.editing = {
        param: 'keyboard',
        target: event.target,
        targets: this.keyboards.map(keyboard => ({
          code: keyboard.keyboard
        }))
      }
    },
    handlePickLayout(event) {
      this.editing = {
        param: 'layout',
        target: event.target,
        targets: this.layouts.map(name => ({ code: name }))
      }
    },
    handlePickKeymap(event) {
      this.editing = {
        param: 'keymap',
        target: event.target,
        targets: this.keymaps.map(keymap = ({ code: keymap.name }))
      }
    },
    loadKeyboards(firmware) {
      this.loading = true
      return loadKeyboards(firmware).then(keyboards => {
        this.keyboards = keyboards
        this.loading = false
      })
    },
    handleConfirm() {
      this.$emit('select-keymap', this.pending)
    }
  }
}
</script>

<style scoped>
ol { list-style-type: none }
li {
  display: inline-block;
  cursor: pointer;
  padding: 5px;
  margin: 2px;
  border-radius: 2px;
  background-color: rgb(60, 179, 113);
  color: white;
}
li[data-current="true"] {
  border-color: rgb(60, 179, 113);
  color: rgb(60, 179, 113);
  background: white;
}
li[disabled="true"] {
  cursor: not-allowed;
  background-color: lightgrey;
}
button {
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  color: black;
  cursor: pointer;
}
</style>