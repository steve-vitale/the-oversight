# sim-fertrot-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-fertrot-b.
Worktree sim-fertrot-b, branch sim-fertrot-b. This is the 1725Z
next-blank (2), first item in evidence order after route-blockage
(killed at pilot 1930Z): the fertility-signal rotation follow-up
to sim-patchrot-b. Policy-side arm ONLY: a NEW policy file
scripts/policies/competent-fertrot-b.js, default OFF, ZERO src/js
changes, ZERO edits to scripts/policies/competent.js, ZERO
policy-default flips, plus one additive panel-registry line in
scripts/sweep-compare.js (routeblock / patchrot precedent; zero
behavior change to existing entries). Patchrot rotation is NOT
bundled, route gates are NOT bundled, multi-sweep is NOT bundled
— this arm is the fertility signal alone, so any effect is
attributable to it. This worker does NOT push, bump, verify live,
or merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Question (from sim-patchrot-b's metric review)

Patchrot rotated away from tiles foraged within 2 days and cut
the failed-trip share 0.346 -> 0.171 (PASS vs the -0.10 bar) while
mean daily haul FELL 511.9 -> 457.2 (FAIL vs the >= baseline
bar): the pilot was NO-GO on its divergence-aware pair. The
extra trips went to thinner ground, and rule-fresh tiles still
failed worked-out — "not foraged in 2 days" is not the same as
"harvestable". Does a rotation keyed to a REAL fertility signal
— the ground's own observed harvestable-cell state, not a rest
clock — cut failed trips WITHOUT shrinking the haul?

## The signal exists in the code — read, not invented (2026-11-01)

The forage action (src/js/game.js, the sweep) tests exactly one
thing per cell: FORAGEABLE = plant / bush / tree / bigtree, not
scorched, and NOT in t.detailRegrow (presence-based skip).
Harvested cells go into t.detailRegrow with { day: scholar.day
+ 2 } and are restored by the daily cell cycle when regDay <=
day ("STOCK FOLLOWS THE GRID: the grid is the inventory").
Tile stock is a DIFFERENT layer (the trip's stock > 0 filter and
the villager-duty layer), and haulsize proved it does not
predict sweep success (a stock-43 grove can be cell-picked-
clean). The game's parallel observed-knowledge record,
groundReadLevel (readGround on every sweep: lush / thinning /
picked / barren from stock / vigor-cap), tracks the stock
layer, so it is NOT a rule input — it is recorded by the
driver as a diagnostic predictor for the census only.

The signal this arm uses, availableCells, is the count of a
tile's detail-grid cells passing the sweep's own test
(forageable, not in detailRegrow). It is read ONLY for tiles
the scholar has itself worked (the policy's own visited set,
same tracking as patchrot). Unvisited tiles have no detail
read at all — the wrapper never calls genDetail or any
generator, and Game.tileAt is never called for unvisited
(possibly beyond-edge) entries, because the visited check runs
first on the key alone. Reading t.detail of a visited tile
cannot create ground. This is perception-honest under Steve's
2026-10-28 law: the scholar ranks only ground it has seen.

## Frozen rule (one sentence; the exact rule is this arm's design call, frozen here)

During competent.daily only, a tile the scholar has worked
whose detail grid currently shows ZERO harvestable cells
outside detailRegrow (barren-by-observation) sorts as 99 steps
farther for forage-target choice, and a worked tile showing
6+ such cells (known-fertile) sorts as one step nearer; ground
the scholar has never worked is left exactly alone — the menu
is never filtered, only reweighted.

Mechanism (policy-side only): during competent.daily only, the
wrapper returns travelTargets entries with `d` inflated by +99
for barren-by-observation tiles or reduced by 1 for
known-fertile tiles. forageTripSeedFirst sorts candidates by
(blocked, effective distance), so among unblocked candidates a
fertile tile sorts ahead of a thin one and a barren tile sorts
last; the trip tries up to 3 candidates, so barren ground is
still tried when fewer than 3 better candidates exist.
Blocked-first ordering is untouched. Known spillovers,
accepted: walkTo ignores `d` (own Manhattan distance), so it
is unaffected; nearestRubble picks by min `d`, so a barren
rubble tile may lose a stoneRun to a farther fertile one; the
feast patrol sorts by descending `d`, so a barren tile may look
farther and enter its top-4 — the patrol runs only while
feasted, and COMPETENT_FEAST=0 in this substrate. Caveats
built into the signal, not hidden: (1) availableCells counts
the WHOLE 9x9 detail grid while one sweep works only the 3x3
around the scholar's entry cell (travelTo sets mx/my to the
entry cell) — the count is an upper bound on what one sweep
reaches, a ranking signal, not an exact prediction. (2)
Scorched cells are not excluded (cellScorched is relative to
the tile the scholar currently stands on, which at menu time
is the haven, not the candidate) — scorched ground is rare,
and any overcount biases toward trying, not skipping. (3)
The +99 / -1 / 6+ constants are this arm's design call, frozen
here, not tuned to any pilot outcome (no pilot has run).

