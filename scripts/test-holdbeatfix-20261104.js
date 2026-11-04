// test-holdbeatfix-20261104.js — proof tests for arm sim-holdbeatfix-b.
// Stage 1 (pure): pilot analyzer semantics — cost-bar clauses, starvation
// counting, hold-number stripping in trajectory diffs. Stage 2 (live,
// appended with the fix commit): recordWaveKill ordering probe — the log
// entry must already be present when the kill's own unlock check runs —
// across player / wild / companion / pyrrhic / duplicate / _attrKills-off
// paths, with counters/ledger/codex side effects pinned unchanged.
// Usage: node scripts/test-holdbeatfix-20261104.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'holdbeatfix-analyze-20261104'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
function pilot(seed, over) {
  return Object.assign({ seed: seed, days: 100, endReason: 'survived', won: false,
    scaleRank: 'village', maxWave: 4, endUnlockedWave: 4, peakAfterEndCall: 4,
    deathEvents: [], beatEvents: [], killEvents: [], daily: [], gateCalls: [],
    standingLines: [], instrumentErrors: [] }, over || {});
}
function sum(out) { return AN.summarizePilot(out); }

ok('summarizePilot: starvation counted, causes pooled, outcome categories', function () {
  const s = sum(pilot(1, { days: 81, endReason: 'village-lost',
    deathEvents: [{ cause: 'starvation', player: false }, { cause: 'starvation', player: true }, { cause: 'combat', player: false }] }));
  assert.strictEqual(s.starvation, 2);
  assert.strictEqual(s.deathTotal, 3);
  assert.strictEqual(s.outcome, 'lost');
  assert.strictEqual(sum(pilot(2, { endReason: 'survived' })).outcome, 'survived');
  assert.strictEqual(sum(pilot(3, { won: true, endReason: 'survived' })).outcome, 'won');
});

ok('compareLegs: all clauses pass on a clean band', function () {
  const base = [1, 2, 3, 4].map(function (s) { return sum(pilot(s, { days: 100, deathEvents: [{ cause: 'starvation' }] })); });
  const fixed = [1, 2, 3, 4].map(function (s) { return sum(pilot(s, { days: 100, deathEvents: [{ cause: 'starvation' }] })); });
  const cmp = AN.compareLegs(base, fixed, {});
  assert.strictEqual(cmp.clauses.a_totals, true);
  assert.strictEqual(cmp.clauses.b_armOnly, true);
  assert.strictEqual(cmp.clauses.c_median, true);
  assert.strictEqual(cmp.clauses.d_noNewClass, true);
  assert.strictEqual(cmp.clauses.e_noFlip, true);
  assert.strictEqual(cmp.clauses.all, true);
});

ok('compareLegs: each failing clause detected', function () {
  const mk = function (starv, days, end) {
    return sum(pilot(1, { days: days, endReason: end,
      deathEvents: Array.from({ length: starv }, function () { return { cause: 'starvation' }; }) }));
  };
  const base = [mk(0, 100, 'survived')];
  let cmp = AN.compareLegs(base, [mk(3, 100, 'survived')], {});
  assert.strictEqual(cmp.clauses.a_totals, false);
  assert.strictEqual(cmp.clauses.b_armOnly, false);
  cmp = AN.compareLegs(base, [mk(0, 70, 'survived')], {});
  assert.strictEqual(cmp.clauses.c_median, false);
  cmp = AN.compareLegs(base, [sum(pilot(1, { days: 100, endReason: 'survived', deathEvents: [{ cause: 'drowned' }] }))], {});
  assert.strictEqual(cmp.clauses.d_noNewClass, false);
  cmp = AN.compareLegs(base, [mk(0, 100, 'village-lost')], {});
  assert.strictEqual(cmp.clauses.e_noFlip, false);
});

