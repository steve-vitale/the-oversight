'use strict';
// det-gate.js — determinism gate for sweep scripts.
//
// Usage:
//   const { checkDeterminism } = require('./det-gate');
//   const gate = await checkDeterminism(44, 'leadfeast', { days: 180 });
//   if (!gate.identical) {
//     console.error('DETERMINISM GATE FAILED:', gate.summary);
//     process.exit(1); // do NOT trust a before/after comparison on this seed
//   }
//   // ... proceed with the before/after comparison ...
//
// The gate runs the same seed+policy TWICE in one process and compares
// per-day trajectory hashes. If they differ, the comparison is not
// trustworthy — the loops' measurement method is broken on that seed.
//
// KNOWN ISSUE (2026-10-14, entropy-hunt r26): the gate FAILS on current
// master for fight-heavy seeds (leadfeast s44). Root cause: timestamp-based
// villager IDs (app_<Date.now().toString(36)>_<rand>, membership.js:376)
// leak into contest resolution via _cxSeed (contestEngine.js:108-112:
// pids.slice().sort().join('+') hashed into the contest RNG seed) and the
// cands.sort() "stable order" pick (contestEngine.js:255). Different IDs ->
// different sort order -> different contest seed -> different outcomes,
// despite the main RNG stream being bit-identical. See
// evidence/2026-10-14/sim-entropy-r26.md. Fix requires a game-code change
// (deterministic IDs or ID-agnostic contest seeding) — coordinator call.
const { loadGame, setupGame, runDays } = require('./sim-harness');

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

async function runOnce(seed, policy, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const { Game } = await loadGame({ seed, mode: opts.mode || 'det-gate' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game, wrapped, { days, sampleEvery: 1 });
  return { hashes, days: r.days, endReason: r.endReason };
}

// checkDeterminism(seed, policy, opts) -> { identical, summary, firstDivIdx, ... }
// policy: a policy object (e.g. require('./policies/feastscale').leadfeast).
// opts: { days, mode }. process.env must already carry any policy flags
// (e.g. FEASTSCALE_R13=1) — the gate does not set them.
async function checkDeterminism(seed, policy, opts) {
  opts = opts || {};
  const a = await runOnce(seed, policy, opts);
  const b = await runOnce(seed, policy, opts);
  let firstDivIdx = -1;
  const n = Math.min(a.hashes.length, b.hashes.length);
  for (let i = 0; i < n; i++) {
    if (a.hashes[i] !== b.hashes[i]) { firstDivIdx = i; break; }
  }
  const lenMatch = a.hashes.length === b.hashes.length;
  const identical = firstDivIdx < 0 && lenMatch;
  let summary;
  if (identical) {
    summary = `seed ${seed}: IDENTICAL (${n} days, ${a.days}/${a.endReason} vs ${b.days}/${b.endReason})`;
  } else {
    const divDay = firstDivIdx >= 0 ? a.hashes[firstDivIdx].split(':')[0] : '?';
    summary = `seed ${seed}: DIVERGED at day ${divDay} (hash idx ${firstDivIdx}); ` +
      `lenA ${a.hashes.length} lenB ${b.hashes.length}; ` +
      `endA ${a.days}/${a.endReason} endB ${b.days}/${b.endReason}`;
  }
  return { identical, summary, firstDivIdx, lenA: a.hashes.length, lenB: b.hashes.length,
    endA: a.days + '/' + a.endReason, endB: b.days + '/' + b.endReason };
}

module.exports = { checkDeterminism, dayHash };
