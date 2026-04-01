const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { parseKeymap } = require('./keymap')

const ZMK_PATH = path.join(__dirname, '..', '..', '..', 'zmk-config')
const KEYBOARD = 'totem'

const EMPTY_KEYMAP = {
  keyboard: 'unknown',
  keymap: 'unknown',
  layout: 'unknown',
  layer_names: ['default'],
  layers: [[]]
}

function loadBehaviors() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-behaviors.json')))
}

function loadKeycodes() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-keycodes.json')))
}

function loadLayout (layout = 'LAYOUT') {
  const layoutPath = path.join(ZMK_PATH, 'config', 'info.json')
  const fallbackPath = path.join(__dirname, '..', '..', '..', 'app', 'src', 'data', 'totem.json')
  const source = fs.existsSync(layoutPath) ? layoutPath : fallbackPath
  return JSON.parse(fs.readFileSync(source)).layouts[layout].layout
}

function loadKeymap () {
  const keymapPath = path.join(ZMK_PATH, 'config', 'keymap.json')
  const keymapContent = fs.existsSync(keymapPath)
    ? JSON.parse(fs.readFileSync(keymapPath))
    : EMPTY_KEYMAP

  return parseKeymap(keymapContent)
}

function findKeymapFile () {
  const files = fs.readdirSync(path.join(ZMK_PATH, 'config'))
  return files.find(file => file.endsWith('.keymap'))
}

function extractKeymapBlock (source) {
  const start = source.search(/\bkeymap\s*\{/)
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      if (--depth === 0) {
        const end = source.indexOf(';', i) + 1
        return { start, end, block: source.slice(start, end) }
      }
    }
  }
  return null
}

function mergeKeymapCode (existingContent, generatedCode) {
  const existing = extractKeymapBlock(existingContent)
  const generated = extractKeymapBlock(generatedCode)
  if (!existing || !generated) return generatedCode
  return existingContent.slice(0, existing.start) +
    generated.block +
    existingContent.slice(existing.end)
}

function loadCombos () {
  const combosPath = path.join(ZMK_PATH, 'config', 'combos.json')
  if (!fs.existsSync(combosPath)) return []
  return JSON.parse(fs.readFileSync(combosPath))
}

function generateCombosDTS (combos) {
  if (!combos || combos.length === 0) return null
  const blocks = combos.map(combo => {
    const lines = [`        ${combo.name} {`]
    if (combo.timeout) lines.push(`            timeout-ms = <${combo.timeout}>;`)
    lines.push(`            key-positions = <${combo.positions.join(' ')}>;`)
    lines.push(`            bindings = <${combo.binding}>;`)
    if (combo.layers && combo.layers.length) lines.push(`            layers = <${combo.layers.join(' ')}>;`)
    lines.push(`        };`)
    return lines.join('\n')
  }).join('\n\n')
  return `    combos {\n        compatible = "zmk,combos";\n\n${blocks}\n    };`
}

