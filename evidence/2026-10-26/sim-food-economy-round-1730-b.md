# Loop B round 1730Z — food-economy: fresh-days scope + preservesched residuals

Run: fleshout-loop-b-20261026T1730Z. Axis: food-economy (second non-converged
axis). Loop A live on scale-onramp for the whole run (1715Z claim,
sim-r52split-a + sim-tablenat-a, NOT touched; A landed sim-tablenat-a
09c2297c3 mid-run and master moved under both B arms — both rebased clean
in their own worktrees, proofs green after every rebase, then merged).

Both arms measurement only, zero src/js, no default flips. Both bands are
the preservesched band reproduced: seeds 9750–9757, competent-nofeast,
100d, SEATDRIVE=0. Both arms' wall numbers are identical (same band):
national / table / wins 0/8, wave-4/5 unlocks 0/8, wave 3 on 4 seeds,
wave 2 on the rest, median survival 100d censored (9751 lost day 48,
9754 day 97), 43 deaths (arena 15, starvation 7). This is the
competent-nofeast measurement profile, not a regression — the scale wall
stands untouched by this axis.

## Arm 1 — sim-freshdays-b (37e201ab2, proof green post-rebase + on merged master): GO

Question (1630Z next blank 2, findings line 1136): first-bound-line
pantryFreshDays() runs 4.6–249.8 days on the 38 racks-bound days. What
does it count?

Pre-registered bar (evidence header): component-sum coverage >= 0.95 on
every reproduced high-value snapshot (reported freshDays >= 50) AND one
named dominant component. Result: coverage 1.000 on all 908 high-value
snapshots over 200 distinct days (max 314.5). GO.

Plain-words answer: the ~250-day figures are pantry-drain days, not
survival days. Seed 9753 day 74's quoted 249.8 days is 42,687 kcal over
a 171 kcal/day measured pantry-drain denominator — 2.4 days at the
roster's full need (5.1 days counting preserved stock). Decomposition:
by spoil class, dated stock is 99.8%; by item class, unstamped
stock-door items (no foodState, no foodKind, no edible flag) are 75.8%
of high-day counted kcal. Shelf-stable starting staples with spoilDay
366 (Rice, Canned soup, Dried beans) are 46.6%. Preserved stock is
correctly excluded (49,219 kcal excluded that day); immortal stock is
only 0.16%. No numeric correction to prior evidence is needed — the
figures reproduce exactly (9753 d74: 249.84 vs 249.8; d64: 221.69 vs
221.7; 9752 d90: 132.03 vs 132.0) — but the reading must change, and
the preservesched verdict is unaffected (the throttle reads the same
function).

Metric review: coverage is 1.000 by construction (the recorder replays
the function's loop), so the bar's real work was forcing the
decomposition to exist; the verdict's substance is the bucket shares
and the denominator analysis, not the 1.000. Future arms citing
fresh-days figures must say drain-days and name the denominator.

Sense: Courtney's day-74 "~250 days" line vs a 5-day pantry — the
village reads abundance while the pantry holds days, not months.
No robotic behavior flagged beyond the previously logged canned
fireside lines (out of arm, not re-chased).

## Arm 2 — sim-preservesched-resid-b (050258353, proof green post-rebase + on merged master): DIAG-NO-GO (bar honored)

Question (1630Z next blank 3): the 2 residual racks-bound days, seed
9750 days 83–84 after a 4-day inflow gap — granary-shifted clock vs
older stock ripening in?

Control first, passed: the new corpus re-derives the 1630Z verdict
exactly (neutrality 327/289/38, lag 1x32/2x4/3x1/4x1, coverage 36/38,
residuals exactly (9750,83) and (9750,84)) and reproduces the committed
inflow-b corpus exactly on all 8 seeds. Instrument legs clean: 0
resid-join misses, 0 recompute mismatches over 1,536 lines.

Pre-registered bar: one hypothesis explains BOTH residual days with
named per-stack evidence while the other is excluded. Result: the pair
separates into THREE suppliers, not one, so NEITHER hypothesis covers
both days — DIAG-NO-GO, not re-scored. Day 83's pile (2,000 kcal) is a
single meal-surplus stack (200-kcal x 10 "Foraged food", spoilDay 85,
no granary bonus) written by the nightly meal's stockSurplus path on
day 82 — NOT the day-79 arrival (that granary stock sat days 80–82
and was eaten night 82). Day 84's pile (3,567 kcal) is that same
surplus stack + granary-shifted day-80 stock (spoilDay 86, granaryDays
3) + ripened day-74 Winner's share (2 x 600 kcal, spoilDay 86). The
granary-shifted clock is confirmed real, and older-stock ripening
does occur on day 84 — but the bar required one hypothesis for both
days, and the meal-surplus fourth door is the day-83 answer neither
hypothesis named.

Next instrument (named, not built here): a stockSurplus fourth-door
record in the inflow capture. Any future inflow accounting without it
undercounts pantry arrivals on meal-surplus days. The candidate
footnote for the next run's pre-registration is in the arm evidence.

Village assessment (seed 9750): survived 100d at village rank, wave 3,
5 deaths (monster 2, ambush 1, arena 1, wound 1, no hunger deaths).
Sierra cooks unskilled (0.80x, "keeps a couple of weeks") with a
tier-3 granary — the preservation skill gap, not the granary, is this
village's smoking ceiling. Sense samples from Sierra's day 83/84 lines
quoted in the arm evidence; no robotic behavior flagged.

## Telemetry deviation check

Both corpora vs scale-wall baseline: 3 LOUD lines each (national
12->0, table 16->0, wins 16->0), all the known SEATDRIVE=0 regime
artifact class (competent-nofeast, no seat instruments) — baseline
NOT rolled, no investigation item.

## Infrastructure

- Safe-commit index clobber hit BOTH worker commits (staged-deletion
  pattern, worktree files byte-identical to HEAD) — repaired via
  HEAD-blob cacheinfo both times, commits verified correct, worktrees
  clean before release. No clobber on the coordinator commit; verify
  with git status after this commit.
- No EPERM flap blocked this run. Registration was slow (~3.5 min
  for two trees) but succeeded.
- check.js --quick NOT re-run: zero src/js, zero green-list files,
  sibling loop A live; attributable evidence is the arm proofs on
  merged master.
- Master moved once under the run (loop A tablenat 09c2297c3);
  both arms rebased once each, proofs green after every rebase.

## Tracker state after this run

food-economy stays converging (NOT converged): the fresh-days question
is closed (drain-days reading) and the preservesched residual pair is
split three ways, but no food-economy game-code fix has landed from
either arm, and the scale wall is untouched by this axis.
scale-onramp stays converging (untouched; sibling loop A).
Next blanks, in order: (1) stockSurplus fourth-door instrument record,
then a re-judgment of the residual pair with it; (2) throttle
drain-days vs need-days design question; (3) presence-aware share bar
+ next diversity arm; (4) plain-silenced indistinguishability;
(5) rule-R voice taxonomy rebuild; (6) scholar-donation visibility.
Claim deleted; lock deleted.

Evidence: this file + sim-freshdays-b.md + sim-preservesched-resid-b.md
(+ prereg) + 2 corpora. Merged locally, pending ship.
