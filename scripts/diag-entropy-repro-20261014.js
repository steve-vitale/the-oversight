'use strict';
// diag-entropy-repro-20261014.js — local reproduction of the in-process divergence.
// Uses THIS tree's sim-harness (the committed det-test-20261014.js hardcodes a
// dead sibling worktree path). Also surfaces loadFails from each loadGame:
// a module that evals clean on run 1 but FAILS on run 2 leaves run-1 closures
// (with run-1's seeded-RNG stream position) live — a prime divergence suspect.
process.env.FEASTSCALE_R13 = '1';
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

async function one(seed) {
  const { Game, loadFails } = await loadGame({ seed, mode: 'entropy-repro' });
  await setupGame(Game);
  const base = leadfeast.daily, hashes = [];
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base(G, ctx); };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return { hashes, loadFails: loadFails || [], days: r.days, endReason: r.endReason };
}

(async () => {
  const a = await one(44), b = await one(44);
  console.log('runA loadFails:', a.loadFails.length, JSON.stringify(a.loadFails.slice(0, 5)));
  console.log('runB loadFails:', b.loadFails.length, JSON.stringify(b.loadFails.slice(0, 5)));
  const newInB = b.loadFails.filter(f => !a.loadFails.includes(f));
  console.log('loadFails new in run B:', JSON.stringify(newInB));
  let first = -1;
  const n = Math.min(a.hashes.length, b.hashes.length);
  for (let i = 0; i < n; i++) if (a.hashes[i] !== b.hashes[i]) { first = i; break; }
  console.log('lenA', a.hashes.length, 'lenB', b.hashes.length, 'firstDivIdx', first,
    'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  if (first >= 0) {
    for (let i = Math.max(0, first - 2); i < Math.min(n, first + 3); i++)
      console.log(i, 'A:', a.hashes[i], ' B:', b.hashes[i], a.hashes[i] === b.hashes[i] ? '' : ' <-- DIVERGE');
  } else console.log('IDENTICAL trajectories');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
