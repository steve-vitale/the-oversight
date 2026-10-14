#!/usr/bin/env node
// sweep-mealonly-20261014.js — mealonly pilot: before/after on identical seeds.
// 8 seeds (11/22/33/44/55/66/77/88) x belongseek/leadcourt x control/armed,
// 180d death-aware, both sides on current tip (det-gate 32/32 required first).
//
// Pre-registered header (docs/MEASUREMENT.md §§9-12, 14):
//   PRIMARY: half-ration scholar-day share armed <= 50% of control
//     (suite share per policy = sum(halfRationDays)/sum(days)).
//   GUARDRAILS: median survival >= control-10d; national >= control-2;
//     starvation deaths <= control+2; exiled unchanged.
//     takesEnd documented per-vid AND lineage-summed (succession masks
//     ledger metrics — sim-ledgerpenalty lesson).
//   SECONDARY (mechanism): trust trajectory (days trust>=30), hungry days,
//     escape-hatch take count + kcal, v.takes/v.gives split, meal kcal.
// GO on primary + all guardrails, else KILL per §14.
//
// Usage:
//   node scripts/sweep-mealonly-20261014.js
//   OUT=evidence/2026-10-14/mealonly-pilot.json node scripts/sweep-mealonly-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const mo = require('./policies/mealonly');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['belongseek', 'leadcourt'];
const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

function scholarVid(Game) { try { return Game.state.scholar.villagerId; } catch (e) { return null; } }
function vTrust(Game, vid) { try { const t = (((Game.state.village || {}).trust || {})[vid]); return t === undefined ? 15 : t; } catch (e) { return 15; } }
function vTakes(Game, vid) { try { return (((Game.state.village || {}).takes || {})[vid]) || 0; } catch (e) { return 0; } }
function vGives(Game, vid) { try { return (((Game.state.village || {}).gives || {})[vid]) || 0; } catch (e) { return 0; } }

// installInstr: read-only wraps recording meal kcal (villageMeal is untouched
// by the policy gate). Take verbs are instrumented by the policy's own
// counters (policy._mealonly) — no double wrap.
function installInstr(Game) {
  const T = { mealEvents: 0, mealKcal: 0, instrErrors: 0 };
  if (Game.villageMeal) {
    const orig = Game.villageMeal.bind(Game);
    Game.villageMeal = function (...args) {
      let r = null;
      try { r = orig(...args); } catch (e) { T.instrErrors++; }
      try {
        const m = (Game.state.village || {}).lastPlayerMeal || 0;
        if (m > 0) { T.mealEvents++; T.mealKcal += m; }
      } catch (e) { T.instrErrors++; }
      return r;
    };
  }
  return T;
}

async function runOne(seed, policyId, armed) {
  if (armed) process.env.MEALONLY = '1'; else delete process.env.MEALONLY;
  process.env.POLICY = policyId;
  const { Game } = await loadGame({ seed, mode: 'mealonly-pilot' });
  await setupGame(Game);
  const T = installInstr(Game);
  const policy = mo.policyForRun();
  const wall = { maxRank: 0, table: false, win: false, maxWave: 1 };
  const trustCurve = { ge30: 0 };
  const wrapped = Object.assign({}, policy, {
    id: policy.id + (armed ? '-mealonly' : '-control'),
    daily(G, ctx) {
      try {
        const vid = scholarVid(G);
        if (vid) T.scholarVids ? T.scholarVids.add(vid) : 0;
        const s = G.state.scholar || {};
        const tr = vTrust(G, vid);
        T.halfRationDays = (T.halfRationDays || 0) + (tr < 30 ? 1 : 0);
        if (tr >= 30) trustCurve.ge30++;
        T.hungryDays = (T.hungryDays || 0) + (((s.kcal || 0) < 1200) ? 1 : 0);
        T.minKcal = Math.min(T.minKcal === undefined ? 1e9 : T.minKcal, s.kcal || 0);
        try { const r = G.scaleRank ? G.scaleRank() : 'village'; wall.maxRank = Math.max(wall.maxRank, RANK_ORDER[r] || 0); } catch (e) {}
        try { const pg = G.progState ? G.progState() : {}; if (pg.tableWaiting || (G.tableActive && G.tableActive())) wall.table = true; } catch (e) {}
        try { if (G.won) wall.win = true; } catch (e) {}
        try { if (G.unlockedWave) wall.maxWave = Math.max(wall.maxWave, G.unlockedWave()); } catch (e) {}
      } catch (e) { T.instrErrors++; }
      if (policy.daily) return policy.daily(G, ctx);
    },
  });
  T.scholarVids = new Set();
  const res = await quietLog(() => runDays(Game, wrapped, {
    days: 180, manifest: { policy: policyId, seed, armed, mode: 'mealonly-pilot' },
  }));
  // takesEnd: per-vid over the scholar lineage (succession-aware) + lineage sum
  let takesPerVid = {}, givesPerVid = {};
  try {
    for (const vid of T.scholarVids) {
      takesPerVid[String(vid).slice(0, 10)] = Math.round(vTakes(Game, vid));
      givesPerVid[String(vid).slice(0, 10)] = Math.round(vGives(Game, vid));
    }
  } catch (e) {}
  const takesLineageSum = Object.values(takesPerVid).reduce((a, b) => a + b, 0);
  let lineage = [];
  try { lineage = Game.lineage ? Game.lineage() : []; } catch (e) {}
  const starvationDeaths = lineage.filter(e => /starv/i.test(e.cause || '')).length;
  const scholarDeaths = lineage.length;
  let exiled = false;
  try { exiled = !!(Game.state.scholar || {}).exiled; } catch (e) {}
  const days = res.days || 0;
  const mc = policy._mealonly || {};
  return {
    seed, policy: policyId, armed,
    days, endReason: res.endReason,
    halfRationDays: T.halfRationDays || 0, trustGE30Days: trustCurve.ge30,
    hungryDays: T.hungryDays || 0,
    minKcal: T.minKcal === undefined || T.minKcal === 1e9 ? null : Math.round(T.minKcal),
    mealEvents: T.mealEvents, mealKcal: Math.round(T.mealKcal),
    refusedTakes: mc.refused || 0, hatchTakes: mc.hatchTakes || 0, hatchKcal: mc.hatchKcal || 0,
    takesPerVid, takesLineageSum, givesPerVid,
    scholarDeaths, starvationDeaths, exiled,
    national: wall.maxRank >= 3, table: wall.table, win: wall.win, maxWave: wall.maxWave,
    instrErrors: T.instrErrors,
  };
}

async function main() {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const armed of [false, true]) {
        const tag = `${policyId}/s${seed}/${armed ? 'armed' : 'control'}`;
        try {
          const r = await runOne(seed, policyId, armed);
          rows.push(r);
          console.log(`done ${tag}: ${r.days}d halfR ${r.halfRationDays} hatch ${r.hatchTakes} nat ${r.national} sd ${r.starvationDeaths}`);
        } catch (e) {
          console.error(`ERROR ${tag}: ${e.message}`);
          rows.push({ seed, policy: policyId, armed, error: String(e.message) });
        }
      }
    }
  }
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify({ rows, at: new Date().toISOString() }, null, 1)); console.log('wrote ' + out); }
  else console.log(JSON.stringify(rows, null, 1));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
