import '@fortawesome/fontawesome-free/css/all.css'
import keyBy from 'lodash/keyBy'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import './App.css';
import { DefinitionsContext } from './providers'
import { loadKeycodes } from './keycodes'
import { loadBehaviours, loadKeymap, loadMacros, saveMacros, loadCombos, saveCombos, saveKeymap, gitPush, loadAliases } from './api'
import Keyboard from './Keyboard/Keyboard'
import Loader from './Common/Loader'
import MacroEditor from './Macros/MacroEditor'
import ComboEditor from './Macros/ComboEditor'
import layoutData from './data/totem.json'
import defaultKeymap from './data/totem.keymap.json'
import { parseKeymap, encodeKeymap } from './keymap'

const layout = layoutData.layouts.LAYOUT.layout

const MAX_HISTORY = 50

function keymapHistoryReducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL':
      return { past: [], present: action.keymap, future: [] }
    case 'UPDATE': {
      if (state.present === action.keymap) return state
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: action.keymap,
        future: []
      }
    }
    case 'UNDO': {
      if (state.past.length === 0) return state
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future]
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1)
      }
    }
    default:
      return state
  }
}

function App() {
  const [baseDefinitions, setBaseDefinitions] = useState(null)
  const [macros, setMacros] = useState([])
  const [combos, setCombos] = useState([])
  const [keymapHistory, dispatch] = useReducer(keymapHistoryReducer, {
    past: [], present: null, future: []
  })
  const editingKeymap = keymapHistory.present
  const canUndo = keymapHistory.past.length > 0
  const canRedo = keymapHistory.future.length > 0

  const canUndoRef = useRef(false)
  const canRedoRef = useRef(false)
  const handleCompileRef = useRef(null)
  canUndoRef.current = canUndo
  canRedoRef.current = canRedo

  const importRef = useRef(null)
  const toastTimer = useRef(null)

  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [toast, setToast] = useState(null)
  const [pushOutput, setPushOutput] = useState(null)
  const [scratchpad, setScratchpad] = useState('')

  const showToast = useCallback((message, type = 'error') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    const handler = e => {
      e.preventDefault()
      e.returnValue = ''
    }
    if (isDirty) {
      window.addEventListener('beforeunload', handler)
    }
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => {
    function handleKeydown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 's') {
        e.preventDefault()
        handleCompileRef.current?.()
      } else if (mod && e.key === 'z' && !e.shiftKey) {
        if (!canUndoRef.current) return
        e.preventDefault()
        dispatch({ type: 'UNDO' })
        setIsDirty(true)
      } else if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (!canRedoRef.current) return
        e.preventDefault()
        dispatch({ type: 'REDO' })
        setIsDirty(true)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const definitions = useMemo(() => {
    if (!baseDefinitions) return null
    const { keycodes, behaviours } = baseDefinitions
    const macroBehaviours = macros.map(m => ({
      code: m.code,
      name: m.name,
      symbol: m.symbol,
      params: []
    }))
    const macroCodes = new Set(macroBehaviours.map(m => m.code))
    const allBehaviours = [
      ...behaviours.filter(b => !macroCodes.has(b.code)),
      ...macroBehaviours
    ]
    allBehaviours.indexed = keyBy(allBehaviours, 'code')
    return { keycodes, behaviours: allBehaviours }
  }, [baseDefinitions, macros])

  async function handleCompile() {
    setSaving(true)
    try {
      await saveCombos(combos)
      await saveMacros(macros)
      await saveKeymap(editingKeymap)
      setIsDirty(false)
      showToast('Saved successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }
  handleCompileRef.current = handleCompile

  async function handlePush() {
    setPushing(true)
    try {
      const result = await gitPush()
      const text = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
      setPushOutput({ text: text || '(no output)', actionsUrl: result.actionsUrl || null })
    } catch (err) {
      showToast(err.message || 'Push failed', 'error')
    } finally {
      setPushing(false)
    }
  }

  function handleExportKeymap() {
    const encoded = encodeKeymap(editingKeymap)
    const blob = new Blob([JSON.stringify(encoded, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keymap.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportKeymap(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const raw = JSON.parse(evt.target.result)
        // Accept both string format (from disk) and already-parsed format
        const keymap = (raw.layers && raw.layers[0] && typeof raw.layers[0][0] === 'string')
          ? parseKeymap(raw)
          : raw
        dispatch({ type: 'UPDATE', keymap })
        setIsDirty(true)
        showToast('Keymap imported', 'success')
      } catch {
        showToast('Invalid keymap file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const initialize = useCallback(async () => {
    const [keycodes, behaviours, loadedMacros, loadedCombos, aliases] = await Promise.all([
      loadKeycodes(),
      loadBehaviours(),
      loadMacros(),
      loadCombos(),
      loadAliases()
    ])

    const allKeycodes = [...keycodes, ...aliases]
    allKeycodes.indexed = keyBy(allKeycodes, 'code')
    behaviours.indexed = keyBy(behaviours, 'code')

    setBaseDefinitions({ keycodes: allKeycodes, behaviours })
    setMacros(loadedMacros)
    setCombos(loadedCombos)

    try {
      const savedKeymap = await loadKeymap()
      if (savedKeymap && savedKeymap.layers && savedKeymap.layers[0] && savedKeymap.layers[0].length > 0) {
        dispatch({ type: 'SET_INITIAL', keymap: savedKeymap })
      } else {
        dispatch({ type: 'SET_INITIAL', keymap: parseKeymap(defaultKeymap) })
      }
    } catch (e) {
      dispatch({ type: 'SET_INITIAL', keymap: parseKeymap(defaultKeymap) })
    }
  }, [])

  const handleUpdateKeymap = useCallback((keymap) => {
    dispatch({ type: 'UPDATE', keymap })
    setIsDirty(true)
  }, [])

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' })
    setIsDirty(true)
  }, [])

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' })
    setIsDirty(true)
  }, [])

  const handleUpdateMacros = useCallback((newMacros) => {
    setMacros(newMacros)
    setIsDirty(true)
  }, [])

  const handleUpdateCombos = useCallback((newCombos) => {
    setCombos(newCombos)
    setIsDirty(true)
  }, [])

  return (
    <>
      <Loader load={initialize}>
        <div id="actions">
          {isDirty && <span className="unsaved-indicator">● Unsaved</span>}
          <button
            className="action-btn-sm"
            disabled={!canUndo}
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >↩</button>
          <button
            className="action-btn-sm"
            disabled={!canRedo}
            onClick={handleRedo}
            title="Redo (Ctrl+Y)"
          >↪</button>
          <button
            className="action-btn-sm"
            disabled={!editingKeymap}
            onClick={handleExportKeymap}
            title="Download keymap.json"
          >Export</button>
          <button
            className="action-btn-sm"
            onClick={() => importRef.current.click()}
            title="Load keymap from a JSON file"
          >Import</button>
          <button disabled={!editingKeymap || saving} onClick={handleCompile}>
            {saving ? 'Saving…' : 'Save Local'}
          </button>
          <button
            disabled={isDirty || pushing}
            onClick={handlePush}
            title={isDirty ? 'Save before pushing' : 'Commit & push to GitHub'}
          >
            {pushing ? 'Pushing…' : 'Commit & Push'}
          </button>
        </div>

        <input
          ref={importRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportKeymap}
        />

        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}

        {pushOutput && (
          <div className="git-output">
            <div className="git-output-header">
              <span>git push</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {pushOutput.actionsUrl && (
                  <a
                    href={pushOutput.actionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="actions-link"
                  >
                    View Actions →
                  </a>
                )}
                <button className="git-output-close" onClick={() => setPushOutput(null)}>✕</button>
              </div>
            </div>
            <pre className="git-output-body">{pushOutput.text}</pre>
          </div>
        )}

        <DefinitionsContext.Provider value={definitions}>
          {editingKeymap && (
            <Keyboard
              layout={layout}
              keymap={editingKeymap}
              onUpdate={handleUpdateKeymap}
            />
          )}
        </DefinitionsContext.Provider>
        <div className="scratchpad">
          <textarea
            value={scratchpad}
            onChange={e => setScratchpad(e.target.value)}
            placeholder="Scratchpad — type here to test keys…"
            rows={3}
          />
          <button onClick={() => setScratchpad('')}>Clear</button>
        </div>
        <MacroEditor macros={macros} onUpdate={handleUpdateMacros} />
        <ComboEditor
          combos={combos}
          onUpdate={handleUpdateCombos}
          layers={editingKeymap ? editingKeymap.layer_names : []}
          bindings={editingKeymap ? editingKeymap.layers[0] : []}
          macros={macros}
        />
      </Loader>
    </>
  );
}

export default App;
