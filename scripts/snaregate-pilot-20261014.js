#!/usr/bin/env node
// snaregate-pilot-20261014.js — sim-snaregate arm pilot (flesh-out loop A).
// ARM 2 (food-economy axis), POLICY-SIDE. Blind-craft gate softening.
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   Primary metric: trapsCrafted (improvised snares) — the policy craft path.
//   GO: armed >= 2x baseline crafts AND >= 2 crafts on >= 4/8 armed seeds.
//   Guardrail: median survival no worse than -10d vs baseline (the r16b trap
//     lesson: extra outings kill scholars); starvation/combat deaths tallied
//     separately for the player.
//   KILL: a miss on primary OR guardrail -> delete the layer before commit,
//     keep only the evidence (killed arms leave no trace).
//   Horizon: 150d death-aware (Game.over stops the run; dead villages stop
//     simulating). Seeds: 11, 22, 33, 44, 55, 66, 77, 88 x competent,
//     belongseek (16 runs/side, IDENTICAL seeds baseline vs armed).
//   Sides: baseline = SNARECRAFT_GATE unset (default OFF); armed =
//     SNARECRAFT_GATE=1. Code identical otherwise (same commit).
//   Convergence: converging -> 12-16 seed confirm if GO met; killed-at-pilot
//     otherwise.
//
// Usage:
//   LABEL=baseline OUTDIR=evidence/2026-10-14 node scripts/snaregate-pilot-20261014.js
//   LABEL=armed SNARECRAFT_GATE=1 OUTDIR=evidence/2026-10-14 node scripts/snaregate-pilot-20261014.js
// Writes: <OUTDIR>/snaregate-pilot-<LABEL>.json (rows + flat aggregates for
// the telemetry deviation check).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');

const REGISTRY = { competent, belongseek };
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [11, 22, 33, 44, 55, 66, 77, 88]);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['competent', 'belongseek']);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const LABEL = process.env.LABEL || 'run';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-14');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const TRAP_IDS = /^(snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap)$/;

function packMat(Game, m) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
  } catch (e) { return 0; }
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
  const { Game } = await loadGame({ seed, mode: 'snaregate-pilot' });
  await setupGame(Game);
  const policy = Object.assign({}, REGISTRY[policyId]);
  // --- measurement wrappers (no behavior change) ---
  let playerCrafted = 0, playerSet = 0, snareAttempts = 0;
  let vineMax = 0, stickMax = 0;
  const hist = { maxRank: 0, everTable: false, everWon: false, everExiled: false };
  try {
    const _craft = Game.craft.bind(Game), _setTrap = Game.setTrap.bind(Game);
    Game.craft = function (id) {
      if (id === 'snare') snareAttempts++;
      const r = _craft.apply(this, arguments);
      if (r && TRAP_IDS.test(id)) playerCrafted++;
      return r;
    };
    Game.setTrap = function (id) {
      const r = _setTrap.apply(this, arguments);
      if (r) playerSet++;
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
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };
  const res = await runDays(Game, policy, { days: DAYS, manifest: { seed, policy: policyId } });
  const sday = (Game.state.scholar || {}).day || 0;
  const end = stdSnapshot(Game);
  hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0);
  if (end.tableWaiting) hist.everTable = true;
  if (end.won) hist.everWon = true;
  if (end.exiled) hist.everExiled = true;
  const deaths = ((res.samples || {}).deaths || []);
  const playerDeathCauses = deaths.filter(d => d.player).map(d => String(d.cause || d.kind || 'unknown'));
  return {
    seed, policy: policyId, label: LABEL,
    survivalDays: sday, over: !!Game.over,
    pop: ((Game.state.village || {}).roster || []).length,
    playerSnareLevel: (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0,
    trapsCrafted: playerCrafted,
    snareCraftAttempts: snareAttempts,
    trapsSet: playerSet,
    vineMax, stickMax,
    playerDeathCauses,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0,
    exiled: hist.everExiled ? 1 : 0,
    waveReach: res.maxWaveUnlocked || 1,
    deaths: deaths.length,
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
        console.log(`  survival=${row.survivalDays}d pop=${row.pop} craft=${row.trapsCrafted} snareAtt=${row.snareCraftAttempts} set=${row.trapsSet} vineMax=${row.vineMax} stickMax=${row.stickMax} snareL=${row.playerSnareLevel} pdeaths=[${row.playerDeathCauses.join(',')}] nat=${row.national} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
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
    snareCraftAttempts: good.reduce((t, r) => t + (r.snareCraftAttempts || 0), 0),
    trapsSet: good.reduce((t, r) => t + (r.trapsSet || 0), 0),
    seedsWithCraft: good.filter(r => (r.trapsCrafted || 0) >= 1).map(r => r.seed + '/' + r.policy),
    seedsWith2Crafts: good.filter(r => (r.trapsCrafted || 0) >= 2).map(r => r.seed + '/' + r.policy),
    medianSurvival: median(good.map(r => r.survivalDays)),
    playerDeathCauses: {},
  };
  for (const r of good) for (const c of (r.playerDeathCauses || [])) flat.playerDeathCauses[c] = (flat.playerDeathCauses[c] || 0) + 1;
  const out = { label: `snaregate-pilot-${LABEL}`, days: DAYS, seeds: SEEDS, policies: POLICIES, rows, flat };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const p = path.join(OUTDIR, `snaregate-pilot-${LABEL}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 1));
  console.log('wrote', p);
  console.log('FLAT', JSON.stringify(flat));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
