# sim-food-economy-round-2130-b — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261026T2130Z. Loop A live on scale-onramp for the
whole run (2016Z claim, w4opp + w4dmg, later meetrule + volley trees) — NOT
touched. B worked food-economy (converging), taking the 2029Z run's next
blanks (1) and (2), in order. Both arms measurement only, zero src/js, no
default flips. Merged locally, pending ship. No push, no bump, no live check.

## Arm 1 — sim-smoke-eq-b: GO (pilot + confirm)

Takes 2029Z blank (1): meal-draw re-prereg with the three-term smoke
equation (writes − draws − evidenced smoke). The 2029 NO-GO is NOT re-scored;
this verdict judges only whether the three-term equation closes the surplus
windows. It does, everywhere.

- Pin: 2029 pin f89a9b32d moved by exactly one unloaded diagnostic policy
  (scripts/policies/w4dmg-diag.js); new pin is a02b0c8f2's game tree, master
  tip adding one more unloaded policy (w4opp-diag.js). No loaded file
  differs; the fresh control reproduced the 2029 control exactly.
- Pilot (seeds 9750–9757, competent-nofeast, 100d): legs 0–5 all pass on the
  worker's base. Leg 2 determinism 0 mismatches, 8/8 seeds. Leg 3 focus seed
  9750: 81 checkable windows, 81 closed, residual3 exactly 0 on every one;
  the 14 formerly-open windows close with smokeFresh exactly equal to their
  old two-term gaps (28: 1400, 30: 1400, 31: 1000, 32: 800, 33: 400, 34: 1400,
  35: 600, 36: 2000, 37: 600, 38: 2200, 40: 1800, 43: 1800, 47: 1800, 54: 1200).
  Leg 4: sole pilot control residual (9754,80) covered by window 79 (gross
  3800, surviving 1000, draws 0, smokeFresh 2800 → residual3 0). Leg 5:
  4631/0 meal-call, 17/0 drawSpoiled, worked day-29 line exact (surplus fresh
  1400, surplus preserved 1120, kept 1737, preserved 1737).
- Band-wide pilot: 586 checkable / 0 open three-term (175 were open two-term).
- Confirm (seeds 9780–9795, spent only because the pilot GOed): neutrality
  16/16, cross-checks 10134/0 meal-call and 12/0 drawSpoiled, windows 1207
  checkable / 0 open. Confirm control has zero pre-fourth-door residuals
  (655 bound / 570 attributed / 85 unattributed, 85/85 explained).
- Analyzer fix mid-run (instrument fix, not a threshold change): the first
  draft over-summed surplus preserved (1737) by catching same-morning
  non-surplus smokes; fixed with the yield-linked kcalEach-160 filter
  (200 × 0.80, confirmed by the 15-day stamp) → exactly 1120. Prereg's gated
  numbers never moved.
- Sense (quoted in arm evidence): "Sierra cooked for the haven — meals
  stretched. Sierra worked the smoke racks too — 3 batches preserved (~1737
  kcal, keeps a couple of weeks)." The record shows exactly 3 converted
  stacks (500→400, 271→217, 1400→1120). Nothing robotic flagged.
- Wall (pilot judged): national/table/wins 0/8; wave 4/5 0/8; wave 3 on 3,
  wave 2 on 5; median survival 100d (9751 lost day 48); 31 deaths (arena 13,
  starvation 5, ambush 3, sickness 3, monster 2, wound 2, dehydration 1,
  contest 1, lockjaw 1); rank village on all 8.
- Wall (confirm judged): national/table/wins 0/16; wave 4/5 0/16; wave 3 on 8,
  wave 2 on 8; median survival 100d (all 16 survived); 69 deaths (arena 34,
  contest 6, wound 6, monster 5, sickness 5, ambush 5, starvation 1).
- Reachability: waves 1–3, village rank, haven tier 3, full preserve ladder
  reachable. Waves 4–5, regional→national, the table, the win flag, Arcs
  II–IV not reached on either band — the scale wall stands; this arm closes
  a measurement blank, it does not move wall numbers.
- §15: no panel compare, deliberately — no lever, no game change;
  determinism (instrument-off vs instrument-on, exact per-field equality)
  is the before/after comparison, as stated in the prereg and arm evidence.

Commits: d332b485c (prereg + instrument) + 6b9d496ce (evidence + corpora),
rebased onto 12b67ebb0. Evidence: evidence/2026-10-26/sim-smoke-eq-b.md +
prereg + 4 corpora (8 + 8 + 16 + 16 files).

## Arm 2 — sim-spoilvol-b: DIAG-NO-GO (Cattail absent on fresh band)

