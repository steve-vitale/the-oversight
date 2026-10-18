#!/usr/bin/env node
// tabledeed-sweep-20261018.js — DIAGNOSTIC attribution sweep for sim-tabledeed.
//
// INSTRUMENT-ONLY: zero src/js changes, zero scripts/policies changes.
// Question: every tableWaiting set across 16 runs (8 fresh seeds x
// leadfeast/belongfeast) is traced to its predicate-evaluation site with a
// deed-state snapshot — verdict GATING / PRECEDING-BY-DESIGN / BROKEN.
//
// Substrate: EXACT sim-readconfirm instrument (180d death-aware, round-1
// flags). Seeds 54001-54008 verified fresh in evidence/ (filename scan +
// content grep: only float artifacts, e.g. preservedKcal 54006).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-tabledeed/<policy>/. No timestamps or timings
// are written, so re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   SEEDS=54001,54002 POLICIES=leadfeast LABEL=tabledeed \
//   node scripts/tabledeed-sweep-20261018.js
//   # det-gate (instrument-off on 2 fixed seeds, compare vs sweep JSONs):
//   DET=1 (same env + SEEDS=54001,54002 POLICIES=leadfeast)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const DET = process.env.DET === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [54001, 54002, 54003, 54004, 54005, 54006, 54007, 54008]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const LABEL = process.env.LABEL || 'tabledeed';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-tabledeed');
fs.mkdirSync(EVID, { recursive: true });

function policyFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// The attribution instrument. Installs an accessor on state.scholar.prog
// (the object every tableWaiting write goes through via progState()) and
// logs every set with the predicate chain evaluated at set time.
// Read-only except the value store; no RNG, no game writes.
function installAccessor(Game) {
  const log = [];
  const prog = Game.progState();
  let val = prog.tableWaiting;
  delete prog.tableWaiting;
  Object.defineProperty(prog, 'tableWaiting', {
    configurable: true, enumerable: true,
    get() { return val; },
    set(v) {
      val = v;
      try {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        const stack = new Error().stack || '';
        const frame = stack.split('\n').map(s => s.trim())
          .find(s => /src\/js\/[^:]+\.js:\d+/.test(s) && !/installAccessor/.test(s)) || '';
        const fn = (stack.split('\n').map(s => s.trim()).find(s => /at\s+([A-Za-z_$][\w$]*)\s*\(/.test(s) && !/installAccessor/.test(s) && !/Error/.test(s)) || '').replace(/^at\s+/, '').split(' ')[0];
        let seat = null, gate = null, arc = null, rank = null, announced = null;
        try { seat = ((Game.tableSeat && Game.tableSeat()) || {}).seat || 'none'; } catch (e) {}
        try { gate = Game.deedGateReady ? Game.deedGateReady() : null; } catch (e) {}
        try { arc = Game.progState().arc; } catch (e) {}
        try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
        try { announced = !!Game.progState().tableAnnounced; } catch (e) {}
        log.push({
          day, value: !!v, fn, callsite: frame.replace(/^at\s+/, ''),
          seat, arc, rank, announced, gateOk: !!(gate && gate.ok),
          gateBars: gate ? { w1: gate.w1 | 0, w2: gate.w2 | 0, w3: gate.w3 | 0, w4: gate.w4 | 0, w5: gate.w5 | 0, contestsN: gate.contestsN | 0, crisesN: gate.crisesN | 0 } : null,
        });
      } catch (e) {}
    },
  });
  return { log, restore() { try { delete prog.tableWaiting; prog.tableWaiting = val; } catch (e) {} } };
}

async function oneRun(seed, policyId, withInstr) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'tabledeed', fullTelemetry: false });
  await setupGame(Game);
  let acc = null;
  if (withInstr) acc = installAccessor(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (acc) acc.restore();

  const st = Game.state || {};
  let national = 0, table = 0, won = 0, gameDays = 0, arc = 0, seat = 'none', gateOk = false, gateBars = null, rank = 'village';
  try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; if (rank === 'national' || rank === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState(); if (pg.tableWaiting || pg.tableDone) table = 1; arc = pg.arc | 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { gameDays = (st.scholar && st.scholar.day) | 0; } catch (e) {}
  try { seat = ((Game.tableSeat && Game.tableSeat()) || {}).seat || 'none'; } catch (e) {}
  try { const g = Game.deedGateReady && Game.deedGateReady(); gateOk = !!(g && g.ok); gateBars = g ? { w1: g.w1 | 0, w2: g.w2 | 0, w3: g.w3 | 0, w4: g.w4 | 0, w5: g.w5 | 0, contestsN: g.contestsN | 0, crisesN: g.crisesN | 0 } : null; } catch (e) {}
  const deathCauses = {};
  let playerDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const c = String((d && d.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (d && d.player) playerDeaths++;
    }
  } catch (e) {}

  return {
    seed, policy: policyId, days: DAYS, finalDay: gameDays, survived: gameDays,
    national, table, won, arc, rank, seat, gateOk, gateBars,
    maxWave: result.maxWaveUnlocked | 0,
    deathCauses, playerDeaths,
    sets: withInstr && acc ? acc.log : [],
  };
}

(async () => {
  if (DET) {
    // Instrument-off re-runs of 2 fixed seeds; compare gameplay fields
    // byte-identical against the instrument-on sweep JSONs.
    let pass = 0, fail = 0;
    const fields = (j) => { const o = Object.assign({}, j); delete o.sets; return JSON.stringify(o); };
    for (const seed of SEEDS) {
      for (const policyId of POLICIES) {
        const off = await oneRun(seed, policyId, false);
        const p = path.join(EVID, LABEL, policyId, `${policyId}-s${seed}.json`);
        let on = null;
        try { on = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`DET MISSING ${policyId} s${seed} (${p})`); fail++; continue; }
        if (fields(on) === fields(off)) { pass++; console.log(`DET PASS ${policyId} s${seed}`); }
        else { fail++; console.log(`DET FAIL ${policyId} s${seed}`); console.log('  on : ' + fields(on)); console.log('  off: ' + fields(off)); }
      }
    }
    console.log(`\nDET: ${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }

  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await oneRun(seed, policyId, true);
      const dir = path.join(EVID, LABEL, policyId);
      fs.mkdirSync(dir, { recursive: true });
      const p = path.join(dir, `${policyId}-s${seed}.json`);
      fs.writeFileSync(p, JSON.stringify(out, null, 1) + '\n');
      const n = out.sets.length;
      const day0 = n ? out.sets[0].day : '-';
      console.log(`${policyId} s${seed}: day ${out.finalDay}, wave ${out.maxWave}, arc ${out.arc}, seat ${out.seat}, gateOk ${out.gateOk}, sets ${n} (first d${day0}), table ${out.table}, won ${out.won}`);
    }
  }
  console.log('SWEEP COMPLETE');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
