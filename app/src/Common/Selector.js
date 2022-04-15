const styles = {
  selector: {
    display: 'inline-block',
    width: 'auto',
    margin: '5px'
  },
  label: {
    display: 'block',
    width: '100%',
    fontSize: '120%',
    color: '#555'
  }
}

export default function Selector(props) {
  const { id, label, value, choices, onUpdate } = props
  const handleSelect = e => {
    const index = e.target.value
    const choice = choices[index].id
    onUpdate(choice)
  }

  function index(value) {
    const result = choices.findIndex(choice => choice.id === value)
    return result === -1 ? '' : result
  }

  return (
    <div style={styles.selector}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <select id={id} onChange={handleSelect} value={index(value)}>
        {choices.map(({ name }, i) => (
          <option key={i} value={i}>{name}</option>
        ))}
      </select>
    </div>
  )
}
