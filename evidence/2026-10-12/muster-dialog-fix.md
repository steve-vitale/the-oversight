# Muster dialog fix — 2026-10-12

## Browser finding (live build fc9dd296-20261012-052411)

- The "🗣️ Ask for help" button in the person card (talk dialog) CANNOT be clicked —
  automation reports "obscured", visual inspection shows "not_visible".
- The Close (✕) button is likewise obscured.
- This BLOCKS mustering allies, which BLOCKS all titan fights
  (Herald 10, Nielsen 12, Finale 20).

## Root cause

The person card renders inside the fixed-height `.ord-narration` region
(184px, `overflow-y: auto`, from dialog-layout 2026-10-11). The card's
`.inlinecard` is capped at `max-height: 100%` with internal scrolling.

The card content is ~400px tall (portrait header + info + 10–16 action
buttons in a 2-column grid). Consequences:

1. "Ask for help" sits at the bottom in `.inline-btns` — clipped below the
   184px fold, so automation reports it "not_visible" and it cannot receive
   pointer events ("obscured").
2. Scrolling the card to reach the buttons pushes the `.inline-head`
   (Close button) out of view — so Close is "obscured" too.

There is no covering overlay; the buttons are clipped by the scroll container,
not hidden behind another element. (The earlier "invisible overlay" theory
from memory was the day-7 cinematic bug, already fixed in 46bf5a8e and
shipped in fc9dd296.)

## Fix

**CSS (`src/css/main.css`)** — pin the card's controls sticky within its
scroll, so both are always visible and tappable regardless of content height:

- `.ord-narration .inlinecard .inline-head` → `position: sticky; top: 0;
  z-index: 2` with opaque background (content scrolls under, not through).
- `.ord-narration .inlinecard .inline-btns` → `position: sticky; bottom: 0;
  z-index: 2` with opaque background.
- System-live tint variant keeps the background consistent.

**JS (`src/js/app.js`, `wirePanel`)** — fixed a temporal-dead-zone bug found
while investigating: `narrBox` was referenced in the contest-wiring block
BEFORE its `const narrBox = document.querySelector('.ord-narration')`
declaration. The resulting ReferenceError was swallowed by the surrounding
try/catch, so contest choice buttons NEVER got wired. The declaration now
precedes both the contest and person-card uses.

## Proof

`scripts/test-muster-dialog-fix-20261012.js` — 20/20:
- 7 CSS assertions (sticky header top:0, sticky buttons bottom:0, opaque
  backgrounds, z-index).
- 4 JS assertions (narrBox declared before use, used by both blocks).
- 5 card-structure assertions ("Ask for help" with data-act="ask" in
  .inline-btns; Close with data-x in .inline-head).
- 3 titan-gate assertions (herald 10, nielsen 12, finale 20).

Regressions:
- `test-talk-button-obscurer-fix-20261011.js` — 23/23 (prior fix intact).
- `node --check src/js/app.js` — syntax OK.
- CSS brace balance — OK.

## [needs-eyes]

Steve must verify on his phone at 390×844:
1. Tap a villager → person card opens.
2. "🗣️ Ask for help" is visible and tappable WITHOUT scrolling.
3. The ✕ Close button is visible and tappable.
4. Tapping "Ask for help" opens the assign view.
(Headless Chromium hangs in this VM per AGENTS.md — live hit-testing
was impossible here; the structural proof above is the verification.)
