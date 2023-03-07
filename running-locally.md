# Running Locally

This tool was originally designed to help editing keymap files in repositories
already cloned onto your computer.

## Setup

1. Clone this repo and open the new directory in a terminal.
2. Copy `.env.template` to `.env`. You can fill in this file as appropriate, but
   this is enough to get started.
4. Clone a `zmk-config`\* repo. Either create symlinks in this directory to the
  cloned repositories or clone them into this directory if you must.
3. Run `npm install`
4. Run `npm run dev`
5. Open `http://localhost:8080` in your browser. If a different port is needed
  set it in an environment variable when starting the server (e.g.
  `PORT=8081 node index.js`).

\**The editor works using metadata files that describe the layout and keymap of
the keyboard. This is based on JSON files used by QMK and Keyboard Layout Editor
with some customization to generated human readable code as well. For an example
see [zmk-config-corne-demo]*


## Using the editor

Your selected keyboard should be loaded automatically. Click on the top-left
corner of a key to change its bind behaviour, or in the middle to change the
bind parameter.

See also: [demo video](keymap-editor-demo.mov)

Click the _Save Local_ button to save the modified keymap back to your local
zmk-config repo. From here you can commit and push those changes to your remote
on GitHub to trigger the build.

[zmk-config-corne-demo]: https://github.com/nickcoutsos/zmk-config-corne-demo
