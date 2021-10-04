const api = require('./api')
const { createAppToken } = require('./auth')

function fetchInstallation (user) {
  const token = createAppToken()
  return api.request({ url: `/users/${user}/installation`, token }).catch(err => {
    if (err.response && err.response.status === 404) {
      return { data: null }
    }

    throw err
  })
}

function fetchInstallationRepos (installationToken, installationId) {
  return api.request({
    url: `/user/installations/${installationId}/repositories`,
    token: installationToken
  })
}

module.exports = {
  fetchInstallation,
  fetchInstallationRepos
}
