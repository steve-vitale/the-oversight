# sim-multisweep-b — second-trip / multi-sweep pilot NO-GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1725Z,
axis food-economy, arm sim-multisweep-b. Worktree sim-multisweep-b,
branch sim-multisweep-b. Answers the coordinator's first haul-size
follow-up in evidence order: the second-trip / multi-sweep arm for
the POLICY_ONE_TRIP shape (sim-haulsize-b: 64/64 successful-trip
days stop after one sweep). Policy-side arm only: NEW policy file,
default OFF, zero src/js changes, zero policy-default flips, zero
edits to scripts/policies/competent.js. This worker does NOT push,
bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator
merge.

## Verdict: PILOT NO-GO — NO confirm spend

Prereg: evidence/2026-11-01/sim-multisweep-b-prereg.md (commit
a7a99fbc8, BEFORE any judged sim). Judged exactly against the
prereg's verbatim bar: GO requires armed >= 1.25x baseline on the
primary AND the cost bar clean (starvation deaths <= baseline+1,
median survival >= 0.8x baseline).

- PRIMARY (pooled mean finished-pack value on successful-trip
  days, final live return per day): baseline 887.5 kcal (n=110
  days) vs armed 738.1 kcal (n=94 days) — ratio 0.832, below the
  1.25 bar. MISS.
- COST BAR: clean — starvation deaths 1 vs 1 (delta 0, bar +1),
  median survival 30 vs 30 (ratio 1.0, bar 0.8). Clean does not
  rescue a primary miss: GO requires both.
- Therefore PILOT NO-GO. No 12-seed confirm is run (confirm seeds
  51821–51832 were RESERVED but never run and remain fresh for a
  future run). No re-score: the secondaries below (daily haul up,
  multi-sweep share up) do NOT overturn a primary miss — the
  prereg names them diagnostic only, and this evidence honors that.

## The answer in one paragraph

Second outings DO happen — the variant is not a dead lever. On
armed pilot days the scholar goes out again on 91 days and brings
home a second successful sweep on 40 of them (multi-sweep share
0.381 vs baseline 0.000; POLICY_ONE_TRIP share falls 1.000 to
0.619), and mean daily haul rises 592 to 856.7 kcal (+45%). But
the finished packs at returns do NOT grow: pooled mean finished
falls 887.5 to 738.1, and mean final combined falls further,
1676.4 to 1000.9. The extra haul is mostly unfinished value
(unknowns in the lump, in-shell nuts) that the finished metric
does not count, and — the part that needs its own decomposition
before anyone claims it — armed days fail more often afterwards
(119 failed-trip days vs 98 baseline), consistent with extra
sweeps picking more cells clean against the ~2-day regrow, though
that feedback is a hypothesis here, not a measured claim. A
second outing helps the day's haul and does not help the
finished pack that clears the keep — so on the prereg's own bar,
the lever as built does not beat the ceiling.

## Pilot census (30d competent, DEPOSITGATE=0, keep 2,000)

Primary = pooled mean finished kcal of the day's FINAL live return
over successful-trip days (days with >= 1 successful forage);
days with no live return that day are excluded and counted
(noRet). Mean-of-seed-means is a sensitivity only, never judged.

| seed | arm | tripDays | primaryMean | n | noRet | oneTripShare | multiShare | extraDays | extraSuccDays | surv | starv | unload | wave |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51801 | base | 19 | 891.6 | 19 | 0 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 750 | 2 |
| 51801 | armed | 13 | 1281.9 | 13 | 0 | 0.462 | 0.538 | 10 | 7 | 30 | 0 | 2860 | 2 |
| 51802 | base | 21 | 847.9 | 21 | 0 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 44070 | 2 |
| 51802 | armed | 14 | 1167.9 | 14 | 0 | 0.500 | 0.500 | 14 | 7 | 30 | 0 | 36225 | 2 |
| 51803 | base | 8 | 132.5 | 4 | 4 | 1.000 | 0.000 | 0 | 0 | 30 | 1 | 0 | 1 |
| 51803 | armed | 18 | 464.4 | 17 | 1 | 0.667 | 0.333 | 16 | 6 | 30 | 0 | 1115 | 2 |
| 51804 | base | 19 | 496.1 | 19 | 0 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 0 | 2 |
| 51804 | armed | 13 | 268.0 | 10 | 3 | 0.308 | 0.692 | 13 | 9 | 30 | 0 | 0 | 2 |
| 51805 | base | 17 | 2006.5 | 17 | 0 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 48605 | 1 |
| 51805 | armed | 12 | 1277.9 | 12 | 0 | 0.167 | 0.833 | 12 | 10 | 30 | 0 | 8160 | 2 |
| 51806 | base | 11 | 388.8 | 8 | 3 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 0 | 2 |
| 51806 | armed | 15 | 292.5 | 8 | 7 | 1.000 | 0.000 | 7 | 0 | 30 | 1 | 0 | 2 |
| 51807 | base | 11 | 708.6 | 11 | 0 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 48530 | 2 |
| 51807 | armed | 10 | 423.0 | 10 | 0 | 1.000 | 0.000 | 10 | 0 | 30 | 0 | 53280 | 2 |
| 51808 | base | 11 | 719.1 | 11 | 0 | 1.000 | 0.000 | 0 | 0 | 30 | 0 | 15480 | 2 |
| 51808 | armed | 10 | 388.5 | 10 | 0 | 0.900 | 0.100 | 9 | 1 | 30 | 0 | 45450 | 2 |
| BAND | base | 117 | 887.5 pooled (773.9 seed-means) | 110 | 7 | 1.000 | 0.000 | — | — | 30 med | 1 | 157435 | 2 |
| BAND | armed | 105 | 738.1 pooled (695.5 seed-means) | 94 | 11 | 0.619 | 0.381 | 91 | 40 | 30 med | 1 | 147090 | 2 |

