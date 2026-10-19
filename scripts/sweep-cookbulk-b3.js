#!/usr/bin/env node
// scripts/sweep-cookbulk-b3.js — PILOT sweep for the batch-cook v2 trigger, round 3
// (arm sim-cookbulk-b, capacity-honest acceptance + survival-signal attribution).
//
// 8 fresh seeds x {leadfeast,belongfeast} x {control,b3}, 180d death-aware,
// FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT. In-sweep paired controls: identical seeds.
//
// Arms:
//   control — base policy, layer OFF (pins the ~0 baseline).
//   b3      — v2 trigger reconstruction (COOKBULK_B3=1): commons batch-cook,
//             any Haven day with a >= 1000 kcal cookable pool; no capacity lever.
//
// Pre-registered (binding, MEASUREMENT.md §§9-12, 14):
//   PRIMARY: mean cooked kcal per b3 side >= 20,000 (capacity-honest; v2
//     measured 23.6k, v2base 29.0k), control ~0.
//   CO-PRIMARY (survival attribution): median survival b3 >= control - 10d.
//     On a miss, attribute per-pair: dose-response of batch water draw vs
//     survival delta, water-rationed days armed vs control. The b2 run's
//     -46d signal is the mechanism under test (batch drains cistern ->
//     village mobilizes water hauls + half rations -> survival cost?).
//   GUARDRAILS: starvation deaths armed <= control+2 (per-pair collapse-aware);
//     no new death mode (dedup on (who,day,cause), kind person/villager);
//     national >= control-2; no laundering (cooked kcal must not exceed
//     gross x units — engine digestibility, verified per item in the layer);
//     det-gate byte-identical gate-off.
//   A miss is NO-GO, never re-scored mid-run.
// Wall metrics: win rate, vesting/national reach, Arc reach, wave reach 1-5,
// four-realm formation, median/max survival, death-cause shares.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-cookbulk-b3.js
// Targeted: SEEDS="94101" POLICIES="leadfeast" ARMS="b3" DAYS=60 OUT=...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const CB3 = require('./policies/cookbulk-b3');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [94101, 94102, 94103, 94104, 94105, 94106, 94107, 94108]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'b3']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-cookbulk-b3');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  if (arm === 'b3') process.env.COOKBULK_B3 = '1'; else delete process.env.COOKBULK_B3;
  const policy = arm === 'control' ? base : CB3.withCookBulkB3(base, `${policyId}+cookbulk-b3`, 'sweep');
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = { deaths: [], errors: 0, rationedDays: 0, cookDaysSeen: 0 };
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          const kind = data && data.kind;
          if (kind === 'person' || kind === 'villager' || data.player) {
            t.deaths.push({ day: gday(Game), who: data && (data.who || data.villagerId || data.name), cause, player: !!(data && data.player), cls: deathClass(cause) });
          }
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
  const oDaily = policy.daily;
  const ctxProbe = (ctx) => {
    try {
      const n = ctx._cb3CookDays || 0;
      if (n > t.cookDaysSeen) t.cookDaysSeen = n;
      t.cookedKcalTotal = ctx._cb3CookedKcal || 0;
      t.waterDrawnLTotal = ctx._cb3WaterDrawnL || 0;
    } catch (e) { t.errors++; }
  };
  policy.daily = (G, ctx) => {
    ctxProbe(ctx);
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (((G.state.scholar || {}).kcal || 99999) < 500) hist.starvedDays++;
      try { const v = G.state.village || {}; if (v.waterRationed) t.rationedDays++; } catch (e) {}
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { t.errors++; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    ctxProbe(ctx);
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const causeCounts = {}, clsCounts = {};
  const seen = new Set();
  const deaths = t.deaths.filter(d => {
    const k = `${d.who}|${d.day}|${d.cause}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  for (const d of deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  const out = {
    seed, policyId, arm, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays, rationedDays: t.rationedDays,
    starvationDeaths: deaths.filter(d => d.cls === 'STARVATION').length,
    playerStarvationDeaths: deaths.filter(d => d.cls === 'STARVATION' && d.player).length,
    playerDeaths: deaths.filter(d => d.player).length,
    causeCounts, clsCounts,
    cookDays: t.cookDaysSeen, cookedKcal: Math.round(t.cookedKcalTotal || 0),
    waterDrawnL: Math.round((t.waterDrawnLTotal || 0) * 10) / 10,
    errors: t.errors,
  };
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const summary = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      for (const arm of ARMS) {
        let out;
        try {
          out = await oneRun(seed, policyId, arm);
        } catch (e) {
          out = { seed, policyId, arm, error: String(e && e.message) };
        }
        const f = path.join(OUT, `${arm}-${policyId}-s${seed}.json`);
        fs.writeFileSync(f, JSON.stringify(out, null, 1));
        summary.push(out);
        console.log(`${arm} ${policyId} s${seed}: days=${out.days} end=${out.endReason} cooked=${out.cookedKcal || 0} ` +
          `waterL=${out.waterDrawnL || 0} rationed=${out.rationedDays || 0} starvD=${out.starvationDeaths} ${out.error ? 'ERROR ' + out.error : ''}`);
      }
    }
  }
  const agg = {};
  for (const arm of ARMS) {
    const rows = summary.filter(r => r.arm === arm && !r.error);
    const mean = (k) => rows.length ? rows.reduce((t, r) => t + (r[k] || 0), 0) / rows.length : 0;
    const med = (k) => { const v = rows.map(r => r[k] || 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; };
    agg[arm] = {
      n: rows.length,
      meanCookedKcal: Math.round(mean('cookedKcal')), meanCookDays: mean('cookDays').toFixed(1),
      meanWaterDrawnL: mean('waterDrawnL').toFixed(1), meanRationedDays: mean('rationedDays').toFixed(1),
      medianDays: med('days'), medianGameDays: med('gameDays'),
      national: rows.filter(r => r.national).length, table: rows.filter(r => r.table).length,
      wins: rows.filter(r => r.wins).length, wave4: rows.filter(r => r.wave4).length, wave5: rows.filter(r => r.wave5).length,
      starvationDeaths: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
      starvedDays: rows.reduce((t, r) => t + (r.starvedDays || 0), 0),
    };
  }
  console.log('\nAGGREGATE:', JSON.stringify(agg, null, 1));
  fs.writeFileSync(path.join(OUT, '..', 'sweep-cookbulk-b3-summary.json'), JSON.stringify({ seeds: SEEDS, policies: POLICIES, arms: ARMS, days: DAYS, agg }, null, 1));
})().catch(e => { console.error('SWEEP CRASHED', e); process.exit(2); });
