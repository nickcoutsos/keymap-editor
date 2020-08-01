
export function loadKeycodes () {
  return fetch('data/keycodes.json')
    .then(response => response.json())
    .then(normalizeKeycodes)
}

export async function loadIndexedKeycodes() {
  return loadKeycodes()
    .then(keycodes => (
      keycodes.reduce((map, keycode) => Object.assign(map, { [keycode.code]: keycode }), {})
    ))
}

function normalizeKeycodes (keycodes) {
  return keycodes.map(keycode => {
    keycode.params = (keycode.code.match(/\((.+?)\)/) || ['', ''])[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => !!t)

    keycode.aliases = [keycode.code, ...(keycode.aliases || [])]
      .map(code => code.replace(/`/g, ''))
      .map(code => code.replace(/\(.+\)/, ''))

    keycode.symbol = keycode.symbol || (
      [...keycode.aliases]
        .sort((a, b) => a.length - b.length)[0]
        .replace(/^KC_/, '')
    )

    return keycode
  })
  .reduce((keycodes, keycode) => {
    for (let alias of keycode.aliases) {
      keycodes.push(Object.assign({}, keycode, { code: alias }))
    }

    return keycodes
  }, [])
}
