# sim-voiceless-a — prereg (committed BEFORE any judged sim)

Run `fleshout-20261112T2315Z`, Loop A, axis scale-onramp, arm sim-voiceless-a.
Build: voice the wave-5 armed shortfall — a villager morning-briefing line
naming the block (pair held, armed short of 6) plus a scholar-churn line
when a scholar died in the wild since the last voicing.

## The question

On the pairarming band the village holds a wave-5 pair for 19 days
(seed 190398, d131–149) with armed 3–5 vs demand 6 and nobody says a
word about it (evidence/2026-11-12/sim-pairarming-a.md §3). The System
hold beat exists in code (`_standingHoldBeat`, initial + 7-day reminders)
but a probe on THIS tree (seed 190398, 150d, competent) found it fires
ZERO times: the village never reaches the deferral condition here
(unlockedWave 2, 8 wave kills — the trajectory diverged from the r9-cut
base ee30f22a2 after the r131 phantom-veteran fix and journey-landing
movement work). So the gap on this tree is wider than the pairarming
finding: no voice at all names the wave-5 block, System or villager.
The build adds the villager voice; this band measures it on this tree.

## Base

Worktree `sim-voiceless-a`, branch `sim-voiceless-a` at `bd29d8bd7`
(master has since moved to `247ee1c9a` via a ship-loop version bump;
rebase onto the explicit SHA at the end, never `git rebase master`).

## Band

Seeds **190391–190398** (the pairarming band), **150d**, **competent**
policy. Two legs on identical seeds, same tree state except the build:
- CONTROL (pre-build): driver records the daily condition
  (wave-5 deferred + veterans ≥ 2 + armed < 6) and wall numbers.
- VOICE (post-build): same driver, same seeds; records voice firings.
The condition is read daily in the driver's `finally` block, the same
pattern as the pairarming instrument.

## Primary metric

Voice firings under the pairarming condition.

**GO bar (all three must hold):**
1. FIRE — the shortfall voice fires on ≥ 1 day in the band where the
   condition holds (wave-5 deferred AND veterans ≥ 2 AND armed < 6).
   If the condition never arises on any seed/day in the band, the band
   is VACUOUS on this leg (not GO, not NO-GO — reported as such; the
   constructed-state proof test carries the firing evidence).
2. SILENCE — 0 voice firings on any day where the condition does NOT
   hold (no deferral, or veterans < 2, or armed ≥ 6).
3. NO PERTURBATION — per-seed wall numbers (days, endReason, scaleRank,
   maxWave, unlockedWave, deaths count) IDENTICAL between CONTROL and
   VOICE legs on all 8 seeds. The voice is say-only + state bookkeeping
   and must not move a trajectory.

**Secondary (reported, not judged):** the scholar-churn sentence
appears on ≥ 1 firing where a scholar died in the wild since the last
firing; if no such firing occurs in the band, reported as unobserved.

## Proof test (separate, before the band)

`scripts/test-voiceless-a.js` stages the pairarming conditions in
constructed state and proves: fires when deferred + pair held + armed
short; silent when (a) not deferred, (b) armed ≥ 6, (c) veterans < 2,
(d) no living non-scholar speaker, (e) inside the 7-day cadence;
churn line fires only for wild scholar deaths since the last voicing;
the speaker pick consumes no main-stream Math.random (trajectory
neutral by construction). Green on ≥ 3 seeds before the band runs.

## Horizon + why

150d: reachability horizon (§10) — the wave-5 deferral can only bite
late, and the pairarming hold itself sits at d131–149. Death-aware
stop rule applies (dead villages stop; +10d tail max).

## Convergence

Convergence state reported per §12 in the evidence file. This is a
narration arm, not a balance lever: no balance panel (§15) — the
control/voice band pair on identical seeds IS the before/after
instrument, and the pre-registered GO bar is the judge.
