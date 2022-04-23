const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const api = require('./api')
const config = require('../../config')

const pemPath = path.join(__dirname, '..', '..', '..', 'private-key.pem')
const privateKey = config.GITHUB_APP_PRIVATE_KEY || fs.readFileSync(pemPath)

function createAppToken () {
  return  jwt.sign({ iss: config.GITHUB_APP_ID }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '10m'
  })
}

function createInstallationToken (installationId) {
  const token = createAppToken()
  const url = `/app/installations/${installationId}/access_tokens`
  return api.request({ url, method: 'POST', token })
}

function createOauthFlowUrl () {
  const redirectUrl = new URL('https://github.com/login/oauth/authorize')

  redirectUrl.search = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_OAUTH_CALLBACK_URL,
    state: 'foo'
  }).toString()

  return redirectUrl.toString()
}

function createOauthReturnUrl (token) {
  const url = new URL(config.APP_BASE_URL)
  url.search = new URLSearchParams({ token }).toString()
  return url.toString()
}

function getOauthToken (code) {
  return api.request({
    method: 'POST',
    url: 'https://github.com/login/oauth/access_token',
    headers: {
      Accept: 'application/json'
    },
    data: {
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code
    }
  })
}

function getOauthUser (token) {
  return api.request({ url: '/user', headers: { Accept: 'application/json' }, token })
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

module.exports = {
  createAppToken,
  createInstallationToken,
  createOauthFlowUrl,
  createOauthReturnUrl,
  getOauthToken,
  getOauthUser,
  getUserToken,
  verifyUserToken
}
