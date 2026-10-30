#!/usr/bin/env node
// scripts/test-scholarmelt-a.js — sim-scholarmelt-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-scholarmelt-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-scholarmelt-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-scholarmelt-a.js
//      --one, diffs the row JSON AND the census JSON byte-for-byte
//      against the corpus, prints the verdict, and removes the scratch
//      dir afterwards. Scratch lives under evidence/ (never /tmp) and
//      is removed in a finally block, pass or fail.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifyFight, matchCandidate, stripScholarmelt } = require('./analyze-scholarmelt-a');
const { buildChains } = require('./analyze-chainclose-a');
const { censusMatch, classifyFate } = require('./analyze-recurrence-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

function fight(o) {
  return Object.assign({
    kind: 'start', result: null, lifted: null, lift: null, bystander: false,
    fightersStart: [], fightersEnd: [], restoredIdentity: null,
    restoredEntry: null, restoredHp: null, orphan: false,
  }, o);
}
function mon(monsterId, hp, alive, veteran) {
  return { key: 'm_0', monsterId, hp, maxHp: hp, alive, fled: false, veteran: !!veteran };
}
function lift(id, hp, extra) {
  return Object.assign({ id, hp, maxHp: hp, tx: 4, ty: 4, titan: false, lingering: false, veteran: false, spawnSeq: null }, extra || {});
}

// --- fate decision tree, priority order ---
{
  eq('kill won', classifyFight(fight({ result: 'won', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 0, false)] })).fate, 'SCHOLAR-KILL');
  eq('kill pyrrhic lost', classifyFight(fight({ result: 'lost', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 0, false)] })).sub, 'pyrrhic');
  eq('kill beats melt (dead fighter + absent)',
    classifyFight(fight({ result: 'won', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 0, false)], restoredIdentity: false, restoredEntry: false })).fate, 'SCHOLAR-KILL');
  eq('flee-melt fled', classifyFight(fight({ result: 'fled', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 900, true)], restoredIdentity: false, restoredEntry: false })).fate, 'SCHOLAR-FLEE-MELT');
  eq('flee-melt lost alive', classifyFight(fight({ result: 'lost', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 900, true)], restoredIdentity: false, restoredEntry: false })).fate, 'SCHOLAR-FLEE-MELT');
  eq('restored identity', classifyFight(fight({ result: 'fled', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 900, true)], restoredIdentity: true, restoredEntry: true, restoredHp: 900 })).fate, 'SCHOLAR-RESTORED');
  eq('restored entry-only', classifyFight(fight({ result: 'lost', lifted: true, lift: lift('audit', 1042), fightersEnd: [mon('audit', 900, true)], restoredIdentity: false, restoredEntry: true, restoredHp: 900 })).fate, 'SCHOLAR-RESTORED');
  eq('spawn-ended', classifyFight(fight({ result: 'fled', lifted: false, lift: null, fightersEnd: [mon('audit', 900, true)] })).fate, 'SPAWN-ENDED');
  eq('bystander-stays', classifyFight(fight({ result: 'won', lifted: false, lift: lift('audit', 1042), bystander: true, fightersEnd: [mon('bulldozer', 50, true)] })).fate, 'BYSTANDER-OR-NONMONSTER');
  eq('nonmonster', classifyFight(fight({ result: 'won', lifted: false, lift: null, fightersEnd: [] })).fate, 'BYSTANDER-OR-NONMONSTER');
  eq('unended', classifyFight(fight({ result: null, lifted: true, lift: lift('audit', 1042), fightersEnd: [] })).fate, 'UNENDED');
  eq('dissolved-melt', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: true, lift: lift('audit', 1042), fightersEnd: [], restoredIdentity: false, restoredEntry: false })).fate, 'DISSOLVED-MELT');
  eq('dissolved-restored', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: true, lift: lift('audit', 1042), fightersEnd: [], restoredIdentity: true })).fate, 'SCHOLAR-RESTORED');
  eq('dissolved-spawned', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: false, lift: null, fightersEnd: [] })).fate, 'SPAWN-ENDED');
  eq('dissolved-bystander', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: false, lift: lift('audit', 1042), bystander: true, fightersEnd: [] })).fate, 'BYSTANDER-OR-NONMONSTER');
  // CORRECTION #2: restored-first for dissolved rows (alias adoption
  // can restore without tbEnd), and never-lifted dissolved rows.
  eq('dissolved-restored-beats-lifted-null', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: null, lift: lift('herald', 700), fightersEnd: [], restoredIdentity: true, restoredEntry: true })).fate, 'SCHOLAR-RESTORED');
  eq('dissolved-restored-entry-only', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: true, lift: lift('herald', 700), fightersEnd: [], restoredIdentity: false, restoredEntry: true })).fate, 'SCHOLAR-RESTORED');
  eq('dissolved-never-lifted', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: false, lift: lift('herald', 700), fightersEnd: [], restoredIdentity: false, restoredEntry: false })).fate, 'BYSTANDER-OR-NONMONSTER');
  eq('dissolved-never-lifted sub', classifyFight(fight({ result: 'dissolved-no-tbend', lifted: false, lift: lift('herald', 700), fightersEnd: [], restoredIdentity: false, restoredEntry: false })).sub, 'dissolved-never-lifted');
  eq('orphan-unreadable', classifyFight(fight({ kind: 'orphan-end', result: 'won', orphan: true, fightersEnd: [] })).fate, 'UNCLASSIFIED');
  eq('orphan-kill', classifyFight(fight({ kind: 'orphan-end', result: 'won', orphan: true, fightersEnd: [mon('audit', 0, false)] })).fate, 'SCHOLAR-KILL');
  eq('orphan-alive subflag', classifyFight(fight({ kind: 'orphan-end', result: 'fled', orphan: true, fightersEnd: [mon('audit', 900, true)] })).sub, 'orphan-lift-unknown');
  eq('refused excluded', classifyFight(fight({ kind: 'refused', result: null })).fate, 'EXCLUDED-REFUSED');
}

