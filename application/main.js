import './style.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'xterm/css/xterm.css'
import * as Vue from 'vue'

import App from './components/app.vue'

import { loadKeymap } from './keymap.js'
import { loadLayout } from './layout.js'

let installation
let repositories

async function init () {
  const token = new URLSearchParams(location.search).get('token')
  if (!localStorage.auth_token && token) {
    history.replaceState({}, null, '/application')
    localStorage.auth_token = token
  }

  if (localStorage.auth_token) {
    const token = localStorage.auth_token

    const data = await fetch(`http://localhost:8080/github/installation`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.json())

    if (!data.installation) {
      console.log('no installation found for authenticated user')
      location.href = 'https://github.com/apps/zmk-keymap-editor-dev/installations/new'
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
  } else {
    const login = document.createElement('button')
    login.setAttribute('style', 'display: inline-block; z-index: 100; position: absolute; right: 0px')
    login.textContent = 'Login'
    login.addEventListener('click', () => {
      localStorage.removeItem('auth_token')
      location.href = 'http://localhost:8080/github/authorize'
    })

    document.body.appendChild(login)
  }
}

async function main() {
  let layout, keymap
  await init()

  if (installation && repositories[0]) {
    const data = await fetch(
      `http://localhost:8080/github/keyboard-files/${encodeURIComponent(installation.id)}/${encodeURIComponent(repositories[0].full_name)}`,
      { headers: { Authorization: `Bearer ${localStorage.auth_token}`} }
    ).then(res => res.json())
    layout = data.info.layouts.LAYOUT.layout
    keymap = data.keymap
  } else {
    layout = await loadLayout()
    keymap = await loadKeymap()
  }

  const app = Vue.createApp(App)
  const vm = app.mount('#app')

  const socket = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}/console`)
  socket.onopen = () => console.log(new Date(), 'connected to console')
  socket.onclose = () => console.log(new Date(), 'disconnected from server')
  socket.onerror = err => console.error(new Date(), err)

  setInterval(() => socket.send('ping'), 10000)

  vm.keymap = Object.assign(keymap, {
    layer_names: keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
  })

  vm.layout = layout.map(key => (
    { ...key, u: key.u || key.w || 1, h: key.h || 1 }
  ))

  vm.layers = keymap.layers
  vm.socket = socket
}

main()
