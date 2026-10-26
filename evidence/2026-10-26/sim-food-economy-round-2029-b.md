# Loop B round 2029Z — food-economy: meal-draw re-prereg + Lamb's Quarters persistence

Run: fleshout-loop-b-20261026T2029Z. Axis: food-economy (second
non-converged axis). Loop A live on scale-onramp for the whole run
(20261026T2016Z claim, w4opp + w4dmg, NOT touched); A landed w4dmg
(78b0f38ef) mid-run, so both B branches rebased once onto the new
master, re-proved, then merged ff-only. Both arms measurement only,
zero src/js, no default flips. Merged locally, pending ship.

## Arm 1 — sim-mealdraw-reprereg-b: NO-GO (pilot, per prereg)

Branch tip after rebase: f296c50ea (prereg commits 17c914aca +
68979df9f). Proof re-run post-rebase AND on merged master:
15 PASS, 2 FAIL — the failures ARE the verdict, reproduced exactly.

What was done, prereg-first, control-first: prereg pinned to base
f89a9b32d (game-tree pin, corrected pre-sweep: committing the prereg
itself advances HEAD, so the pin is on the game tree, not literal
HEAD; pin checks passed at all three points). Stockdoor-only control
sweep on the pinned tree first (8/8 seeds), then the mealdraw judged
sweep on the same tree (8/8). Judged vs control, never vs stale
old numbers.

Legs: leg 0 base pin PASS; leg 1 control gate PASS (8/8, no
truncation); leg 2 determinism PASS — judged matches control on
every game-output field, 8/8 seeds, 0 mismatches (instrument neutral
on this base; this time the base did NOT move); leg 3 surplus
windows FAIL — 81 checkable windows on seed 9750, 67 closed,
14 open (days 28, 30–38, 40, 43, 47, 54; residuals −400 to −2200,
draws 0), while windows 81/82/83 close exactly (3600/3800/4400,
surviving = gross), reproducing the prior arm's post-hoc finding;
leg 4 residual-pair disposition FAIL on the strict reading — the
old pair (9750,83)/(9750,84) is ABSENT on this base (a finding, not
a failure), but the control's one other residual (9754,80) has
covering window 79 open (−2800); leg 5 cross-checks PASS, stricter
than the prior arm (4631 villager-home meal calls, 0 mismatches;
17 drawSpoiled calls, 0 diff-sum mismatches — the desperation path's
accounting is exercised for the first time on this band and balances
exactly; ctxKcalMatch 0/1729; resid join 0). Confirm (seeds
9780–9795) NOT SPENT — the pilot gate forbids it.

Key finding — the missing term is the morning smoke. Window 28
proves it exactly: night-28 surplus 2000 kcal, 0 draws, only 600
left — gap exactly 1400. Day 29's first cook is WORKED ("3 batches
preserved, ~1737 kcal"), and the snapshot gains exactly 1737 kcal of
dried stock, including 7×160 = 1120 = 1400 × 0.80 rough yield. The
morning cook smokes the surplus BEFORE the first-cook snapshot.
Mornings with racksFull/plain cooks have no smoke term, which is why
windows 81–83 close and why open windows cluster early (days 28–54)
and vanish after day 54. Generalized scan corroborates: 586
checkable windows band-wide, 175 open, same signature.

Control view (context, not a leg): 383 bound / 338 attributed /
45 unattributed, attr-flag mismatches 0, lag 1x40/2x4/3x1, median
lag 1.0, coverage 44/45, sole residual (9754,80). The control corpus
matches the committed mealdraw-b corpus on every game-output field,
8/8 seeds.

Wall (judged corpus, competent-only, no seat instruments):
national/table/wins 0/8, wave 4–5 0/8, wave 3 on 3 seeds, median
survival 100d (9751 lost day 48), 31 deaths (arena 13, starvation
5, ambush 3, sickness 3, monster 2, wound 2, dehydration 1, contest
1, lockjaw 1), rank village on all 8. Sense samples (nights 28 and
82, full sequences read) cohere: villagers eat from their own work,
bank differing surpluses, and Sierra's smoke narration matches the
record to the kcal. No robotic behavior flagged.

No balanced-panel compare .md attached: per the prereg's §15
reasoning, no panel comparison exists for a no-lever, no-game-change
arm — the leg-2 exact determinism comparison is this arm's
before/after comparison.

Evidence: evidence/2026-10-26/sim-mealdraw-reprereg-b.md +
sim-mealdraw-reprereg-b-prereg.md; corpora
sim-mealdraw-reprereg-b-control-corpus/ (8 files) and
sim-mealdraw-reprereg-b-corpus/ (8 files).

## Arm 2 — sim-lqpersist-b: GO (post-arrival measure) + mechanism UNDISTINGUISHED

Branch tip after rebase: 84a54072a. Proof GREEN post-rebase AND on
merged master (reproduction, rebuild, independent verdict/mechanism
recomputation agreeing with the analyzer, seed-9760 determinism
except `ms`, 0 src/js and 0 sibling capture files modified).

Judged only against the prereg (written before any new sweep):
leg 1 reproduction exact (761 resolutions / 750 engaged / 11 NPC
sows / 3,167 keeper turns / 32 beds / 235 player sows — the
gardenbar band, reproduced); leg 2 rebuild + flags 100.0% / 100.0%
(761/761); leg 3 post-arrival persistence GO — Lamb's Quarters on
seed 9762 present on 79/80 = 98.8% of post-arrival engaged
resolutions (first appearance day 21; the single absence is day 23)
vs the 80% bar. The band-start measure reproduces 1930Z exactly at
79/99 = 79.8% — reported for comparability, not judged. The 1930Z
NO-GO stands under its own bar; this GO is the post-arrival verdict
its metric review proposed.

