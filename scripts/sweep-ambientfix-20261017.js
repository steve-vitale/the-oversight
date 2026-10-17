#!/usr/bin/env node
// scripts/sweep-ambientfix-20261017.js — the sim-ambientfix-b sweep
// (lever loop B, 2026-10-16/17, food-economy axis; sim-findings #440).
//
// #440 (loop B sim-trig6-b sense-read): the benevolent-pilot ambient line
//   "Someone's been leaving food out. Good food. Don't ask me how I know
//   it wasn't one of us." fired 8 times word-for-word with only the speaker
//   name varying. One voice wearing eight faces.
//
// THE FIX (VOICE ONLY, narration only — no mechanics): the benevolent
// branch of apVillageGossip's per-known-pilot loop gets a 4-variant pool
// per pilot (variant 0 = the original line verbatim), NAMED pilots (a known
// alien with a name deserves a name in the gossip), and a per-pilot drop
// spot drawn from each pilot's own canon (Wren's hollow caches, Old Tam's
// fire-pit jerky — src/data/alienPlayers.json). Selection is a pure
// function of (speaker vid, pilot id, day) via this._hashStr — never
// R()/Math.random() (findings #263/#264: any RNG draw-count change shifts
// downstream sims and fails the det-gate), with per-speaker dedup until
// all four are said.
//
// Sides: control (pre-fix) vs armed (the fix). 8 fresh seeds x
// {leadfeast, belongfeast} x {control, armed} = 32 runs, 180d death-aware,
// identical seeds across sides. Substrate (asserted up front):
// FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
// WINDEFER=1, SEATDRIVE=0 explicit.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: proof RED→GREEN (fixtures: ambient line varies across >=2
//     pilot-persona states/speakers) AND det-gate byte-identical
//     trajectories (say TEXT not in the hash) AND the 8-seed paired sweep
//     with wall metrics identical (national/table/wins/wave/median).
//   GO: variety observed (armed distinct pilot-food texts >= 3 across the
//     sweep; control distinct == 1) AND hashes 16/16 identical AND wall
//     metrics 16/16 identical AND sense PASS (2 transcript reads).
//   GUARDRAILS (report-only): death-cause shares, no crash, instrument clean.
//   Horizon: 180d death-aware (+10d tail). SMOKE=1: 1 seed x 1 policy x 25d.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     SIDE=control OUT=evidence/2026-10-17/ambientfix-control node scripts/sweep-ambientfix-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 explicit required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '1101,1202,1303,1404,1505,1606,1707,1808').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim());
const SIDE = process.env.SIDE || 'control';
const DAYS = Number(process.env.DAYS || (process.env.SMOKE === '1' ? 25 : 180));
const OUT = process.env.OUT || null;

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const PMAP = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Mechanics-only per-dawn trajectory hash. Say TEXT is deliberately NOT in
// the hash (voice-only lever); day counters, health, kcal, roster, takes/
// gives, pantry are.
function extHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const vid = s.villagerId || Game.villagerId;
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.takes || {})[vid]) || 0), Math.round(((v.gives || {})[vid]) || 0),
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)
    ].join('|');
  } catch (e) { return 'ERR'; }
}

// The benevolent-pilot food gossip line, in any variant. Matches both the
// pre-fix single template and the armed variants.
function isPilotFoodLine(t) {
  const s = String(t || '');
  return /leaving food out|written all over it/.test(s) && /^💬/.test(s);
}

async function oneRun(pid, seed) {
  const base = PMAP[pid];
  if (!base) throw new Error('unknown policy ' + pid);
  const policy = Object.assign({}, base);
  const od = base.daily, ou = base.upkeep, os = base.setup;
  const hashes = [];
  const gossip = [];
  let sayHookErr = 0, runCtx = null;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everWon: false, maxWave: 1 };
  const deaths = {};
  let survivedDays = 0;
  policy.setup = (G, ctx) => { runCtx = ctx; return os ? os(G, ctx) : undefined; };
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
      if (pg.tableWaiting) hist.everTable = true;
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0);
      if (G.won) hist.everWon = true;
      try { hist.maxWave = Math.max(hist.maxWave, G.unlockedWave ? G.unlockedWave() : 1); } catch (e) {}
    } catch (e) {}
    try { hashes.push(G.state.scholar.day + ':' + extHash(G)); } catch (e) {}
    return od ? od(G, ctx) : undefined;
  };
  if (ou) policy.upkeep = (G, ctx) => ou(G, ctx);
  let result = null;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed, mode: 'ambientfix-' + SIDE });
    await setupGame(Game);
    const oSay = Game.say;
    try {
      Game.say = function (t) {
        try { if (isPilotFoodLine(t)) gossip.push({ day: (this.state.scholar || {}).day || 0, text: String(t) }); } catch (e) { sayHookErr++; }
        return oSay.apply(this, arguments);
      };
      result = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });
    } finally {
      Game.say = oSay;
    }
  });
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  try { survivedDays = result.gameDays || result.days || 0; } catch (e) {}
  const distinctTexts = {};
  for (const g of gossip) distinctTexts[g.text] = (distinctTexts[g.text] || 0) + 1;
  return {
    policy: pid, seed, side: SIDE,
    days: result.days, gameDays: survivedDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0, exiled: result.samples && result.samples.exiled ? 1 : 0,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave, wave45: hist.maxWave >= 4 ? 1 : 0,
    medianSurvival: survivedDays,
    deaths, hashes,
    gossipFirings: gossip.length, gossipDistinct: Object.keys(distinctTexts).length,
    gossipSamples: Object.keys(distinctTexts).slice(0, 8),
    sayHookErr,
  };
}

async function main() {
  if (OUT) fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const out = await oneRun(pid, seed);
      rows.push(out);
      if (OUT) fs.writeFileSync(path.join(OUT, `${SIDE}-${pid}-s${seed}.json`), JSON.stringify(out, null, 1));
      console.log(`  ${SIDE} ${pid} s${seed}: ${out.days}d/${out.gameDays}gd end=${out.endReason} nat=${out.national} table=${out.table} win=${out.wins} wave=${out.maxWave} gossip=${out.gossipFirings}/${out.gossipDistinct} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  if (OUT) fs.writeFileSync(path.join(OUT, `${SIDE}-summary.json`), JSON.stringify(rows.map(r => {
    const s = Object.assign({}, r); delete s.hashes; return s;
  }), null, 1));
  console.log(`\n${SIDE}: ${rows.length} runs, gossip firings ${rows.reduce((a, r) => a + r.gossipFirings, 0)}, sayHookErr ${rows.reduce((a, r) => a + r.sayHookErr, 0)}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
