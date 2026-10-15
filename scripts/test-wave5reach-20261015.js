#!/usr/bin/env node
'use strict';
// test-wave5reach-20261015.js — pre-sweep proof for the wave-5 reachability
// lever (flesh-out loop, 2026-10-15, sim-wave5reach, scale-onramp axis).
//
// The lever: scripts/policies/wave5reach.js (env-gated WAVE5REACH=1,
// default OFF, ZERO src/js changes) wrapping SD.leadseat/belongseat, plus
// the _w5Commit extension to competent.js's legacy flee block (inert
// without the flag).
//
// Proves, before any sweep spend:
//   (a) layer-live markers honest on BOTH sides (the sweep hard-fails on
//       a marker mismatch per run);
//   (b) gate-off det-gate: the withWave5Reach composition is byte-identical
//       to the naked seatdrive composition on identical seeds (gate-off
//       purity — the layer must be inert when WAVE5REACH is unset; this
//       also pins the competent.js extension inert without the flag);
//   (c) SMOKE: one 20d run per side, markers honest, run completes.
//   (d) unit checks on the layer's read logic with stub Game objects
//       (huntLive gating; _w5Commit/_huntCommit marking conditions) —
//       these exercise logic only, never the engine.
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-wave5reach-20261015.js
//   SEEDS="121,232" DAYS=20 node scripts/test-wave5reach-20261015.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const W5R = require('./policies/wave5reach');

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

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1' };

