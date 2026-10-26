# sim-food-economy-round-1930-b — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261026T1930Z. Loop A live on scale-onramp at
run start (1920Z claim: sim-wave4enc-a + sim-tabletalk-sit-a, NOT
touched); loop A landed its full 1920Z round mid-run (master
4d892a736 -> 6ef77e3e7: wave4enc DIAG-GO + tabletalk-sit DIAG-GO +
coordinator evidence) and closed cleanly. Loop B worked
food-economy (second non-converged axis), taking the 1830Z next
blanks (1) meal-draw record + pile-match prereg for the residual
pair and (3) what seed 9762 stocks that the others don't, in order.
Both arms measurement only, zero src/js, no default flips. Both
rebased clean onto the new master (zero file overlap with A's
landing or with each other), re-proved on the merge base, then
merged ff-only (the second merge needed a rebase onto the first
merge — expected sequencing, not a conflict). Merged locally,
pending ship.

## Arm 1 — sim-stock9762-b (922aa5662, proof GREEN on merged master)

Verdict: NO-GO against its pre-registration (evidence/2026-10-26/
sim-stock9762-b-prereg.md, written before any new sweep or
name-level analysis). Leg 1 reproduction exact (761 resolutions,
750 engaged, 11 NPC sows, 3,167 keeper turns, 32 beds, 235 player
sows — the gardenbar band, reproduced). Leg 2 snapshot rebuild
100.0% (summed bucket freshKcal == pantryFreshKcal() on 761/761;
three throttle flags agree on all 761). Leg 3 FAILS: totalGap =
59,670 kcal (9762 median fresh 89,967 − other-seed median 30,297).
Best present-across single channel is Foraged food at 21.5%; best
present-across set (Foraged food + Dried beans) is 40.4% — both
under the 50% bar. Lamb's Quarters alone covers 53.9% of the gap
(median 32,150 vs 0) but fails the present-across leg by ONE
resolution: present on 79/99 engaged resolutions (79.8%) vs the
80% bar. Even a 4-channel present-across set (adding Rice +
Canned soup) reaches only 46.8%, so the set rule is not what
binds — the presence leg is. No re-scoring was done; the metric
review proposes a post-arrival persistence measure for the NEXT
run instead.

What 9762 actually stocks, in plain words: not one windfall, but
three layers. (1) The same starting pantry as every seed (Rice
13,000 + Dried beans 12,000 + Canned soup 7,500 on day 2
everywhere), which on 9762 is never drawn because inflows cover
meals, so Rice sits at exactly 13,000 on every snapshot for 100
days. (2) A steady drip of Lamb's Quarters — 129 deposit-door
events from day 20 onward totaling 396,750 kcal, ratcheting to
30,000–52,000 kcal and staying there, present on every engaged
day from day 24 on (79 of the 80 engaged resolutions from first
appearance) — the 80% bar fails only because it counts the 19
pre-arrival days. (3) A fatter foraged base (median 20,714 vs
7,885 elsewhere). Contrast that proves flows are not stocks: 9761
takes in MORE total kcal (583,933 vs 9762's 452,718, including
523,680 Cattail) yet holds a 32,951 median stockpile — its big
hauls pulse and collapse, while 9762's drip stays. Garden harvest
is absent from every pantry snapshot on every seed (ripe == 0
throughout).

Sense-test: on 9762 days 30–41, "the harvest can wait" reads TRUE
(day-end fresh 77,006 → 99,442) — the opposite of throttledays'
0.85-need-day seed-9760 sample. The talk matches the stockpile on
the one seed where the stockpile is real. Keepers rotate daily;
raids on days 39/44 get named reactions. One oddity: the player
keeps sowing Lamb's Quarters in beds while the pantry's Lamb's
Quarters arrives as deposits — garden work and pantry stock run
in parallel without meeting.

