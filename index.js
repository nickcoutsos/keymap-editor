const api = require('./api')
const config = require('./api/config')

api.listen(config.PORT)
console.log('listening on', config.PORT)
