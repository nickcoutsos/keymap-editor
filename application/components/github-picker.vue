<template>
  <button v-if="!authorized()" @click="login">
    <i class="fab fa-github" /> Login with GitHub
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

</template>

<script>
import find from 'lodash/find'
import map from 'lodash/map'

import * as github from '../github'
import InvalidRepo from './messages/invalid-repo.vue'
import Selector from './selector.vue'
import Spinner from './spinner.vue'

export default {
  name: 'GithubPicker',
  components: { InvalidRepo, Selector, Spinner },
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
  mounted() {
    if (!this.authorized()) {
      return
    }

    const selectedRepository = JSON.parse(localStorage.getItem('selectedGithubRepository'))

    if (github.repositories.length === 1) {
      this.repo = github.repositories[0].id
      this.loadBranches()
    } else if (selectedRepository && github.repositories.find(repo => repo.full_name === selectedRepository)) {
      this.repo = selectedRepository
      this.loadBranches()
    }
  },
  watch: {
    repo(current, previous) {
      if (previous !== current) {
        localStorage.setItem('selectedGithubRepository', JSON.stringify(current))
        this.loadBranches()
      }
    },
    branch(current, previous) {
      if (current && previous !== current) {
        localStorage.setItem('selectedGithubBranch', JSON.stringify(current))
        this.loadKeyboard()
      }
    }
  },
  methods: {
    authorized() {
      return github.isGitHubAuthorized()
    },
    login() {
      github.beginLoginFlow()
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
      const previousBranch = JSON.parse(localStorage.getItem('selectedGithubBranch'))
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

      this.$emit('select', response)
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
