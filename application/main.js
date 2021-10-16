import './style.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'xterm/css/xterm.css'
import * as Vue from 'vue'

import App from './components/app.vue'
import * as github from './github'

async function main() {
  await github.init()

  Vue.createApp(App).mount('body')
}

main()
