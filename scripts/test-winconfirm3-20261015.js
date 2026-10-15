#!/usr/bin/env node
'use strict';
// test-winconfirm3-20261015.js — pre-sweep proof for the win-side-stack
// FRESH-SEED confirm (flesh-out loop DIAGNOSTIC, 2026-10-15, sim-winconfirm3).
//
// No lever change: this confirm re-runs the landed win-side stack
// (FEASTSCALE_R13 + TRIBFLOOR + SUCCGRACE + RAIDDENSITY + WINPURSUIT +
// WINDEFER + SEATDRIVE) against 8 FRESH seeds, with its own in-sweep
// control. The layer under test (scripts/policies/seatdrive.js) is
// UNCHANGED since test-seatdrive-20261015.js proved it 26/26 GREEN — so
// this proof re-verifies the two properties the sweep depends on:
//   (a) layer-live markers honest on BOTH sides (the sweep hard-fails on
//       a marker mismatch per run);
//   (b) gate-off det-gate: the seatdrive-wrapped composition is
//       byte-identical to the naked composition on fresh seeds (gate-off
//       purity — the layer must be inert when SEATDRIVE is unset).
// Plus SMOKE: one 20d run per side, markers honest, run completes.
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-winconfirm3-20261015.js
//   SEEDS="111,222" DAYS=20 node scripts/test-winconfirm3-20261015.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) { saved[k] = process.env[k]; }
  try {
    for (const [k, v] of Object.entries(vars)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    return fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

async function main() {
  console.log('== winconfirm pre-sweep proof ==');

  // ----- 1. layerOn honesty -----
  withEnv({ SEATDRIVE: '1' }, () => ok('layerOn true when SEATDRIVE=1', SD.layerOn() === true, ''));
  withEnv({ SEATDRIVE: undefined }, () => ok('layerOn false when unset', SD.layerOn() === false, ''));

  // ----- 2. composition integrity: the same wrapped objects the sweep runs -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadseat id', SD.leadseat && SD.leadseat.id === 'leadfeast-windefer', SD.leadseat && SD.leadseat.id);
    ok('belongseat id', SD.belongseat && SD.belongseat.id === 'belongfeast-windefer', SD.belongseat && SD.belongseat.id);
    ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
  });

  // ----- 3. det-gate: gate-off purity on FRESH seeds (16/16) -----
  {
    const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [111, 222, 333, 444, 555, 666, 777, 888]).filter(Number.isFinite);
    const DAYS = parseInt(process.env.DAYS || '60', 10);
    const PIDS = ['leadfeast', 'belongfeast'];
    const naked = (pid) => pid === 'leadfeast'
      ? WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer', 'det-gate naked')
      : WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'det-gate naked');
    const wrapped = (pid) => pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
    async function hashesFor(seed, policy) {
      const { Game } = await loadGame({ seed, mode: 'winconfirm-detgate' });
      await setupGame(Game);
      const hashes = [];
      const w = Object.assign({}, policy);
      const base = policy.daily;
      w.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return base ? base(G, ctx) : undefined;
      };
      const r = await quietLog(async () => runDays(Game, w, { days: DAYS, sampleEvery: 1 }));
      return { hashes, days: r.days, endReason: r.endReason };
    }
    let det = 0, detFails = [];
    for (const pid of PIDS) {
      for (const seed of SEEDS) {
        const a = await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: undefined }), () => hashesFor(seed, wrapped(pid)));
        const b = await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: undefined }), () => hashesFor(seed, naked(pid)));
        const sameLen = a.hashes.length === b.hashes.length;
        const same = sameLen && a.hashes.every((h, i) => h === b.hashes[i]);
        if (same) { det++; }
        else detFails.push(`${pid} s${seed}: len ${a.hashes.length} vs ${b.hashes.length}`);
      }
    }
    ok(`det-gate: ${det}/16 identical gate-off trajectories on fresh seeds`, detFails.length === 0, detFails.join('; ').slice(0, 200));
  }

  // ----- 4. SMOKE: both sides 20d, markers honest -----
  for (const side of ['control', 'armed']) {
    const { Game } = await loadGame({ seed: 111, mode: `winconfirm-proof-smoke-${side}` });
    await setupGame(Game);
    let seatLive = null, deferLive = null;
    const base = SD.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { seatLive = SD.layerOn(); deferLive = WD.layerOn(); if (oSetup) return oSetup(G, ctx); };
    let smokeResult = null;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: side === 'armed' ? '1' : undefined }), async () => {
      await quietLog(async () => { smokeResult = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    });
    ok(`SMOKE ${side}: seat marker honest`, seatLive === (side === 'armed'), `seat=${seatLive}`);
    ok(`SMOKE ${side}: windefer marker honest (true)`, deferLive === true, `defer=${deferLive}`);
    ok(`SMOKE ${side}: run completes its 20 iterations`, !!(smokeResult && smokeResult.days >= 20),
      'days=' + (smokeResult && smokeResult.days));
  }

  console.log(`\nwinconfirm proof: ${pass} pass, ${fail} fail`);
  if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
