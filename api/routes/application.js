const childProcess = require('child_process')
const path = require('path')

const config = require('../config')

const appDir = path.join(__dirname, '..', '..', 'app')
const API_BASE_URL = 'http://127.0.0.1:8080'
const APP_BASE_URL = 'http://127.0.0.1:3000'

function init (app) {
  const opts = {
    cwd: appDir,
    env: Object.assign({}, process.env, {
      HOST: '127.0.0.1',
      BROWSER: 'none',
      REACT_APP_ENABLE_LOCAL: true,
      REACT_APP_ENABLE_GITHUB: config.ENABLE_GITHUB,
      REACT_APP_GITHUB_APP_NAME: config.GITHUB_APP_NAME,
      REACT_APP_API_BASE_URL: API_BASE_URL,
      REACT_APP_APP_BASE_URL: APP_BASE_URL
    })
  }

  const child = childProcess.spawn('npm', ['start'], { ...opts, shell: true, stdio: 'inherit' })
  child.on('error', err => console.error('Failed to start app:', err.message))
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`App process exited with code ${code}`)
    }
  })

  app.get('/', (req, res) => res.redirect(APP_BASE_URL))
}

module.exports = init
