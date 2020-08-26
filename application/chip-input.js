function _defaultChipRenderer (value) {
  const chip = document.createElement('span')
  chip.classList.add('chip')
  chip.textContent = value.trim()
  return chip
}

export default function chipInput ({ initialValues = [], chipRenderer = _defaultChipRenderer }) {
  const input = document.createElement('input')
  const holder = document.createElement('div')
  const chips = []
  let selected = null

  holder.classList.add('chip-input')
  holder.appendChild(input)
  
  input.addEventListener('keydown', e => {
    if (e.code === 'Enter' && input.value.trim().length > 0) {
      addChip(input.value)
      input.value = ''
      e.preventDefault()
    } else if (e.code === 'Backspace' && input.value.length === 0) {
      if (selected) {
        removeChip(selected)
      }

      selectChip(chips[chips.length - 1])
    } else {
      selectChip(null)
    }
  })
  
  function addChip (value) {
    const chip = chipRenderer(value)
    chips.push(chip)
    holder.insertBefore(chip, input)
  }
  
  function removeChip (chip) {
    chips.splice(chips.indexOf(chip), 1)
    holder.removeChild(chip)
  }

  function selectChip (chip) {
    selected = chip
    chips.forEach(chip => chip.classList.remove('selected'))
    chip && chip.classList.add('selected')
  }

  for (let value of initialValues) {
    addChip(value)
  }

  return {
    element: holder,
    addChip
  }
}
