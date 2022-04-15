import compact from 'lodash/compact'
import { useState } from 'react'

import * as config from '../config'
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
    ? selectedSource.id
    : null
)

export default function KeyboardPicker(props) {
  const { onSelect } = props
  const [source, setSource] = useState(defaultSource)

  return (
    <div>
      <Selector
        id="source"
        label="Source"
        value={source}
        choices={sourceChoices}
        onUpdate={value => {
          setSource(value)
          // onSelect(value)
        }}
      />

      {source === 'github' && (
        <GithubPicker />
      )}
    </div>
  )
}