// --- cross-seed chain separation THROUGH the required chainclose buildChains ---
{
  const chains = buildChains([
    { seed: 75102, day: 55, part: 0, mid: 'eulogy', mHpStart: 900, mHpLeft: 877, mDealt: 23 },
    { seed: 75116, day: 55, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 877, mDealt: 0 },
    { seed: 75102, day: 56, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 853, mDealt: 24 },
  ]);
  eq('cross-seed chains count', chains.length, 2);
  eq('cross-seed s75102 chain n', chains.find(c => c.seed === 75102).meetings.length, 2);
  eq('cross-seed s75116 chain n', chains.find(c => c.seed === 75116).meetings.length, 1);
}

// --- censored flag = horizon-survived ONLY (through required recurrence classifyFate) ---
{
  const cmPres = { bad: false, vanished: false, lastSeen: 86, finalDay: 86, presentAtEnd: true, postCount: 5, collisions: [] };
  const chain = { n: 1, lastDay: 100, remainingHp: 853 };
  eq('censored survived is STILL-PRESENT',
    classifyFate(chain, { days: 180, endReason: 'survived' }, cmPres, { fieldDaysInWindow: 9 }).fate, 'STILL-PRESENT-AT-HORIZON');
  eq('censored won over-other is NOT STILL-PRESENT',
    classifyFate(chain, { days: 180, endReason: 'over-other' }, cmPres, { fieldDaysInWindow: 9 }).fate, 'NEVER-CROSSED');
  eq('censored village-lost is NOT STILL-PRESENT',
    classifyFate(chain, { days: 180, endReason: 'village-lost' }, cmPres, { fieldDaysInWindow: 9 }).fate, 'NEVER-CROSSED');
}

// --- censusMatch wiring (through required recurrence censusMatch) ---
{
  const cen = { seed: 1, snapshots: [
    { day: 71, monsters: [{ id: 'algorithm', tx: 4, ty: 3, hp: 959 }] },
    { day: 72, monsters: [] },
  ] };
  const m = censusMatch(cen, 'algorithm', 959, 71);
  eq('census vanished after lastSeen', m.vanished, true);
  // post snapshots are day > lastDay only, so the day-71 sighting is
  // NOT lastSeen: the instance is gone by the first post snapshot.
  eq('census lastSeen null when gone by first post snapshot', m.lastSeen, null);
}

// --- chain matching: hp-exact, window bounds, same-day near-miss, veteran, out-of-window ---
{
  const chain = { mid: 'audit', remainingHp: 785, lastDay: 139 };
  const base = { lifted: true, lift: lift('audit', 785), dayStart: 140, fightersStart: [mon('audit', 785, true)] };
  eq('match exact', matchCandidate(fight(base), chain, 140).matched, true);
  eq('match hp mismatch', matchCandidate(fight(Object.assign({}, base, { lift: lift('audit', 800) })), chain, 140).matched, false);
  eq('match hp mismatch named', matchCandidate(fight(Object.assign({}, base, { lift: lift('audit', 800) })), chain, 140).failed[0].indexOf('hp-mismatch'), 0);
  eq('match same-day fails', matchCandidate(fight(Object.assign({}, base, { dayStart: 139 })), chain, 140).matched, false);
  eq('match same-day named', matchCandidate(fight(Object.assign({}, base, { dayStart: 139 })), chain, 140).failed.some(f => f.indexOf('same-day') === 0), true);
  eq('match out-of-window fails', matchCandidate(fight(Object.assign({}, base, { dayStart: 141 })), chain, 140).matched, false);
  eq('match not-lifted fails', matchCandidate(fight(Object.assign({}, base, { lifted: false })), chain, 140).matched, false);
  eq('match veteran fails', matchCandidate(fight(Object.assign({}, base, { fightersStart: [mon('audit', 1200, true, true)] })), chain, 140).matched, false);
  eq('match no-firstAbsentDay open window', matchCandidate(fight(base), chain, null).matched, true);
}

// --- byte-identity comparator: stripScholarmelt ---
{
  const row = { policy: 'fresh-base', seed: 75102, days: 86, joinendlines: { meetings: [] },
    scholarmelt: { meetings: [{ fightSeq: 1 }], diag: { errs: 0 } } };
  const stripped = stripScholarmelt(row);
  eq('strip removes scholarmelt', ('scholarmelt' in stripped), false);
  eq('strip keeps other fields', stripped.days, 86);
  eq('strip re-stringify stable', JSON.stringify(stripScholarmelt(JSON.parse(JSON.stringify(row))), null, 1),
    JSON.stringify({ policy: 'fresh-base', seed: 75102, days: 86, joinendlines: { meetings: [] } }, null, 1));
  eq('strip does not mutate input', ('scholarmelt' in row), true);
}

function determinism(seed) {
  const evidDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-scholarmelt-a');
  const scratch = path.join(REPO, 'evidence', '2026-10-30', 'scratch-scholarmelt-a-det');
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    execFileSync('node', [path.join(REPO, 'scripts', 'sweep-scholarmelt-a.js'), '--one', String(seed)],
      { cwd: REPO, env: Object.assign({}, process.env, { EVID: scratch }), stdio: 'inherit' });
    const rowSame = fs.readFileSync(path.join(scratch, `s${seed}-fresh.json`)).equals(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`)));
    const cenSame = fs.readFileSync(path.join(scratch, `census-s${seed}.json`)).equals(fs.readFileSync(path.join(evidDir, `census-s${seed}.json`)));
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
