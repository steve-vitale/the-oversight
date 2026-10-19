#!/usr/bin/env node
// PROOF (journey establishment r16, 2026-10-19): slipOrigin pool exhaustion
// re-serves verbatim authored observations.
// BLANK: src/js/truth.js slipOrigin had only 3 lines. drawTruthLine's per-game
// no-repeat recycles the pool once exhausted, so the 4th origin slip in a run
// re-served a seen line verbatim — observed in the r16 sim: seed 61, Owen's
// origin-slip fired verbatim day 19 AND day 40 (21 days apart). Same class as
// r14's slipGoal echo (pool 2->4); slipOrigin was left at 3.
// RED (pre-fix): pool has 3 lines; 4 draws for the SAME villager force one
//   verbatim repeat (mechanics: exhaustion recycles, draw 4 duplicates draw 1/2).
// GREEN (post-fix): pool has >=5 lines; 4 draws are all verbatim-distinct,
//   and no line names the true origin (CRACK-ONLY discipline: {truth}/{atruth}
//   must never appear in the pool — the cover breaks, the truth stays hidden
//   until gossip/observation/confession earns it, per detective break-it 2026-10-09c).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(label, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' :: ' + detail : ''));
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 61 });
  await setupGame(Game);

  const pool = (Game.truthLinePools || {}).slipOrigin || [];
  check('slipOrigin pool has >=5 lines (r14 set the slipGoal precedent: bigger pool keeps the echo rare)',
    pool.length >= 5, 'pool.length=' + pool.length);

  // CRACK-ONLY: no line may interpolate the truth. (break-it 2026-10-09c:
  // naming the true origin outright short-circuits the confrontation.)
  const leaks = pool.filter(l => /\{(atruth|truth)\}/.test(l));
  check('no slipOrigin line names the true origin ({truth}/{atruth} absent)', leaks.length === 0,
    leaks.length ? 'leakers: ' + leaks.join(' || ') : '');

  // all lines render with the two placeholders the channel actually uses
  const bad = pool.filter(l => !l.includes('{first}') || !l.includes('{told}'));
  check('every line uses {first} and {told} (the cover reference)', bad.length === 0,
    bad.length ? 'bad: ' + bad.join(' || ') : '');

  // behavioral: 4 origin slips for the SAME villager must never repeat verbatim
  try { Game.state.truthLineUsed = {}; } catch (e) { /* test-only */ }
  const drawn = [];
  for (let i = 0; i < 4; i++) {
    drawn.push(Game.drawTruthLine('slipOrigin', 'testvid_r16', { first: 'Owen', told: 'Denver', truth: 'Portland' }));
  }
  const uniq = new Set(drawn).size;
  check('4 origin slips for one villager: 4 verbatim-distinct lines', uniq === 4,
    'distinct=' + uniq + ' / 4');
  const repeats = drawn.filter((l, i) => drawn.indexOf(l) !== i);
  check('no verbatim repeat among the 4 (the day-19/day-40 echo is dead)', repeats.length === 0,
    repeats.length ? 'repeated: ' + repeats[0].slice(0, 90) : '');

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('PROOF ERROR:', e && e.message); process.exit(2); });
