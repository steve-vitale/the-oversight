// test-journey-deepening-r89-instruments-20261103.js -- proof that the r89
// meat-chain instruments exist in the driver and that the analyzer judges
// the pre-registered verdicts correctly on fixtures. Tooling only; a live
// smoke run (seed 93200 x DAYCAP=45) proves the wraps fire in a real game.
// Usage: node scripts/test-journey-deepening-r89-instruments-20261103.js
'use strict';
const fs = require('fs');
const path = require('path');
const { meatVerdict, scanTranscript } = require('./analyze-journey-deepening-r89-20261103.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const driver = fs.readFileSync(path.join(__dirname, 'journey-deepening-r89-20261103.js'), 'utf8');
for (const marker of ['monsterMeatEntry', 'markMonsterFoodSafe', 'villagerExperimentBeat',
  'trackMealExposure', 'meatCensus', 'meatKills', 'meatReveals', 'meatTests',
  'meatDinners', 'meatCensuses', '93201', 'journey-deepening-r89-transcript-',
  'journey-deepening-r89-seed']) {
  check('driver marker ' + marker, driver.indexOf(marker) !== -1);
}
check('driver has no r88 output filenames', driver.indexOf('journey-deepening-r88-') === -1);
check('driver has no stale seed band', driver.indexOf('93101') === -1);

// Analyzer verdict fixtures.
const dinnerSeed = { meat: {
  kills: [{ day: 41, mid: 'grief_counselor', kcal: 900 }],
  reveals: [{ day: 44, mid: 'grief_counselor', how: 'tested' }],
  tests: [{ day: 44, mid: 'grief_counselor', before: { fs: false }, after: { fs: true } }],
  dinners: [{ day: 46, plantId: 'meat_grief_counselor', foodState: 'cooked', cooked: true }],
  censuses: [{ day: 50, inv: [], pantry: [{ plantId: 'meat_grief_counselor', foodState: 'cooked', units: 2 }], counter: [], foodSafe: ['grief_counselor'], foodTested: {} }],
  wrapErrors: [] } };
const drySeed = { meat: {
  kills: [{ day: 41, mid: 'hushwolf', kcal: 500 }],
  reveals: [], tests: [], dinners: [],
  censuses: [{ day: 50, inv: [], pantry: [], counter: [], foodSafe: [], foodTested: {} }],
  wrapErrors: [] } };
const v1 = meatVerdict(dinnerSeed);
check('verdict dinner GO', v1.dinner === true && v1.dinners === 1 && v1.kills === 1 && v1.reveals === 1 && v1.tests === 1);
check('verdict haul counts census items', v1.haulItems === 1);
const v2 = meatVerdict(drySeed);
check('verdict dry NO-GO with kill denominator', v2.dinner === false && v2.kills === 1 && v2.dinners === 0 && v2.haulItems === 0);

// Transcript scan fixtures.
const loopText = 'THEM: Hello there.\nYOU: [leave] x\nTHEM: Hello there.\nTHEM: Hello there.\n';
check('scan flags verbatim repeat', scanTranscript(loopText).loop === true);
const okText = 'THEM: One.\nTHEM: Two.\nTHEM: Three.\n';
check('scan passes clean transcript', scanTranscript(okText).loop === false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
