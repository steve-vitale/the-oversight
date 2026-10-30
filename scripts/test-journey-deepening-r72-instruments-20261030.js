// test-journey-deepening-r72-instruments-20261030.js -- PROOF TEST for the
// r72 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r72 driver carries the r71 census wraps + instruments +
// r72 output filenames + r72 prereg path; (a3) no r71 output filenames left;
// (b) pickChoice, subjectPivotPick and pagerPick are byte-identical to r71;
// (c) the r72 analyzer reads r72 seed JSONs and reports Q1/Q2/Q3;
// (d) analyzer verdict logic on synthetic fixtures: bark pass, hide gap,
// wave-3 kill pass, regional pass, stay-green fail on a mislabel.
// Usage: node scripts/test-journey-deepening-r72-instruments-20261030.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r72-20261030.js');
const DRIVER71 = path.join(__dirname, 'journey-deepening-r71-20261030.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r72-20261030.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src71 = fs.readFileSync(DRIVER71, 'utf8');
const ana = fs.readFileSync(ANALYZER, 'utf8');
check('(a) driver contains census wraps + r72 outputs + r72 prereg',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') &&
  src.includes('journey-deepening-r72-seed${seed}.json') && src.includes('journey-deepening-r72-transcript-') &&
  src.includes('offeredSkillTurns') && src.includes('gateWhy') &&
  src.includes('function subjectPivotPick(') && src.includes('function pagerPick(') &&
  src.includes('journey-deepening-r72-prereg.md'));
check('(a3) no r71 output filenames left',
  !src.includes('journey-deepening-r71-seed') && !src.includes('journey-deepening-r71-transcript-'));
const slice = (s, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) return null;
  const b = to ? s.indexOf(to, a + from.length) : s.length;
  if (b < 0) return null;
  return s.slice(a, b);
};
check('(b) pickChoice byte-identical to r71',
  slice(src, 'function pickChoice(', '\nconst CONVO_DAYS') === slice(src71, 'function pickChoice(', '\nconst CONVO_DAYS'));
check('(b) subjectPivotPick byte-identical to r71',
  slice(src, 'function subjectPivotPick(', 'function pagerPick(') === slice(src71, 'function subjectPivotPick(', 'function pagerPick('));
check('(b) pagerPick byte-identical to r71',
  slice(src, 'function pagerPick(', 'function pickChoice(') === slice(src71, 'function pagerPick(', 'function pickChoice('));
check('(c) analyzer reads r72 JSONs + Q1/Q2/Q3',
  ana.includes('journey-deepening-r72-seed') && ana.includes('Q1 ARMOR-IN-DEEPENING') &&
  ana.includes('Q2 WAVE2-3 FIGHTS') && ana.includes('Q3 REGIONAL') &&
  ana.includes('TOTAL r72:') && !ana.includes('journey-deepening-r71-seed'));
const { verdicts } = require('./analyze-journey-deepening-r72-20261030.js');
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
  const v = verdicts([fakeSeed({ seed: 42101 }), fakeSeed({ seed: 42102 }), fakeSeed({ seed: 42103 }), fakeSeed({ seed: 42104 })]);
  check('(d) synthetic all-pass panel: Q1 PASS, Q2 PASS, Q3 PASS, stay-green PASS',
    v.q1 === 'PASS' && v.q2 === 'PASS' && v.q3 === 'PASS' && v.stayGreen === 'PASS');
  check('(d) synthetic hide gap detected (hide 0 everywhere)',
    v.hideGap === true);
}
{
  const noKill = fakeSeed({ seed: 42101, w3fights: [
    { day: 50, result: 'routed', rounds: 121, endHp: [{ kind: 'player' }], monsters: [{ mid: 'spool' }] },
    { day: 51, result: 'lost', rounds: 10, endHp: [{ kind: 'player' }], monsters: [{ mid: 'spool' }] },
  ], fightsByWave: { 2: 0, 3: 2 } });
  const v = verdicts([noKill, noKill, noKill, noKill]);
  check('(d) synthetic no-kill panel: Q2 FAIL + Q2 NO-GO finding',
    v.q2 === 'FAIL' && v.q2NoGo === true && v.totalW3 === 8 && v.totalW3kills === 0);
}
{
  const mis = fakeSeed({ seed: 42101, deathHonesty: { mislabels: [{ a: 1 }] } });
  const v = verdicts([mis, fakeSeed({ seed: 42102 }), fakeSeed({ seed: 42103 }), fakeSeed({ seed: 42104 })]);
  check('(d) synthetic mislabel panel: stay-green FAIL',
    v.stayGreen === 'FAIL' && v.mislabels === 1);
}
if (fail) { console.log(`RESULT: ${fail} FAILURES`); process.exit(1); }
console.log('RESULT: ALL PASS');
