import './style.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'xterm/css/xterm.css'
import * as Vue from 'vue'

import App from './components/app.vue'
import * as config from './config'
import * as github from './github'

import { loadKeymap } from './keymap.js'
import { loadLayout } from './layout.js'

async function main() {
  let layout, keymap
  await github.init()

  if (config.enableGitHub && github.isGitHubAuthorized()) {
    const data = await github.fetchLayoutAndKeymap()
    layout = data.layout
    keymap = data.keymap
  } else if (config.enableLocal) {
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
