#!/usr/bin/env node
// snaremat-pilot-20261013.js — sim-snaremat arm pilot (flesh-out loop A).
// ARM 3 (snaremat), food-economy axis, DATA-SIDE. Before/after on IDENTICAL
// seeds, staged per docs/MEASUREMENT.md §§9-12.
//
// Pre-registered:
//   Primary metric: player trapline counters — trapsCrafted (blind +
//     reliable), trapsSet, trapsWireSet (the honest-tackle wire path), and
//     playerSnareLevel. Secondary: vine/stick banking (max held), wire ever
//     held, NPC trapline (npc_trap), knowers.
//   GO thresholds: trapsCrafted >= 1 on >= 2/8 seeds (baseline 0/24 across
//     r17) AND the wire path reachable end-to-end (trapsWireSet >= 1 OR
//     wire offered in a starting pool + E3b engine path green) AND no
//     survival regression (median within +/-10d of baseline).
//   KILL: trapsCrafted 0/8 after both halves, or median regression > 10d.
//   Horizon: 150d death-aware (Game.over stops the run; dead villages stop
//     simulating — no fixed-200d tail-chasing).
//   Seeds: 11, 22, 33, 44, 55, 66, 77, 88 x belongseek/leadcourt (16 runs).
//   Policies: belongseek, leadcourt (competent-based, work the trapline).
//   All opt-in gates OFF (defaults; no COMPETENT_*=1 env set).
// Convergence: killed-at-pilot if GO fails on both halves; converging ->
//   12-16 seed confirm.
//
// Usage:
//   LABEL=baseline OUTDIR=evidence/2026-10-13 node scripts/snaremat-pilot-20261013.js
//   SEEDS=11,22 POLICIES=belongseek node ...   # subset
// Writes: <OUTDIR>/snaremat-pilot-<LABEL>.json (rows + wall aggregates for
// the telemetry deviation check).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const REGISTRY = { belongseek, leadcourt };
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [11, 22, 33, 44, 55, 66, 77, 88]);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['belongseek', 'leadcourt']);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const LABEL = process.env.LABEL || 'run';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-13');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const TRAP_IDS = /^(snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap)$/;

function knowerCount(Game) {
  const v = Game.state.village || {};
  let n = 0;
  for (const vid of (v.roster || [])) {
    try { if (Game.vpOf && Game.vpOf(vid) && Game.vpOf(vid).knowsSnare) n++; } catch (e) {}
  }
  return n;
}
function teleCount(Game, type) {
  return (Game.state.telemetry || []).filter(e => e.type === type);
}
function packMat(Game, m) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
  } catch (e) { return 0; }
}
function wireInPack(Game) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .some(i => i && (i.itemId === 'snare_wire' || i.id === 'snare_wire'));
  } catch (e) { return false; }
}
function stdSnapshot(Game) {
  const out = { won: false, tableWaiting: false, rank: 'village', exiled: false };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.exiled = !!(Game.state && Game.state.exiled); } catch (e) {}
  return out;
}

