import './style.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'xterm/css/xterm.css'
import * as Vue from 'vue'

import App from './components/app.vue'

import { loadKeymap } from './keymap.js'
import { loadLayout } from './layout.js'

async function main() {
  const layout = await loadLayout()
  const keymap = await loadKeymap()

  const app = Vue.createApp(App)
  const vm = app.mount('#app')

  const socket = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}/console`)
  socket.onopen = () => console.log(new Date(), 'connected to console')
  socket.onclose = () => console.log(new Date(), 'disconnected from server')
  socket.onerror = err => console.error(new Date(), err)

  setInterval(() => socket.send('ping'), 10000)

  vm.keymap = keymap
  vm.layout = layout
  vm.layers = keymap.layers
  vm.socket = socket

  // document.querySelector('#export').addEventListener('click', () => {
  //   const keymap = buildKeymap()
  //   const file = new File([JSON.stringify(keymap, null, 2)], 'default.json', {
  //     type: 'application/octet-stream'
  //   })

  //   location.href = URL.createObjectURL(file)
  // })

  // document.querySelector('#compile').addEventListener('click', () => compile())
  // document.querySelector('#flash').addEventListener('click', () => compile({ flash: true }))

  // document.querySelector('#toggle').addEventListener('click', () => toggleTerminal())
}

main()
