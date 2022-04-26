import get from 'lodash/get'
import PropTypes from 'prop-types'

import * as keyPropTypes from './keyPropTypes'
import KeyValue from './KeyValue'
import styles from './styles.module.css'

function KeyParamlist(props) {
  const { index, params, values, onSelect, root } = props
  return (
    <span
      className={styles.params}
      data-is-root={!!root}
      data-param-count={params.length}
    >
      {params.map((param, i) => (
        <span key={`param-${i}`} className={styles.param}>
          <KeyValue
            index={index.indexOf(values[i])}
            param={param}
            value={get(values[i], 'value')}
            source={get(values[i], 'source')}
            onSelect={onSelect}
          />
          {get(values[i], 'source.params.length') > 0 ? (
            <KeyParamlist
              index={index}
              params={get(values[i], 'source.params')}
              values={get(values[i], 'params')}
              onSelect={onSelect}
            />
          ) : null}
        </span>
      ))}
    </span>
  )
}

KeyParamlist.propTypes = {
  index: keyPropTypes.index.isRequired,
  params: PropTypes.arrayOf(keyPropTypes.param).isRequired,
  values: PropTypes.arrayOf(keyPropTypes.node).isRequired,
  source: keyPropTypes.source,
  onSelect: PropTypes.func.isRequired
}

export default KeyParamlist
