
export function loadKeymap () {
  return fetch('/keymap')
    .then(response => response.json())
}
