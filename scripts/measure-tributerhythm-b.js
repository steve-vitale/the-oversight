#!/usr/bin/env node
// scripts/measure-tributerhythm-b.js — TRIBUTE-RHYTHM gate pilot
// (fleshout loop B, 2026-10-19, arm sim-tributerhythm-b).
//
// Substrate: leadfeast/belongfeast + FEASTSCALE_R13=1, SEATDRIVE unset (the
// fragilityfeast control substrate; control RE-MEASURED on the current tip
// per the DIAG's substrate-drift addendum — never reuse old corpus numbers).
// Armed side: leadrhythm/belongrhythm + TRIBUTERHYTHM=1 (default-OFF layer).
// 16 runs: seeds 11/22/33/44 x leadfeast/belongfeast, paired control+armed,
// 180d death-aware (the harness's deadTail stops dead villages +10d).
//
// Measurement reuses scripts/belonghunger-instrument.js (the pantry-channel
// ledger): hungry-day events with say windows, starvation deaths, tribute/
// tend/feast channel flows — the guardrail measurements.
//
// PRIMARY (pre-registered): total hungry-days, armed <= 0.5x control,
// pooled over lead+belong on paired identical seeds.
// GUARDRAILS: median survival >= control-10d; starvation <= control+1;
// national >= control-2; table >= control-2; no new death mode; laundering 0
// (every fired feast has a matching pantry draw — no free feasts).
//
// Usage:
//   FEASTSCALE_R13=1 DAYS=180 SEEDS="11,22,33,44" OUT=evidence/2026-10-19/tributerhythm-b.json \
//     PERSEED_DIR=evidence/2026-10-19/perseed-tributerhythm-b \
//     node scripts/measure-tributerhythm-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { instrument, markDayStart, pantryKcal, gday } = require('./belonghunger-instrument');
const FS = require('./policies/feastscale');
const TR = require('./policies/tributerhythm');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.log('STOP: FEASTSCALE_R13=1 required (the standard feast substrate).');
  process.exit(1);
}
const BASE = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const ARMED = { leadfeast: TR.leadrhythm, belongfeast: TR.belongrhythm };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(seed, pid, armed, days) {
  const pol0 = armed ? ARMED[pid] : BASE[pid];
  if (armed) process.env.TRIBUTERHYTHM = '1'; else delete process.env.TRIBUTERHYTHM;
  const { Game } = await loadGame({ seed, mode: 'tributerhythm-' + pid + (armed ? '-armed' : '-control') });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, pol0);
  const oSetup = pol0.setup, oDaily = pol0.daily;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  policy.daily = (G, ctx) => {
    markDayStart(W, G);
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  try { W.scanInflows(); } catch (e) {}
  const end = stdSnapshot(Game);
  const deaths = [];
  const deathCauseCounts = {};
  let starveDeaths = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths.push({ day: d.day || 0, cause: k, who: d.who || null, player: !!d.player });
    deathCauseCounts[k] = (deathCauseCounts[k] || 0) + 1;
    if (/starv/i.test(k)) starveDeaths++;
  }
  // total hungry-days: sum of daily hungry increments (the primary metric)
  let hungryDays = 0;
  const hungrySay = [];
  for (const rec of Object.values(W.days)) {
    hungryDays += (rec.hungry || 0);
    if (rec.hungry && rec.sayWin) hungrySay.push({ day: rec.day, sayWin: rec.sayWin.slice(-12), freshDays: rec.freshDays });
  }
  // channel totals for guardrails (feast/tribute/tend flows)
  const chanTotals = {};
  for (const rec of Object.values(W.days)) {
    for (const [k, v] of Object.entries(rec.ch || {})) chanTotals[k] = (chanTotals[k] || 0) + v;
  }
  // LAUNDERING check: every fired feast must have a feast-channel draw.
  // feast events recorded by the instrument; days with feast-channel > 0.
  let feastDrawDays = 0;
  for (const rec of Object.values(W.days)) if ((rec.ch || {}).feast > 0) feastDrawDays++;
  W.restore();
  return {
    side: armed ? 'armed' : 'control', policy: pid, seed, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason, won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deathCauseCounts, deaths, starveDeaths, hungryDays,
    hungryEvents: W.hungryEvents.length,
    trBlocked: (runCtx && runCtx.trBlocked) || 0,
    trArmedFragile: (runCtx && runCtx.trArmedFragile) || 0,
    fsFeasts: (runCtx && runCtx.fsFeasts) || 0,
    feastDrawDays, laundering: Math.max(0, ((runCtx && runCtx.fsFeasts) || 0) - feastDrawDays),
    tributeKcal: Math.round(chanTotals.tribute || 0), tendKcal: Math.round(chanTotals.tend || 0),
    feastKcal: Math.round(chanTotals.feast || 0),
    hungrySay: hungrySay.slice(0, 6),
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    for (const armed of [false, true]) {
      const r = await oneRun(seed, pid, armed, days);
      rows.push(r);
      console.log(`  [${r.side} ${pid} seed ${seed}] days=${r.days} end=${r.endReason} hungryDays=${r.hungryDays} starve=${r.starveDeaths} feasts=${r.fsFeasts} trBlocked=${r.trBlocked} trArmedFragile=${r.trArmedFragile} wave=${r.waveReach} national=${r.national} table=${r.table} won=${r.won}`);
    }
  }
  const sum = (rs, f) => rs.reduce((a, r) => a + (f(r) || 0), 0);
  const med = (rs, f) => { const v = rs.map(f).sort((a, b) => a - b); return v.length ? v[v.length >> 1] : 0; };
  const ctrl = rows.filter(r => r.side === 'control'), arm = rows.filter(r => r.side === 'armed');
  const verdict = {
    primary: { control: sum(ctrl, r => r.hungryDays), armed: sum(arm, r => r.hungryDays) },
    guardrails: {
      medianSurvival: { control: med(ctrl, r => r.days), armed: med(arm, r => r.days) },
      starvation: { control: sum(ctrl, r => r.starveDeaths), armed: sum(arm, r => r.starveDeaths) },
      national: { control: sum(ctrl, r => r.national), armed: sum(arm, r => r.national) },
      table: { control: sum(ctrl, r => r.table), armed: sum(arm, r => r.table) },
      wins: { control: sum(ctrl, r => r.won), armed: sum(arm, r => r.won) },
      wave45: { control: sum(ctrl, r => r.waveReach >= 4 ? 1 : 0), armed: sum(arm, r => r.waveReach >= 4 ? 1 : 0) },
      laundering: sum(arm, r => r.laundering),
      trBlocked: sum(arm, r => r.trBlocked),
      trArmedFragile: sum(arm, r => r.trArmedFragile),
      feasts: { control: sum(ctrl, r => r.fsFeasts), armed: sum(arm, r => r.fsFeasts) },
      feastKcal: { control: sum(ctrl, r => r.feastKcal), armed: sum(arm, r => r.feastKcal) },
      tributeKcal: { control: sum(ctrl, r => r.tributeKcal), armed: sum(arm, r => r.tributeKcal) },
      tendKcal: { control: sum(ctrl, r => r.tendKcal), armed: sum(arm, r => r.tendKcal) },
    },
  };
  const out = process.env.OUT || 'evidence/2026-10-19/tributerhythm-b.json';
  const perSeedDir = process.env.PERSEED_DIR;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) fs.writeFileSync(path.join(perSeedDir, `${r.side}-${r.policy}-s${r.seed}.json`), JSON.stringify(r, null, 1));
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ verdict, rows }, null, 1));
  console.log('\n== PILOT VERDICT ==');
  console.log(JSON.stringify(verdict, null, 1));
  console.log(`wrote ${out}${perSeedDir ? ' + ' + perSeedDir : ''}`);
}

main().catch(e => { console.error('PILOT CRASH:', e); process.exit(2); });
