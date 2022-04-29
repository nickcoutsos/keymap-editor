const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const config = require('./config')
const applicationInit = require('./routes/application')
const keyboards = require('./routes/keyboards')

const app = express()

app.use(bodyParser.json())
app.use(cors({
  origin: 'https://nickcoutsos.github.io'
}))

if (config.ENABLE_DEV_SERVER) {
  applicationInit(app)
}

app.use(morgan('dev'))
app.get('/health', (req, res) => res.sendStatus(200))

app.use(keyboards)
config.ENABLE_GITHUB && app.use('/github', require('./routes/github'))

module.exports = app

