// run: child_process.execFile('make', ['handwired/dactyl_reduced:default:avrdude']).stdout.pipe(process.stdout)
const express = require('express')
const expressWs = require('express-ws')

const app = express()
const subscribersByTopic = {}
expressWs(app)

function registerSubscriber (topic, ws) {
  if (!subscribersByTopic[topic]) {
    subscribersByTopic[topic] = []
  }

  subscribersByTopic[topic].push(ws)
}

app.use('/application', express.static('application'))

app.ws('/topics/:topic', (ws, req) => {
  const { remoteAddress } = req.connection
  const { topic } = req.params

  registerSubscriber(topic, ws)

  console.info(`[${new Date()}] [${remoteAddress}] connected`)

  ws.onerror = err => {
    console.error(`[${new Date()}] [${remoteAddress}]`, err)
  }

  ws.onclose = () => {
    console.info(`[${new Date()}] [${remoteAddress}] disconnected`)
    const index = subscribersByTopic[topic].indexOf(ws)
    subscribersByTopic[topic].splice(index, 1)
  }
})

app.listen(process.env.PORT || 8080)