Seed-level split: armed primary higher on 3/8 seeds (51801,
51802, 51803), lower on 5/8. The pooled miss is not one seed:
the baseline's 51805 outlier (2006.5) helps the baseline, but
armed also falls on 51804 (496 to 268), 51807 (709 to 423), and
51808 (719 to 389). Two armed seeds (51806, 51807) attempt extra
trips on 7 and 10 days respectively with ZERO extra successes —
worked-out land stops the loop as designed (the loop breaks after
a 0-return trip), so on those seeds the variant spends outings
without a second haul.

Secondaries (diagnostic only, never overturning):
- FAILED_WORKED_OUT day share: 0.918 baseline (90/98 failed days)
  vs 0.966 armed (115/119) — failed days remain worked-out
  dominated on both arms; failed-day count rises 98 to 119 armed.
- Mean daily haul (edible + shelled kcal per loopDay): 592.0
  baseline vs 856.7 armed (+44.7%) — the day's haul grows even
  while return finished packs shrink. The gap between this and
  the primary is the finding's shape: extra sweeps add value that
  is not finished at return time.
- Mean final combined (finished + shelled + unknown at data
  calories): 1676.4 baseline vs 1000.9 armed — combined falls too,
  so the miss is not only a finished-definition artifact. The
  trajectories diverge after the first extra trip (extra trips
  consume game RNG and deplete cells), so later days are not the
  same days anymore; see Metric review.
- Unload total (deposits during live returns): 157,435 baseline
  vs 147,090 armed. No finished-pack clearance story changes:
  unload moves with trajectory noise, not with the lever.

## Control (instrument proof only, NON-JUDGED seed 51809)

After the prereg commit, before the pilot: driver baseline +
armed on 51809, analyzer runs on both, armed driver run twice for
determinism. Baseline: tripDays 19, primary 835.3 (n=19). Armed:
tripDays 10, primary 1185.5 (n=10), extra-trip days 9,
extra-success days 8, multi-sweep days 8/10. Armed census
byte-identical across the two determinism runs (tripDays,
primary, n, oneTrip, multi, liveReturns, maxCombined, extra
counts all equal). The control proves the instrument and that
extra trips fire and succeed — it is NOT a judged result, and its
armed-higher primary (small n, one seed) does not soften the
pilot NO-GO. Deaths-array shape verified on the control:
entries {day, kind, who, cause, player}; kind 'starvation' exists
in the engine, so the prereg's /starv|hunger/i matcher catches a
starvation-kind death if one fires (none fired on the control;
pilot starvation counts are 1 vs 1 under that matcher).

## Sense test (SENSE-TESTING LAW: read, don't just count)

Full extract: evidence/2026-11-01/sim-multisweep-b-corpus-51801-day3.txt
(armed seed 51801, loopDay 3: base 1 success + 2 extra trips, 2
extra successes, 3 successful forages total).

