require('dotenv/config')
const fs = require('fs')
const path = require('path')

const axios = require('axios')
const jwt = require('jsonwebtoken')

const zmk = require('../zmk/zmk')

const pemPath = path.join(__dirname, '..', '..', '..', 'private-key.pem')
const privateKey = fs.readFileSync(pemPath)

function createAppToken () {
  return  jwt.sign({ iss: process.env.GITHUB_APP_ID }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '10m'
  })
}

function apiRequest (url, token, method='GET') {
  const headers = { Accept: 'application/vnd.github.v3+json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return axios({ url, method, headers })
}

function createOauthFlowUrl () {
  const redirectUrl = new URL('https://github.com/login/oauth/authorize')

  redirectUrl.search = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_OAUTH_CALLBACK_URL,
    state: 'foo'
  }).toString()

  return redirectUrl.toString()
}

function createOauthReturnUrl (token) {
  const url = new URL(process.env.APP_BASE_URL)
  url.search = new URLSearchParams({ token }).toString()
  return url.toString()
}

function getUserToken (oauth, user) {
  return jwt.sign({
    oauth_access_token: oauth.access_token,
    sub: user.login
  }, privateKey, {
    algorithm: 'RS256'
  })
}

function verifyUserToken (token) {
  return jwt.verify(token, privateKey, {
    algorithms: ['RS256']
  })
}

function fetchInstallation (user) {
  const token = createAppToken()
  return axios({
    method: 'GET',
    url: `https://api.github.com/users/${user}/installation`,
    headers: {
      Accept: 'application/vnd.github.v3.raw',
      Authorization: `Bearer ${token}`
    }
  }).catch(err => {
    if (err.response && err.response.status === 404) {
      return { data: null }
    }

    throw err
  })
}

function fetchInstallationRepos (token, installationId) {
  return axios({
    method: 'GET',
    url: `https://api.github.com/user/installations/${installationId}/repositories`,
    headers: {
      Accept: 'application/vnd.github.v3.raw',
      Authorization: `Bearer ${token}`
    }
  })
}

function getOauthToken (code) {
  return axios({
    method: 'POST',
    url: 'https://github.com/login/oauth/access_token',
    headers: {
      Accept: 'application/json'
    },
    data: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }
  })
}

function getOauthUser (token) {
  return axios({
    method: 'GET',
    url: 'https://api.github.com/user',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

async function fetchKeyboardFiles (installationId, repository) {
  const token = createAppToken()
  const accessTokensUrl = `https://api.github.com/app/installations/${installationId}/access_tokens`
  const contentsUrl = `https://api.github.com/repos/${repository}/contents`

  const { data: { token: installationToken } } = await apiRequest(accessTokensUrl, token, 'POST')
  const { data: info } = await fetchFile(installationToken, repository, 'config/info.json', true)
  const { data: keymap } = await axios({
    url: `${contentsUrl}/config/keymap.json`,
    headers: {
      Accept: 'application/vnd.github.v3.raw',
      Authorization: `Bearer ${installationToken}`
    }
  })

  return { info, keymap }
}

function fetchFile (installationToken, repository, path, raw = false) {
  const contentsUrl = `https://api.github.com/repos/${repository}/contents`
  return axios({
    url: `${contentsUrl}/${path}`,
    headers: {
      Accept: raw ? 'application/vnd.github.v3.raw' : 'application/json',
      Authorization: `Bearer ${installationToken}`
    }
  })
}

function updateFile(installationToken, url, oldSha, content, message) {
  return axios({
    url,
    method: 'PUT',
    headers: { Authorization: `Bearer ${installationToken}` },
    data: { content: btoa(content), message, sha: oldSha }
  })
}

async function commitChanges (installationId, repository, layout, keymap) {
  const token = createAppToken()
  const accessTokensUrl = `https://api.github.com/app/installations/${installationId}/access_tokens`
  const generatedKeymap = zmk.generateKeymap(layout, keymap)

  const { data: { token: installationToken } } = await apiRequest(accessTokensUrl, token, 'POST')

  // Assume that the relevant files are under `config/` and not a complicated
  // directory structure, and that there are fewer than 1000 files in this path
  // (a limitation of GitHub's repo contents API).
  const { data: directory } = await fetchFile(installationToken, repository, 'config/')
  const originalCodeKeymap = directory.find(file => file.name.toLowerCase().endsWith('.keymap'))

  const { data: repo } = await apiRequest(`https://api.github.com/repos/${repository}`, installationToken)
  const { data: [{sha, commit}] } = await apiRequest(`https://api.github.com/repos/${repository}/commits?per_page=1`, installationToken)

  const { data: { sha: newTreeSha } } = await axios({
    url: `https://api.github.com/repos/${repository}/git/trees`,
    method: 'POST',
    headers: { Authorization: `Bearer ${installationToken}` },
    data: {
      base_tree: commit.tree.sha,
      tree: [
        {
          path: originalCodeKeymap.path,
          mode: '100644',
          type: 'blob',
          content: generatedKeymap.code
        },
        {
          path: 'config/keymap.json',
          mode: '100644',
          type: 'blob',
          content: generatedKeymap.json
        }
      ]
    }
  })

  const { data: { sha: newSha } } = await axios({
    url: `https://api.github.com/repos/${repository}/git/commits`,
    method: 'POST',
    headers: { Authorization: `Bearer ${installationToken}` },
    data: {
      tree: newTreeSha,
      message: 'Updated keymap',
      parents: [sha]
    }
  })

  await axios({
    url: `https://api.github.com/repos/${repository}/git/refs/heads/${repo.default_branch}`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${installationToken}` },
    data: {
      sha: newSha
    }
  })
}

module.exports = {
  createOauthFlowUrl,
  createOauthReturnUrl,
  getOauthToken,
  getOauthUser,
  getUserToken,
  verifyUserToken,
  fetchInstallation,
  fetchInstallationRepos,
  fetchKeyboardFiles,
  commitChanges
}
