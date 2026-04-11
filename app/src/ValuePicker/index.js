import fuzzysort from 'fuzzysort'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import style from './style.module.css'

const cycle = (array, index, step=1) => {
  const next = (index + step) % array.length
  return next < 0 ? array.length + next : next
}

function scrollIntoViewIfNeeded (element, alignToTop) {
  const scroll = element.offsetParent.scrollTop
  const height = element.offsetParent.offsetHeight
  const top = element.offsetTop
  const bottom = top + element.scrollHeight

  if (top < scroll || bottom > scroll + height) {
    element.scrollIntoView(alignToTop)
  }
}

function ValuePicker (props) {
  const { value, prompt, choices, searchKey } = props
  const { onCancel, onSelect } = props

  const listRef = useRef(null)

  const [query, setQuery] = useState(null)
  const [highlighted, setHighlighted] = useState(null)

  const results = useMemo(() => {
    if (!query) return choices
    const filtered = fuzzysort.go(query, choices, { keys: ['code', 'description', 'name', 'danish'], limit: 30 })
    return filtered.map(result => ({ ...result.obj, _match: result }))
  }, [query, choices])

  const handleClickResult = useMemo(() => function(result) {
    onSelect(result)
  }, [onSelect])

  const handleClickOutside = useMemo(() => function(event) {
    if (!listRef.current.contains(event.target)) {
      onCancel()
    }
  }, [listRef, onCancel])

  const handleSelectActive = useMemo(() => function() {
    if (results.length > 0 && highlighted !== null) {
      handleClickResult(results[highlighted])
    }
  }, [results, highlighted, handleClickResult])

  const setHighlightPosition = useMemo(() => function(initial, offset) {
    if (results.length === 0) {
      setHighlighted(null)
      return
    }
    if (offset === undefined) {
      setHighlighted(initial)
      return
    }

    const next = highlighted !== null
      ? cycle(results, highlighted, offset)
      : initial

    const selector = `li[data-result-index="${next}"]`
    const element = listRef.current?.querySelector(selector)

    scrollIntoViewIfNeeded(element, false)
    setHighlighted(next)
  }, [results, highlighted, setHighlighted])

  const handleHighlightNext = useMemo(() => function() {
    setHighlightPosition(0, 1)
  }, [setHighlightPosition])

  const handleHightightPrev = useMemo(() => function() {
    setHighlightPosition(results.length - 1, -1)
  }, [setHighlightPosition, results])

  const handleKeyPress = useMemo(() => function(event) {
    setQuery(event.target.value)
  }, [setQuery])

  const handleKeyDown = useMemo(() => function (event) {
    const mapping = {
      ArrowDown: handleHighlightNext,
      ArrowUp: handleHightightPrev,
      Enter: handleSelectActive,
      Escape: onCancel
    }

    const action = mapping[event.key]
    if (action) {
      event.stopPropagation()
      action()
    }
  }, [
    handleHighlightNext,
    handleHightightPrev,
    handleSelectActive,
    onCancel
  ])

  const focusSearch = useCallback(node => {
    if (node) {
      node.focus()
      node.select()
    }
  }, [])

  useEffect(() => {
    document.body.addEventListener('click', handleClickOutside)

    return () => {
      document.body.removeEventListener('click', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <div className={style.dialog} onKeyDown={handleKeyDown}>
      <p>{prompt}</p>
      <input
        ref={focusSearch}
        type="text"
        placeholder="Type to search..."
        value={query !== null ? query : value}
        onChange={handleKeyPress}
      />
      <ul className={style.results} ref={listRef}>
        {results.map((result, i) => (
          <li
            key={`result-${i}`}
            className={highlighted === i ? style.highlighted : ''}
            data-result-index={i}
            onClick={() => handleClickResult(result)}
            onMouseOver={() => setHighlightPosition(i)}
          >
            <span className={style.codeRow}>
              <span className={style.code}>{result.code}</span>
              {result.danish && (
                <span className={style.dkBadge} title="Danish layout output">{result.danish}</span>
              )}
            </span>
            {(result.description || result.name) && (
              <span className={style.sub}>{result.description || result.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

ValuePicker.propTypes = {
  target: PropTypes.object.isRequired,
  choices: PropTypes.array.isRequired,
  param: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  value: PropTypes.string.isRequired,
  prompt: PropTypes.string.isRequired,
  searchKey: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
}

export default ValuePicker
