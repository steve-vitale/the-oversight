// PROOF TEST: muster-dialog-fix (2026-10-12)
// Browser verification (live build fc9dd296) found the "Ask for help" button
// and Close button in the person card (talk dialog) were "obscured" /
// "not_visible" — blocking titan mustering (Herald 10, Nielsen 12, Finale 20).
//
// Root cause: the person card renders inside the fixed 184px .ord-narration
// region with internal scrolling. The card's ~400px content (10-16 buttons)
// pushed "Ask for help" below the fold (clipped, not_visible), and scrolling
// to reach it pushed the Close button out of view (obscured).
//
// Fix:
//   (1) CSS: .inline-head (Close) is position:sticky top:0, .inline-btns
//       (Ask for help) is position:sticky bottom:0 — both always visible
//       and clickable within the card's scroll, no matter the content height.
//   (2) JS: fixed a temporal-dead-zone bug in wirePanel() — `narrBox` was
//       referenced in the contest-wiring block BEFORE its `const` declaration.
//       The ReferenceError was swallowed by try/catch, so contest choice
//       buttons NEVER got wired. Declaration now precedes both uses.
//
// This test uses static analysis (headless Chromium hangs in this VM per
// AGENTS.md, so live hit-testing is impossible here). It asserts the
// structural invariants that make the buttons reachable by construction.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' -- ' + detail : '')); }
}

const css = fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');

console.log('--- A. CSS: sticky header (Close) and sticky action buttons ---');
// The person card's header must stick to the top of the card's scroll area.
ok('css: .ord-narration .inlinecard .inline-head is position:sticky',
  /\.ord-narration\s+\.inlinecard\s+\.inline-head\s*\{[^}]*position:\s*sticky/.test(css),
  'Close button can scroll out of view');
ok('css: sticky header pins to top:0',
  /\.ord-narration\s+\.inlinecard\s+\.inline-head\s*\{[^}]*top:\s*0/.test(css),
  'header not pinned to top');
ok('css: sticky header has opaque background (content scrolls under, not through)',
  /\.ord-narration\s+\.inlinecard\s+\.inline-head\s*\{[^}]*background:/.test(css),
  'scrolled content would show through the header');
// The action buttons must stick to the bottom.
ok('css: .ord-narration .inlinecard .inline-btns is position:sticky',
  /\.ord-narration\s+\.inlinecard\s+\.inline-btns\s*\{[^}]*position:\s*sticky/.test(css),
  '"Ask for help" can be clipped below the fold');
ok('css: sticky buttons pin to bottom:0',
  /\.ord-narration\s+\.inlinecard\s+\.inline-btns\s*\{[^}]*bottom:\s*0/.test(css),
  'buttons not pinned to bottom');
ok('css: sticky buttons have opaque background',
  /\.ord-narration\s+\.inlinecard\s+\.inline-btns\s*\{[^}]*background:/.test(css),
  'scrolled content would show through the buttons');
ok('css: sticky elements have z-index above card content',
  /\.ord-narration\s+\.inlinecard\s+\.inline-head\s*\{[^}]*z-index:\s*2/.test(css) &&
  /\.ord-narration\s+\.inlinecard\s+\.inline-btns\s*\{[^}]*z-index:\s*2/.test(css),
  'sticky bars could be painted under scrolled content');

console.log('--- B. JS: narrBox temporal-dead-zone fix in wirePanel ---');
// Extract wirePanel and verify declaration order.
const wpStart = app.indexOf('function wirePanel(st, n)');
ok('js: wirePanel exists', wpStart >= 0);
if (wpStart >= 0) {
  const wpEnd = app.indexOf('\n  }', wpStart + 100);
  const wp = app.slice(wpStart, wpEnd + 4).replace(/\/\/[^\n]*/g, '');
  const declIdx = wp.indexOf('const narrBox = document.querySelector');
  const useIdx = wp.indexOf('if (narrBox &&');
  ok('js: narrBox declared', declIdx >= 0, 'declaration missing');
  ok('js: narrBox declared BEFORE first use (no TDZ)',
    declIdx >= 0 && useIdx >= 0 && declIdx < useIdx,
    'narrBox used before const declaration — ReferenceError swallowed by try/catch, contest buttons never wired');
  // Both the contest block and the person-card block must reference narrBox.
  const uses = (wp.match(/narrBox\./g) || []).length + (wp.match(/\(narrBox,/g) || []).length;
  ok('js: narrBox used by contest AND person-card wiring', uses >= 2,
    'expected at least 2 narrBox uses, found ' + uses);
}

console.log('--- C. Person card emits both buttons ---');
// Static check on personCardHTML: the "Ask for help" button and Close button exist.
const pcStart = app.indexOf('function personCardHTML(view)');
ok('js: personCardHTML exists', pcStart >= 0);
if (pcStart >= 0) {
  const pcEnd = app.indexOf('\n  }', pcStart + 100);
  const pc = app.slice(pcStart, pcEnd + 4);
  ok('card: "Ask for help" button with data-act="ask"',
    pc.includes('data-act=\\"ask\\"') || pc.includes('data-act="ask"'),
    'muster entry point missing from card');
  ok('card: buttons live in .inline-btns (the sticky container)',
    pc.includes('class=\\"inline-btns\\"') || pc.includes('class="inline-btns"'),
    'buttons not in the sticky container');
}
// inlineHead emits the Close button.
const ihStart = app.indexOf('function inlineHead(');
ok('js: inlineHead exists', ihStart >= 0);
if (ihStart >= 0) {
  const ihEnd = app.indexOf('\n  }', ihStart + 50);
  const ih = app.slice(ihStart, ihEnd + 4);
  ok('card: Close button with data-x in inlineHead',
    ih.includes('data-x'),
    'Close button missing');
  ok('card: header uses .inline-head (the sticky container)',
    ih.includes('inline-head'),
    'header not in the sticky container');
}

console.log('--- D. Titan muster gates (the flow this unblocks) ---');
const titans = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/titans.json'), 'utf8'));
ok('titan: herald minAllies is 10', titans.herald && titans.herald.minAllies === 10,
  'got ' + (titans.herald && titans.herald.minAllies));
ok('titan: nielsen minAllies is 12', titans.nielsen && titans.nielsen.minAllies === 12,
  'got ' + (titans.nielsen && titans.nielsen.minAllies));
ok('titan: finale minAllies is 20', titans.finale && titans.finale.minAllies === 20,
  'got ' + (titans.finale && titans.finale.minAllies));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