Takes 2029Z blank (2): per-channel spoil-removal volume via sweep-path
capture, bonus-aware horizons (2029 metric review honored: raw spoilDay is
unmeasured, not refuted). The 1930Z NO-GO and the 2029 post-arrival GO are
NOT re-judged; this verdict is only whether spoil-removal volume explains
Cattail's collapse.

- Leg 1 neutrality / det-gate: PASS — seed 9820 SPOILVOL=1 vs 0 byte-identical
  on inflow/mealdraw/deaths/wall (spoilvol fields + ms excluded); det-gate
  reproduces corpus-9820 counts exactly (1249 draws / 255 inflows / 4 deaths).
- Leg 2 sweep integrity: PASS — across all 799 pilot sweeps, removed-not-spoiled
  = 0 kcal and kept-spoiled = 0 kcal. The pre-sweep code audit's conclusion
  (sweepSpoiled's pantry branch is the ONLY pantry spoil path; pantryDraw
  skips spoiled) is now proven per sweep, not assumed.
- Leg 3 appearance: FAIL → DIAG-NO-GO — Lamb's Quarters grows on 2/8 seeds,
  Cattail on 0/8 seeds (verified in all record types: inflows, sweep removals,
  draws, snapshots). A channel that never appears is a finding, not a zero.
- Leg 4 sink bar: UNMEASURED — no Cattail spoil volume exists to compare
  (ratio 0.00 is meaningless, share n/a). No substitution of Burdock, a
  single seed, or raw spoilDay.
