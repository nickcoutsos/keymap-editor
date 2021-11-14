<script>

import Initialize from './initialize.vue'
import Keymap from './keymap.vue'
import KeyboardPicker from './keyboard-picker.vue'
import Spinner from './spinner.vue'

import * as config from '../config'
import github from './github/api'

export default {
  components: {
    keymap: Keymap,
    KeyboardPicker,
    Initialize,
    Spinner
  },
  data() {
    return {
      config,
      source: null,
      sourceOther: null,
      layout: [],
      keymap: {},
      editingKeymap: {},
      saving: false,
      terminalOpen: false,
      socket: null
    }
  },
  methods: {
    handleKeyboardSelected({ source, layout, keymap, ...other }) {
      this.source = source
      this.sourceOther = other
      this.layout.splice(0, this.layout.length, ...layout)
      Object.assign(this.keymap, keymap)
      this.editingKeymap = {}
    },
    handleUpdateKeymap(keymap) {
      Object.assign(this.editingKeymap, keymap)
    },
    async handleCommitChanges() {
      const { repository, branch } = this.sourceOther.github

      this.saving = true
      await github.commitChanges(repository, branch, this.layout, this.editingKeymap)
      this.saving = false
      Object.assign(this.keymap, this.editingKeymap)
      this.editingKeymap = {}
    },
    handleCompile() {
      fetch('/keymap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.editingKeymap)
      })
    }
  }
}
</script>

<template>
  <initialize>
    <keyboard-picker @select="handleKeyboardSelected" />

    <template v-if="keymap.keyboard">
      <keymap
        :layout="layout"
        :keymap="editingKeymap.keyboard ? editingKeymap : keymap"
        @update="handleUpdateKeymap"
      />
      <div id="actions">
        <button
          v-if="source === 'local'"
          v-text="`Save Local`"
          id="compile"
          :disabled="!this.editingKeymap.keyboard"
          @click="handleCompile"
        />

        <button
          v-if="source === 'github'"
          @click="handleCommitChanges"
          :disabled="!this.editingKeymap.keyboard"
          title="Commit keymap changes to GitHub repository"
        >
          <template v-if="saving">Saving </template>
          <template v-else>Commit Changes</template>
          <spinner v-if="saving" />
        </button>
      </div>
    </template>

    <a class="github-link" href="https://github.com/nickcoutsos/keymap-editor">
      <i class="fab fa-github" />/nickcoutsos/keymap-editor
    </a>
  </initialize>
</template>

<style scoped>
button {
  cursor: pointer;
  background-color: var(--hover-selection);
  color: white;

  font-size: 16px;
  border: none;
  border-radius: 5px;
  padding: 5px;
  margin: 2px;
}

button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

.github-link {
  display: inline-block;
  position: absolute;
  z-index: 100;
  bottom: 5px;
  left: 5px;
  font-size: 110%;
  font-style: italic;
  background-color: white;
  border-radius: 20px;
  padding: 5px 10px;
  text-decoration: none;

  color: royalblue;
}

</style>
