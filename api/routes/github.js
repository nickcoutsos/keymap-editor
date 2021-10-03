const { Router } = require('express')

const {
  getOauthToken,
  getOauthUser,
  getUserToken,
  verifyUserToken,
  fetchInstallation,
  fetchInstallationRepos,
  fetchKeyboardFiles,
  createOauthFlowUrl,
  createOauthReturnUrl,
  commitChanges
} = require('../services/github')

const router = Router()

const authorize = async (req, res) => {
  if (req.query.code) {
    const { data: oauth } = await getOauthToken(req.query.code)
    const { data: user } = await getOauthUser(oauth.access_token)
    const token = getUserToken(oauth, user)
    res.redirect(createOauthReturnUrl(token))
  } else {
    res.redirect(createOauthFlowUrl())
  }
}

const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  const token = (header || '').split(' ')[1]

  if (!token) {
    return res.sendStatus(401)
  }

  try {
    req.user = verifyUserToken(token)
  } catch (err) {
    console.error('Failed to verify token', err)
    return res.sendStatus(401)
  }

  next()
}

const getInstallation = async (req, res) => {
  const { user } = req
  
  try {
    const { data: installation } = await fetchInstallation(user.sub)

    if (!installation) {
      return res.json({ installation: null })
    }

    const { data: { repositories } } = await fetchInstallationRepos(user.oauth_access_token, installation.id)

    res.json({ installation, repositories })
  } catch (err) {
    const message = err.response ? err.response.data : err
    console.error(message)
    res.status(500).json(message)
  }
}

const getKeyboardFiles = async (req, res) => {
  const { installationId, repository } = req.params

  try {
    const keyboardFiles = await fetchKeyboardFiles(installationId, repository)
    res.json(keyboardFiles)
  } catch (err) {
    const message = err.response ? err.response.data : err
    console.error(message)
    res.status(500).json(message)
  }
}

const updateKeyboardFiles = async (req, res) => {
  const { installationId, repository } = req.params
  const { keymap, layout } = req.body

  try {
    await commitChanges(installationId, repository, layout, keymap)
  } catch (err) {
    const message = err.response ? err.response.data : err
    console.error(message)
    res.status(500).json(message)
  }

  res.sendStatus(200)
}

const receiveWebhook = (req, res) => {
  res.sendStatus(200)
}

router.get('/github/authorize', authorize)
router.get('/github/installation', authenticate, getInstallation)
router.get('/github/keyboard-files/:installationId/:repository', authenticate, getKeyboardFiles)
router.post('/github/keyboard-files/:installationId/:repository', authenticate, updateKeyboardFiles)
router.post('/github/webhook', receiveWebhook)

module.exports = router
