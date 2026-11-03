#!/usr/bin/env node
// test-gap-batch18-triage.js — gap batch item 18: #1595 REMAINDER
// (wall-chipping), TRIAGE PIN — not a proof of a fix.
//
// What this pins, as of the batch's work (2026-11-03):
//   * The #1595 measurement question is CLOSED: on seed 85106 the
//     Herald's 420 lost HP is fully accounted — 350 from three raid
//     drafts (175 wall damage each, 25% of 700 max HP) and 70 from
//     field fights. See evidence/2026-10-31/sim-heraldhp-b.md
//     (DIAG-GO verdict, 420/420).
//   * What remains is NOT a build: (a) a DESIGN QUESTION for the
//     coordinator/Steve — is a placed TITAN meant to be drafted as
//     an ordinary raid raider at all? The draft (havenGrowth.js
//     havenRaidTick) takes the nearest living world monsters with no
//     titan check, parks them on Haven's tile, and bills the 25%
//     wall toll. Excluding titans would change raid composition and
//     titan placement — gameplay balance, not a bug fix — so it is
//     HELD pending that call. (b) A loop measurement — raid-draft
//     frequency for placed titans across a wider band (only 1 of 4
//     located-Herald seeds took damage in the measured band).
//   * This script therefore asserts the CURRENT state: the draft
//     still has no titan exclusion and still bills the 25% wall
//     toll. If a later arm lands the design decision (exclusion or
//     a reckoning line), it must UPDATE this script and the batch
//     evidence note together — a failure here after such a landing
//     is expected, not a regression.
//
// Usage: node scripts/test-gap-batch18-triage.js
// Exit 0 when the triage observation still holds, 1 otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8');
let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label + (extra != null ? ' :: ' + extra : '')); }
}
// Isolate the draft: from the "---- RAID ----" marker to the raid
// announcement line.
const start = src.indexOf('// ---- RAID ----');
const end = src.indexOf('RAID —', start);
const draft = (start >= 0 && end > start) ? src.slice(start, end) : '';
ok(draft.length > 0, 'triage: raid draft section found in havenGrowth.js');
ok(draft.includes('raidBorn = true'), 'triage: draft still marks raiders raid-born');
ok(draft.includes('m.tx = hx; m.ty = hy'), 'triage: draft still parks raiders on Haven tile');
ok(/Math\.round\(\(\(m\.maxHp \|\| m\.hp \|\| 20\)\) \* 0\.25\)/.test(draft),
  'triage: draft still bills the 25%-of-max-HP wall toll');
ok(!/titan/i.test(draft), 'triage: draft still has NO titan exclusion (the held design question)',
  'if this now fails, the design decision landed — update this pin and the batch note');
console.log('\ntest-gap-batch18-triage: ' + pass + ' passed, ' + fail + ' failed');
console.log('HELD: item 18 remainder = design question (titan in raid draft) + loop census (draft frequency).');
process.exit(fail ? 1 : 0);
