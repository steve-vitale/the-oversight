#!/usr/bin/env node
// scripts/sweep-snareskill-20261019.js — SIM-SNARESKILL-B pilot sweep
// (lever loop B, 2026-10-19, axis: survival/trapline — backlog #631)
//
// PRE-REGISTRATION (binding, §14 — written BEFORE sims; full header in
// evidence/2026-10-19/sim-snareskill-b.md):
//   CONTEXT: backlog #631 claimed snare_wire L2/L3 `trap_success` mechanicals
//     (0.2/0.4) are dormant (zero callers in src/js). Code audit + RED/GREEN
//     probe (scripts/test-snareskill-trapsuccess.js) showed the 2026-10-10
//     break-it sweep ALREADY wired them: `trap_success` -> `hunt.trap_catch`
//     (add) in KNOWLEDGE_MOD_MAP, read at game.js:3631 checkTraps via
//     modTarget, cumulative +0.2 (L2) / +0.6 (L3), capped at 0.95. Probe GREEN
//     on current code (0.4 -> 0.6 -> 1.0). THIS SWEEP MEASURES THE WIRED
//     MECHANIC'S SIM-LEVEL EFFECT — there is no code change in this arm.
//   PRIMARY = per-trap-check snare success rate (player tile traps, checks
//     with eligible game only) on identical seeds, control vs armed.
//     armed = snare_wire L3 granted at day 0 via direct codex write
//     (RNG-neutral; learnSkill's say/drama/audio side effects avoided so the
//     seeded RNG streams stay identical across arms).
//     Pooled across both roads.
//     GO = armed rate >= control rate + 8 percentage points.
//     KILL (mark #631 killed/no-signal) otherwise.
//   VALIDITY (engagement floor): >= 50 eligible trap-checks per arm-road cell,
//     else "inconclusive — channel starved", NOT the trajectory verdict.
//   GUARDRAILS (per road vs own control): no new death mode (a cause with n>=2
//     in armed and absent from control); starvation deaths <= control+2;
//     rot kcal <= control x 1.15; median survival report-only.
//   SECONDARY: wall numbers (national/table/wins/exiled), wave reach 1-5, Arc
//     reach, death-cause shares, trap kcal contribution, villager-people read.
//   DESIGN: 8 FRESH seeds [5301-5308] x {leadfeast, belongfeast} x
//     {control, armed} = 32 runs, 180d death-aware, FEASTSCALE_R13=1,
//     SEATDRIVE=0. Own in-sweep comparisons: identical seeds across all cells
//     (aidfeastint precedent for runtime-gated arms).
//
// Usage:
//   SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-snareskill-20261019.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-snareskill-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 required (pre-seat substrate).'); process.exit(2); }

const SMOKE = process.env.SMOKE === '1';
// FARM=1: focused trapline instrument. The pre-reg'd policy sweep measures the
// organic channel; the 180d engagement probe (4 runs, ~600 run-days, ZERO traps
// set — the snare recipe L1 bootstrap never fires: witnessing needs a set trap,
// the villager teach needs trust 15+) tripped the pre-reg's own engagement
// floor. The farm bypasses the starved bootstrap and measures the MECHANIC
// directly: a maintained 8-tile snare line on game-rich tiles, re-tied when a
// snare breaks (as a trapper would), resolved by the REAL checkTraps every
// dawn under real shyness/regrowth/depletion. Placement + maintenance are the
// instrument (documented); the roll is 100% game code. Guardrails stay on the
// policy sweep (the farm perturbs the food economy by design).
const FARM = process.env.FARM === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [5301, 5302, 5303, 5304, 5305, 5306, 5307, 5308]).filter(Number.isFinite);
const DAYS = SMOKE ? 15 : 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', FARM ? 'perseed-snareskill-farm' : 'perseed-snareskill');
try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}

