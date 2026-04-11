const { Router } = require('express')
const zmk = require('../services/zmk')

const router = Router()

router.get('/behaviors', (req, res) => res.json(zmk.loadBehaviors()))
router.get('/keycodes', (req, res) => res.json(zmk.loadKeycodes()))
router.get('/aliases', (req, res) => res.json(zmk.loadAliases()))
router.get('/layout', (req, res) => res.json(zmk.loadLayout()))
router.get('/keymap', (req, res) => res.json(zmk.loadKeymap()))
router.post('/keymap', (req, res) => {
  const keymap = req.body

  try {
    zmk.validateKeymapJson(keymap)
  } catch (err) {
    if (err.name === 'KeymapValidationError') {
      return res.status(400).json({ errors: err.errors })
    }
    return res.status(500).send(String(err))
  }

  const layout = zmk.loadLayout()
  const generatedKeymap = zmk.generateKeymap(layout, keymap)
  const exportStdout = zmk.exportKeymap(generatedKeymap, 'flash' in req.query, err => {
    if (err) {
      res.status(500).send(err)
      return
    }

    res.send()
  })

  // exportStdout.stdout.on('data', data => {
  //   for (let sub of subscribers) {
  //     sub.send(data)
  //   }
  // })
})

router.get('/macros', (req, res) => res.json(zmk.loadMacros()))
router.post('/macros', (req, res) => {
  zmk.exportMacros(req.body, err => {
    if (err) { res.status(500).send(err); return }
    res.send()
  })
})

router.get('/combos', (req, res) => res.json(zmk.loadCombos()))
router.post('/combos', (req, res) => {
  zmk.exportCombos(req.body, err => {
    if (err) { res.status(500).send(err); return }
    res.send()
  })
})

router.post('/git/push', (req, res) => {
  zmk.gitCommitPush((err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: err.message, stderr })
    }
    const actionsUrl = zmk.getActionsUrl()
    res.json({ stdout, stderr, actionsUrl })
  })
})

module.exports = router
