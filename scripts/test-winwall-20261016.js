#!/usr/bin/env node
'use strict';
// test-winwall-20261016.js — pre-sweep proof for the wall census on the
// NEW default-ON seatdrive composition (flesh-out loop ARM sim-winwall,
// 2026-10-16, scale-onramp axis).
//
// No lever change: this is a confirm that the wall state holds on FRESH
// seeds under commit c004b9dd's default-ON flip. The layer
// (scripts/policies/seatdrive.js) is UNCHANGED since test-seatdrive /
// test-winconfirm3 proved it — this proof re-verifies the properties the
// sweep depends on, with the post-flip semantics (finding #389):
//   (a) layerOn semantics post-flip: SEATDRIVE unset = ON, '0' = OFF,
//       '1' = ON.  ("SEATDRIVE unset" means "driver absent" ONLY when the
//       wrapper is never composed; the sweep composes it both sides.)
//   (b) composition integrity: SD.leadseat / SD.belongseat are the same
//       withSeatDrive(windefer(tribfloor)) objects the sweep runs, and the
//       WINPURSUIT/WINDEFER layers read '1'-gated ON under the substrate.
//   (c) gate-off det-gate: SEATDRIVE=0-wrapped == naked
//       windefer(tribfloor) byte-identical day hashes on the FRESH seeds
//       (2 seeds x 2 policies, 60d) — the opt-out must be pure delegation.
//   (d) ENGAGEMENT sanity on a known-sitting prior seed (s121 belongfeast,
//       won in winconfirm3): armed (SEATDRIVE unset = default ON) sits by
//       180d (sittings > 0); control (SEATDRIVE=0) never sits (sittings =
//       0). Proves the composed substrate is genuinely ACTIVE, not an
//       inert twin — the (a)/(b) markers alone cannot distinguish the
//       #389 trap.
//   (e) SMOKE: 20d both sides, layer-live markers honest
//       (seatLive === (side === 'armed'), deferLive === true).
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-winwall-20261016.js
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const WP = require('./policies/winpursuit');

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
    const r = fn();
    return (r && typeof r.then === 'function') ? r.finally(restore) : (restore(), r);
  } catch (e) { restore(); throw e; }
  function restore() {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

async function hashesFor(seed, policy, days) {
  const { Game } = await loadGame({ seed, mode: 'winwall-detgate' });
  await setupGame(Game);
  const hashes = [];
  const w = Object.assign({}, policy);
  const base = policy.daily;
  w.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await quietLog(async () => runDays(Game, w, { days, sampleEvery: 1 }));
  return { hashes, days: r.days, endReason: r.endReason };
}

async function main() {
  console.log('== winwall pre-sweep proof ==');

  // ----- (a) layerOn semantics post-flip -----
  withEnv({ SEATDRIVE: undefined }, () => ok('a1: layerOn true when SEATDRIVE unset (default ON)', SD.layerOn() === true, ''));
  withEnv({ SEATDRIVE: '0' }, () => ok('a2: layerOn false when SEATDRIVE=0 (explicit opt-out)', SD.layerOn() === false, ''));
  withEnv({ SEATDRIVE: '1' }, () => ok('a3: layerOn true when SEATDRIVE=1 (explicit on)', SD.layerOn() === true, ''));

  // ----- (b) composition integrity -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('b1: leadseat id', SD.leadseat && SD.leadseat.id === 'leadfeast-windefer', SD.leadseat && SD.leadseat.id);
    ok('b2: belongseat id', SD.belongseat && SD.belongseat.id === 'belongfeast-windefer', SD.belongseat && SD.belongseat.id);
    ok('b3: windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
    ok('b4: winpursuit layerOn true under WINPURSUIT=1', WP.layerOn() === true, '');
    ok('b5: windefer layerOn false when WINDEFER unset', withEnv({ WINDEFER: undefined }, () => WD.layerOn() === false), '');
  });

  // ----- (c) gate-off det-gate on FRESH seeds -----
  {
    const SEEDS = [1701, 1702];
    const DAYS = 60;
    const PIDS = ['leadfeast', 'belongfeast'];
    const naked = (pid) => pid === 'leadfeast'
      ? WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer', 'det-gate naked')
      : WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'det-gate naked');
    const wrapped = (pid) => pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
    let det = 0;
    const detFails = [];
    for (const pid of PIDS) {
      for (const seed of SEEDS) {
        const a = await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '0' }), () => hashesFor(seed, wrapped(pid), DAYS));
        const b = await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '0' }), () => hashesFor(seed, naked(pid), DAYS));
        const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]);
        if (same) det++; else detFails.push(`${pid} s${seed}: ${a.hashes.length} vs ${b.hashes.length}`);
      }
    }
    ok(`c: det-gate SEATDRIVE=0 wrapped == naked (${det}/4 fresh-seed trajectories, 60d)`, detFails.length === 0, detFails.join('; ').slice(0, 200));
  }

  // ----- (d) engagement sanity on known-sitting seed s121 -----
  for (const side of ['control', 'armed']) {
    const { Game } = await loadGame({ seed: 121, mode: `winwall-proof-engage-${side}` });
    await setupGame(Game);
    const policy = Object.assign({}, SD.belongseat);
    let ctxLive = null, seatLive = null, deferLive = null;
    const oSetup = SD.belongseat.setup;
    policy.setup = (G, ctx) => {
      ctxLive = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: side === 'armed' ? undefined : '0' }), async () => {
      await quietLog(async () => { r = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
    });
    const sittings = (ctxLive && ctxLive.sdSeatTaken) | 0;
    ok(`d: engage ${side} seat marker honest`, seatLive === (side === 'armed'), `seat=${seatLive}`);
    ok(`d: engage ${side} windefer marker honest`, deferLive === true, `defer=${deferLive}`);
    ok(`d: engage ${side} run completes`, !!(r && r.days > 0), `days=${r && r.days}`);
    if (side === 'armed') ok('d: armed (default-ON) sittings > 0 on s121', sittings > 0, `sittings=${sittings}`);
    else ok('d: control (SEATDRIVE=0) sittings == 0 on s121', sittings === 0, `sittings=${sittings}`);
  }

  // ----- (e) SMOKE both sides 20d on a fresh seed -----
  for (const side of ['control', 'armed']) {
    const { Game } = await loadGame({ seed: 1701, mode: `winwall-proof-smoke-${side}` });
    await setupGame(Game);
    let seatLive = null, deferLive = null;
    const base = SD.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { seatLive = SD.layerOn(); deferLive = WD.layerOn(); if (oSetup) return oSetup(G, ctx); };
    let smokeResult = null;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: side === 'armed' ? undefined : '0' }), async () => {
      await quietLog(async () => { smokeResult = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    });
    ok(`e: SMOKE ${side} seat marker honest`, seatLive === (side === 'armed'), `seat=${seatLive}`);
    ok(`e: SMOKE ${side} windefer marker honest`, deferLive === true, `defer=${deferLive}`);
    ok(`e: SMOKE ${side} run completes`, !!(smokeResult && smokeResult.days >= 20), 'days=' + (smokeResult && smokeResult.days));
  }

  console.log(`\nwinwall proof: ${pass} pass, ${fail} fail`);
  if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
