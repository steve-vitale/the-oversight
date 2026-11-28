// analyze-fleerepair-b.js — field-flee classification analyzer (arm sim-fleerepair-b).
// Pure functions over the fleerepair-field driver corpus
// (evidence/2026-11-28/perseed-fleerepair-b-field/*.json) + a CLI.
// Judged population: expedition-origin wave-4+ fieldFight rows
// (v4encounters, origin 'expedition'). Fought = rounds >= 1; evade =
// rounds 0. Each fought vFlee is classified per the frozen prereg §1:
// branch first (trick-leave / learn / committed-floor are their own
// classes whatever the race), then the live-numbers race for the
// hopeless/floor branches — beaten iff rtk > rtd, winnable iff
// rtk <= rtd, within-one-round iff rtk <= 1, where rtk = mHpLeft /
// (mDealt/rounds) and rtd = vHpLeft / (vTaken/rounds). Classes:
// F1 floor+winnable, F2 hopeless+winnable, F3 hopeless+beaten,
// F4 floor+beaten, F5 learn, F6 trick-leave, F7 committed-floor,
// F8 vDie. SEEK-Suburb walks come from the v4gates rows
// (result 'seek', mid 'suburb'). Wall numbers come from the per-seed
// files (scaleRank/standing/maxWave/won/days; table null — not
// instrumented by this driver, never faked).
// Usage:
//   node scripts/analyze-fleerepair-b.js [--dir <corpus-dir>] [--out <json>] [--selftest]
'use strict';
const fs = require('fs');
const path = require('path');

function raceOf(row) {
  const rounds = row.rounds | 0;
  if (rounds <= 0) return { rtk: null, rtd: null, partyDpr: null, monsterDpr: null, winnable: null, withinOneRound: null };
  const partyDpr = (row.mDealt | 0) / rounds;
  const monsterDpr = (row.vTaken | 0) / rounds;
  const mHpLeft = (row.mHpLeft != null ? row.mHpLeft : null);
  const vHpLeft = (row.vHpLeft != null ? row.vHpLeft : null);
  const rtk = (partyDpr > 0 && mHpLeft != null) ? mHpLeft / partyDpr : (mHpLeft === 0 ? 0 : Infinity);
  const rtd = (monsterDpr > 0 && vHpLeft != null) ? vHpLeft / monsterDpr : (vHpLeft === 0 ? 0 : Infinity);
  return { rtk: rtk, rtd: rtd, partyDpr: partyDpr, monsterDpr: monsterDpr,
    winnable: (rtk != null && rtd != null) ? (rtk <= rtd) : null,
    withinOneRound: (rtk != null) ? (rtk <= 1) : null };
}

function classifyFlee(row) {
  // Branch-first classes; hopeless/floor split by the live race.
  const branch = row.fleeBranch || 'other';
  const outcome = row.outcome || null;
  if (outcome === 'vDie') return 'F8';
  if (outcome === 'vKill' || outcome === 'mFlee') return 'WIN';
  if (outcome !== 'vFlee') return 'OTHER:' + String(outcome);
  if (branch === 'trick-leave') return 'F6';
  if (branch === 'learn') return 'F5';
  if (branch === 'committed-floor') return 'F7';
  const race = raceOf(row);
  if (branch === 'hopeless') return race.winnable ? 'F2' : 'F3';
  if (branch === 'floor') return race.winnable ? 'F1' : 'F4';
  return 'OTHER-BRANCH:' + branch;
}

