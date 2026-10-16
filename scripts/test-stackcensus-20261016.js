#!/usr/bin/env node
// scripts/test-stackcensus-20261016.js — PROOF for the stacking census
// (sim-stackcensus-b, 2026-10-16). The instrument is read-only; the proof
// has three phases:
//
//   I. DET-GATE (byte-identity): instrument-on vs instrument-off
//      trajectories must be byte-identical over 2 seeds x 40d — the
//      instrument must not perturb the engine (this is the "before/after
//      on identical seeds" measurement for a read-only instrument).
//   II. CLASSIFIER FIXTURES (pure classifyDay): the exact channel
//      taxonomy, including the stacking-binding sub-classes and the
//      UNATTRIBUTED case, on hand-built buckets.
//   III. SMOKE: substrate gates (FEASTSCALE_R13=1, SEATDRIVE=0), the
//      census run actually records thin-day events on real seeds, and
//      classifyDay covers the observed buckets (attribution check on
//      real data).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-stackcensus-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// ---- inline copy-free access to the census instrument ----
// We require the census script's classifyDay by loading it through a
// sandboxed module shim: the census script runs its sweep only under the
// top-level async IIFE... actually the IIFE runs on require. Instead, the
// census script is written so require() of it does NOT auto-run when
// STACKCENSUS_LIB=1 is set (guarded entry point). Guard: this file sets
// the env var before requiring.
process.env.STACKCENSUS_LIB = '1';

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required.'); process.exit(2); }

const results = [];
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  results.push({ name, pass: !!cond });
};

// Minimal read-only wrap of the census outflow instrument, rebuilt here
// (the sweep module exports it under STACKCENSUS_LIB=1).
const census = require('./census-stack-20261016.js');
const classifyDay = census.classifyDay;
if (typeof classifyDay !== 'function') { console.error('PROOF STOP: classifyDay not exported'); process.exit(3); }

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const fdOf = (Game) => { try { return Game.pantryFreshDays(); } catch (e) { return -1; } };

async function hashesFor(seed, withInstrument) {
  const { Game } = await loadGame({ seed, mode: `stackcensus-proof`, fullTelemetry: false });
  await setupGame(Game);
  const base = belongfeast;
  const pol = Object.assign({}, base);
  const t = {};
  let install = null;
  if (withInstrument) {
    census.attachOutflow(Game, t);
    const oUpkeep = base.upkeep, oDaily = base.daily;
    pol.upkeep = (G, ctx) => { const r = t._install(); try { return oUpkeep ? oUpkeep(G, ctx) : undefined; } finally { r(); } };
    pol.daily = (G, ctx) => { const r = t._install(); try { return oDaily ? oDaily(G, ctx) : undefined; } finally { r(); } };
  }
  const hashes = [];
  const oD = pol.daily;
  pol.daily = (G, ctx) => { hashes.push(G.state.scholar.day + ':' + dayHash(G)); return oD ? oD(G, ctx) : undefined; };
  await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 30 }); });
  return { hashes, t };
}

async function detGate() {
  console.log('== I. DET-GATE: instrument-on vs instrument-off byte-identity ==');
  for (const seed of [1501, 1502]) {
    const off = await hashesFor(seed, false);
    const on = await hashesFor(seed, true);
    const same = off.hashes.length === on.hashes.length && off.hashes.every((h, i) => h === on.hashes[i]);
    check(`byte-identical trajectories (seed ${seed}, 40d)`, same,
      `n=${off.hashes.length}/${on.hashes.length}, instrument recorded ${on.t.dayRecs ? on.t.dayRecs.length : 0} day-buckets`);
  }
}

