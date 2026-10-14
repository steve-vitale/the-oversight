#!/usr/bin/env node
// sweep-takedisc-20261014.js — takedisc pilot: before/after on identical seeds.
// 8 seeds (11/22/33/44/55/66/77/88) x belongseek/leadcourt x control/armed,
// 180d death-aware, both sides on current tip (det-gate 32/32 required first).
//
// Pre-registered header (docs/MEASUREMENT.md §§9-12, 14):
//   PRIMARY: cumulative takes (v.takes summed over scholar vids) reduced
//     >= 30% vs control (armed/control ratio <= 0.70 per policy).
//   GUARDRAILS: median survival >= control-10d; national >= control-2;
//     starvation deaths <= control; exiled unchanged.
//   SECONDARY (mechanism): take events/day, -2 stings, trust trajectory,
//     half-ration days, hungry days.
// GO on primary + all guardrails, else KILL per §14.
//
// Usage:
//   node scripts/sweep-takedisc-20261014.js            # both sides, both policies
//   OUT=evidence/2026-10-14/takedisc-pilot.json node scripts/sweep-takedisc-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const td = require('./policies/takedisc');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['belongseek', 'leadcourt'];
const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

function scholarVid(Game) { try { return Game.state.scholar.villagerId; } catch (e) { return null; } }
function vTakes(Game, vid) { try { return (((Game.state.village || {}).takes || {})[vid]) || 0; } catch (e) { return 0; } }
function vTrust(Game, vid) { try { const t = (((Game.state.village || {}).trust || {})[vid]); return t === undefined ? 15 : t; } catch (e) { return 15; } }
function vTakesAll(Game) {
  try { return Object.values((Game.state.village || {}).takes || {}).reduce((a, b) => a + (b || 0), 0); } catch (e) { return 0; }
}

function installInstr(Game) {
  const T = { singleEvents: 0, singleKcal: 0, bulkEvents: 0, bulkKcal: 0,
    mealEvents: 0, mealKcal: 0, stings: 0, scholarVids: new Set(), halfRationDays: 0,
    hungryDays: 0, minKcal: 1e9, instrErrors: 0 };
  const wrap = (name, kind) => {
    const orig = Game[name].bind(Game);
    Game[name] = function (...args) {
      const vid = scholarVid(Game);
      const t0 = vTrust(Game, vid), k0 = vTakesAll(Game);
      let r = null;
      try { r = orig(...args); } catch (e) { T.instrErrors++; }
      try {
        const dK = vTakesAll(Game) - k0;
        if (kind === 'single') { T.singleEvents++; if (dK > 0) T.singleKcal += dK; }
        if (kind === 'bulk') { T.bulkEvents++; if (dK > 0) T.bulkKcal += dK; }
        if (kind === 'meal') { T.mealEvents++; if (dK > 0) T.mealKcal += dK; }
        if (vTrust(Game, vid) === t0 - 2) T.stings++;
      } catch (e) { T.instrErrors++; }
      return r;
    };
  };
  wrap('takeFromPantry', 'single');
  wrap('takeFromPantryBulk', 'bulk');
  if (Game.villageMeal) wrap('villageMeal', 'meal');
  return T;
}

