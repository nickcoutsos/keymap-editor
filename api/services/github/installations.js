const linkHeader = require('http-link-header')

const api = require('./api')
const { createInstallationToken } = require('./auth')

async function fetchInstallations (userToken) {
  const url = '/user/installations'
  const { data: { installations } } = await api.request({ url, token: userToken })
  const active = installations.filter(installation => !installation.suspended_at)

  return active
}

async function fetchInstallationRepos (userToken) {
  const repositories = []
  const installations = await fetchInstallations(userToken)
  const repoInstallationMap = {}

  for (let installation of installations) {
    const { data: { token } } = await createInstallationToken(installation.id)

    let url = `/installation/repositories`
    while (url) {
      const { headers, data } = await api.request({ url, token })
      const paging = linkHeader.parse(headers.link || '')

      repositories.push(...data.repositories)
      for (let repo of data.repositories) {
        repoInstallationMap[repo.full_name] = installation.id
      }

      url = paging.get('rel', 'next')?.[0]?.uri
    }
  }

  return {
    installations,
    repositories,
    repoInstallationMap
  }
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
  fetchInstallations,
  fetchInstallationRepos,
  fetchRepoBranches
}