async function main() {
  console.log('== wave5reach pre-sweep proof ==');

  // ----- 1. layerOn honesty -----
  withEnv({ WAVE5REACH: '1' }, () => ok('layerOn true when WAVE5REACH=1', W5R.wave5reachOn() === true, ''));
  withEnv({ WAVE5REACH: undefined }, () => ok('layerOn false when unset', W5R.wave5reachOn() === false, ''));

  // ----- 2. composition integrity: the same wrapped objects the sweep runs -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadseat id', W5R.leadseat && W5R.leadseat.id === 'leadfeast-windefer', W5R.leadseat && W5R.leadseat.id);
    ok('belongseat id', W5R.belongseat && W5R.belongseat.id === 'belongfeast-windefer', W5R.belongseat && W5R.belongseat.id);
    ok('seatdrive layerOn true under SEATDRIVE=1', SD.layerOn() === true, '');
    ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
  });

  // ----- 3. unit checks: huntLive gating + commit-flag marking (stub Games) -----
  withEnv({ WAVE5REACH: '1' }, () => {
    const stubG = (uw, tableDone) => ({
      unlockedWave: () => uw,
      progState: () => ({ tableDone: !!tableDone, tableWaiting: false }),
      state: { scholar: { hp: 100 } },
      maxHealth: () => 100,
      data: { monsters: [{ id: 'the_editor', wave: 4 }, { id: 'the_spool', wave: 3 }] },
    });
    ok('huntLive false pre-wave-4', W5R.huntLive(stubG(3, false)) === false, '');
    ok('huntLive true at wave-4', W5R.huntLive(stubG(4, false)) === true, '');
    ok('huntLive false once wave-5 unlocked', W5R.huntLive(stubG(5, false)) === false, '');
    ok('huntLive false during table sequence', W5R.huntLive(stubG(4, true)) === false, '');
    ok('beastWaveOf wave-4 monster', W5R.beastWaveOf(stubG(4, false), 'the_editor') === 4, '');
    ok('beastWaveOf wave-3 monster', W5R.beastWaveOf(stubG(4, false), 'the_spool') === 3, '');
  });
  withEnv({ WAVE5REACH: undefined }, () => {
    const stubG = (uw) => ({
      unlockedWave: () => uw,
      progState: () => ({}),
    });
    ok('huntLive false when gate off (wave-4, unset)', W5R.huntLive(stubG(4)) === false, '');
  });
  // fight-side flag marking: stub fight with a wave-4 monster, healthy scholar.
  withEnv({ WAVE5REACH: '1' }, () => {
    const g = {
      unlockedWave: () => 4,
      progState: () => ({}),
      state: { scholar: { hp: 80 } },
      maxHealth: () => 100,
      data: { monsters: [{ id: 'the_editor', wave: 4 }] },
      tbfight: { over: false, fighters: [{ kind: 'monster', hp: 900, monsterId: 'the_editor' }] },
    };
    const ctx = {};
    let delegated = false;
    const base = { fight: () => { delegated = true; return false; } };
    const wrapped = W5R.withWave5Reach(base, 'test-id', 'test');
    wrapped.fight(g, ctx);
    ok('_w5Commit set for wave-4+ fight at >=50% HP', ctx._w5Commit === true, 'got ' + ctx._w5Commit);
    ok('_huntCommit false for pure wave-4 fight', ctx._huntCommit === false, 'got ' + ctx._huntCommit);
    ok('delegation still happens', delegated === true, '');
    // hurt scholar: no commitment.
    const g2 = Object.assign({}, g, { state: { scholar: { hp: 30 } } });
    const ctx2 = {};
    wrapped.fight(g2, ctx2);
    ok('_w5Commit false when hurt (<50%)', ctx2._w5Commit === false, 'got ' + ctx2._w5Commit);
    // wave-3: _huntCommit, not _w5Commit.
    const g3 = Object.assign({}, g, {
      data: { monsters: [{ id: 'the_spool', wave: 3 }] },
      tbfight: { over: false, fighters: [{ kind: 'monster', hp: 300, monsterId: 'the_spool' }] },
    });
    const ctx3 = {};
    wrapped.fight(g3, ctx3);
    ok('_huntCommit set for wave-3 fight', ctx3._huntCommit === true, 'got ' + ctx3._huntCommit);
    ok('_w5Commit false for pure wave-3 fight', ctx3._w5Commit === false, 'got ' + ctx3._w5Commit);
  });

  // ----- 4. det-gate: gate-off purity on fresh seeds -----
  {
    const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [121, 232, 343, 454]).filter(Number.isFinite);
    const DAYS = parseInt(process.env.DAYS || '60', 10);
    const PIDS = ['leadfeast', 'belongfeast'];
    const naked = (pid) => pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
    const wrapped = (pid) => pid === 'leadfeast' ? W5R.leadseat : W5R.belongseat;
    async function hashesFor(seed, policy) {
      const { Game } = await loadGame({ seed, mode: 'wave5reach-detgate' });
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
        const a = await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: undefined }), () => hashesFor(seed, wrapped(pid)));
        const b = await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: undefined }), () => hashesFor(seed, naked(pid)));
        const sameLen = a.hashes.length === b.hashes.length;
        const same = sameLen && a.hashes.every((h, i) => h === b.hashes[i]);
        if (same) { det++; }
        else detFails.push(`${pid} s${seed}: len ${a.hashes.length} vs ${b.hashes.length}`);
      }
    }
    ok(`det-gate: ${det}/${PIDS.length * SEEDS.length} identical gate-off trajectories on fresh seeds`, detFails.length === 0, detFails.join('; ').slice(0, 200));
  }

  // ----- 5. SMOKE: both sides 20d, markers honest -----
  for (const side of ['control', 'armed']) {
    const { Game } = await loadGame({ seed: 121, mode: `wave5reach-proof-smoke-${side}` });
    await setupGame(Game);
    let w5Live = null, seatLive = null, deferLive = null;
    const base = W5R.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn(); if (oSetup) return oSetup(G, ctx); };
    let smokeResult = null;
    await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: side === 'armed' ? '1' : undefined }), async () => {
      await quietLog(async () => { smokeResult = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    });
    ok(`SMOKE ${side}: wave5reach marker honest`, w5Live === (side === 'armed'), `w5r=${w5Live}`);
    ok(`SMOKE ${side}: seat marker honest (true)`, seatLive === true, `seat=${seatLive}`);
    ok(`SMOKE ${side}: windefer marker honest (true)`, deferLive === true, `defer=${deferLive}`);
    ok(`SMOKE ${side}: run completes its 20 iterations`, !!(smokeResult && smokeResult.days >= 20),
      'days=' + (smokeResult && smokeResult.days));
  }

  console.log(`\nwave5reach proof: ${pass} pass, ${fail} fail`);
  if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
