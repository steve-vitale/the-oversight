#!/usr/bin/env node
// test-wave3enc-20261031.js — proof for sim-wave3enc-a.
//
// Synthetic checks prove the analyzer's bucket mapping (the prereg's
// binding definition) on hand-built seed objects, including the
// kill-row/kill-event day+type join and the unclassified paths.
// Corpus leg (runs only when the judged corpus dir exists): re-runs
// the analyzer over the real corpus and asserts the prereg's
// completeness gates — split sums, zero recorder errors,
// derived-vs-engine uw agreement, kill-log coverage — so the
// evidence verdict is machine-checked, not hand-copied.
//
// Usage: node scripts/test-wave3enc-20261031.js [--corpus <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { analyzeSeed } = require(path.join(REPO, 'scripts', 'wave3enc-analyze-20261031'));

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}${detail != null ? ' — ' + detail : ''}`); }
  else console.log(`ok: ${name}`);
}
function eq(name, got, want) { check(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }

function baseSeed(over) {
  const s = {
    seed: 99999, anchorCommit: 'test', instrument: 'wave3enc-v1',
    gameDays: 201, endReason: 'survived', endScaleRank: 'national',
    national: 1, table: 0, won: 0, maxWave: 3, engineFinalUw: 3, engineFinalStanding: 150,
    daily: [
      { day: 2, w3rung: false, p2: 0, p3: 0, warPts: 0, faced: {} },
      { day: 30, w3rung: true, p2: 4, p3: 0, warPts: 0, faced: {} },
      { day: 31, w3rung: true, p2: 4, p3: 1, warPts: 1, faced: { spool: 3 } },
    ],
    fieldFights: [], tbFights: [], killEvents: [], spawns: [], sayLines: [],
    killLog: [], recorderErrs: 0, recorderErrors: [], recorderOverflow: {},
    deaths: [], hashes: ['2:x', '30:y', '31:z'],
  };
  return Object.assign(s, over || {});
}
function ff(day, mid, outcome, vid) {
  return { day, mid, wave: 3, outcome, rounds: 3, vHpLeft: 80, mHpLeft: 0, vid: vid || 'v1', caller: 'wild', hasRng: false };
}
function kev(day, mid, delta) {
  return { day, mid, wave: 3, by: 'v1', via: 'wild', delta, ptsBefore: 0, ptsAfter: delta };
}

// 1. Field outcome mapping, one bucket each, sums to meetings.
{
  const s = analyzeSeed(baseSeed({
    fieldFights: [
      ff(40, 'spool', 'evade'), ff(41, 'gavel', 'mFlee'), ff(42, 'spool', 'vFlee'),
      ff(43, 'redactor', 'vDie'), ff(44, 'spool', 'vKill'), ff(45, 'gavel', 'vKill'),
    ],
    killEvents: [kev(44, 'spool', 1), kev(45, 'gavel', 0)],
    killLog: [{ d: 44, mid: 'spool', w: 3 }, { d: 45, mid: 'gavel', w: 3 }],
  }));
  eq('field: meetings', s.meetings, 6);
  eq('field: avoided', s.buckets.avoided, 1);
  eq('field: fledByBeast', s.buckets.fledByBeast, 1);
  eq('field: fledByVillagers', s.buckets.fledByVillagers, 1);
  eq('field: foughtLost', s.buckets.foughtLost, 1);
  eq('field: ledgerPointKill', s.buckets.ledgerPointKill, 1);
  eq('field: foughtWonNoLedger (capped kill)', s.buckets.foughtWonNoLedger, 1);
  eq('field: bucketSum', s.bucketSum, 6);
  eq('field: sumOk', s.sumOk, true);
  eq('field: unclassified', s.unclassifiedCount, 0);
  eq('field: killLedgerPoint', s.killLedgerPoint, 1);
  eq('field: killCapped', s.killCapped, 1);
  eq('field: unmatchedLog', s.unmatchedLogEntries, 0);
}
// 2. TB mapping: won-no-kill -> fledByBeast; won-with-kill -> ledger; lost; fled.
{
  const s = analyzeSeed(baseSeed({
    tbFights: [
      { day: 50, result: 'won', monsterIds: ['spool'], villagerIds: [], scholarIn: true, arena: false },
      { day: 51, result: 'won', monsterIds: ['gavel'], villagerIds: [], scholarIn: true, arena: false },
      { day: 52, result: 'lost', monsterIds: ['redactor'], villagerIds: [], scholarIn: true, arena: false },
      { day: 53, result: 'fled', monsterIds: ['spool'], villagerIds: [], scholarIn: true, arena: false },
      { day: 54, result: 'routed', monsterIds: ['spool'], villagerIds: [], scholarIn: true, arena: false },
    ],
    killEvents: [kev(51, 'gavel', 1)],
    killLog: [{ d: 51, mid: 'gavel', w: 3 }],
  }));
  eq('tb: meetings', s.meetings, 5);
  eq('tb: fledByBeast (won-no-kill)', s.buckets.fledByBeast, 1);
  eq('tb: ledgerPointKill', s.buckets.ledgerPointKill, 1);
  eq('tb: foughtLost', s.buckets.foughtLost, 1);
  eq('tb: fledByVillagers (fled+routed)', s.buckets.fledByVillagers, 2);
  eq('tb: sumOk', s.sumOk, true);
  eq('tb: unclassified', s.unclassifiedCount, 0);
}
// 3. Unclassified paths: kill row with no event; unknown outcome;
//    orphan kill event; unknown TB result. None guessed into buckets.
{
  const s = analyzeSeed(baseSeed({
    fieldFights: [ff(60, 'spool', 'vKill'), ff(61, 'gavel', null), ff(62, 'spool', 'weird')],
    tbFights: [{ day: 63, result: 'calmed', monsterIds: ['spool'], villagerIds: [], scholarIn: true, arena: false }],
    killEvents: [kev(64, 'redactor', 1)],
    killLog: [{ d: 64, mid: 'redactor', w: 3 }],
  }));
  eq('unclass: meetings', s.meetings, 4);
  eq('unclass: bucketSum', s.bucketSum, 0);
  eq('unclass: count (4 fight rows + 1 orphan)', s.unclassifiedCount, 5);
  eq('unclass: fight rows', s.unclassifiedFightRows, 4);
  eq('unclass: sumOk (buckets+unclassFight=meetings)', s.sumOk, true);
  check('unclass: kinds', s.unclassified.map(u => u.kind).join(',') === 'killRowNoEvent,fieldUnknownOutcome,fieldUnknownOutcome,tbUnknownResult,killEventNoFightRow', s.unclassified.map(u => u.kind).join(','));
}
// 4. Zero-meeting seed is a complete table, not a failure.
{
  const s = analyzeSeed(baseSeed({ daily: [{ day: 2, w3rung: false, p2: 0, p3: 0, warPts: 0, faced: {} }] }));
  eq('zero: meetings', s.meetings, 0);
  eq('zero: bucketSum', s.bucketSum, 0);
  eq('zero: firstW3Day', s.firstW3Day, null);
  eq('zero: w3Days', s.w3Days, 0);
  eq('zero: uwCheck (derived false vs engine 3 -> FAIL, honest)', s.uwCheck, 'FAIL');
}
// 5. Daily rung accounting + uw cross-check pass case.
{
  const s = analyzeSeed(baseSeed({}));
  eq('rung: firstW3Day', s.firstW3Day, 30);
  eq('rung: w3Days', s.w3Days, 2);
  eq('rung: endP3', s.endP3, 1);
  eq('rung: endWarPts', s.endWarPts, 1);
  eq('rung: uwCheck', s.uwCheck, 'pass');
}
// 6. Spawn context: spawned-never-fought is type-level, deed-only separated.
{
  const s = analyzeSeed(baseSeed({
    daily: [
      { day: 2, w3rung: false, p2: 0, p3: 0, warPts: 0, faced: {} },
      { day: 30, w3rung: true, p2: 4, p3: 0, warPts: 0, faced: { gavel: 3 } },
    ],
    spawns: [
      { day: 30, mid: 'spool', wave: 3 }, { day: 31, mid: 'gavel', wave: 3 },
      { day: 32, mid: 'buffering', wave: 3 },
    ],
    fieldFights: [ff(33, 'spool', 'evade')],
  }));
  eq('spawn: count', s.spawnsW3, 3);
  check('spawn: unfought types', JSON.stringify(s.unfoughtSpawnTypes) === JSON.stringify(['buffering']), s.unfoughtSpawnTypes.join(','));
  check('spawn: deed-only (gavel faced, no meeting)', JSON.stringify(s.deedOnlyTypes) === JSON.stringify(['gavel']), s.deedOnlyTypes.join(','));
}
// 7. Recorder purity guard: layer off delegates (no wraps installed).
{
  const WE = require(path.join(REPO, 'scripts', 'policies', 'wave3enc-diag'));
  const prev = process.env.WAVE3ENC;
  delete process.env.WAVE3ENC;
  check('purity: layerOn false when unset', WE.layerOn() === false);
  const inner = { id: 'inner', daily() { return 'inner-r'; } };
  const wrapped = WE.withWave3encDiag(inner, 't', 't');
  const fakeGame = {};
  check('purity: daily delegates when off', wrapped.daily(fakeGame, {}) === 'inner-r');
  check('purity: no store rows when off', (wrapped.wave3encStore.daily || []).length === 0);
  if (prev !== undefined) process.env.WAVE3ENC = prev;
}

// Corpus leg (only when the judged corpus exists).
{
  const args = process.argv.slice(2);
  let corpusDir = path.join(REPO, 'evidence', '2026-10-31', 'perseed-wave3enc', 'leadfeast');
  for (let i = 0; i < args.length; i++) if (args[i] === '--corpus') corpusDir = args[++i];
  if (fs.existsSync(corpusDir) && fs.readdirSync(corpusDir).filter(f => /^s\d+\.json$/.test(f)).length > 0) {
    const files = fs.readdirSync(corpusDir).filter(f => /^s\d+\.json$/.test(f));
    let cSeeds = 0;
    for (const f of files) {
      const j = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
      const s = analyzeSeed(j);
      cSeeds++;
      check(`corpus s${s.seed}: sumOk`, s.sumOk === true, `buckets ${s.bucketSum} + unclassFight ${s.unclassifiedFightRows} != meetings ${s.meetings}`);
      check(`corpus s${s.seed}: recorderErrs 0`, s.recorderErrs === 0, `errs=${s.recorderErrs} ${JSON.stringify(s.recorderErrors)}`);
      check(`corpus s${s.seed}: uwCheck pass`, s.uwCheck === 'pass', `derived ${s.derivedGe3} vs engine ${s.engineGe3} (engineUw ${s.engineFinalUw})`);
      check(`corpus s${s.seed}: kill-log covered`, s.unmatchedLogEntries === 0, `unmatched=${s.unmatchedLogEntries}`);
      check(`corpus s${s.seed}: daily sorted`, s.dailySorted === true);
      check(`corpus s${s.seed}: hashes present`, s.hashes > 0);
    }
    console.log(`corpus leg: ${cSeeds} seeds checked`);
  } else {
    console.log('corpus leg: SKIPPED (no judged corpus yet)');
  }
}

console.log(`\n${checks - fails}/${checks} checks passed`);
process.exit(fails ? 1 : 0);
