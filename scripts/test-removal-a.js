#!/usr/bin/env node
// scripts/test-removal-a.js — sim-removal-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-removal-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-removal-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-removal-a.js
//      --one, diffs the row JSON AND the census JSON byte-for-byte
//      against the corpus, prints the verdict, and removes the scratch
//      dir afterwards. Scratch lives under evidence/ (never /tmp) and
//      is removed in a finally block, pass or fail.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifyRemoval, classifyDrop, uidDrops, perIdDrops, stripRemoval } = require('./analyze-removal-a');
const { classifyFight } = require('./analyze-scholarmelt-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

function remRow(o) {
  return Object.assign({
    type: 'removal', seq: 1, day: 100, threw: false,
    monster: { id: 'audit', uid: 7, wave: 4, hp: 785, maxHp: 1100, tx: 4, ty: 4, mx: 4, my: 4,
      stance: null, lostSight: 0, fearTurns: 0, watchTurns: 0, lingering: false, titan: false, veteran: false },
    fledBefore: {}, fledAfter: {},
    tbActive: false, fightMonsterIds: [],
    stack: { frames: [], funcs: [] },
  }, o);
}
function smFight(o) {
  return Object.assign({
    kind: 'start', result: 'lost', lifted: true, bystander: false,
    lift: { id: 'audit', hp: 785, maxHp: 1100, tx: 4, ty: 4, titan: false, lingering: false, veteran: false },
    fightersStart: [{ key: 'm_0', monsterId: 'audit', hp: 785, maxHp: 1100, alive: true, fled: false, veteran: false }],
    fightersEnd: [{ key: 'm_0', monsterId: 'audit', hp: 661, maxHp: 1100, alive: true, fled: false, veteran: false }],
    restoredIdentity: false, restoredEntry: false, restoredHp: null, orphan: false,
    fightSeq: 21, dayStart: 100, dayEnd: 100,
  }, o);
}

// --- removal taxonomy, priority order ---
{
  // Scholar melt cross-ref (startCombat + scholarmelt melt).
  eq('scholar-melt',
    classifyRemoval(remRow({ stack: { frames: ['at Game.startCombat (game.js:1:1)'], funcs: ['startCombat'] }, tbActive: true, fightMonsterIds: ['audit'] }),
      [smFight({})]).cls, 'SCHOLAR-MELT');
  // Scholar kill cross-ref.
  eq('scholar-kill',
    classifyRemoval(remRow({ stack: { frames: [], funcs: ['startCombat'] } }),
      [smFight({ result: 'won', fightersEnd: [{ key: 'm_0', monsterId: 'audit', hp: 0, maxHp: 1100, alive: false, fled: false, veteran: false }] })]).cls, 'SCHOLAR-KILL');
  // Scholar restored cross-ref.
  eq('scholar-restored',
    classifyRemoval(remRow({ stack: { frames: [], funcs: ['startCombat'] } }),
      [smFight({ result: 'fled', lift: { id: 'audit', hp: 785, maxHp: 1100, tx: 4, ty: 4, titan: false, lingering: true, veteran: false },
        restoredIdentity: true, restoredEntry: true, restoredHp: 700 })]).cls, 'SCHOLAR-RESTORED');
  // Scholar lift with no cross-ref fight -> UNCLASSIFIED.
  eq('scholar-lift-unmatched',
    classifyRemoval(remRow({ stack: { frames: [], funcs: ['startCombat'] } }), []).cls, 'UNCLASSIFIED');
  // Lost sight beats fearful (lostSight>6 is its own branch in code).
  eq('lostsight',
    classifyRemoval(remRow({ monster: { id: 'audit', uid: 7, wave: 4, hp: 500, maxHp: 1100, tx: 3, ty: 3, mx: 3, my: 3, stance: 'hungry', lostSight: 7, fearTurns: 0, watchTurns: 0, lingering: false, titan: false, veteran: false },
      stack: { frames: [], funcs: ['monsterTurn'] } })).cls, 'LOSTSIGHT-REMOVE');
  // Fled bolt: fearful at edge + fled entry after.
  eq('fled-bolt',
    classifyRemoval(remRow({ monster: { id: 'audit', uid: 7, wave: 4, hp: 500, maxHp: 1100, tx: 3, ty: 3, mx: 8, my: 4, stance: 'fearful', lostSight: 0, fearTurns: 4, watchTurns: 0, lingering: false, titan: false, veteran: false },
      fledAfter: { '5,4': { id: 'audit', hp: 500, maxHp: 1100 } },
      stack: { frames: [], funcs: ['monsterTurn'] } })).cls, 'FLED-BOLT');
  // Fled gave up: fearful, not at edge, no entry.
  eq('fled-gave-up',
    classifyRemoval(remRow({ monster: { id: 'audit', uid: 7, wave: 4, hp: 500, maxHp: 1100, tx: 3, ty: 3, mx: 4, my: 4, stance: 'fearful', lostSight: 0, fearTurns: 4, watchTurns: 0, lingering: false, titan: false, veteran: false },
      stack: { frames: [], funcs: ['monsterTurn'] } })).cls, 'FLED-GAVE-UP');
  // Glasswing trap vanish.
  eq('glasswing',
    classifyRemoval(remRow({ monster: { id: 'glasswing', uid: 9, wave: 1, hp: 20, maxHp: 20, tx: 3, ty: 3, mx: 3, my: 3, stance: null, lostSight: 0, fearTurns: 0, watchTurns: 0, lingering: false, titan: false, veteran: false },
      stack: { frames: [], funcs: ['monsterTurn'] } })).cls, 'GLASSWING-TRAP-VANISH');
  // Curious fade (nightlight only).
  eq('curious-fade',
    classifyRemoval(remRow({ monster: { id: 'nightlight_catfish', uid: 9, wave: 1, hp: 20, maxHp: 20, tx: 3, ty: 3, mx: 3, my: 3, stance: 'curious', lostSight: 0, fearTurns: 0, watchTurns: 2, lingering: false, titan: false, veteran: false },
      stack: { frames: [], funcs: ['monsterTurn'] } })).cls, 'CURIOUS-FADE');
  // Titan fall cleanup.
  eq('titan-fall',
    classifyRemoval(remRow({ stack: { frames: [], funcs: ['titanVictory'] } })).cls, 'TITAN-FALL-CLEANUP');
  // Villager kill router.
  eq('villager-kill',
    classifyRemoval(remRow({ stack: { frames: [], funcs: ['resolveWildMonsterEncounter'] } })).cls, 'VILLAGER-KILL');
  // Campaign clear via frame path.
  eq('campaign-clear',
    classifyRemoval(remRow({ stack: { frames: ['at clear (finale-campaign.js:1:1)'], funcs: ['clear'] } })).cls, 'CAMPAIGN-CLEAR');
  // Unknown stack -> OTHER-<fn>, never a silent class.
  eq('other-fn',
    classifyRemoval(remRow({ stack: { frames: [], funcs: ['someNewPath'] } })).cls, 'OTHER-someNewPath');
  // Null monster -> NULL-ROW, not a beast removal.
  eq('null-row', classifyRemoval(remRow({ monster: null })).cls, 'NULL-ROW');
  // Non-removal row -> NOT-A-REMOVAL.
  eq('not-a-removal', classifyRemoval({ type: 'spawn' }).cls, 'NOT-A-REMOVAL');
}

// --- drop taxonomy ---
{
  const ctx = { events: [], meetings: [], smFights: [] };
  // Scholar restored wound (lingering, lift==from, restored==to).
  eq('drop-scholar-restored-wound',
    classifyDrop({ mid: 'suburb', uid: 3, uidFrom: 3, uidTo: 3, uidChanged: false, fromDay: 127, toDay: 128, fromHp: 975, toHp: 872, fromTile: '4,4', toTile: '4,4', maxHp: 1300 },
      { events: [], meetings: [],
        smFights: [smFight({ lift: { id: 'suburb', hp: 975, maxHp: 1300, tx: 4, ty: 4, titan: false, lingering: true, veteran: false },
          restoredIdentity: true, restoredEntry: true, restoredHp: 872, dayStart: 127, fightSeq: 9 })] }).cls,
    'DROP-SCHOLAR-RESTORED-WOUND');
  // Entity replacement.
  eq('drop-replacement',
    classifyDrop({ mid: 'suburb', uid: 5, uidFrom: 3, uidTo: 5, uidChanged: true, fromDay: 127, toDay: 128, fromHp: 975, toHp: 872, fromTile: '4,4', toTile: '4,4', maxHp: 1300 }, ctx).cls,
    'DROP-ENTITY-REPLACEMENT');
  // Raid toll shape.
  eq('drop-toll',
    classifyDrop({ mid: 'audit', uid: 3, uidFrom: 3, uidTo: 3, uidChanged: false, fromDay: 10, toDay: 11, fromHp: 1100, toHp: 825, fromTile: '3,3', toTile: '4,4', maxHp: 1100 }, ctx).cls,
    'DROP-RAID-TOLL');
  // Villager fight closing at drop-to.
  eq('drop-villager-fight',
    classifyDrop({ mid: 'audit', uid: 3, uidFrom: 3, uidTo: 3, uidChanged: false, fromDay: 10, toDay: 11, fromHp: 1100, toHp: 1000, fromTile: '4,4', toTile: '4,4', maxHp: 1100 },
      { events: [], meetings: [{ mid: 'audit', day: 10, channel: 'field', outcome: 'vFlee', mHpLeft: 1000 }], smFights: [] }).cls,
    'DROP-VILLAGER-FIGHT');
  // Nothing explains it -> DROP-UNCLASSIFIED with named instrument.
  const unc = classifyDrop({ mid: 'audit', uid: 3, uidFrom: 3, uidTo: 3, uidChanged: false, fromDay: 10, toDay: 11, fromHp: 1100, toHp: 974, fromTile: '4,4', toTile: '4,4', maxHp: 1100 }, ctx);
  eq('drop-unclassified', unc.cls, 'DROP-UNCLASSIFIED');
  check('drop-unclassified names instrument', !!(unc.missingInstrument && unc.missingInstrument.indexOf('hp-mutation') >= 0));
}

// --- uid drops from a synthetic census ---
{
  const census = { seed: 1, snapshots: [
    { day: 10, monsters: [{ uid: 1, id: 'suburb', tx: 4, ty: 4, hp: 975, maxHp: 1300 }] },
    { day: 11, monsters: [{ uid: 1, id: 'suburb', tx: 4, ty: 4, hp: 872, maxHp: 1300 }] },
    { day: 12, monsters: [{ uid: 1, id: 'suburb', tx: 4, ty: 4, hp: 872, maxHp: 1300 }] },
  ] };
  const ds = uidDrops(census);
  eq('uidDrops count', ds.length, 1);
  eq('uidDrops from', ds[0] && ds[0].fromHp, 975);
  eq('uidDrops to', ds[0] && ds[0].toHp, 872);
  const pds = perIdDrops(census);
  eq('perIdDrops count', pds.length, 1);
  eq('perIdDrops uidChanged false', pds[0] && pds[0].uidChanged, false);
  // Replacement: uid changes across the drop.
  const census2 = { seed: 1, snapshots: [
    { day: 10, monsters: [{ uid: 1, id: 'suburb', tx: 4, ty: 4, hp: 975, maxHp: 1300 }] },
    { day: 11, monsters: [{ uid: 2, id: 'suburb', tx: 4, ty: 4, hp: 872, maxHp: 1300 }] },
  ] };
  eq('uidDrops replacement count', uidDrops(census2).length, 0);
  const pd2 = perIdDrops(census2);
  eq('perIdDrops replacement count', pd2.length, 1);
  eq('perIdDrops replacement flag', pd2[0] && pd2[0].uidChanged, true);
}

// --- stripRemoval: row minus removal must round-trip key order ---
{
  const row = { a: 1, removal: { events: [{ type: 'removal' }] }, b: 2 };
  const stripped = stripRemoval(row);
  eq('stripRemoval drops field', stripped.removal, undefined);
  eq('stripRemoval keeps keys', JSON.stringify(Object.keys(stripped)), JSON.stringify(['a', 'b']));
}

// --- scholarmelt cross-ref helper sanity (classifyFight still works) ---
{
  eq('crossref melt sanity', classifyFight(smFight({})).fate, 'SCHOLAR-FLEE-MELT');
}

function determinism(seed) {
  const scratch = path.join(REPO, 'evidence', '2026-10-30', `perseed-removal-a-det-${seed}`);
  const corpusDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-removal-a');
  let pass = false;
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    const env = Object.assign({}, process.env, { EVID: scratch });
    execFileSync('node', [path.join(REPO, 'scripts', 'sweep-removal-a.js'), '--one', String(seed)], { env, stdio: 'pipe', timeout: 600000 });
    const rowSame = fs.readFileSync(path.join(scratch, `s${seed}-fresh.json`)).equals(fs.readFileSync(path.join(corpusDir, `s${seed}-fresh.json`)));
    const cenSame = fs.readFileSync(path.join(scratch, `census-s${seed}.json`)).equals(fs.readFileSync(path.join(corpusDir, `census-s${seed}.json`)));
    console.log(`DETERMINISM seed=${seed} row=${rowSame ? 'IDENTICAL' : 'DIFFERS'} census=${cenSame ? 'IDENTICAL' : 'DIFFERS'}`);
    pass = rowSame && cenSame;
  } catch (e) {
    console.log('DETERMINISM-FAIL', String((e && e.message) || e).slice(0, 300));
    pass = false;
  } finally {
    // NOTE: process.exit() inside try would skip this finally block
    // (the first determinism run left its scratch behind for exactly
    // that reason). Exit only AFTER the finally has run.
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }
  console.log(pass ? 'DETERMINISM-PASS' : 'DETERMINISM-FAIL');
  process.exit(pass ? 0 : 1);
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--determinism') { determinism(parseInt(args[1], 10) || 75102); return; }
  console.log(fails === 0 ? `FIXTURES-PASS ${checks}/${checks}` : `FIXTURES-FAIL ${checks - fails}/${checks} (${fails} failed)`);
  process.exit(fails === 0 ? 0 : 1);
}
if (require.main === module) main();
