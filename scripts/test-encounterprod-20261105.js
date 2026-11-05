// test-encounterprod-20261105.js — proof for arm sim-encounterprod2-b.
// Fixtures for the census analyzer (every class + sub-cause), the seek
// policy cleanliness leg (no roster reads), a live harness smoke (the
// instrument fires on a real 30d run), determinism (same seed twice,
// in-process path), and instrument neutrality on engine-behavior fields
// (days / endReason / kill-log length with the instrument on vs off).
// Usage: node scripts/test-encounterprod-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'encounterprod-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'encounterprod-instrument-20261105'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0;
function ok(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}
function baseRow(over) {
  return Object.assign({
    seed: 99141, policy: 'baseline', run: 'encounterprod-baseline',
    days: 100, endReason: 'village-lost', villageLost: true, won: false,
    scaleRank: 'village', unlockedWave: 3, maxWave: 3,
    spawns: [], casts: [], fights: [], waveKillLog: [], fallen: [],
    instrumentErrors: [],
  }, over);
}
function snap(day, gated, w2pts) {
  return { day: day, gated: gated, raw: gated, w2pts: w2pts, bar2: 5, dayFloor: 25, t4: 100, rosterSize: 8, living: 8 };
}
function w4spawn(day, onTile) { return { seq: day, day: day, id: 'eulogy', wave: 4, tx: 1, ty: 1, px: 1, py: 1, onPlayerTile: onTile, source: 'checkEncounter', veteran: false }; }
function w4fight(day) { return { day: day, channel: 'player-tb', fighter: null, mid: 'eulogy', wave: 4, cls: 'world', seq: 1, outcome: null }; }

// --- Analyzer fixtures: every class + sub-cause ---
ok('fixture NEVER-UNLOCKED DIED-EARLY', function () {
  const r = AN.analyzeSeed(baseRow({ days: 20, daily: [snap(20, 30, 2)] }));
  assert.strictEqual(r.class, 'NEVER-UNLOCKED'); assert.strictEqual(r.subCause, 'DIED-EARLY'); assert.strictEqual(r.unlockDay, null);
});
ok('fixture NEVER-UNLOCKED LEDGER', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, 120, 3));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily }));
  assert.strictEqual(r.class, 'NEVER-UNLOCKED'); assert.strictEqual(r.subCause, 'LEDGER');
});
ok('fixture NEVER-UNLOCKED STANDING', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, 90, 6));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily }));
  assert.strictEqual(r.class, 'NEVER-UNLOCKED'); assert.strictEqual(r.subCause, 'STANDING');
});
ok('fixture NEVER-UNLOCKED NON-COINCIDENT (rungs met apart, never together)', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, d < 30 ? 110 : 90, d >= 40 ? 6 : 3));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily }));
  assert.strictEqual(r.unlockDay, null); assert.strictEqual(r.class, 'NEVER-UNLOCKED'); assert.strictEqual(r.subCause, 'NON-COINCIDENT');
});
ok('fixture derived-unlock vs finalize mismatch flagged', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, d >= 30 ? 110 : 90, 6));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily, unlockedWave: 3, maxWave: 3 }));
  assert.strictEqual(r.unlockDay, 30); assert.strictEqual(r.class, 'UNLOCKED-UNMET'); assert.strictEqual(r.subCause, 'NO-SPAWN');
  assert.strictEqual(r.unlockMismatch, true);
});
ok('fixture UNLOCKED-UNMET NO-SPAWN', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, d >= 30 ? 110 : 90, 6));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily, unlockedWave: 4, maxWave: 4 }));
  assert.strictEqual(r.class, 'UNLOCKED-UNMET'); assert.strictEqual(r.subCause, 'NO-SPAWN');
});
ok('fixture UNLOCKED-UNMET SPAWN-NO-TILE', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, d >= 30 ? 110 : 90, 6));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily, unlockedWave: 4, maxWave: 4, spawns: [w4spawn(40, false)] }));
  assert.strictEqual(r.class, 'UNLOCKED-UNMET'); assert.strictEqual(r.subCause, 'SPAWN-NO-TILE');
});
ok('fixture UNLOCKED-UNMET TILE-NO-FIGHT', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, d >= 30 ? 110 : 90, 6));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily, unlockedWave: 4, maxWave: 4, spawns: [w4spawn(40, true)] }));
  assert.strictEqual(r.class, 'UNLOCKED-UNMET'); assert.strictEqual(r.subCause, 'TILE-NO-FIGHT');
});
ok('fixture UNLOCKED-FACED', function () {
  const daily = []; for (let d = 1; d <= 60; d++) daily.push(snap(d, d >= 30 ? 110 : 90, 6));
  const r = AN.analyzeSeed(baseRow({ days: 60, daily: daily, unlockedWave: 4, maxWave: 4, spawns: [w4spawn(40, true)], fights: [w4fight(41)] }));
  assert.strictEqual(r.class, 'UNLOCKED-FACED'); assert.strictEqual(r.subCause, null);
});

