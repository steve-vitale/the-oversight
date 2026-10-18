#!/usr/bin/env node
// scripts/sweep-cookbulk-b2.js — PILOT sweep for the batch-cook CAPACITY lever (arm sim-cookbulk-b2).
//
// 4 fresh seeds x {leadfeast,belongfeast} x {control,v2base,b2}, 180d death-aware,
// FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT. In-sweep paired controls: identical seeds.
//
// Arms:
//   control — base policy, layer OFF (pins the 0 baseline).
//   v2base  — v2 trigger alone {hearthFirst:false, boilRisky:false} (diagnostic:
//             isolates the capacity lever's contribution over the trigger).
//   b2      — v2 trigger + capacity lever {hearthFirst:true, boilRisky:true}.
//
// Pre-registered (binding, MEASUREMENT.md §§9-12, 14):
//   PRIMARY: mean cooked kcal per b2 side >= 25,000 with control 0.
//   GO threshold: b2 mean >= 25k across the 8 pilot sides, guardrails met.
//   GUARDRAILS: starvation deaths b2 <= control (paired); median survival
//     paired delta within +/-10d; no new death mode (dedup on (who,day,cause),
//     filter kind to person/villager); national >= control-2; no laundering;
//     det-gate byte-identical gate-off.
//   A miss is NO-GO, never re-scored mid-run.
// Wall metrics: win rate, vesting/national reach, Arc reach, wave reach 1-5,
// four-realm formation, median/max survival, death-cause shares.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-cookbulk-b2.js
// Targeted: SEEDS="9292" POLICIES="leadfeast" ARMS="b2" DAYS=60 OUT=...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const CB2 = require('./policies/cookbulk-b2');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9292, 9293, 9294, 9295]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'v2base', 'b2']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-cookbulk-b2');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const ARM_OPTS = {
  v2base: { hearthFirst: false, boilRisky: false },
  b2: { hearthFirst: true, boilRisky: true },
};

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = arm === 'control' ? base : CB2.withCookBulkB2(base, `${policyId}+cookbulk-b2-${arm}`, 'sweep', ARM_OPTS[arm]);
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = { deaths: [], errors: 0, cookLog: [] };
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          // DEDUP: the death tele re-emits; filter kind to person/villager.
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
  const noteCook = (G, ctx) => {
    try {
      const n = ctx._cbCookDays || 0;
      if (n > (t._seenCookDays || 0)) {
        t._seenCookDays = n;
        t.cookLog.push({ day: gday(G), cumCookedKcal: ctx._cbCookedKcal || 0,
          cumHearthBoiledL: ctx._cbHearthBoiledL || 0, cumBoilRiskyL: ctx._cbBoilRiskyL || 0 });
      }
      t.cookedKcalTotal = ctx._cbCookedKcal || 0;
      t.unlockedKcalTotal = ctx._cbUnlockedKcal || 0;
      t.hearthBoiledLTotal = ctx._cbHearthBoiledL || 0;
      t.boilRiskyLTotal = ctx._cbBoilRiskyL || 0;
    } catch (e) { t.errors++; }
  };
  policy.daily = (G, ctx) => {
    noteCook(G, ctx);
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (((G.state.scholar || {}).kcal || 99999) < 500) hist.starvedDays++;
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
    noteCook(G, ctx);
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const causeCounts = {}, clsCounts = {};
  // dedup on (who,day,cause): the tele re-emits.
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
    seed, policyId, arm, days: result.days, gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    starvationDeaths: deaths.filter(d => d.cls === 'STARVATION').length,
    playerStarvationDeaths: deaths.filter(d => d.cls === 'STARVATION' && d.player).length,
    playerDeaths: deaths.filter(d => d.player).length,
    causeCounts, clsCounts,
    cookDays: t.cookLog.length, cookedKcal: t.cookedKcalTotal || 0,
    unlockedKcal: t.unlockedKcalTotal || 0,
    hearthBoiledL: t.hearthBoiledLTotal || 0, boilRiskyL: t.boilRiskyLTotal || 0,
    cookLog: t.cookLog,
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} cook=${out.cookDays}/${out.cookedKcal} hearth=${out.hearthBoiledL}L risky=${out.boilRiskyL}L starvD=${out.starvationDeaths} nat=${out.national} wave=${waveMax} err=${t.errors}`);
  return out;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required EXPLICITLY.'); process.exit(2); }
  const all = [];
  for (const seed of SEEDS) {
    for (const p of POLICIES) {
      for (const a of ARMS) {
        if (a === 'control') delete process.env.COOKBULK_B2; else process.env.COOKBULK_B2 = '1';
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.COOKBULK_B2;
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
