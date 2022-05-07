# Keymap Editor - Web Application

This is a single page application currently written in React to integrate with
the Keymap Editor API.

It handles keyboard selection and rendering of parsed keymap data into a visual
editor. This application is _aware_ of some of the particulars of ZMK, but it
receives key bindings already parsed into a tree of values and parameters.

## Building

The easiest way to use this is the [hosted version](https://nickcoutsos.github.io/keymap-editor).
The second easiest is locally, served up via the API itself (in the repo root,
run `npm run dev` and open `http://localhost:8080` in your browser).

If you must deploy this app to the web then you'll need to take care of building
it. This requires some configuration, as seen in the [config module](./config.js).

All configuration is provided via environment variables.

Variable                    | Description
----------------------------|-------------
`REACT_APP_API_BASE_URL`    | Fully qualified publicly accessible URL of the backend API.
`REACT_APP_APP_BASE_URL`    | Fully qualified publicly accessible URL of _this_ app.
`REACT_APP_GITHUB_APP_NAME` | The app name (slug?) of the GitHub app integration (only required if using with GitHub).
`REACT_APP_ENABLE_GITHUB`   | Whether to enable fetching keyboard data from GitHub. Default is false, values `"1"`, `"on"`, `"yes"`, `"true"` are interpreted as `true`.
`REACT_APP_ENABLE_LOCAL`    | Whether to enable fetching keyboard data from locally. Default is false, values `"1"`, `"on"`, `"yes"`, `"true"` are interpreted as `true`.

_Note: choosing to use the GitHub integration in your own environment isn't a
matter of flipping a switch, you will need to set up your own app in GitHub and
configure your API accordingly._

With these set you can run the npm build script, e.g.

```bash
export REACT_APP_API_BASE_URL=...
export REACT_APP_APP_BASE_URL=...
export REACT_APP_GITHUB_APP_NAME=...
export REACT_APP_ENABLE_GITHUB=...
export REACT_APP_ENABLE_LOCAL=...
npm run build
```

_(make sure you're in this directory, not the repository root!)_

This will have webpack produce bundles in the `build/` directory which you can
deploy however you like.

### Deploying to GitHub Pages

On your GitHub repository's settings page, select _Pages_ in the sidebar. Pick a
branch you want to serve the app from (I use `pages`) and choose the `/ (root)`
directory. Check out that branch (I have another working repository locally for
this) locally, or make a new orphaned branch if such a branch doesn't exist, and
copy the contents of `build/` to it. Commit and push to the GitHub remote.

If you're not familiar with this it's worth reading up on the [GitHub Pages docs](https://docs.github.com/en/pages).