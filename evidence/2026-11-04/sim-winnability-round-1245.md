# Loop B run fleshout-loop-b-20261104T1245Z — coordinator evidence

Run: fleshout-loop-b-20261104T1245Z. Axis: scale-onramp (winnability-chain
re-point, Steve 2026-11-03 21:13). One arm, merged locally pending ship.

## Run-start state
- No B lock existed at run start. Loop A live throughout on food-economy
  (1220Z claim: hurthome-fix-c + armorfetch-watch-c) — NOT touched; its
  claim, lock, and trees left alone. Loop A landed armorfetch-watch-c
  (93e869fff + ad967ede4) mid-run; the worker branch rebased clean onto
  it (no file overlap), proof re-run green, then merged --ff-only.
- Re-point queue disposition at run start: item (1) toggle had its
  verdict (0330/0445/0550Z); item (2) flee-repair confirmed GO by Loop A
  0820Z; item (3) standing led via standacc/diplo to competent-plus-ask,
  done by Loop A; 1212Z had taken the 1030Z next blank #1 (approachconf
  GO-THIN). This run therefore took the 1212Z next blank #1: the live
  fallback firing itself.
- Pre-flight: main tree clean at run start, disk 27%. Reaper removed
  nothing sibling-owned (9/16 active at closeout; streakfree-b,
  fleerepair-a, fracchoice-b, hurthome-fix-c flagged uncommitted and left
  alone). Claim written before any sims; deleted at closeout. Lock
  deleted at closeout.

## Arm — sim-approachfire-b: NO-GO (firing claim on this geometry — NOT a kill of the fallback mechanism)
- Branch commits, rebased + merged --ff-only: 2b6782cdd prereg (committed
  before any replay) + 21ef6e743 harness, proof, corpus, evidence. Zero
  src/js and zero policy diff vs master — the armed policy was used
  verbatim; the counter lives in the harness/driver, read from the
  policy's own ctx (approachFallbackMarks / waits / repicks), never the
  confounded repick-shape proxy.
- The finding that matters: the 99605 seq-2 "approach loop" is not an
  approach loop. All 14 corpus turns issue from the FLEE branch (legacy
  walk to the nearest x-edge, target (0,7)), never from CLOSE THE
  DISTANCE. The approachconf analyzer labels a turn APPROACH-STEP from
  weakest-monster out-of-range + zero-tile move-only alone, without
  recording the issuing branch — so a flee walk by a hurt, out-of-range
  fighter wears the approach label. The fighter sits at 33.88% HP, below
  the policy's 35% flee line, for the whole fight, so flee() runs first
  every turn and, gates off, never returns false — CLOSE THE DISTANCE
  and its fallback never run. What kills this loop under the armed
  policy is the already-landed flee repair / directional flee, not the
  approach fallback.
- Counter readings (direct ctx counters; 0 on the gate-off baseline as
  required):
  - Baseline, primary (map (4,2), only (0,7) blocked): 14 turns, all
    flee, all tbPlayerMove(0,7), 14x "No path there.", 0 strikes,
    counters 0/0/0, max same-target run 14 — baseline gate passes
    exactly.
  - Armed, primary: 2 turns — directional flee step to (4,8), then
    barrier exit. Counters 0/0/0. Loop broken WITHOUT the fallback
    firing → NO-GO per the prereg (breaking mechanism named, not
    hidden).
  - Armed, haven (4,4) sensitivity: approach step to (3,6) succeeds,
    then strikes; counters 0.
  - Armed, node55 (5,5) sensitivity: flee walks west, flee repair marks
    unfleeable and falls through in the same turn to approach steps,
    then strikes; counters 0, max run 2.
  - Armed, approach-only gates sensitivity: loop persists 20/20 flee
    turns, counters 0 — the fallback is unreachable while flee
    pre-empts it.
  - Armed, blocked-adjacent sensitivity (counter validation only,
    invented board, not a geometry claim): marks 3, waits 15, repicks 0;
    after the first mark only single re-probe steps recur. The counter
    is live and the wait branch does execute when the approach path
    genuinely blocks.
