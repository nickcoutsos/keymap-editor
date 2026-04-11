/**
 * Maps browser event.key (the actual character/name produced) → ZMK aliases.
 * Using event.key correctly handles shifted variants: '%' maps to PERCENT/PRCNT,
 * not N5. Modifier keys are handled separately via event.code.
 */
const EVENT_KEY_TO_ZMK_RAW = {
  // Lowercase letters
  'a': ['A'], 'b': ['B'], 'c': ['C'], 'd': ['D'], 'e': ['E'],
  'f': ['F'], 'g': ['G'], 'h': ['H'], 'i': ['I'], 'j': ['J'],
  'k': ['K'], 'l': ['L'], 'm': ['M'], 'n': ['N'], 'o': ['O'],
  'p': ['P'], 'q': ['Q'], 'r': ['R'], 's': ['S'], 't': ['T'],
  'u': ['U'], 'v': ['V'], 'w': ['W'], 'x': ['X'], 'y': ['Y'],
  'z': ['Z'],
  // Uppercase letters (ZMK uses same name regardless of shift)
  'A': ['A'], 'B': ['B'], 'C': ['C'], 'D': ['D'], 'E': ['E'],
  'F': ['F'], 'G': ['G'], 'H': ['H'], 'I': ['I'], 'J': ['J'],
  'K': ['K'], 'L': ['L'], 'M': ['M'], 'N': ['N'], 'O': ['O'],
  'P': ['P'], 'Q': ['Q'], 'R': ['R'], 'S': ['S'], 'T': ['T'],
  'U': ['U'], 'V': ['V'], 'W': ['W'], 'X': ['X'], 'Y': ['Y'],
  'Z': ['Z'],

  // Numbers (unshifted)
  '1': ['N1', 'NUMBER_1'], '2': ['N2', 'NUMBER_2'], '3': ['N3', 'NUMBER_3'],
  '4': ['N4', 'NUMBER_4'], '5': ['N5', 'NUMBER_5'], '6': ['N6', 'NUMBER_6'],
  '7': ['N7', 'NUMBER_7'], '8': ['N8', 'NUMBER_8'], '9': ['N9', 'NUMBER_9'],
  '0': ['N0', 'NUMBER_0'],

  // Shifted numbers (US layout)
  '!': ['EXCL', 'EXCLAMATION', 'BANG'],
  '@': ['AT', 'AT_SIGN'],
  '#': ['HASH', 'POUND', 'POUND_SIGN'],
  '$': ['DLLR', 'DOLLAR', 'DOLLAR_SIGN'],
  '%': ['PRCNT', 'PERCENT', 'PERCENT_SIGN'],
  '^': ['CARET', 'CRRT'],
  '&': ['AMPS', 'AMPERSAND'],
  '*': ['ASTRK', 'ASTERISK', 'STAR'],
  '(': ['LPAR', 'LEFT_PARENTHESIS', 'LEFT_PAREN'],
  ')': ['RPAR', 'RIGHT_PARENTHESIS', 'RIGHT_PAREN'],

  // Symbols (unshifted)
  '-': ['MINUS'],
  '=': ['EQUAL'],
  '[': ['LBKT', 'LEFT_BRACKET'],
  ']': ['RBKT', 'RIGHT_BRACKET'],
  '\\': ['BSLH', 'BACKSLASH'],
  ';': ['SEMI', 'SEMICOLON'],
  "'": ['SQT', 'SINGLE_QUOTE', 'APOSTROPHE'],
  '`': ['GRAVE'],
  ',': ['COMMA'],
  '.': ['DOT', 'PERIOD'],
  '/': ['FSLH', 'SLASH'],

  // Symbols (shifted)
  '_': ['UNDER', 'UNDERSCORE'],
  '+': ['PLUS'],
  '{': ['LBRC', 'LEFT_BRACE', 'LBRACE'],
  '}': ['RBRC', 'RIGHT_BRACE', 'RBRACE'],
  '|': ['PIPE', 'PIPE_SIGN'],
  ':': ['COLON'],
  '"': ['DQT', 'DOUBLE_QUOTES', 'DOUBLE_QUOTE'],
  '~': ['TILDE', 'TILDE_SIGN'],
  '<': ['LT', 'LESS_THAN'],
  '>': ['GT', 'GREATER_THAN'],
  '?': ['QMARK', 'QUESTION', 'QUESTION_MARK'],

  // Whitespace / control
  ' ': ['SPACE'],
  'Enter': ['RETURN', 'ENTER', 'RET'],
  'Escape': ['ESC', 'ESCAPE'],
  'Backspace': ['BSPC', 'BACKSPACE'],
  'Tab': ['TAB'],
  'CapsLock': ['CAPS', 'CAPS_LOCK'],

  // Navigation cluster
  'Delete': ['DEL', 'DELETE'],
  'Insert': ['INS', 'INSERT'],
  'Home': ['HOME'],
  'End': ['END'],
  'PageUp': ['PG_UP', 'PAGE_UP'],
  'PageDown': ['PG_DN', 'PAGE_DOWN'],
  'ArrowUp': ['UP', 'UP_ARROW'],
  'ArrowDown': ['DOWN', 'DOWN_ARROW'],
  'ArrowLeft': ['LEFT', 'LEFT_ARROW'],
  'ArrowRight': ['RIGHT', 'RIGHT_ARROW'],

  // Function keys
  'F1': ['F1'],   'F2': ['F2'],  'F3': ['F3'],  'F4': ['F4'],
  'F5': ['F5'],   'F6': ['F6'],  'F7': ['F7'],  'F8': ['F8'],
  'F9': ['F9'],   'F10': ['F10'], 'F11': ['F11'], 'F12': ['F12'],
  'F13': ['F13'], 'F14': ['F14'], 'F15': ['F15'], 'F16': ['F16'],
  'F17': ['F17'], 'F18': ['F18'], 'F19': ['F19'], 'F20': ['F20'],
  'F21': ['F21'], 'F22': ['F22'], 'F23': ['F23'], 'F24': ['F24'],

  // Misc
  'PrintScreen': ['PSCRN', 'PRINTSCREEN', 'PRINT_SCREEN'],
  'ScrollLock':  ['SLCK', 'SCROLLLOCK', 'SCROLL_LOCK'],
  'Pause':       ['PAUSE', 'PAUSE_BREAK'],
  'NumLock':     ['KP_NUM', 'NUMLOCK'],
}

