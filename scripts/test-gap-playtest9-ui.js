#!/usr/bin/env node
'use strict';
// Gap-playtest9 UI-structure PROOF for legs (a2), (a3), (c).
// app.js / main.css are DOM-only (the node harness excludes them), so these
// legs are proven by asserting on the shipped source itself: the dedupe key,
// the stood-on chip emission, and the numeric stacking order. This proves
// the code that ships; a real phone check (see evidence note) still owns
// the final tap-through.
// Run: node scripts/test-gap-playtest9-ui.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const appJs = fs.readFileSync(path.join(root, 'src', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'css', 'main.css'), 'utf8');
let failures = 0;
function note(ok, label, extra) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label + (extra !== undefined ? ' :: ' + extra : ''));
  if (!ok) failures++;
}
// (a2) Forage keeps one context-bar button per direction.
note(/label\.startsWith\('Forage'\) \? label \+ '@' \+ cx \+ ',' \+ cy : label/.test(appJs),
  '(a2) context-bar dedupe key includes the cell for Forage labels');
// (a3) Stood-on glyph: captured before the entity overlay, emitted as a chip.
note(/_stoodGlyph = \(isMe && g\)/.test(appJs), '(a3) stood-on glyph captured before the entity overlay overwrites g');
note(/stood-glyph/.test(appJs) && /title="Standing on /.test(appJs), '(a3) player token emits a stood-glyph chip with a title');
note(/\.cell\.me \.stood-glyph \{[^}]*position:\s*absolute/.test(css), '(a3) stood-glyph chip is absolutely positioned in its cell');
note(/\.cell\.me \.stood-glyph \{[^}]*pointer-events:\s*none/.test(css), '(a3) stood-glyph chip never swallows taps (pointer-events:none)');
note(/\.cell \{ position: relative; \}/.test(css), '(a3) cells are positioned, so the chip anchors to its tile');
// (c) Stacking: open workspace must outrank the inline slot.
const ws = css.match(/\.field-workspace \{[^}]*z-index:\s*(\d+)/);
const slot = css.match(/\.field-layout #inlineslot \{[^}]*z-index:\s*(\d+)/);
console.log('stacking: .field-workspace z =', ws && ws[1], '| .field-layout #inlineslot z =', slot && slot[1]);
note(!!ws && !!slot, '(c) both stacking rules found');
note(ws && slot && Number(ws[1]) > Number(slot[1]), '(c) open workspace paints above the inline slot',
  `workspace ${ws && ws[1]} > slot ${slot && slot[1]}`);
note(/\.field-workspace \{[^}]*position:\s*relative/.test(css), '(c) workspace stacking is explicit (position:relative)');
// (c) Opening a tool panel clears the slot even for direct-written cards.
note(!/if \(name && inlineView && inlineView\.kind !== 'person'\)/.test(appJs),
  '(c) old inlineView-only slot clear is gone');
note(/STALE-SLOT COVER/.test(appJs) && /delete slot\.dataset\.cx/.test(appJs),
  '(c) panel-open clears #inlineslot including its tile-card coordinates');
// (c) Tile-card close button stays reachable after scrolling the card.
note(/\.field-layout #inlineslot \.tp-head \{[^}]*position:\s*sticky/.test(css),
  '(c) tile-card header (with its ✕) sticks to the top of the slot while scrolling');
console.log(failures ? `UI PROOF: ${failures} failing check(s)` : 'UI PROOF: all checks pass');
process.exit(failures ? 1 : 0);
