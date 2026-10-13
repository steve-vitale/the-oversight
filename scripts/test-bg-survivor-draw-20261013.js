#!/usr/bin/env node
// Proof: background-survivor roster draw is random across runs again.
// BUG (journey establishment 2026-10-13): the first-name-collision guard in
// newGame used pool.findIndex(...) — first non-colliding entry in FILE ORDER —
// so the same ~6 survivors (Lena Ruiz, Marcus Webb, Sofia Chen, James
// Okonkwo, Emma Larsen, David Kim, ...) opened nearly every run. The
// original code was splice-random. The guard stays; the pick among the
// non-colliding candidates is random again.
//
// RED (before fix): the same survivors recur in ~every run (maxFreq ~1.0,
// distinct ~6-9 across 20 runs).
// GREEN (after fix): draws spread across the 97-survivor file.
//
// Usage: node scripts/test-bg-survivor-draw-20261013.js
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210,
               211, 212, 213, 214, 215, 216, 217, 218, 219, 220];

async function main() {
  const freq = {};
  let runs = 0;
  for (const seed of SEEDS) {
    const lg = await loadGame({ seed });
    const Game = lg.Game;
    Game.genDetail = function () { return {}; };
    await setupGame(Game);
    const roster = (Game.state.village.roster || []);
    // roster = [villagerId].concat(otherGen, bg) — last 6 are the bg draw
    const bgDraw = roster.slice(-6);
    if (bgDraw.length !== 6) {
      console.log(`seed ${seed}: unexpected bg draw size ${bgDraw.length} (roster ${roster.length})`);
      process.exit(2);
    }
    for (const id of bgDraw) freq[id] = (freq[id] || 0) + 1;
    runs++;
  }
  const distinct = Object.keys(freq).length;
  const maxFreq = Math.max(...Object.values(freq)) / runs;
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([id, n]) => `${id}:${n}/${runs}`).join(' ');
  console.log(`runs=${runs} distinct survivors drawn=${distinct} maxFreq=${maxFreq.toFixed(2)}`);
  console.log(`most-drawn: ${top}`);
  let ok = true;
  if (distinct < 12) { console.log(`FAIL: only ${distinct} distinct survivors across ${runs} runs (want >= 12)`); ok = false; }
  if (maxFreq > 0.6) { console.log(`FAIL: a survivor recurs in ${(maxFreq * 100).toFixed(0)}% of runs (want <= 60%)`); ok = false; }
  console.log(ok ? 'PASS: bg-survivor draw is spread across the file' : 'FAIL');
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
