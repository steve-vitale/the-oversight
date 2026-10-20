#!/usr/bin/env node
// scripts/measure-pantryguard-b2.js — paired before/after pilot for the
// PANTRY-GUARD lever (fleshout loop B, 2026-10-20, arm sim-pantryguard-b2).
//
// Substrate: leadfeast/belongfeast + FEASTSCALE_R13=1 (both sides).
// Control: PANTRYGUARD unset. Armed: PANTRYGUARD=1.
// 16 configs: seeds 4801-4808 (fresh — the pre-registered 11/22/33/44+
// 55/66/77/88 are on the repo's banned-seed list) x leadfeast/belongfeast,
// 180d death-aware horizon (dead villages stop +10d tail).
//
// Per-seed JSONs carry TOP-LEVEL wall keys (national/table/won/exiled) — the
// telemetry step reads top-level keys; schema-nested keys have burned runs.
//
// Pre-registered verdict (docs/MEASUREMENT.md §14, binding):
//   PRIMARY: hungry-days armed <= 0.5x control (paired identical seeds,
//            pooled over lead+belong). Co-primary: starvation deaths armed <
//            control if any occur.
//   GUARDRAILS: median survival >= control-10d; scholar starvation/death not
//            increased; national >= control-2; table >= control-2; no new
//            death mode; rot pooled/100d <= 1.15x control; laundering 0.
//
// Usage:
//   FEASTSCALE_R13=1 OUT=evidence/2026-10-20/pantryguard-b2.json \
//     PERSEED_DIR=evidence/2026-10-20/perseed-pantryguard-b2 \
//     node scripts/measure-pantryguard-b2.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const PG = require('./policies/pantryguard');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.log('STOP: FEASTSCALE_R13=1 required (the standard feast substrate).');
  process.exit(1);
}

const SEEDS = [4801, 4802, 4803, 4804, 4805, 4806, 4807, 4808];
const PIDS = ['leadfeast', 'belongfeast'];
const SIDES = [
  { name: 'control', armed: false },
  { name: 'armed', armed: true },
];
const BASE = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const ARMEDPOL = { leadfeast: PG.pglead, belongfeast: PG.pgbelong };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const OUT = process.env.OUT || 'evidence/2026-10-20/pantryguard-b2.json';
const PERSEED_DIR = process.env.PERSEED_DIR || 'evidence/2026-10-20/perseed-pantryguard-b2';

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(seed, pid, armed) {
  if (armed) process.env.PANTRYGUARD = '1'; else delete process.env.PANTRYGUARD;
  const base = armed ? ARMEDPOL[pid] : BASE[pid];
  const { Game } = await loadGame({ seed, mode: `pgpilot-${armed ? 'armed' : 'control'}-${pid}` });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup, oDaily = base.daily;
  // Measure wraps (behavior-neutral recorders) installed BEFORE the policy's
  // own setup, so the guard's meal wrapper (armed side) chains through them.
  const M = { rotKcal: 0, spoiledDrawn: 0, monsterDrawn: 0 };
  const rawSweep = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null;
  if (rawSweep) {
    Game.sweepSpoiled = function (...a) {
      const b = pantryKcal(Game);
      const r = rawSweep(...a);
      const d = b - pantryKcal(Game);
      if (d > 0) M.rotKcal += d;
      return r;
    };
  }
  const rawDraw = Game.pantryDraw ? Game.pantryDraw.bind(Game) : null;
  if (rawDraw) {
    Game.pantryDraw = function (v, want, opts) {
      const out = rawDraw(v, want, opts);
      try {
        for (const e of (out.items || [])) {
          const item = (e && e.item) || e || {};
          try { if (Game.isSpoiled && Game.isSpoiled(item)) M.spoiledDrawn++; } catch (ee) {}
          if (item && item.monster) M.monsterDrawn++;
        }
      } catch (e) {}
      return out;
    };
  }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everExiled: false };
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (G.state.scholar && G.state.scholar.exiled) hist.everExiled = true;
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 181 }); });
  const end = stdSnapshot(Game);
  const deaths = [];
  let starveDeaths = 0, scholarStarved = 0, scholarDead = 0;
  const deathCauseCounts = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    const player = !!d.player;
    deaths.push({ day: d.day || 0, cause: k, who: d.who || null, player });
    deathCauseCounts[k] = (deathCauseCounts[k] || 0) + 1;
    if (/starv/i.test(k)) { starveDeaths++; if (player) scholarStarved++; }
    if (player) scholarDead++;
  }
  let hungryFinal = 0;
  try { hungryFinal = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  let scholarEnd = { kcal: null, hp: null, maxHp: null };
  try {
    const s = Game.state.scholar || {};
    scholarEnd = { kcal: Math.round(s.kcal || 0), hp: Math.round(s.hp || 0), maxHp: Math.round(s.maxHp || 0) };
  } catch (e) {}
  const pg = runCtx ? {
    pgFragileDays: runCtx.pgFragileDays || 0, pgForcedHaul: runCtx.pgForcedHaul || 0,
    pgDonatedDeep: runCtx.pgDonatedDeep || 0, pgHalfMeals: runCtx.pgHalfMeals || 0,
    pgDeferredTakes: runCtx.pgDeferredTakes || 0, fsFeasts: runCtx.fsFeasts || 0,
  } : {};
  return {
    // TOP-LEVEL wall keys (telemetry reads these at top level)
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    won: end.won ? 1 : 0,
    exiled: hist.everExiled ? 1 : 0,
    // run identity + outcomes
    side: armed ? 'armed' : 'control', policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    waveReach: result.maxWaveUnlocked || 1, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    // primary + co-primary
    hungryDays: hungryFinal, starveDeaths,
    // guardrails
    scholarStarved, scholarDead, scholarEnd,
    rotKcal: Math.round(M.rotKcal),
    launder: { spoiledDrawn: M.spoiledDrawn, monsterDrawn: M.monsterDrawn },
    deathCauseCounts, deaths,
    pg,
  };
}