- Proof: scripts/test-approachfire-b-20261104.js ALL PASS, re-run green
  by the coordinator on the rebased branch (which is the merged master
  tip). Sibling proofs re-run green by the worker: test-approachfall and
  test-approachconf ALL PASS. No jest run (no jest in this arm).
- Sense-test: the baseline transcript reads as a broken robot — now
  diagnosed as a hurt fighter walking into a walled escape, not a
  fighter failing to close in. Armed primary reads as a person fleeing
  (step to edge, push through), because it is a flee. One caution, on
  the blocked-adjacent sensitivity only: the wait branch cycles 5 waits
  → 1 failed re-probe → 5 waits against a static monster, which reads
  as patience turning into a second loop if geometry never changes —
  flagged as an open design question (a bound on frozen waits), not a
  veto on this verdict.
- Worker evidence: evidence/2026-11-04/sim-approachfire-b.md +
  sim-approachfire-b-prereg.md; corpus perseed-approachfire-b/ (6 legs
  x JSON + transcript); harness scripts/probe-approachfire-b-20261104.js.
- Safe-commit index-clobber phantoms hit both worker commits; repaired
  via HEAD-blob update-index --cacheinfo, commits verified correct. No
  clobber on the coordinator merge (ff-only).

## Scale-wall numbers (carried from 1212Z — this arm ran NO new sim panel)
Wins 0/12 both legs, national 0/12, table 0/12, full seat 0, wave-5
kills 0, wave-5 unlocked 0 baseline / 2 armed, median survival 98.5d /
98d. Full seat still unwon, wave-5 kills still 0 in normal play. In
plain words: the loop that was supposed to prove the approach fallback
turns out to be a flee loop the flee repair already breaks — the
approach fallback itself is still unproven live, and the next hunt needs
a true approach geometry, not another re-screen of this one.

## Telemetry deviation check
Declared INAPPLICABLE, not run: this arm ran no sim panel — its corpus
is a harness replay, not a per-seed panel — and the endgame baseline is
the same stale, regime-unrecorded file whose own text forbids pre-seat
comparisons (same reason as toggle/approachconf). No compare fabricated,
baseline NOT rolled. §15 balanced panels do not apply to this replay
diagnostic by design.

## Next blanks, in order
1. A live approach-fallback firing on a TRUE approach geometry —
   fighter HP >=35% and not outmatched at fight start so fight()
   reaches CLOSE THE DISTANCE, weakest monster out of range, approach
   step blocked on a board the corpus actually records. Prerequisite:
   split the analyzer's APPROACH-STEP class by issuing branch first,
   or the search will re-find flee loops.
2. A bound on frozen waits (wait-branch cycling 5 waits → re-probe →
   5 waits against static geometry) as a design question, not a lever.
3. BELONG-direction zombie clear and/or a survival-first substrate
   pre-registered for >=200d life (carried from 1030Z/1212Z).
4. Floored tend-through variant with death-day deltas + wave-facing
   guard (carried).
5. BELONG-tending gap — belongseek panel with a policy that tends
   subordinate links (carried).
6. 99101 hold-beat case re-finding per anchor (carried).
7. wave5faced label rename (carried).
NO gate/price/deed arm follows.

## Disposition
- scale-onramp stays converging (NOT converged): the approach fallback
  is still unproven live; the 99605 loop is reclassified as a flee loop
  the flee repair already breaks; the full seat is still unwon and
  wave-5 kills still 0.
- food-economy stays converging (untouched; sibling Loop A).
- Worker tree released done-merged, branch deleted. Main tree clean at
  closeout. Claim deleted; lock deleted.
- Merged locally, pending ship (no push, no bump, no live verification
  — ship loop owns deploys).
