// PROOF: talk-button-obscurer-fix (2026-10-11)
// Steve: "Don't let an element obscure crucial info."
//
// Bug (verified live via browser DOM forensics): on desktop the sticky
// .ord-controls header (position:sticky, z-index:10, opaque background)
// covered the villager person card, which rendered in .ord-narration as a
// FOLLOWING SIBLING. Card content scrolling beneath the pinned header
// failed hit-testing -> mouse clicks on Talk/Close refused as "obscured".
//
// Fix: .ord-controls + .ord-narration are wrapped in .ord-topstack, which is
// display:contents on narrow screens (mobile flow untouched) and becomes the
// single pinned sticky stack on desktop. The card now lives INSIDE the
// pinned element, so no element can ever cover it.
//
// Headless Chromium hangs in this VM, so real elementFromPoint hit-testing
// is impossible here; this test asserts the structural invariant directly
// on the shipped template + stylesheet, for both the old (buggy) and new
// (fixed) configurations: the covering mechanism must exist before and be
// gone after, by construction.
//

// SEED BEFORE EVAL (AGENTS.md): nothing evaluated here, but keep the
// discipline — deterministic by construction (pure string assertions).
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const css = fs.readFileSync('src/css/main.css', 'utf8');
const app = fs.readFileSync('src/js/app.js', 'utf8');
// Pre-fix baseline: the parent of the commit that introduced ord-topstack.
// (Pinning to HEAD would break the moment the fix itself becomes HEAD.)
const introCommit = execSync(`git log --format=%H -S 'ord-topstack' -- src/js/app.js | tail -1`).toString().trim();
function showBaseline(p) {
  return execSync(`git show ${introCommit}^:${p}`, { maxBuffer: 32 * 1024 * 1024 }).toString();
}
const oldCss = showBaseline('src/css/main.css');
const oldApp = showBaseline('src/js/app.js');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}
// Extract the CSS text of a @media block by its query prefix.
function mediaBlock(cssText, query) {
  const i = cssText.indexOf(query);
  if (i < 0) return '';
  let depth = 0, j = cssText.indexOf('{', i);
  for (; j < cssText.length; j++) {
    if (cssText[j] === '{') depth++;
    else if (cssText[j] === '}') { depth--; if (depth === 0) return cssText.slice(i, j + 1); }
  }
  return '';
}
const desktop = () => mediaBlock(css, '@media (min-width: 900px)');
const mobile = () => mediaBlock(css, '@media (max-width: 899px)');

