const childProcess = require('child_process')
const path = require('path')
const express = require('express')
const expressWs = require('express-ws')

const appDir = path.join(__dirname, '..', '..', 'application')

function init (app) {
  expressWs(app)
  
  childProcess.execFile('npm', ['run', 'build-watch'], { cwd: appDir }, err => {
    console.error(err)
    console.error('Application serving failed')
    process.exit(1)
  })
  
  app.get('/', (req, res) => res.redirect('/application'))
  app.use('/application', express.static(path.join(appDir, 'dist')))
  
  const subscribers = []
  app.ws('/console', (ws, req) => {
    const { remoteAddress } = req.connection
    subscribers.push(ws)
  
    console.info(`[${new Date()}] [${remoteAddress}] connected`)
  
    ws.onerror = err => {
      console.error(`[${new Date()}] [${remoteAddress}]`, err)
    }
  
    ws.onclose = () => {
      console.info(`[${new Date()}] [${remoteAddress}] disconnected`)
      const index = subscribers.indexOf(ws)
      subscribers.splice(index, 1)
    }
  })
}

module.exports = init
