# sim-food-economy-round-1330-b — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1330Z.
Axis food-economy (converging, second non-converged axis). Loop A live
at run start on scale-onramp (1315Z claim: arrivalsurge-adopt,
defiantdoor, scalegate — NOT touched) -> B worked food-economy,
taking the 1230Z next blanks (1) and (2) in order. Both arms
DIAG/measurement only, zero src/js.

## Arm 1 — sim-raidday100-judge-b: NO-GO under the focal formulation,
adjustment exercised in substance

- Prereg 1722f68e9 (rebased a78b5fd36) + evidence 0621eafae, both on
  master. Proof scripts/test-raidday100-judge-b.js re-run post-rebase:
  38 PASS, exactly the same 2 section-3d failures as pre-rebase
  (the NO-GO signature, not a regression).
- Clause (a) re-verified on the arm's own post-prereg judged sweep of
  seed 20118: daysAlive 100, survived, lastSnapDay 100, demand dated
  99 (Andre of Thornfield), take dated 100 (Canned soup 4u x 250 =
  1,000 kcal via villageAgencyDaily). Judged corpus matches the
  day99demand screen corpus on every field except the raid record's
  stackTop path (worktree path + capture line number) and `ms`.
- (b) FAIL: the day-100 raid touches ZERO focal rows — the take is
  Canned soup only, so raid100 = 1,000 on the Canned soup row alone
  and 0 on every focal row. Counted focal rows on 20118: Muscadine
  Grapes and Foraged food only; Lamb's Quarters, Burdock, Purslane
  have no counted row at all.
- (c) VACUOUS on focal rows (not a pass); (d) VACUOUS on focal rows,
  NON-VACUOUS on the taken-item row: Canned soup differs by exactly
  1,000 = raid100 (dried 0 = raid100D) — off by exactly the raid
  amount without the adjustment, closed exactly with it.
- (e) PASS: named pooled 0/15,660 = 0.000%, generic pooled -191 /
  382,626 = 0.050%, dried pooled 0/132,518 = 0.00% (all under the
  raiddor bars; passes without the adjustment moving anything on
  focal rows, stated plainly in the arm evidence).
- (f) FAIL: proof NOT green, exactly the 2 section-3d failures above;
  every other check passes (corpus validity, det-gate,
  independent recomputation of all nine pooled figures, raid
  integrity, raid-door disjointness, hygiene).
- Verdict: NO-GO under the prereg's vocabulary. This is NOT a verdict
  that the adjustment is broken or unexercised in substance — the
  distinction is the finding. Nothing here re-scores (b) to count
  the Canned soup row.
- Full evidence: evidence/2026-10-27/sim-raidday100-judge-b.md +
  prereg, corpus dir sim-raidday100-judge-b-corpus/ (seed 20118).

## Arm 2 — sim-9954perstack-b: GO, the 9954 generic-remainder row is CLOSED

- Prereg 07e0eb21e (rebased a8911d646) + evidence de1b69fd3
  (rebased b23db549c), both on master. Proof
  scripts/test-9954perstack-b.js re-run post-rebase: 117/117 PASS,
  exit 0 — the first exit-0 proof in this row's lineage.
- Fidelity gate PASS: faithful 9954-only replay reproduces the
  committed raidcallers corpus on every shared field (except `ms`
  and the new perstack fields; trace-only stack fields compared
  against the 9954trace replay where they pass, with the
  correction disclosed; stackTop truncation-window normalization
  passes on all 16 raid records).
- Reproduction PASS: NEW residual +5,719 (fresh, dried 0); bridge
  stock100 +3,400 − meal100 −5,419 = −2,019; analyzer boundary
  residual +3,700; correct-alignment residual +3,800.
