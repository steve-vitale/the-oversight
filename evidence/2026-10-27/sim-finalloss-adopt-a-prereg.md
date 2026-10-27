# sim-finalloss-adopt-a — ADOPTION PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout-20261027T0615Z, arm sim-finalloss-adopt-a, axis scale-onramp.
ADOPTION of the dead arm sim-finalloss-a (run fleshout-20261027T0105Z).

## Run-id adaptation (the ONLY deviation from the dead prereg)

The dead run died leaving only an untracked prereg, preserved
byte-identical at
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-finalloss-a-prereg-preserved-20261027.md`
(verified identical to the untracked original at
`~/workspace/worktrees/sim-finalloss-a/evidence/2026-10-27/sim-finalloss-a-prereg.md`,
which this arm READS but never touches). This arm runs as
adoption arm sim-finalloss-adopt-a under run
fleshout-20261027T0615Z. All prereg bindings stand unchanged:

- Candidate-cause set F1–F13, classification definitions,
  DIAG-GO threshold, G1/G2 gates, cost bar, cross-checks
  (a)–(f), and the re-derivation requirement for BOTH known
  instances (seq51/73672 day 148, seq45/73673 day 112).
- DIAG / MEASUREMENT ONLY: zero src/js changes, no default
  flips, no combat/tb/channel code changes, no lever proposal.
  In particular the TB CHANNEL RESET (whether tb should
  inherit field wounds) is a STEVE-CALL design question:
  traced only, never proposed as a lever, never smuggled into
  a commit or evidence recommendation.
- A cause not in F1–F13 may NOT be claimed from rows alone;
  report UNEXPLAINED or UNOBSERVABLE with counts, never forced.
- Baseline: this arm runs its OWN plain replication first on
  current master (seeds 73671–73678, tableseat-nowait, 180d
  death-aware) and reports base delta field-by-field against
  BOTH the prereg's 1920 band table (wins 2/8, national-ever
  6/8, national-final 5/8, table 4/8, entered 2/8, wave-4 6/8,
  wave-5 0/8, median 152d, deaths 307, starvation 1) AND the
  0525Z current-base band (national-ever 7/8, national-final
  5/8, table invited 5/8, entered 4/8, wins 4/8, wave-4 5/8,
  wave-5 0/8, median 130d, deaths 284, starvation 2) — never
  silently absorbing base movement.
- Substrate: scripts/policies/tableseat-nowait.js (wraps
  leanlinkrescue; composed upon, never edited). Armed: the
  five w4dmg-a recorders verbatim from current master
  scripts/policies/ (w4dmg-diag, wave4enc-diag,
  spawnsrc-diag, fieldfinish-diag, nonworldkill-diag — NO
  edits) PLUS seq51gap-diag verbatim PLUS ONE new
  observational recorder scripts/policies/finalloss-diag.js
  (FINALLOSS=1, distinct name, never editing existing
  recorders) implementing the prereg's tbEnd wrap +
  removeWorldMonster wrap exactly as specified (warn capture
  forwarded, no game-state writes, no RNG draws, never throws
  into the engine, never calls villageStandingTotal() or
  unlockedWave() mid-run).

## Adoption notes (implementation detail, not binding changes)

- The dead prereg's "installed before the inner policy's
  daily work" is implemented literally: withFinallossDiag
  installs before delegating to the inner daily (unlike the
  fight recorders, which install after), so day-1 fights are
  covered; the sweep also installs explicitly after setupGame.
- Removal-vs-verdict-tick ordering uses tick epochs: the
  finalloss daily's post-inner bookkeeping runs after the
  seq51gap tick, so each row's tickEpoch counts ticks already
  recorded. A removal with tickEpoch below the verdict tick
  day's epoch-after happened before that day's tick; a night
  removal after the tick carries the tick in its epoch and is
  excluded. Missing epoch maps (harness day-jumps) fall back
  to day comparison, flagged epochFallback on the case.
- Verdict precedence, stated here so the analyzer cannot
  re-read it after seeing rows: F10 (F3/F4 final rows) is a
  classified verdict, recorded and counted, never a final-loss
  failure; post-present mismatch with a present verdict tick
  is F13, while post-present mismatch with an absent verdict
  tick is decided by the removal evidence (F8/F9/F11) with the
  mismatch flagged and counted — the disappearance story wins
  over the mismatch flag when a disappearance exists.
- Verdict tick = first tick RECORDED AFTER the tbEnd, not
  merely first tick with day >= tbEnd day: on a frozen scholar
  day a second daily phase can run after that day's tick was
  recorded, and taking that stale tick as the verdict tick
  manufactures false F11s. A same-day tick is valid only when
  the tbEnd's tickEpoch precedes that day's epoch-after (or
  the tick is the post-run force tick, which is always after
  everything). Stale same-day ticks skipped are counted per
  case as staleTickSkipped.
- Remover naming reads the caller stack's file:line lines,
  skipping the recorder's own wrapper frame (V8 names it
  'Game', which mislabels every remover); the fn-name list
  alone is never used for the remover label.
- Known-instance identity is (seed, day, origin maxHp):
  seq numbers are reported, not assumed, because base
  movement may have renumbered spawns.

## The dead prereg, adopted by reference

Everything below the line in the preserved prereg — question,
restore code as read, candidate-cause set, substrate,
classification, DIAG-GO threshold, cost bar/gates,
cross-checks, sense section, wall numbers, metric review —
is adopted verbatim and binds this arm. Read the preserved
file alongside this adoption note; where this note and the
preserved prereg appear to differ, the preserved prereg wins
except for the run-id adaptation stated above.
