const REPOSITORY = 'selectedGithubRepository'
const BRANCH = 'selectedGithubBranch'

export function getPersistedRepository() {
  return JSON.parse(localStorage.getItem(REPOSITORY))
}

export function setPersistedRepository(repository) {
  localStorage.setItem(REPOSITORY, JSON.stringify(repository))
}

export function getPersistedBranch() {
  return JSON.parse(localStorage.getItem(BRANCH))
}

export function setPersistedBranch(branch) {
  localStorage.setItem(BRANCH, JSON.stringify(branch))
}
