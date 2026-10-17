#!/usr/bin/env node
'use strict';
// test-wincensus-c-20261017.js — pre/post-sweep proof for the win-side-stack
// FOURTH fresh-seed confirm (flesh-out loop DIAGNOSTIC, 2026-10-17, sim-wincensus-c).
//
// No lever change: this confirm re-runs the landed win-side stack
// (FEASTSCALE_R13 + TRIBFLOOR + SUCCGRACE + RAIDDENSITY + WINPURSUIT +
// WINDEFER + SEATDRIVE) against 2x8 FRESH seeds, with its own in-sweep
// control per set. The seatdrive layer is UNCHANGED — this proof re-verifies
// the properties the sweep depends on:
//   (a) layer-live markers honest on BOTH sides (the sweep hard-fails on
//       a marker mismatch per run); SEATDRIVE=0 is the EXPLICIT opt-out
//       (default-ON since 2026-10-16 sim-seatdefault — deleting the var no
//       longer gates off, so the control sets SEATDRIVE=0 explicitly);
//   (b) gate-off det-gate: the SEATDRIVE=0-wrapped composition is
//       byte-identical to the naked composition on fresh seeds (gate-off
//       purity — the layer must be inert when SEATDRIVE=0);
//   (c) env composition correct: the substrate flags are all live, the
//       windefer layer is on, the landed allowgate2 layer is OFF
//       (ALLOWGATE2 unset — default-OFF, same as the winconfirm3 replicate).
// Plus SMOKE: one 20d run per side, markers honest, run completes.
//
// Phase 2 (post-sweep): --schema-only <per-seed-dir> validates the sweep's
// per-seed JSONs (exact numeric keys national, table, wins, exiled,
// sittings + gameDays — the won/wins schema-drift trap). It must pass
// before the sweep is called done.
//
// Writes NOTHING into the repo (AGENTS.md: new tests never write into the
// repo; the sweep owns evidence/ writes).
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-wincensus-c-20261017.js
//   SEEDS="51977,610043" DAYS=60 node scripts/test-wincensus-c-20261017.js   # targeted det-gate
//   node scripts/test-wincensus-c-20261017.js --schema-only evidence/2026-10-17/perseed-wincensus-c
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const AG2 = require('./policies/allowgate2');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.ALLOWGATE2 === '1') { console.error('PROOF STOP: ALLOWGATE2=1 — substrate moved.'); process.exit(2); }

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

const FRESH = [51977, 610043, 730111, 840217, 950303, 1060511, 1170103, 1280207,
               1390319, 1500427, 1610521, 1720609, 1830703, 1940809, 2050913, 2161013];

function schemaCheck(dir) {
  console.log('== wincensus-c schema check: ' + dir + ' ==');
  const nums01 = ['national', 'table', 'wins', 'exiled'];
  const nums = ['sittings', 'gameDays', 'days'];
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => /-s\d+\.json$/.test(f)); } catch (e) {
    ok('per-seed dir readable', false, dir); return;
  }
  ok('per-seed file count (2 sets x 8 seeds x 2 policies x 2 sides = 64)', files.length === 64, String(files.length));
  let bad = 0;
  const seen = new Set();
  for (const f of files) {
    let o;
    try { o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { bad++; fails.push('unparseable ' + f); continue; }
    const probs = [];
    for (const k of nums01) if (!(Number.isInteger(o[k]) && (o[k] === 0 || o[k] === 1))) probs.push(k + '=' + o[k]);
    for (const k of nums) if (!(Number.isFinite(o[k]) && o[k] >= 0)) probs.push(k + '=' + o[k]);
    if (!['control', 'armed'].includes(o.side)) probs.push('side=' + o.side);
    if (!['leadfeast', 'belongfeast'].includes(o.policyId)) probs.push('policyId=' + o.policyId);
    if (!['A', 'B'].includes(o.set)) probs.push('set=' + o.set);
    if (!FRESH.includes(o.seed)) probs.push('seed-not-fresh=' + o.seed);
    if (o.seatDay !== null && !(Number.isInteger(o.seatDay) && o.seatDay > 0)) probs.push('seatDay=' + o.seatDay);
    if (typeof o.endReason !== 'string') probs.push('endReason missing');
    const key = `${o.set}|${o.policyId}|${o.side}|${o.seed}`;
    if (seen.has(key)) probs.push('duplicate ' + key);
    seen.add(key);
    if (probs.length) { bad++; console.log('  SCHEMA-BAD ' + f + ': ' + probs.join('; ')); }
  }
  ok('0 schema-bad per-seed JSONs', bad === 0, bad + ' bad');
}

