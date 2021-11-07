<script>
import Modal from './modal.vue'
import Spinner from './spinner.vue'

export default {
  name: 'Loader',
  components: { Modal, Spinner },
  emits: ['loaded'],
  props: {
    load: {
      type: Function,
      required: true
    },
    delay: {
      type: Number,
      default: 200
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loaded: false,
      delayed: false
    }
  },
  mounted() {
    setTimeout(() => {
      if (!this.loaded) {
        this.delayed = true
      }
    }, this.delay)

    this.load().then(() => {
      this.$emit('loaded')
      this.loaded = true
    })
  }
}
</script>

<template>
  <div :style="{ display: inline ? 'inline' : 'block' }">
    <slot v-if="loaded" />
    <slot name="loading" v-else-if="delayed">
      <modal>
        <spinner style="color: white">
          <p>Waiting for API...</p>
        </spinner>
      </modal>
    </slot>
  </div>
</template>