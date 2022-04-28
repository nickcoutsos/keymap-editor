
const faCollections = {
  brands: 'fab',
  default: 'fa'
}
export default function Icon({ name, collection = 'default' }) {
  const groupClass = faCollections[collection]
  const iconClass = `fa-${name}`

  return <span className={[groupClass, iconClass].join(' ')} />
}
