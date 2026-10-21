#!/usr/bin/env node
// sweep-rotmech-b.js — funnel-rot attribution sweep (arm sim-rotmech-b).
//
// INSTRUMENT ONLY: plain leadfeast/belongfeast on identical seeds, the
// rotmech instrument tracing the two funnels within each run (paired by
// construction — same trajectory, two funnels).
//
// Substrate (retagrot-b4 parity): FEASTSCALE_R13=1, SEATDRIVE=0, SURPLUSFEED
// unset. Horizon 180d death-aware. Seeds 8911-8918 (fresh; STOP on collision
// with the banned list).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS="8911,8912,8913,8914,8915,8916,8917,8918" \
//   POLICY=leadfeast DAYS=180 OUT=evidence/2026-10-21/perseed-rotmech-b/leadfeast.json \
//   node scripts/sweep-rotmech-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachRotmech, dayOf, pantryKcalLive } = require('./instr-rotmech-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED === '1') {
  console.error('FATAL: SURPLUSFEED must be unset (base substrate)');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-rotmech-b/' + POLICY_ID + '.json');

// ---- banned-seed list: STOP on collision ----
const BANNED = new Set();
for (const spec of ['5201-5208', '5301-5308', '5401-5434', '5601-5608', '8001-8808']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS || '8911,8912,8913,8914,8915,8916,8917,8918')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (s < 8911 || s > 8918) { console.error(`SWEEP STOP: seed ${s} outside this arm's range 8911-8918.`); process.exit(2); }
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the banned list.`); process.exit(2); }
}
console.log(`policy=${POLICY_ID} seeds: ${SEEDS.join(',')} (freshness asserted clean)`);

const round1 = (o) => { const r = {}; for (const k of Object.keys(o || {})) r[k] = Math.round(o[k]); return r; };
const roundFunnel = (F) => ({
  written: Math.round(F.written), rot: Math.round(F.rot), rotFast: Math.round(F.rotFast),
  drawn: Math.round(F.drawn), eatenSpoiled: Math.round(F.eatenSpoiled),
  playerTakes: Math.round(F.playerTakes), tribute: Math.round(F.tribute || 0),
  unaccounted: Math.round(F.unaccounted || 0),
  rotOverCap: Math.round(F.rotOverCap), rotFastOverCap: Math.round(F.rotFastOverCap),
  overCapWrite: Math.round(F.overCapWrite), capRefused: Math.round(F.capRefused),
  meanRank: F.arrRankN ? +(F.arrRankSum / F.arrRankN).toFixed(2) : null,
  meanClock: F.clockN ? +(F.clockSum / F.clockN).toFixed(2) : null,
  meanResEat: F.resEatK ? +(F.resEatSum / F.resEatK).toFixed(2) : null,
  meanResRot: F.resRotK ? +(F.resRotSum / F.resRotK).toFixed(2) : null,
  rotByPiece: round1(F.rotByPiece), rotFastByPiece: round1(F.rotFastByPiece),
  writtenByPiece: round1(F.writtenByPiece),
  rotByRankQ: F.rotByRankQ.map(Math.round), rotFastByRankQ: F.rotFastByRankQ.map(Math.round),
  writtenByRankQ: F.writtenByRankQ.map(Math.round),
});

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'rotmech-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachRotmech(Game);
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    try { W.sampleDay(); } catch (e) {}
    return r;
  };
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null, sampleEvery: 181 });
  const ms = Date.now() - t0;
  const v = Game.state.village || {};
  const endInv = W.endInventory();
  const deathCauses = {};
  for (const d of (W.deaths || [])) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const end = {
    seed, days: result.days, endReason: result.endReason, won: !!Game.won,
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd: (v.roster || []).length,
    fun: {
      surplus: roundFunnel(W.fun.surplus), pantry: roundFunnel(W.fun.pantry),
      other: roundFunnel(W.fun.other), untagged: roundFunnel(W.fun.untagged),
    },
    mergeXfer: round1(W.mergeXfer),
    surplusCalls: W.surplusCalls, pantryCalls: W.pantryCalls,
    daysFull: W.daysFull, daysLean: W.daysLean,
    meanFill: W.dayFill.length ? +(W.dayFill.reduce((t, d) => t + d.fill, 0) / W.dayFill.length).toFixed(3) : 0,
    deaths: W.deaths.length, deathCauses,
    ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  try {
    const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    if (prev && Array.isArray(prev.rows)) for (const r of prev.rows) rows.push(r);
    if (rows.length) console.log(`resume: ${rows.length} seeds already done`);
  } catch (e) {}
  const doneSet = new Set(rows.map(r => r.seed));
  for (const seed of SEEDS) {
    if (doneSet.has(seed)) { console.log(`skip seed=${seed} (already done)`); continue; }
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    const fS = end.fun.surplus, fP = end.fun.pantry;
    const rP = fP.written ? (fP.rotFast / fP.written * 100).toFixed(1) : '-';
    const rS = fS.written ? (fS.rotFast / fS.written * 100).toFixed(1) : '-';
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} won=${end.won} rank=${end.rank} wave=${end.maxWave} fill=${end.meanFill} Dfast=${(rP - rS).toFixed(1)}pp (${end.ms}ms)`);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ meta: { policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'unset' }, kind: 'rotmech-b-sweep' }, rows }, null, 1));
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
