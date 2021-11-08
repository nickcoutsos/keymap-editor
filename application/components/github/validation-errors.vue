<script>
import DialogBox from '../dialog-box.vue'
import Modal from '../modal.vue'

export default {
  name: 'ValidationErrors',
  emits: ['dismiss'],
  components: {
    DialogBox,
    Modal
  },
  props: {
    title: String,
    errors: Array,
    otherRepoOrBranchAvailable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    file() {
      if (this.title === 'InfoValidationError') {
        return 'config/info.json'
      } else if (this.title === 'KeymapValidationError') {
        return 'config/keymap.json'
      }
    }
  }
}
</script>

<template>
  <modal>
    <dialog-box @dismiss="$emit('dismiss')">
      <h2 v-text="title" />
      <p v-if="file">
        Errors in the file <code>{{file}}</code>.
      </p>
      <ul>
        <li
          v-for="(error, i) in errors"
          v-text="error"
          :key="i"
        />
      </ul>
      <p v-if="otherRepoOrBranchAvailable">
        If you have another branch or repository the the required metadata files
        you may switch to them instead.
      </p>
    </dialog-box>
  </modal>
</template>

<style scoped>
  ul {
    max-height: 300px;
    overflow: auto;
    padding: 10px;
    font-family: monospace;
    font-size: 80%;
    background-color: #efefef;
  }
  li {
    margin: 10px;
  }
</style>
