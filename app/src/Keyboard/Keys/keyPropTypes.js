import PropTypes from 'prop-types'

export const param = PropTypes.oneOfType([
  PropTypes.oneOf(
    ['code', 'layer', 'mod', 'command']
  ),
  PropTypes.shape({
    enum: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })
])
export const params = PropTypes.arrayOf(param)
export const value = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
])
export const source = PropTypes.shape({
  params,
  code: value.isRequired,
  description: PropTypes.string,
  symbol: PropTypes.string,
  faIcon: PropTypes.string
})

export const node = PropTypes.shape({
  value,
  source,
  params: PropTypes.arrayOf(
    PropTypes.shape({
      value,
      source,
      params: PropTypes.arrayOf(PropTypes.object)
    })
  )
})

export const index = PropTypes.arrayOf(node)
