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

  return (
    <span
      className={styles.code}
      title={title}
      onClick={event => onSelect({
        target: event.target,
        codeIndex: index,
        code: value,
        param
      })}
    >
      {icon || text || <NullKey />}
    </span>
  )
}
