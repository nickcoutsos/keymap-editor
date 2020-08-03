// run: 
const fs = require('fs')
const childProcess = require('child_process')
const express = require('express')
const expressWs = require('express-ws')
const bodyParser = require('body-parser')

const app = express()
const subscribers = []
expressWs(app)
app.use(bodyParser.json())

const QMK_PATH = 'qmk_firmware'
const KEYBOARD = 'handwired/dactyl_reduced'

app.get('/', (req, res) => res.redirect('/application'))
app.use('/application', express.static('application'))

app.get('/keymap', (req, res) => {
  const keymapPath = `${QMK_PATH}/keyboards/${KEYBOARD}/keymaps/generated`
  const keymap = JSON.parse(fs.readFileSync(`${keymapPath}/keymap.json`))
  res.json(keymap)
})

app.post('/keymap', (req, res) => {
  const keymap = req.body
  const layers = keymap.layers.map((layer, i) => {
    return `\n\t[${i}] = ${keymap.layout}(\n\t\t${layer.join(',\n\t\t')}\n\t)`
  })

  const keymapOut = `#include QMK_KEYBOARD_H

/* THIS FILE WAS GENERATED!
 *
 * This file was generated automatically. You may or may not want to
 * edit it directly.
 */

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
  ${layers}
};`

  const keymapPath = `${QMK_PATH}/keyboards/${KEYBOARD}/keymaps/generated`
  const makeArgs = [`${KEYBOARD}:default${'flash' in req.query ? ':avrdude': ''}`]

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(`${keymapPath}/keymap.json`, JSON.stringify(keymap, null, 2))
  fs.writeFileSync(`${keymapPath}/keymap.c`, keymapOut)

  childProcess.execFile('make', makeArgs, { cwd: QMK_PATH }, (err) => {
    if (err) {
      res.status(500).send(err)
      return
    }

    res.send()
  }).stdout.on('data', data => {
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

app.listen(process.env.PORT || 8080)
