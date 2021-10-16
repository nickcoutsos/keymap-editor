<script>
import Modal from './modal.vue'
import Spinner from './spinner.vue'

export default {
  name: 'Loader',
  components: { Modal, Spinner },
  props: ['load', 'delay'],
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
    }, this.delay || 200)

    this.load().then(() => {
      this.loaded = true
    })
  }
}
</script>

<template>
  <div v-if="loaded">
    <slot />
  </div>
  <div v-else-if="delayed">
    <modal>
      <spinner style="color: white">
        <p>Waiting for API...</p>
      </spinner>
    </modal>
  </div>
</template>