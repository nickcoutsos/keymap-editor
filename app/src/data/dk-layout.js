/**
 * Danish keyboard layout mapping.
 * Maps ZMK keycode names to what they actually produce on a Danish OS layout.
 *
 * ZMK sends US HID keycodes; the OS remaps them through the Danish layout.
 * This table covers keys that differ from the US layout so users can search
 * the key picker by desired Danish output (e.g. type "æ" to find SEMI).
 *
 * Format: 'KEYCODE_NAME': 'unshifted shifted'  (space-separated, one or two chars/strings)
 * If only one value, the key has no Danish-specific shifted form worth noting.
 */
const DK = {
  // Number row – shifted values differ from US
  N2:        '2 "',    NUMBER_2: '2 "',    // US: 2 @
  N4:        '4 ¤',    NUMBER_4: '4 ¤',    // US: 4 $   (¤ currency sign)
  N6:        '6 &',    NUMBER_6: '6 &',    // US: 6 ^
  N7:        '7 /',    NUMBER_7: '7 /',    // US: 7 &
  N8:        '8 (',    NUMBER_8: '8 (',    // US: 8 *
  N9:        '9 )',    NUMBER_9: '9 )',    // US: 9 (
  N0:        '0 =',    NUMBER_0: '0 =',    // US: 0 )

  // Right of number row
  MINUS:     '+ ?',                        // US: - _
  EQUAL:     '´ `',                        // US: = +  (dead keys on Danish)

  // Right side of top row
  LEFT_BRACKET: 'å Å',  LBKT: 'å Å',      // US: [ {
  RIGHT_BRACKET: '¨ ^', RBKT: '¨ ^',      // US: ] }  (dead diaeresis)
  BACKSLASH: "' *",     BSLH: "' *",      // US: \ |

  // Home row right side
  SEMICOLON: 'æ Æ',    SEMI: 'æ Æ',       // US: ; :
  SINGLE_QUOTE: 'ø Ø', SQT: 'ø Ø',       // US: ' "
  APOSTROPHE: 'ø Ø',   APOS: 'ø Ø',

  // Bottom row right side
  COMMA:     ', ;',                        // US: , <
  PERIOD:    '. :',    DOT: '. :',         // US: . >
  SLASH:     '- _',   FSLH: '- _',        // US: / ?

  // NON_US_HASH (HID 0x32) — key right of LBracket on ISO boards; Danish: ' and *
  NON_US_HASH: "' *", NUHS: "' *",

  // ISO key (between LShift and Z on ISO keyboards)
  NON_US_BSLH: '< >',
  NUBS: '< >',
  NON_US_BACKSLASH: '< >',

  // Grave row (top-left key)
  GRAVE:     '½ §',                        // US: ` ~

  // --- Named shifted keycodes (ZMK aliases for LS(x)) ---
  // These are modifier-wrapped keys; Danish OS applies the shifted mapping.

  AT_SIGN:   '"',   AT: '"',              // LS(N2) → Danish Shift+2 = "
  DLLR:      '¤',   DOLLAR: '¤',         // LS(N4) → Danish Shift+4 = ¤
  CARET:     '&',                          // LS(N6) → Danish Shift+6 = &
  AMPS:      '/',   AMPERSAND: '/',        // LS(N7) → Danish Shift+7 = /
  ASTRK:     '(',   ASTERISK: '(',         // LS(N8) → Danish Shift+8 = (
  LPAR:      ')',   LEFT_PARENTHESIS: ')', // LS(N9) → Danish Shift+9 = )
  RPAR:      '=',   RIGHT_PARENTHESIS: '=',// LS(N0) → Danish Shift+0 = =
  UNDER:     '?',   UNDERSCORE: '?',       // LS(MINUS) → Danish Shift++ = ?
  PLUS:      '`',                          // LS(EQUAL) → Danish Shift+´ = ` (dead grave)
  LEFT_BRACE: 'Å',  LBRC: 'Å',            // LS(LBKT) → Danish Shift+å = Å
  RIGHT_BRACE: '^', RBRC: '^',            // LS(RBKT) → Danish Shift+¨ = ^
  PIPE:      '*',                          // LS(BSLH) → Danish Shift+' = *
  COLON:     'Æ',                          // LS(SEMI) → Danish Shift+æ = Æ
  DOUBLE_QUOTES: 'Ø', DQT: 'Ø',           // LS(SQT)  → Danish Shift+ø = Ø
  LESS_THAN: ';',   LT: ';',              // LS(COMMA) → Danish Shift+, = ;
  GREATER_THAN: ':', GT: ':',             // LS(DOT)   → Danish Shift+. = :
  QUESTION:  '_',   QMARK: '_',           // LS(FSLH)  → Danish Shift+- = _
  TILDE:     '§',                          // LS(GRAVE) → Danish Shift+½ = §
  EXCL:      '!',   EXCLAMATION: '!',     // LS(N1)    → same on Danish
  HASH:      '#',   POUND: '#',           // LS(N3)    → same on Danish
  PRCNT:     '%',   PERCENT: '%',         // LS(N5)    → same on Danish
}

/**
 * Returns the Danish output string for a given ZMK keycode name,
 * or null if the key produces the same output as on US layout.
 */
export function getDanishOutput (code) {
  return DK[code] || null
}