function analyzeFile(data) {
  const rows = (data.v4encounters || []).filter(function (r) {
    return r && (r.wave | 0) >= 4 && r.origin === 'expedition';
  });
  const fought = rows.filter(function (r) { return (r.rounds | 0) >= 1; });
  const evades = rows.filter(function (r) { return (r.rounds | 0) === 0; });
  const out = { seed: data.seed, days: data.days, endReason: data.endReason,
    scaleRank: data.scaleRank || null, standing: (data.standing != null ? data.standing : null),
    maxWave: data.maxWave || null, won: !!data.won,
    instrumentErrors: (data.instrumentErrors || []).length,
    pool: rows.length, fought: fought.length, evades: evades.length,
    classes: {}, fleeRows: [], evadeRows: [], seekSuburb: 0 };
  for (const r of fought) {
    const cls = classifyFlee(r);
    out.classes[cls] = (out.classes[cls] || 0) + 1;
    const race = raceOf(r);
    out.fleeRows.push({ seed: data.seed, day: r.day, vid: r.vid, mid: r.mid,
      rounds: r.rounds | 0, outcome: r.outcome, branch: r.fleeBranch || null,
      mHpStart: r.mHpStart, mHpLeft: r.mHpLeft, vHpLeft: r.vHpLeft,
      mDealt: r.mDealt, vTaken: r.vTaken, fleeHpFrac: r.fleeHpFrac,
      everWinning: !!r.everWinning, everHopeless: !!r.everHopeless,
      rtk: (race.rtk != null && isFinite(race.rtk)) ? +race.rtk.toFixed(2) : (race.rtk === Infinity ? 'Inf' : null),
      rtd: (race.rtd != null && isFinite(race.rtd)) ? +race.rtd.toFixed(2) : (race.rtd === Infinity ? 'Inf' : null),
      winnable: race.winnable, withinOneRound: race.withinOneRound, cls: cls });
  }
  for (const r of evades) {
    out.evadeRows.push({ seed: data.seed, day: r.day, vid: r.vid, mid: r.mid,
      trickBefore: !!r.trickBefore, alliesN: r.alliesN,
      gate: r.gate ? { result: r.gate.result, reason: r.gate.reason,
        planStage: r.gate.planStage, planTarget: r.gate.planTarget,
        partySize: r.gate.partySize, trickKnown: r.gate.trickKnown } : null });
  }
  for (const g of (data.v4gates || [])) {
    if (g && g.result === 'seek' && g.mid === 'suburb') out.seekSuburb++;
  }
  return out;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  if (!files.length) throw new Error('no per-seed files in ' + dir);
  const perSeed = [];
  let instrumentErrors = 0;
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const a = analyzeFile(data);
    a.file = f;
    instrumentErrors += a.instrumentErrors;
    perSeed.push(a);
  }
  const classes = {};
  let pool = 0, fought = 0, evades = 0, seekSuburb = 0;
  const fleeRows = [], evadeRows = [];
  for (const s of perSeed) {
    pool += s.pool; fought += s.fought; evades += s.evades; seekSuburb += s.seekSuburb;
    for (const k of Object.keys(s.classes)) classes[k] = (classes[k] || 0) + s.classes[k];
    fleeRows.push.apply(fleeRows, s.fleeRows);
    evadeRows.push.apply(evadeRows, s.evadeRows);
  }
  const vFlee = fleeRows.filter(function (r) { return r.outcome === 'vFlee'; }).length;
  const winnableFlees = fleeRows.filter(function (r) { return r.outcome === 'vFlee' && r.winnable === true; });
  const withinOne = fleeRows.filter(function (r) { return r.outcome === 'vFlee' && r.withinOneRound === true; });
  // D1: the dominant shape = the largest winnable-loss class among
  // F1/F2; tie -> the class with more within-one-round fights.
  function classCount(c) { return classes[c] || 0; }
  function classWithinOne(c) { return fleeRows.filter(function (r) { return r.cls === c && r.withinOneRound === true; }).length; }
  let dominant = null;
  if (classCount('F1') > classCount('F2')) dominant = 'F1';
  else if (classCount('F2') > classCount('F1')) dominant = 'F2';
  else if (classCount('F1') + classCount('F2') > 0) {
    dominant = (classWithinOne('F1') >= classWithinOne('F2')) ? 'F1' : 'F2';
  }
  // Wall numbers (reported, never faked; table null — uninstrumented).
  const days = perSeed.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = days.length ? days[Math.floor(days.length / 2)] : null;
  const national = perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length;
  const wave4 = perSeed.filter(function (s) { return (s.maxWave | 0) >= 4; }).length;
  const wave5 = perSeed.filter(function (s) { return (s.maxWave | 0) >= 5; }).length;
  const wins = perSeed.filter(function (s) { return !!s.won; }).length;
  return { verdict: { poolFloorD0: pool >= 10, dominantShapeD1: dominant,
      instrumentErrorsD2: instrumentErrors, calibrationFleeD4: vFlee >= 1 },
    poolDefinition: 'expedition-origin wave-4+ encounters (fought + evade) in v4encounters; departed-joined count is not computed by this analyzer',
    seeds: perSeed.length, pool: pool, fought: fought, evades: evades,
    classes: classes, vFlee: vFlee,
    winnableFlees: winnableFlees.length, withinOneRoundFlees: withinOne.length,
    dominantShape: dominant,
    seekSuburbWalks: seekSuburb,
    instrumentErrors: instrumentErrors,
    wall: { national: national + '/' + perSeed.length, table: null,
      wins: wins + '/' + perSeed.length,
      wave4: wave4 + '/' + perSeed.length, wave5: wave5 + '/' + perSeed.length,
      medianSurvivalDays: medianDays },
    perSeed: perSeed, fleeRows: fleeRows, evadeRows: evadeRows };
}

