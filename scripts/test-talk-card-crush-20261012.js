// PROOF: talk-card-crush-fix (2026-10-12)
//
// Bug (diagnosed live 2026-10-12 via remote-browser DOM forensics on build
// 5ae9a5f4-20261012-151255): on desktop, opening a villager's person card
// (Talk -> pick villager) inserted .inlinecard into .ord-narration, but the
// card painted zero pixels and its Talk button failed hit-testing as
// "obscured". Two compounding CSS defects:
//
//  1. FLEX CRUSH: .ord-narration (fixed 184px, overflow-y:auto) is a flex
//     item of .game-col-side, which is capped at max-height:calc(100vh-32px)
//     and scrolls. As a scroll container the region's automatic flex minimum
//     is 0, so it shrank to ~0px whenever the column overflowed — and the
//     card (max-height:100%) collapsed with it.
//  2. INERT STICKY: the 2026-10-11 talk-button-obscurer-fix set
//     position:sticky / z-index / background on .ord-topstack in the desktop
//     media query, but never overrode the base `display: contents`. A
//     display:contents element generates no box, so the entire pinned-stack
//     mechanism never existed (confirmed: scrolling the side column never
//     pinned the controls).
//
// Fix: (a) base .ord-narration gets flex-shrink:0 — the fixed 184px region
// holds its height, the column scrolls instead; (b) the desktop
// .ord-topstack rule gets display:block (a real box, so sticky/z-index/
// background take effect as the 2026-10-11 fix intended) and flex-shrink:0
// (the pinned stack keeps its natural height).
//
// Headless Chromium hangs in this VM, so real elementFromPoint hit-testing
// is impossible here; this test asserts the structural invariant directly
// on the stylesheet, for both the old (buggy) and new (fixed) configurations.
// Real-browser verification (card paints, Talk clickable, conversation opens)
// must happen on the live build after ship.
//
// SEED BEFORE EVAL: nothing evaluated here; deterministic by construction.
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const css = fs.readFileSync('src/css/main.css', 'utf8');
// Pre-fix baseline: HEAD (this fix is uncommitted in the worktree).
const oldCss = execSync('git show HEAD:src/css/main.css', { maxBuffer: 32 * 1024 * 1024 }).toString();

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
// Extract the declaration block of the first top-level rule whose selector
// text starts at `selector` and whose block contains `mustContain`
// (mustContain='' disables the filter). Anchoring the selector at a line
// start avoids matching it as the tail of a longer selector
// (e.g. `body.in-combat .ord-narration {`).
function ruleBlock(cssText, selector, mustContain) {
  let i = 0;
  while (true) {
    const k = cssText.indexOf(selector, i);
    if (k < 0) return '';
    let depth = 0, j = cssText.indexOf('{', k), end = -1;
    for (; j >= 0 && j < cssText.length; j++) {
      if (cssText[j] === '{') depth++;
      else if (cssText[j] === '}') { depth--; if (depth === 0) { end = j; break; } }
    }
    const block = end > 0 ? cssText.slice(k, end + 1) : '';
    if (block && (!mustContain || block.indexOf(mustContain) >= 0)) return block;
    i = k + 1;
  }
}
const desktopOf = (t) => mediaBlock(t, '@media (min-width: 900px)');

console.log('--- A. OLD configuration exhibits both bug mechanisms (test sensitivity) ---');
const oldDesktop = desktopOf(oldCss);
const oldTopstack = ruleBlock(oldDesktop, 'body:has(.game-cols) .ord-topstack', 'position');
check('old: desktop .ord-topstack rule exists', oldTopstack.length > 0);
check('old: desktop .ord-topstack sets position:sticky (the intent)', /position:\s*sticky/.test(oldTopstack));
check('old: desktop .ord-topstack has NO display declaration (sticky is inert: base display:contents wins)',
  !/display\s*:/.test(oldTopstack));
const oldNarration = ruleBlock(oldCss, '\n.ord-narration {');
check('old: base .ord-narration has fixed height 184px', /height:\s*184px/.test(oldNarration));
check('old: base .ord-narration has NO flex-shrink (crushable: scroll containers get flex min 0)',
  !/flex-shrink/.test(oldNarration));

console.log('--- B. NEW configuration removes both mechanisms ---');
const newDesktop = desktopOf(css);
const newTopstack = ruleBlock(newDesktop, 'body:has(.game-cols) .ord-topstack', 'position');
check('new: desktop .ord-topstack sets display:block (real box: sticky/z-index/bg take effect)',
  /display:\s*block/.test(newTopstack));
check('new: desktop .ord-topstack keeps position:sticky; top:0',
  /position:\s*sticky/.test(newTopstack) && /top:\s*0/.test(newTopstack));
check('new: desktop .ord-topstack has flex-shrink:0 (pinned stack keeps its height)',
  /flex-shrink:\s*0/.test(newTopstack));
const newNarration = ruleBlock(css, '\n.ord-narration {');
check('new: base .ord-narration keeps fixed height 184px', /height:\s*184px/.test(newNarration));
check('new: base .ord-narration has flex-shrink:0 (holds its height; column scrolls instead)',
  /flex-shrink:\s*0/.test(newNarration));

console.log('--- C. No regressions in surrounding contracts ---');
const baseTopstack = ruleBlock(css, '\n.ord-topstack {');
check('mobile untouched: base .ord-topstack is still display:contents', /display:\s*contents/.test(baseTopstack));
const cardRule = ruleBlock(css, '\n.ord-narration .inlinecard {');
check('person card still capped at max-height:100% of the region', /max-height:\s*100%/.test(cardRule));
check('muster fix intact: card header sticky top', /position:\s*sticky;\s*top:\s*0/.test(css));
check('muster fix intact: card buttons sticky bottom', /position:\s*sticky;\s*bottom:\s*0/.test(css));
check('template intact: controls+narration still wrapped in .ord-topstack',
  /<div class="ord-topstack">/.test(fs.readFileSync('src/js/app.js', 'utf8')));
check('desktop column still capped+scrollable (the shrink context still exists, now harmless)',
  /max-height:\s*calc\(100vh - 32px\)/.test(newDesktop));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
