'use strict';
// diag-entropy-frozentime-20261014.js — DECISIVE: freeze wall-clock time to a
// deterministic monotonic sequence. If in-process divergence STOPS, the
// source is wall-clock time leaking into game logic. If it persists, time
// is exonerated.
let fakeNow = 1720000000000;
Date.now = () => ++fakeNow;
let fakePerf = 0;
if (typeof performance !== 'undefined') performance.now = () => ++fakePerf;
let fakeHr = 0n;
process.hrtime.bigint = () => ++fakeHr;

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
  const { Game } = await loadGame({ seed, mode: 'entropy-frozentime' });
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
  console.log('diverged pairs with FROZEN time: ' + divPairs + '/5');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
