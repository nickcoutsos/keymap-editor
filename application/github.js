import * as config from './config'

let token
let installation
let repositories

export async function init () {
  const param = new URLSearchParams(location.search).get('token')
  if (!localStorage.auth_token && param) {
    history.replaceState({}, null, '/application')
    localStorage.auth_token = param
  }

  if (localStorage.auth_token) {
    token = localStorage.auth_token
    const data = await fetch(`${config.apiBaseUrl}/github/installation`, {
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

    const logout = document.createElement('button')
    logout.setAttribute('style', 'display: inline-block; z-index: 100; position: absolute; right: 0px')
    logout.textContent = 'Logout'
    logout.addEventListener('click', () => {
      localStorage.removeItem('auth_token')
      location.reload()
    })

    document.body.appendChild(logout)
  }
}

export function isGitHubAuthorized() {
  return !!token && installation && repositories && repositories.length
}

export async function fetchLayoutAndKeymap() {
  const data = await fetch(
    `${config.apiBaseUrl}/github/keyboard-files/${encodeURIComponent(installation.id)}/${encodeURIComponent(repositories[0].full_name)}`,
    { headers: { Authorization: `Bearer ${localStorage.auth_token}`} }
  ).then(res => res.json())
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

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ layout, keymap })
  })
}
