const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { parseKeymap } = require('./keymap')

const ZMK_PATH = path.join(__dirname, '..', '..', '..', 'zmk-config')
const KEYBOARD = 'dactyl'

function loadBehaviors() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-behaviors.json')))
}

function loadKeycodes() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-keycodes.json')))
}

function loadLayout (layout = 'LAYOUT') {
  const layoutPath = path.join(ZMK_PATH, 'config', 'info.json')
  return JSON.parse(fs.readFileSync(layoutPath)).layouts[layout].layout
}

function loadKeymap () {
  const keymapPath = path.join(ZMK_PATH, 'config', 'keymap.json')
  return parseKeymap(JSON.parse(fs.readFileSync(keymapPath)))
}

function findKeymapFile () {
  const files = fs.readdirSync(path.join(ZMK_PATH, 'config'))
  return files.find(file => file.endsWith('.keymap'))
}

function exportKeymap (generatedKeymap, flash, callback) {
  const keymapPath = path.join(ZMK_PATH, 'config')
  const keymapFile = findKeymapFile()

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(path.join(keymapPath, 'keymap.json'), generatedKeymap.json)
  fs.writeFileSync(path.join(keymapPath, keymapFile), generatedKeymap.code)

  // Note: This isn't really helpful. In the QMK version I had this actually
  // calling `make` and piping the output in realtime but setting up a ZMK dev
  // environment proved to be more complex than I had patience for, so for now
  // I'm writing changes to a zmk-config repo and counting on the predefined
  // GitHub action to actually compile.
  return childProcess.execFile('git', ['status'], { cwd: ZMK_PATH }, callback)
}

module.exports = {
  loadBehaviors,
  loadKeycodes,
  loadLayout,
  loadKeymap,
  exportKeymap
}