console.log('--- A. OLD configuration exhibits the bug mechanism (test sensitivity) ---');
check('old css: desktop .ord-controls was position:sticky',
  /body:has\(\.game-cols\) \.ord-controls \{\s*position:\s*sticky/.test(oldCss));
check('old css: sticky .ord-controls was opaque + z-index:10',
  /body:has\(\.game-cols\) \.ord-controls \{[^}]*z-index:\s*10[^}]*background:\s*var\(--bg/.test(oldCss));
check('old markup: no ord-topstack wrapper existed',
  !oldApp.includes('ord-topstack'));
check('old markup: .ord-narration was a sibling AFTER .ord-controls (could slide under it)',
  (() => {
    const i = oldApp.indexOf('ord-controls">');
    const j = oldApp.indexOf('ord-narration">', i);
    return i > 0 && j > i;
  })());

console.log('--- B. NEW configuration: card lives INSIDE the pinned stack ---');
check('markup: .ord-topstack opens before .ord-controls',
  (() => {
    const w = app.indexOf('ord-topstack">');
    const c = app.indexOf('ord-controls">', w);
    return w > 0 && c > w;
  })());
check('markup: .ord-narration is inside .ord-topstack (closes after it)',
  (() => {
    const w = app.indexOf('ord-topstack">');
    const n = app.indexOf('ord-narration">', w);
    const e = app.indexOf('/ord-topstack', n);
    return w > 0 && n > w && e > n;
  })());
check('wiring: person cards render into .ord-narration (narrationBoxHTML person branch)',
  /if \(inlineView && inlineView\.kind === 'person'\) \{\s*return personCardHTML\(inlineView\);/.test(app));
check('card carries the crucial buttons: Talk (data-act) and sheet-x Close',
  (() => {
    const f = app.indexOf('function personCardHTML');
    const next = app.indexOf('function renderPersonInline', f);
    const region = app.slice(f, next);
    const hasTalk = /data-act=/.test(region) && region.includes('Talk (10 kcal)');
    const hasClose = region.includes('inlineHead(') &&
      /function inlineHead[\s\S]{0,200}sheet-x/.test(app);
    return hasTalk && hasClose;
  })());
check('css base: .ord-topstack is display:contents (mobile single-column flow untouched)',
  /(^|\n)\.ord-topstack\s*\{\s*display:\s*contents;/.test(css));
check('css desktop: .ord-topstack is the pinned stack (sticky, top:0, z-10, opaque bg)',
  /body:has\(\.game-cols\) \.ord-topstack \{[^}]*position:\s*sticky[^}]*top:\s*0[^}]*z-index:\s*10[^}]*background:\s*var\(--bg/.test(desktop()));
check('css desktop: .ord-controls is NO LONGER itself sticky (no nested/duplicate pin)',
  !/body:has\(\.game-cols\) \.ord-controls \{[^}]*position:\s*sticky/.test(desktop()));
check('css desktop: stack keeps interaction-first order (order:-3, before status)',
  /body:has\(\.game-cols\) \.ord-topstack \{\s*order:\s*-3;/.test(desktop()));

console.log('--- C. MOBILE 390x844: no covering element exists ---');
check('mobile: .ord-controls is not sticky/fixed',
  !/\.ord-controls\s*\{[^}]*position:\s*(sticky|fixed)/.test(mobile()));
check('mobile: .ord-narration is not sticky/fixed',
  !/\.ord-narration\s*\{[^}]*position:\s*(sticky|fixed)/.test(mobile()));
check('mobile: .ord-topstack stays display:contents (no new positioning context)',
  !/\.ord-topstack[^{]*\{[^}]*position:/.test(mobile()));
check('mobile: controls/narration keep their flex orders (2 and 3)',
  /\.ord-controls\s*\{\s*order:\s*2;/.test(mobile()) && /\.ord-narration\s*\{\s*order:\s*3;/.test(mobile()));

console.log('--- D. AUDIT: other sticky/fixed elements cannot cover crucial info ---');
check('sheet-head sticky is inert: sheet pins head via flex, body scrolls internally',
  /\.sheet-head\s*\{[^}]*flex-shrink:\s*0/.test(css) && /\.sheet-body\s*\{[^}]*overflow-y:\s*auto/.test(css));
check('toast-layer (fixed, full-width) is pointer-events:none',
  /\.toast-layer\s*\{[^}]*pointer-events:\s*none/.test(css));
check('night grid tint is pointer-events:none',
  /body\.is-night \.ord-gridwrap\.detail::after\s*\{[^}]*pointer-events:\s*none/.test(css));
check('mflash/beamflash overlays are pointer-events:none',
  /#mflash\s*\{[^}]*pointer-events:\s*none/.test(css) && /#beamflash\s*\{[^}]*pointer-events:\s*none/.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);

// ---- E. LITERAL TEMPLATE BALANCE: the emitted markup nests correctly ----
// Strip ${...} interpolations (brace-matched, quote-aware), then verify the
// literal divs between the topstack open and its close comment balance and
// nest: ord-controls and ord-narration must both be INSIDE ord-topstack.
(function () {
  const hit = app.indexOf('ord-topstack">');
  const open = app.lastIndexOf('<div', hit);
  const closeComment = app.indexOf('/ord-topstack', hit);
  let src = app.slice(open, closeComment);
  let out = '', i = 0;
  while (i < src.length) {
    if (src[i] === '$' && src[i + 1] === '{') {
      let depth = 1; i += 2;
      let q = null; // current string quote, if any
      while (i < src.length && depth > 0) {
        const ch = src[i];
        if (q) {
          if (ch === '\\') i++;
          else if (ch === q) q = null;
        } else if (ch === "'" || ch === '"' || ch === '`') q = ch;
        else if (ch === '{') depth++;
        else if (ch === '}') depth--;
        i++;
      }
    } else { out += src[i]; i++; }
  }
  const tags = out.match(/<\/?div\b[^>]*>/g) || [];
  let depth = 0, minDepth = 0, sawControls = false, sawNarration = false, controlsDepth = -1, narrationDepth = -1;
  for (const t of tags) {
    if (t.startsWith('</')) depth--;
    else {
      depth++;
      if (t.includes('ord-controls')) { sawControls = true; controlsDepth = depth; }
      if (t.includes('ord-narration')) { sawNarration = true; narrationDepth = depth; }
    }
    if (depth < minDepth) minDepth = depth;
  }
  console.log('--- E. emitted template nests the card inside the pinned stack ---');
  check('literal divs balance (never close the stack early)', minDepth >= 0 && depth === 0);
  check('ord-controls nests inside ord-topstack', sawControls && controlsDepth > 1);
  check('ord-narration nests inside ord-topstack', sawNarration && narrationDepth > 1);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
