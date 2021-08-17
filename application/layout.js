export function loadLayout () {
  return import('./data/layout.json')
    .then(layout => layout.default)
    .then(layout => layout.map(key => ({
      ...key,
      u: key.u || 1,
      h: key.h || 1
    })))
}
