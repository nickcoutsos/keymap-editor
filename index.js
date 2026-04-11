const api = require('./api')
const config = require('./api/config')

const server = api.listen(config.PORT, '127.0.0.1', () => {
  console.log('listening on', config.PORT)
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.PORT} is already in use. Kill the old process first:`)
    console.error(`  powershell -command "Get-NetTCPConnection -LocalPort ${config.PORT} -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"`)
  } else {
    console.error('Server error:', err.message)
  }
  process.exit(1)
})
