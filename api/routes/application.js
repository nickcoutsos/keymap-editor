const childProcess = require('child_process')
const path = require('path')

const config = require('../config')

const appDir = path.join(__dirname, '..', '..', 'app')
const API_BASE_URL = 'http://localhost:8080'
const APP_BASE_URL = 'http://localhost:3000'

function init (app) {
  const opts = {
    cwd: appDir,
    env: Object.assign({}, process.env, {
      ENABLE_LOCAL: true,
      ENABLE_GITHUB: config.ENABLE_GITHUB,
      GITHUB_APP_NAME: config.GITHUB_APP_NAME,
      API_BASE_URL,
      APP_BASE_URL
    })
  }

  childProcess.execFile('npm', ['start'], opts, err => {
    console.error(err)
    console.error('Application serving failed')
    process.exit(1)
  })

  app.get('/', (req, res) => res.redirect(APP_BASE_URL))
}

module.exports = init
