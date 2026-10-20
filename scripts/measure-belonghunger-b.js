#!/usr/bin/env node
// scripts/measure-belonghunger-b.js — instrumented pantry-attribution pilot for
// the belong-road hunger diagnostic (fleshout loop B, 2026-10-19,
// arm sim-belonghunger-b).
//
// DIAGNOSTIC (DIAG-GO verdict form — no lever). Substrate: leadfeast/belongfeast
// + FEASTSCALE_R13=1, SEATDRIVE unset (the fragilityfeast control substrate).
// 8 runs: seeds 11/22/33/44 x leadfeast/belongfeast, 180d death-aware horizon.
// Per-day pantry ledger per run: channel inflows/outflows, hungry-day events
// with say-windows, fresh-days, starvation deaths with day-of-death.
//
// Attribution: for each hungry day H and each starvation death, the trailing
// 7-day window (H-7..H-1) of channel flows is summed; channels are ranked by
// their net drain contribution across all hunger events, belong vs lead.
//
// Usage:
//   FEASTSCALE_R13=1 DAYS=180 SEEDS="11,22,33,44" OUT=evidence/2026-10-19/belonghunger-b.json \
//     PERSEED_DIR=evidence/2026-10-19/perseed-belonghunger-b \
//     node scripts/measure-belonghunger-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { instrument, markDayStart, pantryKcal, gday, freshDays } = require('./belonghunger-instrument');
const FS = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.log('STOP: FEASTSCALE_R13=1 required (the standard feast substrate).');
  process.exit(1);
}
const REGISTRY = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

// Roll the scan's 'in' tags into source groups for the attribution report.
function tagGroup(tag) {
  const t = String(tag || '');
  if (t === 'surplus') return 'surplus(villager-meal)';
  if (/^Tribute/i.test(t)) return 'tribute-in';
  if (/^Route tariff/i.test(t)) return 'tariff';
  if (/^Raid spoils/i.test(t)) return 'raid-spoils';
  if (/^Favor repaid/i.test(t)) return 'favor';
  if (/^donate/i.test(t)) return 'donate(player)';
  if (/^Meal leftovers/i.test(t)) return 'leftovers';
  if (/Foraged food/i.test(t)) return 'forage';
  if (/Game meat|meat/i.test(t)) return 'hunt';
  if (/Garden/i.test(t)) return 'garden';
  if (/Fish/i.test(t)) return 'fish';
  if (/Genesis/i.test(t)) return 'genesis';
  return 'other:' + t.slice(0, 24);
}

async function oneRun(seed, pid, days) {
  const base = REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: 'belonghunger-' + pid });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup, oDaily = base.daily;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const freshSeries = [];
  let pantryPeak = 0;
  policy.daily = (G, ctx) => {
    markDayStart(W, G);
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      const d = gday(G);
      if (d % 10 === 0) {
        try { freshSeries.push([d, +G.pantryFreshDays().toFixed(1)]); } catch (e) {}
        try {
          const pk = pantryKcal(G);
          if (pk > pantryPeak) pantryPeak = pk;
        } catch (e) {}
      }
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  try { W.scanInflows(); } catch (e) {}
  const end = stdSnapshot(Game);
  const deaths = [];
  let starveDeaths = 0;
  const deathCauseCounts = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths.push({ day: d.day || 0, cause: k, who: d.who || null, player: !!d.player });
    deathCauseCounts[k] = (deathCauseCounts[k] || 0) + 1;
    if (/starv/i.test(k)) starveDeaths++;
  }
  let hungryFinal = 0;
  try { hungryFinal = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  // serialize the ledger compactly
  const ledgerDays = {};
  for (const [dk, rec] of Object.entries(W.days)) {
    const tags = {};
    for (const [ch, arr] of Object.entries(rec.tags || {})) {
      const g = {};
      for (const t of arr) { const gg = tagGroup(t); g[gg] = (g[gg] || 0) + 1; }
      tags[ch] = g;
    }
    ledgerDays[dk] = {
      start: rec.start, ch: rec.ch, hungry: rec.hungry, granaryFed: rec.granaryFed,
      freshDays: rec.freshDays, tagGroups: tags,
      sayWin: rec.sayWin || undefined,
    };
  }
  // pooled reconciliation
  let totalOut = 0, totalIn = 0;
  for (const rec of Object.values(W.days)) {
    for (const [k, v] of Object.entries(rec.ch)) {
      if (k === 'in' || k === 'in-granary') totalIn += v; else totalOut += v;
    }
  }
  const dkeys = Object.keys(W.days).map(Number).sort((a, b) => a - b);
  const firstStart = dkeys.length ? W.days[dkeys[0]].start : 0;
  let finalPantry = 0;
  try { finalPantry = Math.round(pantryKcal(Game)); } catch (e) {}
  const totalDelta = finalPantry - (firstStart || 0);
  const gross = totalOut + totalIn + Math.abs(totalDelta);
  const residShare = gross > 0 ? Math.abs(totalDelta + (totalOut - totalIn)) / gross : 0;
  W.restore();
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deathCauseCounts, deaths, starveDeaths, hungryFinal,
    hungryEvents: W.hungryEvents,
    tributeWeeks: W.tributeWeeks, tendWeeks: W.tendWeeks,
    feasts: W.feasts, raids: W.raids,
    fsFeasts: (runCtx && runCtx.fsFeasts) || 0,
    fsArmedFeasts: (runCtx && runCtx.fsArmedFeasts) || 0,
    freshSeries, pantryPeak: Math.round(pantryPeak),
    ledgerDays, finalPantry,
    recon: { totalOut: Math.round(totalOut), totalIn: Math.round(totalIn), totalDelta: Math.round(totalDelta), residShare: +residShare.toFixed(4) },
  };
}

