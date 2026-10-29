#!/usr/bin/env node
// scripts/test-picktime-a-neutrality.js — sim-picktime-a recorder-
// neutrality proof (prereg leg 4). Runs ONE seed with recorders
// OFF (plain tableseat-nowait via the sim harness, same seed /
// substrate env / 180d death-aware, NO diag installs of any kind)
// and compares it EXACTLY to the corpus row on every comparable
// field. Recorder channels themselves cannot exist in the OFF run
// by construction, so deep-equality is claimed on the comparable
// snapshot only — never on the full row (see prereg).
// Usage: node scripts/test-picktime-a-neutrality.js <seed>
//   [--evid <dir>]
// Exit 0 only on exact equality of all comparable fields.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
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
async function main() {
  const args = process.argv.slice(2);
  const seed = parseInt(args[0], 10);
  if (!Number.isFinite(seed)) { console.error('usage: test-picktime-a-neutrality.js <seed> [--evid <dir>]'); process.exit(1); }
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-picktime-a');
  const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  delete process.env.FIELDPARTY; delete process.env.RETURNS;
  delete process.env.FUNNEL; delete process.env.DEPARTHOLD;
  const { Game } = await loadGame({ seed, mode: 'funnel-a-fresh', fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (tableseatNowait.daily) { try { return tableseatNowait.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const off = {
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1, maxArc: hist.maxArc,
    finalRank: end.rank, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths), deathTotal: deaths.length, starvationDeaths: starv.length,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge), tableState,
  };
  const fields = Object.keys(off);
  const diffs = [];
  for (const f of fields) {
    if (JSON.stringify(off[f]) !== JSON.stringify(row[f])) diffs.push(`${f}: OFF=${JSON.stringify(off[f])} ON=${JSON.stringify(row[f])}`);
  }
  console.log(`=== sim-pickband-a neutrality seed ${seed} ===`);
  console.log(`comparable fields=${fields.length} diffs=${diffs.length}`);
  for (const d of diffs) console.log(`  DIFF ${d}`);
  console.log(diffs.length === 0 ? 'PICKTIME-NEUTRALITY PASS' : 'PICKTIME-NEUTRALITY FAIL');
  process.exit(diffs.length === 0 ? 0 : 1);
}
main().catch(e => { console.error('NEUTRALITY-FAIL', e && e.stack || e); process.exit(1); });
