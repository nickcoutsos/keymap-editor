const { Router } = require('express')
const zmk = require('../services/zmk')

const firmwares = { zmk }
const router = Router()

function addFirmwareLibrary(req, res, next) {

  if (!('firmware' in req.query)) {
    return res.status(400).json({
      error: 'Must include "firmware" query parameter'
    })
  }

  if (!firmwares[req.query.firmware]) {
    return res.status(400).json({
      error: `Unknown firmware "${req.query.firmware}"`
    })
  }

  req.firmware = firmwares[req.query.firmware]
  next()
}

router.get('/behaviors', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadBehaviors()))
router.get('/keycodes', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadKeycodes()))
router.get('/layout', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadLayout()))
router.get('/keymap', addFirmwareLibrary, (req, res) => res.json(req.firmware.loadKeymap()))
router.post('/keymap', addFirmwareLibrary, (req, res) => {
  const keymap = req.body
  const layout = req.firmware.loadLayout()
  const generatedKeymap = req.firmware.generateKeymap(layout, keymap)
  const exportStdout = req.firmware.exportKeymap(generatedKeymap, 'flash' in req.query, err => {
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

module.exports = router
