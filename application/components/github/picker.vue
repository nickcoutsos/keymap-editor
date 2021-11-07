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
        v-model="repo"
      />

      <spinner v-if="loadingBranches" />
      <selector
        v-else
        v-model="branch"
        id="branch"
        label="Branch"
        :choices="branchChoices"
      />

      <spinner v-if="loadingKeyboard" />
      <invalid-repo
        v-if="loadKeyboardError === 'InvalidRepoError'"
        :otherRepoOrBranchAvailable="repositoryChoices.length > 0 || branchChoices.length > 0"
        @dismiss="clearSelection"
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
import Loader from '../loader.vue'
import Selector from '../selector.vue'
import Spinner from '../spinner.vue'

export default {
  name: 'GithubPicker',
  components: { InvalidRepo, Loader, Selector, Spinner },
  emits: ['select'],
  data() {
    return {
      repo: null,
      branch: null,
      branches: [],
      loadingBranches: false,
      loadingKeyboard: false,
      loadKeyboardError: null
    }
  },
  created() {
    github.on('authentication-failed', () => {
      github.beginLoginFlow()
    })
  },
  watch: {
    repo(value) {
      storage.setPersistedRepository(value)
      if (value) {
        this.loadBranches()
      }
    },
    branch(value) {
      storage.setPersistedBranch(value)
      if (value) {
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
        this.repo = repositories[0].full_name
        this.loadBranches()
      } else if (selectedRepository && repositories.find(repo => repo.full_name === selectedRepository)) {
        this.repo = selectedRepository
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

      const repository = github.repositories.find(repo => repo.full_name === this.repo)
      const branches = await github.fetchRepoBranches(repository)

      this.loadingBranches = false
      this.branches = branches

      const available = map(branches, 'name')
      const defaultBranch = repository.default_branch
      const currentBranch = this.branch
      const previousBranch = storage.getPersistedBranch()
      const onlyBranch = branches.length === 1 ? branches[0].name : null

      for (let branch of [onlyBranch, currentBranch, previousBranch, defaultBranch]) {
        if (available.includes(branch)) {
          this.branch = branch
          break
        }
      }
    },
    async loadKeyboard() {
      const available = this.getRepositories()
      const repository = find(available, { full_name: this.repo })?.full_name
      const branch = this.branch

      this.loadingKeyboard = true
      this.loadKeyboardError = null

      const response = await github.fetchLayoutAndKeymap(repository, branch)

      this.loadingKeyboard = false
      if (response.error) {
        this.loadKeyboardError = response.error
        return
      }

      this.$emit('select', { github: { repository, branch }, ...response })
    },
    clearSelection() {
      this.branch = null
      this.loadKeyboardError = null
    }
  },
  computed: {
    repositoryChoices() {
      return this.getRepositories().map(repo => ({
        id: repo.full_name,
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
