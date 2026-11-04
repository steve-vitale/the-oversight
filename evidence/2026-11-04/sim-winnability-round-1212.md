# Loop B run fleshout-loop-b-20261104T1212Z — coordinator evidence

Run: fleshout-loop-b-20261104T1212Z. Axis: scale-onramp (winnability-chain
re-point, Steve 2026-11-03 21:13). One arm, merged locally pending ship.

## Run-start state
- No B lock existed; the 1030Z B round had closed out on master
  (51d3f7773). No live Loop A claim or lock at run start. Other lanes'
  trees (incl. sim-recovery-zombie-b, which holds the HELD recovery rule)
  were NOT touched. Loop A food-economy untouched.
- Pre-flight: main tree clean at run start, disk 25%. Reaper removed
  nothing sibling-owned (9/16 active at closeout). Claim written before
  any sims; deleted at closeout. Lock deleted at closeout.
- Re-point queue disposition: item (1) toggle had its verdict
  (0330/0445/0550Z); item (2) flee-repair confirmed GO by Loop A 0820Z;
  item (3) standing led via standacc/diplo to competent-plus-ask, done
  by Loop A. This run therefore took the 1030Z round's next blank #1:
  approachfall confirm on a loop-producing band with a baseline-signal
  bar.

## Arm — sim-approachconf-b: GO-THIN (confirm, NOT a loop kill)
- Branch commits, merged --ff-only (master was still 51d3f7773, so no
  rebase was needed): 4a3b7d273 prereg + confirm tooling,
  980de94f3 Stage 0 baseline screen, 23a0149df Stage 1 armed legs,
  8d89e94f8 evidence. Zero src/js and zero policy diff vs master —
  the approachfall variant was used verbatim from master.
- Instrument correction vs the pilot (the point of this confirm):
  the pilot classified failed-approach turns by the CLOSEST monster's
  distance; the approach branch keys on the WEAKEST monster. The
  confirm analyzer splits every zero-tile move-only turn by weakest
  monster into APPROACH-STEP (weakest out of range), FLEE-WALK
  (weakest in range + non-adjacent target), and OTHER-BLOCKED. Proof
  fixture demonstrates a case the pilot predicate scores 0 and the
  confirm predicate scores 1.
- Stage 0 screen (baseline only, 99601-99612, 140d, competent
  verbatim): signal bar PASSED with exactly 1 loop fight — 99605
  seq 2, day 136: 14 identical "No path there." steps to (0,7),
  0 strikes, death. The preregged second band (99901-99912) was not
  needed and not run. Pilot band 99801-99808 not re-run (known 0).
- Stage 1 confirm (same 12 seeds, baseline vs armed, identical
  seeds): all pre-registered bars pass, but the fallback NEVER FIRED
  in a live sim (armed fallback-consistent events 0; armed max run
  2, below the 3-same-target mark), and the one baseline loop's seed
  diverged on the armed leg (armed 99605: 1 exposure, 0 approach
  steps), so there is no same-seed "loop here, broken there" pair.
  Verdict is therefore GO-THIN per the prereg's own qualifier:
  strictly stronger than the pilot (this band DOES produce a
  baseline loop; armed leg shows 0 loops with no harm), but the
  live loop kill itself remains UNPROVEN. Citing this confirm as
  "the approach loop is fixed" would be wrong.
- Judged numbers (12 seeds, 140d): baseline loops 1, armed loops 0;
  approach-step turns 18 baseline / 6 armed; flee-walk turns 19 / 0;
  exposures 56 / 52; wave-4 kills 7 / 8; starvation totals 6 / 8
  (bar: armed totals <= baseline + 2 — passes exactly at the
  boundary; player-flagged 2 / 3); median survival 98.5d / 98d
  (bar >= 78.8d); wins 0 / 0, national 0 / 0, table 0 / 0;
  wave-5 unlocked 0 / 2 seeds (99608, 99609), wave-5 kills 0 / 0.
- Sense-test: the baseline loop transcript reads as a broken robot
  (fourteen identical "No path there." turns, no strike, wait, or
  re-pick). The closest armed cases read as people but are NOT
  fallback firings. Sense veto does not fire; the fallback's
  human-readability still rests on stub proofs, not a live
  transcript. The fallback proxy itself is proven confounded (it
  fires on the gate-off baseline, 99604 seq 5, a flee-branch move
  wearing the proxy's repick-attempt shape) — future firing claims
  need a direct counter, not this proxy.
- Proof: scripts/test-approachconf-20261104.js ALL PASS, re-run
  green on merged master by the coordinator. Balanced panel not
  run (prereg's stated registry-contamination reason — the variant
  is not a registry policy; no compare fabricated). Telemetry
  check refused the corpus as a recorder corpus (same tool-shape
  refusal as the pilot); wall numbers above come from measured
  per-seed scale fields (12/12 both legs).
- Safe-commit index-clobber phantoms hit two worker commits;
  repaired via HEAD-blob update-index --cacheinfo, commits verified
  correct. No clobber on the coordinator merge (ff-only).

## Scale-wall numbers (this run's confirm corpus)
Wins 0/12 both legs, national 0/12, table 0/12, full seat 0,
wave-5 kills 0, wave-5 unlocked 0 baseline / 2 armed, median
survival 98.5d / 98d. Full seat still unwon, wave-5 kills still 0.

## Next blanks, in order
1. The live fallback firing itself (this run's named next blank):
   replay the 99605 seq-2 loop geometry (influencer fight, target
   (0,7), 14-step shape) through the real armed policy in the
   harness and show wait/re-pick breaking it, plus a direct
   fallback counter in the instrument. Another band screen is NOT
   the next blank — trajectory divergence defeats same-seed
   pairing, and a third 0-firing screen would add nothing.
2. BELONG-direction zombie clear and/or a survival-first substrate
   pre-registered for >=200d life (carried from 1030Z blank 2).
3. Floored tend-through variant with death-day deltas + wave-facing
   guard (carried from 1030Z blank 3).
4. BELONG-tending gap — belongseek panel with a policy that tends
   subordinate links (carried from 1030Z blank 4).
5. 99101 hold-beat case re-finding per anchor (carried from 1030Z
   blank 5).
6. wave5faced label rename (carried from 1030Z blank 6).
NO gate/price/deed arm follows.

## Disposition
- scale-onramp stays converging (NOT converged): the approachfall
  confirm is GO-THIN, not a proven loop kill; the full seat is
  still unwon and wave-5 kills still 0.
- food-economy stays converging (untouched; sibling Loop A).
- Worker tree released done-merged, branch deleted. Main tree
  clean at closeout. Claim deleted; lock deleted.
- Merged locally, pending ship (no push, no bump, no live
  verification — ship loop owns deploys).
