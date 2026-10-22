// test-deeper-variants-20261022.js -- DEEPER VARIANTS (journey-deepening r32)
// PROOF: bespoke-question `deeper` beats were singleton strings, so every
// villager recited the same anecdote verbatim (observed: q_first_week's
// "spite at the sky" story from two different villagers in one run).
// Data may now carry an array of variants; convoDeeperPick routes through
// convoPick (per-villager no-repeat memory + village-fresh preference), and
// plain strings keep the old single-variant path.
// Usage: SEED=42 node scripts/test-deeper-variants-20261022.js
'use strict';
// PROOF-TEST RNG STABILITY: seeded PRNG, fixed default, SEED override.
const SEED = parseInt(process.env.SEED || '42', 10);
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

async function main() {
  console.log('deeper-variants proof (seed ' + SEED + ')');
  const { Game } = await loadGame({ seed: SEED, mode: 'deeper-variants-proof' });
  await setupGame(Game);

  const cg = (Game.data.characterGen || {}).convo || {};
  const qd = (cg.questions || []).find(q => q.id === 'q_first_week');
  ok(!!qd, 'q_first_week def found in characterGen.convo.questions');
  ok(Array.isArray(qd.deeper) && qd.deeper.length === 3,
    'q_first_week.deeper is a 3-variant array (got ' + (Array.isArray(qd.deeper) ? qd.deeper.length : typeof qd.deeper) + ')');
  ok(qd.deeper.every(l => typeof l === 'string' && l.length > 20), 'all variants are non-trivial strings');

  const roster = ((Game.state.village || {}).roster || []).filter(id => {
    try { return !Game.getPerson(id).dead; } catch (e) { return false; }
  });
  ok(roster.length >= 2, 'at least 2 living villagers (got ' + roster.length + ')');
  const v1 = roster[0], v2 = roster[1];

  // Two villagers, same question: both picks come from the pool...
  const p1 = Game.convoDeeperPick(v1, qd);
  const p2 = Game.convoDeeperPick(v2, qd);
  console.log('  v1 pick: ' + p1.slice(0, 60) + '...');
  console.log('  v2 pick: ' + p2.slice(0, 60) + '...');
  ok(qd.deeper.indexOf(p1) !== -1, 'villager 1 pick is from the variant pool');
  ok(qd.deeper.indexOf(p2) !== -1, 'villager 2 pick is from the variant pool');
  // ...and they do NOT recite the same anecdote verbatim (the observed bug).
  ok(p1 !== p2, 'two villagers get different deeper lines (no verbatim duplication)');

  // Backward compatibility: plain-string deeper keeps the old path.
  const qs = { id: 'q_plain', deeper: '"Just a plain old singleton beat."' };
  const ps = Game.convoDeeperPick(v1, qs);
  ok(ps === '"Just a plain old singleton beat."', 'string deeper returns verbatim (backward compat)');

  // Determinism: same villager + same question never repeats a variant.
  const p1b = Game.convoDeeperPick(v1, qd);
  ok(qd.deeper.indexOf(p1b) !== -1 && p1b !== p1,
    'same villager re-asking gets a different fresh variant (no repeats)');

  console.log(fail === 0 ? `\nALL GREEN (${pass} passed)` : `\n${fail} FAILURES (${pass} passed)`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
