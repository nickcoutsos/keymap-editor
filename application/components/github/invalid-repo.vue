<template>
  <modal>
    <dialog-box @dismiss="$emit('dismiss')">
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
    </dialog-box>
  </modal>
</template>

<script>
import DialogBox from '../dialog-box.vue'
import Modal from '../modal.vue'

export default {
  name: 'InvalidRepo',
  emits: ['dismiss'],
  components: { DialogBox, Modal },
  props: {
    otherRepoOrBranchAvailable: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>


</style>
