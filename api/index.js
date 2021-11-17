require('dotenv/config')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const applicationInit = require('./routes/application')
const keyboards = require('./routes/keyboards')

const app = express()

app.use(bodyParser.json())
app.use(cors({
  origin: 'https://nickcoutsos.github.io'
}))

if (process.env.ENABLE_DEV_SERVER) {
  applicationInit(app)
}

app.use(morgan('dev'))
app.use(keyboards)
app.use('/github', require('./routes/github'))
app.get('/health', (req, res) => res.sendStatus(200))

module.exports = app

