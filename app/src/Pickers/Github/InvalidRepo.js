import Modal from "../../Common/Modal"
import DialogBox from "../../Common/DialogBox"

export default function InvalidRepo(props) {
  const { onDismiss, otherRepoOrBranchAvailable = false } = props
  const demoRepoUrl = 'https://github.com/nickcoutsos/zmk-config-corne-demo/'

  return (
    <Modal>
      <DialogBox onDismiss={onDismiss}>
        <h2>Hold up a second!</h2>
        <p>
          The selected repository does not contain <code>info.json</code> or
          <code>keymap.json</code>.
        </p>
        <p>
          This app depends on some additional metadata to render the keymap.
          For an example repository ready to use now or metadata you can apply
          to your own keyboard repo, have a look at
          <a href={demoRepoUrl}>zmk-config-corne-demo</a>.
        </p>
        {otherRepoOrBranchAvailable && (
          <p>
            If you have another branch or repository the the required metadata
            files you may switch to them instead.
          </p>
        )}
      </DialogBox>
    </Modal>
  )
}
