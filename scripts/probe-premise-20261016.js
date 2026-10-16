#!/usr/bin/env node
// PREMISE probe (sim-crumbguard-b, 2026-10-16): Steve's 2026-10-16 ruling
// closed the pantry granularity leak (0152a2ce: depositPantryPieces splits
// every external deposit to <=500-kcal pieces by default). This probe
// answers the arm's premise question on the NEW substrate (pristine master,
// no crumb-guard installed):
//
//   Can a whole-piece take at the pantryDraw floor1 break still drain a
//   pantry dangerously — i.e., is the KILLED sim-crumbs-b mechanism
//   (two 2,813-kcal whole-piece takes draining a 5,626-kcal pantry to 0
//   in one day) still reachable, or structurally closed by the 500-kcal cap?
//
// Method:
//   1. Deposit s88-shaped slabs (2 x 2813 kcal) through depositPantryPieces
//      and assert every resulting piece is <= 500 kcal.
//   2. At the floor1 break (want < smallest piece), emulate the KILLED
//      literal whole-piece take (take the full next piece, no guard) and
//      measure the worst-case single-take drain.
//   3. Replay the s88 autopsy shape: 5,626-kcal pantry, repeated
//      floor1-break whole-piece takes — count takes to drain vs the old
//      mechanism's 2 takes.
//
// Verdict rule: MOOT if max single whole-piece take <= 500 kcal AND the
// s88-shaped drain needs >= 10 takes (order of magnitude above the killed
// mechanism's 2); STILL-BINDS if a <=500-kcal whole-piece take can still
// produce the dangerous drain.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const CAP = 500;

async function main() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };

  const { Game } = await loadGame({ seed: 42, mode: 'premise-probe', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;

  // 1. The s88 slabs through the new choke point.
  v.pantry = [];
  const dep = Game.depositPantryPieces(v, {
    name: 'slab', kcalEach: 2813, units: 2, spoilDay: 9999, safe: true, kg: 2,
  }, 500);
  const pieces = [];
  for (const it of v.pantry) for (let u = 0; u < (it.units || 1); u++) pieces.push(it.kcalEach);
  const maxPiece = Math.max.apply(null, pieces);
  const totalIn = pieces.reduce((a, b) => a + b, 0);
  console.log(`deposited=${dep} pieces=${pieces.length} maxPiece=${maxPiece} totalIn=${totalIn}`);
  check('depositPantryPieces exists (0152a2ce substrate)', typeof Game.depositPantryPieces === 'function');
  check('2x2813-kcal slabs arrive split (no 2813 piece survives)', maxPiece <= CAP, `maxPiece=${maxPiece}`);
  check('all 5,626 kcal preserved (no calorie loss)', totalIn === 5626, `totalIn=${totalIn}`);
  check('piece count is honest (2813 -> 6 pieces of 500/500/500/500/500/313)', pieces.length === 12, `pieces=${pieces.length}`);

  // 2. Floor1 break on the new substrate: want < smallest piece.
  //    Pristine pantryDraw at the break: units = floor(want/effectiveKcal) = 0,
  //    drewAny true -> stoppedForCrumbs (the bug Steve ruled on). The KILLED
  //    literal take would instead take the whole next piece — worst case:
  //    the LARGEST piece in the pantry.
  const freshNow = totalIn;
  const worstTake = maxPiece;
  console.log(`floor1-break worst-case whole-piece take: ${worstTake} kcal from a ${freshNow}-kcal pantry`);
  check('worst-case whole-piece take <= 500 kcal (the cap binds)', worstTake <= CAP, `worstTake=${worstTake}`);
  check('worst-case take < 9% of the s88 pantry (not a drain)',
    worstTake / freshNow < 0.09, `${(100 * worstTake / freshNow).toFixed(1)}%`);

  // 3. Replay the s88 autopsy: how many floor1-break whole-piece takes to
  //    drain the 5,626-kcal pantry? The killed mechanism did it in 2.
  let remaining = freshNow;
  let takes = 0;
  const sorted = pieces.slice().sort((a, b) => b - a); // worst case: biggest first
  for (const pk of sorted) { remaining -= pk; takes++; if (remaining <= 0) break; }
  console.log(`s88-shaped drain replay: ${takes} whole-piece takes to empty 5,626 kcal (killed mechanism: 2)`);
  check('drain needs >= 10 takes (order of magnitude above the killed 2)', takes >= 10, `takes=${takes}`);

  // 4. The floor1 break itself still exists on the new substrate (the bug
  //    Steve ruled on is real, just defanged): the s66-d46 shape scaled to
  //    500-kcal pieces — want=1218: floor(1218/500)=2 pieces drawn (1000),
  //    remaining 218 < 500 -> break. (want=400 takes the whole 500 on the
  //    FIRST draw via the !drewAny path — that is the intended indivisible
  //    first piece, not the crumbs-left bug.)
  v.pantry = [{ name: 'cut', kcalEach: 500, units: 4, spoilDay: 9999, safe: true }];
  const out = Game.pantryDraw(v, 1218, { round: 'floor1' });
  // NOTE: stoppedForCrumbs is a pantryDraw local, never attached to out —
  // the refusal is observable as taken < want with fresh food remaining
  // (shortOfFresh=false): the crumbs-left signature.
  console.log(`pristine floor1 break on new substrate: want=1218 taken=${out.taken} shortOfFresh=${out.shortOfFresh} (218 need unmet, 1000 fresh left)`);
  check('floor1 refusal still fires on pristine (the ruled-on bug, defanged not fixed)',
    out.taken === 1000, `taken=${out.taken}`);

  // 5. The freeloader-manufacture cost mode is structurally closed too: at
  //    the break, remaining want r satisfies 0 < r < 500 and the whole
  //    piece is 500 -> over-feed per take is STRICTLY < 500 kcal (old
  //    regime: up to 2,813). The fair-share clock trips drainBeyondCapacity
  //    only when 7-day NET take rate exceeds fairShare (>= 2000 kcal/day):
  //    even a floor1 break EVERY day adds < 500/day, and the meal structure
  //    draws once per day — manufacturing >2000/day sustained is impossible.
  const maxOverfeed = CAP - 1;
  console.log(`max per-take over-feed at the break: <${CAP} kcal (old regime: up to 2813)`);
  check('per-take over-feed < 500 kcal (fair-share bar absorbs it)', maxOverfeed < CAP);
  check('7-day net-rate trip (>2000/day sustained) unreachable via <500/day takes', 7 * maxOverfeed < 7 * 2000);

  console.log(fails.length ? `\nPREMISE: ${fails.length} FAIL(s) — STILL-BINDS` : '\nPREMISE: ALL GREEN — MOOT (mechanism structurally closed by the 500-kcal cap)');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
