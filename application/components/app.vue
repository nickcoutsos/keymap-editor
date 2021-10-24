<script>

import Initialize from './initialize.vue'
import Keymap from './keymap.vue'

import * as config from '../config'
import * as github from '../github'

export default {
  components: {
    keymap: Keymap,
    Initialize
  },
  data() {
    return {
      config,
      editingKeymap: {},
      terminalOpen: false,
      socket: null
    }
  },
  computed: {
    githubAuthorized() {
      return !!github.isGitHubAuthorized()
    }
  },
  methods: {
    handleUpdateKeymap(keymap) {
      Object.assign(this.editingKeymap, keymap)
    },
    handleGithubAuthorize() {
      github.beginLoginFlow()
    },
    handleCommitChanges() {
      github.commitChanges(this.layout, this.keymap)
    },
    handleCompile() {
      fetch('/keymap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.keymap)
      })
    }
  }
}
</script>

<template>
  <initialize v-slot="{ keymap, layout }">

    <keymap
      :layout="layout"
      :keymap="editingKeymap.keyboard ? editingKeymap : keymap"
      @update="handleUpdateKeymap"
    />

    <div id="actions">
      <button
        v-if="config.enableLocal"
        v-text="`Save Local`"
        id="compile"
        @click="handleCompile"
      />

      <button
        v-if="config.enableGitHub && !githubAuthorized"
        v-text="`Authorize GitHub`"
        @click="handleGithubAuthorize"
        title="Install as a GitHub app to edit a zmk-config repository."

      />

      <button
        v-if="config.enableGitHub && githubAuthorized"
        v-text="`Commit Changes`"
        @click="handleCommitChanges"
        title="Commit keymap changes to GitHub repository"
      />
    </div>

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

</style>
