# sim-scale-onramp-round-1816 — coordinator evidence (run fleshout-20261027T1816Z)

Axis: scale-onramp (topmost non-converged axis, unclaimed at run start).
Loop A live? No live lock or claim at run start — the 1715Z round had
landed (61f326408) and the 1730Z round was loop B on food-economy.
This run worked scale-onramp; food-economy untouched (sibling loop B).

Base at arm start: 5c3ae97be (journey-scale r45). Master moved twice
under the run before landing (journey-landing r62, 45256ea1c, 2 new
scripts, zero src/js; then loop-B dedupspan-wire-b, 967fdd4a9, 1588/1588
proof GO — zero overlap with either arm). Both arms rebased clean onto
the first move, proofs re-run green post-rebase, merged ff-only in
order: w5twokey, then lowdef; the coordinator evidence rebased onto
967fdd4a9 and merged ff-only last. No push, no bump — merged locally,
pending ship.

## Plain words

Two questions from the last round, both answered with numbers.

First, is wave 5 really a two-key lock — standing AND living veterans —
rather than one single block? Yes, on a fresh band of eight villages:
six of eight held neither key at their peak (no living veteran, and
standing short of 200). The two misses sharpen the picture rather than
blurring it: one village finally killed a wave-4 monster, but its
killer died before the end, so the veteran bar emptied again; another
village earned enough standing but sat stuck at 99 all run because the
veteran key gates wave 4 first — standing cannot matter until the
veterans key turns. The keys are sequential, not parallel.

Second, can a village reach the table WITHOUT having earned defiance,
so the fallback-feared rule can finally be tested live? Not on this
substrate either. A courtship that skips the weekly tend drain — the
best landed candidate for earning less defiance — was screened across
three fresh bands (24 villages): 8 reached the table, all 8 had earned
defiance, none qualified. The lowest defiance ever seen at a seating
in this whole line showed up (4, exactly at the threshold) and it
still earned the door. The rule stays proven only in unit tests.

## Arm 1 — sim-w5twokey-a: DIAG-GO (two-key lock confirmed)

Commits: prereg 249c8d839 (before any judged sweep), evidence
9e3870a36 (rebased from c7c214c6e / 07af4aff6). Proof:
scripts/test-w5twokey-a.js — ALL PROOFS PASS (V1–V7 + G4 deed
agreement + G5 twokey recount), re-run green post-rebase and on
merged master (coordinator re-verified in the worktree before
merging; the merge itself added no code).

- Fresh band 74311–74318, substrate tableseat-nowait verbatim
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset), 180d
  death-aware. No re-scoring of 74301–74308 or any prior band.
- Binding verdict: DIAG-GO iff on >= 6/8 seeds BOTH keys absent at
  peak (veterans-peak 0/2 AND capped standing-peak < 200). Result:
  exactly 6/8 — 74311 (110, 0), 74312 (127, 0), 74314 (122, 0),
  74315 (167, 0), 74317 (147, 0), 74318 (127, 0).
- Misses: 74313 — veterans peaked 1/2 (first wave-4 kill in this
  census family, day 94, killer dead by end, end veterans 0);
  74316 — capped standing peaked 202, veterans 0, yet gated stuck
  at 99 all run because the rd4 deferral (veterans 0) holds it and
  wave 4 never releases. Sequential keys, confirmed.
- Required secondaries: looser one-component rule (veterans 0 at end
  AND peak) 7/8, all but 74313. DeedGateReady bars, first
  instrumentation: w1 8/8, w2 8/8, w3 >= 4 3/8, w4 >= 3 2/8,
  w5 >= 2 0/8 (structurally forced while wave 5 is closed), contests
  >= 3 8/8, crises >= 3 6/8, stage >= 2 8/8, food deeds 5/8, scale
  national+ 4/8 at end / 7/8 at peak, ok 0/8. Agreement: deed w4 ==
  waveEngaged(4) on all 8 seeds. Disagreement (faced-vs-killed gap):
  deed w4 met on 74313/74318 while end veterans 0 on both.
- 'Wave-4 kills at zero while deed bars met': STRICT (deed ok true +
  0 kills) 0/8 — structurally impossible pre-wave-5, as
  pre-registered; LOOSE (all pre-w5 deed components + 0 kills) 0/8
  at end and peak. Closest: 74316 fails only the w4 faced bar. The
  formulation does NOT hold; the two-key lock does.
- Peak readiness: armor met 7/8, armed 8/8, tricks 8/8, veterans 0/8
  — only veterans never fills. End-state blocker support repeats
  w5block exactly: 0/8 everywhere.
- Wall: national ever/final 7/8 / 4/8 (was 6/8 / 6/8); table
  invited/entered 5/8 / 3/8 (was 2/8 / 2/8); wins 3/8, all feared
  lesser (was 2/8); full seat 0/8; lesser seat 3/8; wave-4 unlock
  5/8 (was 4/8); wave-5 unlock 0/8; median survival 156d (was
  159d); deaths 238, starvation 2 (0.8%). Combat dominates deaths
  (83.6%: villager combat 77, villager-vs-villager 66, arena 56);
  starvation is not the wall.
