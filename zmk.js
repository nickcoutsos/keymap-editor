const fs = require('fs')

const ZMK_PATH = 'zmk-config'
const KEYBOARD = 'dactyl'

function loadKeymap () {
  console.log('loading from zmk')
  const keymapPath = `${ZMK_PATH}/config/boards/shields/${KEYBOARD}`
  return JSON.parse(fs.readFileSync(`${keymapPath}/__keymap.json`))
}

function generateKeymap (keymap) {
  console.log(keymap)
}

function exportKeymap (keymap, keymapCode, flash, callback) {}

module.exports = {
  loadKeymap,
  generateKeymap,
  exportKeymap
}
