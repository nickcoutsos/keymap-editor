import Icon from './Common/Icon'

export default function GitHubLink(props = {}) {
  return (
    <a {...props} href="https://github.com/nickcoutsos/keymap-editor">
      <Icon collection="brands" name="github" />/nickcoutsos/keymap-editor
    </a>
  )
}
