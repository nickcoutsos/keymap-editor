<script>
import keyBy from 'lodash/keyBy'

import Keymap from './keymap.vue'
import Loader from './loader.vue'
import Modal from './modal.vue'

import * as config from '../config'
import * as github from '../github'

import { healthcheck, loadBehaviours } from '../api'
import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'
import { loadKeycodes } from '../keycodes'

export default {
  components: {
    keymap: Keymap,
    Loader,
    Modal
  },
  provide() {
    return {
      keycodes: this.keycodes,
      behaviours: this.behaviours,
      indexedKeycodes: this.indexedKeycodes,
      indexedBehaviours: this.indexedBehaviours
    }
  },
  data() {
    return {
      config,
      keycodes: [],
      editingKeymap: {},
      indexedKeycodes: {},
      behaviours: [],
      indexedBehaviours: {},
      tooManyRepos: false,
      keymap: {},
      layout: [],
      layers: [],
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
    async loadData() {
      await github.init()
      if (config.enableGitHub && github.isGitHubAuthorized() && github.repositories.length > 1) {
        this.tooManyRepos = true
        return
      }
      const loadKeyboardData = async () => {
        if (config.enableGitHub && github.isGitHubAuthorized()) {
          return github.fetchLayoutAndKeymap()
        } else if (config.enableLocal) {
          const [layout, keymap] = await Promise.all([
            loadLayout(),
            loadKeymap()
          ])
          return { layout, keymap }
        } else {
          return { layout: [], keymap: { layers: [] } }
        }
      }

      const [
        keycodes,
        behaviours,
        { layout, keymap }
      ] = await Promise.all([
        loadKeycodes(),
        loadBehaviours(),
        loadKeyboardData()
      ])

      this.keycodes.splice(0, this.keycodes.length, ...keycodes)
      this.behaviours.splice(0, this.behaviours.length, ...behaviours)
      Object.assign(this.indexedKeycodes, keyBy(this.keycodes, 'code'))
      Object.assign(this.indexedBehaviours, keyBy(this.behaviours, 'code'))

      this.layout.splice(0, this.layout.length, ...layout.map(key => (
        { ...key, u: key.u || key.w || 1, h: key.h || 1 }
      )))

      const layerNames = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
      Object.assign(this.layers, keymap.layers)
      Object.assign(this.keymap, keymap, {
        layer_names: layerNames
      })
    },
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
    },
    getInstallationUrl() {
      console.log(github.installation, github.repositories, github)
      return `https://github.com/settings/installations/${github.installation.id}`
    },
    async doReadyCheck() {
      await healthcheck()
      await this.loadData()
    }
  }
}
</script>

<template>
  <loader :load="doReadyCheck">
    <div v-if="tooManyRepos">
      <modal>
        <div class="dialog">
          <h2>Hold up a second!</h2>
          <p>The Keymap Editor app has been installed for more than one GitHub repository.</p>
          <p>
            I'm still working on things, including the ability to pick a specific
            repo, but in the meantime you should go back to your <a :href="getInstallationUrl()">app configuration</a>
            and select a single repository containing your keyboard's zmk-config.
          </p>
        </div>
      </modal>
    </div>
    <template v-else>
      <keymap :layout="layout" :keymap="editingKeymap.keyboard ? editingKeymap : keymap" @update="handleUpdateKeymap" />
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
  </loader>
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

.dialog {
  background-color: white;
  padding: 40px;
  margin: 40px;
  max-width: 500px;
}

</style>