The day reads as a person going back out — with one honest gap.
First sweep at grove (4,3): unknown shoots into the bag. Second
outing: (4,3) comes back "worked out — step to another green
patch", so the scholar steps to grove (5,4) and it pays: unknown
nuts (11), unknown berries, sticks. Third outing: (4,3) pays
again with unknown berries ("picked clean — it'll recover in a
few days"), then home to (4,4) with a 4.9 kg pack. The
worked-out-then-step-on behavior is the game's own honest voice,
and the extra sweeps reuse it correctly. Two notes, recorded not
chased: (1) NOTHING in the transcript marks a second outing as a
second outing — no line says "you head back out"; a reader sees
forage lines and return beats but cannot tell trip 1 from trip 2
except by counting them. The variant is behaviorally real but
narratively invisible. (2) The "Unfamiliar unknown X — into the
bag" line repeats verbatim per unknown kind — pre-existing game
voice, not this variant's, noted for completeness.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does. In-window
driver numbers: 8/8 seeds survived 30 loopDays on both arms
(median survival 30, collapses 0); wave reach max 2 both arms;
national 0, table 0, wins 0 IN THIS WINDOW ONLY — not a wall
movement claim. Panel rows (below) agree: national 0, table 0,
won 0 on all 16 cases.

## Balanced panel (section 15)

The panel is the instrument; the pre-registered threshold above
is the judge. Panel runs: baseline-only, armed-only, and one
combined panel, all 30d, pilot seeds 51801–51808, same env flags
as the driver substrate.

- FORMAL COMPARE: decision "invalid" — errors "Unmatched
  policies" / "Unmatched cases". The compare tool matches cases by
  policy id, so a before panel (competent) and an after panel
  (competent-multisweep-b) share no policy and can never match.
  That is an input-format limitation of the compare tool for a
  new-policy arm, recorded honestly here with the exact errors —
  no panel result is fabricated. The compare .md is attached:
  evidence/2026-11-01/sim-multisweep-b-panel-compare.md.
- COMBINED PANEL (the valid instrument shape for a policy-variant
  arm: one panel, both policies, same source, same seeds):
  16 cases, sourcesStable true, neutrality match true for both
  policies on the proof seed, zero warnings. Rows: national 0,
  table 0, won 0 both arms; survival30 mean 0.571 baseline vs
  0.429 armed (panel survival30 = first-bearer alive at day 30, a
  DIFFERENT quantity from the driver's median loopDays survived —
  do not conflate them); playerDeaths 3 baseline vs 8 armed;
  villageDeaths 55 baseline vs 87 armed. The panel deaths are
  context, not the judged cost bar (the prereg cost bar counts
  starvation-kind deaths in the driver: 1 vs 1, clean). The panel
  death gap is a caution flag for a future arm — second outings
  may expose the scholar to more fights — but it is not a judged
  metric here and the panel substrate path (runComparison) is not
  the driver path, so it is reported as a flag, not a verdict.

## Metric review (for the NEXT run; this run judged against its header)

- IDENTICAL SEEDS ARE NOT IDENTICAL TRAJECTORIES: the first
  extra trip consumes game RNG and depletes cells, so every later
  day on the armed arm is a different day from the baseline's.
  The pooled mean therefore mixes the lever's direct effect (a
  second haul today) with trajectory divergence (different
  patches, fights, and failures tomorrow). The NEXT arm on this
  axis should pre-register a divergence-aware primary — e.g.
  first-trip-day outcomes before divergence, or a per-day paired
  analysis that stops pairing at first divergence — instead of a
  pooled 30d mean.
- THE PRIMARY MAY UNDER-MEASURE A REAL BUT UNFINISHED HAUL: the
  extra sweeps mostly add unknowns and in-shell nuts, which count
  0 in finished at return time. Mean final combined ALSO fell
  (1676 to 1001), so this alone does not explain the miss — but
  a future prereg that wants to judge "does the village eat
  better" should consider next-morning sorted-pack value or
  pantry inflow as the primary, stated before the run, not after.
- STARVATION-DEATH SCOPE: the prereg matcher counts starvation
  deaths across the whole run (villagers included), not
  scholar-only. The NEXT prereg should say explicitly which scope
  the cost bar uses; this run is judged on the scope as written
  (1 vs 1 either way on this band — the single starvation death
  per arm is the only such death, so scope does not change this
  verdict).
- PANEL SHAPE FOR POLICY VARIANTS: pre-declare the combined
  panel (both policies, one run) as the instrument, not two
  single-policy panels plus a formal compare — the compare tool
  cannot match a new policy id across panels. The invalid
  compare .md is attached as the record of that limitation.
- No metric, threshold, seed, or classification rule was changed
  mid-run. No amendment was needed after the control: the deaths
  shape matched the prereg matcher, so the prereg stands as
  committed. The NO-GO verdict stands as written; the daily-haul
  rise (+45%) and multi-sweep share (0.381) are interpretation of
  a NO-GO result, not a re-score.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it) and
