// test-journey-deepening-r57-bounded-steer-20261027.js -- PROOF TEST for
// the r57 BOUNDED subject-steer (driver-only, zero src/js).
//
// Before (r56 driver): the steer fired on EVERY stage-0 turn where
// dlg:subject was offered, with no want check and no per-sitting cap —
// 8 fires, all on 42002, trapping both grief sittings in subject-change
// loops (grief wants advance via comfort/empathize on the opening thread,
// not via subject change) and misfiring with no want present.
// After (r57 driver): the steer fires ONLY when (a) a want is present
// (wantId real, not 'none') AND (b) no steer has fired yet in this
// sitting (caller-owned steerState object, one per sitting).
//
// This test extracts the REAL pickChoice from the driver file under test
// (argv[2], default: the r57 driver) — no copied logic — and asserts:
//   (a) stage 0 + want present + fresh state + subject -> dlg:subject,
//       and the state records the fire
//   (b) second call with the SAME state -> ENGAGE (dlg:more), never a
//       second steer in one sitting
//   (c) stage 0 + want 'none' + fresh state + subject -> dlg:more (no
//       steer without a want)
//   (d) stage 0 + want present + subject + dlg:commit -> dlg:subject
//       (bounded steer still beats ENGAGE on its one fire)
//   (e) stage 1 + want present + subject -> dlg:more (no steer past
//       stage 0)
//   (f) legacy 3-arg call (no wantId/state) -> dlg:subject (old r56
//       proof tests keep passing; the bound lives in the caller)
//   (g) betrayal-only menu -> leave (residual class, steering cannot fix)
// Against the r56 driver this test FAILS on (b) and (c); against the r57
// driver it PASSES all.
// Usage: node scripts/test-journey-deepening-r57-bounded-steer-20261027.js [driver-path]
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = process.argv[2] || path.join(__dirname, 'journey-deepening-r57-20261027.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };

const src = fs.readFileSync(DRIVER, 'utf8');
// ---- driver gates (cheap, name the file under test) ----
check('driver contains R57 BOUNDED SUBJECT-STEER rule', src.includes('R57 BOUNDED SUBJECT-STEER'), DRIVER);
check('driver contains STEER57 marker', src.includes('(STEER57: bounded)'), DRIVER);
check('driver passes wantId + steerState into pickChoice', src.includes('pickChoice(choices, turn, wantStage, wantId, steerState)'), DRIVER);

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

check('(a) stage 0 + want present + fresh state + subject -> dlg:subject + state fired', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'seek_comfort', st);
  return p && p.id === 'dlg:subject' && st.fired === true;
})());
check('(b) same state, second call -> dlg:more (at most one steer per sitting)', (() => {
  const st = { fired: false };
  pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'seek_comfort', st);
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 1, 0, 'seek_comfort', st);
  return p && p.id === 'dlg:more';
})());
check("(c) stage 0 + want 'none' + fresh state + subject -> dlg:more (no steer without a want)", (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'none', st);
  return p && p.id === 'dlg:more' && st.fired === false;
})());
check('(d) stage 0 + want present + subject + dlg:commit -> dlg:subject (one fire beats ENGAGE)', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:commit', 'dlg:subject', 'leave']), 0, 0, 'ask_favor', st);
  return p && p.id === 'dlg:subject';
})());
check('(e) stage 1 + want present + subject -> dlg:more (no steer past stage 0)', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 1, 1, 'seek_comfort', st);
  return p && p.id === 'dlg:more';
})());
check('(f) legacy 3-arg call -> dlg:subject (old r56 proof tests keep passing)', (() => {
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0);
  return p && p.id === 'dlg:subject';
})());
check('(g) betrayal-only menu -> leave (residual class, steering cannot fix)', (() => {
  const st = { fired: false };
  const p = pick(ch(['betrayal:accept', 'betrayal:decline', 'leave', 'silence']), 0, 0, 'ask_favor', st);
  return p && p.id === 'leave';
})());

if (fail) { console.log(`BOUNDED-STEER-PROOF: ${fail} FAILURES`); process.exit(1); }
console.log('BOUNDED-STEER-PROOF: ALL PASS');