- Sense (seed 74312, highest end gated standing 127, last 30 days,
  297 hits): villagers read as people — pantry discipline, teaching
  kids snares, triage choice, envoy talk, a quiet dying end — and
  the game names the block honestly twice (d144, d151: "blood your
  fighters (0 of 1 veterans)"). The veteran pipeline still does not
  exist for them to pass through.
- Evidence: evidence/2026-10-27/sim-w5twokey-a.md + prereg +
  corpus evidence/2026-10-27/perseed-w5twokey-a/ (8 rows +
  summary.json + sense-74312.txt).

## Arm 2 — sim-lowdef-a: SCREEN-NEGATIVE

Commits: prereg d0e7b24fe (before any judged sweep), evidence
a5f6f8011 (rebased from c7c13b9e / 5cebfe02f). Proof:
scripts/test-lowdef-a.js --require A,B,C — ALL APPLICABLE PROOFS
PASS (det-gate, G-screen, G-offer, G-leak on all three bands),
re-run green post-rebase. No rule-(3) seating occurred, so no
seating transcript is claimed — the sense condition is unmet, not
faked.

- Phase 0 (unjudged): ledger defiance at seating is trial expiries
  only — 7/7 and 11/11 expiries on scratch seeds 76901–76902, 0
  arena-defiance acts, 0 declined world feeds, 0 refused scales.
  Haul trials complete only on 3-day pantry growth, so removing
  the 1,500 kcal/week/link tend drain was the best landed candidate
  for lowering defiance — stated as honestly modest in the prereg.
  Candidate substrate: leanlink courtship (cap 3, NO tends) under
  tableseat-nowait seat legs, tablepaths-defiant door on top.
- Screen (paired sweeps, 180d death-aware, identical seeds, own
  baseline per band; qualifying = seated >= 3 AND >= 2 seated with
  defiance NOT offered):
  - Band A 76101–76108: seated 1/8, no-defiance 0 — NO.
  - Band B 76301–76308: seated 3/8, no-defiance 0 — NO (seated
    minimum met, needs >= 2).
  - Band C 76501–76508: seated 4/8, no-defiance 0 — NO (same).
  - Total: 8/24 seated, 0/8 no-defiance, fallback-feared 0. No
    fourth band, no forced door, no re-scoring of prior bands.
- Every seated row took rule 'defiant' and won. Defiance at seating:
  A: 13; B: 4, 6, 8; C: 13, 6, 7, 11 — all at/above the >= 4
  threshold. The 4 on 76304 is the lowest defiance ever seen at a
  seating in this line (previous floor 5); it still earns the door.
  All 8 seatings lesser; no full seat anywhere.
- Wall (armed legs; baseline identical except the door): national
  ever 13/24, national final 10/24, table 14/24, wins 8/24, wave-4
  reach 13/24, wave-5 reach 1/24 (76502 — reached wave 5 and the
  table flag but never entered), median survival 180/147/142 days
  by band. Starvation 17 total, deaths 796 total; combat dominates
  (519/796 combat-shaped). Leanlink reached national less than
  leanlinkrescue (13/24 vs 21/24 on the 1715Z bands) — tend removal
  cost national holds, so it starved the screen of seatings as well
  as barely moving defiance.
- Killed-arm hygiene: the two leanlink policy files
  (tableseat-leanlink.js, tablepaths-leanlink.js) were DELETED
  before the final commit — no trace, per the killed-arm rule.
  Untouched: tablepaths-defiant.js, tableseat-nowait.js,
  leanlink.js, leanlinkrescue.js, all src/js.
- Evidence: evidence/2026-10-27/sim-lowdef-a.md + prereg +
  corpus evidence/2026-10-27/perseed-lowdef-a/ (48 rows +
  summary-band-A/B/C.json; summary.json = band C).

## Pooled wall (this run's judged material, 32 + 48 configs)

Armed/headline: national ever 20/32, table entered 17/32, wins
11/32, full seat 0/56 seatings-and-bands combined (0/8 + 0/24
seatings), wave-5 unlock 1/32 (76502, entered 0). The scale wall
has moved in one place only: a wave-5 unlock without an entry, on a
screen substrate. The full seat remains unreached everywhere, and
wave-4 kills still convert to living veterans on 0/8 + 0/24
screened villages (74313's kill died with its killer).

## Village assessment (plain words)

The villages in both arms are not failing villages: they reach
national, sit at the lesser table, and win small — or die with the
fifth draft still in the wings. What they cannot do is blood a
fighter who lives: the one wave-4 kill this round was made by
someone who did not survive to the end, and the standing-rich
village that should have knocked on the wave-5 door instead sat at
99 because the veteran key turns first. On the courtship side, a
village that stops paying the weekly tend still arrives at the
table having earned defiance through expired trials — defiance is
not a courtship luxury, it is what a long road accrues. A future
rule-(3) test needs a different kind of player, not a cheaper
courtship: the lowdef evidence's metric review points at a
trial-completing player, and at screening for seat rate as well as
defiance (this screen's seat rate, 8/24, was itself thin).

## Telemetry deviation check (loop body step 10)

- w5twokey corpus: 3 LOUD lines (national 12->0, table -69%
  16->5, wins 16->0, n=9 files) — KNOWN ARTIFACT, same as w5block:
  WINSEAT baseline vs tableseat-nowait substrate + per-seed
  field shape (rows carry nationalEver/entered/won, not top-level
  paths; summary.json is the 9th file). Baseline NOT rolled.
- lowdef corpus: 3 LOUD lines (national 12->0, table +75%
  16->28, wins 16->0, n=52 files) — same KNOWN ARTIFACT class
  (baseline regime + field shape; 52 files = 48 rows + per-band
  summaries + summary). Baseline NOT rolled.
- No exiled LOUD line on either corpus. Real wall numbers are in
  the arm sections above.

## Metric review (§14)

No metric was re-scored mid-run. Both arms were judged exactly
against preregs committed before their judged sweeps. Notes for the
NEXT run, never revisions of this one:

1. The two-key lock is now a confirmed measurement, not a framing
   proposal — but it is confirmed at exactly 6/8, the threshold.
   A future confirm band should pre-register whether 6/8-at-
   threshold counts as confirmation or demands a second band.
2. The sequential-keys finding (veterans gate wave 4 before
   standing matters) belongs in the next wave-5 prereg's design:
   a standing-only lever cannot open wave 5 alone.
3. The lowdef screen's seat-rate lesson: a future substrate
   screen must pre-register a seat-rate floor alongside the
   no-defiance minimum, or a thin-seating substrate can never
   qualify no matter what its defiance shows.
4. Balanced panel (§15): no panel artifact — balance-panel.js has
   no corpus-ingest mode for either corpus (prior precedent);
   none faked.

## Infrastructure

- Safe-commit index clobber hit both workers' commits (both arms,
  both commits) — repaired via HEAD-blob cacheinfo each time,
  commits verified correct (status empty + diff HEAD empty + hash
  match after repair). No EPERM flap blocked this run's writes.
- Coordinator landing recovery (loud, no loss): the first coordinator
  commit attempt ran the MAIN-tree safe-commit.sh path from inside
  the coord worktree, and that script cds to its own parent — so it
  landed an EMPTY commit (fb0b959c7) directly on master, containing
  no evidence file. Verified before touching anything: the commit
  was the tip, unpushed, and empty; sibling 967fdd4a9 sat directly
  below it. Removed it in the same command as the check via
  reset --soft HEAD~1 (reflog-verified, sibling intact), then
  committed the evidence with the coord worktree's OWN
  scripts/safe-commit.sh and merged ff-only. Lesson carried: never
  run a main-tree script path from a worktree — the script's cd
  decides the repo, not your cwd.
- Lowdef band B first-attempt sweep died mid-armed-leg (exec
  session lost after 76301-armed, no node process left, no error
  captured). Band B was re-swept in full from the same seeds and
  code; it completed cleanly and its corpus is a single coherent
  run — partial first-attempt rows overwritten, not blended.
- W5twokey first sweep crashed on a log-line scope bug
  (deedEnd referenced in sweepMode instead of row.gate.deedEnd)
  after writing only s74311; logging one-liner fixed, verdict code
  untouched, full sweep re-run from scratch.
- check.js --quick NOT re-run: zero src/js on either arm, arm
  proofs are the attributable verification (1016Z/1121Z/1215Z/
  1315Z/1631Z/1715Z precedent). No [needs-eyes] (measurement only).
- Sibling trees untouched; no tree released or removed that this
  run did not register. Final sweep after coordinator landing
  below.

## Next blanks, in order

1. The full seat itself — wave 5 is now a confirmed two-key lock,
   but the lock is confirmed at threshold (6/8) and the keys are
   sequential; the next prereg should carry the sequential design
   and a confirm-band rule.
2. Rule (3) live test needs a trial-completing player substrate,
   not another courtship — and a seat-rate floor in the screen
   prereg (lowdef metric review).
3. TABLE.md stage >= 3 vs code stage >= 2 — Steve call, unchanged.
4. 74305 final-day standing jump, stale unlockedWave comment,
   rank-without-offer decoupling — all in sim-findings.md, not
   chased.

scale-onramp stays converging (NOT converged): the two-key lock is
confirmed and deed bars are instrumented, but the full seat is
still unreached, wave-4 kills still do not survive into living
veterans, and rule (3) is still unit-proven only. food-economy
stays converging (untouched; sibling loop B). Claim deleted; lock
deleted.
