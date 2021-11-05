const linkHeader = require('http-link-header')

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

async function fetchInstallationRepos (installationToken, installationId) {
  const initialPage = `/user/installations/${installationId}/repositories`
  const repositories = []

  let url = initialPage
  while (url) {
    console.log('fetching page', url)
    const { headers, data } = await api.request({ url, token: installationToken })
    const paging = linkHeader.parse(headers.link || '')
    repositories.push(...data.repositories)
    url = paging.get('rel', 'next')?.[0]?.uri
  }

  return repositories
}

async function fetchRepoBranches (installationToken, repo) {
  const initialPage = `/repos/${repo}/branches`
  const branches = []
  
  let url = initialPage
  while (url) {
    const { headers, data } = await api.request({ url, token: installationToken })
    const paging = linkHeader.parse(headers.link || '')
    branches.push(...data)
    url = paging.get('rel', 'next')?.[0]?.uri
  }

  return branches
}

module.exports = {
  fetchInstallation,
  fetchInstallationRepos,
  fetchRepoBranches
}
