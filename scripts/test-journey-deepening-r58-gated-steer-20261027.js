// test-journey-deepening-r58-gated-steer-20261027.js -- PROOF TEST for
// the r58 WANT-KIND GATED subject-steer (driver-only, zero src/js).
//
// Before (r57 driver): the bounded steer fired on ANY stage-0 want that
// was present, including seek_comfort — and r57 proved one such fire is
// enough to break a grief sitting (steer off the opening thread strands
// comfort/empathize forever; the grief want resolves ONLY via those).
// After (r58 driver): the steer fires ONLY when (a) a want is present AND
// KNOWN (wantId real, not 'none', not undefined — fail-closed), (b) the
// want kind is NOT seek_comfort (exact or ':seek_comfort' suffix), AND
// (c) no steer has fired yet in this sitting.
//
// This test extracts the REAL pickChoice from the driver file under test
// (argv[2], default: the r58 driver) — no copied logic — and asserts:
//   (a) stage 0 + ask_favor + fresh state + subject -> dlg:subject,
//       and the state records the fire
//   (b) second call with the SAME state -> dlg:more (at most one steer)
//   (c) stage 0 + want 'none' + fresh state + subject -> dlg:more,
//       state NOT fired (no steer without a want)
//   (d) stage 0 + seek_comfort + fresh state + subject -> dlg:more,
//       state NOT fired (THE GATE — against the r57 driver this FAILS)
//   (e) stage 0 + 'alive:want:seek_comfort' + subject -> dlg:more
//       (suffix form of the grief kind is also gated)
//   (f) legacy 3-arg call (wantId undefined) -> dlg:more, no fire
//       (FAIL-CLOSED change vs r57 proof (f): an unknown want kind
//       never steers, since it could be grief; the panel caller always
//       passes a wantId, so this path is test-only)
//   (g) stage 1 + ask_favor + subject -> dlg:more (no steer past stage 0)
//   (h) stage 0 + ask_favor + subject + dlg:commit -> dlg:subject
//       (one fire beats ENGAGE)
//   (i) betrayal-only menu -> leave (residual class, steering cannot fix)
// Against the r57 driver this test FAILS on (d), (e) and (f); against
// the r58 driver it PASSES all.
// Usage: node scripts/test-journey-deepening-r58-gated-steer-20261027.js [driver-path]
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = process.argv[2] || path.join(__dirname, 'journey-deepening-r58-20261027.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };

const src = fs.readFileSync(DRIVER, 'utf8');
// ---- driver gates (cheap, name the file under test) ----
check('driver contains R58 WANT-KIND GATED rule', src.includes('R58 WANT-KIND GATED'), DRIVER);
check('driver contains STEER58 marker', src.includes('(STEER58: gated)'), DRIVER);
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

check('(a) stage 0 + ask_favor + fresh state + subject -> dlg:subject + state fired', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'ask_favor', st);
  return p && p.id === 'dlg:subject' && st.fired === true;
})());
check('(b) same state, second call -> dlg:more (at most one steer per sitting)', (() => {
  const st = { fired: false };
  pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'ask_favor', st);
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 1, 0, 'ask_favor', st);
  return p && p.id === 'dlg:more';
})());
check("(c) stage 0 + want 'none' + fresh state + subject -> dlg:more (no steer without a want)", (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'none', st);
  return p && p.id === 'dlg:more' && st.fired === false;
})());
check('(d) stage 0 + seek_comfort + fresh state + subject -> dlg:more, NOT fired (THE GATE)', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'seek_comfort', st);
  return p && p.id === 'dlg:more' && st.fired === false;
})());
check("(e) stage 0 + 'alive:want:seek_comfort' + subject -> dlg:more (suffix grief kind gated)", (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0, 'alive:want:seek_comfort', st);
  return p && p.id === 'dlg:more' && st.fired === false;
})());
check('(f) legacy 3-arg call (wantId undefined) -> dlg:more, no fire (fail-closed)', (() => {
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 0, 0);
  return p && p.id === 'dlg:more';
})());
check('(g) stage 1 + ask_favor + subject -> dlg:more (no steer past stage 0)', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:more', 'dlg:subject', 'leave']), 1, 1, 'ask_favor', st);
  return p && p.id === 'dlg:more';
})());
check('(h) stage 0 + ask_favor + subject + dlg:commit -> dlg:subject (one fire beats ENGAGE)', (() => {
  const st = { fired: false };
  const p = pick(ch(['dlg:commit', 'dlg:subject', 'leave']), 0, 0, 'ask_favor', st);
  return p && p.id === 'dlg:subject';
})());
check('(i) betrayal-only menu -> leave (residual class, steering cannot fix)', (() => {
  const st = { fired: false };
  const p = pick(ch(['betrayal:accept', 'betrayal:decline', 'leave', 'silence']), 0, 0, 'ask_favor', st);
  return p && p.id === 'leave';
})());

if (fail) { console.log(`GATED-STEER-PROOF: ${fail} FAILURES`); process.exit(1); }
console.log('GATED-STEER-PROOF: ALL PASS');