async function oneRun(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'snaremat-pilot' });
  await setupGame(Game);
  const knowers0 = knowerCount(Game);
  const scholarOcc = (Game.vpOf && Game.vpOf(Game.villagerId) || {}).occupationId || '?';
  const policy = Object.assign({}, REGISTRY[policyId]);
  // --- measurement wrappers (no behavior change) ---
  let playerCrafted = 0, playerSet = 0, wireSets = 0, blindAttempts = 0;
  let vineMax = 0, stickMax = 0, wireEverHeld = wireInPack(Game);
  const hist = { maxRank: 0, everTable: false, everWon: false, everExiled: false };
  try {
    const _craft = Game.craft.bind(Game), _setTrap = Game.setTrap.bind(Game);
    Game.craft = function (id) {
      if (TRAP_IDS.test(id)) blindAttempts++;
      const r = _craft.apply(this, arguments);
      if (r && TRAP_IDS.test(id)) playerCrafted++;
      return r;
    };
    Game.setTrap = function (id) {
      const hadWire = wireInPack(Game);
      const r = _setTrap.apply(this, arguments);
      if (r) {
        playerSet++;
        if (hadWire && !wireInPack(Game)) wireSets++;
      }
      return r;
    };
  } catch (e) {}
  const origDaily = policy.daily;
  policy.daily = function (G, ctx) {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      if (s.tableWaiting) hist.everTable = true;
      if (s.won) hist.everWon = true;
      if (s.exiled) hist.everExiled = true;
      vineMax = Math.max(vineMax, packMat(G, 'vine'));
      stickMax = Math.max(stickMax, packMat(G, 'stick'));
      if (wireInPack(G)) wireEverHeld = true;
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };
  const res = await runDays(Game, policy, { days: DAYS, manifest: { seed, policy: policyId } });
  const sday = (Game.state.scholar || {}).day || 0;
  const npcTrap = teleCount(Game, 'npc_trap');
  const snareLesson = teleCount(Game, 'snare_lesson');
  const overhear = teleCount(Game, 'snare_overhear');
  const end = stdSnapshot(Game);
  hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0);
  if (end.tableWaiting) hist.everTable = true;
  if (end.won) hist.everWon = true;
  if (end.exiled) hist.everExiled = true;
  return {
    seed, policy: policyId, label: LABEL,
    survivalDays: sday, over: !!Game.over,
    pop: ((Game.state.village || {}).roster || []).length,
    knowers0, knowersEnd: knowerCount(Game), scholarOcc,
    npcTrapEvents: npcTrap.length,
    npcTrapCatches: npcTrap.filter(e => e.caught).length,
    snareLessons: snareLesson.length,
    snareOverhears: overhear.length,
    playerSnareLevel: (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0,
    trapsCrafted: playerCrafted,
    blindCraftAttempts: blindAttempts,
    trapsSet: playerSet,
    trapsWireSet: wireSets,
    wireEverHeld: wireEverHeld ? 1 : 0,
    vineMax, stickMax,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0,
    exiled: hist.everExiled ? 1 : 0,
    waveReach: res.maxWaveUnlocked || 1,
    deaths: ((res.samples || {}).deaths || []).length,
  };
}

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of POLICIES) {
      console.log(`--- ${LABEL} seed=${seed} policy=${pid} ---`);
      const t0 = Date.now();
      try {
        const row = await oneRun(seed, pid);
        rows.push(row);
        console.log(`  survival=${row.survivalDays}d pop=${row.pop} knowers ${row.knowers0}->${row.knowersEnd} craft=${row.trapsCrafted} set=${row.trapsSet} wireSet=${row.trapsWireSet} wireHeld=${row.wireEverHeld} vineMax=${row.vineMax} stickMax=${row.stickMax} snareL=${row.playerSnareLevel} nat=${row.national} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.log(`  ERROR ${e.message}`);
        rows.push({ seed, policy: pid, label: LABEL, error: String(e.message).slice(0, 200) });
      }
    }
  }
  const good = rows.filter(r => !r.error);
  const flat = {
    national: good.reduce((t, r) => t + (r.national || 0), 0),
    table: good.reduce((t, r) => t + (r.table || 0), 0),
    wins: good.reduce((t, r) => t + (r.wins || 0), 0),
    exiled: good.reduce((t, r) => t + (r.exiled || 0), 0),
    trapsCrafted: good.reduce((t, r) => t + (r.trapsCrafted || 0), 0),
    trapsSet: good.reduce((t, r) => t + (r.trapsSet || 0), 0),
    trapsWireSet: good.reduce((t, r) => t + (r.trapsWireSet || 0), 0),
    seedsWithCraft: good.filter(r => (r.trapsCrafted || 0) >= 1).map(r => r.seed + '/' + r.policy),
    medianSurvival: median(good.map(r => r.survivalDays)),
    npcTrapEvents: good.reduce((t, r) => t + (r.npcTrapEvents || 0), 0),
  };
  const out = { label: `snaremat-pilot-${LABEL}`, days: DAYS, seeds: SEEDS, policies: POLICIES, rows, flat };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const p = path.join(OUTDIR, `snaremat-pilot-${LABEL}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 1));
  console.log('wrote', p);
  console.log('FLAT', JSON.stringify(flat));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