ok('trajectoryDiff: hold-beat numbers ignored, everything else compared', function () {
  const a = pilot(1, { beatEvents: [{ day: 5, kind: 'hold', seq: 9, beatVeterans: 0, momentVeterans: 0, line: 'blood your fighters (0 of 2 veterans)' }],
    standingLines: [{ day: 5, via: 'sysSay', seq: 9, line: 'blood your fighters (0 of 2 veterans)' }],
    killEvents: [{ day: 5, mid: 'eulogy' }], daily: [{ day: 5, peak: 4 }] });
  const b = pilot(1, { beatEvents: [{ day: 5, kind: 'hold', seq: 9, beatVeterans: 1, momentVeterans: 1, line: 'blood your fighters (1 of 2 veterans)' }],
    standingLines: [{ day: 5, via: 'sysSay', seq: 9, line: 'blood your fighters (1 of 2 veterans)' }],
    killEvents: [{ day: 5, mid: 'eulogy' }], daily: [{ day: 5, peak: 4 }] });
  assert.deepStrictEqual(AN.trajectoryDiff(a, b), []);
  const c = pilot(1, { killEvents: [{ day: 5, mid: 'spool' }], daily: [{ day: 5, peak: 4 }] });
  const diffs = AN.trajectoryDiff(a, c);
  assert.ok(diffs.some(function (d) { return d.indexOf('killEvents') === 0; }), 'kill change reported: ' + diffs.join('; '));
});

