#!/usr/bin/env node
// test-crisis-betrayal-whiffguard-r154.js — PROOF for the crisis-leg r154 fix:
// "the betrayal softlock" (r150 headline, seed 13402 day 18: Wren betrays,
// player flees across a barrier, then 270,599 "No path there." + 270,599
// Wren stall lines, gameDay frozen at 18).
//
// Root cause (two defects, both required — either alone is insufficient):
//   1. party.js wrapped Game.tbAdvance for hostile fights with a custom loop
//      that inlined the ROUND announcement and NEVER called tbRoundWrap —
//      so in any fight with a living hostile human (betrayal, uprising,
//      justice) the whiff-forever guard, the order re-sort, the belltoad
//      chorus and the eviction-wall expiry never ran. (game.js:37922 even
//      notes "re-sort never ran there either.")
//   2. game.js's whiff guard only counted MONSTERS as foes (liveMon), so a
//      pure betrayal fight (hostile human, no monster) could never fire it
//      even if tbRoundWrap ran.
// AFTER: (1) the party.js loop calls tbRoundWrap at the wrap point, exactly
// like the sync tbAdvance; (2) the guard counts monsters OR hostiles as
// foes and marks hostiles fled, so the betrayal tbEndCheck resolves the
// fight as 'betrayal_routed' with the honest line "It comes apart —
// neither side can reach the other. The fight breaks off; they back away
// into the dark."
//
// Staged repro (scripts/probe-betrayal-stall-r154.js): seed 13611 travels
// 3 tiles out, stages a betrayal fight at low HP so oracleV2 flees every
// round, and watches for the stall signature. BEFORE the fix it STALLed at
// round 26,001 (25,999 "No path there." + 25,999 stall lines, 10 frozen
// iterations). AFTER: it resolves in iteration 1 at ~119 failed rounds
// (the guard fires at round 120) with result 'betrayal_routed'.
//
// The test never loads the game in-process (one harness per process): it
// spawns the probe as a child process per case and asserts on its JSON.
//   Case A (fix): 13611 guard-on -> resolved, betrayal_routed, guard fired,
//     bounded failed moves (was 25,999), clock advanced.
//   Case B (RED control): 13611 with WHIFFGUARD=0 -> STALL. Proves the
//     test measures the fix: with the guard disabled the stall returns.
//   Case C (no over-fire): 13602 guard-on -> the betrayer closes and kills
//     the player in a few rounds; the guard must NOT fire in a fight that
//     deals damage.
// Usage: node scripts/test-crisis-betrayal-whiffguard-r154.js
// Exit 0 = all green.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

const PROBE = path.join(__dirname, 'probe-betrayal-stall-r154.js');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

function runProbe(seed, envExtra) {
  const env = Object.assign({}, process.env, envExtra || {});
  const out = execFileSync(process.execPath, [PROBE], {
    env: Object.assign(env, { SEEDS: String(seed) }),
    timeout: 280000, maxBuffer: 64 * 1024 * 1024,
  }).toString().trim();
  return JSON.parse(out.split('\n').pop());
}

console.log('Case A — seed 13611, guard ON (the fix):');
{
  const r = runProbe(13611);
  ok(r.verdict === 'resolved', 'stall seed resolves (not STALL)', { verdict: r.verdict });
  ok(r.tbEndCalls && r.tbEndCalls[0] && r.tbEndCalls[0].result === 'betrayal_routed', 'fight ends betrayal_routed', { tbEnd: r.tbEndCalls });
  ok((r.guardFired || 0) >= 1, 'whiff guard fired (It comes apart line)', { guardFired: r.guardFired });
  ok((r.noPath || 0) <= 200, 'failed moves bounded at the guard (was 25,999)', { noPath: r.noPath });
  ok((r.gameDayAtEnd || 0) > 1, 'game clock advanced past the fight day', { gameDayAtEnd: r.gameDayAtEnd });
}

console.log('Case B — seed 13611, WHIFFGUARD=0 (RED control):');
{
  const r = runProbe(13611, { WHIFFGUARD: '0' });
  ok(r.verdict === 'STALL', 'guard disabled -> stall returns (test measures the fix)', { verdict: r.verdict, noPath: r.noPath });
  ok((r.noPath || 0) > 10000, 'stall burns thousands of failed moves with the guard off', { noPath: r.noPath });
}

console.log('Case C — seed 13602, guard ON (damaging fight, no over-fire):');
{
  const r = runProbe(13602);
  ok(r.verdict === 'resolved', 'damaging betrayal fight resolves', { verdict: r.verdict });
  ok(r.tbEndCalls && r.tbEndCalls[0] && r.tbEndCalls[0].result === 'lost', 'betrayer closes and kills the player (lost)', { tbEnd: r.tbEndCalls });
  ok((r.guardFired || 0) === 0, 'guard does NOT fire in a fight that deals damage', { guardFired: r.guardFired });
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
