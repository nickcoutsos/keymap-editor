const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const applicationInit = require('./routes/application')
const keyboards = require('./routes/keyboards')

const app = express()

app.use(bodyParser.json())
app.use(cors())

if (process.env.ENABLE_DEV_SERVER) {
  applicationInit(app)
}

app.use(keyboards)
app.use(require('./routes/github'))

module.exports = app