// --- live harness stage (ordering probe) ---
// The probe wraps checkWaveUnlockBeat AFTER setupGame, so every probe
// call inside a recordWaveKill call below is that kill's own unlock
// check. PASS requires the just-made entry to ALREADY be in
// waveKillLog at probe time. On baseline code this stage FAILS (the
// entry lands after the check) — that red is the bug, not a test bug.
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'holdbeatfix-proof', fullTelemetry: false });
  await setupGame(Game);
  const log = function () { return (Game.state && Game.state.waveKillLog) || []; };
  const probe = [];
  const origCheck = Game.checkWaveUnlockBeat;
  Game.checkWaveUnlockBeat = function () {
    try {
      const entries = log().slice();
      probe.push({ logLen: entries.length, tail: entries.length ? entries[entries.length - 1] : null });
    } catch (e) {}
    return origCheck.apply(this, arguments);
  };
  const m4s = (Game.data.monsters || []).filter(function (m) { return m && (m.wave || 1) === 4; });
  assert.ok(m4s.length >= 1, 'a wave-4 monster def must exist');
  const roster = ((Game.state || {}).village || {}).roster || [];
  const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
  const scholar = Game.villagerId;
  const day = ((Game.state || {}).scholar || {}).day || 0;
  // NOTE (probe calibration, found by stack trace): one recordWaveKill
  // call drives TWO checkWaveUnlockBeat calls — the kill's OWN check
  // inside recordWaveKill (probe[before], the one this fix moves after
  // the log push) and a second check from the progression deed wrapper
  // (recordDeedFight) AFTER recordWaveKill returns, when the log is
  // already pushed either way. Only probe[before] is the deciding
  // observation. The weekly beat cadence (_standingDeferBeat day stamp)
  // is why the artifact survives: the pre-credit first check consumes
  // the week's beat slot, so the post-credit second check stays silent.
  function probeFor(mid, by, via, detail) {
    const before = probe.length;
    Game.recordWaveKill(mid, by, via, detail);
    assert.ok(probe.length > before, 'unlock check ran during recordWaveKill');
    return probe[before];
  }
  function entryMatches(tail, mid, by, via, detail) {
    return !!tail && tail.mid === mid && (tail.by || null) === (by || null)
      && (tail.via || 'unknown') === (via || 'unknown') && (tail.trick || null) === (detail || null);
  }

  // 1. villager field kill: entry present at unlock-check time; side effects pinned.
  const mA = m4s[0].id;
  const wkBefore = ((Game.state.waveKills || {})[4] | 0);
  const vsBefore = ((Game.state.villageSlain || {})[mA] | 0);
  const chBefore = (((Game.state.waveKillByChannel || {})['wild.w4']) | 0);
  const logBefore = log().length;
  const p1 = probeFor(mA, vid, 'wild', 't-fix-wild');
  assert.ok(entryMatches(p1.tail, mA, vid, 'wild', 't-fix-wild'), 'wild kill entry present at unlock check');
  assert.strictEqual(log().length, logBefore + 1, 'wild kill appends exactly one entry');
  assert.strictEqual(((Game.state.waveKills || {})[4] | 0), wkBefore + 1, 'waveKills[4] +1');
  assert.strictEqual(((Game.state.villageSlain || {})[mA] | 0), vsBefore + 1, 'villageSlain +1');
  assert.strictEqual((((Game.state.waveKillByChannel || {})['wild.w4']) | 0), chBefore + 1, 'channel counter +1');
  pass++; console.log('ok ' + pass + ' - live: wild villager kill entry present at unlock check, counters pinned');

  // 2. player kill path.
  const p2 = probeFor(mA, scholar, 'player', 't-fix-player');
  assert.ok(entryMatches(p2.tail, mA, scholar, 'player', 't-fix-player'), 'player kill entry present at unlock check');
  pass++; console.log('ok ' + pass + ' - live: player kill entry present at unlock check');

  // 3. companion kill path.
  const p3 = probeFor(mA, vid, 'companion', 't-fix-comp');
  assert.ok(entryMatches(p3.tail, mA, vid, 'companion', 't-fix-comp'), 'companion kill entry present at unlock check');
  pass++; console.log('ok ' + pass + ' - live: companion kill entry present at unlock check');

  // 4. pyrrhic path: pyrrhic + waveKill log exactly once, no dup.
  const mB = m4s.length > 1 ? m4s[1].id : mA;
  const logBefore4 = log().length;
  Game.recordPyrrhicKill(mB, vid, 'wild', 't-fix-pyrrhic');
  const logAfterPyrrhic = log().length;
  assert.strictEqual(logAfterPyrrhic, logBefore4 + 1, 'pyrrhic kill appends one entry');
  const p4 = probeFor(mB, vid, 'wild', 't-fix-pyrrhic');
  assert.ok(entryMatches(p4.tail, mB, vid, 'wild', 't-fix-pyrrhic'), 'pyrrhic entry present at waveKill unlock check');
  assert.strictEqual(log().length, logBefore4 + 1, 'pyrrhic + waveKill still one entry (dedupe)');
  pass++; console.log('ok ' + pass + ' - live: pyrrhic path logs exactly once, dedupe holds');

  // 5. duplicate call: one entry, counters still count the call (pinned existing behavior).
  const logBefore5 = log().length;
  const wkBefore5 = ((Game.state.waveKills || {})[4] | 0);
  Game.recordWaveKill(mA, vid, 'wild', 't-fix-dup');
  Game.recordWaveKill(mA, vid, 'wild', 't-fix-dup');
  assert.strictEqual(log().length, logBefore5 + 1, 'duplicate call logs once');
  assert.strictEqual(((Game.state.waveKills || {})[4] | 0), wkBefore5 + 2, 'duplicate call still counts twice in waveKills');
  pass++; console.log('ok ' + pass + ' - live: duplicate call deduped in log, counted in counters');

  // 6. _attrKills === false: no entry, unlock check still runs, no crash.
  const logBefore6 = log().length;
  const probeBefore6 = probe.length;
  Game._attrKills = false;
  try {
    Game.recordWaveKill(mA, vid, 'wild', 't-fix-off');
  } finally {
    try { delete Game._attrKills; } catch (e) {}
  }
  assert.strictEqual(log().length, logBefore6, 'attr-off logs nothing');
  assert.ok(probe.length > probeBefore6, 'attr-off still runs the unlock check');
  pass++; console.log('ok ' + pass + ' - live: _attrKills=false logs nothing, check still runs');

  Game.checkWaveUnlockBeat = origCheck;
  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
