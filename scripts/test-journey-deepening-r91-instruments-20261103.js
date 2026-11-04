// test-journey-deepening-r91-instruments-20261103.js -- proof that the r91
// driver carries the transcript choice-rotation fix, that
// classifyFightOutcome still judges all six classes on fixtures, and that
// the analyzer summarizes the pre-registered K-LESSON / K-MARKERS /
// K-LINKS / K-CODEX panel (with the pre-collapse snapshot rule) correctly.
// Tooling only; a live smoke run (seed 93400 x DAYCAP=45) proves the wraps
// fire in a real game.
// Usage: node scripts/test-journey-deepening-r91-instruments-20261103.js
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyFightOutcome, pickChoice } = require('./journey-deepening-r91-20261103.js');
const { summarizeSeed, scanTranscript, median } = require('./analyze-journey-deepening-r91-20261103.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const driver = fs.readFileSync(path.join(__dirname, 'journey-deepening-r91-20261103.js'), 'utf8');
for (const marker of ['classifyFightOutcome', 'weaponSnap', 'armorSnap', 'wildFightTable',
  'w4ship', 'veteran: !!', '93401', 'journey-deepening-r91-transcript-',
  'journey-deepening-r91-seed', '_moreStreak', 'MORE_IDS']) {
  check('driver marker ' + marker, driver.indexOf(marker) !== -1);
}
check('driver has no r90 output filenames', driver.indexOf('journey-deepening-r90-') === -1);
check('driver has no stale seed band', driver.indexOf('93301') === -1);

// classifyFightOutcome: all six classes + multi-monster partial.
const P = (hp, fled) => ({ key: 'p', kind: 'player', hp, fled: !!fled });
const M = (hp, fled) => ({ key: 'm_0', kind: 'monster', hp, fled: !!fled });
check('class kill', classifyFightOutcome({ over: true, endHp: [P(40), M(0)] }) === 'kill');
check('class kill multi all dead', classifyFightOutcome({ over: true, endHp: [P(5), M(0), { key: 'm_1', kind: 'monster', hp: 0 }] }) === 'kill');
check('class player-died', classifyFightOutcome({ over: true, endHp: [P(0), M(300)] }) === 'player-died');
check('class player-died beats fled check order', classifyFightOutcome({ over: true, endHp: [P(0, true), M(300)] }) === 'player-died');
check('class player-fled', classifyFightOutcome({ over: true, endHp: [P(40, true), M(900)] }) === 'player-fled');
check('class monster-fled', classifyFightOutcome({ over: true, endHp: [P(40), M(900, true)] }) === 'monster-fled');
check('class ended-alive', classifyFightOutcome({ over: true, endHp: [P(40), M(300)] }) === 'ended-alive');
check('class unresolved', classifyFightOutcome({ over: false, endHp: [P(40), M(300)] }) === 'unresolved');
check('class unresolved no over flag', classifyFightOutcome({ endHp: [P(40), M(300)] }) === 'unresolved');
check('class partial multi not kill', classifyFightOutcome({ over: true, endHp: [P(40), M(0), { key: 'm_1', kind: 'monster', hp: 120 }] }) === 'ended-alive');

// R91 CHOICE ROTATION: more/details allowed twice, blocked on the third
// consecutive pick; a non-more pick resets the budget.
const MORE = [{ id: 'dlg:more', label: 'Tell me more' }, { id: 'dlg:react', label: 'React' }];
check('rotation pick1 more', pickChoice(MORE, 0).id === 'dlg:more');
check('rotation pick2 more', pickChoice(MORE, 1).id === 'dlg:more');
check('rotation pick3 blocked -> react', pickChoice(MORE, 2).id === 'dlg:react');
check('rotation budget resets after non-more', pickChoice(MORE, 3).id === 'dlg:more');
const DET = [{ id: 'dlg:details', label: 'Details' }, { id: 'dlg:react', label: 'React' }];
check('rotation details counts toward streak (pick1)', pickChoice(DET, 0).id === 'dlg:details');
// Streak is now 2 (one more from the reset test + one details): next
// details pick is blocked, proving more+details share one budget.
check('rotation mixed streak blocks details', pickChoice(DET, 1).id === 'dlg:react');

// Analyzer fixtures: K fields + pre-collapse rule + W3 base.
const seed = {
  seed: 93401, endReason: 'survived', maxGameDay: 100, finalWave: 4, finalScale: 'regional',
  engaged: { w3: 5, w4: 2 },
  wildFightTable: [
    { day: 60, rounds: 20, result: 'win', over: true, waves: [3], monsters: [{ mid: 'w3a', wave: 3 }], partySize: 2, weapon: { name: 'spear', range: 1 }, armor: 2, dmgFrac: 1, outcomeClass: 'kill' },
    { day: 70, rounds: 25, result: null, over: true, waves: [3], monsters: [{ mid: 'w3b', wave: 3 }], partySize: 1, weapon: { name: 'spear', range: 1 }, armor: 0, dmgFrac: 0.35, outcomeClass: 'player-died' },
    { day: 75, rounds: 5, result: null, over: true, waves: [3], monsters: [{ mid: 'w3c', wave: 3 }], partySize: 1, weapon: { name: 'spear', range: 1 }, armor: 0, dmgFrac: 0.08, outcomeClass: 'player-fled' },
  ],
  ship: { lessons: [
    { day: 10, teacher: 'a', learner: 'b', skill: 'wound_care', ok: true },
    { day: 12, teacher: 'a', learner: 'c', skill: 'wound_care', ok: true },
    { day: 14, teacher: 'a', learner: 'd', skill: 'herbal_remedy', ok: false },
  ] },
  ctxSummary: { beasttricksAsked: 5, beasttricksTaught: 2 },
  knowCounts: { experiment: 3, traderDeep: 1, moot: 9 },
  regionalLog: [
    { day: 31, ev: 'propose', result: 'linked' },
    { day: 40, ev: 'propose', result: 'declined' },
    { day: 41, ev: 'tribute', paid: true },
  ],
  deedLog: [
    { day: 50, pop: 0, standingTotal: 5, codexL2: 0, sharedKnowN: 0, traderDeepN: 0, scale: 'village', links: [] },
    { day: 80, pop: 8, standingTotal: 120, codexL2: 4, sharedKnowN: 22, traderDeepN: 19, scale: 'regional',
      links: [{ id: 'l1', status: 'active' }, { id: 'l2', status: 'broken' }] },
  ],
  armor: { readiness: [
    { day: 80, wave: 4, ready: true, armored: 3, armed: 4, tricks: 9, veterans: 1 },
    { day: 96, wave: 4, ready: false, armored: 0, armed: 0, tricks: 9, veterans: 0 },
  ] },
  deathHonesty: { mislabels: [] },
  census: [
    { alive: true, plantsKnown: 10 }, { alive: true, plantsKnown: 20 }, { alive: false, plantsKnown: 99 },
  ],
};
const v = summarizeSeed(seed);
check('analyzer lessons', v.lessonsN === 3 && v.lessonsOk === 2, JSON.stringify([v.lessonsN, v.lessonsOk]));
check('analyzer beast', v.beastAsked === 5 && v.beastTaught === 2);
check('analyzer knowCounts', v.knowExperiment === 3 && v.knowTraderDeep === 1 && v.knowMoot === 9);
check('analyzer propose outcomes', v.proposeN === 2 && v.proposeOutcomes.linked === 1 && v.proposeOutcomes.declined === 1, JSON.stringify(v.proposeOutcomes));
check('analyzer last-living skips pop0', v.lastLivingDay === 80 && v.standingLastLiving === 120 && v.codexL2 === 4 && v.sharedKnowN === 22 && v.traderDeepN === 19, JSON.stringify(v.lastLivingDay));
check('analyzer active links only', v.linksActive === 1);
check('analyzer readiness pre-collapse', v.readinessPre && v.readinessPre.day === 80 && v.readinessPre.armored === 3, JSON.stringify(v.readinessPre));
check('analyzer plants mean alive only', v.plantsMeanAlive === 15, JSON.stringify(v.plantsMeanAlive));
check('analyzer w3total', v.w3total === 3);
check('analyzer w3kills', v.w3kills === 1);
check('analyzer w3dmgMedianFought excludes fled', v.w3dmgMedianFought === 0.675, JSON.stringify(v.w3dmgMedianFought));
check('analyzer end survived', v.end === 'survived');
check('median even', median([1, 3]) === 2);
check('median empty null', median([]) === null);
check('transcript loop flag', scanTranscript('THEM: hello\nTHEM: hello\nTHEM: hello\n').loop === true);
check('transcript no loop', scanTranscript('THEM: a\nTHEM: b\nTHEM: a\n').loop === false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
