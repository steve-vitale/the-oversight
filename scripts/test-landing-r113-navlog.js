// Proof test for the r113 NAV-log classifier (Q1 PRIMARY, pre-registered).
// Runs the REAL classifier (scripts/analyze-landing-r113-navlog.js) on
// synthetic transcript fixtures in a temp dir and asserts exact counts:
//   (a) menu:more -> (no line) classifies NAV (the r112 shape: 86/86);
//   (b) a spoken pick (ask:gossip) -> (no line) classifies GENUINE;
//   (c) a (no line) with no preceding YOU pick classifies GENUINE;
//   (d) the winddown continuer 'more' -> (no line) classifies GENUINE
//       (a spoken 'more' returning silence IS the r53 shape — it must stay
//       visible, only menu:more is navigation);
//   (e) NAV: lines and menu:more picks are counted (the r113 shape).
// Usage: node scripts/test-landing-r113-navlog.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'navlog-test-'));
// t1: r112 shape — 2x menu:more -> (no line), 1x ask:gossip -> content.
fs.writeFileSync(path.join(tmp, 'journey-landing-r62-transcript-1063-day5.txt'), [
  '=== seed 1063 day 5 — conversation with Ana (v1) ===',
  'want: none (stage 0)',
  '',
  'YOU: [menu:more] More things to say (1/2)',
  'R55 WD GATE: ex=1 budget=3 pendingQ=false heldAsk=false queued=false windingDown=false heldBeats=0 thread=request depth=1',
  'THEM: (no line)',
  'YOU: [ask:gossip] Gossip',
  'THEM: People are saying things.',
  'YOU: [menu:more] More things to say (2/2)',
  'THEM: (no line)',
  '',
].join('\n'));
// t2: genuine shape — spoken pick -> (no line); (no line) with no YOU before it.
fs.writeFileSync(path.join(tmp, 'journey-landing-r62-transcript-1064-day6.txt'), [
  '=== seed 1064 day 6 — conversation with Bo (v2) ===',
  'THEM: (no line)',
  'YOU: [ask:gossip] Gossip',
  'THEM: (no line)',
  'YOU: [more] One more thing —',
  'THEM: (no line)',
  'YOU: (leave)',
  '',
].join('\n'));
// t3: r113 shape — 2x menu:more -> NAV: line, no THEM: (no line) at all.
fs.writeFileSync(path.join(tmp, 'journey-landing-r62-transcript-1065-day7.txt'), [
  '=== seed 1065 day 7 — conversation with Cy (v3) ===',
  'want: none (stage 0)',
  '',
  'YOU: [menu:more] More things to say (1/3)',
  'NAV: [menu:more] More things to say (1/3) — menu paged, no spoken line (navigation, not silence)',
  'YOU: [ask:gossip] Gossip',
  'THEM: People are saying things.',
  'YOU: [menu:more] More things to say (2/3)',
  'NAV: [menu:more] More things to say (2/3) — menu paged, no spoken line (navigation, not silence)',
  '',
].join('\n'));

const out = execFileSync(process.execPath,
  [path.join(__dirname, 'analyze-landing-r113-navlog.js'), tmp], { encoding: 'utf8' });
console.log(out);
// Pooled expectations:
//   t1: noLine=2 nav=2 genuine=0 navLines=0 menuMore=2
//   t2: noLine=3 genuine=3 (no-YOU, ask:gossip, winddown 'more') nav=0 menuMore=0
//   t3: noLine=0 navLines=2 menuMore=2
//   pooled: files=3 noLine=5 nav=2 genuine=3 navLines=2 menuMore=4
const m = /NAVLOG-CLASSIFY: files=(\d+) noLine=(\d+) nav=(\d+) genuine=(\d+) navLines=(\d+) menuMore=(\d+)/.exec(out);
assert(m, 'classifier must print the NAVLOG-CLASSIFY summary line');
const [, files, noLine, nav, genuine, navLines, menuMore] = m.map(Number);
assert.strictEqual(files, 3, 'files');
assert.strictEqual(noLine, 5, 'pooled noLine');
assert.strictEqual(nav, 2, 'pooled nav (menu:more only)');
assert.strictEqual(genuine, 3, 'pooled genuine (no-YOU + ask:gossip + winddown more)');
assert.strictEqual(navLines, 2, 'pooled navLines');
assert.strictEqual(menuMore, 4, 'pooled menuMore picks');
// The genuine samples must name the non-navigation picks, never menu:more.
assert(/pick=ask:gossip/.test(out), 'genuine sample names ask:gossip');
assert(/pick=more/.test(out), 'genuine sample names winddown more');
assert(/pick=none/.test(out), 'genuine sample names the no-YOU case');
assert(!/GENUINE-EMPTY[\s\S]*pick=menu:more/.test(out), 'menu:more must never appear as genuine');
console.log('test-landing-r113-navlog: 5/5 assertions PASS (nav=2 genuine=3 navLines=2 menuMore=4)');
fs.rmSync(tmp, { recursive: true, force: true });
