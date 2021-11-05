import * as config from './config'

let token
export let installation
export let repositories

function request (...args) {
  return fetch(...args).then(res => {
    return res.status !== 401 ? res : (
      console.error('Authentication failure. Retrying login'),
      beginLoginFlow()
    )
  })
}

export async function init () {
  const param = new URLSearchParams(location.search).get('token')
  if (!localStorage.auth_token && param) {
    history.replaceState({}, null, location.pathname)
    localStorage.auth_token = param
  }

  if (localStorage.auth_token) {
    token = localStorage.auth_token
    const data = await request(`${config.apiBaseUrl}/github/installation`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.json())

    if (!data.installation) {
      console.log('no installation found for authenticated user')
      location.href = `https://github.com/apps/${config.githubAppName}/installations/new`
    }

    installation = data.installation
    repositories = data.repositories
  }
}

export function beginLoginFlow () {
  localStorage.removeItem('auth_token')
  location.href = `${config.apiBaseUrl}/github/authorize`
}

export function isGitHubAuthorized() {
  return !!token && installation && repositories && repositories.length
}

export async function fetchRepoBranches(repository) {
  const response = await request(
    `${config.apiBaseUrl}/github/installation/${encodeURIComponent(installation.id)}/${encodeURIComponent(repository.full_name)}/branches`,
    { headers: { Authorization: `Bearer ${localStorage.auth_token}`} }
  )

  return response.json()
}

export async function fetchLayoutAndKeymap() {
  const response = await request(
    `${config.apiBaseUrl}/github/keyboard-files/${encodeURIComponent(installation.id)}/${encodeURIComponent(repositories[0].full_name)}`,
    { headers: { Authorization: `Bearer ${localStorage.auth_token}`} }
  )

  if (response.status === 400) {
    console.error('Failed to load keymap and layout from github')
    return response.json()
  }
  
  const data = await response.json()
  const defaultLayout = data.info.layouts.default || data.info.layouts[Object.keys(data.info.layouts)[0]]
  return {
    layout: defaultLayout.layout,
    keymap: data.keymap
  }
}

export function commitChanges(layout, keymap) {
  const installationId = encodeURIComponent(installation.id)
  const repository = encodeURIComponent(repositories[0].full_name)
  const url = `${config.apiBaseUrl}/github/keyboard-files/${installationId}/${repository}`

  return request(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ layout, keymap })
  })
}