## Substrate (fixed, matches the haulsize / patchrot / routeblock pilots exactly)

Competent policy vs competent-fertrot-b, 30 days,
DEPOSITGATE=0 (keep 2,000). Env (FATAL if violated on the judged
CLI path): COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=0, POLICY=competent|competent-fertrot-b, DAYS=30.
The * =1 flags barred in packcomp (COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND,
WOODCARRY, WOODWARM, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB, FEDEVENING) must NOT be 1. Fresh seed band only: pilot
60101-60108, control 60109 (instrument proof + determinism,
never counted in any judged band), confirm reserve 60121-60132
(never run by this arm unless the pilot GOES, and only after a
freshness re-scan). Never reuse 511xx/512xx/513xx/514xx/515xx/
516xx/518xx/519xx/520xx.

SEED-BAND NOTE (deviation from the task's prescribed band,
documented, not hidden): the task prescribed pilot 52001-52008
with a verify-first instruction. That band is NOT unused: the
routeblock pilot ran 52001-52008 on 2026-11-01 (its baseline
jsonl carries "seed":52001, policy competent), and its
confirm reserve 52021-52032 was reserved by that arm. Reusing
it would contaminate the fresh-band rule, so this arm takes
the next verified-clean band instead. Freshness method: single-
pass rg scans of ALL of evidence/ for the seed field in both
spellings ("seed":N and "seed": N) over the pilot + control +
reserve ranges, plus a 2026-11-01 filename / .md-mention
check. Bands rejected with evidence: 52001-52008 (routeblock
pilot 2026-11-01); 53101-53108 (winseat 2026-10-18, seed
53102); 54101-54108 (deferguard 2026-10-18); 551xx / 561xx /
591xx / 701xx (scattered seed-field hits); 57101-57108
(vetblood 2026-10-18, spaced spelling); 581xx / 611xx / 621xx /
631xx / 641xx / 651xx / 661xx / 681xx (spaced-spelling hits).
60101-60108 + 60109 + 60121-60132 returned ZERO hits in both
spellings across all of evidence/, zero 2026-11-01 filenames,
and zero 2026-11-01 .md mentions. That is the band this arm
runs.

## Instrument (scripts/fertrot-b-driver.js, count-only wrappers)

Adapted from the patchrot driver (same substrate, same
count-only doctrine): per loopDay, day-start snapshot, every
travelTo + doAction('forage') call (with say lines, tele cells,
inventory deltas), trip-end snapshot when a walk home lands on
the haven after a successful forage, every returnToVillage call
(packcomp rule: live = Game.over false at entry), and the
fertrot ctx counters at day end (per-day deltas of forage
attempts, penalized menus, barren tiles, fertile tiles,
visited tiles). NEW vs patchrot: every forage event carries
its PRE-SWEEP signal (preAvail / preRegrow / preGround /
preStock, computed before the sweep consumes cells), and every
day-start candidate carries regrowingCells + groundReadLevel
alongside availableCells. The driver NEVER moves the scholar:
wrappers count only. The policy wrapper itself captures the
driver's wrappers as its origins and restores them in a finally
(patchrot precedent).

## Primary metric + GO threshold (divergence-aware pair, patchrot precedent)

