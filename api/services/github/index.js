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
  console.log(content, btoa(content))
  return axios({
    url,
    method: 'PUT',
    headers: { Authorization: `Bearer ${installationToken}` },
    data: { content: btoa(content), message, sha: oldSha }
  }).then(res => {
    console.log(res.status, res.data)
  })
}

async function commitChanges (installationId, repository, layout, keymap) {
  const token = createAppToken()
  const accessTokensUrl = `https://api.github.com/app/installations/${installationId}/access_tokens`
  const contentsUrl = `https://api.github.com/repos/${repository}/contents`
  const generatedKeymap = zmk.generateKeymap(layout, keymap)

  const { data: { token: installationToken } } = await apiRequest(accessTokensUrl, token, 'POST')
  const { data: originalJSONKeymap } = await fetchFile(installationToken, repository, 'config/keymap.json')
  const { data: originalCodeKeymap } = await fetchFile(installationToken, repository, 'config/dactyl.keymap')

  // This is sloppy but it's the simplest wait to update multiple files.
  // Instead, this should create blobs of each file to update and craft a proper
  // git commit object for a single API call.
  // Also, we may need to search the repo for a keymap file.
  await updateFile(
    installationToken,
    `${contentsUrl}/config/dactyl.keymap`,
    originalCodeKeymap.sha,
    generatedKeymap.code,
    'Updated keymap'
  )
  await updateFile(
    installationToken,
    `${contentsUrl}/config/keymap.json`,
    originalJSONKeymap.sha,
    generatedKeymap.json,
    'Updated keymap'
  )
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
