# sim-defnoffer-screen-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: flesh-out loop, defiance-not-offered screen. Axis: scale-onramp.
Worker: sim-defnoffer-screen-a. Worktree:
`~/workspace/worktrees/sim-defnoffer-screen-a` (branch sim-defnoffer-screen-a).

Canon (read first): docs/CANON.md, then docs/TABLE.md (the Feared
section) and docs/MONSTER-WAVES.md. No canon invented. The defiant-door
rule under test is POLICY-SIDE, not canon (see below).

## Background (why this arm exists)

evidence/2026-10-27/sim-fallbackfeared-a.md (pilot 1631Z, seeds
74201-74208) was PILOT-INCONCLUSIVE: defiance was offered on all 6
seated seeds (defiance 6-11 on the record), so rule (1) of the
defiant-door rule pre-empted rule (3) every time and fallback-feared
seatings were 0/8. Its metric review says the next arm must pre-screen
for defiance NOT being offered. That is this arm. Seeds 74201-74208
are NOT re-swept or re-scored here. Precedent that a no-defiance
seated seed exists: 74106 (defiantdoor band 74101-74108) seated with
defiance 3, defiant NOT offered, rule fallback-non-feared (beloved).

## The rule (from sim-defiantdoor-a, 1315Z; policy verbatim)

scripts/policies/tablepaths-defiant.js, at a paths-phase offer
(every option id 'path:*'):
  (1) if 'defiant' is offered, take it (rule 'defiant');
  (2) else take the first offered door that is NOT 'feared', in engine
      order (rule 'fallback-non-feared');
  (3) else (only feared offered) take feared (rule 'fallback-feared';
      that seating is flagged fallback-Feared).
A door never offered is NEVER taken. Branches stay ledger-earned; this
arm NEVER overrides tableBranch. Defiant prereq (src/js/table-defiant.js):
ledger defiance >= 4; below that the door is not offered at all.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Baseline: scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset).
- Armed (the observing leg): scripts/policies/tablepaths-defiant.js
  VERBATIM (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT=1).
- NEVER edited: tablepaths-defiant.js, tableseat-nowait.js,
  leanlinkrescue.js, or any src/js file. No new policy file, no default
  flipped, no game lever of any kind. This arm is DIAG / MEASUREMENT ONLY.
- Sweep instrument: scripts/test-tablepaths-defiant-sweep.js REUSED via
  env only (SEEDS / EVID / DAYS) — no edits to that script either. Its
  verdict field is the DEFIANT verdict and is NOT this run's verdict;
  this run judges manually from its per-seed rows + summary files.
- Own baseline: every candidate band runs its OWN baseline on identical
  seeds (the reused sweep always runs both legs). NEVER another arm's
  corpus as baseline.

## Phase 1 — screen design (BINDING)

Candidate bands, screened IN ORDER, each a full paired sweep (both legs,
8 seeds, same instrument, same horizon). Screening STOPS at the first
band that qualifies; later bands are then never run. A band that
qualifies is the SOLE Phase 2 band. A band that fails to qualify is
screen-only: its fallback-feared count is recorded but NEVER judged
for the Phase 2 GO (judging every band until one passes would be
cherry-picking, and this prereg forbids it).

  Band A: 74601-74608
  Band B: 74801-74808
  Band C: 75701-75708

Freshness verified BEFORE sweeping: grep of evidence/2026-10-27/
found ZERO hits for any seed in bands A, B, or C (74601-74608,
74801-74808, 75701-75708 all 0 hits; neighbouring used ranges
74201-74208, 74101-74108, 74111-74122, 73601-73608, 74001-74008 and
all other 2026-10-27 bands avoided). No other 2026-10-27 evidence
uses these seeds.

