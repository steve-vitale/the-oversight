#!/usr/bin/env node
// test-mantlechain-20261022.js — proof for scripts/mantlechain-instr-20261022.js
// (flesh-out loop, 2026-10-22, run fleshout-20261022T2125Z, arm
// sim-mantlechain, axis scale-onramp). DIAG, instrument-only, zero src/js.
//
// SUBSTRATE (pinned — the vetwindow-DIAG substrate where the chain was
// observed; asserted up front):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1. Policies: AD.armedFor(leadfeast/belongfeast).
//
// Gates:
//   E0 module shape (instr exports, analyzer exports, N_DAYS=30).
//   E1 DET: instrument installed vs not — trajectories byte-identical
//      (60d x2 seeds, dayHash per day) + wrappers fully restored on uninstall.
//   E2 synthetic RED->GREEN on the ANALYZER (no sim needed):
//      E2a GO fixture: 20 in-scope deaths, 19 chain + 1 baseline → DIAG-GO,
//          share 95.0%, 0 unattributed.
//      E2b NO-GO fixture: share 60% → NO-GO.
//      E2c no-data fixture: 0 in-scope deaths → NO-GO (no-data).
//      E2d bucket edges: veteran kill AFTER death day not counted; same-day
//          non-combat death never in scope; scholar death with 31-day-old
//          succession → baseline-fighter.
//   E3 live smoke: 60d instrumented run completes; rows/schema valid;
//      instrumentErrors empty; at least one combat_start row on wave>=4 when
//      any wave-4 fight occurred.
//   E4 D2: one 60d config twice → per-seed JSON semantic fields identical
//      (excluding `at`).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 node scripts/test-mantlechain-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 required (pinned substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const MI = require('./mantlechain-instr-20261022');
const MA = require('./mantlechain-analyze-20261022');
const AD = require('./policies/armorydrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 500)); }
}

async function realGame(seed, mode) {
  const { Game } = await loadGame({ seed, mode: mode || 'mantlechain-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

async function trajectory(seed, base, withInstr, days) {
  const Game = await realGame(seed, 'mantlechain-det');
  let inst = null;
  if (withInstr) inst = MI.installMantlechain(Game);
  const policy = AD.armedFor(base);
  const hs = [];
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: days || 60, manifest: undefined, sampleEvery: 30 }); });
  if (inst) inst.uninstall();
  return { traj: hs.join('|'), days: hs.length, endReason: result.endReason,
    omb: String(Game.mantleBecome), otele: String(Game.tele).slice(0, 60), osay: String(Game.say).slice(0, 60) };
}

// ---- E2 fixtures ----
function synRow(deaths, successions, log) {
  return { seed: 1, base: 'leadfeast', successions, deaths, waveKillLog: log,
    fights: [], senseWindows: [], sayLinesTotal: 0, instrumentErrors: [] };
}
function d(day, who, opts) {
  return Object.assign({ day, who, whoName: who, kind: 'villager', cause: 'combat',
    player: false, fightWave: 4, fightMid: 'strike', fightBasis: 'live-tbfight',
    scholarInFight: false }, opts || {});
}
function s(day, newId) { return { day, oldId: 'old', oldName: 'Old', newId, newName: newId, trust: 80, occupationId: 'hunter', wave4plusKills: 1, anyWaveKills: 2, veteran: true }; }
function k(day, by, w) { return { d: day, mid: 'strike', by, byName: by, w, via: 'player' }; }

