#!/usr/bin/env node
// scripts/sweep-mergereval-20261017.js — sim-mergereval-b lever sweep (#455).
//
// Merge-gate fix vs legacy (MERGEREVAL=0), identical seeds. Per-run
// instrument: every stockSurplus call measures mergeReval =
// storedPhys*(1 - 200/targetKe) where targetKe is the kcalEach of the stack
// the legacy name+spoilDay find would merge into. This is the phantom kcal
// the merge minted (positive) or destroyed (negative) — the #455 blank.
// stored is measured as before/after pantryKcal() (physical truth).
// The fix must hold mergeReval == 0 on every call of every armed run.
//
// PRE-REGISTRATION (evidence/2026-10-17/sim-mergereval-b.md, binding):
//   PRIMARY: windfall == 0 on ALL 16 armed runs.
//   BLANK-EXISTENCE: median control windfall >= <pool-calibrated threshold>
//     (probed before the registered sweep).
//   Guardrails: national >= control-2; median survival >= control-10d;
//     starvation <= control+2; no new death-cause mode on armed;
//     legacy-gate MERGEREVAL=0 reproduces the pristine merge behavior.
//   Design: 180d death-aware (+10d tail), seeds 4601-4608 x
//     {leadfeast,belongfeast} x {control,armed} = 32 runs,
//     FEASTSCALE_R13=1, SEATDRIVE=0, own paired control.
//   Det-gate note: the fix legitimately changes kcal totals where phantom
//     food was created, so byte-identical trajectories are the WRONG bar.
//     Assert conservation 0.00% + zero instrument errors instead (proof
//     script + this sweep's mismatchLog).
//
// Usage (4 parallel processes):
//   FEASTSCALE_R13=1 SEATDRIVE=0 SIDE=control POLICIES=belongfeast node scripts/sweep-mergereval-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 SIDE=armed   POLICIES=belongfeast node scripts/sweep-mergereval-20261017.js
//   ... POLICIES=leadfeast ...
// Targeted: SEEDS="4601,4602" SIDE=control POLICIES=leadfeast PROBE_DAYS=40
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4601, 4602, 4603, 4604, 4605, 4606, 4607, 4608]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['belongfeast', 'leadfeast']);
const DAYS = process.env.PROBE_DAYS ? parseInt(process.env.PROBE_DAYS, 10) : 180;
const SIDE = process.env.SIDE || 'control'; // control | armed
const ARMED = SIDE === 'armed';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-mergereval', SIDE);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };

// Merge-revaluation instrument. The blank is physical-vs-NOMINAL, not
// physical-vs-return: capdoor's kcal-honest return makes r == storedPhys on
// BOTH paths, so recorded=r is blind by construction (proven in metric
// review). Instead we measure mergeReval = storedPhys*(1 - 200/targetKe)
// against the merge target the LEGACY find (name+spoilDay) would merge into.
//   - control (legacy): the legacy find IS the actual target -> mergeReval
//     is the revaluation PERFORMED (the #455 blank).
//   - armed (fixed): the merge only joins a 200-stack (or a fresh stack),
//     so mergeReval vs the legacy target is the revaluation AVOIDED
//     (counterfactual, informational). The binding armed metric is
//     conservation: |storedPhys - r| == 0 on every call (the return claims
//     exactly what physics did).
function attachMergerEval(Game, t) {
  t.calls = 0; t.windfall = 0; t.evap = 0; t.mismatches = 0; t.revalHits = 0;
  t.consViol = 0; t.consHits = 0;
  const oSur = Game.stockSurplus.bind(Game);
  Game.stockSurplus = function (v, give) {
    let targetKe = 200, targetKeErr = null;
    try {
      const freshDay = v.day + 3;
      const tgt = (v.pantry || []).find(p => p.name === 'Foraged food' && p.spoilDay === freshDay);
      if (tgt) targetKe = (tgt.kcalEach == null ? 200 : Number(tgt.kcalEach)) || 200;
    } catch (e) { targetKeErr = String(e && e.message || e); }
    let before = 0, after = 0, r, beforeErr = null, afterErr = null;
    try { before = Game.pantryKcal(); } catch (e) { beforeErr = String(e && e.message || e); }
    try { r = oSur(v, give); } finally { try { after = Game.pantryKcal(); } catch (e) { afterErr = String(e && e.message || e); } }
    try {
      const storedPhys = after - before;
      const mergeReval = storedPhys * (1 - 200 / targetKe);
      const consD = storedPhys - Math.round(r || 0);
      t.calls++;
      if (mergeReval > 0) t.windfall += mergeReval; else t.evap -= mergeReval;
      if (mergeReval !== 0) {
        t.revalHits++;
        if (t.mismatches < 10) {
          t.mismatches++;
          (t.mismatchLog = t.mismatchLog || []).push({ give: Math.round(give), r, storedPhys: Math.round(storedPhys), targetKe, mergeReval: Math.round(mergeReval), before, after, beforeErr, afterErr, targetKeErr });
        }
      }
      if (consD !== 0) {
        t.consViol += Math.abs(consD);
        t.consHits++;
        if (t.consHits <= 10) (t.consLog = t.consLog || []).push({ give: Math.round(give), r, storedPhys: Math.round(storedPhys), consD });
      }
    } catch (e) {}
    return r;
  };
  t._restore = () => { Game.stockSurplus = oSur; };
}