Wall (band 9760–9767, competent-nofeast, 100d): national / table /
wins 0/8; wave-4/5 unlocks 0/8; wave reach 9760:3, 9761:2, 9762:2,
9763:2, 9764:2, 9765:3, 9766:3, 9767:3; median survival 100d (all
survived); 18 deaths, none starvation (arena 6, monster 4, ambush
2, dehydration 2, wound 1, expedition 1, "big ugly" 1, "extended
warranty" 1).

## Arm 2 — sim-mealdraw-b (00e0b1e5b, proof re-run on merged master)

Verdict: NO-GO (literal, per prereg) — but the instrument is
proven neutral; the base moved under the arm. Proof on the merged
master reproduces the worker's pattern exactly: 18 PASS, 19 FAIL,
verdict NO-GO. The failures ARE the verdict. Passing: leg-4
(@85 window-2 draws exactly 0), leg-6 (630/630 villager-home meal
calls cross-check fresh+spoiled == returned drawn; 0 drawSpoiled
diff mismatches; no truncation; ctxKcalMatch 0 mismatches over
1,729 lines). Failing legs, named: leg 1 control (new corpus
re-derives 383/338/45, lag 1x40/2x4/3x1, coverage 44/45, sole
residual (9754,80) — the stockdoor pair is gone); leg 2 (Class-A
draws 0 not 800; whole-@85 draws 0 not 1,142); leg 5 (Foraged-200
@86 equation 1,600 ≠ 0; no day-84 worked line exists on the new
base, so the smoke cross-check has no evidence); leg 7
determinism (mismatches on seeds 9750, 9753, 9754 only).

Root cause, proven by control experiment: commit 1377d03c3
(journey r53: conversation.js + villageAgency.js) landed between
the stockdoor run and this run and moved the trajectory (seed
9750: wave 3 → 2, deaths 5 → 2). An unmodified stockdoor-only
re-run on current HEAD reproduced the mealdraw corpus EXACTLY on
all 8 seeds (identical per-seed log lines including timings) — so
the instrument is neutral and leg 7's "mismatch = instrument
effect" attribution is falsified; the baseline is stale, not the
instrument. The NO-GO stands because the prereg binds to that
stale baseline.

Post-hoc finding (NOT a re-score, NOT a verdict change): on the
current base, the meal-draw record reconciles gross vs surviving
pile exactly on all three nights (scripts/check-mealdraw-b-newbase.js,
3/3 CLOSED, residual 0): night 81: 0 + 3,600 − 0 = 3,600;
night 82: 0 + 3,800 − 0 = 3,800; night 83: 0 + 4,400 − 0 = 4,400.
Mechanism proven: stockSurplus stamps the freshest clock (day+3)
and fresh-first draws eat the oldest first, so the night's
surplus is touched only when wants exceed all older stock — on
the old trajectory that happened (800 kcal), on the new one it
never does (the village mostly feeds itself: 7 of 9 night-82 meal
calls drew 0 from the pantry). Next prereg must pin the base
commit and re-derive endpoints from a stockdoor-only control
sweep on that HEAD first.

Instrument built: scripts/mealdraw-capture.js — recorder-side
wrappers around villagerMealDay (home/away context), villageMeal
(player), pantryDraw, drawSpoiled (before/after itemized diff),
plus a cook-line-counting say wrapper so every draw carries an
exact window stamp (first-cook to first-cook). Sweep/analyzer/
proof reuse the stockdoor captures unchanged.

Sense-test: night-82 sequence read in full — player ceil (want
170 → took 355, indivisible soonest-spoiling pieces), one
villager top-up (200 kcal @81, soonest-spoiling first), everyone
else fed from own work; next-morning plain cook lines and Heidi's
"shelves are full, ~118 days of fresh" throttle line both match
the recorded pantry. Coherent; nothing robotic flagged.

Wall (new corpus, seeds 9750–9757, competent-nofeast, 100d):
national / table / wins 0/8; wave-4/5 unlocks 0/8; wave 3 on 3
seeds, wave 2 on 5; median survival 100d (9751 lost day 48, rest
survived); deaths 31 (arena 13, starvation 5, ambush 3, sickness 3,
monster 2, wound 2, dehydration 1, contest 1, lockjaw 1); rank
village on all 8.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '<corpus-glob>' --metrics national,table,wins,exiled` on
both corpora: 3 LOUD lines each (national 12 -> 0, table 16 -> 0,
wins 16 -> 0), the known artifact class from every prior round —
the checker reads top-level national/table/wins keys that
per-seed recorder rows do not carry, and the WINSEAT baseline's
own regime note forbids comparison against SEATDRIVE=0
measurement bands where national/table/wins are structurally 0
(both arm evidences independently report 0/8). Baseline NOT
rolled. No new investigation.

## Village assessment (plain words)

Two measurement bands, same shape: villages that live the full
100 days around pantries whose readings finally line up with
reality on at least one seed. On the gardenbar band, 9762 is the
village that actually has food — a starting pantry it never
needs to touch plus a daily Lamb's Quarters drip that never
stops — and its people talk about plenty truthfully. On the
residual band, the village mostly feeds itself night to night
and the nightly surplus pile is a bookkeeping shadow: written
fresh, eaten oldest-first, and only touched when the village is
actually hungry. Nobody starved on the gardenbar band; the
residual band's 5 starvation deaths sit alongside 13 arena
deaths — the pantry is not what kills these villages. The scale
wall stands on both bands: no national, no table, no wins, no
wave 4–5 anywhere.

## Infrastructure

- Loop A landed mid-run (6ef77e3e7); rebases clean, zero file
  overlap, proofs re-run on merge bases (stock9762 green,
  mealdraw same 18/19 pattern).
- Safe-commit index clobber hit BOTH worker commits (staged-
  deletion variant) — repaired via HEAD-blob cacheinfo each
  time, commits verified correct, worktrees clean at release.
- No EPERM flap blocked this run. No sibling trees, branches,
  or files touched.
- check.js --quick NOT re-run (zero src/js, sibling loop A live
  at run start); attributable evidence is the arm proofs on
  merged master.

## Metric review (MEASUREMENT.md section 14)

- Stock9762's presence leg counts from band start, so a channel
  that arrives on day 20 can never pass 80% on a 100-day band
  with 19 pre-arrival engaged resolutions — the bar measures
  arrival time, not persistence. Next run: pre-register a
  post-arrival persistence measure (presence from first
  appearance) alongside, not instead of, the band-start measure,
  so the two can be compared.
- Mealdraw's prereg bound its endpoints to the stockdoor
  corpus's base without pinning the base commit. A conversation/
  agency commit moved the trajectory between runs, so the
  control leg failed on trajectory, not on the instrument.
  Next run: pin the base commit in the prereg and run a
  stockdoor-only control sweep on that HEAD before judging.
- Neither verdict was re-scored mid-run. Both NO-GOs stand under
  their own headers.

## Blanks filled or documented

Filled (measurement): the meal-draw instrument exists and
reconciles gross vs surviving pile 3/3 on the current base; the
9762 gap is decomposed (starting stock + LQ drip + foraged base)
with the persistence question isolated to one resolution.
Documented, not fixed: the residual-pair judgment is still open
(it needs the re-pinned prereg above); the LQ persistence
mechanism, the garden-deposit paradox, the starting-stock
draw-order question, the spoilage-boundary split, the ~5,900
kcal non-draw removal, and the unproven drawSpoiled path (see
findings backlog). No game-code fix landed from either arm; the
throttle keying ruling remains Steve's call.

## Next blanks, in order

1. Meal-draw re-prereg pinned to a base commit, with a
   stockdoor-only control sweep on that HEAD first, then a
   re-judgment of the residual pair with gross and surviving
   pile judged separately.
2. Post-arrival persistence measure for Lamb's Quarters (metric
   review proposal above).
3. Garden-attributed deposits with zero garden harvest —
   deposit-path trace arm (all 129 LQ deposits carry
   gardenShares, yet plots never ripen).
4. LQ persistence mechanism: spoil timing vs meal-draw order vs
   deposit frequency, distinguished.
5. Meal-draw order for starting stock: untouched for 100 days on
   9762/9764/9767, eaten to zero on 9763 — what decides whether
   it is ever drawn.
6. Spoilage-boundary split: pantryDraw on day 81 drew 2,400 kcal
   from spoilDay-80 stacks the bonus-0 cook-eligibility rule
   calls spoiled (meal boundary is bonus-aware, cook boundary
   is bonus-0).
7. ~5,900 kcal of spoilDay-81 fresh stacks vanish between
   day-82/83 first-cook snapshots with only 555 kcal of recorded
   draws — a non-draw removal (sweep boundary or another path)
   is unexplained.
8. drawSpoiled never fired on this band (0 calls in 9,891 meal
   records) — the desperation path's accounting is unproven.
9. Throttle keying ruling (Steve's call — drain-days vs
   need-days, 91.6% disagreement measured 1830Z).
10. Presence-aware share bar + next diversity arm; plain-silenced
    indistinguishability; rule-R voice taxonomy rebuild;
    scholar-donation visibility (carried).

food-economy stays converging (NOT converged): the fourth door
is recorded, the meal-draw record reconciles on the current
base, and the 9762 gap is decomposed — but no food-economy
game-code fix has landed from either arm, the residual-pair
judgment is still open pending a re-pinned prereg, and the
scale wall is untouched by this axis. scale-onramp stays
converging (untouched; sibling loop A). Claim deleted; lock
deleted. Evidence: this file (coordinator) + sim-stock9762-b.md
+ prereg + sim-mealdraw-b.md + prereg + 2 corpora. Merged
locally, pending ship.
