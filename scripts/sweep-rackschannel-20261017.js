#!/usr/bin/env node
// scripts/sweep-rackschannel-20261017.js — racks-channel pilot sweep
// (sim-rackschannel-b, 2026-10-17, food-economy axis).
//
// control: leadfeast / belongfeast (the FEASTSCALE_R13=1 substrate, no layer)
// armed:   rackslead / racksbelong (RACKSCHAN=1 — scholar's nightly share draws
//          preserved-first when the racks-channel is open)
//
// 8 FRESH seeds 4601-4608 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds both sides. Own control in the
// SAME sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Banned-seed check: SWEEP STOPS if any seed is banned
// (coordinator ranges: 4201-4208, 4301-4308, 4401-4408, 4501-4508).
//
// Pre-registered GO (binding, MEASUREMENT §§9-12, 14 — see
// evidence/2026-10-17/sim-rackschannel-b.md):
//   PRIMARY: waste-rate (wasterate instrument: pantryRotKcal /
//     (pantryStartKcal + pantryInKcal)) armed <= 0.85x control.
//   COVERAGE GATE (mechanism attribution): armed smokeKcal - control
//     smokeKcal >= 0.5 x armed scholarMeal preserved kcal. A waste-rate win
//     without the smoke delta is NO-COVERAGE, not a GO.
//   MECHANISM-ENGAGEMENT (vacuous-pass protection): rcFires >= 20
//     armed-side; armed scholarMeal preserved > control.
//   GUARDRAILS: starvation deaths armed <= control; median survival >=
//     control-10d; national >= control-2/16; no new death mode; no laundering
//     (spoiled never smoked — proof G7 pins it).
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-rackschannel-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-rackschannel-20261017.js
// Targeted re-runs: SEEDS="4601,4602" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
let RC = null;
try { RC = require('./policies/rackschannel'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: rackschannel layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const WR = require('./wasterate-instrument-20261017');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

// ---- banned-seed check (coordinator's ranges; sweep stops on any hit) ----
const BANNED_RANGES = [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508]];
const SEEDS = (process.env.SEEDS || '4601,4602,4603,4604,4605,4606,4607,4608').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED_RANGES.some(([a, b]) => s >= a && s <= b)) { console.error(`SWEEP STOP: seed ${s} is banned/used.`); process.exit(2); }
}
console.log(`seeds: ${SEEDS.join(',')} (banned-check clean)`);

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-rackschannel-sweep');
try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}

function gday(G) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function alivePop(G) { try { return ((G.state.village || {}).roster || []).filter(id => { try { const p = G.getPerson(id); return p && !p.dead; } catch (e) { return true; } }).length; } catch (e) { return 0; } }

function bucket(it) {
  if (!it || (it.kcalEach || 0) <= 0) return 'other';
  const fs = it.foodState || '';
  if (fs === 'preserved' || fs === 'rendered') return 'pres';
  return 'fresh';
}

// scholar-meal attribution (lean): the scholar's own nightly villageMeal share,
// split from the villagers' fresh-first draws. Pure read + call-through.
function attachScholarMeal(Game, t) {
  t.scholarMeal = { pres: 0, fresh: 0, total: 0 };
  const oMeal = Game.villageMeal ? Game.villageMeal.bind(Game) : null;
  const oDraw = Game.pantryDraw ? Game.pantryDraw.bind(Game) : null;
  if (oMeal) {
    Game.villageMeal = function () {
      t._sm = true;
      try { return oMeal.apply(this, arguments); }
      finally { t._sm = false; }
    };
  }
  if (oDraw) {
    Game.pantryDraw = function (v, want, opts) {
      const out = oDraw.apply(this, arguments);
      try {
        if (t._sm) {
          for (const e of (out.items || [])) {
            const b = bucket(e.item);
            const k = Math.round((e.effectiveKcal || 0) * (e.units || 1));
            if (b === 'pres') t.scholarMeal.pres += k; else t.scholarMeal.fresh += k;
            t.scholarMeal.total += k;
          }
        }
      } catch (e) {}
      return out;
    };
  }
}

