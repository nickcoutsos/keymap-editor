const childProcess = require('child_process')
const process = require('process')
const express = require('express')
const expressWs = require('express-ws')
const bodyParser = require('body-parser')
const zmk = require('./zmk')

const app = express()
const subscribers = []
expressWs(app)
app.use(bodyParser.json())

childProcess.execFile('npm', ['run', 'build-watch'], { cwd: './application' }, err => {
  console.error(err)
  console.error('Application serving failed')
  process.exit(1)
})

const firmwares = { zmk }

function addFirmwareLibrary(req, res, next) {

  if (!('firmware' in req.query)) {
    return res.status(400).json({
      error: 'Must include "firmware" query parameter'
    })
  }

  if (!firmwares[req.query.firmware]) {
    return res.status(400).json({
      error: `Unknown firmware "${req.query.firmware}"`
    })
  }

  req.firmware = firmwares[req.query.firmware]
  next()
}

app.get('/', (req, res) => res.redirect('/application'))
app.use('/application', express.static('application/dist'))
app.get('/behaviors', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadBehaviors()))
app.get('/keycodes', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadKeycodes()))
app.get('/layout', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadLayout()))
app.get('/keymap', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadKeymap()))
app.post('/keymap', addFirmwareLibrary, (req, res) => {
  const keymap = req.body
  const layout = req.firmware.loadLayout()
  const generatedKeymap = req.firmware.generateKeymap(layout, keymap)
  const exportStdout = req.firmware.exportKeymap(generatedKeymap, 'flash' in req.query, err => {
    if (err) {
      res.status(500).send(err)
      return
    }

    res.send()
  })

  exportStdout.stdout.on('data', data => {
    for (let sub of subscribers) {
      sub.send(data)
    }
  })
})

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

const PORT = process.env.PORT || 8080
app.listen(PORT)
console.log('listening on', PORT)
