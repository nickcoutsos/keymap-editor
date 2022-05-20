const REPOSITORY = 'selectedGithubRepository'
const BRANCH = 'selectedGithubBranch'

export function getPersistedRepository() {
  try {
    return JSON.parse(localStorage.getItem(REPOSITORY))
  } catch {
    return null
  }
}

export function setPersistedRepository(repository) {
  localStorage.setItem(REPOSITORY, JSON.stringify(repository))
}

export function getPersistedBranch(repoId) {
  try {
    return JSON.parse(localStorage.getItem(`${BRANCH}:${repoId}`))
  } catch {
    return null
  }
}

export function setPersistedBranch(repoId, branch) {
  localStorage.setItem(`${BRANCH}:${repoId}`, JSON.stringify(branch))
}