const CELLS = FARM ? [
  { key: 'lead_control', road: 'lead', armed: false, policy: leadfeast },
  { key: 'lead_armed', road: 'lead', armed: true, policy: leadfeast },
] : [
  { key: 'lead_control', road: 'lead', armed: false, policy: leadfeast },
  { key: 'lead_armed', road: 'lead', armed: true, policy: leadfeast },
  { key: 'belong_control', road: 'belong', armed: false, policy: belongfeast },
  { key: 'belong_armed', road: 'belong', armed: true, policy: belongfeast },
];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const _CELLS_ALL = CELLS.slice();
CELLS.length = 0;
CELLS.push(...(process.env.ONLY ? _CELLS_ALL.filter(c => process.env.ONLY.split(',').includes(c.key)) : _CELLS_ALL));
if (process.env.ONLY && !CELLS.length) { console.error('SWEEP STOP: ONLY matched no cells.'); process.exit(2); }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

// FARM placement: a maintained 8-tile snare line. Trap objects use exactly the
// shape setTrap pushes ({recipeId, mx, my, setDay, uses}); crafted-snare
// durability (10 uses). Tiles are game-rich wild tiles (snare-eligible species
// present). Tile scan consumes seeded RNG identically in both arms (same seed,
// same call order) — streams stay aligned.
const SNARE_CATCHES = ['cottontail_rabbit', 'gray_squirrel', 'opossum'];
function placeFarm(Game) {
  const tiles = [];
  for (let y = 0; y < 9 && tiles.length < 8; y++) for (let x = 0; x < 9 && tiles.length < 8; x++) {
    let t = null;
    try { t = Game.tileAt(x, y); } catch (e) { continue; }
    if (!t || t.type === 'haven' || t.type === 'ruin') continue;
    let wl = null;
    try { wl = t.wildlife || (Game.backfillWildlife ? Game.backfillWildlife(t, x, y) : {}); } catch (e) { wl = {}; }
    if (SNARE_CATCHES.some(sid => (wl[sid] || 0) > 0)) tiles.push({ x, y });
  }
  const day = gday(Game);
  for (const { x, y } of tiles) {
    const t = Game.tileAt(x, y);
    t.traps = t.traps || [];
    t.traps.push({ recipeId: 'snare', mx: 4, my: 4, setDay: day, uses: 10, farm: true });
  }
  Game.__farmTiles = tiles;
  return tiles.length;
}
// FARM maintenance: after each dawn check, re-tie broken farm snares (a
// trapper maintains their line). Shyness is per-tile (t.trapShy), not per-trap,
// so replacing the trap object keeps the real declining-returns dynamics.
function maintainFarm(Game) {
  const tiles = Game.__farmTiles || [];
  const day = gday(Game);
  for (const { x, y } of tiles) {
    let t = null;
    try { t = Game.tileAt(x, y); } catch (e) { continue; }
    if (!t) continue;
    t.traps = t.traps || [];
    const live = t.traps.some(tr => tr && tr.recipeId === 'snare' && tr.farm && (tr.uses == null || tr.uses > 0));
    if (!live) t.traps.push({ recipeId: 'snare', mx: 4, my: 4, setDay: day, uses: 10, farm: true });
  }
}

