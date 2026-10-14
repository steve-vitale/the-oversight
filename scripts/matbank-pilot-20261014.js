#!/usr/bin/env node
// matbank-pilot-20261014.js — sim-matbank arm pilot (flesh-out loop B).
// ARM (food-economy axis), POLICY-SIDE. Materials-banking for the snare trapline.
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   Question: sim-findings #81 — the blind-craft gate question dissolves into
//     a materials question (snaregate KILLED: 2+2 gate fired 0x on 7/8 seeds;
//     the pack never co-banks vine>=2 && stick>=2). Does deliberate
//     materials-banking (MATBANK=1: snare reserve 2+2 gates discretionary
//     vine/stick burns; below-reserve trips prefer vine-rich ground) make the
//     pack co-bank, and do blind snare crafts move?
//   Primary (1): seeds where the scholar's pack held vine>=2 && stick>=2
//     simultaneously on >=1 day. GO: >= 4/8 seeds (either policy).
//   Primary (2): blind snare crafts (snare crafts at codex snare level 1).
//     GO: armed >= 2x baseline AND armed >= 4 absolute (floor against the
//     zero-baseline softness flagged in sim-snaregate's metric review).
//   Guardrails: fires still get lit (armed firesLit >= baseline firesLit —
//     engine fires burn branch/wood/fusion only, so the arm cannot burn them;
//     parity is structural, measured anyway); knife knapping unblocked
//     (armed stone_knife crafts >= baseline); median survival no worse
//     than -10d vs baseline.
//   KILL: a miss on (1), (2), or any guardrail -> delete the layer + revert
//     the competent.js hooks, keep only the evidence (killed arms leave no trace).
//   Horizon: 150d death-aware (Game.over stops the run; dead villages stop
//     simulating — no fixed tail). Seeds: 11, 22, 33, 44, 55, 66, 77, 88 x
//     competent, belongseek (16 runs/side, IDENTICAL seeds baseline vs armed).
//   Sides: baseline = MATBANK unset (default OFF); armed = MATBANK=1.
//     Code identical otherwise, same commit.
//   Convergence: converging -> 12-16 seed confirm if GO met;
//     killed-at-pilot otherwise.
//
// Usage:
//   LABEL=baseline OUTDIR=evidence/2026-10-14 node scripts/matbank-pilot-20261014.js
//   LABEL=armed MATBANK=1 OUTDIR=evidence/2026-10-14 node scripts/matbank-pilot-20261014.js
// Writes: <OUTDIR>/matbank-pilot-<LABEL>.json (rows + flat aggregates for
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
  const { Game } = await loadGame({ seed, mode: 'matbank-pilot' });
  await setupGame(Game);
  const policy = Object.assign({}, REGISTRY[policyId]);
  // --- measurement wrappers (no behavior change) ---
  let playerCrafted = 0, playerSet = 0, snareAttempts = 0, blindSnareCrafts = 0;
  let vineMax = 0, stickMax = 0, coBanked = false, firesLit = 0, fireDays = 0;
  const craftsByRecipe = {};
  const hist = { maxRank: 0, everTable: false, everWon: false, everExiled: false };
  try {
    const _craft = Game.craft.bind(Game), _setTrap = Game.setTrap.bind(Game);
    const _makeFire = Game.makeFire ? Game.makeFire.bind(Game) : null;
    Game.craft = function (id) {
      if (id === 'snare') {
        snareAttempts++;
        try {
          const lvl = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
          if (lvl === 1) blindSnareCrafts++; // counted at attempt time (blind = L1)
        } catch (e) {}
      }
      const r = _craft.apply(this, arguments);
      craftsByRecipe[id] = (craftsByRecipe[id] || 0) + (r ? 1 : 0);
      if (r && TRAP_IDS.test(id)) playerCrafted++;
      return r;
    };
    Game.setTrap = function (id) {
      const r = _setTrap.apply(this, arguments);
      if (r) playerSet++;
      return r;
    };
    if (_makeFire) {
      Game.makeFire = function () {
        const r = _makeFire.apply(this, arguments);
        if (r) firesLit++;
        return r;
      };
    }
  } catch (e) {}
  const origDaily = policy.daily;
  policy.daily = function (G, ctx) {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      if (s.tableWaiting) hist.everTable = true;
      if (s.won) hist.everWon = true;
      if (s.exiled) hist.everExiled = true;
      const v = packMat(G, 'vine'), st = packMat(G, 'stick');
      vineMax = Math.max(vineMax, v);
      stickMax = Math.max(stickMax, st);
      if (v >= 2 && st >= 2) coBanked = true; // simultaneous 2+2 in the pack
      try { if (G.nearFire && G.nearFire()) fireDays++; } catch (e) {}
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
    blindSnareCrafts,
    craftsByRecipe,
    trapsSet: playerSet,
    vineMax, stickMax, coBanked,
    firesLit, fireDays,
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
        console.log(`  survival=${row.survivalDays}d pop=${row.pop} craft=${row.trapsCrafted} blind=${row.blindSnareCrafts} coBank=${row.coBanked ? 1 : 0} set=${row.trapsSet} vineMax=${row.vineMax} stickMax=${row.stickMax} snareL=${row.playerSnareLevel} fires=${row.firesLit} knives=${(row.craftsByRecipe || {}).stone_knife || 0} pdeaths=[${row.playerDeathCauses.join(',')}] nat=${row.national} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.log(`  ERROR ${e.message}`);
        rows.push({ seed, policy: pid, label: LABEL, error: String(e.message).slice(0, 200) });
      }
    }
  }
  const good = rows.filter(r => !r.error);
  const bySeed = {};
  for (const r of good) {
    bySeed[r.seed] = bySeed[r.seed] || { coBanked: false, blind: 0 };
    if (r.coBanked) bySeed[r.seed].coBanked = true;
    bySeed[r.seed].blind += r.blindSnareCrafts || 0;
  }
  const sumRecipe = (id) => good.reduce((t, r) => t + (((r.craftsByRecipe || {})[id]) || 0), 0);
  const flat = {
    national: good.reduce((t, r) => t + (r.national || 0), 0),
    table: good.reduce((t, r) => t + (r.table || 0), 0),
    wins: good.reduce((t, r) => t + (r.wins || 0), 0),
    exiled: good.reduce((t, r) => t + (r.exiled || 0), 0),
    maxWaveReach: Math.max.apply(null, good.map(r => r.waveReach || 1)),
    trapsCrafted: good.reduce((t, r) => t + (r.trapsCrafted || 0), 0),
    snareCraftAttempts: good.reduce((t, r) => t + (r.snareCraftAttempts || 0), 0),
    blindSnareCrafts: good.reduce((t, r) => t + (r.blindSnareCrafts || 0), 0),
    stoneKnifeCrafts: sumRecipe('stone_knife'),
    arrowCrafts: sumRecipe('arrow'),
    barkArmorCrafts: sumRecipe('bark_armor'),
    trapsSet: good.reduce((t, r) => t + (r.trapsSet || 0), 0),
    firesLit: good.reduce((t, r) => t + (r.firesLit || 0), 0),
    fireDays: good.reduce((t, r) => t + (r.fireDays || 0), 0),
    seedsCoBanked: Object.keys(bySeed).filter(s => bySeed[s].coBanked).map(Number).sort((a, b) => a - b),
    seedsWithCraft: good.filter(r => (r.trapsCrafted || 0) >= 1).map(r => r.seed + '/' + r.policy),
    seedsWith2Crafts: good.filter(r => (r.trapsCrafted || 0) >= 2).map(r => r.seed + '/' + r.policy),
    medianSurvival: median(good.map(r => r.survivalDays)),
    playerDeathCauses: {},
  };
  for (const r of good) for (const c of (r.playerDeathCauses || [])) flat.playerDeathCauses[c] = (flat.playerDeathCauses[c] || 0) + 1;
  const out = { label: `matbank-pilot-${LABEL}`, days: DAYS, seeds: SEEDS, policies: POLICIES, rows, flat };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const p = path.join(OUTDIR, `matbank-pilot-${LABEL}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 1));
  console.log('wrote', p);
  console.log('FLAT', JSON.stringify(flat));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
