'use strict';
// diag-entropy-consttime-20261014.js — CONSTANT Date.now (same value every
// call, both runs). If the entropy source is timestamp-based IDs (vid in
// the tale-tell hash, linkIds, etc.), making them IDENTICAL between runs
// must restore determinism.
const FIXED = 1720000000000;
Date.now = () => FIXED;
let fakePerf = 1000;
if (typeof performance !== 'undefined') performance.now = () => (fakePerf += 1);

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
  const { Game } = await loadGame({ seed, mode: 'entropy-consttime' });
  await setupGame(Game);
  const base = leadfeast.daily, hashes = [];
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base(G, ctx); };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return { hashes, days: r.days, endReason: r.endReason };
}

(async () => {
  let divPairs = 0;
  for (let pair = 1; pair <= 5; pair++) {
    const a = await one(44), b = await one(44);
    let first = -1;
    const n = Math.min(a.hashes.length, b.hashes.length);
    for (let i = 0; i < n; i++) if (a.hashes[i] !== b.hashes[i]) { first = i; break; }
    const div = first >= 0 || a.hashes.length !== b.hashes.length;
    if (div) divPairs++;
    console.log('pair', pair, div ? 'DIVERGED@' + first : 'IDENTICAL',
      'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  }
  console.log('diverged pairs with CONSTANT time: ' + divPairs + '/5');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
