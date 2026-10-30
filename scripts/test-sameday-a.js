#!/usr/bin/env node
// scripts/test-sameday-a.js — sim-sameday-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-sameday-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-sameday-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-sameday-a.js
//      --one, diffs the row JSON AND the census JSON byte-for-byte
//      against the corpus, prints the verdict, and removes the scratch
//      dir afterwards. Scratch lives under evidence/ (never /tmp) and
//      is removed in a finally block, pass or fail.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { matchSameday, stampOrder, stripSameday, meetingJoinOk, fightJoinOk } = require('./analyze-sameday-a');
const { buildChains } = require('./analyze-chainclose-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

function fight(o) {
  return Object.assign({
    kind: 'start', result: 'lost', lifted: true,
    lift: { id: 'algorithm', hp: 959, tx: 4, ty: 4, titan: false, lingering: false, veteran: false },
    fightersStart: [{ key: 'm_0', monsterId: 'algorithm', hp: 959, maxHp: 959, alive: true, fled: false, veteran: false }],
    fightersEnd: [{ key: 'm_0', monsterId: 'algorithm', hp: 957, maxHp: 959, alive: true, fled: false, veteran: false }],
    restoredIdentity: false, restoredEntry: false, restoredHp: null, orphan: false,
  }, o);
}
function stamp(seq, dayPart) {
  return { seq, day: 71, dayPart, dayPartName: ['dawn', 'midday', 'dusk', 'night'][dayPart] || null, partCounter: 100 + seq };
}
const CHAIN = { mid: 'algorithm', remainingHp: 959, lastDay: 71 };

// --- new-window match function ---
{
  const f = fight({ dayStart: 72 });
  eq('strict-after match (stamps absent, day order proves it)',
    matchSameday(f, CHAIN, 72, null, null).matched, true);
  eq('strict-after match (stamps present)',
    matchSameday(f, CHAIN, 72, stamp(10, 1), stamp(20, 2)).matched, true);
  const sameProven = fight({ dayStart: 71 });
  eq('same-day ORDER-PROVEN match',
    matchSameday(sameProven, CHAIN, 72, stamp(10, 1), stamp(11, 2)).matched, true);
  eq('same-day same-part seq order match',
    matchSameday(sameProven, CHAIN, 72, stamp(10, 2), stamp(11, 2)).matched, true);
  const miss = matchSameday(sameProven, CHAIN, 72, null, stamp(11, 2));
  eq('same-day missing meeting stamp fails', miss.matched, false);
  eq('same-day missing stamp named', miss.failed[0], 'same-day-stamp-missing');
  const miss2 = matchSameday(sameProven, CHAIN, 72, stamp(10, 1), null);
  eq('same-day missing fight stamp fails', miss2.matched, false);
  const rev = matchSameday(sameProven, CHAIN, 72, stamp(11, 1), stamp(10, 2));
  eq('same-day reversed seq fails', rev.matched, false);
  eq('same-day reversed seq named', rev.failed[0].indexOf('same-day-order-reversed'), 0);
  const partRev = matchSameday(sameProven, CHAIN, 72, stamp(10, 3), stamp(11, 1));
  eq('same-day part reversed fails even when seq order is right', partRev.matched, false);
  eq('same-day part reversed named', partRev.failed[0].indexOf('same-day-part-reversed'), 0);
  eq('hp mismatch fails',
    matchSameday(fight({ dayStart: 71, lift: { id: 'algorithm', hp: 960, tx: 4, ty: 4, titan: false, lingering: false, veteran: false } }), CHAIN, 72, stamp(10, 1), stamp(11, 2)).matched, false);
  eq('not-lifted fails',
    matchSameday(fight({ dayStart: 71, lifted: false }), CHAIN, 72, stamp(10, 1), stamp(11, 2)).matched, false);
  eq('before-last-day fails',
    matchSameday(fight({ dayStart: 70 }), CHAIN, 72, stamp(10, 1), stamp(11, 2)).matched, false);
  eq('out-of-window fails',
    matchSameday(fight({ dayStart: 73 }), CHAIN, 72, stamp(10, 1), stamp(11, 2)).matched, false);
  eq('veteran fighter fails',
    matchSameday(fight({ dayStart: 72, fightersStart: [{ key: 'm_0', monsterId: 'algorithm', hp: 959, maxHp: 959, alive: true, fled: false, veteran: true }] }), CHAIN, 72, null, null).matched, false);
  eq('firstAbsentDay inclusive boundary matches',
    matchSameday(fight({ dayStart: 72 }), CHAIN, 72, null, null).matched, true);
  eq('lastDay inclusive boundary (same-day) matches with stamps',
    matchSameday(sameProven, CHAIN, 72, stamp(10, 0), stamp(11, 0)).matched, true);
}

// --- stampOrder judgment, stated numerically ---
{
  eq('stampOrder proven', stampOrder(stamp(10, 1), stamp(11, 2)).order, 'ORDER-PROVEN');
  eq('stampOrder unproven missing', stampOrder(null, stamp(11, 2)).order, 'ORDER-UNPROVEN');
  eq('stampOrder contradiction seq', stampOrder(stamp(11, 1), stamp(10, 2)).order, 'ORDER-CONTRADICTION');
  eq('stampOrder contradiction part', stampOrder(stamp(10, 3), stamp(11, 1)).order, 'ORDER-CONTRADICTION');
  eq('stampOrder proven same part', stampOrder(stamp(10, 2), stamp(11, 2)).order, 'ORDER-PROVEN');
}

// --- join comparators ---
{
  const dp = { day: 71, vid: 'ursula', mid: 'algorithm', mHpStart: 959 };
  eq('meeting join ok', meetingJoinOk({ day: 71, vid: 'ursula', mid: 'algorithm', mHpStart: 959 }, dp), true);
  eq('meeting join wrong hp', meetingJoinOk({ day: 71, vid: 'ursula', mid: 'algorithm', mHpStart: 971 }, dp), false);
  eq('meeting join wrong day', meetingJoinOk({ day: 70, vid: 'ursula', mid: 'algorithm', mHpStart: 959 }, dp), false);
  const sm = { dayStart: 71, intendedMid: 'algorithm', lift: { id: 'algorithm', hp: 959, tx: 4, ty: 4 } };
  eq('fight join ok', fightJoinOk({ day: 71, intendedMid: 'algorithm', lift: { id: 'algorithm', hp: 959 } }, sm), true);
  eq('fight join wrong lift hp', fightJoinOk({ day: 71, intendedMid: 'algorithm', lift: { id: 'algorithm', hp: 960 } }, sm), false);
  eq('fight join no-lift vs lift', fightJoinOk({ day: 71, intendedMid: 'algorithm', lift: null }, sm), false);
  eq('fight join no-lift vs no-lift', fightJoinOk({ day: 71, intendedMid: 'bulldozer', lift: null }, { dayStart: 71, intendedMid: 'bulldozer', lift: null }), true);
  eq('fight join wrong day', fightJoinOk({ day: 72, intendedMid: 'algorithm', lift: { id: 'algorithm', hp: 959 } }, sm), false);
}

// --- byte-identity comparator (row minus three additive fields) ---
{
  const row = { seed: 75102, days: 86, sameday: { events: [] }, scholarmelt: { meetings: [] }, removal: { events: [] }, fieldparty: { meetings: [] } };
  const stripped = stripSameday(row);
  eq('strip removes sameday', ('sameday' in stripped), false);
  eq('strip removes scholarmelt', ('scholarmelt' in stripped), false);
  eq('strip removes removal', ('removal' in stripped), false);
  eq('strip keeps fieldparty', ('fieldparty' in stripped), true);
  eq('strip keeps seed', stripped.seed, 75102);
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

function fixtures() {
  if (fails) { console.log(`FIXTURES-FAIL ${checks - fails}/${checks} checks passed, ${fails} failed`); return 1; }
  console.log(`FIXTURES-PASS ${checks}/${checks}`);
  return 0;
}

function determinism(seed) {
  const corpusDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-sameday-a');
  const scratch = path.join(REPO, 'evidence', '2026-10-30', `perseed-sameday-a-det-${seed}`);
  let code = 0;
  try {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
    const env = Object.assign({}, process.env, { EVID: scratch });
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-sameday-a.js'), '--one', String(seed)], { env, stdio: 'inherit' });
    const rowSame = fs.readFileSync(path.join(scratch, `s${seed}-fresh.json`)).equals(fs.readFileSync(path.join(corpusDir, `s${seed}-fresh.json`)));
    const cenSame = fs.readFileSync(path.join(scratch, `census-s${seed}.json`)).equals(fs.readFileSync(path.join(corpusDir, `census-s${seed}.json`)));
    console.log(`DETERMINISM seed=${seed} row=${rowSame ? 'IDENTICAL' : 'DIFFERS'} census=${cenSame ? 'IDENTICAL' : 'DIFFERS'}`);
    if (!rowSame || !cenSame) { console.log('DETERMINISM-FAIL'); code = 1; }
    else console.log('DETERMINISM-PASS');
  } catch (e) {
    console.log('DETERMINISM-FAIL', String((e && e.message) || e).slice(0, 300));
    code = 1;
  } finally {
    // NOTE (from removal): process.exit() inside try skips this
    // finally block. Exit only AFTER the finally has run.
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
    try { console.log(`scratch-removed=${!fs.existsSync(scratch)}`); } catch (e) {}
  }
  return code;
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--determinism') { process.exitCode = determinism(parseInt(args[1], 10) || 75102); return; }
  process.exitCode = fixtures();
}
if (require.main === module) main();
module.exports = { fixtures, determinism };
