#!/usr/bin/env node
// scripts/sweep-mealname-20261013.js — MEALNAME lever suite (flesh-out loop B, 2026-10-13).
//
// Staged measurement (docs/MEASUREMENT.md §§9–12, 14):
//   - 8 seeds × {leadcourt, belongseek}, IDENTICAL seeds before/after, 180d
//     death-aware horizon (pacing-law max). sim-harness runDays stops dead
//     villages on its own (endReason), so the horizon is never a fixed 200d.
//   - Primary metric = narration mechanism: ≥90% of sampled bulk-eat beats
//     name the food. Safety instrument: 8-seed before/after trajectories
//     near-identical (median survival ±3d, no wall-metric delta).
//   - All bulk-eat beats are captured from REAL suite output (Game.say
//     override), not synthetic.
//
// Usage: node scripts/sweep-mealname-20261013.js --out /tmp/mealname-baseline.json
//        (game.js pristine = baseline; with the MEALNAME change = armed side)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = { leadcourt, belongseek };
const DAYS = 180;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Named beat: "You eat smoked turkey (smoked) and garden greens (310 kcal). ..."
// Old/unnamed beat: "You eat (170 kcal). ..." — note NO space before the paren,
// so the named-beat regex (which requires " (") does not match it.
const NAMED_RE = /^You eat (.+?) \((\d+) kcal\)/;
const OLD_RE = /^You eat \((\d+) kcal\)/;

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', vests: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try {
    const VEST_IDS = ['military_vest', 'swat_vest'];
    let n = 0;
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) n += (it.units || 1);
    for (const v of Object.values((Game.state.scholar || {}).equipped || {})) if (v && VEST_IDS.includes(v.id)) n++;
    out.vests = n;
  } catch (e) {}
  return out;
}

async function runSide() {
  const runs = [];
  for (const pid of Object.keys(POLICIES)) {
    const base = POLICIES[pid];
    for (const seed of SEEDS) {
      const { Game, manifest } = await loadGame({ seed, mode: 'mealname-' + pid, fullTelemetry: false });
      await setupGame(Game);
      // Capture all narration; still let the game record its own log.
      const origSay = Game.say.bind(Game);
      const beats = [];
      Game.say = (m) => { try { origSay(m); } catch (e) {} beats.push(String(m)); };
      const policy = Object.assign({}, base);
      const hist = { maxRank: 0, maxArc: 1, everTable: false, maxVests: 0 };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          hist.maxVests = Math.max(hist.maxVests, s.vests || 0);
          if (s.tableWaiting) hist.everTable = true;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
      const end = stdSnapshot(Game);
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
        }
      } catch (e) {}
      // Bulk-eat beat census.
      let total = 0, named = 0, old = 0;
      const namedBeats = [];
      for (const m of beats) {
        if (!m.startsWith('You eat ')) continue;
        total++;
        if (NAMED_RE.test(m)) { named++; if (namedBeats.length < 40) namedBeats.push(m.slice(0, 160)); }
        else if (OLD_RE.test(m)) old++;
      }
      runs.push({
        policy: pid, seed,
        days: result.days, endReason: result.endReason,
        won: end.won ? 1 : 0,
        waveReach: result.maxWaveUnlocked || 1,
        maxArc: hist.maxArc,
        maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
        national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        vests: Math.max(hist.maxVests, end.vests || 0),
        deaths,
        beats: { total, named, old, rate: total ? named / total : null, samples: namedBeats },
      });
      console.log(`  [${pid} seed ${seed}] days=${result.days} end=${result.endReason} wave=${result.maxWaveUnlocked || 1} arc=${hist.maxArc} rank=${runs[runs.length-1].maxRank} table=${runs[runs.length-1].table} won=${end.won?1:0} beats=${total} named=${named}`);
    }
  }
  return runs;
}

function summarize(runs) {
  const days = runs.map(r => r.days).sort((a, b) => a - b);
  const bt = runs.reduce((s, r) => s + r.beats.total, 0);
  const bn = runs.reduce((s, r) => s + r.beats.named, 0);
  return {
    n: runs.length,
    medianDays: days.length ? days[Math.floor(days.length / 2)] : 0,
    maxDays: days.length ? days[days.length - 1] : 0,
    wins: runs.reduce((s, r) => s + r.won, 0),
    national: runs.reduce((s, r) => s + r.national, 0),
    table: runs.reduce((s, r) => s + r.table, 0),
    wave45: runs.filter(r => r.waveReach >= 4).length,
    beatsTotal: bt, beatsNamed: bn,
    namingRate: bt ? bn / bt : null,
    deathTotals: runs.reduce((acc, r) => {
      for (const [k, v] of Object.entries(r.deaths)) acc[k] = (acc[k] || 0) + v;
      return acc;
    }, {}),
  };
}

(async () => {
  const outIdx = process.argv.indexOf('--out');
  const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : null;
  const t0 = Date.now();
  const runs = await runSide();
  const summary = summarize(runs);
  console.log('SUMMARY', JSON.stringify(summary, null, 1));
  if (outPath) { fs.writeFileSync(outPath, JSON.stringify({ when: new Date().toISOString(), summary, runs }, null, 1)); console.log('wrote', outPath); }
  console.log('wall ms:', Date.now() - t0);
})();
