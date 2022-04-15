import find from 'lodash/find'
import map from 'lodash/map'
import { useEffect, useState } from 'react'

import github from './api'
import * as storage from './storage'
import ValidationErrors from './ValidationErrors'

import IconButton from '../../Common/IconButton'
import Selector from '../../Common/Selector'
import Spinner from '../../Common/Spinner'

function Login() {
  return (
    <IconButton
      brand
      icon="github"
      text="Login with GitHub"
      onClick={() => github.beginLoginFlow()}
    />
  )
}

function Install() {
  return (
    <IconButton
      brand
      icon="github"
      text="Add Repository"
      onClick={() => github.beginInstallAppFlow()}
    />
  )
}

export default function GithubPicker() {
  const [initialized, setInitialized] = useState(false)
  const [repoId, setRepoId] = useState(null)
  const [branchName, setBranchName] = useState(null)
  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingKeyboard, setLoadingKeyboard] = useState(false)
  const [loadKeyboardError, setLoadKeyboardError] = useState(null)
  const [loadKeyboardWarnings, setLoadKeyboardWarnings] = useState(null)

  useEffect(() => {
    github.init().then(() => {
      const persistedRepoId = storage.getPersistedRepository()
      const repositories = github.repositories || []

      if (find(repositories, { id: persistedRepoId })) {
        setRepoId(persistedRepoId)
      } else if (repositories.length > 0) {
        setRepoId(repositories[0].id)
      }

      setInitialized(true)
    })
  }, [])

  useEffect(() => {
    github.on('authentication-failed', () => {
      github.beginLoginFlow()
    })
  }, [])

  useEffect(() => {
    github.on('repo-validation-error', err => {
      setLoadKeyboardError(err)
      setLoadingKeyboard(false)
    })
  }, [])

  useEffect(() => {
    if (!repoId) {
      return
    }

    ;(async function() {
      setLoadingBranches(true)
      const repository = find(github.repositories, { id: repoId })
      const branches = await github.fetchRepoBranches(repository)

      setBranches(branches)
      setLoadingBranches(false)

      const available = map(branches, 'name')
      const defaultBranch = repository.default_branch
      const currentBranch = branchName
      const previousBranch = storage.getPersistedBranch(repoId)
      const onlyBranch = branches.length === 1 ? branches[0].name : null

      for (let branch of [onlyBranch, currentBranch, previousBranch, defaultBranch]) {
        if (available.includes(branch)) {
          setBranchName(branch)
          break
        }
      }
    })()
  }, [repoId])

  useEffect(() => {
    if (!repoId || !branchName) {
      return
    }

    loadKeyboard()
  }, [repoId, branchName])


  if (!initialized) {
    return null
  }

  if (!github.isGitHubAuthorized()) return <Login />
  if (!github.isAppInstalled()) return <Install />

  const repositoryChoices = github.repositories.map(repo => ({
    id: repo.id,
    name: repo.full_name
  }))

  const branchChoices = branches.map(branch => ({
    id: branch.name,
    name: branch.name
  }))

  function clearSelection() {
    setBranchName(null)
    setLoadKeyboardError(null)
    setLoadKeyboardWarnings(null)
  }

  async function loadKeyboard() {
    const available = github.repositories
    const repository = find(available, { id: repoId })?.full_name
    const branch = branchName

    setLoadingKeyboard(true)
    setLoadKeyboardError(null)

    const response = await github.fetchLayoutAndKeymap(repository, branch)

    setLoadingKeyboard(false)
    lintKeyboard(response)
  }

  function lintKeyboard({ layout }) {
    const noKeyHasPosition = layout.every(key => (
      key.row === undefined &&
      key.col === undefined
    ))

    if (noKeyHasPosition) {
      setLoadKeyboardWarnings([
        'Layout in info.json has no row/col definitions. Generated keymap files will not be nicely formatted.'
      ])
    }
  }

  return (
    <>
      <Selector
        id="repo"
        label="Repository"
        value={repoId}
        choices={repositoryChoices}
        onUpdate={setRepoId}
      />

      {loadingBranches && <Spinner />}
      {branches.length && (
        <Selector
          id="branch"
          label="Branch"
          value={branchName}
          choices={branchChoices}
          onUpdate={setBranchName}
        />
      )}

      {loadingKeyboard && <Spinner />}

      {loadKeyboardError && (
        <ValidationErrors
          title={loadKeyboardError.name}
          errors={loadKeyboardError.errors}
          otherRepoOrBranchAvailable={
            repositoryChoices.length > 1
            || branchChoices.length > 0
          }
          onDismiss={clearSelection}
        />
      )}
      {loadKeyboardWarnings && (
        <ValidationErrors
          title="Warning"
          errors={loadKeyboardWarnings}
          onDismiss={() => setLoadKeyboardWarnings(null)}
        />
      )}

      {branchName && !loadingKeyboard && (
        <button className="fa fa-sync" onClick={loadKeyboard} />
      )}
    </>
  )
}
