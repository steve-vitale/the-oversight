#!/usr/bin/env node
// scripts/measure-feastscav-20261015.js — sim-feastscav instrumented sweep
// (flesh-out loop B, 2026-10-15, food-economy #227).
//
// INSTRUMENT-ONLY: no policy change, no game-code change. The sweep runs
// the feast road vs its own pristine control on IDENTICAL seeds, with the
// feastscav instrument (scripts/feastscav-instrument-20261015.js)
// installed on both sides — every feast, draw, face/drive, combat, and
// death is logged and post-feast combat deaths are attributed to
// proximity windows.
//
// Sides (CONTROL BASELINE DRIFT #247 — own control, same sweep):
//   LEVER=fs-control: policies/leadcourt (named export), FEASTSCALE_R13
//     unset — 0 feasts by construction (isolation pinned in proof R2).
//   LEVER=fs-armed:   policies/feastscale leadfeast (named export),
//     FEASTSCALE_R13=1 — the feast road, draws faced unconditionally.
//
// Pre-registered (evidence/2026-10-15/sim-feastscav-b.md, §§9-12, 14):
//   PRIMARY (diagnostic): attribution coverage >= 0.80 of post-feast
//     combat-family deaths, AND the window-rate comparison must answer the
//     #227 harm-channel question.
//   DECISION RULE:
//     REAL  iff (a) draw-fought window combat-death rate >= 2x the
//           non-feast-day (baseline) rate, AND
//           (b) >= 50% of the armed-side excess combat deaths (armed minus
//           control, identical seeds) fall inside feast windows.
//     else NOT-ESTABLISHED -> design next: perturbation-aware guardrail
//     graduation (the scavenger-safe feast needs no harm to be safe from).
//   Horizon 180d death-aware (pacing-law max — the guardrail harm showed
//   as earlier death; the full road is needed for national + the tail).
//   Seeds 11/22/33/44/55/66/77/88 (8 seeds x 2 sides = 16 runs).
//   §14: a miss is NO-GO — never re-scored against a friendlier metric.
//
// Usage:
//   LEVER=fs-control SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=evidence/2026-10-15/fscav-control.json PERSEED_DIR=evidence/2026-10-15/perseed-fscav-control \
//     node scripts/measure-feastscav-20261015.js
//   FEASTSCALE_R13=1 LEVER=fs-armed ... (same) node scripts/measure-feastscav-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installFeastScav } = require('./feastscav-instrument-20261015');

const LEVER = process.env.LEVER || 'fs-control';
const ARMED = LEVER === 'fs-armed';
if (ARMED && process.env.FEASTSCALE_R13 !== '1') {
  console.error('MEASURE STOP: LEVER=fs-armed requires FEASTSCALE_R13=1 — without it the armed side would silently measure the feastless road.');
  process.exit(2);
}
if (!ARMED && process.env.FEASTSCALE_R13 === '1') {
  console.error('MEASURE STOP: LEVER=fs-control with FEASTSCALE_R13=1 — the control must be pristine.');
  process.exit(2);
}

