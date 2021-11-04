<script>

import Initialize from './initialize.vue'
import Keymap from './keymap.vue'
import TooManyRepos from './messages/too-many-repos.vue'
import InvalidRepo from './messages/invalid-repo.vue'

import * as config from '../config'
import * as github from '../github'

export default {
  components: {
    keymap: Keymap,
    Initialize,
    TooManyRepos,
    InvalidRepo
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
      github.commitChanges(this.layout, this.editingKeymap)
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
  <initialize v-slot="{ keymap, layout, tooManyRepos, loadKeyboardError }">
    <TooManyRepos v-if="tooManyRepos" />

    <InvalidRepo v-else-if="loadKeyboardError === 'InvalidRepoError'" />

    <template v-else>
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
          :disabled="!this.editingKeymap.keyboard"
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
          :disabled="!this.editingKeymap.keyboard"
          title="Commit keymap changes to GitHub repository"
        />
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
