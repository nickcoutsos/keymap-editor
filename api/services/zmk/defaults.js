const keymapTemplate = `
/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: MIT
 */


/* THIS FILE WAS GENERATED!
 *
 * This file was generated automatically. You may or may not want to
 * edit it directly.
 */

#include <behaviors.dtsi>
{{behaviour_includes}}

/ {
    keymap {
        compatible = "zmk,keymap";

{{rendered_layers}}
    };
};
`

module.exports = {
  keymapTemplate
}