Mechanism: UNDISTINGUISHED (no bar passes, so none named).
Spoil timing FAIL: LQ median raw horizon −1 vs pooled comparator
median 2 (bar needed ≥ 4) — but the bar measures raw spoilDay while
the game eats by a bonus-aware boundary (spoilDay + spoilBonusDays),
so spoil timing is unmeasured by this bar, not refuted. Meal-draw
order FAIL, directionally refuted: LQ slab share 0.000 (pieces are
~50 kcal, not slabs), and meals do NOT skip LQ — draw share 0.459
exceeds stock share 0.365. LQ is the most-eaten channel and still
accumulates because deposits (396,750 kcal) dwarf draws (123,250
kcal). Deposit frequency FAIL narrowly: LQ coverage 0.877, but
Cattail covers 0.463 (bar required both comparators < 0.40).
Sharpest secondary contrast: Cattail's net inflow-minus-draw
(+399,600) EXCEEDS LQ's (+273,500), yet Cattail's stock collapses —
so the unmeasured sink is per-channel spoil-removal volume
(sweep-path capture is the next arm's question). Spoiled share is
0.000 for all three channels: spoiled stock never lingers long
enough to snapshot.

Confirm band DIAG: pilot GO triggered 12 seeds (9768–9779); pilot
named no mechanism, so per prereg the confirm is DIAG-only. Only 1
qualifying channel: Burdock on 9770 (first appearance day 34,
post-arrival presence 86.6%, all three bars false). Burdock — the
pilot's "pulse-collapse" comparator — itself passes the 80%
post-arrival bar on a fresh seed, so the measure is a general
persistence instrument, not a 9762 detector. Confirm wall:
national/table/wins 0/12, wave 4–5 0/12, median survival 100d,
48 deaths.

Pilot wall: national/table/wins 0/8, wave 4–5 0/8, wave reach
9760:3, 9761:2, 9762:2, 9763:2, 9764:2, 9765:3, 9766:3, 9767:3;
median survival 100d; 18 deaths, none starvation.

Sense read: day 20, first 6,300 kcal of LQ arrives and 1,650 is
eaten the same day; day 22 nearly winks out (1,450 standing); from
day 24 the ratchet runs (day 41: 10,300 in, 1,150 eaten, 42,950
standing). "The harvest can wait" reads true on 9762 while raids
trample plots on days 39/44.

Evidence: evidence/2026-10-26/sim-lqpersist-b.md +
sim-lqpersist-b-prereg.md; corpora sim-lqpersist-b-corpus/
(8 pilot JSONs) and sim-lqpersist-b-corpus-confirm/ (12 JSONs).

## Village assessment (plain words)

Two pantry bookkeeping questions moved this run. First, the nightly
meal's leftover pile is now reconciled except for one honest gap:
the morning cook smokes part of last night's surplus before the
first pantry count of the day, so the books only balance once that
smoking is counted as a term — the next count must write it down
explicitly instead of discovering it again. Second, Lamb's Quarters
does not stay on the shelves because it is ignored or because it
arrives most often: it is the most-eaten food in the pantry and it
still piles up, because what comes in dwarfs what gets eaten, and
whatever clears the collapsing foods (Cattail takes in even more
yet ends empty) is a removal the snapshots never catch. The village
itself looks the same as the 1930Z picture: competent, fed,
no table, no wins — these are bookkeeping instruments, not
game changes, and the scale wall is untouched by this axis.

## Metric review

- Mealdraw: the two-term window equation (writes − draws) is
  misspecified where a worked morning cook runs. Next prereg needs a
  three-term equation (writes − draws − evidenced smoke, cross-checked
  against the worked line). Do NOT re-score this NO-GO.
- Lqpersist: the spoil-timing bar must be re-registered on
  bonus-aware horizons (spoilDay + spoilBonusDays) with an
  absolute-difference bar before spoil timing is judged again. The
  post-arrival measure itself generalizes (Burdock passes it on a
  fresh seed) and should be carried as a persistence instrument,
  not a 9762 detector.
- Both arms' preregs were honored as written; no mid-run re-scoring.

## Telemetry deviation check

Both pilot corpora vs scale-wall baseline: 3 LOUD lines each
(national 12->0, table 16->0, wins 16->0) — the known
SEATDRIVE=0 regime artifact class (competent-only, pre-seat
substrate, no seat instruments; actuals 0/8 by design). Baseline
NOT rolled, no investigation item.

## Infrastructure

- Safe-commit index clobber hit both worker commits (staged-deletion
  variant) and all three mealdraw worker commits — repaired via
  HEAD-blob cacheinfo each time, commits verified correct, worktrees
  clean at release. No clobber on the coordinator commit (verified
  below).
- Mealdraw worker's first control attempt wrote seeds 9750–9753,
  then its background session vanished with no crash evidence; the
  logged re-run completed 8/8 deterministically (per-seed lines
  identical for re-done seeds).
- No EPERM flap blocked this run. Worktree registration was slow
  (~9 min for both trees), not failed.
- check.js --quick NOT re-run (zero src/js, zero green-list files,
  sibling loop A live); attributable evidence is the arm proofs on
  merged master.
- Loop A still live at closeout (2016Z lock + claim present, w4opp
  tree active) — NOT touched. Other lanes' new trees
  (sim-eggdriver-a, sim-eggomen-a) appeared mid-run — NOT touched.
