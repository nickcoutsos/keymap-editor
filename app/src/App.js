import '@fortawesome/fontawesome-free/css/all.css'
import keyBy from 'lodash/keyBy'
import { useMemo, useState } from 'react'

import * as config from './config'
import './App.css';
import { DefinitionsContext } from './providers'
import { loadKeycodes } from './keycodes'
import { loadBehaviours } from './api'
import KeyboardPicker from './Pickers/KeyboardPicker';
import Spinner from './Common/Spinner';
import Keyboard from './Keyboard/Keyboard'
import GitHubLink from './GitHubLink'
import Loader from './Common/Loader'
import github from './Pickers/Github/api'

function App() {
  const [definitions, setDefinitions] = useState(null)
  const [source, setSource] = useState(null)
  const [sourceOther, setSourceOther] = useState(null)
  const [layout, setLayout] = useState(null)
  const [keymap, setKeymap] = useState(null)
  const [editingKeymap, setEditingKeymap] = useState(null)
  const [saving, setSaving] = useState(false)

  function handleCompile() {
    fetch(`${config.apiBaseUrl}/keymap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editingKeymap || keymap)
    })
  }

  const handleCommitChanges = useMemo(() => function() {
    const { repository, branch } = sourceOther.github

    ;(async function () {
      setSaving(true)
      await github.commitChanges(repository, branch, layout, editingKeymap)
      setSaving(false)

      setKeymap(editingKeymap)
      setEditingKeymap(null)
    })()
  }, [
    layout,
    editingKeymap,
    sourceOther,
    setSaving,
    setKeymap,
    setEditingKeymap
  ])

  const handleKeyboardSelected = useMemo(() => function(event) {
    const { source, layout, keymap, ...other } = event

    setSource(source)
    setSourceOther(other)
    setLayout(layout)
    setKeymap(keymap)
    setEditingKeymap(null)
  }, [
    setSource,
    setSourceOther,
    setLayout,
    setKeymap,
    setEditingKeymap
  ])

  const initialize = useMemo(() => {
    return async function () {
      const [keycodes, behaviours] = await Promise.all([
        loadKeycodes(),
        loadBehaviours()
      ])

      keycodes.indexed = keyBy(keycodes, 'code')
      behaviours.indexed = keyBy(behaviours, 'code')

      setDefinitions({ keycodes, behaviours })
    }
  }, [setDefinitions])

  const handleUpdateKeymap = useMemo(() => function(keymap) {
    setEditingKeymap(keymap)
  }, [setEditingKeymap])

  return (
    <>
      <Loader load={initialize}>
        <KeyboardPicker onSelect={handleKeyboardSelected} />
        <div id="actions">
          {source === 'local' && (
            <button disabled={!editingKeymap} onClick={handleCompile}>
              Save Local
            </button>
          )}
          {source === 'github' && (
            <button
              title="Commit keymap changes to GitHub repository"
              disabled={!editingKeymap}
              onClick={handleCommitChanges}
            >
              {saving ? 'Saving' : 'Commit Changes'}
              {saving && <Spinner />}
            </button>
          )}
        </div>
        <DefinitionsContext.Provider value={definitions}>
          {layout && keymap && (
            <Keyboard
              layout={layout}
              keymap={editingKeymap || keymap}
              onUpdate={handleUpdateKeymap}
            />
          )}
        </DefinitionsContext.Provider>
      </Loader>
      <GitHubLink className="github-link" />
    </>
  );
}

export default App;
