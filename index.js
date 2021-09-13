const process = require('process')
const api = require('./api')

const PORT = process.env.PORT || 8080
api.listen(PORT)
console.log('listening on', PORT)
