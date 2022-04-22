import compact from 'lodash/compact'
import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import * as config from '../config'
import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'
import Selector from "../Common/Selector"
import GithubPicker from './Github/Picker'

const sourceChoices = compact([
  config.enableLocal ? { id: 'local', name: 'Local' } : null,
  config.enableGitHub ? { id: 'github', name: 'GitHub' } : null
])

const selectedSource = localStorage.getItem('selectedSource')
const onlySource = sourceChoices.length === 1 ? sourceChoices[0].id : null
const defaultSource = onlySource || (
  sourceChoices.find(source => source.id === selectedSource)
    ? selectedSource
    : null
)

function KeyboardPicker(props) {
  const { onSelect } = props
  const [source, setSource] = useState(defaultSource)

  const handleKeyboardSelected = useMemo(() => function (event) {
    const { layout, keymap, ...rest } = event

    const layerNames = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
    Object.assign(keymap, {
      layer_names: layerNames
    })

    onSelect({ source, layout, keymap, ...rest })
  }, [onSelect, source])

  const fetchLocalKeyboard = useMemo(() => async function() {
    const [layout, keymap] = await Promise.all([
      loadLayout(),
      loadKeymap()
    ])

    handleKeyboardSelected({ source, layout, keymap })
  }, [source, handleKeyboardSelected])

  useEffect(() => {
    localStorage.setItem('selectedSource', source)
    if (source === 'local') {
      fetchLocalKeyboard()
    }
  }, [source, fetchLocalKeyboard])

  return (
    <div>
      <Selector
        id="source"
        label="Source"
        value={source}
        choices={sourceChoices}
        onUpdate={value => {
          setSource(value)
          onSelect(value)
        }}
      />

      {source === 'github' && (
        <GithubPicker onSelect={handleKeyboardSelected} />
      )}
    </div>
  )
}

KeyboardPicker.propTypes = {
  onSelect: PropTypes.func.isRequired
}

export default KeyboardPicker
