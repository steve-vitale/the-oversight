// test-journey-deepening-r90-instruments-20261103.js -- proof that the r90
// W4 wild-fight instruments exist in the driver, that classifyFightOutcome
// judges all six classes on fixtures, and that the analyzer summarizes the
// pre-registered W4/W3 panel correctly. Tooling only; a live smoke run
// (seed 93300 x DAYCAP=45) proves the wraps fire in a real game.
// Usage: node scripts/test-journey-deepening-r90-instruments-20261103.js
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyFightOutcome } = require('./journey-deepening-r90-20261103.js');
const { summarizeSeed, scanTranscript, median } = require('./analyze-journey-deepening-r90-20261103.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const driver = fs.readFileSync(path.join(__dirname, 'journey-deepening-r90-20261103.js'), 'utf8');
for (const marker of ['classifyFightOutcome', 'weaponSnap', 'armorSnap', 'wildFightTable',
  'w4ship', 'veteran: !!', '93301', 'journey-deepening-r90-transcript-',
  'journey-deepening-r90-seed']) {
  check('driver marker ' + marker, driver.indexOf(marker) !== -1);
}
check('driver has no r89 output filenames', driver.indexOf('journey-deepening-r89-') === -1);
check('driver has no stale seed band', driver.indexOf('93201') === -1);

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

// Analyzer fixtures: W4 kill + W4 fled + W3 kill + W3 died.
const seed = {
  seed: 93301, endReason: 'survived', maxGameDay: 100, finalWave: 4, finalScale: 'regional',
  engaged: { w3: 5, w4: 2 },
  wildFightTable: [
    { day: 88, rounds: 30, result: 'win', over: true, waves: [4], monsters: [{ mid: 'mirror_x', wave: 4, veteran: false }], partySize: 2, weapon: { name: 'spear', range: 1 }, armor: 3, dmgFrac: 1, outcomeClass: 'kill' },
    { day: 92, rounds: 12, result: null, over: true, waves: [4], monsters: [{ mid: 'mirror_y', wave: 4, veteran: true }], partySize: 1, weapon: { name: 'spear', range: 1 }, armor: 0, dmgFrac: 0.08, outcomeClass: 'player-fled' },
    { day: 60, rounds: 20, result: 'win', over: true, waves: [3], monsters: [{ mid: 'w3a', wave: 3 }], partySize: 2, weapon: { name: 'spear', range: 1 }, armor: 2, dmgFrac: 1, outcomeClass: 'kill' },
    { day: 70, rounds: 25, result: null, over: true, waves: [3], monsters: [{ mid: 'w3b', wave: 3 }], partySize: 1, weapon: { name: 'spear', range: 1 }, armor: 0, dmgFrac: 0.35, outcomeClass: 'player-died' },
  ],
  w4ship: [{ day: 88, mid: 'mirror_x', outcome: 'win' }],
  armor: { readiness: [{ day: 100, wave: 4, ready: true, armored: 3, armed: 5, tricks: 2, veterans: 1 }] },
  deathHonesty: { mislabels: [] },
  census: [{ alive: true }, { alive: true }, { alive: false }],
};
const v = summarizeSeed(seed);
check('analyzer w4total', v.w4total === 2, JSON.stringify(v.w4total));
check('analyzer w4kills', v.w4kills === 1);
check('analyzer w4classes', v.w4classes.kill === 1 && v.w4classes['player-fled'] === 1, JSON.stringify(v.w4classes));
check('analyzer w4dmgMedianFought excludes fled', v.w4dmgMedianFought === 1, JSON.stringify(v.w4dmgMedianFought));
check('analyzer w3total', v.w3total === 2);
check('analyzer w3kills', v.w3kills === 1);
check('analyzer w3dmgMedianFought', v.w3dmgMedianFought === 0.675, JSON.stringify(v.w3dmgMedianFought));
check('analyzer w4ship', v.w4ship === 1);
check('analyzer readinessLast', v.readinessLast && v.readinessLast.ready === true);
check('analyzer end survived', v.end === 'survived');
check('median even', median([1, 3]) === 2);
check('median empty null', median([]) === null);
check('transcript loop flag', scanTranscript('THEM: hello\nTHEM: hello\nTHEM: hello\n').loop === true);
check('transcript no loop', scanTranscript('THEM: a\nTHEM: b\nTHEM: a\n').loop === false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