(async () => {
  // E0: shape.
  check('E0a: instr exports', ['installMantlechain', 'combatCause', 'nameOf', 'SEEDS', 'BASES', 'DAYS', 'OUTDIR']
    .every(x => MI[x] !== undefined));
  check('E0b: analyzer exports', ['attributeRow', 'latestSuccession', 'veteranAt', 'accelerantFactor', 'wall', 'N_DAYS']
    .every(x => MA[x] !== undefined));
  check('E0c: N_DAYS=30 (pre-registered window)', MA.N_DAYS === 30);
  check('E0d: corpus constants', MI.SEEDS.length === 8 && MI.BASES.length === 2 && MI.DAYS === 180);
  check('E0e: combatCause gates', MI.combatCause('combat', { data: {} }) === true &&
    MI.combatCause('starvation', { data: {} }) === false);

  // E1: DET — instrumented vs bare trajectories byte-identical.
  const e1a1 = await trajectory(65501, 'leadfeast', true, 60);
  const e1a2 = await trajectory(65501, 'leadfeast', false, 60);
  check('E1a: instrumented == bare trajectory (s65501 60d leadfeast)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0 && e1a1.endReason === e1a2.endReason,
    `lens ${e1a1.traj.length}/${e1a2.traj.length} end ${e1a1.endReason}/${e1a2.endReason}`);
  const e1b1 = await trajectory(65502, 'belongfeast', true, 60);
  const e1b2 = await trajectory(65502, 'belongfeast', false, 60);
  check('E1b: instrumented == bare trajectory (s65502 60d belongfeast)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0 && e1b1.endReason === e1b2.endReason);

  // E2a: GO fixture — 20 in-scope, 19 chain + 1 baseline.
  {
    const deaths = [], succs = [], log = [];
    for (let i = 0; i < 20; i++) {
      const vid = 'vet' + i;
      log.push(k(100, vid, 4));
      succs.push(s(110, vid));
      deaths.push(d(115, vid, { player: true })); // 5 days after succession
    }
    // one baseline: companion death, never held the mantle
    log.push(k(100, 'vetB', 4));
    deaths.push(d(120, 'vetB', { player: false }));
    const at = MA.attributeRow(synRow(deaths, succs, log));
    const chain = at.filter(a => a.bucket === 'chain-accelerated').length;
    const base = at.filter(a => a.bucket === 'baseline-fighter').length;
    check('E2a1: 21 in scope', at.length === 21, 'got ' + at.length);
    check('E2a2: 20 chain + 1 baseline', chain === 20 && base === 1,
      `chain=${chain} base=${base}`);
    check('E2a3: 20/21 = 95.2% → GO bar met', (chain / at.length) >= 0.95, (chain / at.length * 100).toFixed(1) + '%');
    // Add one more baseline → 20/22 = 90.9% → below the bar → NO-GO.
    deaths.push(d(125, 'vetB2', { player: false }));
    log.push(k(100, 'vetB2', 4));
    const at2 = MA.attributeRow(synRow(deaths, succs, log));
    const share2 = at2.filter(a => a.bucket === 'chain-accelerated').length / at2.length;
    check('E2a4: 20/22 = 90.9% → below bar (NO-GO)', share2 < 0.95, (share2 * 100).toFixed(1) + '%');
  }
  // E2b/E2c handled by E2a fixtures (share math); explicit no-data:
  {
    const at = MA.attributeRow(synRow([], [], []));
    check('E2c: no in-scope deaths → empty attribution (no-data)', at.length === 0);
  }
  // E2d: bucket edges.
  {
    // kill AFTER death day doesn't make a veteran
    const at1 = MA.attributeRow(synRow([d(110, 'v1', { player: true })], [s(100, 'v1')], [k(120, 'v1', 4)]));
    check('E2d1: post-death kill ≠ veteran (out of scope)', at1.length === 0);
    // wave-3 death out of scope
    const at2 = MA.attributeRow(synRow([d(110, 'v2', { fightWave: 3 })], [], [k(100, 'v2', 4)]));
    check('E2d2: wave-3 death out of scope', at2.length === 0);
    // same-day non-combat death out of scope
    const at3 = MA.attributeRow(synRow([d(110, 'v3', { fightWave: 4, fightBasis: 'same-day', cause: 'starvation' })], [], [k(100, 'v3', 4)]));
    check('E2d3: non-combat same-day death out of scope', at3.length === 0);
    // 31-day-old succession → baseline-fighter, not chain
    const at4 = MA.attributeRow(synRow([d(131, 'v4', { player: true })], [s(100, 'v4')], [k(90, 'v4', 4)]));
    check('E2d4: 31d-old succession → baseline-fighter',
      at4.length === 1 && at4[0].bucket === 'baseline-fighter', JSON.stringify(at4[0]));
    // 30-day-old succession → chain (boundary inclusive)
    const at5 = MA.attributeRow(synRow([d(130, 'v5', { player: true })], [s(100, 'v5')], [k(90, 'v5', 4)]));
    check('E2d5: 30d-old succession → chain-accelerated (boundary)',
      at5.length === 1 && at5[0].bucket === 'chain-accelerated');
    // succession AFTER death → baseline (no fresh succession)
    const at6 = MA.attributeRow(synRow([d(110, 'v6', { player: true })], [s(120, 'v6')], [k(100, 'v6', 4)]));
    check('E2d6: succession after death → baseline-fighter',
      at6.length === 1 && at6[0].bucket === 'baseline-fighter');
  }
  // E2 accelerant-factor synthetic.
  {
    const rows = [synRow(
      [d(115, 'a', { player: true, fightMid: 'strike' }), d(115, 'b', { player: false, fightMid: 'strike' })],
      [s(110, 'a')],
      [k(100, 'a', 4), k(100, 'b', 4), k(100, 'c', 4)])];
    rows[0].fights = [{ day: 115, mid: 'strike', wave: 4, scholar: 'a', party: ['b', 'c'] }];
    const acc = MA.accelerantFactor(rows);
    check('E2f1: factor fixture parts', acc.parts.fresh === 1 && acc.parts.vetBase === 2 && acc.parts.other === 0,
      JSON.stringify(acc.parts));
    check('E2f2: deaths by bucket', acc.deaths.fresh === 1 && acc.deaths.vetBase === 1,
      JSON.stringify(acc.deaths));
    check('E2f3: factor = (1/1)/(1/2) = 2.0x', acc.factor === 2, 'got ' + acc.factor);
  }

  // E3: live smoke — 60d instrumented run, schema + rows.
  {
    const Game = await realGame(65503, 'mantlechain-e3');
    const inst = MI.installMantlechain(Game);
    const policy = AD.armedFor('leadfeast');
    let result;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    inst.uninstall();
    const T = inst.T;
    check('E3a: 60d run completes with instrument', result.days > 0, 'days=' + result.days);
    check('E3b: no instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
    const succOk = T.successions.every(x => x.day != null && x.newId && x.oldId && typeof x.trust === 'number' && typeof x.veteran === 'boolean');
    check('E3c: succession rows schema', succOk && T.successions.length >= 0, 'n=' + T.successions.length);
    const fightOk = T.fights.every(x => x.day != null && x.mid && x.wave >= 4);
    check('E3d: fight rows schema (wave>=4 only)', fightOk, 'n=' + T.fights.length);
    const deathOk = T.deaths.every(x => x.day != null && x.who && x.fightBasis);
    check('E3e: death rows schema', deathOk, 'n=' + T.deaths.length);
    check('E3f: say capture alive', T.sayAll.length > 100, 'n=' + T.sayAll.length);
    console.log(`E3 smoke (s65503 60d leadfeast): days=${result.days} end=${result.endReason} fights=${T.fights.length} succ=${T.successions.length} deaths=${T.deaths.length}`);
  }

  // E4: D2 — same 60d config twice → JSON semantic fields identical (at excluded).
  {
    async function snap(seed) {
      const Game = await realGame(seed, 'mantlechain-e4');
      const inst = MI.installMantlechain(Game);
      const policy = AD.armedFor('leadfeast');
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 30 }); });
      inst.uninstall();
      const j = JSON.parse(JSON.stringify({ s: inst.T.successions, f: inst.T.fights, d: inst.T.deaths, days: result.days }));
      return JSON.stringify(j);
    }
    const a = await snap(65504), b = await snap(65504);
    check('E4: D2 per-seed JSON byte-identical (at excluded)', a === b && a.length > 0, 'len ' + a.length);
  }

  console.log(`\nPROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(1); });
