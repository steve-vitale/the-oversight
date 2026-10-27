# sim-fallbackfeared-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, fallback-feared live test. Axis: scale-onramp. Worker: sim-fallbackfeared-a.
Worktree: `~/workspace/worktrees/sim-fallbackfeared-a` (branch sim-fallbackfeared-a).

Canon (read first): docs/CANON.md, then docs/TABLE.md (the Feared section).
Feared, per TABLE.md: protective terror vs domination; earned by might +
killed high in the vector, wave deeds showing real fights. A fallback-feared
seating is NOT a chosen feared walk: it is the defiant-door rule's rule (3) —
when only feared is offered at the paths phase, take feared. The seating is
flagged fallback-Feared. Branches stay ledger-earned; this arm NEVER overrides
tableBranch. No canon invented.

## The rule under live test (from sim-defiantdoor-a, 1315Z)

scripts/policies/tablepaths-defiant.js, rule (3): at a paths-phase offer
(every option id 'path:*'):
  (1) if 'defiant' is offered, take it (rule 'defiant');
  (2) else take the first offered door that is NOT 'feared', in engine order
      (rule 'fallback-non-feared');
  (3) else (only feared offered) take feared (rule 'fallback-feared';
      that seating is flagged fallback-Feared and was EXCLUDED from the
      defiant GO).
Live uses so far: ZERO. Unit proof only (scripts/test-tablepaths-defiant.js,
only-feared case: picks path:feared, rule fallback-feared, dpFallbackFeared
flagged). Defiant pilot + confirm exercised rules (1) and (2) live
(defiant 2+7 entered/won; fallback-non-feared 1, on 74106) but rule (3)
never fired (fallback-feared 0 on both bands). This run gives rule (3) its
first live test. It does NOT re-litigate the defiant GO.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Baseline: scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset).
- Armed: scripts/policies/tablepaths-defiant.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT=1).
- NEVER edited: tablepaths-defiant.js, tableseat-nowait.js, leanlinkrescue.js,
  or any src/js file. If a recorder is needed, it is a NEW script; the
  policy is never edited to record.
- Sweep instrument: scripts/test-tablepaths-defiant-sweep.js REUSED via
  env only (SEEDS / EVID / DAYS) — no edits to that script either. Its
  verdict field is the DEFIANT verdict and is NOT this run's verdict;
  this run judges manually from its per-seed rows + summary.json.
- Own baseline: this run runs its own baseline on identical seeds. NEVER
  another arm's corpus as baseline.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: fallback-feared seatings entered AND won.
  - A fallback-feared seating = an armed row with entered=1 AND
    fallbackFeared=1 (enteredPath will be 'feared' by construction).
  - A fallback-feared WIN = such a row with won=1.
GO requires ALL of:
  (a) at least 1 fallback-feared seating that enters AND wins, AND
  (b) the scalemetric cost bar:
      - starvation (death cause matching /starv|hunger/i) armed total
        <= baseline total + 2, AND
      - arm-only starvation deaths <= 2 (seeds where baseline starvation
        = 0 but armed > 0, summed), AND
      - median days armed >= 0.8 x baseline median days.

If the band produces ZERO fallback-feared seatings, the verdict is
PILOT-INCONCLUSIVE (not GO, not a kill) — do NOT re-score, do NOT force a
door, do NOT cherry-pick seeds after seeing results to manufacture a
seating, do NOT re-run another band as the pilot.
If fallback-feared seatings enter but LOSE, report NO-GO with the mechanism
named (branch, meters, price, death, downgrade — whatever the rows show).
If GO-candidate at pilot, confirm on a fresh separate 12-seed band (never
blended with pilot), chosen and freshness-checked at that time.

Secondary (reported, NOT judged): entered/won per door, defiant/fallback-
non-feared counts (they show the door-rule context but do not count toward
this GO), national ever/final, wave-4/5 reach, deaths, seat attempts/taken.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): 8 seeds before/after on identical
  seeds, 180d death-aware horizon (dead villages stop simulating, +10d tail
  max — the harness's runDays death-aware stop).
- Seeds: 74201-74208 (pilot). Freshness verified BEFORE sweeping: grep of
  evidence/2026-10-27/*.md AND per-seed corpus filenames found NO collision
  for 74201-74208. Bands already used today and forbidden here:
  73601-73608, 73641-73648, 73671-73678, 74001-74008, 74101-74108,
  74111-74122, plus 73661-73668 (pantrystarve collision) — all avoided.
- Horizon why: 180d death-aware matches the defiantdoor bands, so the
  fresh baseline is comparable in shape; villages that die stop early
  instead of being dragged to a fixed day count.
- Proof gates (adapted from defiantdoor, defined BEFORE sweeping):
  - G1 det-gate: TABLEDEFIANT unset, TABLESEATNOWAIT=1: first pilot seed
    74201, armed policy days == tableseat-nowait days, no dp counters
    (run via the reused sweep's --detgate mode with SEED=74201).
  - G2 leak gate: for every pilot seed where NEITHER arm entered the
    table, days and gameDays must be identical — the door assignment
    changes NOTHING except the door answered.
  - G3 corpus integrity: every config produced a row (16/16), no zero-day
    rows, counters present.
  - A G2 leak or G3 failure is a proof-gate failure (exit 1), not a verdict.
- SENSE TEST: if a fallback-feared seating occurs, read at least one
  seating transcript (non-measured sense replay) and judge it in plain
  words in the evidence: does the feared walk read as a real terror
  calibration with villager reactions, or as menu-clicking? If none
  occurs, say so plainly — no sense replay is claimed as a seating.
- On NO-GO or PILOT-INCONCLUSIVE: land instruments + evidence only and
  delete scratch files. This arm creates NO new policy file and flips NO
  default. On GO: the existing policy file is already landed — say so;
  do not re-commit it.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go here, and
  any revision applies to the NEXT run, never this one.)
