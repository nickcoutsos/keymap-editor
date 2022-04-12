# Keymap Editor

A browser app (plus NodeJS server) to edit ZMK keymaps. This is still in its
infancy and doesn't yet support parsing existing ZMK keymaps which limits some
kinds of functionality (mainly those involving custom/configured behaviours).

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
make this a useful tool for users of either firmware, let me know.

I'm not committing to taking this on myself, and I'll probably never do much
testing on any other keyboards, but I'm happy to have discussions on where this
(or another tool) can go.


## Setup

You've got a couple of options:

### Local

You can clone this repo and your zmk-config and run the editor locally. Changes
are saved to the keymap files in your local repository and you can commit and
push them to as desired to trigger the GitHub Actions build.

Read more about [local setup](running-locally.md)

### Web

This editor has a (very) rudimentary GitHub integration. You can load the web
app and grant it access to your zmk-config repo. Changes to your keymap are
committed right back to the repository so you only ever need to leave the app to
download your firmware.

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