async function runOne(seed, policyId, armed) {
  if (armed) process.env.TAKEDISC = '1'; else delete process.env.TAKEDISC;
  process.env.POLICY = policyId;
  const { Game } = await loadGame({ seed, mode: 'takedisc-pilot' });
  await setupGame(Game);
  const T = installInstr(Game);
  const policy = td.policyForRun();
  const wall = { maxRank: 0, table: false, win: false, maxWave: 1 };
  const wrapped = Object.assign({}, policy, {
    id: policy.id + (armed ? '-takedisc' : '-control'),
    daily(G, ctx) {
      try {
        const vid = scholarVid(G);
        if (vid) T.scholarVids.add(vid);
        const s = G.state.scholar || {};
        T.minKcal = Math.min(T.minKcal, s.kcal || 0);
        if (vTrust(G, vid) < 30) T.halfRationDays++;
        if ((s.kcal || 0) < 1200) T.hungryDays++;
        try { const r = G.scaleRank ? G.scaleRank() : 'village'; wall.maxRank = Math.max(wall.maxRank, RANK_ORDER[r] || 0); } catch (e) {}
        try { const pg = G.progState ? G.progState() : {}; if (pg.tableWaiting || (G.tableActive && G.tableActive())) wall.table = true; } catch (e) {}
        try { if (G.won) wall.win = true; } catch (e) {}
        try { if (G.unlockedWave) wall.maxWave = Math.max(wall.maxWave, G.unlockedWave()); } catch (e) {}
      } catch (e) { T.instrErrors++; }
      if (policy.daily) return policy.daily(G, ctx);
    },
  });
  const res = await quietLog(() => runDays(Game, wrapped, {
    days: 180, manifest: { policy: policyId, seed, armed, mode: 'takedisc-pilot' },
  }));
  // PRIMARY: cumulative takes over scholar vids — instrumented sum of take
  // verb deltas (exact; the vid-sum is contaminated by successors' NPC-era
  // takes, kept as cross-check only)
  const instrTakes = Math.round(T.singleKcal + T.bulkKcal + T.mealKcal);
  let scholarTakesVid = 0;
  try { for (const vid of T.scholarVids) scholarTakesVid += vTakes(Game, vid); } catch (e) {}
  // scholar death causes via lineage
  let lineage = [];
  try { lineage = Game.lineage ? Game.lineage() : []; } catch (e) {}
  const starvationDeaths = lineage.filter(e => /starv/i.test(e.cause || '')).length;
  const scholarDeaths = lineage.length;
  // exiled?
  let exiled = false;
  try { exiled = !!(Game.state.scholar || {}).exiled; } catch (e) {}
  const days = res.days || 0;
  return {
    seed, policy: policyId, armed,
    days, endReason: res.endReason,
    scholarTakes: instrTakes,
    scholarTakesVid: Math.round(scholarTakesVid),
    singleKcal: Math.round(T.singleKcal), bulkKcal: Math.round(T.bulkKcal), mealKcal: Math.round(T.mealKcal),
    singleEvents: T.singleEvents, singlePerDay: +(T.singleEvents / Math.max(1, days)).toFixed(1),
    bulkEvents: T.bulkEvents, bulkPerDay: +(T.bulkEvents / Math.max(1, days)).toFixed(2),
    stings: T.stings, stingsPerDay: +(T.stings / Math.max(1, days)).toFixed(2),
    halfRationDays: T.halfRationDays, hungryDays: T.hungryDays,
    minKcal: T.minKcal === 1e9 ? null : Math.round(T.minKcal),
    scholarDeaths, starvationDeaths, exiled,
    national: wall.maxRank >= 3, table: wall.table, win: wall.win, maxWave: wall.maxWave,
    takediscPacks: 0, instrErrors: T.instrErrors,
  };
}

async function main() {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const armed of [false, true]) {
        const r = await runOne(seed, policyId, armed);
        rows.push(r);
        console.log(JSON.stringify({ seed, policy: policyId, armed,
          days: r.days, scholarTakes: r.scholarTakes, singlePerDay: r.singlePerDay,
          bulkPerDay: r.bulkPerDay, stingsPerDay: r.stingsPerDay,
          starvationDeaths: r.starvationDeaths, exiled: r.exiled,
          national: r.national, maxWave: r.maxWave }));
      }
    }
  }
  delete process.env.TAKEDISC;
  const out = process.env.OUT;
  if (out) require('fs').writeFileSync(out, JSON.stringify(rows, null, 2));
  // summary per policy
  for (const policyId of POLICIES) {
    const c = rows.filter(r => r.policy === policyId && !r.armed);
    const a = rows.filter(r => r.policy === policyId && r.armed);
    const med = rs => { const s = rs.map(r => r.days).sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const sum = rs => rs.reduce((t, r) => t + r.scholarTakes, 0);
    console.log(`--- ${policyId}: takes ${sum(a)}/${sum(c)} = ${(sum(a) / Math.max(1, sum(c))).toFixed(2)}` +
      ` | medSurv ${med(a)} vs ${med(c)} | national ${a.filter(r => r.national).length} vs ${c.filter(r => r.national).length}` +
      ` | starvDeaths ${a.reduce((t, r) => t + r.starvationDeaths, 0)} vs ${c.reduce((t, r) => t + r.starvationDeaths, 0)}` +
      ` | exiled ${a.filter(r => r.exiled).length} vs ${c.filter(r => r.exiled).length}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