function selftest() {
  const assert = require('assert');
  // Race math: monster 58 HP left at 92 dpr -> rtk 0.63; lead 23 HP
  // left at 10 dpr taken -> rtd 2.3: winnable, within one round
  // (the partydmg-a telling fight, seed 112103 day 99 shape).
  let r = raceOf({ rounds: 15, mDealt: 1387, vTaken: 150, mHpLeft: 58, vHpLeft: 23 });
  assert.ok(Math.abs(r.rtk - 58 / (1387 / 15)) < 0.01, 'rtk');
  assert.ok(Math.abs(r.rtd - 23 / 10) < 0.01, 'rtd');
  assert.strictEqual(r.winnable, true, 'winnable');
  assert.strictEqual(r.withinOneRound, true, 'within-one-round');
  // Beaten: monster 1000 left at 40 dpr (rtk 25) vs lead 20 left at
  // 10 dpr (rtd 2): not winnable.
  r = raceOf({ rounds: 4, mDealt: 160, vTaken: 40, mHpLeft: 1000, vHpLeft: 20 });
  assert.strictEqual(r.winnable, false, 'beaten');
  assert.strictEqual(r.withinOneRound, false, 'not within one round');
  // Zero party damage: rtk Infinity, not winnable (unless monster
  // already dead, mHpLeft 0 -> rtk 0).
  r = raceOf({ rounds: 2, mDealt: 0, vTaken: 20, mHpLeft: 900, vHpLeft: 50 });
  assert.strictEqual(r.rtk, Infinity, 'rtk inf on zero dpr');
  assert.strictEqual(r.winnable, false, 'zero-dpr not winnable');
  // Branch-first: a trick-leave is F6 whatever the race says.
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'trick-leave', rounds: 1, mDealt: 0, vTaken: 10, mHpLeft: 1400, vHpLeft: 80 }), 'F6', 'trick-leave F6');
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'learn', rounds: 3, mDealt: 100, vTaken: 30, mHpLeft: 900, vHpLeft: 60 }), 'F5', 'learn F5');
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'committed-floor', rounds: 5, mDealt: 500, vTaken: 100, mHpLeft: 200, vHpLeft: 35 }), 'F7', 'committed-floor F7');
  // Floor flee while winnable -> F1; hopeless while winnable -> F2.
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'floor', rounds: 5, mDealt: 400, vTaken: 50, mHpLeft: 40, vHpLeft: 30 }), 'F1', 'floor winnable F1');
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'hopeless', rounds: 5, mDealt: 400, vTaken: 50, mHpLeft: 40, vHpLeft: 30 }), 'F2', 'hopeless winnable F2');
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'hopeless', rounds: 4, mDealt: 160, vTaken: 40, mHpLeft: 1000, vHpLeft: 20 }), 'F3', 'hopeless beaten F3');
  assert.strictEqual(classifyFlee({ outcome: 'vFlee', fleeBranch: 'floor', rounds: 4, mDealt: 160, vTaken: 40, mHpLeft: 1000, vHpLeft: 20 }), 'F4', 'floor beaten F4');
  assert.strictEqual(classifyFlee({ outcome: 'vDie', fleeBranch: null, rounds: 4, mDealt: 77, vTaken: 80, mHpLeft: 1100, vHpLeft: 0 }), 'F8', 'death F8');
  assert.strictEqual(classifyFlee({ outcome: 'vKill', fleeBranch: null, rounds: 11, mDealt: 1075, vTaken: 70, mHpLeft: 0, vHpLeft: 60 }), 'WIN', 'kill WIN');
  // Pool filter: only expedition-origin wave-4+ rows count.
  const a = analyzeFile({ seed: 1, days: 150, endReason: 'done', scaleRank: 'regional',
    standing: 300, maxWave: 4, won: false, instrumentErrors: [],
    v4encounters: [
      { wave: 4, origin: 'expedition', rounds: 5, outcome: 'vFlee', fleeBranch: 'floor', mDealt: 400, vTaken: 50, mHpLeft: 40, vHpLeft: 30, day: 50, vid: 'v1', mid: 'audit', mHpStart: 1000, fleeHpFrac: 0.3, everWinning: false, everHopeless: false },
      { wave: 4, origin: 'world-tick', rounds: 5, outcome: 'vFlee', fleeBranch: 'floor', mDealt: 400, vTaken: 50, mHpLeft: 40, vHpLeft: 30, day: 51, vid: 'v1', mid: 'audit', mHpStart: 1000, fleeHpFrac: 0.3, everWinning: false, everHopeless: false },
      { wave: 3, origin: 'expedition', rounds: 5, outcome: 'vFlee', fleeBranch: 'floor', mDealt: 400, vTaken: 50, mHpLeft: 40, vHpLeft: 30, day: 52, vid: 'v1', mid: 'spool', mHpStart: 300, fleeHpFrac: 0.3, everWinning: false, everHopeless: false },
      { wave: 4, origin: 'expedition', rounds: 0, outcome: 'vFlee', fleeBranch: null, mDealt: 0, vTaken: 0, mHpLeft: 1000, vHpLeft: 100, day: 53, vid: 'v1', mid: 'suburb', mHpStart: 1000, fleeHpFrac: null, everWinning: false, everHopeless: false, trickBefore: true, alliesN: 3, gate: { result: 'avoid', reason: 'outmatched', planStage: 'hunt', planTarget: 'suburb', partySize: 3, trickKnown: true } },
    ],
    v4gates: [{ result: 'seek', mid: 'suburb' }, { result: 'avoid', mid: 'audit' }] });
  assert.strictEqual(a.pool, 2, 'pool counts expedition w4+ only');
  assert.strictEqual(a.fought, 1, 'fought 1');
  assert.strictEqual(a.evades, 1, 'evades 1');
  assert.strictEqual(a.classes.F1, 1, 'F1 counted');
  assert.strictEqual(a.seekSuburb, 1, 'seek-suburb counted');
  console.log('analyze-fleerepair-b selftest: 17 checks PASS');
  return true;
}

