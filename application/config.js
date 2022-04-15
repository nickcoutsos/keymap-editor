function parseBoolean (val) {
  return val && ['1', 'on', 'yes', 'true'].includes(val.toString().toLowerCase())
}

function env(key) {
  return process.env[key] || process.env[`REACT_APP_${key}`]
}

export const apiBaseUrl = env('API_BASE_URL')
export const appBaseUrl = env('APP_BASE_URL')
export const githubAppName = env('GITHUB_APP_NAME')
export const enableGitHub = parseBoolean(env('ENABLE_GITHUB'))
export const enableLocal = parseBoolean(env('ENABLE_LOCAL'))