- No confirm band spent (prereg forbids it on DIAG-NO-GO). Seeds 9828–9839
  remain fresh. The reserved mealdraw band 9780–9795 was not touched by this
  arm (it was spent by smoke-eq's confirm instead, as recorded above).
- What WAS measured (the sink is real and enormous): pooled LQ (2 seeds) —
  inflow 408,450, draws 65,250, sweep 266,750 (78% of inflow-minus-draws).
  Burdock (6 seeds) — inflow 399,510, draws 141,570, sweep 100,890. Seed 9826
  is the collapse in miniature: LQ inflow 359,700, eaten 35,700, rotted
  262,900, ending at 3,600 fresh (+25,800 dried). On 9825 the same channel
  barely rots (3,850 of 48,750) — the sink is inflow-rate vs rot-rate, not a
  channel property.
- Bonus-aware horizons honored: spoilBonusDays 0 on 473 sweeps, 2 on 124, 6 on
  202, flipping on once mid-run per seed (9820: 0×66 then 6×34, never back).
  Bonus-saved standing piles reach 71,868 kcal on a single sweep (reported as
  a per-sweep standing pile, never summed as volume).
- (Dried)-family ledger rule: every (dried) variant holds real stock with ZERO
  inflow-door records — the transformation path is uninstrumented. Family
  ledgers (base + dried) close well: 9826 LQ family to within 410 kcal on
  359,700 (0.1%). Generic "Foraged food" does not close because it holds
  starting pantry stock (direct push, bypasses doors).
- Sense (quoted in arm evidence), 9826 day 21: "The village threw out spoiled
  stores: Foraged food. Jorge mutters: 'Should've smoked that. Fresh stuff
  keeps a day or two on the shelf — the smoke rack is right there.'" 77 pantry
  spoil lines on 9826; the teaching fires once, then repeats condense.
  Judgment: the voice names the loss and the fix, but the village never acts
  on it while 262,900 kcal rots — voice without action is the design
  observation, not a measurement error.
- Wall (competent-nofeast, seeds 9820–9827, 100d): national/table/wins 0/8;
  wave 4/5 0/8; wave reach 2,2,3,2,3,3,2,2; median survival 100d (all survived
  to day 100); 38 deaths (sickness 17 — top cause, unlike lqpersist's
  arena/monster shape — monster 5, ambush 4, wound 4, arena 3, contest 2,
  sunback 1, alien 1, dehydration 1); rank village on all 8.
- §15: no panel compare, same reasoning as smoke-eq (no lever, no game
  change; determinism is the comparison).

Commits: 130cbf19d (prereg + instrument) + 12b67ebb0 (pilot evidence +
analyzer + proof + corpus), after the squash described below. Evidence:
evidence/2026-10-26/sim-spoilvol-b.md + prereg + 8-file corpus.

## Wall (this run's judged corpora, 48 configs)

National 0/48, table 0/48, wins 0/48 — all three corpora are competent-nofeast
pre-seat substrates (SEATDRIVE=0, no seat instruments), so these zeros are
the substrate, not a regression. Wave 5 0/48, wave 4 0/48, median survival
100d on all three corpora. The scale wall is untouched by this axis, as
expected: both arms close measurement blanks inside the food economy.

## Infrastructure (read before the next landing)

- EPERM write flap hit both workers (blocked commits and shell writes;
  smoke-eq reports even `echo` redirection and `git init` in /tmp failing at
  the peak). Both workers waited it out; no ref surgery anywhere.
- SPOILVOL FLAP ARTIFACT, CLEANED WITH CONTENT PRESERVED: the worker's
  EPERM retry loop landed the prereg commit 83 times as empty duplicates
  (85 commits on the branch, only 2 non-empty). The coordinator squashed the
  branch to the worker's intended 2 commits and verified the resulting tree
  hash byte-identical to the worker's tip (da6b6588…) and the file list
  identical (14 files) before rebasing and merging. The worker's report of
  "2 commits" described content, not the flap's duplicate count.
- PREMATURE-RELEASE INCIDENT, REPAIRED: the first spoilvol merge attempt
  failed fast-forward (master had moved under the proof run), but a piped
  `| tail` masked the failure inside an `&&` chain, so the release script
  ran early and marked the tree done-merged before any merge. The branch was
  never lost (rebased commits intact); the coordinator re-registered the
  tree (status active again), rebased onto the new tip, re-proved green,
  and merged for real (exit 0, verified ancestor). LESSON, NOW A RULE: never
  pipe a merge into `tail` inside an `&&` chain — check the merge exit code
  directly, as a standalone command.
- SMOKE-EQ LEG-0 POST-REBASE DISPOSITION: after rebasing onto 12b67ebb0, the
  worker proof exits 1 on leg 0 only (ancestor=YES, diffLines=293,
  dirtyPaths=0). Verified cause: the rebase added 95 files of sibling
  measurement/evidence work (loop A 2016 round, journey-social r58,
  journey-establishment r45, spoilvol) — zero src/ changes, zero index.html
  diff lines, zero smoke-eq arm-file changes, and the only policy-path
  change is the new unloaded diagnostic w4opp-diag.js. Legs 1–5 pass on the
  rebased tree and the worker's proof was green on its own base. This is the
  established evidence-only-rebase precedent (2115Z: det-gate + 0-line
  arm-file diff); the GO verdict stands and the leg-0 post-rebase failure is
  a rebase artifact, not a trajectory change. It is recorded here, not hidden
  in a re-run.
- Safe-commit index clobber hit both workers' commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo each time, commits verified
  correct. The smoke-eq release script removed the worktree itself; the
  branch was absent at verification (content on master at 6b9d496ce), so no
  separate branch -d was needed for that arm.
- check.js --quick NOT re-run: zero src/js, zero green-list files on either
  arm; the standing 280/7 pre-existing profile was recorded by sibling runs
  this week. Attributable evidence is the arm proofs on merged master
  (spoilvol proof green post-rebase; smoke-eq legs 1–5 pass post-rebase with
  the leg-0 disposition above).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '<corpus-glob>' --metrics national,table,wins,exiled` on all three
corpora (spoilvol pilot n=8, smoke-eq pilot n=8, smoke-eq confirm n=16):
3 LOUD lines each (national 12→0, table 16→0, wins 16→0) — the known
SEATDRIVE=0 regime artifact class, identical to every prior food-economy
round. Baseline NOT rolled, no investigation item.

## Metric review

- Smoke-eq: the three-term equation is now the proven window equation; any
  future window prereg must include evidenced smoke from the start, not as a
  correction. The 2029 NO-GO stands under its own (two-term) prereg and is
  superseded, not overturned, by this GO.
- Spoilvol: the sink bar was correctly left unmeasured on a Cattail-absent
  band. The next arm must NOT spend another fresh band hoping Cattail grows;
  it must screen bands for Cattail growth first, or claim paired reuse of
  9760–9767 (where Cattail reached 523,680 kcal in) with stated intent in its
  prereg. A ratio against zero would have been a metric error, and was
  refused.
- The (dried) transformation path needs instrumentation before any family
  ledger is judged closed; family ledgers close to 0.1% but the door record
  does not cover the transformation itself.

## Next blanks, in order

1. A Cattail-growing band for the spoilvol sink comparison (screen bands for
   Cattail growth, or paired reuse of 9760–9767 with stated intent) — the
   2029 blank (2) is still open, now with its substrate requirement named.
2. (Dried) transformation-path instrumentation (spoilvol finding).
3. Garden-attributed deposits with zero garden harvest (deposit-path trace,
   carried).
4. Starting-stock draw order (carried).
5. Spoilage-boundary split, meal vs cook (carried).
6. ~5,900 kcal non-draw removal day-82/83 (carried).
7. Presence-aware share bar + next diversity arm; plain-silenced
   indistinguishability; rule-R voice taxonomy rebuild; scholar-donation
   visibility (carried).

Backlog: the 2029 blank (1) is closed by smoke-eq GO (residual-pair judgment
now answered — backlog line on the meal-draw record resolves to fixed); the
2029 blank (2) stays open with its new substrate requirement.