PRIMARY (judged as a PAIR — same bars as patchrot, for
comparability):
  (a) failed-trip day share = pooled failed-trip days / pooled
      loopDays (failed = >= 1 forage attempt, 0 successes, the
      haulsize day-shape definition). GO needs armed share <=
      baseline share - 0.10 (10 percentage points).
  (b) mean daily haul = band mean of seed mean-daily-hauls
      (mean over loopDays of day-row edible + shelled kcal, the
      multisweep definition). GO needs armed >= baseline (not
      down — no tolerance: "not down" means not down).
  Pooled mean daily haul is reported alongside the mean-of-
  means (patchrot metric review: the next arm should report
  both and pre-declare which judges). JUDGE: the mean-of-
  means, as in patchrot — the pooled figure is diagnostic
  only and never rescues a mean-of-means miss.
PILOT GO (to confirm): BOTH (a) and (b) pass AND both cost bars
pass. Then CONFIRM on 12 fresh seeds (60121-60132, after a
freshness re-scan) under the same rules; CONFIRM GO requires
the same pair + cost bars.
COST BARS (both required): median survival (inst.daysAlive)
armed >= 0.8x baseline; starvation deaths armed <= baseline + 1.
PILOT NO-GO: any leg of the pair or any cost bar misses. Then
NO confirm spend, no re-score, evidence only. Finished-pack
value at returns and unload are DIAGNOSTICS ONLY in this arm:
they are reported, and they never rescue a primary miss.
SECONDARY (reported, never verdict): the pre-sweep predictor
census — success rate of forage attempts bucketed by preAvail
(0 / 1-5 / 6+ / null) on each arm. If the arm NO-GOs, this
census is the fallback deliverable the task asks for: it says
what signal WOULD predict success, measured, not asserted.
An engagement floor is pre-registered for interpretability:
the pilot is uninterpretable as a signal test (not a NO-GO on
the pair — the pair still judges) if band-wide penalized
menus + fertile bonuses total < 10 on the armed leg, i.e.
the rule barely engaged; that case is reported as
"uninterpretable — rule did not engage" alongside the pair
verdict, and the next arm must pick a substrate where the
signal varies (routeblock metric-review precedent).

## Balanced panel (section 15) — combined panel pre-declared

Single-policy panels can never match a new-policy arm
(multisweep lesson, proven: formal compare returns decision
"invalid", "Unmatched policies" / "Unmatched cases"; patchrot
and routeblock applied the same lesson). The instrument for
this arm is ONE COMBINED panel: both policies, same seeds,
same days, run as a single balance-panel campaign (`node
scripts/balance-panel.js --policies
competent,competent-fertrot-b --seeds 60101,...,60108 --days
30`, subject to the tool's own flag spelling — the exact
invocation is recorded in the evidence file, and if the tool
refuses the combined run, that refusal is reported, not worked
around by fabricating a compare). The combined panel's compare
.md is attached to the evidence file. Panel survival/death
definitions differ from the driver's judged cost bar (patchrot
precedent), so panel numbers are context, never verdict.

## Sense test (SENSE-TESTING LAW)

At least one transcript slice read for meaning in the evidence
file: does a fertility-ranked trip read as a person choosing
ground that looks good ("step to another green patch" with a
reason), or as a robot marching a grid pattern? A rotation
that works but reads as a grid march is a sense finding to
report, not a win to hide. Note anything robotic, including
any day where the rule skips a visibly good patch for a worse
one with no narration, and whether the fertility choice itself
is narratively marked anywhere (patchrot's rotation was
invisible; this arm checks whether the signal changes that).

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No metric,
threshold, seed, or rule may change mid-run; doubts go there for
the NEXT run.

## Commit order (this file + skeletons BEFORE any judged sim)

This prereg, scripts/policies/competent-fertrot-b.js,
scripts/fertrot-b-driver.js, scripts/analyze-fertrot-b.js,
scripts/test-fertrot-b.js (pure checks + live-control/det
paths), and the one additive sweep-compare registry line are
committed FIRST. The pilot (60101-60108) runs only after that
commit lands. The live control / determinism runs (60109) run
after the prereg commit too — they are instrument proof, not
judged seeds, and their numbers never enter a judged band.
