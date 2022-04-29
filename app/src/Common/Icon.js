import PropTypes from 'prop-types'

const faCollections = {
  brands: 'fab',
  default: 'fa'
}

function Icon (props) {
  const { name, className, collection, ...iconProps } = props
  const groupClass = faCollections[collection]
  const iconClass = `fa-${name}`

  return (
    <span
      className={[className, groupClass, iconClass].join(' ')}
      {...iconProps}
    />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  collection: PropTypes.string
}

Icon.defaultProps = {
  collection: 'default',
  className: ''
}

export default Icon
