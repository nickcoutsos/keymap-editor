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
  const { value, prompt, choices, searchKey, searchThreshold, showAllThreshold } = props
  const { onCancel, onSelect } = props

  const listRef = useRef(null)

  const [query, setQuery] = useState(null)
  const [highlighted, setHighlighted] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const results = useMemo(() => {
    const options = { key: searchKey, limit: 30 }
    const filtered = fuzzysort.go(query, choices, options)

    if (showAll || searchThreshold > choices.length) {
      return choices
    } else if (!query) {
      return choices.slice(0, searchThreshold)
    }

    return filtered.map(result => ({
      ...result.obj,
      search: result
    }))
  }, [query, choices, searchKey, showAll, searchThreshold])

  const enableShowAllButton = useMemo(() => {
    return (
      !showAll &&
      choices.length > searchThreshold &&
      choices.length <= showAllThreshold
    )
  }, [showAll, choices, searchThreshold, showAllThreshold])

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
      {choices.length > searchThreshold && (
        <input
          ref={focusSearch}
          type="text"
          value={query !== null ? query : value}
          onChange={handleKeyPress}
        />
      )}
      <ul className={style.results} ref={listRef}>
        {results.map((result, i) => (
          <li
            key={`result-${i}`}
            className={highlighted === i ? style.highlighted : ''}
            title={result.description}
            data-result-index={i}
            onClick={() => handleClickResult(result)}
            onMouseOver={() => setHighlightPosition(i)}
          >
            {result.search ? (
              <span dangerouslySetInnerHTML={{
                __html: fuzzysort.highlight(result.search)
              }} />
            ) : (
              <span>
                {result[searchKey]}
              </span>
            )}
          </li>
        ))}
      </ul>
      {choices.length > searchThreshold && (
        <div className={style['choices-counter']}>
          Total choices: {choices.length}.
          {enableShowAllButton && (
            <button onClick={setShowAll(true)}>Show all</button>
          )}
        </div>
      )}
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
  searchThreshold: PropTypes.number,
  showAllThreshold: PropTypes.number,
  onCancel: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
}

ValuePicker.defaultProps = {
  searchThreshold: 10,
  showAllThreshold: 50
}

export default ValuePicker