const LC = require('./policies/leadcourt');
const FS = require('./policies/feastscale');
const POLICY = ARMED ? FS.leadfeast : LC.leadcourt; // named exports, unwrap-pinned

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || `evidence/2026-10-15/fscav-${LEVER}.json`;
const PERSEED_DIR = process.env.PERSEED_DIR || `evidence/2026-10-15/perseed-fscav-${LEVER}`;
if (!fs.existsSync(PERSEED_DIR)) fs.mkdirSync(PERSEED_DIR, { recursive: true });

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function deedSnapshot(Game) {
  const out = { sentimentTaught: false, feastSurgeUsed: false, seat: 'none', foodDeeds: false };
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.sentimentTaught = !!pg.sentimentTaught;
    const s = Game.state.scholar || {};
    out.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed);
    out.foodDeeds = out.sentimentTaught && out.feastSurgeUsed;
    if (typeof Game.tableSeat === 'function') {
      const seat = Game.tableSeat();
      out.seat = (seat && seat.seat) || 'none';
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feastscav-' + LEVER, fullTelemetry: true });
  await setupGame(Game);
  const inst = installFeastScav(Game);
  let runCtx = null;
  const policy = Object.assign({}, POLICY);
  const origSetup = POLICY.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everSeat: 'none' };
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      const ds = deedSnapshot(G);
      if (ds.seat && ds.seat !== 'none') { hist.everTable = true; hist.everSeat = ds.seat; }
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0);
      try { const pg = G.progState ? G.progState() : {}; hist.maxArc = Math.max(hist.maxArc, pg.arc || 1); } catch (e) {}
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });
  const rep = inst.report();
  inst.uninstall();
  // independent counters: policy ctx + telemetry death stream (honesty
  // cross-checks for the coverage gate).
  let fsFeasts = 0, fsArmedFeasts = 0;
  try { if (runCtx) { fsFeasts = runCtx.fsFeasts || 0; fsArmedFeasts = runCtx.fsArmedFeasts || 0; } } catch (e) {}
  let teleDeaths = 0;
  try {
    const tel = (Game.state || {}).telemetry || [];
    for (const t of tel) if (t && t.type === 'death') teleDeaths++;
  } catch (e) {}
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  let hungry = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const row = {
    lever: LEVER, policy: POLICY.id, seed, days: result.days, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    table: hist.everTable ? 1 : 0, everSeat: hist.everSeat, maxArc: hist.maxArc,
    won: Game.won ? 1 : 0, exiled, waveReach: result.maxWaveUnlocked || 1,
    deaths, starveDeaths, hungryDays: hungry,
    fsFeasts, fsArmedFeasts, teleDeaths,
    instFeasts: rep.feasts, instArmedFeasts: rep.armedFeasts, instDraws: rep.draws,
    instDrawNoFire: rep.drawNoFire, instFaced: rep.faced, instDriven: rep.driven,
    instCombats: rep.combats, instDeaths: rep.deaths,
    monsterKills: rep.monsterKills, chMonsterKills: rep.chMonsterKills,
    windows: rep.windows, chDays: rep.chDays, rates: rep.rates, chCombatStarts: rep.chCombatStarts,
    totalCombatDeaths: rep.totalCombatDeaths, postFeastCombatDeaths: rep.postFeastCombatDeaths,
    attributionCoverage: rep.attributionCoverage,
    deathRows: rep.deathRows,
  };
  const fp = path.join(PERSEED_DIR, `seed-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(row, null, 1));
  return row;
}

(async () => {
  console.log(`== feastscav sweep ${LEVER} (${ARMED ? 'leadfeast FEASTSCALE_R13=1' : 'leadcourt pristine'}) — ${SEEDS.length} seeds, ${DAYS}d ==`);
  const rows = [];
  for (const seed of SEEDS) {
    const r = await oneRun(seed, DAYS);
    rows.push(r);
    console.log(`   s${r.seed}: days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} seat=${r.everSeat} | feasts=${r.instFeasts}/${r.instArmedFeasts}(ctx ${r.fsFeasts}/${r.fsArmedFeasts}) draws=${r.instDraws}(faced ${r.instFaced}/driven ${r.instDriven}) combats=${r.instCombats} combatDeaths=${r.totalCombatDeaths}(postFeast ${r.postFeastCombatDeaths}, cov ${r.attributionCoverage.toFixed(2)}) teleDeaths=${r.teleDeaths}/inst ${r.instDeaths}`);
  }
  const sum = (f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const agg = {
    lever: LEVER, n: rows.length, days: DAYS,
    national: sum(r => r.national), table: sum(r => r.table), wins: sum(r => r.won), exiled: sum(r => r.exiled),
    w4: sum(r => r.waveReach >= 4 ? 1 : 0), w5: sum(r => r.waveReach >= 5 ? 1 : 0),
    maxWave: Math.max.apply(null, rows.map(r => r.waveReach).concat([1])),
    medianSurvival: med(rows.map(r => r.days)), maxSurvival: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    feasts: sum(r => r.instFeasts), armedFeasts: sum(r => r.instArmedFeasts),
    draws: sum(r => r.instDraws), faced: sum(r => r.instFaced), driven: sum(r => r.instDriven),
    combats: sum(r => r.instCombats), combatDeaths: sum(r => r.totalCombatDeaths),
    monsterKills: sum(r => r.monsterKills),
    postFeastCombatDeaths: sum(r => r.postFeastCombatDeaths),
    attributionCoverage: rows.length ? rows.reduce((t, r) => t + r.attributionCoverage, 0) / rows.length : 1,
    feastLogCoverage: rows.length ? rows.reduce((t, r) => t + (r.fsArmedFeasts > 0 ? r.instArmedFeasts / r.fsArmedFeasts : 1), 0) / rows.length : 1,
    deathLogCoverage: rows.length ? rows.reduce((t, r) => t + (r.teleDeaths > 0 ? Math.min(1, r.instDeaths / r.teleDeaths) : 1), 0) / rows.length : 1,
    rates: {}, chDays: {},
  };
  // aggregate per-channel rates across runs
  const chD = {}, chN = {};
  for (const r of rows) for (const ch of Object.keys(r.rates || {})) {
    chD[ch] = (chD[ch] || 0) + (r.rates[ch].deaths || 0);
    chN[ch] = (chN[ch] || 0) + (r.rates[ch].days || 0);
    agg.chDays[ch] = (agg.chDays[ch] || 0) + (r.chDays[ch] || 0);
  }
  for (const ch of Object.keys(chD)) agg.rates[ch] = { deaths: chD[ch], days: chN[ch], perDay: chN[ch] > 0 ? chD[ch] / chN[ch] : 0 };
  // baseline days: sum of per-run baseline days
  let bD = 0, bN = 0;
  for (const r of rows) { const b = (r.rates || {}).baseline || {}; bD += b.deaths || 0; bN += b.days || 0; }
  agg.rates.baseline = { deaths: bD, days: bN, perDay: bN > 0 ? bD / bN : 0 };
  agg.deaths = rows.reduce((t, r) => { for (const k of Object.keys(r.deaths || {})) t[k] = (t[k] || 0) + r.deaths[k]; return t; }, {});
  fs.writeFileSync(OUT, JSON.stringify({ agg, rows: rows.map(r => Object.assign({}, r, { deathRows: undefined })) }, null, 1));
  console.log(`\nWROTE ${OUT} (+ ${PERSEED_DIR}/seed-*.json)`);
  console.log(JSON.stringify(agg, (k, v) => k === 'deaths' ? v : v, 1).slice(0, 2000));
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
