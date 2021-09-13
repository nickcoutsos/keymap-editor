const express = require('express')
const bodyParser = require('body-parser')

const applicationInit = require('./routes/application')
const keyboards = require('./routes/keyboards')

const app = express()

app.use(bodyParser.json())
applicationInit(app)
app.use(keyboards)

module.exports = app

