import { useMemo } from 'react'

import Icon from '../../Common/Icon'
import styles from './styles.module.css'

function NullKey() {
  return <span>⦸</span>
}

export default function KeyValue(props) {
  const { param, index, value, source, onSelect } = props
  const title = source && `(${source.code}) ${source.description}`
  const text = source && <span>{source?.symbol || source?.code}</span>
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
