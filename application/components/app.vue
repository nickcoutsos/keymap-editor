<script>

import Initialize from './initialize.vue'
import Keymap from './keymap.vue'
import Loader from './loader.vue'
import Modal from './modal.vue'

import * as config from '../config'
import * as github from '../github'

export default {
  components: {
    keymap: Keymap,
    Initialize,
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
      loadKeyboardError: null,
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
          const response = await github.fetchLayoutAndKeymap()
          if (response.error) {
            this.loadKeyboardError = response.error
            return { layout: [], keymap: { layers: [] } }
          }

          return response
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
  <initialize v-slot="{ keymap, layout }">
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

    <div v-else-if="loadKeyboardError === 'InvalidRepoError'">
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
    </div>

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

.dialog {
  background-color: white;
  padding: 40px;
  margin: 40px;
  max-width: 500px;
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
