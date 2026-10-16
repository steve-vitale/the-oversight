#!/usr/bin/env node
// scripts/sweep-crumbdefault-20261016.js — paired sweep for the
// no-fractionating DEFAULT arm (sim-crumbdefault-b, food-economy axis).
//
// Census shape: SEEDS x {leadcourt,belongseek} x {control,armed}, 180d
// death-aware, SEATDRIVE=0 (pre-seat courtship substrate; this driver does
// not compose seatdrive — pure delegation by construction).
//
// ARMED=1  -> game.js has the fix; wrapper counts whole-piece crumb takes
//             via the out.items detector (exact: i>0 && needBefore>0 &&
//             floor(needBefore/effectiveKcal)==0 && units>=1 is precisely
//             the case the old code refused).
// ARMED!=1 -> game.js is PRISTINE + the stoppedRefusals instrument patch;
//             wrapper sums out.stoppedRefusals (the TRUE refusal count).
//             FAILS LOUDLY if the instrument is absent (a zero count would
//             silently void the coverage gate).
//
// Both wrappers consume no Math.random: trajectories are identical to the
// uninstrumented engine on the same seeds.
//
// Also snapshots per run: freeloadStage2 (villagers at freeloader stage>=2)
// for the freeloader guardrail.
//
// Usage (chunked — 4 seeds per invocation to bound memory):
//   SEATDRIVE=0 ARMED=0 SEEDS="3101,3102,3103,3104" POLICIES="leadcourt,belongseek" \
//     DAYS=180 OUT=<out.json> CENSUS_DIR=<census-dir> node scripts/sweep-crumbdefault-20261016.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');

const POLICY_REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const ARMED = process.env.ARMED === '1';

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'crumbdefault-' + (ARMED ? 'armed' : 'control') + '-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const cen = installShareCensus(Game);
  // Mechanism counter: instrument read (control) or exact detector (armed).
  const oDraw = Game.pantryDraw;
  let mech = 0;
  Game.pantryDraw = function (v, want, opts) {
    const out = oDraw.apply(this, arguments);
    if (!ARMED) {
      if (out && out.stoppedRefusals) mech += out.stoppedRefusals;
    } else if (opts && opts.round === 'floor1' && out && out.items) {
      // Bit-identical replay of the engine's need chain: same operands, same
      // order (need -= units*effectiveKcal per item), so needBefore/ek matches
      // the engine's Math.floor(need / effectiveKcal) exactly — no epsilon
      // drift, no false positives at integer boundaries.
      let need = want;
      for (let i = 0; i < out.items.length; i++) {
        const it = out.items[i];
        const ek = it.effectiveKcal || 1;
        const needBefore = need;
        if (i > 0 && needBefore > 0 && Math.floor(needBefore / ek) === 0 && (it.units || 0) >= 1) mech++;
        need -= (it.units || 0) * ek;
      }
    }
    return out;
  };
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  Game.pantryDraw = oDraw;
  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let hungry = 0, exiled = 0, freeloadStage2 = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try {
    const vv = Game.state.village || {};
    for (const vid of (vv.roster || [])) {
      if (((vv.freeload || {})[vid] || {}).stage >= 2) freeloadStage2++;
    }
  } catch (e) {}
  const rows = cen.rows.map(r => {
    const c = classify(r);
    return { day: r.day, vid: r.vid, name: r.name, order: r.order, trust: r.trust,
      trustFactor: r.trustFactor, healthBefore: r.healthBefore, healthAfter: r.healthAfter,
      hungerBefore: r.hungerBefore, hungerAfter: r.hungerAfter, away: r.away,
      rhythm: r.rhythm, kcalPerDay: r.kcalPerDay, need: Math.round(r.need),
      ate: Math.round(r.ate), drew: Math.round(r.drew), gave: Math.round(r.gave),
      ownEat: Math.round(r.ownEat || 0), fasting: r.fasting,
      pantryDrawCalled: r.pantryDrawCalled, spoiledCalled: r.spoiledCalled,
      spoiledTook: Math.round(r.spoiledTook || 0), packMealCalled: r.packMealCalled,
      pantryFreshBefore: Math.round(r.pantryFreshBefore), pantryFreshAfter: Math.round(r.pantryFreshAfter),
      path: r.path, starved: c.starved, starvePath: c.starvePath };
  });
  cen.uninstall();
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, hungryDays: hungry, freeloadStage2,
    mech, mechKind: ARMED ? 'crumbTakes' : 'stoppedRefusals',
    skips: cen.skips.map(s => ({ day: s.day, vid: s.vid, name: s.name, path: s.path, trust: s.trust })),
    rows,
  };
}

async function main() {
  const label = process.env.LEVER || ('crumbdefault-' + (ARMED ? 'armed' : 'control'));
  // FAIL LOUD: control needs the stoppedRefusals instrument on game.js.
  if (!ARMED) {
    const { Game } = await loadGame({ seed: 1, mode: 'crumbdefault-instrument-check', fullTelemetry: false });
    if (!Game.pantryDraw.toString().includes('stoppedRefusals')) {
      console.error('FATAL: control sweep requires the stoppedRefusals instrument on src/js/game.js (patch dance). Refusing to run with a void coverage gate.');
      process.exit(1);
    }
    console.log('instrument check: stoppedRefusals present on pristine game.js');
  }
  const seeds = (process.env.SEEDS || '3101').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const censusDir = process.env.CENSUS_DIR || null;
  if (censusDir) fs.mkdirSync(censusDir, { recursive: true });
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const t0 = Date.now();
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    let starved = 0; const paths = {};
    for (const row of r.rows) if (row.starved) { starved++; paths[row.starvePath] = (paths[row.starvePath] || 0) + 1; }
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} ` +
      `starved=${starved} ${r.mechKind}=${r.mech} freeload2=${r.freeloadStage2} hungry=${r.hungryDays} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    if (censusDir) {
      fs.writeFileSync(`${censusDir}/${label}-${pid}-s${seed}-census.json`,
        JSON.stringify({ policy: pid, seed, days: r.days, endReason: r.endReason, mech: r.mech, mechKind: r.mechKind, freeloadStage2: r.freeloadStage2, rows: r.rows, skips: r.skips }));
    }
    r.rows = r.rows.length; // slim for the OUT json
    r.skips = r.skips.length;
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, pids, days, armed: ARMED, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