function alivePop(Game) {
  try {
    const v = Game.state.village || {};
    const health = v.health || {};
    let n = 0;
    for (const id of (v.roster || [])) {
      const h = health[id];
      if ((h == null ? 100 : h) > 0) n++;
    }
    return n;
  } catch (e) {} return 0;
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'mergereval-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const flow = {};
  attachMergerEval(Game, flow);
  const oDaily = base.daily, oUpkeep = base.upkeep;
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxVests: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const deaths = {};
  const liveDeaths = [];
  const oTele = Game.tele ? Game.tele.bind(Game) : null;
  Game.tele = function (type, data) {
    const r = oTele ? oTele.apply(this, arguments) : undefined;
    try {
      if (type === 'death') liveDeaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause });
    } catch (e) {}
    return r;
  };
  policy.upkeep = (G, ctx) => {
    let r;
    try { r = oUpkeep ? oUpkeep(G, ctx) : undefined; } catch (e) {}
    return r;
  };
  policy.daily = (G, ctx) => {
    let r;
    try {
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
        if ((G.state.scholar || {}).exiled) hist.exiled = true;
        if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
        try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
        try {
          const pol2 = G._havenPolity ? G._havenPolity() : null;
          const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
          if (fires > hist.maxFires) hist.maxFires = fires;
        } catch (e) {}
        try {
          const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
          if (w > waveHist.dailyMax) {
            waveHist.dailyMax = w;
            if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
            if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
          }
        } catch (e) {}
        try {
          let nv = 0;
          const VEST_IDS = ['military_vest', 'swat_vest'];
          for (const it of ((G.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) nv += (it.units || 1);
          for (const vv of Object.values((G.state.scholar || {}).equipped || {})) if (vv && VEST_IDS.includes(vv.id)) nv++;
          if (nv > hist.maxVests) hist.maxVests = nv;
        } catch (e) {}
      } catch (e) {}
      if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    } catch (e) {}
    return r;
  };
  let result;
  const t0 = Date.now();
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const ms = Date.now() - t0;
  try { flow._restore(); } catch (e) {}
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  for (const d of liveDeaths) { const k = String(d.cause || d.kind || 'unknown'); deaths[k] = (deaths[k] || 0) + 1; }
  const out = {
    seed, policyId, side: SIDE,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason, ms,
    deaths, starvedDays: hist.starvedDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    maxVests: hist.maxVests,
    exiled: hist.exiled ? 1 : 0,
    // merge-revaluation instrument
    surplusCalls: flow.calls,
    revalHits: flow.revalHits,
    windfall: Math.round(flow.windfall),   // control: reval PERFORMED; armed: reval AVOIDED (counterfactual)
    evap: Math.round(flow.evap),
    consViol: Math.round(flow.consViol),   // |storedPhys - r| != 0 (must be 0)
    consHits: flow.consHits,
    consLog: flow.consLog || [],
    mismatches: flow.mismatches, mismatchLog: flow.mismatchLog || [],
    liveDeaths,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${SIDE} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} reval=${out.windfall}+${out.evap} consViol=${out.consViol}(${out.consHits}) calls=${out.surplusCalls} nat=${out.national} wave=${out.maxWave} ms=${ms}`);
  return out;
}

// lib-guard: proof scripts require() with MERGEREVALSWEEP_LIB=1.
if (process.env.MERGEREVALSWEEP_LIB === '1') {
  module.exports = { attachMergerEval };
} else {
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (substrate).'); process.exit(2); }
if (SIDE !== 'control' && SIDE !== 'armed') { console.error('SWEEP STOP: SIDE=control|armed required.'); process.exit(2); }
if (ARMED) delete process.env.MERGEREVAL; else process.env.MERGEREVAL = '0';
(async () => {
  console.log(`== sweep-mergereval ${SIDE} x [${POLICIES.join(',')}] x [${SEEDS.join(',')}] ${DAYS}d ==`);
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      try { await oneRun(seed, pid); }
      catch (e) { console.log(`  [${SIDE} ${pid} s${seed}] THREW: ${(e && e.message) || e}`); }
    }
  }
  console.log('== done ==');
})();
}
