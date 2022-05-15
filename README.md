# Keymap Editor

A browser app (plus NodeJS server) to edit ZMK keymaps. This is still in its
infancy and doesn't yet support parsing existing ZMK keymaps which limits some
kinds of functionality (mainly those involving custom/configured behaviours).

**Try it live!** Go to the [keymap-editor] and try it out with the built-in
[zmk-config-corne-demo] before setting up your own repo.

![Screenshot](editor-screenshot.png)

## Features

### Current

* WYSIWYG keycode and layer editing.
* Keymap (JSON and `.keymap`) generation
  * If the (non-standard) `row` and `col` attributes are specified in
    `info.json` they will be used to render the generated files in a more human-
    readable format that matches the physical layout of the keyboard. Note that
    these values are now the row and column of the wiring matrix which may be
    different to use GPIO pins more efficiently.
* Build status/link: for those relying on GitHub actions to build their keyboard
  firmware, the editor will now display the most recent build result and provide
  a link to the results in GitHub. It also gets `workflow_run` events in real-
  time so you can get live progress from within the editor.
    * It's worth noting that at the time of this writing I had just finished the
      work on this feature a few hours ago. It gets the latest workflow run for
      the selected branch assuming that you only have one workflow defined for
      your zmk-config repo.

### In Progress

Currently working on moving towards parsing the devicetree syntax in `.keymap`
files. A lot of ZMK features are going to be a challenge to implement, but just
by being able to reliably read and write devicetree code it will be possible to
use the editor to modify layer bindings without overwriting sections it doesn't
recognize (for example, combos and custom configured behaviours).

So far there's experimental support for this in the deployed app. Click on the
gear icon in the top right and check the box to enable devicetree parsing.

### Planned features

* **Combo editing** -- this is the highest priority for me
* **Rotary encoders**, but I don't have a plan for a clean UI design
* **Behaviour configuration** to make things like homerow mods possible

#### What else?

If you have thoughts on what needs to be fixed to support _your_ keyboard or to
make this a useful tool for users, let me know.

I'm not committing to taking this on myself, and as a hobbyist I don't have any
commercially available keyboards to test out and provide specific support, but
I'm happy to have discussions on where this (or another tool) can go.

Do you have an idea you'd like to see implemented that might not work for this
specific use case? _Talk to me_. I went to a lot of trouble building this and I
can share a lot of that experience. Even if we don't have the same needs a lot
of things can be supported modularly.


## Setup

You've got a couple of options:

### Local

You can clone this repo and your zmk-config and run the editor locally. Changes
are saved to the keymap files in your local repository and you can commit and
push them to as desired to trigger the GitHub Actions build.

Read more about [local setup](running-locally.md)

### Web

This editor has a GitHub integration. You can load the web app and grant it
access to your zmk-config repo. Changes to your keymap are committed right back
to the repository so you only ever need to leave the app to download firmware.

Try it now:

1. Fork [zmk-config-corne-demo] on GitHub
2. Go to [keymap-editor] and authorize it to access your forked repo.

Read more about the [GitHub integration](api/services/github/README.md)


## License

The code in this repo is available under the MIT license.

The collection of ZMK keycodes is taken from the ZMK documentation under the MIT
license as well.

[keymap-editor]: https://nickcoutsos.github.io/keymap-editor/
[zmk-config-corne-demo]: https://github.com/nickcoutsos/zmk-config-corne-demo
