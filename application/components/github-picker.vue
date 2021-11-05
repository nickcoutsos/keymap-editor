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
  </span>

</template>

<script>
import * as github from '../github'
import Selector from './selector.vue'
import Spinner from './spinner.vue'

export default {
  name: 'GithubPicker',
  components: { Selector, Spinner },
  data() {
    return {
      repo: null,
      branch: null,
      branches: [],
      loadingBranches: false
    }
  },
  mounted() {
    if (github.repositories.length === 1) {
      this.repo = github.repositories[0].id
      this.loadBranches()
    }
  },
  watch: {
    repo(current, previous) {
      if (previous !== current) {
        this.loadBranches()
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

      const repository = github.repositories.find(repo => repo.id === this.repo)
      const branches = await github.fetchRepoBranches(repository)

      this.loadingBranches = false
      this.branch = branches.find(branch => branch.name === repository.default_branch)?.name
      this.branches = branches
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
        id: branch.id,
        name: branch.name
      }))
    }
  }
}
</script>