// per-run instruments: trap checks/catches, rot, transcript capture
function instrument(Game, opts) {
  const W = { trapChecks: 0, trapCatches: 0, trapKcal: 0, rotFresh: 0, rotPreserved: 0, starveDeaths: 0, transcript: [], farmTiles: 0 };
  // TRAP CHECKS: count eligible rolls by pre-scanning tiles exactly the way
  // checkTraps filters them (setDay<=day, recipe exists, eligible game on tile).
  // backfillWildlife is idempotent per tile (cached on t.wildlife), so warming
  // it here consumes the same RNG checkTraps would — same calls, same order.
  const oCheck = Game.checkTraps;
  if (typeof oCheck === 'function') Game.checkTraps = function () {
    try {
      const day = gday(Game);
      for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
        const t = Game.tileAt(x, y);
        if (!t || !t.traps || !t.traps.length) continue;
        for (const trap of t.traps) {
          if (trap.setDay > day) continue;
          const recipe = (Game.data.recipes || []).find(r => r.id === trap.recipeId);
          if (!recipe) continue;
          const wl = t.wildlife || (Game.backfillWildlife ? Game.backfillWildlife(t, x, y) : {});
          const eligible = (recipe.catches || []).filter(sid => (wl[sid] || 0) > 0);
          if (eligible.length) W.trapChecks++;
        }
      }
    } catch (e) {}
    const r = oCheck.apply(this, arguments);
    try { if (FARM) maintainFarm(Game); } catch (e) {}
    return r;
  };
  // TRAP CATCHES: every player-trap catch notes a 'trapping' deed (game.js:3661),
  // and every trapped carcass is built with how='trapped' (food.js) — the
  // kcal counter rides that second channel.
  const oDeed = Game.noteDeed;
  if (typeof oDeed === 'function') Game.noteDeed = function (kind) {
    try { if (kind === 'trapping') W.trapCatches++; } catch (e) {}
    return oDeed.apply(this, arguments);
  };
  const oCarc = Game.foodCarcass;
  if (typeof oCarc === 'function') Game.foodCarcass = function (animal, kcal, day, how) {
    try { if (how === 'trapped') W.trapKcal += (kcal || 0); } catch (e) {}
    return oCarc.apply(this, arguments);
  };
  // ROT: same classifier as the aidfeastint sweep.
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') W.rotPreserved += k;
          else W.rotFresh += k;
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };
  // TRANSCRIPT (sense-testing): capture the full say-log on catch days for the
  // designated seed only, so one trap-day can be read for plausibility.
  const oSay = Game.say;
  if (typeof oSay === 'function' && opts.captureTranscript) Game.say = function (msg) {
    try { W.transcript.push({ day: gday(Game), msg: String(msg) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  return W;
}

async function oneRun(cellDef, seed) {
  const base = cellDef.policy;
  const { Game } = await loadGame({ seed, mode: 'snareskill-' + cellDef.key, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game, { captureTranscript: (seed === 5301 && cellDef.key === 'lead_armed') });
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx;
    if (cellDef.armed) {
      // ARMED INSTRUMENT: snare_wire L3 at day 0. Direct codex write (not
      // learnSkill) — RNG-neutral, so identical seeds stay comparable.
      try {
        G.state.codex.skills = G.state.codex.skills || {};
        G.state.codex.skills.snare_wire = { level: 3, learnedDay: 0, via: 'sweep-armed-instrument' };
      } catch (e) {}
    }
    if (FARM) { try { W.farmTiles = placeFarm(G); } catch (e) {} }
    if (origSetup) return origSetup(G, ctx);
  };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  let villagerDays = 0, trapsSet = 0, trapsWireSet = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      villagerDays += (((G.state.village || {}).roster || []).length) || 0;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) W.starveDeaths++;
    }
  } catch (e) {}
  let hungry = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { if (runCtx) { trapsSet = runCtx.trapsSet || 0; trapsWireSet = runCtx.trapsWireSet || 0; } } catch (e) {}
  const row = {
    key: cellDef.key, road: cellDef.road, armed: cellDef.armed ? 1 : 0, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths: W.starveDeaths,
    trapChecks: W.trapChecks, trapCatches: W.trapCatches,
    trapKcal: W.trapKcal, farmTiles: W.farmTiles,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    trapsSet, trapsWireSet, villagerDays, hungryDays: hungry,
  };
  fs.writeFileSync(path.join(OUTDIR, `snareskill-${cellDef.key}-s${seed}.json`), JSON.stringify(row, null, 1) + '\n');
  if (W.transcript.length) {
    fs.writeFileSync(path.join(OUTDIR, `snareskill-transcript-${cellDef.key}-s${seed}.json`), JSON.stringify(W.transcript, null, 1) + '\n');
  }
  return row;
}

