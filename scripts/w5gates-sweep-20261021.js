#!/usr/bin/env node
// w5gates-sweep-20261021.js — wave-5 unlock GATE DECOMPOSITION sweep
// (flesh-out loop arm sim-w5gates, run fleshout-20261021T0146Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The instrument wraps the policy daily with PURE engine reads
// (gateVector/dailyGateTrace from ./w5gates-lib) — the DET gate pins
// instrument-on vs instrument-off byte-identical trajectories.
//
// SUBSTRATE (the brief's exact env):
//   policy = withVillagerGear over the feastscale leadfeast/belongfeast
//   bases (scripts/policies/villagergear.js exports vgearLead/vgearBelong)
//   Env: VGEAR=1 FEASTSCALE_R13=1, SEATDRIVE unset (seatdrive is not in this
//   stack — unset means inert, not default-on), VETSHAPE unset (the gate's
//   veteran counting line must be the pristine living-veterans one).
//
// PRE-REGISTRATION: primary = attribution completeness, 16/16 runs'
// wave-5 unlock outcomes fully attributed to gate states. See
// evidence/2026-10-21/sim-w5gates.md.
//
// Usage:
//   VGEAR=1 FEASTSCALE_R13=1 node scripts/w5gates-sweep-20261021.js
//   SMOKE=1 ...       # short smoke: both policies drive, gates record live
//   DET=1 ...         # det-gate: instrument-on vs instrument-off byte-identical (paired seeds, 60d)
//   FIDELITY=1 ...    # fidelity: re-run completed sweep seeds, byte-identical per-seed JSON (minus hashes)
//   ONLY=leadfeast ...# policy filter
//   SEEDS="64401,64402" DAYS=60 ...
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { gateVector, dailyGateTrace } = require('./w5gates-lib');
const VG = require('./policies/villagergear');

