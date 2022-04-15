
export default function Icon({ brand, name }) {
  const groupClass = brand ? 'fab' : 'fa'
  const iconClass = `fa-${name}`

  return <span className={[groupClass, iconClass].join(' ')} />
}