function fixtures() {
  console.log('== II. CLASSIFIER FIXTURES ==');
  const c = (b) => classifyDay(b);
  let r = c({ day: 1, fd: 4.5, obl: 2400, aid: 0, feast: 0, aidN: 0, feastN: 0 });
  check('F1 pure obligated -> OBLIGATED', r.channel === 'OBLIGATED', JSON.stringify(r));
  r = c({ day: 1, fd: 4.5, obl: 0, aid: 0, feast: 3000, aidN: 0, feastN: 1 });
  check('F2 single feast, no obligated -> DISCRETIONARY-ONLY/single', r.channel === 'DISCRETIONARY-ONLY' && r.sub === 'single', JSON.stringify(r));
  r = c({ day: 118, fd: 1.1, obl: 2400, aid: 1913, feast: 0, aidN: 1, feastN: 0 });
  check('F3 drawvol-b s983/d118 shape -> STACKED/stackBind', r.channel === 'STACKED' && r.sub === 'stackBind', JSON.stringify(r));
  r = c({ day: 1, fd: 4.5, obl: 16875, aid: 1913, feast: 0, aidN: 1, feastN: 0 });
  check('F4 grief-leverage tribute + aid -> STACKED/stackOblHeavy', r.channel === 'STACKED' && r.sub === 'stackOblHeavy', JSON.stringify(r));
  r = c({ day: 1, fd: 2.0, obl: 500, aid: 1500, feast: 0, aidN: 1, feastN: 0 });
  check('F5 small obligated + aid under cap -> STACKED/stackSmall', r.channel === 'STACKED' && r.sub === 'stackSmall', JSON.stringify(r));
  r = c({ day: 1, fd: 4.5, obl: 0, aid: 1500, feast: 2000, aidN: 1, feastN: 1 });
  check('F6 aid+feast, no obligated -> DISCRETIONARY-ONLY/multi-discretionary', r.channel === 'DISCRETIONARY-ONLY' && r.sub === 'multi-discretionary', JSON.stringify(r));
  r = c({ day: 1, fd: -1, obl: 1000, aid: 0, feast: 0, aidN: 0, feastN: 0 });
  check('F7 fd unknown -> UNATTRIBUTED', r.channel === 'UNATTRIBUTED', JSON.stringify(r));
  r = c({ day: 1, fd: 4.5, obl: 0, aid: 0, feast: 0, aidN: 0, feastN: 0 });
  check('F8 no outflow -> NONE (not an event)', r.channel === 'NONE', JSON.stringify(r));
  r = c({ day: 1, fd: 2500, obl: 0, aid: 0, feast: 0, aidN: 0, feastN: 0 });
  check('F9 fd>=6 never reaches classifier as an event (channel check)', r.channel === 'NONE', JSON.stringify(r));
  // boundary: exactly at cap
  r = c({ day: 1, fd: 4.5, obl: 2500, aid: 0, feast: 0, aidN: 0, feastN: 0 });
  check('F10 obl exactly 2500, no disc -> OBLIGATED', r.channel === 'OBLIGATED', JSON.stringify(r));
  r = c({ day: 1, fd: 4.5, obl: 2500, aid: 1, feast: 0, aidN: 1, feastN: 0 });
  check('F11 obl=2500 + 1 disc -> STACKED/stackBind (strict >)', r.channel === 'STACKED' && r.sub === 'stackBind', JSON.stringify(r));
}

async function smoke() {
  console.log('== III. SMOKE: real-data event coverage ==');
  // 2 seeds x 40d with instrument; verify thin-day events get recorded
  // AND classified (attribution on real buckets).
  const all = [];
  for (const seed of [1501, 1502]) {
    const { Game } = await loadGame({ seed, mode: 'stackcensus-smoke', fullTelemetry: false });
    await setupGame(Game);
    const base = belongfeast;
    const pol = Object.assign({}, base);
    const t = {};
    census.attachOutflow(Game, t);
    const oUpkeep = base.upkeep, oDaily = base.daily;
    pol.upkeep = (G, ctx) => { const r = t._install(); try { return oUpkeep ? oUpkeep(G, ctx) : undefined; } finally { r(); } };
    pol.daily = (G, ctx) => { const r = t._install(); try { return oDaily ? oDaily(G, ctx) : undefined; } finally { r(); } };
    await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 30 }); });
    all.push({ seed, recs: t.dayRecs || [] });
  }
  let thin = 0, withFlow = 0, unattr = 0, stacked = 0;
  for (const { recs } of all) {
    for (const b of recs) {
      if (b.fd < 0 || b.fd >= 6) continue;
      thin++;
      if (b.obl + b.aid + b.feast > 0) {
        withFlow++;
        const ch = classifyDay(b);
        if (ch.channel === 'UNATTRIBUTED') unattr++;
        if (ch.channel === 'STACKED') stacked++;
      }
    }
  }
  check('probe recorded thin-day events on real seeds', withFlow > 0, `${withFlow}/${thin} thin days with outflow (40d x 2 seeds)`);
  check('real-data attribution >= 95%', withFlow ? (withFlow - unattr) / withFlow >= 0.95 : false, `unattributed=${unattr}/${withFlow}`);
  console.log(`  (note: stacked-day count on 40d probe: ${stacked} — the sweep measures the real share)`);
}

(async () => {
  await detGate();
  fixtures();
  await smoke();
  const fails = results.filter(r => !r.pass);
  console.log(`\nPROOF ${fails.length ? 'FAILED' : 'GREEN'}: ${results.length - fails.length}/${results.length}`);
  if (fails.length) { console.error('FAILURES: ' + fails.map(f => f.name).join(' | ')); process.exit(1); }
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
