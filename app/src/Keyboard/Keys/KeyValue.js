import { useMemo } from 'react'
import PropTypes from 'prop-types'

import * as keyPropTypes from './keyPropTypes'
import styles from './styles.module.css'
import Icon from '../../Common/Icon'

function NullKey() {
  return <span>⦸</span>
}

function KeyValue(props) {
  const { param, index, value, source, onSelect } = props
  const danishOut = source?.danish
  const danishUnshifted = danishOut?.split(' ')[0]
  const title = source && [
    `(${source.code}) ${source.description}`,
    danishOut && `DK: ${danishOut}`
  ].filter(Boolean).join(' • ')
  const text = source && (danishUnshifted || source?.symbol || source?.code)
  const icon = source?.faIcon && <Icon name={source.faIcon} />

  const handleClick = useMemo(() => function (event) {
    event.stopPropagation()
    onSelect({
      target: event.target,
      codeIndex: index,
      code: value,
      param
    })
  }, [param, value, index, onSelect])

  return (
    <span
      className={styles.code}
      title={title}
      onClick={handleClick}
    >
      {icon || text || <NullKey />}
    </span>
  )
}

KeyValue.propTypes = {
  index: PropTypes.number.isRequired,
  param: keyPropTypes.param.isRequired,
  value: keyPropTypes.value.isRequired,
  source: keyPropTypes.source,
  onSelect: PropTypes.func.isRequired
}

export default KeyValue