Per seed per band, recorded from the armed row: entered, offer list
(dpOffers: the paths-phase `offered` array), defiance offered yes/no
('defiant' present in `offered`), defiance value if present (from the
earned snapshot's defiant `why` string, e.g. "Defiance 11"), door
taken (enteredPath / doorRule), won, national ever/final, table,
wave reach, median survival. Wall numbers per band: national / table
/ wins, wave 4-5 unlocks, median survival (both legs).

Horizon: 180d death-aware, same as the 1631Z pilot (dead villages
stop simulating, +10d tail max per the harness's death-aware stop) —
so the qualifying band's pilot is comparable in shape to the
inconclusive pilot it follows.

### Qualifying-band definition (BINDING)

A band QUALIFIES iff BOTH hold on its armed leg:
  (a) seated seeds >= 3 (a seated seed = armed row entered = 1), AND
  (b) >= 2 seated seeds have defiance NOT offered ('defiant' absent
      from that seed's paths-phase offer list).
If no band satisfies both, the verdict is SCREEN-NEGATIVE (see below)
— documented, killed with teeth, no live test forced, no
cherry-picking beyond these three pre-registered bands, no fourth
band, no re-screening of 74201-74208.

Note the deliberate gap between qualification and the Phase 2 GO:
qualification needs only defiance-not-offered, while a fallback-feared
seating needs ONLY feared offered. A qualifying band may therefore
still yield zero fallback-feared seatings (its no-defiance seeds may
take fallback-non-feared doors, as 74106 did). That outcome is
PILOT-INCONCLUSIVE in Phase 2, not a failure of the screen.

## Phase 2 — conditional live pilot (qualifying band ONLY)

Judged ONLY on the first qualifying band's already-run paired corpus
(no re-sweep: the Phase 1 sweep on that band already ran both legs on
identical seeds, so its corpus IS the pilot corpus).

GO requires ALL of:
  (a) at least 1 fallback-feared seating that enters AND wins
      (armed row entered = 1 AND fallbackFeared = 1 AND won = 1), AND
  (b) the scalemetric cost bar (same as the 1631Z pilot):
      - starvation (death cause matching /starv|hunger/i) armed total
        <= baseline total + 2, AND
      - arm-only starvation deaths <= 2 (seeds where baseline
        starvation = 0 but armed > 0, summed), AND
      - median days armed >= 0.8 x baseline median days.

Verdict branches (no re-score mid-run):
  - QUALIFIED + GO met -> GO (pilot-level; a confirm on a fresh
    separate 12-seed band is a FUTURE run's job, never blended here).
  - QUALIFIED + fallback-feared seatings enter but LOSE -> NO-GO
    with the mechanism named (branch, meters, price, death,
    downgrade — whatever the rows show).
  - QUALIFIED + ZERO fallback-feared seatings -> PILOT-INCONCLUSIVE
    (the screen found no-defiance seats, but rule (3)'s only-feared
    trigger still never fired; do NOT proceed to another band).
  - NO BAND QUALIFIES -> SCREEN-NEGATIVE (the screen, not the rule,
    is what failed; rule (3) stays unit-proven only, exactly as after
    1631Z).

## Proof gates (defined BEFORE sweeping)

  - G-screen (per band): every config produced a row (16/16), no
    zero-day rows, counters object present on every row (the reused
    sweep's G3, reported per band).
  - G-offer (per seated armed row): the row's defiance-offered flag
    is consistent with its offer list — flagged offered iff 'defiant'
    appears in dpOffers' `offered` array, and vice versa. Checked by
    scripts/test-defnoffer-screen-a.js (this arm's proof script);
    a mismatch is a proof-gate failure (exit 1), not a verdict.
  - G-leak (qualifying band only, same as 1631Z G2): for every seed
    where NEITHER leg entered the table, days and gameDays must be
    identical between legs — the door assignment changes NOTHING
    except the door answered. A leak is a proof-gate failure.
  - Det-gate: NOT re-run. The delegation proof for this exact
    verbatim policy (TABLEDEFIANT unset == tableseat-nowait) already
    passed in 1631Z (G1, full-sim form, seed 74201); nothing in this
    arm changes the policy, so re-running it would prove nothing new.

## SENSE TEST

If a fallback-feared seating occurs in the qualifying band, read at
least one seating transcript (the reused sweep's --sense mode is a
NON-MEASURED replay; it never enters the census) and judge it in
plain words in the evidence: does the seating read as a real choice,
not a mechanical fallback? If none occurs, say explicitly that no
seating transcript is claimed.

## Balanced panel (MEASUREMENT.md §15)

scripts/balance-panel.js has NO corpus-ingest mode for this corpus
(its modes are its own observer/compare; no per-seed-corpus ingest
flag exists). So: no panel artifact is produced and none is faked.
The before/after per-seed comparison in the evidence IS the
comparison, as in 1631Z.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
