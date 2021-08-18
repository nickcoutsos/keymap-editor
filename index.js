const childProcess = require('child_process')
const process = require('process')
const express = require('express')
const expressWs = require('express-ws')
const bodyParser = require('body-parser')
const qmk = require('./qmk')
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

function addLibrary(req, res, next) {
  req.keyboard = 'zmk' in req.query ? zmk : qmk
  next()
}

app.get('/', (req, res) => res.redirect('/application'))
app.use('/application', express.static('application/dist'))
app.get('/keymap', addLibrary, (req, res) => res.json(req.keyboard.loadKeymap()))
app.post('/keymap', addLibrary, (req, res) => {
  const keymap = req.body
  const layout = req.keyboard.loadLayout()
  const generatedKeymap = req.keyboard.generateKeymap(layout, keymap)
  const exportStdout = req.keyboard.exportKeymap(generatedKeymap, 'flash' in req.query, err => {
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
