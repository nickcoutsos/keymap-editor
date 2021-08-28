# Keymap Editor

A browser app (plus NodeJS server) to edit QMK and ZMK keymaps. This was hastily
thrown together and then even more hastily converted to a Vue app with support
for ZMK tossed in.

![Screenshot](editor-screenshot.png)

## Requirements

1. NodeJS (I'm using v16 but to some extent I'm sure you can get away with
  something a little older)
2. Either QMK Firmware or a `zmk-config` (I'm really unfamiliar with ZMK's
  directory structure and configuration so this may not be usable with the core
  repo without some work)
    * Create symlinks to the cloned repo(s) using `qmk_firmware` or `zmk-config`
      as appropriate. I guess you could also clone those repositories into this
      directory but that's not something I like to do.
3. [`info.json`](https://docs.qmk.fm/#/reference_info_json) file specifying the
  layout of the keyboard(s) to be edited.
4. `keymap.json` file specifying the keymap to load/edit. This _should_ be
  optional so you can create a completely new keymap but I haven't gotten there
  yet.


## Setup

1. Clone this repo
2. Run `npm install` and `cd application; npm install`
3. Clone either [qmk_firmware](https://github.com/qmk/qmk_firmware) or a
  `zmk-config` repo. Either create symlinks in this directory to the cloned
  repositories or clone them into this directory if you must.
4. Run `node index.js`
5. Open `http://localhost:8080` in your browser. If a different port is needed
  set it in an environment variable when starting the server (e.g.
  `PORT=8081 node index.js`).

As an example, you can clone my config repo at [nickcoutsos/zmk-config](https://github.com/nickcoutsos/zmk-config).
Until some user-friendliness improvements can be made you'll need to edit the
keyboard/layout/keymap variables defined in `qmk.js` or `zmk.js` as appropriate.

## Features

* WYSIWYG keycode and layer editing.
* Keymap (JSON and `.c`/`.keymap`) generation
  * If the (non-standard) `row` and `col` attributes are specified in
    `info.json` they will be used to render the generated files in a more human-
    readable format that matches the physical layout of the keyboard. Note that
    these values are now the rol and column of the wiring matrix which may be
    different to use GPIO pins more efficiently.
* Support for QMK and ZMK firmwares

### QMK vs ZMK support

This tool was originally written to edit a QMK keyboard's keymap, so QMK is the
"default" firmware. More recently it went through a refactor to use VueJS and to
support ZMK as well.

#### Behaviours

The app tries to treat both firmware librarie the same way, parsing a key
binding into a `behaviour` and a list of `parameters` -- QMK doesn't share this
concept so a placeholder behaviour of `&kp` is used, and later ignored.

I haven't studied all of ZMK's behaviours closely but this tool supports the
unusual `&bt BT_SEL` behaviour/command which requires one additional parameter
which needs to be added/parsed dynamically.

Side note: I'm Canadian and default to writing behavio_ur_. To match ZMK I will
try to standardize on its spelling but mistakes are likely.

#### Compilation

There are separate buttons to compile/flash/export firmware changes. In QMK this
_should_ write the changes to your keyboard in the cloned `qmk_firmware` repo
(all three buttons), compile those changes (compile/flash) and attempt to load
them onto your microcontroller (flash). When using a `keymap.json` file, however,
the build tool seems to prefer using the QMK CLI which I don't have working. I'm
also on a fairly outdated version of QMK so who knows what else is wrong.

I haven't studied ZMK enough to set up a local environment for compilation, so
all it does right now is update the keymap so that you can build with GitHub
actions.


## What's broken/missing

Probably a lot. Like I said, I've mostly built this for myself. I wanted a
graphical way to edit my keymap and I didn't want to have to get yet another
handwired keyboard merged into the QMK repo to rely on their configurator.

I know that QMK moves quickly and now  supports a lot of configuration in
`info.json` that I don't provide a way to edit. ZMK has a lot of behaviours that
I haven't defined, and would benefit from a schema definition agreed on by the
dev team.

In a previous version I had started working on supporting combos but gave up
because I couldn't be bothered to experiment with `TAPPING_TERM` settings that
felt comfortable.

This needs a widget to let the user switch between QMK and ZMK, and to expose a
list of keymaps/layouts that can be used.

### What else?

If you have thoughts on what needs to be fixed to support _your_ keyboard or to
make this a useful tool for users of either firmware, let me know.

I'm not committing to taking this on myself, and I'll probably never do much
testing on any other keyboards, but I'm happy to have discussions on where this
(or another tool) can go.
