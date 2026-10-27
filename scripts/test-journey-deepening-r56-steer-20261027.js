// test-journey-deepening-r56-steer-20261027.js -- PROOF TEST for the r56
// panel-picker subject-steer (driver-only, zero src/js).
//
// Before (r55 driver): the panel picker never picks dlg:subject (it is in
// no picker list), so on a stage-0 sitting where subject IS offered, the
// picker takes an ENGAGE option instead (r55 panel: 42002-d45 turn 0 offered
// dlg:subject with want stage 0; picker took dlg:comfort, drifted to
// gossip, looped dlg:more).
// After (r56 driver): when the sitting's current want stage is 0 and a
// dlg:subject choice is offered, the panel picker takes dlg:subject before
// the ENGAGE loop — the explicit subject change a real player makes
// (docs/CONVERSATIONS.md). Steering applies ONLY while the want is unheard
// (stage 0) and ONLY on the panel path (CONVO_MODE 'r50'); probe arms and
// later-stage sittings run unchanged.
//
// This test extracts the REAL pickChoice from the driver file under test
// (argv[2], default: the r56 driver) — no copied logic — and asserts:
//   (a) stage 0 + subject offered -> dlg:subject (steer beats ENGAGE)
//   (b) stage 0 + no subject -> ENGAGE-first unchanged (dlg:more)
//   (c) stage >=1 + subject offered -> ENGAGE-first unchanged (no steer)
//   (d) stage 0 + subject + dlg:commit offered -> dlg:subject (steer beats
//       even the strongest ENGAGE option)
//   (e) betrayal-only menu (no subject) -> leave (picker never engages
//       betrayal; steering cannot fix that class — documents the residual)
//   (f) leave-only menu -> leave (fallback sanity)
// Against the pre-fix r55 driver this test FAILS on (a) and (d); against
// the fixed r56 driver it PASSES all.
// Usage: node scripts/test-journey-deepening-r56-steer-20261027.js [driver-path]
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = process.argv[2] || path.join(__dirname, 'journey-deepening-r56-20261027.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };

const src = fs.readFileSync(DRIVER, 'utf8');
// ---- driver gates (cheap, name the file under test) ----
check('driver contains R56 SUBJECT-STEER rule', src.includes('R56 SUBJECT-STEER'), DRIVER);
check('driver contains STEER marker', src.includes('(STEER: stage-0 want)'), DRIVER);
check('driver passes wantStage into pickChoice', src.includes('pickChoice(choices, turn, wantStage)'), DRIVER);

// ---- extract the real picker + its lists from the driver ----
function extractConst(name) {
  const m = src.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  if (!m) throw new Error(`const ${name} not found in driver`);
  return eval(m[1]); // eslint-disable-line no-eval -- test-only extraction of a literal list
}
const ENGAGE = extractConst('ENGAGE');
const ENGAGE2 = extractConst('ENGAGE2');
const DEFLECT = extractConst('DEFLECT');
const fnStart = src.indexOf('function pickChoice(');
const fnEnd = src.indexOf('\nconst CONVO_DAYS', fnStart);
if (fnStart < 0 || fnEnd < 0) { console.log('FAIL pickChoice extraction — function boundaries not found'); process.exit(1); }
const fnSrc = src.slice(fnStart, fnEnd);
const buildPicker = (convoMode) => {
  const factory = new Function('CONVO_MODE', '_probeDay80', 'ENGAGE', 'ENGAGE2', 'DEFLECT', fnSrc + '\nreturn pickChoice;'); // eslint-disable-line no-new-func
  return factory(convoMode, false, ENGAGE, ENGAGE2, DEFLECT);
};
const pick = buildPicker('r50');
const ch = (ids) => ids.map((id) => ({ id, label: id }));

check('(a) stage 0 + subject offered -> dlg:subject', (() => { const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0); return p && p.id === 'dlg:subject'; })());
check('(b) stage 0 + no subject -> dlg:more (ENGAGE unchanged)', (() => { const p = pick(ch(['dlg:more', 'leave']), 0, 0); return p && p.id === 'dlg:more'; })());
check('(c) stage 1 + subject offered -> dlg:more (no steer past stage 0)', (() => { const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 1, 1); return p && p.id === 'dlg:more'; })());
check('(d) stage 0 + subject + dlg:commit -> dlg:subject (steer beats ENGAGE)', (() => { const p = pick(ch(['dlg:commit', 'dlg:subject', 'leave']), 0, 0); return p && p.id === 'dlg:subject'; })());
check('(e) betrayal-only menu -> leave (residual class, steering cannot fix)', (() => { const p = pick(ch(['betrayal:accept', 'betrayal:decline', 'leave', 'silence']), 0, 0); return p && p.id === 'leave'; })());
check('(f) leave-only menu -> leave (fallback sanity)', (() => { const p = pick(ch(['leave']), 0, 0); return p && p.id === 'leave'; })());
check('(g) probe-mode picker unaffected (subjectfirst turn 0 still subject-first by its own arm)', (() => {
  const sp = buildPicker('subjectfirst');
  const p = sp(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0);
  return p && p.id === 'dlg:subject';
})());

if (fail) { console.log(`STEER-PROOF: ${fail} FAILURES`); process.exit(1); }
console.log('STEER-PROOF: ALL PASS');
