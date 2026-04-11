import { useState } from 'react'

const styles = {
  panel: {
    margin: '20px auto',
    maxWidth: '700px',
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
    borderBottom: '1px solid #333'
  },
  symbol: {
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '24px',
    display: 'inline-block',
    textAlign: 'center'
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
    alignItems: 'center',
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
    borderRadius: '3px',
    width: '120px'
  },
  label: {
    color: '#aaa',
    fontSize: '11px'
  }
}

const EMPTY_FORM = { name: '', symbol: '', modifier: 'RALT', key: '' }

function MacroEditor({ macros, onUpdate }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function handleAdd() {
    if (!form.name || !form.key) return
    const code = `&kp_${form.name}`
    const newMacro = {
      code,
      name: form.name,
      symbol: form.symbol || form.name,
      modifier: form.modifier,
      key: form.key
    }
    onUpdate([...macros, newMacro])
    setAdding(false)
    setForm(EMPTY_FORM)
  }

  function handleRemove(code) {
    onUpdate(macros.filter(m => m.code !== code))
  }

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

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Macros</h3>
        {!adding && (
          <button style={styles.btn} onClick={() => setAdding(true)}>+ Add</button>
        )}
      </div>

      {macros.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Symbol</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Binding</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {macros.map(m => (
              <tr key={m.code}>
                <td style={styles.td}><span style={styles.symbol}>{m.symbol}</span></td>
                <td style={styles.td}>{m.name}</td>
                <td style={styles.td}><span style={{ color: '#aaa' }}>{m.code} = {m.modifier} + {m.key}</span></td>
                <td style={styles.td}>
                  <button style={styles.btn} onClick={() => handleRemove(m.code)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding && (
        <div style={styles.form}>
          {field('Name (identifier)', 'name', 'e.g. dk_ae', '110px')}
          {field('Symbol', 'symbol', 'e.g. æ', '60px')}
          {field('Modifier', 'modifier', 'e.g. RALT', '80px')}
          {field('Key', 'key', 'e.g. A', '80px')}
          <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-end', paddingBottom: '1px' }}>
            <button style={styles.btn} onClick={handleAdd}>Add</button>
            <button style={styles.btn} onClick={() => { setAdding(false); setForm(EMPTY_FORM) }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MacroEditor
