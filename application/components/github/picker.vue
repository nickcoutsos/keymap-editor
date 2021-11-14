<template>
  <loader :inline="true" :load="initialize" @loaded="onInitialized">
    <template v-slot:loading>
      <spinner />
    </template>

    <button v-if="!isGitHubAuthorized()" @click="login">
      <i class="fab fa-github" /> Login with GitHub
    </button>

    <button v-else-if="!isAppInstalled()" @click="install">
      <i class="fab fa-github" /> Add Repository
    </button>

    <span v-else>
      <selector
        id="repo"
        label="Repository"
        :choices="repositoryChoices"
        v-model.number="repoId"
      />

      <spinner v-if="loadingBranches" />
      <selector
        v-else
        v-model="branchName"
        id="branch"
        label="Branch"
        :choices="branchChoices"
      />

      <spinner v-if="loadingKeyboard" />
      <validation-errors
        v-if="loadKeyboardError"
        :title="loadKeyboardError.name"
        :errors="loadKeyboardError.errors"
        :otherRepoOrBranchAvailable="repositoryChoices.length > 0 || branchChoices.length > 0"
        @dismiss="clearSelection"
      />
      <validation-errors
        v-if="loadKeyboardWarnings"
        title="Warning"
        :errors="loadKeyboardWarnings"
        @dismiss="loadKeyboardWarnings = null"
      />

      <button
        v-if="branchName && !loadingKeyboard"
        @click="loadKeyboard"
        class="fa fa-sync"
      />
    </span>
  </loader>
</template>

<script>
import find from 'lodash/find'
import map from 'lodash/map'

import github from './api'
import * as storage from './storage'
import InvalidRepo from './invalid-repo.vue'
import ValidationErrors from './validation-errors.vue'
import Loader from '../loader.vue'
import Selector from '../selector.vue'
import Spinner from '../spinner.vue'

export default {
  name: 'GithubPicker',
  components: { InvalidRepo, Loader, Selector, Spinner, ValidationErrors },
  emits: ['select'],
  data() {
    return {
      repoId: null,
      branchName: null,
      branches: [],
      loadingBranches: false,
      loadingKeyboard: false,
      loadKeyboardError: null,
      loadKeyboardWarnings: null
    }
  },
  created() {
    github.on('authentication-failed', () => {
      github.beginLoginFlow()
    })
    github.on('repo-validation-error', err => {
      this.loadKeyboardError = err
      this.loadingKeyboard = false
    })
  },
  watch: {
    repoId(value) {
      this.branchName = null
      if (value) {
        storage.setPersistedRepository(value)
        this.loadBranches()
      }
    },
    branchName(value) {
      if (value) {
        storage.setPersistedBranch(this.repoId, value)
        this.loadKeyboard()
      }
    }
  },
  methods: {
    initialize() {
      // TODO: figure out the Vue equivalent of Higher Order Components so that
      // I can use lifecycle hooks properly.
      return github.init()
    },
    onInitialized() {
      const selectedRepository = storage.getPersistedRepository()
      const repositories = github.repositories || []

      if (repositories.length === 1) {
        this.repoId = repositories[0].id
        this.loadBranches()
      } else if (find(repositories, { id: selectedRepository })) {
        this.repoId = selectedRepository
        this.loadBranches()
      }
    },
    isGitHubAuthorized() {
      return github.isGitHubAuthorized()
    },
    isAppInstalled() {
      return github.isAppInstalled()
    },
    login() {
      github.beginLoginFlow()
    },
    install() {
      github.beginInstallAppFlow()
    },
    getRepositories() {
      return github.repositories
    },
    async loadBranches() {
      this.loadingBranches = true
      this.branches = []

      const repository = find(github.repositories, { id: this.repoId })
      const branches = await github.fetchRepoBranches(repository)

      this.loadingBranches = false
      this.branches = branches

      const available = map(branches, 'name')
      const defaultBranch = repository.default_branch
      const currentBranch = this.branchName
      const previousBranch = storage.getPersistedBranch(this.repoId)
      const onlyBranch = branches.length === 1 ? branches[0].name : null

      for (let branch of [onlyBranch, currentBranch, previousBranch, defaultBranch]) {
        if (available.includes(branch)) {
          this.branchName = branch
          break
        }
      }
    },
    async loadKeyboard() {
      const available = this.getRepositories()
      const repository = find(available, { id: this.repoId })?.full_name
      const branch = this.branchName

      this.loadingKeyboard = true
      this.loadKeyboardError = null

      const response = await github.fetchLayoutAndKeymap(repository, branch)

      this.loadingKeyboard = false
      this.lintKeyboard(response)

      this.$emit('select', { github: { repository, branch }, ...response })
    },
    lintKeyboard({ layout }) {
      const noKeyHasPosition = layout.every(key => (
        key.row === undefined &&
        key.col === undefined
      ))

      if (noKeyHasPosition) {
        this.loadKeyboardWarnings = [
          'Layout in info.json has no row/col definitions. Generated keymap files will not be nicely formatted.'
        ]
      }
    },
    clearSelection() {
      this.branchName = null
      this.loadKeyboardError = null
      this.loadKeyboardWarnings = null
    }
  },
  computed: {
    repositoryChoices() {
      return this.getRepositories().map(repo => ({
        id: repo.id,
        name: repo.full_name
      }))
    },
    branchChoices() {
      return this.branches.map(branch => ({
        id: branch.name,
        name: branch.name
      }))
    }
  }
}
</script>