// smoke + racks-full beats (the cook's own voice)
function attachCookBeats(Game, t) {
  t.smokeKcal = 0; t.smokeBatches = 0; t.bindDays = 0;
  const oSay = Game.say ? Game.say.bind(Game) : null;
  const oSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  const push = (msg) => {
    try {
      const m = String(msg || '');
      if (/worked the smoke racks/i.test(m)) {
        t.smokeBatches++;
        const kk = m.match(/\(~([\d,]+) kcal/);
        if (kk) t.smokeKcal += parseInt(kk[1].replace(/,/g, ''), 10);
      } else if (/racks are already full/i.test(m)) {
        t.bindDays++;
      }
    } catch (e) {}
  };
  Game.say = function (msg) { push(msg); return oSay ? oSay.apply(this, arguments) : msg; };
  if (oSys) Game.sysSay = function (msg) { push(msg); return oSys.apply(this, arguments); };
}

function policyFor(policyId, side) {
  const armed = side === 'armed';
  if (policyId === 'leadfeast') return armed ? RC.rackslead : leadfeast;
  return armed ? RC.racksbelong : belongfeast;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('rackschannel layer loads', !!RC.rackslead && !!RC.racksbelong, `ids=${RC.rackslead.id},${RC.racksbelong.id}`);
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.RACKSCHAN = '1'; else delete process.env.RACKSCHAN;
    const { Game } = await loadGame({ seed: 4601, mode: `rackschannel-smoke-${side}` });
    await setupGame(Game);
    const base = policyFor('belongfeast', side);
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    const wantId = side === 'armed' ? 'racksbelong' : 'belongfeast';
    const r = await quietLog(async () => runDays(Game, pol, { days: 20, sampleEvery: 20 }));
    // control = the bare base policy (no layer wraps at all); armed = wrapped
    const live = side === 'armed'
      ? (base.id === wantId && !!runCtx && Game.__rackschannel === true)
      : (base.id === wantId && !!runCtx && Game.__rackschannel !== true);
    check(`${side}: layer-live markers honest`, !!live, `id=${base.id} wrapped=${Game.__rackschannel === true}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.RACKSCHAN;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.RACKSCHAN = '1'; else delete process.env.RACKSCHAN;
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 4601, mode: `rackschannel-det-${side}` });
      await setupGame(Game);
      const base = policyFor('leadfeast', side);
      const hashes = [];
      const pol = Object.assign({}, base);
      const oDaily = base.daily;
      pol.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 1 }); });
      runs.push(hashes);
    }
    const same = runs[0].length === runs[1].length && runs[0].every((h, i) => h === runs[1][i]);
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (${side}): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  delete process.env.RACKSCHAN;
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.RACKSCHAN = '1'; else delete process.env.RACKSCHAN;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `rackschannel-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, maxArc: 1, maxWave: 1, survivals: [] };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  const wt = {};
  WR.attachWasteRate(Game, wt);
  WR.snapshotStart(Game, wt);
  const sm = {};
  attachScholarMeal(Game, sm);
  const cb = {};
  attachCookBeats(Game, cb);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  const cons = WR.conservation(Game, wt);
  const out = {
    seed, policy: policyId, side,
    gameDays: result && result.days, endReason: result && (result.endReason || result.ended),
    wasteRate: +WR.wasteRate(wt).toFixed(5),
    wrIn: Math.round(wt.pantryInKcal || 0), wrRot: Math.round((wt.pantryRotKcal || 0) + (wt.desperationRotKcal || 0)),
    wrResidualRel: +(cons.rel || 0).toFixed(4),
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0, wins: 0,
    exiled: hist.exiled ? 1 : 0,
    arc: hist.maxArc, maxWave: hist.maxWave,
    starvation: 0, dehydration: 0, deathModes: {},
    scholarMealPres: Math.round(sm.scholarMeal.pres || 0),
    scholarMealFresh: Math.round(sm.scholarMeal.fresh || 0),
    smokeKcal: Math.round(cb.smokeKcal || 0), smokeBatches: cb.smokeBatches || 0,
    bindDays: cb.bindDays || 0,
    rcFires: (runCtx && runCtx.rcFires) || 0,
    rcPresKcal: Math.round((runCtx && runCtx.rcPresKcal) || 0),
  };
  try {
    for (const d of (inst.deaths || [])) {
      const c = String(d.class || d.cause || '');
      out.deathModes[c] = (out.deathModes[c] || 0) + 1;
      if (/STARVATION/i.test(c)) out.starvation++;
      if (/DEHYDRATION|WATER/i.test(c)) out.dehydration++;
    }
  } catch (e) {}
  const fp = path.join(OUTDIR, `${side}-${policyId}-s${seed}.json`);
  try { fs.writeFileSync(fp, JSON.stringify(out, null, 1)); } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} wr=${out.wasteRate} starv=${out.starvation} nat=${out.national} wave=${out.maxWave} smPres=${Math.round(out.scholarMealPres / 1000)}k smoke=${Math.round(out.smokeKcal / 1000)}k bind=${out.bindDays} rcFires=${out.rcFires} rcPres=${Math.round(out.rcPresKcal / 1000)}k resid=${out.wrResidualRel}`);
  delete process.env.RACKSCHAN;
  return out;
}

(async () => {
  if (process.env.SMOKE === '1') { await smokeGate(); await detGate(); return; }
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(';').map(s => s.trim()).filter(Boolean)) : null;
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of ['belongfeast', 'leadfeast']) {
      for (const side of ['control', 'armed']) {
        if (only && !only.has(`${policyId},${side}`)) continue;
        try { results.push(await oneRun(seed, policyId, side)); }
        catch (e) { console.log(`  [${side} ${policyId} s${seed}] ERROR ${String(e && e.message).slice(0, 140)}`); }
      }
    }
  }
  // ---- summary vs pre-registered GO ----
  const C = results.filter(r => r.side === 'control'), A = results.filter(r => r.side === 'armed');
  const mean = (rs, k) => rs.length ? rs.reduce((s, r) => s + (r[k] || 0), 0) / rs.length : 0;
  const med = (rs, k) => { const v = rs.map(r => r[k] || 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; };
  const wrC = mean(C, 'wasteRate'), wrA = mean(A, 'wasteRate');
  const smokeC = C.reduce((s, r) => s + r.smokeKcal, 0), smokeA = A.reduce((s, r) => s + r.smokeKcal, 0);
  const smPresA = A.reduce((s, r) => s + r.scholarMealPres, 0);
  const smPresC = C.reduce((s, r) => s + r.scholarMealPres, 0);
  const starvC = C.reduce((s, r) => s + r.starvation, 0), starvA = A.reduce((s, r) => s + r.starvation, 0);
  const natC = C.reduce((s, r) => s + r.national, 0), natA = A.reduce((s, r) => s + r.national, 0);
  console.log('---- pre-registered verdict ----');
  console.log(`PRIMARY waste-rate: control=${wrC.toFixed(5)} armed=${wrA.toFixed(5)} ratio=${wrC > 0 ? (wrA / wrC).toFixed(3) : 'n/a'} (GO <= 0.85)`);
  console.log(`COVERAGE smoke delta: armed-control=${Math.round((smokeA - smokeC) / 1000)}k floor=0.5x armed scholarMealPres=${Math.round(smPresA * 0.5 / 1000)}k (GO: delta >= floor)`);
  console.log(`ENGAGEMENT: rcFires armed=${A.reduce((s, r) => s + r.rcFires, 0)} (GO >= 20); scholarMealPres armed=${Math.round(smPresA / 1000)}k vs control=${Math.round(smPresC / 1000)}k`);
  console.log(`GUARDRAILS: starvation ${starvA} vs ${starvC} (<= control); national ${natA}/16 vs ${natC}/16 (>= control-2); median survival armed=${med(A, 'gameDays')}d vs control=${med(C, 'gameDays')}d (>= control-10d)`);
  const modes = {};
  for (const r of results) for (const [m, n] of Object.entries(r.deathModes || {})) modes[m] = (modes[m] || 0) + n;
  console.log(`death modes: ${JSON.stringify(modes)}`);
  console.log(`sweep complete: ${results.length} runs`);
})();
