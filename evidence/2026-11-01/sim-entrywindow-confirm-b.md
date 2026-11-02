# sim-entrywindow-confirm-b — ENTRY-WINDOW ROTATION CONFIRM: NO-GO on the stranding secondary

Run: oversight-flesh-out-loop-b (confirm worker), axis food-economy,
arm sim-entrywindow-confirm-b. Worktree sim-entrywindow-confirm-b,
branch sim-entrywindow-confirm-b. The CONFIRM of sim-entrywindow-b
(PILOT GO: failed-trip share 0.258 -> 0.058, haul 633.7 -> 967.9,
starvation 2 -> 0, away day-ends 30 -> 17, pilot band 60121-60128).
No new rule, no variant: the pilot's FROZEN rule, reused verbatim
(policy scripts/policies/competent-entrywindow-b.js read-only,
driver and analyzer reused verbatim), judged on a fresh 12-seed
band. This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: CONFIRM NO-GO — the pair passes with margin, the costs pass, and the stranding secondary vetoes

Prereg: evidence/2026-11-01/sim-entrywindow-confirm-b-prereg.md
(commit bab5384f4, BEFORE any judged sim). Judged exactly against
the prereg's pair + cost bars + secondary away metric, 30d
competent, DEPOSITGATE=0, identical seeds both arms (confirm band
60201-60212; freshness verified by all-evidence seed-field scans
in both spellings plus .md-mention scans before the prereg — see
the prereg's band note). NO re-score was taken: the pair's huge
margin does not rescue a secondary failure, and the secondary's
failure does not retroactively shrink the pair. Both are reported
as measured.

| Leg | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| (a) failed-trip day share, pooled | 0.446 (160/359 days) | 0.075 (27/360 days) | armed <= baseline - 0.10 | PASS, delta -0.371 |
| (b) mean daily haul, band mean of seed means | 553.0 kcal | 828.6 kcal | armed >= baseline | PASS, delta +275.6 |
| Cost: median survival | 30 | 30 (ratio 1.0) | >= 0.8x | clean |
| Cost: starvation deaths | 2 | 1 (delta -1) | <= baseline + 1 | clean |
| Secondary: away day-ends, band total | 8 | 19 | <= baseline + 5 (= 13) | FAIL, +6 over the bar |
| Secondary: 60108-shaped seed | none | 60207 (armed 19, baseline 0, starvation death) | none allowed | VETO |
| Engagement floor (interpretability) | — | 2,282 penalized menus, 8,307 empty-window tiles | >= 10 adjustments | ENGAGED |

CONFIRM NO-GO: the pair passes and the costs pass, but the
secondary away bar fails (19 vs a 13 ceiling) AND seed 60207 is
exactly the 60108 shape the secondary was built to catch — armed
away day-ends 19 while baseline is 0, with a starvation death on
the armed leg. Per the prereg, a 60108-shaped seed fails the arm
even if the pair passes. The pilot's rule therefore does NOT
confirm: it still fixes empty-window trips on a fresh band, and
on this band it also strands the scholar in a map pocket badly
enough to kill. The pilot's 60128 improvement (away 15 -> 5)
does not generalize — same rule, different map draw, opposite
stranding outcome. The rule must not land as-is; the next arm
on this axis is a pocket-aware variant (see "Metric review"),
not a re-run of this confirm and not a yield-aware variant
alone, which would not have saved 60207.

## The answer in one paragraph

On a fresh band the entry-window signal is, if anything, stronger
than at pilot: failed-trip share falls from nearly one day in two
(0.446) to roughly one day in thirteen (0.075), haul rises by half
(553.0 -> 828.6), trips end on the first try (first-attempt
successes 32 -> 276, later-try attempts 512 -> 52, total attempts
846 -> 378 while successful-trip days rise 174 -> 299), and the
empty-window identity holds perfectly again (baseline 664/664
empty-window attempts failed, armed 51/51 failed; entry prediction
100% on both legs, 795/795 and 302/302). But the band's verdict
turns on one seed. Baseline 60207's scholar grinds the same three
near-home tiles for 30 days and never leaves the haven overnight.
Armed 60207's scholar ranges to (5,3) on day 5, succeeds there,
and finds the way home blocked by a fallen tree; the alternative
routes are all creek crossings that refuse ("no crossing without
a bridge or a swim"). The scholar spends days 5-13 away, during
which Amelia Knight starves (day 13); back home for days 14-17,
it walks into the same pocket again on day 18 and spends days
18-27 away trying blocked routes home, during which Zoey Cao dies
of dehydration (day 27) and play passes to a successor ("You're
someone else now"). Both stretches end the day after a
player-character death, with the next day starting at the haven —
consistent with succession restarting at home, not with a rescue.
The rule did not create the pocket (fallen tree + creek ring are
map geography), but it put the scholar in it twice: baseline
never set foot on (5,3) in 30 days. A rule that improves trips
while stranding the scholar into deaths is worse than neutral,
and that is exactly what the prereg's secondary was written to
say — so it says NO-GO.

## Per-seed table

Per seed: trip = successful-trip days, failed = failed-trip days
(>= 1 attempt, 0 successes), share = failed / loopDays, haul =
seed mean daily haul, surv = daysAlive, starv = starvation deaths,
awayS/awayE = away day-starts / day-ends.

| seed | base trip | base failed | base share | base haul | base surv | base starv | base awayS/E | armed trip | armed failed | armed share | armed haul | armed surv | armed starv | armed awayS/E |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 60201 | 11 | 17 | 0.567 | 283.5 | 30 | 0 | 0/0 | 27 | 1 | 0.033 | 814.7 | 30 | 0 | 0/0 |
| 60202 | 18 | 9 | 0.310 | 1090.0 | 29 | 2 | 0/0 | 27 | 1 | 0.033 | 1049.7 | 30 | 0 | 0/0 |
| 60203 | 10 | 18 | 0.600 | 153.0 | 30 | 0 | 0/0 | 28 | 0 | 0.000 | 366.7 | 30 | 0 | 0/0 |
| 60204 | 18 | 10 | 0.333 | 1629.8 | 30 | 0 | 0/0 | 27 | 1 | 0.033 | 1277.7 | 30 | 0 | 0/0 |
| 60205 | 14 | 14 | 0.467 | 421.3 | 30 | 0 | 2/3 | 25 | 3 | 0.100 | 1523.8 | 30 | 0 | 0/0 |
| 60206 | 20 | 8 | 0.267 | 588.0 | 30 | 0 | 0/0 | 24 | 4 | 0.133 | 854.1 | 30 | 0 | 0/0 |
| 60207 | 9 | 19 | 0.633 | 147.0 | 30 | 0 | 0/0 | 15 | 3 | 0.100 | 85.1 | 30 | 1 | 17/19 |
| 60208 | 19 | 8 | 0.267 | 183.3 | 30 | 0 | 4/5 | 27 | 1 | 0.033 | 608.8 | 30 | 0 | 0/0 |
| 60209 | 16 | 12 | 0.400 | 411.2 | 30 | 0 | 0/0 | 21 | 7 | 0.233 | 778.0 | 30 | 0 | 0/0 |
| 60210 | 13 | 15 | 0.500 | 434.0 | 30 | 0 | 0/0 | 27 | 1 | 0.033 | 624.0 | 30 | 0 | 0/0 |
| 60211 | 10 | 18 | 0.600 | 952.1 | 30 | 0 | 0/0 | 27 | 1 | 0.033 | 1637.7 | 30 | 0 | 0/0 |
| 60212 | 16 | 12 | 0.400 | 343.3 | 30 | 0 | 0/0 | 24 | 4 | 0.133 | 322.5 | 30 | 0 | 0/0 |
| BAND | 174 | 160 | 0.446 | 553.0 | 30 med | 2 | 6/8 | 299 | 27 | 0.075 | 828.6 | 30 med | 1 | 17/19 |

Every seed improves on share (12/12); no seed worsens on BOTH
pair legs, so there are ZERO 60126-class divergences on this
band (watch item: clean). Four seeds lose haul while improving
share — 60202 (1090.0 -> 1049.7), 60204 (1629.8 -> 1277.7),
60207 (147.0 -> 85.1), 60212 (343.3 -> 322.5) — the pilot's
reliable-small-vs-big-lottery trade in milder form, but none is
a both-legs divergence and none changes the verdict. Baseline
away day-ends (8) come only from 60205 (3) and 60208 (5); armed
away day-ends (19) come only from 60207. The secondary failure
is a single-seed failure, not a band-wide drift — which is why
it is a veto, not a reason to distrust the pair.

## The 60207 anatomy (the seed that vetoes)

Baseline 60207 (30 days): scholar starts and ends every day at
the haven (4,4); every day is the identical circuit
(4,4)->(4,3)->(3,4)->(5,4)->(4,4); 84 attempts, all on
(4,3)/(3,4)/(5,4), nearly all worked_out failures; 9
successful-trip days, haul 147.0, 0 away days, 0 starvation
deaths, 4 monster deaths (all villager combat / expedition).
The baseline scholar is stuck in a different sense: a rut, not
a pocket — grinding empty windows near home, always home.

Armed 60207 (30 days): 22 attempts, 15 successful-trip days,
haul 85.1, 1 starvation death, 1 dehydration death (texture,
not counted in the starvation bar), 11 live returns (vs 28
baseline), 145 penalized menus (rule engaged).
- STRETCH 1 (days 5-13, 9 away day-ends): day 5 the scholar
  travels (4,4)->(5,3), forages successfully, then tries
  (5,3)->(4,4) home — BLOCKED, fallen_tree ("A fallen tree
  blocks the path."). Day 6 it wanders (5,3)->(6,3)->(6,2) and
  tries home via (7,3) and (5,3) — BLOCKED, creek. Days 7-8 it
  forages successfully at (6,2)/(6,1)/(6,3) but never gets
  home; days 9, 12, 13 every homeward attempt is refused
  (creek, rubble). Day 13: "The pantry is in the hall. Your
  hands are not."; "You wake stiff and half-frozen... Sleeping
  unsheltered in a cold snap is a mistake you only make
  once."; "Amelia Knight is dead — starvation." Day 14 starts
  at the haven.
- STRETCH 2 (days 18-27, 10 away day-ends): day 18 repeats the
  trigger exactly — (4,4)->(5,3), successful forage, then
  (5,3)->(4,4) BLOCKED, fallen_tree. Day 19 the scholar moves
  within the pocket ((5,3)->(7,3), back to (5,3)) but cannot
  leave it. Days 20-26: ZERO forage attempts; each day the
  scholar tries 3-4 routes home — (4,4) fallen_tree, (4,2) /
  (6,1) / (3,2) / (5,5) creek — all refused, and stays at
  (5,3). Day 27: "Zoey Cao is dead — dehydration." followed
  by "You're someone else now". Day 28 starts at the haven.
- The pocket: (5,3) with the haven route blocked by a fallen
  tree and every alternative a creek that refuses without a
  bridge or a swim. The scholar can move inside the pocket
  (day 19) but not out of it. The rule did not fell the tree
  or dig the creek; it sent the scholar onto (5,3) twice,
  ground the baseline leg never visited in 30 days.
- Cost-bar honesty: the starvation bar passes numerically
  (armed 1 <= baseline 2 + 1), but the two counts are
  different kinds of death — baseline's 2 are end-of-collapse
  village deaths on 60202 (days 28-29, victor_lopez and
  ella_johnson, player:false, village-lost day 29), while
  armed's 1 is a mid-run player-character death inside the
  pocket. The bar counts deaths; the secondary judges shape.
  That division of labor is why both exist.

## Engagement and mechanism (the pair's fingerprint, again)

Armed band totals: 378 forage attempts (vs 846 baseline),
2,282 penalized menus, 8,307 empty-window tiles demoted, 299
successful-trip days (vs 174). First-attempt successes jump
32 -> 276; later-try attempts collapse 512 -> 52. The
prereg's engagement floor is far exceeded (2,282 >> 10), so
the NO-GO is a verdict on an engaged rule, not an
engagement artifact — the rule fired massively AND stranded
60207. Prediction accuracy stays 100% on both legs
(baseline 795/795, armed 302/302 compared travels). The
mechanism is the pilot's mechanism with the pilot's cost
attached: trips end on try 1, on farther-afield paying ground
— and farther-afield ground can be a pocket.

## Predictor census on the confirm band (the signal still holds)

Pre-sweep entry-window harvest bucket vs attempt success, pooled:

| bucket (entry-window harvest) | baseline attempts | baseline successes | baseline rate | armed attempts | armed successes | armed rate |
|---|---|---|---|---|---|---|
| 0 (empty window) | 664 | 0 | 0.000 | 51 | 0 | 0.000 |
| 1-2 | 141 | 133 | 0.943 | 277 | 256 | 0.924 |
| 3+ | 41 | 41 | 1.000 | 50 | 43 | 0.860 |
| null (no window) | 0 | — | — | 0 | — | — |

The empty-window identity holds perfectly on a second fresh
band (715 empty-window attempts, 0 successes, both legs).
Non-empty-window failures: baseline 8 (6 pack-full + 2 other),
armed 28 (27 pack-full + 1: 60207 day 16, nothing_in_reach
with window 2 — the single non-pack-full exception, reported
not smoothed over). Failure reasons, baseline -> armed:
worked_out 640 -> 48, nothing_in_reach 26 -> 4, pack_full
6 -> 27. The pack-full ceiling (pilot watch item) grows
again: success fills the bag, and the bag is now the largest
remaining failure mode on the armed leg — but pack-full did
not cause this NO-GO; stranding did.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Slice: armed 60207 days 5-28 (extract in the corpus file
60207-armed-away.txt; full armed say lines in the confirm
jsonl), plus band-wide regex scans:

- The forage voice reads as a person, not a grid march, as at
  pilot. Nothing robotic in the forage lines.
- The rotation choice is narratively INVISIBLE, as at pilot:
  the band-wide scan for entry-window choice language returns
  only unrelated lines ("You step into the Haven hall",
  "they step into the circle" — 34 hits, zero about choosing
  ground). Nothing marks why (5,3) was chosen over the
  near-home tiles.
- The stranded STATE is unmarked, but its refusals are voiced:
  zero lines say "can't get home" / "stuck" / "stranded" (the
  12 regex hits are trapped-animal food lines, unrelated).
  What the player DOES see, repeatedly: "A fallen tree blocks
  the path." (14 in the band) and "The creek runs fast here —
  no crossing without a bridge or a swim." (164 in the band,
  including routine creek encounters elsewhere; on 60207 the
  refusals are the failed homeward attempts themselves). The
  consequences are voiced too: "The pantry is in the hall.
  Your hands are not." (day 13), the unsheltered-sleep line
  (day 13), STARVING warnings, "Amelia Knight is dead —
  starvation." (day 13), "Zoey Cao is dead — dehydration."
  and "You're someone else now" (day 27). So this band refines
  the pilot's invisibility finding: the player sees every
  refusal and every consequence, but no line ever names the
  state — days away from home with no way back — that connects
  them. The pilot called stranding "unmarked"; the precise
  version is refusals-visible, state-unmarked.
- This run ADDS NO NARRATION, per its task — visibility is
  reported only.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table /
wins: no seed can reach national in 30 days, and none does on
either arm. In-window: driver collapses baseline 1 (60202
village-lost day 29) / armed 0; median survival 30/30; wave
reach max 2 both arms (driver); waves 3-5 not reached
(expected — early window). National 0, table 0, wins 0 IN THIS
WINDOW ONLY — not a wall movement claim. Combined panel (§15,
separate substrate, context only): see
sim-entrywindow-confirm-b-panel-summary.md.

## Balanced panel (section 15)

Pre-declared combined panel (both policies, same seeds/days,
one campaign). Panel invocation, validity (sourcesStable true,
neutrality matched on both policies, zero warnings), and counts
are in sim-entrywindow-confirm-b-panel-summary.md; raw panel
retained as sim-entrywindow-confirm-b-panel.json.gz (24 cases,
0 reused). Panel numbers are context, never verdict: the panel
runs its own substrate and its survival/death definitions
differ from the driver's judged cost bar — proven here by
disagreement: the panel's one armed non-survival is 60202
village-lost at gameDay 20, while the judged driver has armed
60202 surviving all 30 days (and baseline 60202 collapsing on
the driver). Panel context: 12/12 survived baseline, 11/12
armed, won 0, national 0, table 0, maxRank village, maxArc 3,
waveReach 1-3 baseline (4× wave 1, 7× wave 2, 1× wave 3) /
1-2 armed (3× wave 1, 9× wave 2), vests 0 — no wall movement
shown or claimed.

## Caveats and attribution limits (honest, per prereg)

- SINGLE policy pair (competent vs its entry-window
  variant), 30-day early window, gate-off substrate only.
  Other policies, later windows, and gate-ON play may shape
  differently — in particular, gate-ON returns would change
  away-day shapes, and longer trips change the chain
  approximation's weight.
- THE VETO IS SINGLE-SEED, AND THAT IS THE POINT: 11/12
  seeds show no away days at all on either leg; the band
  secondary fails because of 60207 alone. A band-pooled
  away metric would still fail (19 > 13), and the per-seed
  veto fires on the same seed. This is not a borderline
  pooled wobble: 19 away day-ends, two stretches, two
  player-character deaths.
- ATTRIBUTION IS RULE × GEOGRAPHY, NOT RULE ALONE: the
  pocket (fallen tree + creek ring) is map geography the
  rule did not create, and the rule's demotion cannot itself
  cause a failed attempt (every empty-window attempt failed
  on both legs). What the rule caused is EXPOSURE: it moved
  the scholar off the near-home circuit onto farther-afield
  paying ground, and on this map draw that ground was a
  pocket with no way home. Any follow-up that only tunes
  the ranking (yield-aware, walked-through) without checking
  the way home would re-expose the scholar to the same
  pocket. The next variant must be pocket-aware: never end a
  trip on a tile whose route home is blocked, or never rank
  a tile above a tile with a known-open way home — the
  exact gate is the next arm's prereg to freeze, not this
  run's to invent after seeing the result.
- THE BASELINE RUT IS REAL TOO: baseline 60207 grinds the
  same three tiles for 30 days (84 attempts, 9 successes,
  haul 147.0) and never leaves home. The armed leg's rut is
  worse (a pocket with deaths), but the baseline's rut is
  the reason the rule looked so good on share: the rule
  breaks ruts by ranging farther, and ranging farther has a
  tail risk this band finally priced.
- POOLED VS MEAN-OF-MEANS: the prereg judges the
  mean-of-means (band haul +275.6); the pooled figure moves
  the same way (baseline 359 loopDays vs armed 360, one
  collapse-shortened seed, so weighting differs trivially).
- No metric, threshold, seed, or rule was changed mid-run.
  The prereg and the confirm test were committed (bab5384f4)
  BEFORE any judged sim; the proof tests (existing pure
  14/14, new confirm pure 14/14, live-control + live-det on
  non-judged seed 60109) were re-run after that commit and
  before the confirm sims; the confirm (60201-60212) ran
  only after that commit landed.

## Metric review (for the NEXT run; this run judged against its header)

- THE SECONDARY EARNED ITS KEEP A SECOND TIME — and this
  time it vetoes: at pilot the away metric certified an
  improvement (30 -> 17); at confirm it catches the exact
  harm it was built for (8 -> 19, one 60108-shaped seed).
  A haul-and-share pair alone would have CONFIRMED this
  rule today (delta -0.371, +275.6) and shipped a
  stranding rule. The pair + secondary template must stay
  fused on future rotation arms: never judge a ranking rule
  on trips and haul without away days and the per-seed
  shape test.
- THE PAIR DID NOT FAIL — IT WAS OVERRIDDEN BY DESIGN: the
  pair passing while the arm fails is the system working,
  not a metric dispute. No threshold revision is proposed
  for the pair; the revision belongs to the RULE (pocket
  awareness), not to the judge.
- THE 60108 SHAPE GENERALIZES: fertrot's 60108 (reshuffle
  strands the scholar west of a washed-out creek) and
  confirm's 60207 (rotation sends the scholar into a
  fallen-tree/creek pocket) are the same shape with
  different geography — a ranking rule changes where the
  scholar ends the day, and blocked geography does the
  rest. Future rotation preregs should pre-register the
  pocket check explicitly: per-seed away stretches with
  their trigger tile and blocking types, not just totals.
- PACK-FULL STILL NEEDS A METRIC HOME (pilot metric review,
  unanswered): pack-full failures went 6 -> 27 as success
  rose, and are again the largest remaining failure mode on
  the armed leg. The next arm on this axis should
  pre-register pack-full failure share (or pack-headroom at
  trip end) as a secondary — it did not decide this run,
  but it will decide the next one if a pocket-aware variant
  also fills the bag faster.
- PER-SEED REPORTING CAUGHT WHAT THE BAND HID, TWICE OVER:
  band-pooled GO hid 60126's loss at pilot; band-pooled
  pair-pass hides 60207's veto at confirm. The per-seed
  table is not decoration — on this axis it is the verdict.
- THE BASELINE RUT DESERVES ITS OWN NOTE: baseline 60207's
  30-day identical circuit (same three tiles, same failures)
  is robotic in a way the sense test's forage-voice read
  does not capture — the voice is human, the itinerary is
  a loop. A future arm could judge itinerary variety
  (distinct tiles worked per trip) as a diagnostic; the
  rule that breaks the rut must not break the way home.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it)
