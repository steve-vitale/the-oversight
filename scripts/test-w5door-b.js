#!/usr/bin/env node
// test-w5door-b.js — proof gates for the sim-w5door-b DIAG (flesh-out loop
// arm sim-w5door-b, axis scale-onramp, run fleshout-20261023T0515Z).
// Namespace w5door-b. Instrument-side, zero src/js.
//
// Gates (GREEN before the sweep):
//   E1 determinism: instrument-on vs instrument-off byte-identical
//      day-hash sequences, 40d, one pilot seed (s65511, control substrate).
//   E2 env-gate: diag-w5door-b.js exits 2 when the pinned substrate env is
//      wrong (FEASTSCALE_R13 unset; ARMORYDRIVE set on ARM=control).
//   E3 RED->GREEN: the analyzer's pure functions (classifyRun, census) on
//      synthetic per-seed fixtures — one live-demand unlock (0 unexplained,
//      releaseMix live-demand) + one locked run (binding gate named).
//   E4 anchor: diag-w5door-b's ANCHOR equals `git rev-parse HEAD` of the
//      repo — the #793 check, enforced at module load.
//   E5 seed-freshness: pilot seeds 65511-65518 have 0 filename hits in
//      evidence/ + scripts/ (the brief's stated criterion).
'use strict';
const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

