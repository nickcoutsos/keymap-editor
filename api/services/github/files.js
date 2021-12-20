const api = require('./api')
const auth = require('./auth')
const zmk = require('../zmk')

const MODE_FILE = '100644'

class MissingRepoFile extends Error {
  constructor(path) {
    super()
    this.name = 'MissingRepoFile'
    this.path = path
    this.errors = [`Missing file ${path}`]
  }
}

async function fetchKeyboardFiles (installationId, repository, branch) {
  const { data: { token: installationToken } } = await auth.createInstallationToken(installationId)
  const { data: info } = await fetchFile(installationToken, repository, 'config/info.json', { raw: true, branch })
  const keymap = await fetchKeymap(installationToken, repository, branch)
  const originalCodeKeymap = await findCodeKeymap(installationToken, repository, branch)
  return { info, keymap, originalCodeKeymap }
}

async function fetchKeymap (installationToken, repository, branch) {
  try {
    const { data : keymap } = await fetchFile(installationToken, repository, 'config/keymap.json', { raw: true, branch })
    return keymap
  } catch (err) {
    if (err instanceof MissingRepoFile) {
      return {
        keyboard: 'unknown',
        keymap: 'unknown',
        layout: 'unknown',
        layer_names: ['default'],
        layers: [[]]
      }
    } else {
      throw err
    }
  }
}

async function fetchFile (installationToken, repository, path, options = {}) {
  const { raw = false, branch = null } = options
  const url = `/repos/${repository}/contents/${path}`
  const params = {}

  if (branch) {
    params.ref = branch
  }

  const headers = { Accept: raw ? 'application/vnd.github.v3.raw' : 'application/json' }
  try {
    return await api.request({ url, headers, params, token: installationToken })
  } catch (err) {
    if (err.response?.status === 404) {
      throw new MissingRepoFile(path)
    }
  }
}

async function findCodeKeymap (installationToken, repository, branch) {
  // Assume that the relevant files are under `config/` and not a complicated
  // directory structure, and that there are fewer than 1000 files in this path
  // (a limitation of GitHub's repo contents API).
  const { data: directory } = await fetchFile(installationToken, repository, 'config', { branch })
  const originalCodeKeymap = directory.find(file => file.name.toLowerCase().endsWith('.keymap'))

  if (!originalCodeKeymap) {
    throw new MissingRepoFile('config/*.keymap')
  }

  return originalCodeKeymap
}

async function findCodeKeymapTemplate (installationToken, repository, branch) {
  // Assume that the relevant files are under `config/` and not a complicated
  // directory structure, and that there are fewer than 1000 files in this path
  // (a limitation of GitHub's repo contents API).
  const { data: directory } = await fetchFile(installationToken, repository, 'config', { branch })
  const template = directory.find(file => file.name.toLowerCase().endsWith('.keymap.template'))

  if (template) {
    const { data: content } = await fetchFile(installationToken, repository, template.path, { branch, raw: true })
    return content
  }
}

async function commitChanges (installationId, repository, branch, layout, keymap) {
  const { data: { token: installationToken } } = await auth.createInstallationToken(installationId)
  const template = await findCodeKeymapTemplate(installationToken, repository, branch)

  const generatedKeymap = zmk.generateKeymap(layout, keymap, template)

  const originalCodeKeymap = await findCodeKeymap(installationToken, repository, branch)
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
  MissingRepoFile,
  fetchKeyboardFiles,
  findCodeKeymap,
  commitChanges
}