// Attribution: for each hunger event day H (and each starvation death day),
// sum channel flows over [H-7, H-1]. Returns ranked net-drain table.
function attribute(run) {
  const events = [];
  for (const e of (run.hungryEvents || [])) events.push({ day: e.day, kind: 'hungry', hungryDays: e.hungryDays });
  for (const d of (run.deaths || [])) if (/starv/i.test(d.cause)) events.push({ day: d.day, kind: 'starvation-death', who: d.who });
  const perEvent = [];
  const chanNet = {}; // channel -> total net drain over all event windows
  for (const e of events) {
    const win = { day: e.day, kind: e.kind, channels: {}, inGroups: {}, start: null, end: null };
    for (let d = e.day - 7; d <= e.day - 1; d++) {
      const rec = run.ledgerDays[String(d)];
      if (!rec) continue;
      if (win.start === null) win.start = rec.start;
      for (const [k, v] of Object.entries(rec.ch || {})) {
        const signed = (k === 'in' || k === 'in-granary') ? -v : v; // + = drain
        win.channels[k] = (win.channels[k] || 0) + signed;
        chanNet[k] = (chanNet[k] || 0) + signed;
      }
      for (const [gg, n] of Object.entries((rec.tagGroups || {})['in'] || {})) {
        win.inGroups[gg] = (win.inGroups[gg] || 0) + n;
      }
    }
    const recH = run.ledgerDays[String(e.day)];
    if (recH) win.end = recH.start;
    perEvent.push(win);
  }
  return { events: perEvent, chanNet };
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    r.attribution = attribute(r);
    rows.push(r);
    const nH = (r.hungryEvents || []).length;
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} hungryEvents=${nH} starve=${r.starveDeaths} feasts=${r.fsFeasts} tribWk=${r.tributeWeeks.length} reconResid=${(r.recon.residShare * 100).toFixed(1)}%`);
  }
  // pooled attribution across all hunger events, by policy
  const pooled = {};
  for (const r of rows) {
    const p = pooled[r.policy] = pooled[r.policy] || { events: 0, chanNet: {}, runs: 0 };
    p.runs++;
    p.events += r.attribution.events.length;
    for (const [k, v] of Object.entries(r.attribution.chanNet)) p.chanNet[k] = (p.chanNet[k] || 0) + v;
  }
  console.log('\n=== pooled 7-day-window attribution (net drain kcal per channel, + = drains pantry) ===');
  for (const pid of pids) {
    const p = pooled[pid];
    console.log(`  ${pid}: ${p.events} hunger events over ${p.runs} runs`);
    const ranked = Object.entries(p.chanNet).sort((a, b) => b[1] - a[1]);
    for (const [k, v] of ranked) console.log(`    ${k}: ${Math.round(v).toLocaleString('en-US')}`);
  }
  const outFile = process.env.OUT || null;
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ when: new Date().toISOString(), seeds, pids, days, r13: true, rows, pooled }, null, 1));
    console.error('wrote ' + outFile);
  }
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      fs.writeFileSync(`${perSeedDir}/belonghunger-${r.policy}-s${r.seed}.json`, JSON.stringify(r, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