- The walk (102 snapshots, 101 intervals, iteration-indexed, not
  per-day): running D-total is 0 for intervals 1–34, +3,800 at
  interval 35, and 3,800 flat through interval 101 (post-run
  interval's own D-total 0). Exactly ONE nonzero interval.
- Mechanism (named, exact identity): a SINGLE direct record, path
  green_whisper.cultivate, seq 124, day 36, villager player —
  the stockdoors snapshot-diff wrapper around Game.useAbility.
  Its items span two stack keys: (Foraged food, spoilDay 34,
  200 kcal) 12u/2,400 + (Foraged food, spoilDay 36, 200 kcal)
  7u/1,400 = 3,800 generic (record totalKcal 3,820 includes one
  Fish catch unit, 20 kcal, a different family's item, not
  counted). Excluding the cultivate record makes the
  predictions exact per key; remainder 0. Analyzer figure:
  3,800 − 100 (the post-snapshot day-100 inflow, re-verified)
  = 3,700. Both figures closed, never conflated.
- Why the cultivate record is the phantom count (direction
  argument, stated as evidence not walk proof): the record's
  items are EXACTLY the interval's meal-draw items (player
  pantryDraw seq 466 + other pantryDraw seq 474, key-for-key
  and unit-for-unit, sum 3,820). One physical removal was
  counted twice — once as meal draws (pantryDraw's own
  returned draw lists, which really removed the units), once
  as the useAbility diff. Cultivate costs 200 kcal per bed
  from the scholar's kcal, and 3,820 is not a multiple of 200;
  no door can replenish spoilDay-34/36 stacks on day 35/36
  (interval inflows/stockdoor create spoilDay 37/38/41 only;
  transforms 0; pantry sweeps 0).
- Disclosed caveats (not hidden): the walk script's own
  goCandidate field uses a narrower single-key + inflow-match
  definition and is null — the test's prereg-faithful
  mechanism check supersedes it for the verdict, and the walk
  series itself is what both use. The walk alone proves a
  duplication; it does not by itself prove which count is
  phantom — if the follow-up nesting proof reversed the
  direction, the row would still be closed by the same
  duplication with remainder 0, only the fix target would
  change. A third count cannot exist (all other intervals 0).
- Instrument lesson, new in this arm: the stockdoors direct
  wrapper's header claims disjointness from mealdraw ("a kcal
  is never recorded by both instruments") because none of its
  wrapped methods call pantryDraw. That claim fails for
  useAbility: whatever pantryDraw calls execute inside (or
  across) a useAbility span are recorded twice. Any future
  ledger summing directRecords + mealDrawRecords must
  de-duplicate ability-span draws, or it re-creates this
  exact +3,800-class residual.
- Sense note: say lines around scholar days 34–36 name no
  cultivate or double-count (smoke-rack + treeline recorders
  only) — a recorder-scope gap, recorded explicitly; the
  mechanism is a ledger phenomenon, invisible to speech.
- Full evidence: evidence/2026-10-27/sim-9954perstack-b.md +
  prereg, replay dir sim-9954perstack-b-replay/.

## Wall numbers (this run's judged corpora only, honestly small)

- Judge seed 20118 (single seed, competent-nofeast, pre-seat
  regime): survived 100d, national rank, wave 2, table 0,
  wins 0 (seat legs off; SEATDRIVE=0).
- Perstack: reused corpus only, no new band — raidcallers
  numbers stand (pilot national-or-better 6/8, confirm 9/12,
  table 0/20, wins 0/20). Seed 9954 itself: wave 4, national
  rank, survived 100 days.
- No wave-5 sighting in this run's corpora; no new win-seeking
  band was run (both arms are ledger measurements).

## Telemetry deviation check

On the judge corpus (n=1): 3 LOUD lines (national 12→0,
table 16→0, wins 16→0) — the KNOWN regime-artifact class
(WINSEAT baseline vs a single-seed competent-nofeast judged
corpus; per-seed rows carry nationalEver/entered/won, not
top-level national/wins paths; seed 20118 itself is national
rank). No exiled LOUD line. Baseline NOT rolled.

## Metric review (MEASUREMENT.md §14)

- The raidday100 focal formulation is now the binding
  constraint on the exercise claim, not the adjustment: a
  day-100 take on a non-focal item exercises the adjustment
  without touching any focal row, so clause (b) fails while
  the mechanism works. The next prereg for this leg must
  generalize (b) to the taken-item row (focal-or-taken) BEFORE
  judging — not re-score this corpus against it.
