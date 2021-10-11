function parseBoolean (val) {
  return val && ['1', 'on', 'yes', 'true'].includes(val.toString().toLowerCase())
}

export const apiBaseUrl = process.env.API_BASE_URL
export const appBaseUrl = process.env.APP_BASE_URL
export const githubAppName = process.env.GITHUB_APP_NAME
export const enableGitHub = parseBoolean(process.env.ENABLE_GITHUB)
export const enableLocal = parseBoolean(process.env.ENABLE_LOCAL)
