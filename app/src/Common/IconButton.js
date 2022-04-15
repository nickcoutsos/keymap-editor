import Icon from './Icon'

export default function IconButton({ brand, icon, text, children, onClick }) {
  return (
    <button onClick={onClick}>
      <Icon brand={brand} name={icon} /> {text || children}
    </button>
  )
}
