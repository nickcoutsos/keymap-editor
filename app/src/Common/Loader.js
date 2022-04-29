import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

import Modal from './Modal'
import Spinner from './Spinner'

function Loader(props) {
  const { load, delay, children } = props
  const [state, setState] = useState({
    loaded: false,
    delayed: false,
    timeout: null
  })

  useEffect(() => {
    clearTimeout(state.timeout)
    if (!load) {
      return
    }

    const timeout = setTimeout(() => {
      if (!state.loaded) {
        setState({ ...state, timeout: null, delayed: true })
      }
    }, delay)

    setState({
      loaded: false,
      delayed: false,
      timeout
    })

    load().then(() => {
      clearTimeout(timeout)
      setState({ ...state, timeout: null, loaded: true })
    })
  }, [load])

  if (state.loaded) {
    return children
  } else if (!state.delayed) {
    return null
  }

  return (
    <Modal>
      <Spinner style={{ color: 'white' }}>
        <p>Waiting for API...</p>
      </Spinner>
    </Modal>
  )
}

Loader.propTypes = {
  load: PropTypes.func.isRequired,
  inline: PropTypes.bool,
  delay: PropTypes.number,
}

Loader.defaultProps = {
  inline: false,
  delay: 200
}

export default Loader