const PASS = [], FAIL = [];
function ok(name, cond, extra) {
  if (cond) { PASS.push(name); console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { FAIL.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

const PINNED = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1' };

// --- E2: env gates (spawn the sweep with broken env; expect exit 2) -------
(async () => {
  function spawnSweep(mut) {
    const env = Object.assign({}, process.env, PINNED);
    if (mut) mut(env);
    return spawnSync(process.execPath, [path.join(REPO, 'scripts', 'diag-w5door-b.js')],
      { env, timeout: 60000, encoding: 'utf8' });
  }
  let r = spawnSweep(e => { delete e.FEASTSCALE_R13; });
  ok('E2a wrong env (FEASTSCALE_R13 unset) exits 2', r.status === 2, `status=${r.status}`);
  r = spawnSweep(e => { e.ARM = 'control'; e.ARMORYDRIVE = '1'; });
  ok('E2b ARM=control with ARMORYDRIVE set exits 2', r.status === 2, `status=${r.status}`);
  r = spawnSweep(e => { e.ARM = 'armorydrive'; delete e.ARMORYDRIVE; });
  ok('E2c ARM=armorydrive without ARMORYDRIVE=1 exits 2', r.status === 2, `status=${r.status}`);
  r = spawnSweep(e => { e.ARM = 'control'; e.SEEDS = '65511'; e.DAYS = '1'; e.EVID = '/tmp/w5door-b-e2'; });
  // Correct env must pass the guard (it then starts running; the guard
  // passing is what matters). status !== 2 proves the guard passed.
  ok('E2d correct env passes the guard (no exit 2)', r.status !== 2, `status=${r.status}`);
})();

// --- E3: analyzer pure functions on synthetic fixtures (RED->GREEN) --------
function fixtureUnlockLiveDemand() {
  // Synthetic window trace: wave-4 door opens live-demand d60, wave-5
  // live-demand d70 (standing releases the same day the bars are met).
  // All 6 gates met per w5gates-lib vector. Engine-coherent: w4Day >=
  // peakRecord4Day (deferral), w5Day == peakRecord5Day.
  const window = [];
  for (let d = 1; d <= 80; d++) {
    const r4r = d >= 60, r5r = d >= 70;
    window.push({
      day: d, uw: d >= 70 ? 5 : (d >= 60 ? 4 : 3),
      raw: d >= 65 ? 210 : (d >= 55 ? 120 : 80),
      capped: d >= 70 ? 200 : (d >= 60 ? 120 : 80),
      r4: { armored: r4r ? 3 : 2, armed: r4r ? 5 : 4, tricks: 3, veterans: 1, ready: r4r },
      r5: { armored: r5r ? 4 : 2, armed: r5r ? 6 : 4, tricks: 3, veterans: r5r ? 2 : 1, ready: r5r },
      w4faced: d >= 65 ? 2 : 0,
    });
  }
  return {
    seed: 65511, arm: 'control', policyId: 'leadfeast', anchorCommit: 'deadbeef0000',
    window, w5Day: 70, w4Day: 60, maxWave: 5, national: 1, table: 1, won: 0,
    winDay: null, winPath: null, gameDays: 80, endReason: 'days',
    demand5: { armored: 4, armed: 6, tricks: 3, veterans: 2 },
    demand4: { armored: 3, armed: 5, tricks: 3, veterans: 1 },
    gateVector: {
      t4: 100, t5: 200, peak: 5,
      df4: { deferred: false, grandfathered: true }, df5: { deferred: false, grandfathered: true },
      attr: { outcome: 'unlocked', attributed: true, why: 'all gates met', binding: null, unmet: [] },
    },
    gateErr: null,
    engagements: [{ wave: 5, channel: 'monster' }],
    kills: [{ wave: 5 }],
    instrumentErrors: [],
    deaths: { combat: 3 },
    nTitansOutcomes: 1,
  };
}
function fixtureLockedDefer5() {
  const window = [];
  for (let d = 1; d <= 80; d++) {
    window.push({
      day: d, uw: 4, raw: 210, capped: 200,
      r4: { armored: 3, armed: 5, tricks: 3, veterans: 1, ready: true },
      r5: { armored: 2, armed: 6, tricks: 3, veterans: 1, ready: false },
      w4faced: 2,
    });
  }
  return {
    seed: 65512, arm: 'armorydrive', policyId: 'leadfeast-armorydrive', anchorCommit: 'deadbeef0000',
    window, w5Day: null, w4Day: 60, maxWave: 4, national: 1, table: 1, won: 0,
    gameDays: 80, endReason: 'days',
    demand5: { armored: 4, armed: 6, tricks: 3, veterans: 2 },
    demand4: { armored: 3, armed: 5, tricks: 3, veterans: 1 },
    gateVector: {
      t4: 100, t5: 200, peak: 4,
      df4: { deferred: false, grandfathered: false }, df5: { deferred: true, grandfathered: false },
      attr: { outcome: 'locked', attributed: true, why: 'binding gate', binding: 'defer5', unmet: ['defer5'] },
    },
    gateErr: null,
    engagements: [],
    kills: [],
    instrumentErrors: [],
    deaths: { combat: 2 },
    nTitansOutcomes: 0,
  };
}
(function e3() {
  const AZ = require(path.join(REPO, 'scripts', 'analyze-w5door-b'));
  const rec1 = AZ.classifyRun(fixtureUnlockLiveDemand());
  ok('E3a unlock fixture: unlocked, live-demand', rec1.unlocked && rec1.defer5OpenPath === 'live-demand', `path=${rec1.defer5OpenPath} w5Day=${rec1.w5Day}`);
  ok('E3b unlock fixture: attributed, 0 unexplained', rec1.attributed && !rec1.unexplained, `attributed=${rec1.attributed}`);
  ok('E3c unlock fixture: bar-release days read', rec1.barRelease5 && rec1.barRelease5.armored === 70 && rec1.barRelease5.veterans === 70, JSON.stringify(rec1.barRelease5));
  const rec2 = AZ.classifyRun(fixtureLockedDefer5());
  ok('E3d locked fixture: binding gate named', !rec2.unlocked && rec2.binding === 'defer5', `binding=${rec2.binding}`);
  ok('E3e locked fixture: attributed, 0 unexplained', rec2.attributed && !rec2.unexplained);
  const c = AZ.census([rec1, rec2]);
  ok('E3f census: n=2 doors=1/2', c.n === 2 && c.unlocking === 1 && c.locked === 1);
  ok('E3g census: releaseMix + bindingTally', JSON.stringify(c.releaseMix) === JSON.stringify({ 'defer4:live-demand/defer5:live-demand': 1 }) && JSON.stringify(c.bindingTally) === JSON.stringify({ defer5: 1 }), JSON.stringify(c.releaseMix) + ' ' + JSON.stringify(c.bindingTally));
  ok('E3h census: DIAG-GO(a) true at 0 unexplained', c.diagGo === true && c.unexplained === 0);
  const w = AZ.wallNumbers([fixtureUnlockLiveDemand(), fixtureLockedDefer5()]);
  ok('E3i wallNumbers: national/table/reach/median', w.national === 2 && w.table === 2 && w.wins === 0 && w.wreach[5] === 1 && w.wreach[4] === 2 && w.median === 80, JSON.stringify({ n: w.national, t: w.table, r: w.wreach, med: w.median }));
})();

// --- E4: anchor equals git HEAD --------------------------------------------
(function e4() {
  const env = Object.assign({}, process.env, PINNED, { ARM: 'control' });
  const out = spawnSync(process.execPath,
    ['-e', "const D=require(process.argv[1]); console.log(D.ANCHOR);", path.join(REPO, 'scripts', 'diag-w5door-b.js')],
    { env, timeout: 60000, encoding: 'utf8' });
  const head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12);
  ok('E4 anchor == git HEAD at module load', out.status === 0 && out.stdout.trim() === head, `anchor=${out.stdout.trim()} head=${head}`);
})();

// --- E5: seed freshness (the brief's stated criterion) ----------------------
(function e5() {
  let bad = 0;
  for (const s of [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518]) {
    const hits = execSync(`find ${REPO}/evidence ${REPO}/scripts -name "*${s}*" 2>/dev/null | wc -l`).toString().trim();
    if (parseInt(hits, 10) > 0) { bad++; console.log(`  seed ${s}: ${hits} filename hits`); }
  }
  ok('E5 pilot seeds 65511-65518: 0 filename hits', bad === 0);
})();

// --- E1: determinism, instrument on vs off, 40d ------------------------------
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
  const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
  const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
  const env = Object.assign({}, process.env, PINNED);
  process.env = env;
  const SEED = 65511, DAYS = 40;
  async function oneRun(withInstrument) {
    const { Game } = await loadGame({ seed: SEED, mode: 'w5door-b-proof', fullTelemetry: false });
    const policy = AD.substrateFor('leadfeast');
    let t = null, uninstall = null;
    if (withInstrument) {
      t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [], deathRecs: [], fightStarts: [] };
      uninstall = WS.install(Game, t);
    }
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
    if (uninstall) try { uninstall(); } catch (e) {}
    return { hashes, nErr: t ? t.instrumentErrors.length : 0 };
  }
  const on = await oneRun(true);
  const off = await oneRun(false);
  const same = on.hashes.length === off.hashes.length && on.hashes.every((h, i) => h === off.hashes[i]);
  ok('E1 instrument-on vs instrument-off byte-identical 40d', same && on.hashes.length >= DAYS,
    `on=${on.hashes.length} off=${off.hashes.length} same=${same}`);
  ok('E1b det run has 0 instrumentErrors', on.nErr === 0, 'errs=' + on.nErr);

  console.log(`\nw5door-b proof: ${PASS.length} passed, ${FAIL.length} failed`);
  for (const f of FAIL) console.log('FAIL ' + f);
  if (FAIL.length) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