async function smokeGate() {
  console.log('SMOKE GATE: 15d, seed 5301, all 4 cells.');
  for (const cellDef of CELLS) {
    const row = await oneRun(cellDef, 5301);
    const ok = row.trapChecks > 0;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} [${cellDef.key}] trapChecks=${row.trapChecks} trapCatches=${row.trapCatches} days=${row.days} end=${row.endReason}`);
    if (!ok) { console.log('SMOKE STOP: trap instrument counted zero checks.'); process.exit(1); }
  }
  console.log('SMOKE GATE: instruments count — safe to measure.');
}

function verdict(rows) {
  const cells = {};
  for (const r of rows) (cells[r.key] = cells[r.key] || []).push(r);
  const rate = rs => { const c = rs.reduce((t, r) => t + r.trapChecks, 0), k = rs.reduce((t, r) => t + r.trapCatches, 0); return c ? k / c : null; };
  const out = { perCell: {}, go: null, inconclusive: false, guardrails: {} };
  for (const [key, rs] of Object.entries(cells)) {
    const checks = rs.reduce((t, r) => t + r.trapChecks, 0);
    const catches = rs.reduce((t, r) => t + r.trapCatches, 0);
    out.perCell[key] = { n: rs.length, checks, catches, rate: rate(rs) };
  }
  // engagement floor
  const floorMiss = Object.entries(out.perCell).filter(([k, v]) => v.checks < 50).map(([k]) => k);
  if (floorMiss.length) { out.inconclusive = true; out.floorMiss = floorMiss; return out; }
  const roads = [...new Set(Object.values(CELLS).map(c => c.road))];
  out.deltas = {};
  for (const road of roads) {
    const ck = road + '_control', ak = road + '_armed';
    if (out.perCell[ck] && out.perCell[ak]) out.deltas[road] = out.perCell[ak].rate - out.perCell[ck].rate;
  }
  let poolC = 0, poolK = 0, poolA = 0, poolAK = 0;
  for (const road of roads) {
    const C = out.perCell[road + '_control'], A = out.perCell[road + '_armed'];
    if (!C || !A) continue;
    poolC += C.checks; poolK += C.catches; poolA += A.checks; poolAK += A.catches;
  }
  const pooledDelta = (poolAK / poolA) - (poolK / poolC);
  out.deltas.pooled = pooledDelta;
  out.go = pooledDelta >= 0.08;
  // guardrails per road
  for (const road of roads) {
    const C = cells[road + '_control'], A = cells[road + '_armed'];
    if (!C || !A) continue;
    const cCauses = {}, aCauses = {};
    for (const r of C) for (const [k, v] of Object.entries(r.deaths)) cCauses[k] = (cCauses[k] || 0) + v;
    for (const r of A) for (const [k, v] of Object.entries(r.deaths)) aCauses[k] = (aCauses[k] || 0) + v;
    const newModes = Object.keys(aCauses).filter(k => (aCauses[k] >= 2) && !(cCauses[k] >= 1));
    const cStarve = C.reduce((t, r) => t + r.starveDeaths, 0), aStarve = A.reduce((t, r) => t + r.starveDeaths, 0);
    const cRot = C.reduce((t, r) => t + r.rotFresh + r.rotPreserved, 0), aRot = A.reduce((t, r) => t + r.rotFresh + r.rotPreserved, 0);
    out.guardrails[road] = {
      newDeathModes: newModes, starveDeaths: { control: cStarve, armed: aStarve, ok: aStarve <= cStarve + 2 },
      rot: { control: cRot, armed: aRot, ok: cRot === 0 ? aRot === 0 : aRot <= cRot * 1.15 },
    };
  }
  return out;
}

async function main() {
  if (SMOKE) { await smokeGate(); return; }
  const rows = [];
  const t0 = Date.now();
  for (const cellDef of CELLS) {
    for (const seed of SEEDS) {
      const row = await oneRun(cellDef, seed);
      rows.push(row);
      console.log(`  [${cellDef.key}] s${seed}: checks=${row.trapChecks} catches=${row.trapCatches} days=${row.days} end=${row.endReason} (${Math.round((Date.now() - t0) / 1000)}s)`);
    }
  }
  const v = verdict(rows);
  fs.writeFileSync(path.join(OUTDIR, 'snareskill-verdict.json'), JSON.stringify({ verdict: v, rows }, null, 1) + '\n');
  console.log('\n=== VERDICT ===');
  console.log(JSON.stringify(v, null, 1));
  const ms = Date.now() - t0;
  console.log(`\n${rows.length} runs in ${Math.round(ms / 1000)}s (${(ms / rows.length / 1000).toFixed(1)}s/run).`);
}

main().catch(e => { console.error('SWEEP FAILED:', e); process.exit(2); });