- The 9954 GO clause's "stack key" (singular) wording vs a
  one-record-two-key mechanism: the verdict reads it as exact
  stack identity (keys listed), supported by the arithmetic;
  future preregs should write "exact stack identity (key or
  keys listed)".
- Balanced panel (§15): neither arm changes a lever or game
  code, so there is no before/after to panel — stated in
  both arm evidences, not forced. Fidelity gates are the
  instrument before/after.

## Village assessment (plain words)

One village's books now balance to the unit, and another
village proved a piece of the game's own accounting actually
works. The 9954 village stood 100 days at national rank while
its pantry ledger carried 3,800 kcal nobody could find — not
a missing feast, not a raid, not a last-day timing trick.
The walk found it in a single stretch of play, days 34 to
36: the village ate its meals, and the garden magic that
coaxed the beds forward got counted as if it had eaten the
same meals a second time. One removal, two tallies. Take the
second tally away and every stack lands exactly where the
records say it should, first day to day 100, nothing left
over. The gap was never in the village — it was in the
instruments counting it. On the other arm, the day-100 raid
take on seed 20118 did exactly what the post-snapshot
adjustment was built for — the books are off by precisely
the 1,000 kcal taken after the last snapshot, and exact once
the adjustment is applied — but the take was canned soup,
not one of the four watched foods, so the old test's
wording cannot see it. The mechanism works; the test's
vocabulary is what needs widening.

## Infrastructure

- Loop A landed mid-run (scalegate 234d3a825 + defiantdoor
  64554bac6, both [needs-eyes], scale-onramp axis — NOT
  touched by this run). Both B branches rebased clean onto
  the new master (zero file overlap: A touched
  progression.js/table.js + perseed-defiantdoor/scalegate;
  B touched only raidday100-judge + 9954perstack
  scripts/evidence). Proofs re-run post-rebase (judge: same
  2-failure NO-GO signature; perstack: 117/117 green), then
  merged ff-only. Judge merge moved master, so the perstack
  merge correctly refused ff-only first — rebased again
  onto the new master, proof re-run, then merged.
- No EPERM flap blocked this run's writes. No safe-commit
  index clobber on this run's commits (coordinator commit
  verified via git show --stat at closeout).
- Worktree registration slow (~4–5 min/tree, sibling I/O
  contention, same as the 1215Z/1230Z runs).
- Sibling file note (NOT this run's, left alone): at
  closeout the main tree carries one untracked file,
  evidence/2026-10-27/sim-scale-onramp-round-1315.md —
  loop A's 1315Z coordinator evidence, still being written
  while A closes out (A claim + lock still live). Never
  staged, never committed, never reset by this run.
- check.js --quick NOT re-run: zero src/js, arm proofs are
  the attributable verification (1016Z/1121Z/1215Z/1230Z
  precedent). No push made, ship loop owns pushes.

## Next blanks, in order

1. Raidday100 GO generalization: a prereg with clause (b)
   as focal-or-taken (the taken-item row counts), then
   judge 20118 under it — do NOT re-score this run's
   corpus against the new wording without a fresh judged
   run.
2. Cultivate nesting proof: do the meal pantryDraw calls
   execute inside the useAbility span (direct record dated
   day 36, meal draws in the interval dated day 35)? Settles
   the fix target (which instrument to de-duplicate), not
   the closed row.
3. De-duplication rule for ledgers: any future ledger
   summing directRecords + mealDrawRecords must exclude
   ability-span draws (instrument lesson above).
4. The 0530Z carried blanks, still open: garden-attributed
   deposits with zero garden harvest; starting-stock draw
   order; spoilage-boundary split (meal vs cook); ~5,900
   kcal non-draw removal day-82/83.
5. A treeline give/overrun band (seeds where holds fail).

food-economy stays converging (NOT converged): the 9954
row is closed and the raid adjustment is exercised in
substance, but the focal GO formulation is unmet, the
cultivate fix target is unproven, and the carried blanks
stand. scale-onramp stays converging (untouched; sibling
loop A). Claim deleted; lock deleted.
Evidence: this file (coordinator) + sim-raidday100-judge-b.md
+ prereg + corpus + sim-9954perstack-b.md + prereg + replay.
Merged locally, pending ship.
