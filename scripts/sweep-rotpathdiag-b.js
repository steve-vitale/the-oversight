#!/usr/bin/env node
// sweep-rotpathdiag-b.js — sim-rotpathdiag-b diagnostic sweep (DIAGNOSTIC, no lever).
//
// Root-cause instrument for sim-retagrot-b4's open questions: attributes
// fast-rot kcal by pantry call-path (Game.stockPantry vs engine stockSurplus)
// on the b4 seed set, so the numbers speak directly to the b4 puzzle
// (b3 0.28x -> confirm-b 0.56x -> b4 1.00x; lead-armed 1.32x / belong-armed
// 0.55x on seeds 5427-5434).
//
// Instrument-only (scripts/rotpathdiag-lib.js): zero src/js changes, zero new
// policy layers, zero behavior change.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 \
//   SEEDS="5427,5428,5429,5430" POLICY=leadfeast|belongfeast \
//   DAYS=180 OUT=<path> node scripts/sweep-rotpathdiag-b.js
// SURPLUSFEED must be UNSET (default-OFF base). SEATDRIVE=0 explicit.
//
// SEED PROVENANCE (deliberate, not fresh): this diagnostic reuses the b4 seed
// set 5427-5434 x {leadfeast,belongfeast} — the exact corpus whose pooled
// 1.00x killed the b4 re-tag. No fresh-seed claim is made; the sweep asserts
// SEEDS is a subset of the b4 set and exits otherwise.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachRotPathDiag } = require('./rotpathdiag-lib');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset for the diagnostic substrate');
  process.exit(2);
}

const B4SET = new Set([5427, 5428, 5429, 5430, 5431, 5432, 5433, 5434]);
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID];
if (!POLICY) { console.error('FATAL: unknown POLICY ' + POLICY_ID); process.exit(2); }
const SEEDS = (process.env.SEEDS || '5427,5428,5429,5430,5431,5432,5433,5434')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (!B4SET.has(s)) { console.error('FATAL: seed ' + s + ' is not in the b4 set 5427-5434 — provenance violated'); process.exit(2); }
}
console.log('seed provenance OK: ' + SEEDS.join(',') + ' (b4 set 5427-5434, deliberate reuse — no fresh-seed claim)');
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-20/perseed-rotpathdiag-b/' + POLICY_ID + '.json');

function roundObj(o) {
  const r = {};
  for (const [k, v] of Object.entries(o || {})) r[k] = Math.round(v);
  return r;
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'rotpathdiag-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachRotPathDiag(Game);

  const t0 = Date.now();
  const result = await runDays(Game, POLICY, { days, manifest: null });
  const ms = Date.now() - t0;

  // attribution completeness: tagged fresh rot vs untagged fresh rot
  const taggedRot = Object.values(W.rotByPath).reduce((a, b) => a + b, 0);
  const untagged = W.untaggedRotKcal;
  const completeness = (taggedRot + untagged) > 0 ? taggedRot / (taggedRot + untagged) : 1;

  let nationalLive = false, tableWaiting = false, rank = '?', maxWave = 1, arc = 1, rosterEnd = 0;
  try {
    nationalLive = !!((Game.state || {}).nationalLive);
    const ps = Game.progState ? Game.progState() : {};
    tableWaiting = !!(ps.tableWaiting);
    rank = Game.scaleRank ? Game.scaleRank() : '?';
    maxWave = Game.unlockedWave ? Game.unlockedWave() : 1;
    arc = (ps || {}).arc || 1;
    rosterEnd = (((Game.state || {}).village || {}).roster || []).length;
  } catch (e) {}

  const end = {
    seed,
    won: !!Game.won,
    national: nationalLive,
    table: tableWaiting,
    rank, maxWave, arc, rosterEnd,
    days: result.days, endReason: result.endReason,
    completeness: +completeness.toFixed(4),
    inflow: roundObj(W.inflow),
    writes: Object.assign({}, W.writes),
    pieceHist: W.pieceHist,
    ssGive: Math.round(W.ssGive), ssStored: Math.round(W.ssStored),
    ssRefused: Math.round(W.ssRefused), ssRefusalEvents: W.ssRefusalEvents,
    ssCrisisKcal: Math.round(W.ssCrisisKcal), ssNonCrisisKcal: Math.round(W.ssNonCrisisKcal),
    spOverCapKcal: Math.round(W.spOverCapKcal), spOverCapEvents: W.spOverCapEvents,
    spNormalKcal: Math.round(W.spNormalKcal),
    mergeMixKcal: Math.round(W.mergeMixKcal),
    rotByPath: roundObj(W.rotByPath),
    rotByPathFast: roundObj(W.rotByPathFast),
    rotByPathFastSub: roundObj(W.rotByPathFastSub),
    rotByName: roundObj(W.rotByName),
    rotLagMean: Object.fromEntries(Object.entries(W.rotLagSum).map(([p, s]) =>
      [p, W.rotLagN[p] > 0 ? +(s / W.rotLagN[p]).toFixed(2) : 0])),
    untaggedRotKcal: Math.round(W.untaggedRotKcal), untaggedRotN: W.untaggedRotN,
    drawKcal: Math.round(W.drawKcal),
    drawUrgencyDays: W.drawUrgKcal > 0 ? +(W.drawUrgKcalSum / W.drawUrgKcal).toFixed(2) : 0,
    dawnSamples: W.dawnSamples,
    ms,
  };
  return end;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    const fast = Object.values(end.rotByPathFast).reduce((a, b) => a + b, 0);
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} won=${end.won} nat=${end.national} wave=${end.maxWave}` +
      ` comp=${(end.completeness * 100).toFixed(2)}% SP=${Math.round(end.inflow.SP / 1000)}k SS=${Math.round(end.inflow.SS / 1000)}k` +
      ` fastRot=${Math.round(fast / 1000)}k ssRef=${Math.round(end.ssRefused / 1000)}k spOC=${Math.round(end.spOverCapKcal / 1000)}k` +
      ` (${end.ms}ms)`);
  }
  const dir = require('path').dirname(OUT);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    meta: {
      run: 'sim-rotpathdiag-b', policy: POLICY_ID, days: DAYS, seeds: SEEDS,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'unset' },
      note: 'diagnostic only — no lever, no armed side; seeds are the b4 set (deliberate reuse)',
    }, rows,
  }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