and does not append to sim-findings.md directly. The lines
below are in backlog format for the coordinator to append
verbatim if it wants them:

- [open] 2026-11-01 — food-economy / scholar supply — entry-window rotation does NOT confirm: on 12 fresh seeds (60201-60212, 30d competent, DEPOSITGATE=0) the pair still passes with margin (failed-trip share 0.446 -> 0.075, haul 553.0 -> 828.6, costs clean) but the stranding secondary vetoes — away day-ends 8 -> 19 (bar <= 13) on a single 60108-shaped seed, 60207 (armed 19, baseline 0, starvation death), where the scholar is pocketed twice behind a fallen tree + creek ring and two player characters die away (Amelia Knight starvation day 13, Zoey Cao dehydration day 27) — CONFIRM NO-GO, rule must not land as-is (sim-entrywindow-confirm-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — next entry-window variant must be pocket-aware: a ranking rule must not end a trip on a tile whose route home is blocked (60207: (5,3) with haven route fallen-tree-blocked, alternatives creek-refused, days 20-26 zero forages while trying blocked routes home) — yield-aware ranking alone would not have saved 60207 (sim-entrywindow-confirm-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — pack-full ceiling grows again at confirm: armed pack-full failures 6 -> 27 (27 of 28 non-empty-window armed failures), the largest remaining failure mode once the ground signal is fixed — pre-register pack-full share as a secondary on the next arm (sim-entrywindow-confirm-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — stranding visibility refined at confirm: refusals are voiced per attempt ("A fallen tree blocks the path.", "The creek runs fast here — no crossing without a bridge or a swim.") and consequences are voiced (pantry-hands line, unsheltered-sleep line, death + succession lines), but no line ever names the stranded state and the rotation choice stays invisible — refusals-visible, state-unmarked (sim-entrywindow-confirm-b evidence).

## Next lever candidate (or why there is none)

No confirm re-run: the band is spent (60201-60212 are now used
seeds) and the veto is single-seed-structural, not noise — a
re-roll would be metric shopping. Candidates AFTER this NO-GO,
in evidence order (each needs its own prereg; none is claimed
GO by this arm):

1. POCKET-AWARE entry-window variant (this arm's veto): the
   frozen rule PLUS a way-home check — e.g. a tile whose
   route home from the scholar's position is blocked does
   not get ranked as a trip target, or trip-end on such a
   tile is refused. Judge with the same pair + costs + away
   secondary + a per-seed pocket-stretch table (trigger
   tile, blocking types). This is the only candidate that
   answers the veto directly.
2. PACK-CAPACITY / TRIP-TIMING arm (pilot + confirm metric
   reviews): pack-full share as a pre-registered secondary;
   the bag, not the ground, is now the binding constraint.
3. YIELD-AWARE entry-window variant (pilot 60126 divergence,
   confirm haul-down seeds 60202/60204/60207/60212): rank by
   window harvest count, not just empty/non-empty — AFTER
   (1), since yield-awareness alone does not check the way
   home.

## Infrastructure (loud, per task)

- SAFE-COMMIT INDEX CLOBBER (known class) hit the prereg
  commit again: after bab5384f4 the main index showed staged
  deletions plus untracked copies of the same files. The
  commit itself verified correct (2 files, 325 insertions).
  Repaired via git update-index --add --cacheinfo from HEAD
  blobs per file; verified git status --short empty + git
  diff HEAD empty + git diff --cached empty after repair.
  The evidence commit below must be checked the same way
  before the worker reports done.
- NO EPERM FLAP this run: no commit or file write was
  denied at any point. The panel run completed on first
  attempt (24 cases, 0 reused, no retries).
- Sibling trees untouched (Loop A sim-musterroster-adopt-a,
  sim-heraldsteer-adopt-a never listed, read, or written).
  Main tree at ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-entrywindow-confirm-b.js: pure 14/14 green
(frozen-rule identity, analyzer GO/NO-GO boundaries, confirm
judge incl. 60108 veto + divergence-as-watch-only, band
60201-60212 disjointness + prereg naming). scripts/
test-entrywindow-b.js: pure 14/14 green; --live-control on
NON-JUDGED seed 60109 green (30 loopDays, 49 forages,
predictedCompared 46, matched 46, survived — identical
counts to the pilot's live-control); --live-det on 60109
green (identical census across two runs). All proof runs
executed after the prereg commit (bab5384f4), before the
confirm sims — and re-run in that order, not merely before
the census.

## Files

- Prereg: evidence/2026-11-01/sim-entrywindow-confirm-b-prereg.md
  (commit bab5384f4, BEFORE any judged sim)
- Confirm test: scripts/test-entrywindow-confirm-b.js
  (commit bab5384f4; pure 14/14)
- Policy (reused verbatim, read-only, no commit):
  scripts/policies/competent-entrywindow-b.js
- Instrument (reused verbatim): scripts/entrywindow-b-driver.js,
  scripts/analyze-entrywindow-b.js
- Confirm corpora: evidence/2026-11-01/sim-entrywindow-confirm-b-baseline.jsonl
  (12 lines), sim-entrywindow-confirm-b-armed.jsonl (12 lines),
  sim-entrywindow-confirm-b-analysis.json (analyzer summary + full
  per-seed tables), sim-entrywindow-confirm-b-baseline.log,
  sim-entrywindow-confirm-b-armed.log,
  sim-entrywindow-confirm-b-analysis.log
- Panel: evidence/2026-11-01/sim-entrywindow-confirm-b-panel.json.gz,
  sim-entrywindow-confirm-b-panel-summary.md
- Corpus extract: evidence/2026-11-01/sim-entrywindow-confirm-b-corpus/
  60207-armed-away.txt
- Evidence: evidence/2026-11-01/sim-entrywindow-confirm-b.md (this file)