// SUBSTRATE GUARD — the brief's exact env. FAIL LOUD otherwise.
if (process.env.VGEAR !== '1') { console.error('SWEEP STOP: VGEAR=1 is required (this is the vgear substrate).'); process.exit(2); }
if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required.'); process.exit(2); }
if (process.env.SEATDRIVE != null) { console.error('SWEEP STOP: SEATDRIVE must be UNSET on this substrate (not 0, not 1).'); process.exit(2); }
if (process.env.VETSHAPE != null) { console.error('SWEEP STOP: VETSHAPE must be UNSET (pristine living-veterans gate).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64401, 64402, 64403, 64404, 64405, 64406, 64407, 64408]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(REPO, 'evidence', '2026-10-21', 'perseed-w5gates');
const isBare = () => process.env.W5GATES_BARE === '1';

function baseFor(policyId) { return policyId === 'leadfeast' ? VG.vgearLead : VG.vgearBelong; }
function gday(G) { try { return (((G.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; } }

// The System's hold/release lines — where the fiction voices a gate state.
// SENSE-TESTING: the analyzer compares these against the instrument's gate
// states. Call-through: trajectory-neutral (array appends only).
const GATE_LINE_RE = /fifth draft|the next act|talent has been released/i;
function installSayCapture(G) {
  const lines = [];
  try {
    const osay = G.say.bind(G);
    G.say = function (x) {
      try { const s = String(x); if (GATE_LINE_RE.test(s)) lines.push({ d: gday(G), text: s.slice(0, 500) }); } catch (e) {}
      return osay.apply(this, arguments);
    };
  } catch (e) {}
  return lines;
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = baseFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'w5gates', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  const trace = [];
  const hashes = [];
  let sayLines = null;
  if (!isBare()) sayLines = installSayCapture(Game);
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const waveDays = { 2: null, 3: null, 4: null, 5: null };
  let maxVet5 = 0, maxRaw = 0, maxCapped = 0;
  let everVetLegMet = false;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      if (!isBare()) {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
        if ((G.state.scholar || {}).exiled) hist.exiled = true;
        const t = dailyGateTrace(G);
        trace.push(t);
        if (t.raw > maxRaw) maxRaw = t.raw;
        if (t.capped > maxCapped) maxCapped = t.capped;
        if (t.r5 && t.r5.veterans > maxVet5) maxVet5 = t.r5.veterans;
        if (t.r5 && t.r5.veterans >= 2) everVetLegMet = true;
        const uw = t.uw | 0;
        for (const w of [2, 3, 4, 5]) if (waveDays[w] == null && uw >= w) waveDays[w] = t.d;
      }
      // Hashes ALWAYS recorded (bare and live) at the same point.
      hashes.push(G.state.scholar.day + ':' + dayHash(Game));
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
    }
  } catch (e) {}
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  // Full end-of-run gate vector (the decomposition the arm is about).
  let end = null;
  try { end = gateVector(Game); } catch (e) { end = { error: String((e && e.message) || e) }; }
  let maxWave = 1;
  try { maxWave = Math.max(result.maxWaveUnlocked || 1, (end && end.uw) || 1); } catch (e) {}
  for (const w of [2, 3, 4, 5]) if (waveDays[w] == null && maxWave >= w) waveDays[w] = gameDays;
  const out = {
    seed, policyId, substrate: 'vgear-feastscale(VGEAR=1,FEASTSCALE_R13=1,seatdrive-unset)',
    days: result.days, gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths, deathList,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave2Day: waveDays[2], wave3Day: waveDays[3], wave4Day: waveDays[4], wave5Day: waveDays[5],
    maxRaw, maxCapped, maxVet5, everVetLegMet,
    sayLines: sayLines || [],
    end, trace, hashes,
  };
  if (process.env.W5GATES_NOWRITE !== '1' && !opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64401, 64402]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '60';
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of dseeds) {
        delete process.env.W5GATES_BARE;
        const live = await runOne(seed, policyId, { noWrite: true });
        process.env.W5GATES_BARE = '1';
        const bareR = await runOne(seed, policyId, { noWrite: true });
        delete process.env.W5GATES_BARE;
        n++;
        const lh = JSON.stringify(live.hashes), bh = JSON.stringify(bareR.hashes);
        const ok = lh === bh && live.hashes.length > 0;
        console.log(`DET ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'} (${live.hashes.length} days)`);
        if (!ok) bad++;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    if (bad) { console.error(`DET FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`DET GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : SEEDS.slice(0, 2)).filter(Number.isFinite);
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of fseeds) {
        const fp = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { console.log(`FIDELITY SKIP ${policyId}/s${seed}: no sweep JSON`); continue; }
        const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const re = await runOne(seed, policyId, { noWrite: true });
        n++;
        const strip = (o) => { const c = Object.assign({}, o); delete c.hashes; return JSON.stringify(c); };
        const ok = strip(orig) === strip(re);
        console.log(`FIDELITY ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'}`);
        if (!ok) bad++;
      }
    }
    if (!n) { console.error('FIDELITY: nothing to compare.'); process.exit(2); }
    if (bad) { console.error(`FIDELITY FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`FIDELITY GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.SMOKE === '1') {
    const sseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64401]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '10';
    for (const policyId of POLICIES) {
      for (const seed of sseeds) {
        const r = await runOne(seed, policyId, { noWrite: true });
        const e = r.end || {};
        const a = e.attr || {};
        console.log(`SMOKE ${policyId}/s${seed}: days=${r.gameDays} end=${r.endReason} trace=${r.trace.length} ` +
          `uw=${e.uw} raw=${e.raw} capped=${e.capped} gated=${e.gated} w4faced=${e.w4faced} ` +
          `outcome=${a.outcome} attributed=${a.attributed} binding=${a.binding} sayLines=${(r.sayLines || []).length}`);
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log('SMOKE GREEN.');
    return;
  }
  console.log(`w5gates sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${daysNow()}`);
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await runOne(seed, policyId);
      const a = (r.end && r.end.attr) || {};
      console.log(`done ${policyId}/s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} ` +
        `outcome=${a.outcome} attributed=${a.attributed} binding=${a.binding} vetLeg=${r.everVetLegMet} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  console.log('SWEEP COMPLETE.');
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}

module.exports = { runOne, gateVector, dailyGateTrace, baseFor, SEEDS };