async function main() {
  const schemaOnly = process.argv.includes('--schema-only');
  if (schemaOnly) {
    const dir = process.argv[process.argv.indexOf('--schema-only') + 1] || '';
    schemaCheck(path.resolve(dir));
    console.log(`\nwincensus-c schema proof: ${pass} pass, ${fail} fail`);
    if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
    return;
  }
  console.log('== wincensus-c pre-sweep proof ==');

  // ----- 1. layerOn honesty (default-ON semantics) -----
  withEnv({ SEATDRIVE: '1' }, () => ok('layerOn true when SEATDRIVE=1', SD.layerOn() === true, ''));
  withEnv({ SEATDRIVE: '0' }, () => ok('layerOn false when SEATDRIVE=0 (the explicit opt-out)', SD.layerOn() === false, ''));
  withEnv({ SEATDRIVE: undefined }, () => ok('layerOn true when unset (default-ON; deleting no longer opts out)', SD.layerOn() === true, ''));

  // ----- 2. composition integrity: the same wrapped objects the sweep runs -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadseat id', SD.leadseat && SD.leadseat.id === 'leadfeast-windefer', SD.leadseat && SD.leadseat.id);
    ok('belongseat id', SD.belongseat && SD.belongseat.id === 'belongfeast-windefer', SD.belongseat && SD.belongseat.id);
    ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
    ok('allowgate2 gate off when ALLOWGATE2 unset (landed default-OFF, stays OFF)', AG2.gateOn() === false, '');
  });

  // ----- 3. det-gate: gate-off (SEATDRIVE=0) purity on FRESH seeds -----
  {
    const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : FRESH).filter(Number.isFinite);
    const DAYS = parseInt(process.env.DAYS || '60', 10);
    const PIDS = ['leadfeast', 'belongfeast'];
    const naked = (pid) => pid === 'leadfeast'
      ? WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer', 'det-gate naked')
      : WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'det-gate naked');
    const wrapped = (pid) => pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
    async function hashesFor(seed, policy) {
      const { Game } = await loadGame({ seed, mode: 'wincensus-c-detgate' });
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
    let det = 0; const detFails = [];
    const total = SEEDS.length * PIDS.length;
    for (const pid of PIDS) {
      for (const seed of SEEDS) {
        const env = Object.assign({}, SUBSTRATE, { SEATDRIVE: '0' });
        const a = await withEnv(env, () => hashesFor(seed, wrapped(pid)));
        const b = await withEnv(env, () => hashesFor(seed, naked(pid)));
        const sameLen = a.hashes.length === b.hashes.length;
        const same = sameLen && a.hashes.every((h, i) => h === b.hashes[i]);
        if (same) { det++; }
        else detFails.push(`${pid} s${seed}: len ${a.hashes.length} vs ${b.hashes.length}`);
      }
    }
    ok(`det-gate: ${det}/${total} identical SEATDRIVE=0 gate-off trajectories on fresh seeds`, detFails.length === 0, detFails.join('; ').slice(0, 300));
  }

  // ----- 4. SMOKE: both sides 20d, markers honest -----
  for (const side of ['control', 'armed']) {
    const { Game } = await loadGame({ seed: 51977, mode: `wincensus-c-proof-smoke-${side}` });
    await setupGame(Game);
    let seatLive = null, deferLive = null;
    const base = SD.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { seatLive = SD.layerOn(); deferLive = WD.layerOn(); if (oSetup) return oSetup(G, ctx); };
    let smokeResult = null;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: side === 'armed' ? '1' : '0' }), async () => {
      await quietLog(async () => { smokeResult = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    });
    ok(`SMOKE ${side}: seat marker honest`, seatLive === (side === 'armed'), `seat=${seatLive}`);
    ok(`SMOKE ${side}: windefer marker honest (true)`, deferLive === true, `defer=${deferLive}`);
    ok(`SMOKE ${side}: run completes its 20 iterations`, !!(smokeResult && smokeResult.days >= 20),
      'days=' + (smokeResult && smokeResult.days));
  }

  console.log(`\nwincensus-c pre-sweep proof: ${pass} pass, ${fail} fail`);
  if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