if (require.main === module) (function () {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') >= 0) { selftest(); return; }
  const dirIdx = args.indexOf('--dir');
  const outIdx = args.indexOf('--out');
  const repo = path.join(__dirname, '..');
  const dir = dirIdx >= 0 ? args[dirIdx + 1] : path.join(repo, 'evidence', '2026-11-28', 'perseed-fleerepair-b-field');
  const outFile = outIdx >= 0 ? args[outIdx + 1] : path.join(repo, 'evidence', '2026-11-28', 'fleerepair-b-field-analysis.json');
  const res = analyzeDir(dir);
  fs.writeFileSync(outFile, JSON.stringify(res, null, 2) + '\n');
  console.log(JSON.stringify({ seeds: res.seeds, pool: res.pool, fought: res.fought,
    evades: res.evades, classes: res.classes, vFlee: res.vFlee,
    winnableFlees: res.winnableFlees, withinOneRoundFlees: res.withinOneRoundFlees,
    dominantShape: res.dominantShape, seekSuburbWalks: res.seekSuburbWalks,
    instrumentErrors: res.instrumentErrors, wall: res.wall, verdict: res.verdict,
    out: path.relative(repo, outFile) }));
})();

module.exports = { raceOf: raceOf, classifyFlee: classifyFlee, analyzeFile: analyzeFile, analyzeDir: analyzeDir, selftest: selftest };