(async () => {
  fs.mkdirSync(PERSEED_DIR, { recursive: true });
  const runs = [];
  // RESUME=1: load already-written per-seed files, run only the missing.
  const RESUME = process.env.RESUME === '1';
  const have = {};
  if (RESUME) {
    for (const f of fs.readdirSync(PERSEED_DIR)) {
      const m = f.match(/^pg-(control|armed)-(\w+)-s(\d+)\.json$/);
      if (m) have[`${m[1]}/${m[2]}/s${m[3]}`] = path.join(PERSEED_DIR, f);
    }
  }
  for (const side of SIDES) {
    for (const pid of PIDS) {
      for (const seed of SEEDS) {
        const key = `${side.name}/${pid}/s${seed}`;
        if (have[key]) {
          const r = JSON.parse(fs.readFileSync(have[key], 'utf8'));
          runs.push(r);
          console.log(`resume ${key}: days=${r.days} hungry=${r.hungryDays}`);
          continue;
        }
        const r = await oneRun(seed, pid, side.armed);
        runs.push(r);
        const f = path.join(PERSEED_DIR, `pg-${r.side}-${pid}-s${seed}.json`);
        fs.writeFileSync(f, JSON.stringify(r, null, 2) + '\n');
        console.log(`${r.side}/${pid}/s${seed}: days=${r.days} end=${r.endReason} hungry=${r.hungryDays} starve=${r.starveDeaths} national=${r.national} table=${r.table} won=${r.won} wave=${r.waveReach}`);
      }
    }
  }
  // paired summary
  const byKey = {};
  for (const r of runs) byKey[`${r.policy}/s${r.seed}`] = byKey[`${r.policy}/s${r.seed}`] || {};
  for (const r of runs) byKey[`${r.policy}/s${r.seed}`][r.side] = r;
  const sum = (rs, f) => rs.reduce((t, r) => t + (f(r) || 0), 0);
  const controls = runs.filter(r => r.side === 'control'), armed = runs.filter(r => r.side === 'armed');
  const paired = Object.values(byKey).filter(p => p.control && p.armed);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const summary = {
    base: require('child_process').execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim(),
    seeds: SEEDS, policies: PIDS, horizon: '180d death-aware',
    primary: {
      hungryDaysControl: sum(controls, r => r.hungryDays),
      hungryDaysArmed: sum(armed, r => r.hungryDays),
      ratio: sum(controls, r => r.hungryDays) ? +(sum(armed, r => r.hungryDays) / sum(controls, r => r.hungryDays)).toFixed(3) : null,
      goThreshold: 'armed <= 0.5x control',
    },
    coPrimary: { starveDeathsControl: sum(controls, r => r.starveDeaths), starveDeathsArmed: sum(armed, r => r.starveDeaths) },
    guardrails: {
      medianSurvivalControl: med(controls.map(r => r.days)), medianSurvivalArmed: med(armed.map(r => r.days)),
      scholarStarvedControl: sum(controls, r => r.scholarStarved), scholarStarvedArmed: sum(armed, r => r.scholarStarved),
      scholarDeadControl: sum(controls, r => r.scholarDead), scholarDeadArmed: sum(armed, r => r.scholarDead),
      nationalControl: sum(controls, r => r.national), nationalArmed: sum(armed, r => r.national),
      tableControl: sum(controls, r => r.table), tableArmed: sum(armed, r => r.table),
      rotPer100dControl: +(sum(controls, r => r.rotKcal) / Math.max(1, sum(controls, r => r.days)) * 100).toFixed(0),
      rotPer100dArmed: +(sum(armed, r => r.rotKcal) / Math.max(1, sum(armed, r => r.days)) * 100).toFixed(0),
      launderControl: { spoiled: sum(controls, r => r.launder.spoiledDrawn), monster: sum(controls, r => r.launder.monsterDrawn) },
      launderArmed: { spoiled: sum(armed, r => r.launder.spoiledDrawn), monster: sum(armed, r => r.launder.monsterDrawn) },
    },
    wall: {
      nationalControl: sum(controls, r => r.national), nationalArmed: sum(armed, r => r.national),
      tableControl: sum(controls, r => r.table), tableArmed: sum(armed, r => r.table),
      wonControl: sum(controls, r => r.won), wonArmed: sum(armed, r => r.won),
      exiledControl: sum(controls, r => r.exiled), exiledArmed: sum(armed, r => r.exiled),
    },
    pgCountersArmed: {
      pgFragileDays: sum(armed, r => r.pg.pgFragileDays), pgForcedHaul: sum(armed, r => r.pg.pgForcedHaul),
      pgDonatedDeep: sum(armed, r => r.pg.pgDonatedDeep), pgHalfMeals: sum(armed, r => r.pg.pgHalfMeals),
      pgDeferredTakes: sum(armed, r => r.pg.pgDeferredTakes),
    },
    paired: paired.map(p => ({
      key: `${p.control.policy}/s${p.control.seed}`,
      hungry: [p.control.hungryDays, p.armed.hungryDays],
      starve: [p.control.starveDeaths, p.armed.starveDeaths],
      days: [p.control.days, p.armed.days],
      end: [p.control.endReason, p.armed.endReason],
      national: [p.control.national, p.armed.national],
      table: [p.control.table, p.armed.table],
    })),
  };
  fs.writeFileSync(OUT, JSON.stringify({ summary, runs }, null, 2) + '\n');
  console.log('\n=== PAIRED SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
  console.log('\nwrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
