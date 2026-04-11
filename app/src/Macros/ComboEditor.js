import { useMemo, useState, useContext, useRef } from 'react'
import MiniKeyboard from './MiniKeyboard'
import Modal from '../Common/Modal'
import ValuePicker from '../ValuePicker'
import { DefinitionsContext } from '../providers'

function getBindingLabel(binding, macros) {
  if (!binding) return ''
  const { value, params } = binding
  switch (value) {
    case '&trans': return '▽'
    case '&none': return ''
    case '&kp': {
      if (!params[0]) return 'kp'
      return params[0].value
        .replace(/^NUMBER_(\d)$/, '$1')
        .replace(/^BACKSPACE$/, '⌫')
        .replace(/^ENTER$/, '↵')
        .replace(/^SPACE$/, '␣')
        .replace(/^TAB$/, '⇥')
        .replace(/^ESCAPE$/, 'ESC')
        .replace(/^DELETE$/, 'DEL')
        .replace(/^LEFT$/, '←')
        .replace(/^RIGHT$/, '→')
        .replace(/^UP$/, '↑')
        .replace(/^DOWN$/, '↓')
        .slice(0, 5)
    }
    case '&mo': return params[0] ? `MO${params[0].value}` : 'mo'
    case '&lt': return params[0] ? `LT${params[0].value}` : 'lt'
    case '&mt': return params[1] ? params[1].value.slice(0, 4) : 'mt'
    case '&sk': return params[0] ? `SK` : 'sk'
    case '&sl': return params[0] ? `SL${params[0].value}` : 'sl'
    case '&to': return params[0] ? `TO${params[0].value}` : 'to'
    default: {
      if (macros) {
        const macro = macros.find(m => m.code === value)
        if (macro) return macro.symbol || value.replace('&', '').slice(0, 5)
      }
      return value.replace('&', '').slice(0, 5)
    }
  }
}

const styles = {
  panel: {
    margin: '20px auto',
    maxWidth: '900px',
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '10px'
  },
  th: {
    textAlign: 'left',
    padding: '4px 8px',
    borderBottom: '1px solid #444',
    color: '#aaa',
    fontWeight: 'normal'
  },
  td: {
    padding: '4px 8px',
    borderBottom: '1px solid #333',
    verticalAlign: 'middle'
  },
  btn: {
    padding: '2px 8px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  form: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    padding: '8px',
    background: '#222',
    borderRadius: '4px'
  },
  input: {
    padding: '3px 6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    background: '#333',
    border: '1px solid #555',
    color: '#eee',
    borderRadius: '3px'
  },
  label: {
    color: '#aaa',
    fontSize: '11px'
  },
  muted: {
    color: '#aaa'
  }
}

const EMPTY_FORM = { name: '', positions: [], binding: '', timeout: '', layers: [] }

