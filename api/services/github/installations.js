const linkHeader = require('http-link-header')

const api = require('./api')
const { createAppToken } = require('./auth')

async function fetchInstallation (user) {
  const token = createAppToken()
  try {
    const response = await api.request({ url: `/users/${user}/installation`, token })
    const { data } = response
    if (data.suspended_at) {
      console.log(`User ${user} has suspended app installation.`)
      return { data: null }
    }

    return response
  } catch(err) {
    if (err.response && err.response.status === 404) {
      console.log(`User ${user} does not have app installation.`)
      return { data: null }
    }

    throw err
  }
}

async function fetchInstallationRepos (installationToken, installationId) {
  const initialPage = `/user/installations/${installationId}/repositories`
  const repositories = []

  let url = initialPage
  while (url) {
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
