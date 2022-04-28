import Icon from './Icon'

export default function IconButton({ collection, icon, text, children, onClick }) {
  return (
    <button onClick={onClick}>
      <Icon collection={collection} name={icon} /> {text || children}
    </button>
  )
}