// --- Seek policy cleanliness: no roster reads ---
ok('seek policy has no roster-read tokens', function () {
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-encseek-b.js'), 'utf8');
  ['worldMonsters', 'villageRoster', 'state.village.roster'].forEach(function (tok) {
    assert.ok(src.indexOf(tok) < 0, 'forbidden token present: ' + tok);
  });
  assert.ok(src.indexOf('monsterAt') >= 0, 'own-tile perception read expected');
});

// --- Seek policy wraps the POLICY object, not the helpers object ---
// (regression: require('./competent') without destructuring wraps the
// helpers export, silently dropping setup/upkeep/fight and never running
// competent.daily — caught by the smoke divergence 28 -> 3 spawns.)
ok('seek policy preserves competent hooks', function () {
  const { competentEncseek } = require(path.join(REPO, 'scripts', 'policies', 'competent-encseek-b'));
  assert.strictEqual(competentEncseek.setup, competent.setup, 'setup dropped');
  assert.strictEqual(competentEncseek.upkeep, competent.upkeep, 'upkeep dropped');
  assert.strictEqual(competentEncseek.fight, competent.fight, 'fight dropped');
  assert.strictEqual(typeof competentEncseek.daily, 'function', 'daily missing');
});

// --- Live legs ---
async function liveRun(seed, days, useInst, policy) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-encounterprod', fullTelemetry: false });
  await setupGame(Game);
  let inst = null;
  if (useInst) inst = INST.install(Game);
  const t = inst ? inst.t : null;
  let lastSnapDay = -1;
  let runCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      runCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = ((Game.state || {}).scholar || {}).day || 0;
          if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { /* snapshot error counted by instrument, not thrown */ }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  if (inst) { try { inst.snapshot(); } catch (e) { /* ignore */ } }
  let fin = null;
  if (inst) { try { fin = inst.finalize(); } catch (e) { fin = null; } }
  if (inst) { try { inst.uninstall(); } catch (e) { /* ignore */ } }
  const st = Game.state || {};
  return {
    days: result.days, endReason: result.endReason,
    killLogLen: ((st.waveKillLog) || []).length,
    snapshots: t ? t.daily.length : 0,
    errors: t ? t.instrumentErrors.length : 0,
    snapHasUnlockFields: t ? t.daily.every(function (s) { return s.w2pts != null && s.gated != null && s.bar2 != null && s.t4 != null; }) : null,
    spawns: t ? t.spawns.length : null,
    seekCalls: runCtx && runCtx.encseek ? runCtx.encseek.calls.length : 0,
  };
}

(async function () {
  try {
    const a = await liveRun(99141, 30, true, competent);
    assert.ok(a.snapshots > 0, 'no snapshots');
    assert.strictEqual(a.errors, 0, 'instrument errors: ' + a.errors);
    assert.strictEqual(a.snapHasUnlockFields, true, 'snapshot missing unlock fields');
    pass++; console.log('PASS live smoke: instrument fires (snapshots=' + a.snapshots + ', spawns=' + a.spawns + ', errors=0)');
    const b = await liveRun(99141, 30, true, competent);
    assert.strictEqual(b.days, a.days); assert.strictEqual(b.endReason, a.endReason);
    assert.strictEqual(b.snapshots, a.snapshots); assert.strictEqual(b.killLogLen, a.killLogLen);
    pass++; console.log('PASS determinism: identical 30d double-run (days=' + a.days + ', end=' + a.endReason + ')');
    const c = await liveRun(99141, 30, false, competent);
    assert.strictEqual(c.days, a.days); assert.strictEqual(c.endReason, a.endReason); assert.strictEqual(c.killLogLen, a.killLogLen);
    pass++; console.log('PASS neutrality: instrument on/off identical on days/endReason/kill-log length');
    const { competentEncseek } = require(path.join(REPO, 'scripts', 'policies', 'competent-encseek-b'));
    const s = await liveRun(99141, 30, true, competentEncseek);
    assert.strictEqual(s.days, 30, 'seek run days');
    assert.strictEqual(s.errors, 0, 'seek run instrument errors');
    assert.ok(s.seekCalls >= 1, 'seek probe never engaged (calls=' + s.seekCalls + ')');
    assert.ok(s.spawns > 0, 'seek run recorded no spawns');
    pass++; console.log('PASS seek engagement: 30d seek run fires (seekCalls=' + s.seekCalls + ', spawns=' + s.spawns + ')');
  } catch (e) {
    console.error('FAIL live leg: ' + (e && e.stack ? e.stack : e));
    process.exitCode = 1;
  }
  console.log('TOTAL PASS ' + pass);
})();
