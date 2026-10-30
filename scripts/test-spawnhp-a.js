#!/usr/bin/env node
// scripts/test-spawnhp-a.js — sim-spawnhp-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-spawnhp-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-spawnhp-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-spawnhp-a.js
//      --one, diffs the row JSON AND the census JSON byte-for-byte
//      against the corpus, prints the verdict, and removes the scratch
//      dir afterwards. Scratch lives under evidence/ (never /tmp) and
//      is removed in a finally block, pass or fail.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifyProvenance, aggregateByType, buildStreaks, filesByteEqual, censoredOf } =
  require('./analyze-spawnhp-a');
const { buildChains } = require('./analyze-chainclose-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

// --- provenance decision tree, priority order ---
{
  const base = { seed: 1, mid: 'audit', floor: 1100, lastLeft: 1008, firstDay: 74 };
  // WOUNDED-IN-CORPUS beats everything, even a census spawn-looking sighting.
  eq('prov wounded beats spawn',
    classifyProvenance(Object.assign({}, base, { openingHp: 1066,
      priorMeetings: [{ day: 73, channel: 'raid', mHpLeft: 1066 }],
      sightings: [{ day: 70, hp: 1066, maxHp: 1066, tx: 4, ty: 4 }] })).cls, 'WOUNDED-IN-CORPUS');
  // SPAWN-HP: opening == floor, pre-meeting sighting hp==maxHp==opening.
  eq('prov spawn-hp',
    classifyProvenance(Object.assign({}, base, { openingHp: 1100,
      priorMeetings: [],
      sightings: [{ day: 70, hp: 1100, maxHp: 1100, tx: 2, ty: 3 }] })).cls, 'SPAWN-HP');
  // SPAWN-VARIANCE: opening < floor, trajectory sighting maxHp==opening.
  eq('prov spawn-variance pre-sighting',
    classifyProvenance(Object.assign({}, base, { openingHp: 825, firstDay: 139,
      priorMeetings: [],
      sightings: [{ day: 133, hp: 825, maxHp: 825, tx: 4, ty: 4 }] })).cls, 'SPAWN-VARIANCE');
  // SPAWN-VARIANCE via post-meeting sighting (maxHp is constant).
  eq('prov spawn-variance post-sighting',
    classifyProvenance(Object.assign({}, base, { openingHp: 825, lastLeft: 785, firstDay: 139,
      priorMeetings: [],
      sightings: [{ day: 140, hp: 785, maxHp: 825, tx: 4, ty: 4 }] })).cls, 'SPAWN-VARIANCE');
  // OFF-CORPUS (a): pre-meeting sighting above opening.
  eq('prov off-corpus wound-between',
    classifyProvenance(Object.assign({}, base, { openingHp: 900, floor: 1100,
      priorMeetings: [],
      sightings: [{ day: 70, hp: 1100, maxHp: 1100, tx: 1, ty: 1 }] })).cls, 'OFF-CORPUS-WOUNDED');
  // OFF-CORPUS (b): earliest sighting already wounded (hp < maxHp == floor).
  eq('prov off-corpus wounded-before-sighting',
    classifyProvenance(Object.assign({}, base, { openingHp: 825, firstDay: 139,
      priorMeetings: [],
      sightings: [{ day: 133, hp: 825, maxHp: 1100, tx: 4, ty: 4 }] })).cls, 'OFF-CORPUS-WOUNDED');
  // AT-FLOOR-OR-ABOVE: opening >= floor, no prior, no census proof.
  eq('prov at-floor unproven',
    classifyProvenance(Object.assign({}, base, { openingHp: 1100,
      priorMeetings: [], sightings: [] })).cls, 'AT-FLOOR-OR-ABOVE');
  // UNDETERMINED: below floor, nothing to prove it — instrument named.
  const und = classifyProvenance(Object.assign({}, base, { openingHp: 825,
    priorMeetings: [], sightings: [] }));
  eq('prov undetermined class', und.cls, 'UNDETERMINED');
  check('prov undetermined names instrument', !!(und.missingInstrument && und.missingInstrument.indexOf('spawn recorder') >= 0));
  // Non-matching prior does NOT make wounded: falls through to census.
  eq('prov non-matching prior falls through',
    classifyProvenance(Object.assign({}, base, { openingHp: 1100,
      priorMeetings: [{ day: 73, channel: 'raid', mHpLeft: 986 }],
      sightings: [{ day: 70, hp: 1100, maxHp: 1100, tx: 2, ty: 3 }] })).cls, 'SPAWN-HP');
}

// --- cross-seed chain separation THROUGH the required chainclose buildChains ---
{
  const chains = buildChains([
    { seed: 75102, day: 55, part: 0, mid: 'eulogy', mHpStart: 900, mHpLeft: 877, mDealt: 23 },
    { seed: 75113, day: 55, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 877, mDealt: 0 },
    { seed: 75102, day: 56, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 853, mDealt: 24 },
  ]);
  eq('cross-seed chains count', chains.length, 2);
  eq('cross-seed s75102 chain n', chains.find(c => c.seed === 75102).meetings.length, 2);
  const split = buildChains([
    { seed: 1, day: 55, part: 0, mid: 'audit', mHpStart: 1100, mHpLeft: 1042, mDealt: 58 },
    { seed: 1, day: 70, part: 0, mid: 'audit', mHpStart: 1100, mHpLeft: 1090, mDealt: 10 },
  ]);
  eq('HP-break splits chain', split.length, 2);
}

// --- censored = survived only ---
{
  eq('censored survived', censoredOf({ endReason: 'survived' }), true);
  eq('censored won is not censored', censoredOf({ endReason: 'over-other' }), false);
  eq('censored lost is not censored', censoredOf({ endReason: 'village-lost' }), false);
}

// --- census streaks: split on gap / hp change, collision flag ---
{
  const cen = { seed: 1, snapshots: [
    { day: 50, monsters: [{ id: 'audit', tx: 1, ty: 1, hp: 825, maxHp: 825 }] },
    { day: 51, monsters: [{ id: 'audit', tx: 2, ty: 1, hp: 825, maxHp: 825 }] },
    { day: 53, monsters: [{ id: 'audit', tx: 2, ty: 2, hp: 825, maxHp: 825 }] },
    { day: 54, monsters: [{ id: 'audit', tx: 2, ty: 2, hp: 785, maxHp: 825 }] },
    { day: 55, monsters: [{ id: 'audit', tx: 1, ty: 1, hp: 785, maxHp: 825 }, { id: 'audit', tx: 3, ty: 3, hp: 785, maxHp: 825 }] },
  ] };
  const { streaks, collisions } = buildStreaks(cen, new Set());
  eq('streak count (gap + hp splits)', streaks.length, 3);
  eq('streak 1 days', streaks[0].days, 2);
  eq('streak 2 firstDay', streaks[1].firstDay, 53);
  eq('streak 3 hp', streaks[2].hp, 785);
  eq('streak collision day', JSON.stringify(collisions.map(c => c.day)), JSON.stringify([55]));
  eq('streak met flag false', streaks[0].met, false);
  const met = buildStreaks(cen, new Set(['audit']));
  eq('streak met flag true', met.streaks[0].met, true);
}

// --- per-type aggregation over individuals, not meetings ---
{
  const table = aggregateByType([
    { mid: 'audit', openingHp: 1100 }, { mid: 'audit', openingHp: 825 },
    { mid: 'audit', openingHp: 1066 }, { mid: 'eulogy', openingHp: 900 },
  ]);
  const a = table.find(t => t.mid === 'audit');
  eq('agg audit n', a.n, 3);
  eq('agg audit min', a.min, 825);
  eq('agg audit max', a.max, 1100);
  eq('agg audit mean', a.mean, 997);
  eq('agg audit variance claim', a.varianceClaim, 'VARIANCE');
  const e = table.find(t => t.mid === 'eulogy');
  eq('agg thin type insufficient', e.varianceClaim, 'INSUFFICIENT-DATA');
  eq('agg thin n still shown', e.n, 1);
}

// --- byte-identity comparator ---
{
  const self = path.join(__dirname, 'analyze-spawnhp-a.js');
  const other = path.join(__dirname, 'analyze-chainclose-a.js');
  eq('filesByteEqual self', filesByteEqual(self, self), true);
  eq('filesByteEqual different', filesByteEqual(self, other), false);
  eq('filesByteEqual missing', filesByteEqual(self, path.join(__dirname, 'no-such-file.js')), false);
}

function determinism(seed) {
  const evidDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-spawnhp-a');
  const scratch = path.join(REPO, 'evidence', '2026-10-30', 'scratch-spawnhp-a-det');
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    execFileSync('node', [path.join(REPO, 'scripts', 'sweep-spawnhp-a.js'), '--one', String(seed)],
      { cwd: REPO, env: Object.assign({}, process.env, { EVID: scratch }), stdio: 'inherit' });
    const rowSame = filesByteEqual(path.join(scratch, `s${seed}-fresh.json`), path.join(evidDir, `s${seed}-fresh.json`));
    const cenSame = filesByteEqual(path.join(scratch, `census-s${seed}.json`), path.join(evidDir, `census-s${seed}.json`));
    console.log(`DETERMINISM seed=${seed} row=${rowSame ? 'IDENTICAL' : 'DIFFERS'} census=${cenSame ? 'IDENTICAL' : 'DIFFERS'}`);
    console.log(rowSame && cenSame ? 'DETERMINISM-PASS' : 'DETERMINISM-FAIL');
    return rowSame && cenSame;
  } catch (e) {
    console.log(`DETERMINISM-ERROR ${String((e && e.message) || e).slice(0, 300)}`);
    console.log('DETERMINISM-FAIL');
    return false;
  } finally {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--determinism') >= 0) {
    const seed = parseInt(args[args.indexOf('--determinism') + 1], 10);
    process.exit(determinism(seed) ? 0 : 1);
  }
  console.log(fails === 0 ? `FIXTURES-PASS (${checks} checks, 0 fails)` : `FIXTURES-FAIL (${fails}/${checks} fails)`);
  process.exit(fails === 0 ? 0 : 1);
}
if (require.main === module) main();
module.exports = { determinism };
