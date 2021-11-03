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
    </div>
  </modal>
</template>

<script>
import Modal from '../modal.vue'

export default {
  name: 'InvalidRepo',
  components: { Modal },
}
</script>

<style scoped>
.dialog {
  background-color: white;
  padding: 40px;
  margin: 40px;
  max-width: 500px;
}
</style>
