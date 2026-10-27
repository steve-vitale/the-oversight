# sim-defiantdoor-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout-20261027T1315Z. Axis: scale-onramp. Worker: sim-defiantdoor-a.
Arm: close the last unwalked lesser door. Doors walked at the lesser seat so
far: feared, assimilated, relay, witness, beloved. Defiant is the one remaining
lesser door NEVER walked (indispensable needs the full seat, so it cannot walk
here). The 2115Z rotation ASSIGNED defiant to seeds but only assimilated/relay
seatings actually happened on that band — assignment is not a walk.

Canon (read first): docs/CANON.md, then docs/TABLE.md (the Defiant section).
Defiant prereq (src/js/table-defiant.js, NOT changed by this arm): ledger
defiance >= 4, minSeat lesser. A door never offered is NEVER taken — forcing
an unearned door would bypass the engine's prereq (the modalplay precedent).

Substrate: scripts/policies/tableseat-nowait.js (leanlinkrescue courtship +
seat legs only, NO wait leg).
Baseline: tableseat-nowait on identical seeds. NOT judged against 1955Z
numbers — the 1215Z run proved that control band stale on the current base.
This arm RE-BASELINES on its own fresh band.

Policy (policy-side ONLY, zero src/js): scripts/policies/tablepaths-defiant.js,
modeled exactly on scripts/policies/tablepaths-witness.js. Env-gated, default
OFF: TABLEDEFIANT unset or not '1' → daily delegates to tableseat-nowait
daily EXACTLY (det-gate pins this). Door rule, at a paths-phase offer (every
option id 'path:*'):
  (1) if 'defiant' is offered, take it (rule 'defiant');
  (2) else take the first offered door that is NOT 'feared', in engine order
      (rule 'fallback-non-feared');
  (3) else (only feared offered) take feared (rule 'fallback-feared'; that
      seating is flagged fallback-Feared and does NOT count toward GO).
Downgrade, conscript, demand-price, challenge beats and finals take the FIRST
option, exactly like tableseat-nowait. Branches stay ledger-earned; this layer
NEVER overrides tableBranch.
NEVER edited: tableseat-nowait.js, tablepaths-nowait.js, leanlinkrescue.js,
tablepaths-witness.js, or any src/js file.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: defiant entered >= 1 seating on the pilot AND the scalemetric
deciding cost bar passing:
  - starvation (death cause matching /starv|hunger/i) armed total
    <= baseline total + 2, AND
  - arm-only starvation deaths <= 2 (seeds where baseline starvation = 0
    but armed > 0, summed), AND
  - armed median days >= 0.8 x baseline median days.
Fallback-Feared seatings do NOT count toward the defiant-entered count
(they walk feared by construction).
If the defiant door is never OFFERED on the band (defiance < 4 everywhere),
that is a NO-GO with the mechanism named — do not force it, do not re-score.
If the band produces 0 seatings at all, the verdict is PILOT-INCONCLUSIVE
(not a defiant kill, not a GO) — reported as such, never re-scored on
another band mid-run.

GO threshold summary: defiantEntered >= 1 AND cost bar (above) passes.
A miss is NO-GO, never re-scored against a friendlier metric mid-run.

Secondary (reported, NOT judged): entered/won per door, national ever/final,
wave-4/5 reach, deaths, prices paid on defiant walks (defiant's first price
can deduct 20,000 pantry kcal and name a villager for the relay — report what
actually happened).

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): 8 seeds before/after on identical
  seeds, 180d death-aware horizon (dead villages stop simulating, +10d tail
  max — the harness's runDays death-aware stop).
- Seeds: 74101-74108 (pilot). Fresh-band check BEFORE sweeping: grep of
  evidence/2026-10-27/*.md and per-seed corpus filenames found NO collision
  for 74101-74108 (73671-73678 heavily reused today, 73661-73668 collided
  with pantrystarve corpora — both avoided; 739xx bands are in use, also
  avoided).
- Policies: baseline = tableseat-nowait (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset); armed = tablepaths-defiant
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT=1). Both share
  leanlinkrescue courtship exactly; the delta is ONLY the door choice.
- Proof gates: G1 det-gate (off == tableseat-nowait exactly: same days and
  gameDays on the det-gate seed, no dp counters); G2 leak gate (on every
  pilot seed where NEITHER arm entered the table, days and gameDays must be
  identical — the door assignment changes NOTHING except the door answered);
  G3 corpus integrity (every config produced a row, no zero-day rows).
  A G2 leak or G3 failure is a proof-gate failure (exit 1), not a verdict.
- If pilot GO: confirm band of 12 fresh seeds (same substrate, same rules)
  if time allows; pilot-GO vs confirm reported separately, never blended.
  If pilot NO-GO: kill cleanly — DELETE the policy file, land instruments +
  evidence only, no trace.
- SENSE TEST: at least one full defiant seat transcript from the band,
  judged in plain words in the evidence: does the walk read as a real
  refusal with real prices, or as menu-clicking? Note repeated/generic lines.
  Sense replay is NON-MEASURED (narration shifts trajectories).
- Horizon why: 180d death-aware matches the witness/tablepaths bands, so
  the fresh baseline is comparable in shape; villages that die stop early
  instead of being dragged to a fixed day count.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go here, and
  any revision applies to the NEXT run, never this one.)
