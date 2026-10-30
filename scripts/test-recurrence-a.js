#!/usr/bin/env node
// scripts/test-recurrence-a.js — sim-recurrence-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-recurrence-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-recurrence-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-recurrence-a.js
//      --one, diffs the row JSON AND the census JSON byte-for-byte
//      against the corpus, prints the verdict, and removes the scratch
//      dir afterwards. Scratch lives under evidence/ (never /tmp) and
//      is removed in a finally block, pass or fail.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifyFate, censusMatch, opportunity, cheb, tileKey, filesByteEqual } =
  require('./analyze-recurrence-a');
const { buildChains } = require('./analyze-chainclose-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

// --- cross-seed chain separation THROUGH the required chainclose buildChains ---
{
  const chains = buildChains([
    { seed: 75102, day: 55, part: 0, mid: 'eulogy', mHpStart: 900, mHpLeft: 877, mDealt: 23 },
    { seed: 75113, day: 55, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 877, mDealt: 0 },
    { seed: 75102, day: 56, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 853, mDealt: 24 },
  ]);
  eq('cross-seed chains count', chains.length, 2);
  eq('cross-seed s75102 chain n', chains.find(c => c.seed === 75102).meetings.length, 2);
  eq('cross-seed s75113 chain n', chains.find(c => c.seed === 75113).meetings.length, 1);
  const split = buildChains([
    { seed: 1, day: 55, part: 0, mid: 'audit', mHpStart: 1100, mHpLeft: 1042, mDealt: 58 },
    { seed: 1, day: 70, part: 0, mid: 'audit', mHpStart: 1100, mHpLeft: 1090, mDealt: 10 },
  ]);
  eq('HP-break splits chain', split.length, 2);
}

// --- censusMatch ---
{
  const cen = { seed: 1, snapshots: [
    { day: 55, monsters: [{ id: 'eulogy', tx: 4, ty: 3, hp: 853 }] },
    { day: 56, monsters: [{ id: 'eulogy', tx: 5, ty: 3, hp: 853 }] },
    { day: 57, monsters: [] },
    { day: 58, monsters: [] },
  ] };
  const m = censusMatch(cen, 'eulogy', 853, 55);
  eq('census lastSeen', m.lastSeen, 56);
  eq('census finalDay', m.finalDay, 58);
  eq('census vanished', m.vanished, true);
  eq('census presentAtEnd', m.presentAtEnd, false);
  eq('census censusDays', m.censusDays, 1);
  const still = censusMatch({ seed: 1, snapshots: [
    { day: 56, monsters: [{ id: 'eulogy', tx: 5, ty: 3, hp: 853 }] },
    { day: 57, monsters: [{ id: 'eulogy', tx: 5, ty: 4, hp: 853 }] },
  ] }, 'eulogy', 853, 55);
  eq('census still vanished false', still.vanished, false);
  eq('census still presentAtEnd', still.presentAtEnd, true);
  eq('census still lastSeen', still.lastSeen, 57);
  const coll = censusMatch({ seed: 1, snapshots: [
    { day: 56, monsters: [{ id: 'audit', tx: 1, ty: 1, hp: 900 }, { id: 'audit', tx: 2, ty: 2, hp: 900 }] },
  ] }, 'audit', 900, 55);
  eq('census collision day', JSON.stringify(coll.collisions), JSON.stringify([56]));
  const goneByFirst = censusMatch({ seed: 1, snapshots: [
    { day: 56, monsters: [] }, { day: 57, monsters: [] },
  ] }, 'audit', 900, 55);
  eq('census gone-by-first lastSeen', goneByFirst.lastSeen, null);
  eq('census gone-by-first vanished', goneByFirst.vanished, true);
  const meetAfterCensus = censusMatch({ seed: 1, snapshots: [
    { day: 50, monsters: [] },
  ] }, 'audit', 900, 55);
  eq('census meeting-after-last-snapshot presentAtEnd', meetAfterCensus.presentAtEnd, true);
  eq('census meeting-after-last-snapshot vanished', meetAfterCensus.vanished, false);
  eq('census unsorted bad', censusMatch({ seed: 1, snapshots: [{ day: 57, monsters: [] }, { day: 56, monsters: [] }] }, 'audit', 900, 55).bad, true);
  eq('census nonfinite bad', censusMatch({ seed: 1, snapshots: [{ day: null, monsters: [] }] }, 'audit', 900, 55).bad, true);
  eq('census missing bad', censusMatch(null, 'audit', 900, 55).bad, true);
}

// --- fate decision tree, priority order ---
{
  const row = (days, end) => ({ days, endReason: end });
  const cmVan = { bad: false, vanished: true, lastSeen: 60, finalDay: 86, presentAtEnd: false, postCount: 5, collisions: [] };
  const cmPres = { bad: false, vanished: false, lastSeen: 86, finalDay: 86, presentAtEnd: true, postCount: 5, collisions: [] };
  const cmNone = { bad: false, vanished: false, lastSeen: null, finalDay: 86, presentAtEnd: false, postCount: 0, collisions: [] };
  const cmBad = { bad: true, reason: 'x' };
  eq('fate FINISHED beats VANISHED',
    classifyFate({ n: 1, lastDay: 55, remainingHp: 0 }, row(86, 'village-lost'), cmVan, { fieldDaysInWindow: 3 }).fate, 'FINISHED');
  eq('fate VANISHED beats VILLAGE-GONE',
    classifyFate({ n: 1, lastDay: 83, remainingHp: 853 }, row(86, 'village-lost'), cmVan, { fieldDaysInWindow: 0 }).fate, 'BEAST-VANISHED');
  eq('fate VILLAGE-GONE short window',
    classifyFate({ n: 1, lastDay: 83, remainingHp: 853 }, row(86, 'village-lost'), cmPres, { fieldDaysInWindow: 2 }).fate, 'VILLAGE-GONE');
  eq('fate VILLAGE-GONE boundary 7',
    classifyFate({ n: 1, lastDay: 79, remainingHp: 853 }, row(86, 'village-lost'), cmPres, { fieldDaysInWindow: 2 }).fate, 'VILLAGE-GONE');
  eq('fate STILL-PRESENT survived beats NEVER-CROSSED',
    classifyFate({ n: 1, lastDay: 100, remainingHp: 853 }, row(180, 'survived'), cmPres, { fieldDaysInWindow: 9 }).fate, 'STILL-PRESENT-AT-HORIZON');
  eq('fate NEVER-CROSSED long window present activity',
    classifyFate({ n: 1, lastDay: 55, remainingHp: 853 }, row(86, 'village-lost'), cmPres, { fieldDaysInWindow: 4 }).fate, 'NEVER-CROSSED');
  eq('fate VILLAGE-NEVER-OUT present no activity',
    classifyFate({ n: 1, lastDay: 55, remainingHp: 853 }, row(86, 'village-lost'), cmPres, { fieldDaysInWindow: 0 }).fate, 'VILLAGE-NEVER-OUT');
  eq('fate UNCLASSIFIED no post snaps long window',
    classifyFate({ n: 1, lastDay: 55, remainingHp: 853 }, row(86, 'village-lost'), cmNone, { fieldDaysInWindow: 4 }).fate, 'UNCLASSIFIED');
  eq('fate UNCLASSIFIED bad census',
    classifyFate({ n: 1, lastDay: 55, remainingHp: 853 }, row(86, 'village-lost'), cmBad, { fieldDaysInWindow: 4 }).fate, 'UNCLASSIFIED');
}

// --- opportunity arithmetic ---
{
  const chain = { lastDay: 55, mid: 'eulogy', beastLastTile: { tx: 4, ty: 3 }, windowDays: 31 };
  const fp = [
    { day: 56, channel: 'field', mid: 'bulldozer', mTile: { tx: 4, ty: 3 } },
    { day: 56, channel: 'raid', mid: 'eulogy', mTile: { tx: 4, ty: 3 } },
    { day: 57, channel: 'field', mid: 'deer', mTile: { tx: 5, ty: 4 } },
    { day: 60, channel: 'field', mid: 'deer', mTile: { tx: 8, ty: 8 } },
    { day: 61, channel: 'field', mid: 'eulogy', mTile: { tx: 4, ty: 3 } },
    { day: 62, channel: 'other', mid: 'eulogy', mTile: null },
    { day: 63, channel: 'field', mid: 'eulogy', mTile: { tx: 0, ty: 0 } },
  ];
  // Note: the day-61/63 field eulogy rows are TYPE reappearances only if
  // they are separate meetings; opportunity counts them as reappeared
  // regardless of channel (field meetings with fresh HP would be new
  // chains, not this chain's meetings — the fixture models that).
  const o = opportunity(chain, fp);
  eq('opp fieldDays', o.fieldDaysInWindow, 5);
  eq('opp fieldMeetings', o.fieldMeetingsInWindow, 5);
  eq('opp distinctTiles', o.distinctTilesVisited, 4);
  eq('opp revisits', o.tileRevisits, 2);
  eq('opp adjacent', o.adjacentTileVisits, 1);
  eq('opp reappearedN', o.typeReappearedN, 4);
  eq('opp killedLater', o.typeKilledLater, 0);
  const o2 = opportunity(chain, [
    { day: 70, channel: 'raid', mid: 'eulogy', mTile: { tx: 1, ty: 1 }, mHpStart: 1100, mHpLeft: 0, outcome: 'vKill' },
  ]);
  eq('opp killedLater counts zero-HP reappearance', o2.typeKilledLater, 1);
  eq('cheb diagonal 1', cheb({ tx: 4, ty: 3 }, { tx: 5, ty: 4 }), 1);
  eq('cheb far', cheb({ tx: 4, ty: 3 }, { tx: 8, ty: 8 }), 5);
  eq('cheb null tile', cheb(null, { tx: 1, ty: 1 }), null);
  eq('tileKey', tileKey({ tx: 4, ty: 3 }), '4,3');
  eq('tileKey null', tileKey(null), null);
}

// --- byte-identity comparator (used by substrate + determinism legs) ---
{
  const self = path.join(__dirname, 'analyze-recurrence-a.js');
  const other = path.join(__dirname, 'analyze-chainclose-a.js');
  eq('filesByteEqual self', filesByteEqual(self, self), true);
  eq('filesByteEqual different', filesByteEqual(self, other), false);
  eq('filesByteEqual missing', filesByteEqual(self, path.join(__dirname, 'no-such-file.js')), false);
}

function determinism(seed) {
  const evidDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-recurrence-a');
  const scratch = path.join(REPO, 'evidence', '2026-10-30', 'scratch-recurrence-a-det');
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    execFileSync('node', [path.join(REPO, 'scripts', 'sweep-recurrence-a.js'), '--one', String(seed)],
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
