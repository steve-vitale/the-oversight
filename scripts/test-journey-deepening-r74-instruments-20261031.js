// test-journey-deepening-r74-instruments-20261031.js -- PROOF TEST for the
// r74 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r74 driver carries the r72 census wraps + instruments +
// r74 output filenames + r74 prereg path; (a3) no r73 output filenames left;
// (b) pickChoice, subjectPivotPick and pagerPick are byte-identical to r73;
// (c) the r74 analyzer reads r74 seed JSONs and reports Q1a/Q1b/Q2/Q3;
// (d) analyzer verdict logic on synthetic fixtures: all-pass panel,
// made-fail/worn-pass split panel (the r72 metric-review case), hide gap,
// wave-3 kill pass, no-kill NO-GO, stay-green fail on a mislabel.
// Usage: node scripts/test-journey-deepening-r74-instruments-20261031.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r74-20261031.js');
const DRIVER73 = path.join(__dirname, 'journey-deepening-r73-20261031.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r74-20261031.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src73 = fs.readFileSync(DRIVER73, 'utf8');
const ana = fs.readFileSync(ANALYZER, 'utf8');
check('(a) driver contains census wraps + r74 outputs + r74 prereg',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') &&
  src.includes('journey-deepening-r74-seed${seed}.json') && src.includes('journey-deepening-r74-transcript-') &&
  src.includes('offeredSkillTurns') && src.includes('gateWhy') &&
  src.includes('function subjectPivotPick(') && src.includes('function pagerPick(') &&
  src.includes('journey-deepening-r74-prereg.md'));
check('(a3) no r73 output filenames left',
  !src.includes('journey-deepening-r73-seed') && !src.includes('journey-deepening-r73-transcript-'));
const slice = (s, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) return null;
  const b = to ? s.indexOf(to, a + from.length) : s.length;
  if (b < 0) return null;
  return s.slice(a, b);
};
check('(b) pickChoice byte-identical to r73',
  slice(src, 'function pickChoice(', '\nconst CONVO_DAYS') === slice(src73, 'function pickChoice(', '\nconst CONVO_DAYS'));
check('(b) subjectPivotPick byte-identical to r73',
  slice(src, 'function subjectPivotPick(', 'function pagerPick(') === slice(src73, 'function subjectPivotPick(', 'function pagerPick('));
check('(b) pagerPick byte-identical to r73',
  slice(src, 'function pagerPick(', 'function pickChoice(') === slice(src73, 'function pagerPick(', 'function pickChoice('));
check('(c) analyzer reads r74 JSONs + Q1a/Q1b/Q2/Q3',
  ana.includes('journey-deepening-r74-seed') && ana.includes('Q1a MADE') && ana.includes('Q1b WORN') &&
  ana.includes('Q2 WAVE2-3 FIGHTS') && ana.includes('Q3 REGIONAL') &&
  ana.includes('TOTAL r74:') && !ana.includes('journey-deepening-r73-seed'));
const { verdicts } = require('./analyze-journey-deepening-r74-20261031.js');
function fakeSeed(o) {
  return Object.assign({
    seed: 1, endReason: 'survived', maxGameDay: 101, finalWave: 3, finalScale: 'regional',
    census: [{ alive: true }, { alive: true }],
    armor: { craftArmor: { made: { bark_armor: 2 } }, snaps: [{ armoredVillagers: [{ torso: 'bark_armor' }] }], schEquipped: {}, matflow: { daysHidePos: 0, maxHide: 0 } },
    fightsByWave: { 2: 1, 3: 2 },
    w3fights: [{ day: 50, result: 'won', rounds: 4, endHp: [{ kind: 'villager' }, { kind: 'player' }], monsters: [{ mid: 'spool' }] }],
    regionalLog: [{ day: 33, ev: 'propose', result: 'linked' }],
    deathHonesty: { mislabels: [] },
  }, o);
}
{
  const v = verdicts([fakeSeed({ seed: 42121 }), fakeSeed({ seed: 42112 }), fakeSeed({ seed: 42113 }), fakeSeed({ seed: 42114 })]);
  check('(d) synthetic all-pass panel: Q1a PASS, Q1b PASS, Q2 PASS, Q3 PASS, stay-green PASS',
    v.q1a === 'PASS' && v.q1b === 'PASS' && v.q2 === 'PASS' && v.q3 === 'PASS' && v.stayGreen === 'PASS');
  check('(d) synthetic hide gap detected (hide 0 everywhere)',
    v.hideGap === true);
}
{
  // Made-fail / worn-pass: the r72 split case — worn armor with zero crafts.
  const wornOnly = fakeSeed({ seed: 42121, armor: { craftArmor: { made: {} }, snaps: [{ armoredVillagers: [{ torso: 'bark_armor' }] }], schEquipped: {}, matflow: { daysHidePos: 0, maxHide: 0 } } });
  const v = verdicts([wornOnly, wornOnly, wornOnly, wornOnly]);
  check('(d) synthetic split panel: Q1a FAIL while Q1b PASS',
    v.q1a === 'FAIL' && v.q1b === 'PASS' && v.madePass === 0 && v.wornPass === 4);
}
{
  const noKill = fakeSeed({ seed: 42121, w3fights: [
    { day: 50, result: 'routed', rounds: 121, endHp: [{ kind: 'player' }], monsters: [{ mid: 'spool' }] },
    { day: 51, result: 'lost', rounds: 10, endHp: [{ kind: 'player' }], monsters: [{ mid: 'spool' }] },
  ], fightsByWave: { 2: 0, 3: 2 } });
  const v = verdicts([noKill, noKill, noKill, noKill]);
  check('(d) synthetic no-kill panel: Q2 FAIL + Q2 NO-GO finding',
    v.q2 === 'FAIL' && v.q2NoGo === true && v.totalW3 === 8 && v.totalW3kills === 0);
}
{
  const mis = fakeSeed({ seed: 42121, deathHonesty: { mislabels: [{ a: 1 }] } });
  const v = verdicts([mis, fakeSeed({ seed: 42112 }), fakeSeed({ seed: 42113 }), fakeSeed({ seed: 42114 })]);
  check('(d) synthetic mislabel panel: stay-green FAIL',
    v.stayGreen === 'FAIL' && v.mislabels === 1);
}
if (fail) { console.log(`RESULT: ${fail} FAILURES`); process.exit(1); }
console.log('RESULT: ALL PASS');
