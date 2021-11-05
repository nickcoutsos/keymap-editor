<template>
  <modal>
    <div class="dialog">
      <h2>Hold up a second!</h2>
      <p>The selected repository does not contain <code>info.json</code> or <code>keymap.json</code>.</p>
      <p>
        This app depends on some additional metadata to render the keymap.
        For an example repository ready to use now or metadata you can apply
        to your own keyboard repo, have a look at <a href="https://github.com/nickcoutsos/zmk-config-corne-demo/">zmk-config-corne-demo</a>.
      </p>
      <p v-if="otherRepoOrBranchAvailable">
        If you have another branch or repository the the required metadata files
        you may switch to them instead.
      </p>
      <p>
        <button
          class="dismiss"
          @click="$emit('dismiss')"
          v-text="dismissText"
        />
      </p>
    </div>
  </modal>
</template>

<script>
import Modal from '../modal.vue'

export default {
  name: 'InvalidRepo',
  emits: ['dismiss'],
  components: { Modal },
  props: {
    dismissText: {
      type: String,
      default: 'Ok'
    },
    otherRepoOrBranchAvailable: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.dialog {
  background-color: white;
  padding: 20px 40px;
  margin: 40px;
  max-width: 500px;
}

.dismiss {
  display: block;
  margin: 0 auto;
}
</style>
