// test-journey-deepening-r93-instruments-20261104.js -- proof that the r93
// driver carries the standing trace + last-living census, and that the
// r93 analyzer classifies S-TRACE verdicts (EXPLAINED /
// NEEDS-POLITY-CHECK / ARITHMETIC-BUG / NO-REGIONAL-DAYS) and P-DIST-LL
// correctly on fixtures. Tooling only; a live smoke run (seed 93600 x
// DAYCAP=45) proves the wraps fire in a real game.
// Usage: node scripts/test-journey-deepening-r93-instruments-20261104.js
'use strict';
const fs = require('fs');
const path = require('path');
const { summarizeStanding, distStats, median } = require('./analyze-journey-deepening-r93-20261104.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const driver = fs.readFileSync(path.join(__dirname, 'journey-deepening-r93-20261104.js'), 'utf8');
for (const marker of ['standingTrace', 'lastLivingCensus', 'networkLive', 'villageStanding()',
  '93601', 'journey-deepening-r93-transcript-', 'journey-deepening-r93-seed']) {
  check('driver marker ' + marker, driver.indexOf(marker) !== -1);
}
check('driver has no r92 output filenames', driver.indexOf('journey-deepening-r92-') === -1);
// The header honestly names r92's band as provenance; the stale-band
// check therefore reads the SEEDS default, not the whole file.
const seedsLine = (driver.split('\n').find(l => l.indexOf('const SEEDS') !== -1) || '');
check('driver has no stale seed default', seedsLine.indexOf('93501') === -1 && seedsLine.indexOf('93601') !== -1);
// The r93 insert must read the PURE breakdown, not the gated total
// (gated calls can trip release beats / move the peak ratchet).
const insertAt = driver.indexOf('R93: standing trace');
check('r93 insert exists', insertAt !== -1);
if (insertAt !== -1) {
  const blockEnd = driver.indexOf('r93trace', insertAt) + 80;
  const block = driver.slice(insertAt, blockEnd);
  check('r93 insert reads villageStanding()', block.indexOf('villageStanding()') !== -1);
  // The comment names the gated function as a warning; the call check
  // therefore looks for an actual _G call, not the name in prose.
  check('r93 insert does not call villageStandingTotal()', block.indexOf('_G.villageStandingTotal') === -1);
}

// distStats: median / min / max / sorted list, empty-safe.
check('dist odd median', distStats([8, 12, 38]).median === 12);
check('dist even median', distStats([8, 12, 13, 14]).median === 12.5);
check('dist sorted', JSON.stringify(distStats([38, 8, 14]).list) === '[8,14,38]');
check('dist empty', distStats([]).median === null && distStats([]).n === 0);
check('median helper', median([3, 1, 2]) === 2);

// Fixture builder: trace days + deed checkpoints.
function seedFixture(trace, deed, llc) {
  return { standingTrace: trace, deedLog: deed, lastLivingCensus: llc || null };
}
const T = (day, standing, scale, comp) => Object.assign({ day, standing, scale, pop: 5, networkLive: scale === 'regional' }, comp || { war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 });
const D = (day, standingTotal, scale, pop, links) => ({ day, standingTotal, scale, pop, links: links || [] });

// EXPLAINED: regional from day 50 at zero, all components zero,
// checkpoint link young (age 22 < 30) and low trust.
{
  const s = seedFixture(
    [T(49, 0, 'village'), T(50, 0, 'regional'), T(60, 0, 'regional'), T(70, 40, 'regional', { war: 0, diplomacy: 40, plenty: 0, warPts: 0, links: 1, feasts: 0 })],
    [D(50, 0, 'regional', 6, [{ other: 'Stonebridge', age: 22, trust: 35, seasoned: false, status: 'active' }]),
     D(70, 40, 'regional', 6, [{ other: 'Stonebridge', age: 42, trust: 45, seasoned: true, status: 'active' }])],
    { day: 70, pop: 6, plants: [8, 12, 38], names: ['A', 'B', 'C'] });
  const v = summarizeStanding(s);
  check('explained verdict', v.verdict === 'EXPLAINED', v.verdict);
  check('explained firstRegional', v.firstRegionalDay === 50);
  check('explained regionalZero count', v.regionalZeroDays === 2);
  check('explained firstPos', v.firstPositiveDay === 70);
  check('explained P-DIST-LL', v.lastLivingCensus.plants.median === 12 && v.lastLivingCensus.plants.max === 38 && v.lastLivingCensus.day === 70);
}

// NEEDS-POLITY-CHECK: seasoned link beside a gated regional zero.
{
  const s = seedFixture(
    [T(50, 0, 'regional')],
    [D(50, 0, 'regional', 6, [{ other: 'Stonebridge', age: 45, trust: 50, seasoned: true, status: 'active' }])],
    { day: 50, pop: 6, plants: [10], names: ['A'] });
  const v = summarizeStanding(s);
  check('polity-check verdict', v.verdict === 'NEEDS-POLITY-CHECK', v.verdict);
  check('polity-check link captured', v.seasonedBesideZero && v.seasonedBesideZero.links[0].age === 45);
}

// ARITHMETIC-BUG: positive diplomacy component beside a zero total.
{
  const s = seedFixture(
    [T(50, 0, 'regional', { war: 0, diplomacy: 40, plenty: 0, warPts: 0, links: 1, feasts: 0 })],
    [D(50, 0, 'regional', 6, [])], null);
  const v = summarizeStanding(s);
  check('arith-bug verdict', v.verdict === 'ARITHMETIC-BUG', v.verdict);
  check('arith-bug captured', v.arithBug && v.arithBug.diplomacy === 40);
}

// NO-REGIONAL-DAYS: village scale throughout.
{
  const s = seedFixture([T(50, 0, 'village'), T(60, 10, 'village', { war: 10, diplomacy: 0, plenty: 0, warPts: 1, links: 0, feasts: 0 })], [], null);
  const v = summarizeStanding(s);
  check('no-regional verdict', v.verdict === 'NO-REGIONAL-DAYS', v.verdict);
  check('no-regional firstPos', v.firstPositiveDay === 60);
}

// P-DIST-LL prefers the last-living census over a final empty census:
// the fixture's lastLivingCensus is day 50 even though the seed later died.
{
  const s = seedFixture([T(50, 0, 'regional')], [D(50, 0, 'regional', 6, [])],
    { day: 50, pop: 6, plants: [5, 5, 20, 20], names: ['A', 'B', 'C', 'D'] });
  const v = summarizeStanding(s);
  check('last-living census kept', v.lastLivingCensus && v.lastLivingCensus.plants.median === 12.5 && v.lastLivingCensus.plants.n === 4);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
