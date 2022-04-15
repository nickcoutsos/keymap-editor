import DialogBox from "../../Common/DialogBox"
import Modal from "../../Common/Modal"

function fileFromTitle(title) {
  if (title === 'InfoValidationError') {
    return 'config/info.json'
  } else if (title === 'KeymapValidationError') {
    return 'config/keymap.json'
  }
}

const listStyle = {
  maxHeight: '300px',
  overflow: 'auto',
  padding: '10px',
  fontFamily: 'monospace',
  fontSize: '80%',
  backgroundColor: '#efefef'
}

const listItemStyle = { margin: '10px' }

export default function ValidationErrors(props) {
  const { onDismiss, title, errors,  otherRepoOrBranchAvailable = false } = props
  const file = fileFromTitle(title)

  return (
    <Modal>
      <DialogBox onDismiss={onDismiss}>
        <h2>{title}</h2>
        {file && (
          <p>Errors in the file <code>{file}</code>.</p>
        )}
        <ul style={listStyle}>
          {errors.map((error, i) => (
            <li key={i} style={listItemStyle}>
              {error}
            </li>
          ))}
        </ul>

        {otherRepoOrBranchAvailable && (
          <p>
            If you have another branch or repository the the required metadata files
            you may switch to them instead.
          </p>
        )}
      </DialogBox>
    </Modal>
  )
}