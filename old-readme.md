# Keymap Editor

A browser app (plus NodeJS server) to edit ZMK keymaps. This has been a solo
project but in a workable state for quite a while now, and new features are in
development all the time.

**Try it live!** Go to the [keymap-editor] and try it out with the built-in
[keymap-editor-demo-crkbd] before setting up your own repo.

![Screenshot](./screenshots/editor-screenshot.png)

## Features

* WYSIWYG keymap editing
* Multiple keymap sources:
  * GitHub repositories
  * Clipboard
  * Local file system (Chromium browsers only)
* [Dark mode!](./screenshots/editor-screenshot-darkmode.png)
* [Combo editing](./screenshots/editor-screenshot-combos.png)
* [Macro editing](./screenshots/editor-screenshot-macros.png)
* Behavior editing
* Automatic layout generation for most keyboards available in the ZMK repo
* Rotary encoders
* Multiple keymaps

_Read more: [Wiki:Features]_

### In Progress

There's a great deal of functionality present at the moment. As long as you're
not obscuring the devicetree syntax by using custom preprocessor macros you can
parse most of ZMK's functionality.

Right now I'm working on cleaning up the codebase and refactoring to make the
different pieces more reusable between the backend server and browser app.

### Planned features

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

> **Note**
> The code you're looking at here is very out-of-date compared to the deployed
> web app. If you want to use this without depending on giving this app access
> to your GitHub repository you can choose the app's _Clipboard_ or _FileSystem_
> keymap source.

Read more about [local setup](running-locally.md)

### Web

#### With local keymaps

In the editor you can choose the _Clipboard_ keymap source and paste in the
contents of your ZMK `.keymap` file, and if you're using a Chromium-based web
browser you can alternatively use the _FileSystem_ source to read and make 
changes to select `.keymap` files directly.

#### With your GitHub repositories

This editor has a GitHub integration. You can load the web app and grant it
access to your zmk-config repo. Changes to your keymap are committed right back
to the repository so you only ever need to leave the app to download firmware.

Try it now:

1. Make your own repo using the [keymap-editor-demo-crkbd template] on GitHub
2. Go to [keymap-editor] and authorize it to access your own repo.

Read more about the [GitHub integration](api/services/github/README.md)


## License

The code in this repo is available under the MIT license.

The collection of ZMK keycodes is taken from the ZMK documentation under the MIT
license as well.

[keymap-editor]: https://nickcoutsos.github.io/keymap-editor/
[keymap-editor-demo-crkbd]: https://github.com/nickcoutsos/keymap-editor-demo-crkbd/
[keymap-editor-demo-crkbd template]: https://github.com/nickcoutsos/keymap-editor-demo-crkbd/generate
[Wiki:Automatic Layout Generation]: https://github.com/nickcoutsos/keymap-editor/wiki/Defining-keyboard-layouts#automatic-layout-generation
[Wiki:Features]: https://github.com/nickcoutsos/keymap-editor/wiki/Features
