# Keymap Editor

A browser app (plus NodeJS server) to edit ZMK keymaps. This has been a solo
project but in a workable state for quite a while now, and new features are in
development all the time.

**Try it live!** Go to the [keymap-editor] and try it out with the built-in
[zmk-config-corne-demo] before setting up your own repo.

![Screenshot](./screenshots/editor-screenshot.png)

## Features

* WYSIWYG keymap editing
* GitHub integration
* [Combo editing](./screenshots/editor-screenshot-combos.png)
* [Macro editing](./screenshots/editor-screenshot-macros.png)
* [Dark mode!](./screenshots/editor-screenshot-darkmode.png)
* Support for custom behaviour definitions
* Automatic layout generation for most keyboards available in the ZMK repo
* Rotary encoders
* Multiple keymaps

_Read more: [Wiki:Features]_

### In Progress

Currently working on moving towards parsing the devicetree syntax in `.keymap`
files. A lot of ZMK features are going to be a challenge to implement, but just
by being able to reliably read and write devicetree code it will be possible to
use the editor to modify layer bindings without overwriting sections it doesn't
recognize (for example, combos and custom configured behaviours).

### Planned features

* **Devicetree parsing** -- keymap changes are made directly to your existing
  `<keyboard>.keymap` file so that your keymap is readable and ready for manual
  adjustment should the need arise.
* **Behaviour configuration** (currently in limited beta)
* **Keymap diagram export** I'd like to be able to reference keymap diagrams in
  the repository's `README.md` and have the editor update those diagrams upon
  comitting the changes. I'm searching for efficient ways to reuse the React
  components to generate SVG data instead but its tricky.

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

1. Make your own repo using the [zmk-config-corne-demo template] on GitHub
2. Go to [keymap-editor] and authorize it to access your own repo.

Read more about the [GitHub integration](api/services/github/README.md)


## License

The code in this repo is available under the MIT license.

The collection of ZMK keycodes is taken from the ZMK documentation under the MIT
license as well.

[keymap-editor]: https://nickcoutsos.github.io/keymap-editor/
[zmk-config-corne-demo]: https://github.com/nickcoutsos/zmk-config-corne-demo
[zmk-config-corne-demo template]: https://github.com/nickcoutsos/zmk-config-corne-demo/generate
[Wiki:Automatic Layout Generation]: https://github.com/nickcoutsos/keymap-editor/wiki/Defining-keyboard-layouts#automatic-layout-generation
[Wiki:Features]: https://github.com/nickcoutsos/keymap-editor/wiki/Features