does not append to sim-findings.md directly (same standing as
sim-haulsize-b: avoid cross-loop file collisions; the coordinator
appends). The lines below are in backlog format for the
coordinator to append verbatim if it wants them:

- [open] 2026-11-01 — food-economy / second outings — second outings are narratively invisible: on armed multi-sweep days (e.g. 51801 loopDay 3, 3 successful forages) no line marks a second outing as a second outing — the transcript shows forage lines and return beats but nothing says "you head back out"; the variant is behaviorally real but unreadable as a second outing (sim-multisweep-b evidence).
- [open] 2026-11-01 — food-economy / patch depletion feedback — armed failed-trip days rise 98 to 119 vs baseline on identical pilot seeds while FAILED_WORKED_OUT share rises 0.918 to 0.966: hypothesis only (extra sweeps pick more cells clean against ~2-day regrow, so later days fail more); needs its own decomposition before any claim (sim-multisweep-b evidence).

## Next lever candidate (or why there is none)

There is no single-lever follow-up from this NO-GO alone — that is
what NO-GO means here. The candidate NEXT arms, in the order the
evidence points (each needs its own prereg; none is claimed GO by
this arm):

1. REGROW / PATCH-ROTATION arm (the bigger haulsize lever, 67%
   failed days): measure cell regrow timing against trip cadence
   and/or a rotation policy preferring unworked tiles; judged on
   failed-trip rate. This arm's depletion-feedback hypothesis
   strengthens the case for it but does not replace its own
   decomposition.
2. ROUTE-BLOCKAGE arm (compounding friction): route-around /
   standing-home gates (currently OFF) vs failed-trip rates and
   stranding duration. Do NOT bundle with (1).
3. A RE-SCOPED multi-sweep arm ONLY with a divergence-aware
   primary (see Metric review) and a finished-vs-sorted
   definition decided before the run — not a re-run of this
   prereg on fresh seeds hoping the ratio flips.

## Infrastructure (loud, per task)

- INDEX CLOBBER (known class) hit the prereg commit: after
  safe-commit landed a7a99fbc8 (verified correct: prereg 186
  lines, driver 387, analyzer 157, policy 79, test 148,
  sweep-compare +5), the main index showed staged deletions +
  untracked copies for all five new files and an MM entry on
  sweep-compare.js. Repaired via git update-index --add
  --cacheinfo from HEAD blobs for all six paths; verified git
  status --short empty + git diff HEAD empty + git diff --cached
  empty after repair. The commit itself was never wrong; only the
  main index lied.
- NO EPERM FLAP this run: all commits, writes, and driver runs
  succeeded first try (contrast the 1543Z run's ~1h flap). The
  pilot (16 seed-runs) took ~37s wall; panels took ~30s each.
- Sibling trees untouched. Main tree at
  ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-multisweep-b.js: 6/6 pure checks green (policy
identity + baseline untouched, pack-full 95% boundary, at-haven
guards, primary final-return selection + no-return exclusion,
compareBands GO/cost-bar cases incl. the baseline-0 edge, starvation
matcher). Live modes on NON-JUDGED seed 51809 only: --live-control
(baseline + armed structure + analyzer) green, --live-det (armed
twice, identical census) green. Proof runs executed before the
closeout commit: pure 6/6, live-control 2/2 arms, live-det 1/1 —
all green.

## Files

- Prereg: evidence/2026-11-01/sim-multisweep-b-prereg.md
  (commit a7a99fbc8, BEFORE any judged sim)
- Policy variant: scripts/policies/competent-multisweep-b.js
  (default OFF; panel registration: one additive try{} line in
  scripts/sweep-compare.js, same commit)
- Instrument: scripts/multisweep-b-driver.js,
  scripts/analyze-multisweep-b.js
- Proof test: scripts/test-multisweep-b.js (6 pure;
  --live-control 51809, --live-det 51809)
- Pilot census: evidence/2026-11-01/sim-multisweep-b-pilot-baseline.jsonl
  (8 lines), sim-multisweep-b-pilot-armed.jsonl (8 lines),
  sim-multisweep-b-pilot-analysis.json (analyzer summary + full
  per-day tables)
- Corpus extract: evidence/2026-11-01/sim-multisweep-b-corpus-51801-day3.txt
- Panel: evidence/2026-11-01/sim-multisweep-b-panel-compare.md
  (formal compare decision "invalid", unmatched policies — see
  Balanced panel section); combined-panel rows summarized above
  (panel dirs in /tmp: panel-multisweep-base, panel-multisweep-armed,
  panel-multisweep-both — not repo files)
- Evidence: evidence/2026-11-01/sim-multisweep-b.md (this file)
