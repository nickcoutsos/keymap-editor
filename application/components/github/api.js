import axios from 'axios'
import EventEmitter from 'eventemitter3'

import * as config from '../../config'

export class API extends EventEmitter {
  token = null
  initialized = false
  installations = null
  repositories = null
  repoInstallationMap = null

  async _request (options) {
    if (typeof options === 'string') {
      options = {
        url: options
      }
    }

    if (options.url.startsWith('/')) {
      options.url = `${config.apiBaseUrl}${options.url}`
    }
  
    options.headers = Object.assign({}, options.headers)
    if (this.token && !options.headers.Authorization) {
      options.headers.Authorization = `Bearer ${this.token}`
    }
    
    try {
      return await axios(options)
    } catch (err) {
      if (err.response?.status === 401) {
        console.error('Authentication failed.')
        this.emit('authentication-failed', err.response)
      }

      throw err
    }
  }

  async init() {
    if (this.initialized) {
      return
    }

    const installationUrl = `${config.apiBaseUrl}/github/installation`
    const param = new URLSearchParams(window.location.search).get('token')
    if (!localStorage.auth_token && param) {
      window.history.replaceState({}, null, window.location.pathname)
      localStorage.auth_token = param
    }

    if (localStorage.auth_token) {
      this.token = localStorage.auth_token
      const { data } = await this._request(installationUrl)
      this.emit('authenticated')

      if (!data.installation) {
        console.warn('No GitHub app installation found for authenticated user.')
        this.emit('app-not-installed')
      }

      this.installations = data.installations
      this.repositories = data.repositories
      this.repoInstallationMap = data.repoInstallationMap
    }
  }

  beginLoginFlow() {
    localStorage.removeItem('auth_token')
    window.location.href = `${config.apiBaseUrl}/github/authorize`
  }

  beginInstallAppFlow() {
    window.location.href = `https://github.com/apps/${config.githubAppName}/installations/new`
  }
  
  isGitHubAuthorized() {
    return !!this.token
  }

  isAppInstalled() {
    return this.installations?.length && this.repositories?.length
  }

  async fetchRepoBranches(repo) {
    const installation = encodeURIComponent(this.repoInstallationMap[repo.full_name])
    const repository = encodeURIComponent(repo.full_name)
    const { data } = await this._request(
      `/github/installation/${installation}/${repository}/branches`
    )

    return data
  }

  async fetchLayoutAndKeymap(repo, branch) {
    const installation = encodeURIComponent(this.repoInstallationMap[repo])
    const repository = encodeURIComponent(repo)
    const url = new URL(`${config.apiBaseUrl}/github/keyboard-files/${installation}/${repository}`)

    if (branch) {
      url.search = new URLSearchParams({ branch }).toString()
    }

    try {
      const { data } = await this._request(url.toString())
      const defaultLayout = data.info.layouts.default || data.info.layouts[Object.keys(data.info.layouts)[0]]
      return {
        layout: defaultLayout.layout,
        keymap: data.keymap
      }
    } catch (err) {
      if (err.response?.status === 400) {
        console.error('Failed to load keymap and layout from github', err.response.data)
        this.emit('repo-validation-error', err.response.data)
      }

      throw err
    }
  }

  commitChanges(repo, branch, layout, keymap) {
    const installation = encodeURIComponent(this.repoInstallationMap[repo])
    const repository = encodeURIComponent(repo)

    return this._request({
      url: `/github/keyboard-files/${installation}/${repository}/${encodeURIComponent(branch)}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { layout, keymap }
    })
  }
}

export default new API()
