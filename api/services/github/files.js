const api = require('./api')
const auth = require('./auth')
const zmk = require('../zmk')

const MODE_FILE = '100644'

class InvalidRepoError extends Error {}

async function fetchKeyboardFiles (installationId, repository, branch) {
  const { data: { token: installationToken } } = await auth.createInstallationToken(installationId)
  try {
    const { data: info } = await fetchFile(installationToken, repository, 'config/info.json', { raw: true, branch })
    const { data: keymap } = await fetchFile(installationToken, repository, 'config/keymap.json', { raw: true, branch })

    return { info, keymap }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new InvalidRepoError()
    }

    throw err
  }
}

function fetchFile (installationToken, repository, path, options = {}) {
  const { raw = false, branch = null } = options
  const url = `/repos/${repository}/contents/${path}`
  const params = {}

  if (branch) {
    params.ref = branch
  }

  const headers = { Accept: raw ? 'application/vnd.github.v3.raw' : 'application/json' }
  return api.request({ url, headers, params, token: installationToken })
}

async function commitChanges (installationId, repository, branch, layout, keymap) {
  const { data: { token: installationToken } } = await auth.createInstallationToken(installationId)
  const generatedKeymap = zmk.generateKeymap(layout, keymap)

  // Assume that the relevant files are under `config/` and not a complicated
  // directory structure, and that there are fewer than 1000 files in this path
  // (a limitation of GitHub's repo contents API).
  const { data: directory } = await fetchFile(installationToken, repository, 'config/')
  const originalCodeKeymap = directory.find(file => file.name.toLowerCase().endsWith('.keymap'))

  const { data: {sha, commit} } = await api.request({ url: `/repos/${repository}/commits/${branch}`, token: installationToken })

  const { data: { sha: newTreeSha } } = await api.request({
    url: `/repos/${repository}/git/trees`,
    method: 'POST',
    token: installationToken,
    data: {
      base_tree: commit.tree.sha,
      tree: [
        {
          path: originalCodeKeymap.path,
          mode: MODE_FILE,
          type: 'blob',
          content: generatedKeymap.code
        },
        {
          path: 'config/keymap.json',
          mode: MODE_FILE,
          type: 'blob',
          content: generatedKeymap.json
        }
      ]
    }
  })

  const { data: { sha: newSha } } = await api.request({
    url: `/repos/${repository}/git/commits`,
    method: 'POST',
    token: installationToken,
    data: {
      tree: newTreeSha,
      message: 'Updated keymap',
      parents: [sha]
    }
  })

  await api.request({
    url: `/repos/${repository}/git/refs/heads/${branch}`,
    method: 'PATCH',
    token: installationToken,
    data: {
      sha: newSha
    }
  })
}

module.exports = {
  InvalidRepoError,
  fetchKeyboardFiles,
  commitChanges
}
