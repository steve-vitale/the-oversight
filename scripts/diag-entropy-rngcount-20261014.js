'use strict';
// diag-entropy-rngcount-20261014.js — PHASE 1: per-day seeded-RNG call COUNTS
// for two in-process runs (no stack capture — fast). First day with a count
// mismatch = the day RNG consumption diverges. If counts match everywhere
// but trajectories diverge, the branch came from an UNSEEDED read.
process.env.FEASTSCALE_R13 = '1';

let callCount = 0;
const dayCounts = []; // per run: {day: count}
let curCounts = null;

function makeCounting(fn) {
  return function countedRandom() { callCount++; return fn(); };
}
let assignedFn = Math.random;
Object.defineProperty(Math, 'random', {
  configurable: true,
  get() { return assignedFn; },
  set(fn) { assignedFn = (typeof fn === 'function') ? makeCounting(fn) : fn; }
});

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

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

async function one(seed, runNo) {
  callCount = 0; // RESET per run — the counter is process-global
  curCounts = {};
  const { Game } = await loadGame({ seed, mode: 'entropy-rngcount' });
  await setupGame(Game);
  const base = leadfeast.daily, hashes = [];
  const policy = Object.assign({}, leadfeast);
  let lastCount = 0;
  policy.daily = (G, ctx) => {
    const day = Game.state.scholar.day;
    curCounts[day] = callCount - lastCount;
    lastCount = callCount;
    hashes.push(day + ':' + dayHash(Game));
    return base(G, ctx);
  };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  dayCounts[runNo] = curCounts; curCounts = null;
  return { hashes, days: r.days, endReason: r.endReason };
}

(async () => {
  const a = await one(44, 0), b = await one(44, 1);
  let firstTraj = -1;
  const n = Math.min(a.hashes.length, b.hashes.length);
  for (let i = 0; i < n; i++) if (a.hashes[i] !== b.hashes[i]) { firstTraj = i; break; }
  console.log('traj firstDivIdx:', firstTraj, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  // per-day RNG count diff
  const A = dayCounts[0], B = dayCounts[1];
  const days = Object.keys(A).map(Number).sort((x, y) => x - y);
  let firstCountDiff = -1;
  for (const d of days) {
    if (A[d] !== B[d]) { firstCountDiff = d; break; }
  }
  console.log('rng-count firstDiffDay:', firstCountDiff);
  if (firstCountDiff > 0) {
    for (let d = Math.max(1, firstCountDiff - 2); d <= firstCountDiff + 2; d++)
      console.log('day', d, 'A rng calls:', A[d], 'B rng calls:', B[d], A[d] === B[d] ? '' : ' <--');
  } else {
    console.log('per-day RNG counts IDENTICAL all days — trajectory divergence is NOT from seeded-RNG consumption.');
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
