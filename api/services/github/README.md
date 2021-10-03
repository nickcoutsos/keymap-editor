# GitHub Integration

This is my first integration with GitHub so it may not be optimal.

I also wanted to keep things as simple as possible and take advantage of free
hosting services so the web application is hosted on GitHub Pages and the
backend is running on Heroku. For this reason there is no persistence or
handling of GitHub's events. This means that every page load requires fetching
your app installation and layout/keymap files.

## GitHub App

https://github.com/apps/zmk-keymap-editor

I wanted to minimize required permissions as it only needs to edit two files.
The problem is that one of these files is `<shield name>.keymap` so having
write permissions for any file is necessary. This could be simplified if ZMK
keyboard used something like `keyboard.keymap` but I don't know if this breaks
other use cases.

Also, I've done very little testing. As of this writing I'm only a few hours
out from having the first workable implementation so there has been very little
testing. As an example, I haven't built in any handling for things like expiring
access tokens.
