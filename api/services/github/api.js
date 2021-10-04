const axios = require('axios')

const baseUrl = 'https://api.github.com'
function request (options={}) {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }

  if (options.url.startsWith('/')) {
    options.url = `${baseUrl}${options.url}`
  }

  options.headers = Object.assign({
    Accept: 'application/vnd.github.v3+json'
  }, options.headers)

  if (options.token) {
    options.headers.Authorization = `Bearer ${options.token}`
  }

  return axios(options)
}

module.exports = {
  request
}