function mergeCombosInKeymap (content, combosDTS) {
  const existing = extractBlock(content, /\bcombos\s*\{/)
  if (existing) {
    return content.slice(0, existing.start) + combosDTS + content.slice(existing.end)
  }
  // Insert before macros block if present, otherwise before keymap block
  const macrosPos = content.search(/\n[\t ]*macros[\t ]*\{/)
  if (macrosPos !== -1) {
    return content.slice(0, macrosPos) + '\n\n' + combosDTS + content.slice(macrosPos)
  }
  const keymapPos = content.search(/\n[\t ]*keymap[\t ]*\{/)
  if (keymapPos === -1) return content + '\n\n' + combosDTS
  return content.slice(0, keymapPos) + '\n\n' + combosDTS + content.slice(keymapPos)
}

function exportCombos (combos, callback) {
  const combosPath = path.join(ZMK_PATH, 'config', 'combos.json')
  fs.writeFileSync(combosPath, JSON.stringify(combos, null, 2))

  const keymapFile = findKeymapFile()
  if (keymapFile) {
    const keymapFilePath = path.join(ZMK_PATH, 'config', keymapFile)
    if (fs.existsSync(keymapFilePath)) {
      const existing = fs.readFileSync(keymapFilePath, 'utf8')
      const combosDTS = generateCombosDTS(combos)
      const updated = combosDTS
        ? mergeCombosInKeymap(existing, combosDTS)
        : existing
      fs.writeFileSync(keymapFilePath, updated)
    }
  }

  return childProcess.execFile('git', ['status'], { cwd: ZMK_PATH }, callback)
}

function loadMacros () {
  const macrosPath = path.join(ZMK_PATH, 'config', 'macros.json')
  if (!fs.existsSync(macrosPath)) return []
  return JSON.parse(fs.readFileSync(macrosPath))
}

function generateMacrosDTS (macros) {
  if (!macros || macros.length === 0) return null
  const blocks = macros.map(macro => {
    const name = macro.code.replace(/^&/, '')
    return [
      `        ${name}: ${name} {`,
      `            compatible = "zmk,behavior-macro";`,
      `            #binding-cells = <0>;`,
      `            bindings =`,
      `                <&macro_press>,`,
      `                <&kp ${macro.modifier}>,`,
      `                <&macro_tap>,`,
      `                <&kp ${macro.key}>,`,
      `                <&macro_release>,`,
      `                <&kp ${macro.modifier}>;`,
      `            label = "${name.toUpperCase()}";`,
      `        };`
    ].join('\n')
  }).join('\n\n')
  return `    macros {\n${blocks}\n    };`
}

function extractBlock (source, pattern) {
  const start = source.search(pattern)
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      if (--depth === 0) {
        const end = source.indexOf(';', i) + 1
        return { start, end }
      }
    }
  }
  return null
}

function mergeMacrosInKeymap (content, macrosDTS) {
  const existing = extractBlock(content, /\bmacros\s*\{/)
  if (existing) {
    return content.slice(0, existing.start) + macrosDTS + content.slice(existing.end)
  }
  // Insert before keymap block
  const keymapPos = content.search(/\n[\t ]*keymap[\t ]*\{/)
  if (keymapPos === -1) return content + '\n\n' + macrosDTS
  return content.slice(0, keymapPos) + '\n\n' + macrosDTS + content.slice(keymapPos)
}

function exportMacros (macros, callback) {
  const macrosPath = path.join(ZMK_PATH, 'config', 'macros.json')
  fs.writeFileSync(macrosPath, JSON.stringify(macros, null, 2))

  const keymapFile = findKeymapFile()
  if (keymapFile) {
    const keymapFilePath = path.join(ZMK_PATH, 'config', keymapFile)
    if (fs.existsSync(keymapFilePath)) {
      const existing = fs.readFileSync(keymapFilePath, 'utf8')
      const macrosDTS = generateMacrosDTS(macros)
      const updated = macrosDTS
        ? mergeMacrosInKeymap(existing, macrosDTS)
        : existing
      fs.writeFileSync(keymapFilePath, updated)
    }
  }

  return childProcess.execFile('git', ['status'], { cwd: ZMK_PATH }, callback)
}

function exportKeymap (generatedKeymap, flash, callback) {
  const keymapPath = path.join(ZMK_PATH, 'config')
  const keymapFile = findKeymapFile()
  const keymapFilePath = path.join(keymapPath, keymapFile)

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath)
  fs.writeFileSync(path.join(keymapPath, 'keymap.json'), generatedKeymap.json)

  const existingContent = fs.existsSync(keymapFilePath)
    ? fs.readFileSync(keymapFilePath, 'utf8')
    : null
  const outputCode = existingContent
    ? mergeKeymapCode(existingContent, generatedKeymap.code)
    : generatedKeymap.code
  fs.writeFileSync(keymapFilePath, outputCode)

  // Note: This isn't really helpful. In the QMK version I had this actually
  // calling `make` and piping the output in realtime but setting up a ZMK dev
  // environment proved to be more complex than I had patience for, so for now
  // I'm writing changes to a zmk-config repo and counting on the predefined
  // GitHub action to actually compile.
  return childProcess.execFile('git', ['status'], { cwd: ZMK_PATH }, callback)
}

const ALIAS_SUFFIX_TO_SYMBOL = {
  plus: '+', minus: '-', astrk: '*', qmark: '?', caret: '^', equal: '=',
  lpar: '(', rpar: ')', flsh: '/', sqt: "'", dqt: '"', dllr: '$',
  excl: '!', hash: '#', amp: '&', pipe: '|', lt: '<', gt: '>', dot: '.', comma: ',',
  at: '@', pound: '£', dol: '$'
}

function aliasSymbol (name) {
  const suffix = name.split('_').slice(1).join('_').toLowerCase()
  return ALIAS_SUFFIX_TO_SYMBOL[suffix] || name
}

function loadAliases () {
  const aliasPath = path.join(ZMK_PATH, 'aliases.h')
  if (!fs.existsSync(aliasPath)) return []
  return fs.readFileSync(aliasPath, 'utf8')
    .split('\n')
    .map(line => line.match(/^#define\s+(\w+)\s+(.+)/))
    .filter(Boolean)
    .flatMap(m => {
      const name = m[1]
      const value = m[2].trim()
      const sym = aliasSymbol(name)
      const base = {
        code: name,
        aliases: [name],
        description: `${name} (→ ${value})`,
        context: 'Alias',
        symbol: sym,
        params: [],
        isModifier: false
      }
      // For compound values (e.g. LA(LC(NUMBER_2))), also add an entry keyed
      // by the compound expression itself so the keymap can look it up directly.
      if (/[()]/.test(value)) {
        return [base, { ...base, code: value, aliases: [value] }]
      }
      return [base]
    })
}

function getActionsUrl () {
  try {
    const raw = childProcess
      .execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ZMK_PATH })
      .toString().trim()
    const url = raw
      .replace(/^git@github\.com:/, 'https://github.com/')
      .replace(/\.git$/, '')
    return url.includes('github.com') ? `${url}/actions` : null
  } catch {
    return null
  }
}

function gitCommitPush (callback) {
  const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const message = `Update keymap ${date}`
  childProcess.exec(
    `git add -A && git commit -m "${message}" && git push`,
    { cwd: ZMK_PATH },
    callback
  )
}

module.exports = {
  loadBehaviors,
  loadKeycodes,
  loadLayout,
  loadKeymap,
  exportKeymap,
  loadMacros,
  exportMacros,
  loadCombos,
  exportCombos,
  loadAliases,
  getActionsUrl,
  gitCommitPush
}