function ComboEditor({ combos, onUpdate, layers = [], bindings = [], macros = [] }) {
  const definitions = useContext(DefinitionsContext)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [pickerStep, setPickerStep] = useState(null) // null | 'behaviour' | 'param' | 'param2'
  const [pendingBehaviour, setPendingBehaviour] = useState(null)
  const [pendingParam1, setPendingParam1] = useState(null)
  const bindingBtnRef = useRef(null)

  const labels = useMemo(
    () => bindings.map(b => getBindingLabel(b, macros)),
    [bindings, macros]
  )

  function handleToggle(index) {
    const next = form.positions.includes(index)
      ? form.positions.filter(p => p !== index)
      : [...form.positions, index].sort((a, b) => a - b)
    setForm({ ...form, positions: next })
  }

  function handleToggleLayer(index) {
    const next = form.layers.includes(index)
      ? form.layers.filter(l => l !== index)
      : [...form.layers, index].sort((a, b) => a - b)
    setForm({ ...form, layers: next })
  }

  function handleAdd() {
    if (!form.name || form.positions.length === 0 || !form.binding) return
    const newCombo = {
      name: form.name,
      positions: form.positions,
      binding: form.binding,
      ...(form.timeout ? { timeout: Number(form.timeout) } : {}),
      ...(form.layers.length > 0 ? { layers: form.layers } : {})
    }
    onUpdate([...combos, newCombo])
    setAdding(false)
    setForm(EMPTY_FORM)
  }

  function handleRemove(name) {
    onUpdate(combos.filter(c => c.name !== name))
  }

  function closePicker() {
    setPickerStep(null)
    setPendingBehaviour(null)
    setPendingParam1(null)
  }

  function handleSelectBehaviour(b) {
    if (!b.params || b.params.length === 0) {
      setForm(f => ({ ...f, binding: b.code }))
      setPickerStep(null)
    } else {
      setPendingBehaviour(b)
      setPickerStep('param')
    }
  }

  function handleSelectParam(result) {
    if (pendingBehaviour.params.length === 1) {
      setForm(f => ({ ...f, binding: `${pendingBehaviour.code} ${result.code}` }))
      closePicker()
    } else {
      setPendingParam1(result.code)
      setPickerStep('param2')
    }
  }

  function handleSelectParam2(result) {
    setForm(f => ({ ...f, binding: `${pendingBehaviour.code} ${pendingParam1} ${result.code}` }))
    closePicker()
  }

  const stepChoices = useMemo(() => {
    if (!definitions) return []
    if (pickerStep === 'behaviour') return definitions.behaviours
    if (!pendingBehaviour) return []
    const paramType = pickerStep === 'param2' ? pendingBehaviour.params[1] : pendingBehaviour.params[0]
    if (paramType === 'code' || paramType === 'mod') return definitions.keycodes
    if (paramType === 'layer') return layers.map((name, i) => ({ code: String(i), description: name }))
    if (paramType === 'command') return pendingBehaviour.commands || []
    return []
  }, [pickerStep, pendingBehaviour, definitions, layers])

  const stepPrompt = useMemo(() => {
    if (pickerStep === 'behaviour') return 'Select behavior'
    if (!pendingBehaviour) return ''
    const paramType = pickerStep === 'param2' ? pendingBehaviour.params[1] : pendingBehaviour.params[0]
    const label = { code: 'keycode', mod: 'modifier', layer: 'layer', command: 'command' }
    return `${pendingBehaviour.code}: select ${label[paramType] || paramType}`
  }, [pickerStep, pendingBehaviour])

  const pickerOnSelect = pickerStep === 'param2' ? handleSelectParam2
    : pickerStep === 'param' ? handleSelectParam
    : handleSelectBehaviour

  function field(label, key, placeholder, width) {
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={styles.label}>{label}</span>
        <input
          style={{ ...styles.input, width: width || '120px' }}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
        />
      </label>
    )
  }

  function layerName(i) {
    return (layers && layers[i]) || `Layer ${i}`
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Combos</h3>
        {!adding && (
          <button style={styles.btn} onClick={() => setAdding(true)}>+ Add</button>
        )}
      </div>

      {combos.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Keys</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Binding</th>
              <th style={styles.th}>Timeout</th>
              <th style={styles.th}>Layers</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {combos.map(c => (
              <tr key={c.name}>
                <td style={styles.td}>
                  <MiniKeyboard positions={c.positions} width={160} labels={labels} />
                </td>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.binding}</td>
                <td style={styles.td}><span style={styles.muted}>{c.timeout || '—'}</span></td>
                <td style={styles.td}>
                  <span style={styles.muted}>
                    {c.layers && c.layers.length
                      ? c.layers.map(i => layerName(i)).join(', ')
                      : '—'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button style={styles.btn} onClick={() => handleRemove(c.name)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding && (
        <div style={styles.form}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={styles.label}>Keys (click to toggle)</span>
            <MiniKeyboard
              positions={form.positions}
              onToggle={handleToggle}
              width={350}
              showIndex={true}
              labels={labels}
            />
            <span style={{ ...styles.muted, fontSize: '11px' }}>
              Selected: {form.positions.length > 0 ? form.positions.join(', ') : 'none'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {field('Name', 'name', 'e.g. combo_esc', '140px')}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={styles.label}>Binding</span>
              <button
                ref={bindingBtnRef}
                style={{ ...styles.input, width: '140px', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => setPickerStep('behaviour')}
              >
                {form.binding || <span style={{ color: '#777' }}>Pick binding…</span>}
              </button>
            </label>
            {field('Timeout ms (optional)', 'timeout', 'e.g. 50', '100px')}
            {layers.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={styles.label}>Layers (optional — all if none selected)</span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {layers.map((name, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.layers.includes(i)}
                        onChange={() => handleToggleLayer(i)}
                      />
                      <span style={{ color: '#eee', fontSize: '12px' }}>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={styles.btn} onClick={handleAdd}>Add</button>
              <button style={styles.btn} onClick={() => { setAdding(false); setForm(EMPTY_FORM) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {pickerStep && definitions && (
        <Modal>
          <ValuePicker
            target={bindingBtnRef.current || document.body}
            value={form.binding}
            param={pickerStep}
            choices={stepChoices}
            prompt={stepPrompt}
            searchKey="code"
            onSelect={pickerOnSelect}
            onCancel={closePicker}
          />
        </Modal>
      )}
    </div>
  )
}

export default ComboEditor