/** event.key → Set<zmkAlias> */
const EVENT_KEY_TO_ZMK = Object.fromEntries(
  Object.entries(EVENT_KEY_TO_ZMK_RAW).map(([k, v]) => [k, new Set(v)])
)

/**
 * Modifier key event.code → Set<zmkAlias>.
 * Needed separately because event.key for modifiers is just 'Shift'/'Control'
 * (no left/right distinction), while event.code tells us ShiftLeft vs ShiftRight.
 */
const MODIFIER_CODE_TO_ZMK = {
  ShiftLeft:    new Set(['LSHIFT', 'LSHFT', 'LEFT_SHIFT']),
  ShiftRight:   new Set(['RSHIFT', 'RSHFT', 'RIGHT_SHIFT']),
  ControlLeft:  new Set(['LCTRL', 'LCTL', 'LEFT_CONTROL']),
  ControlRight: new Set(['RCTRL', 'RCTL', 'RIGHT_CONTROL']),
  AltLeft:      new Set(['LALT', 'LEFT_ALT']),
  AltRight:     new Set(['RALT', 'RIGHT_ALT']),
  MetaLeft:     new Set(['LGUI', 'LEFT_GUI', 'LEFT_WIN', 'LWIN', 'LCMD', 'LEFT_COMMAND']),
  MetaRight:    new Set(['RGUI', 'RIGHT_GUI', 'RIGHT_WIN', 'RWIN', 'RCMD', 'RIGHT_COMMAND']),
}

const MODIFIER_CODES = new Set(Object.keys(MODIFIER_CODE_TO_ZMK))

/**
 * Returns the Set<zmkAlias> for a browser KeyboardEvent.
 * Uses event.key for character/nav keys (correctly handles shifted chars like '%'),
 * and event.code for modifier keys (distinguishes left vs right).
 */
export function getZmkSet(e) {
  // Modifier keys: use event.code for left/right distinction
  if (MODIFIER_CODES.has(e.code)) {
    return MODIFIER_CODE_TO_ZMK[e.code] || null
  }

  // All other keys: event.key gives the actual character produced
  const byKey = EVENT_KEY_TO_ZMK[e.key]
  if (byKey) return byKey

  return null
}

/**
 * Returns true if a parsed binding object matches any ZMK code in zmkSet.
 * Handles &kp, &mt (mod-tap), &lt (layer-tap), &sk (sticky key).
 */
function bindingMatchesCode(binding, zmkSet) {
  if (!binding) return false
  const { value, params } = binding

  if (value === '&kp') {
    return zmkSet.has(params[0]?.value)
  }
  if (value === '&mt' || value === '&hm') {
    // first param = modifier (hold), second = tap keycode
    return zmkSet.has(params[0]?.value) || zmkSet.has(params[1]?.value)
  }
  if (value === '&lt') {
    // second param = tap keycode
    return zmkSet.has(params[1]?.value)
  }
  if (value === '&sk') {
    return zmkSet.has(params[0]?.value)
  }
  return false
}

/**
 * Find key indices in `layers[layerIndex]` that match zmkSet.
 * When resolveTransparent=true, &trans bindings are resolved through lower layers.
 */
export function findKeysForCode(layers, layerIndex, zmkSet, resolveTransparent = true) {
  const layer = layers[layerIndex]
  const results = []

  for (let i = 0; i < layer.length; i++) {
    let binding = layer[i]

    if (resolveTransparent && binding.value === '&trans' && layerIndex > 0) {
      for (let l = layerIndex - 1; l >= 0; l--) {
        const lower = layers[l]?.[i]
        if (lower && lower.value !== '&trans') {
          binding = lower
          break
        }
      }
    }

    if (bindingMatchesCode(binding, zmkSet)) {
      results.push(i)
    }
  }

  return results
}

/**
 * Given a pressed key's zmkSet, find the best layer + key indices.
 * Tries currentLayer first (with &trans resolution), then other layers
 * (without &trans resolution to avoid false positives).
 *
 * Returns { keyIndices: number[], layer: number } or null.
 */
export function findBestLayerMatch(layers, currentLayer, zmkSet) {
  // 1. Current layer (resolving &trans)
  const current = findKeysForCode(layers, currentLayer, zmkSet, true)
  if (current.length > 0) {
    return { keyIndices: current, layer: currentLayer }
  }

  // 2. Other layers — raw bindings only (no &trans to avoid false positives)
  for (let l = layers.length - 1; l >= 0; l--) {
    if (l === currentLayer) continue
    const matches = findKeysForCode(layers, l, zmkSet, false)
    if (matches.length > 0) {
      return { keyIndices: matches, layer: l }
    }
  }

  return null
}
