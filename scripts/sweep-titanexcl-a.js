#!/usr/bin/env node
// scripts/sweep-titanexcl-a.js — sim-titanexcl-a wild sweep (leg W, GUARD).
// Lean sweep: tableseat-nowait policy (the muster lineage's policy, so wall
// numbers stay comparable) + the titancast record-only recorder. Control vs
// armed legs run the SAME script on the SAME base with IDENTICAL seeds;
// only src/js/game.js castMonster differs between legs. Per-seed rows go
// to $EVID/s<seed>.json (default evidence/2026-10-30/perseed-titanexcl-a).
// Horizon 180d death-aware: runDays stops at game over; dead villages stop
// simulating (no fixed-200d tail).
//
// Usage: EVID=<dir> TITANCAST=1 node scripts/sweep-titanexcl-a.js 75131,75132
//   (no args) : pilot seeds 75131-75138.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { newTitancastStore, installTitancastDiag } = require('./policies/titancast-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 900; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      if (a < 900) { const end = Date.now() + 1000; while (Date.now() < end) {} }
    }
  }
  throw lastErr;
}
function sleepMs(ms) { const end = Date.now() + ms; while (Date.now() < end) {} }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-titanexcl-a'); }
function titanIdsOf(Game) {
  const set = {};
  try {
    const raw = (Game.data && Game.data.titans) || {};
    Object.keys(raw).forEach((k) => {
      if (k.charAt(0) === '_') return;
      set[k] = true;
      if (raw[k] && raw[k].monster) set[raw[k].monster] = true;
    });
  } catch (e) {}
  return set;
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TITANCAST = '1';
  const store = newTitancastStore();
  const base = tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'chainclose-a-pilot', fullTelemetry: false });
  await setupGame(Game);
  const TITANS = titanIdsOf(Game);
  try { installTitancastDiag(Game, store); } catch (e) {}
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let prevPendingTitan = null, episodes = 0, faceDays = 0;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      try { installTitancastDiag(G, store); } catch (e) {}
      try {
        const cur = (G.pendingMonsterId && TITANS[G.pendingMonsterId]) ? G.pendingMonsterId : null;
        if (cur) { faceDays++; if (prevPendingTitan !== cur) episodes++; }
        prevPendingTitan = cur;
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: 'tableseat-nowait', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    titancast: {
      casts: store.casts, titanCasts: store.titanCasts, castById: store.castById,
      feastDraws: store.feastDraws, feastTitan: store.feastTitan, feastById: store.feastById,
      pendingTitanEpisodes: episodes, pendingTitanFaceDays: faceDays,
      diag: { errs: store.errs, errors: store.errors, installed: store.installed },
    },
  };
  writeFileRetry(path.join(evidDir, `s${seed}.json`), JSON.stringify(row, null, 2));
  return row;
}

async function main() {
  const arg = process.argv[2];
  const seeds = arg ? arg.split(',').map((s) => parseInt(s.trim(), 10)) : [75131, 75132, 75133, 75134, 75135, 75136, 75137, 75138];
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of seeds) {
    const t0 = Date.now();
    const row = await runOne(seed, 180, evidDir);
    rows.push(row);
    console.log(`seed=${seed} days=${row.days} end=${row.endReason} won=${row.won} wave=${row.waveReach} rank=${row.finalRank}/${row.maxRank} nat=${row.nationalEver} table=${row.table} deaths=${row.deathTotal} titanCasts=${row.titancast.titanCasts}/${row.titancast.casts} feastTitan=${row.titancast.feastTitan}/${row.titancast.feastDraws} pendEpi=${row.titancast.pendingTitanEpisodes} ms=${Date.now() - t0}`);
  }
  const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : 0; };
  console.log(JSON.stringify({
    seeds, n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4plus: rows.filter((r) => r.waveReach >= 4).length,
    wave5: rows.filter((r) => r.waveReach >= 5).length,
    medianDays: med(rows.map((r) => r.days)),
    maxDays: Math.max(...rows.map((r) => r.days)),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    titanCasts: rows.reduce((t, r) => t + r.titancast.titanCasts, 0),
    casts: rows.reduce((t, r) => t + r.titancast.casts, 0),
    feastTitan: rows.reduce((t, r) => t + r.titancast.feastTitan, 0),
    feastDraws: rows.reduce((t, r) => t + r.titancast.feastDraws, 0),
    pendingTitanEpisodes: rows.reduce((t, r) => t + r.titancast.pendingTitanEpisodes, 0),
  }, null, 2));
}
main().catch((e) => { console.error('SWEEP ERROR', e && e.stack || e); process.exit(1); });
