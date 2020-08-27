import { createComboKeyInput } from './combo-key-input.js'
import { setKeycode } from './keymap.js'

function createComboRow (def) {
  const row = document.createElement('tr')
  const actionCell = document.createElement('td')
  const comboCell = document.createElement('td')
  const deleteCell = document.createElement('td')
  const action = document.createElement('span')
  const selector = createComboKeyInput(def.combo)
  const del = document.createElement('button')

  action.classList.add('code')
  setKeycode(action, def.action || 'KC_TRNS')
  del.textContent = 'delete'
  del.type = 'button'
  del.addEventListener('click', () => {
    row.parentNode && row.parentNode.removeChild(row)
  })

  actionCell.appendChild(action)
  actionCell.style.textAlign = 'center'
  comboCell.appendChild(selector)
  deleteCell.appendChild(del)

  row.appendChild(actionCell)
  row.appendChild(comboCell)
  row.appendChild(deleteCell)

  return row
}

const comboEditor = document.querySelector('#combo-editor')
comboEditor.querySelector('label').addEventListener('click', () => {
  comboEditor.classList.toggle('closed')
})

comboEditor
  .querySelector('tfoot button')
  .addEventListener('click', () => {
    comboEditor
      .querySelector('tbody')
      .appendChild(createComboRow())
  })

export function getComboDefinitions () {
  return Array.from(comboEditor.querySelectorAll('tbody tr'))
    .map(row => {
      const action = row.querySelector('.code').dataset.code
      const combo = Array.from(row.querySelectorAll('.chip .code'))
        .map(chip => chip.dataset.code)

      return { action, combo }
    })
}

export function addComboDefinition (def) {
  comboEditor
    .querySelector('tbody')
    .appendChild(createComboRow(def))
}
