# sim-entrywindow-b — ENTRY-WINDOW ROTATION vs the haul ceiling's failed-trip shape

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-entrywindow-b. Worktree sim-entrywindow-b, branch
sim-entrywindow-b. The entry-window follow-up to sim-fertrot-b
(PILOT NO-GO 2030Z): whole-tile counts do not predict sweep
success, because one sweep tests only the 3x3 window around
the scholar's entry cell. Policy-side ONLY: NEW policy file
scripts/policies/competent-entrywindow-b.js, default OFF, zero
src/js changes, zero edits to scripts/policies/competent.js,
plus one additive panel-registry line in
scripts/sweep-compare.js. Fertrot fertility NOT bundled,
patchrot rotation NOT bundled, route gates NOT bundled,
multi-sweep NOT bundled — this arm is the entry-window
signal alone. This worker does NOT push, bump, verify live,
or merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Verdict: PILOT GO — the pair passes on both legs with margin, and every cost bar passes

Prereg: evidence/2026-11-01/sim-entrywindow-b-prereg.md (commit
127ce4bd1, BEFORE any judged sim). Judged exactly against the
prereg's divergence-aware pair + cost bars + secondary away
metric, 30d competent, DEPOSITGATE=0, identical seeds both
arms (pilot 60121-60128; freshness verified by all-evidence
seed-field scans in both spellings before the pilot — see the
prereg's seed-band note: the .md mentions of 60121-60132 are
fertrot's confirm-reserve mentions only, never runs, and the
field scans returned zero hits):

| Leg | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| (a) failed-trip day share, pooled | 0.258 (62/240 days) | 0.058 (14/240 days) | armed <= baseline - 0.10 | PASS, delta -0.200 |
| (b) mean daily haul, band mean of seed means | 633.7 kcal | 967.9 kcal | armed >= baseline | PASS, delta +334.2 |
| Cost: median survival | 30 | 30 (ratio 1.0) | >= 0.8x | clean |
| Cost: starvation deaths | 2 | 0 (delta -2) | <= baseline + 1 | clean |
| Secondary: away day-ends, band total | 30 | 17 | <= baseline + 5, no 60108-shaped seed | clean |
| Engagement floor (interpretability) | — | 1,291 penalized menus, 3,627 empty-window tiles | >= 10 adjustments | ENGAGED |

PILOT GO: both pair legs pass with margin (the share bar is
beaten twofold, haul rises by half), both cost bars pass, the
secondary away metric improves rather than worsens, and the
rule engaged massively — so this is a real GO on a live
signal, not an engagement artifact. NO re-score was needed or
taken: finished-pack (1,037.1 baseline vs 983.7 armed) and
unload (73,800 baseline vs 77,330 armed) are diagnostics only
and are reported as such; the finished-pack dip does not
rescue or sink anything, because the pair already passes
without it. Next step per the prereg: CONFIRM on 12 fresh
seeds (band TBD by a fresh scan at confirm time — the prereg
deliberately pre-claims no confirm band, since 60129-60132 is
only 4 seeds).

## The answer in one paragraph

The entry window is the signal fertrot was looking for, and
it is essentially deterministic: on the census band, a sweep
whose entry window held zero harvestable cells NEVER paid
(344/344 failed), and a sweep whose window held at least one
ALWAYS paid (142/142 succeeded) — the only exceptions anywhere
in either band are pack-full refusals, where the ground pays
but the bag cannot take it. Ranking by that window — demoting
only worked tiles whose from-here entry window is empty, with
no bonus for paying tiles — cuts failed trips from roughly
one day in four to roughly one day in seventeen, and lifts
mean daily haul by a third, because trips now succeed on the
first try (first-attempt successes 59 -> 187) instead of
burning all three tries on worked-out entry windows. It also
removes both baseline starvation deaths and IMPROVES the
stranding shape fertrot warned about (away day-ends 30 -> 17;
the worst baseline seed, 60128, goes from 15 away day-ends to
5 and from 13 live returns to 23). The one honest cost is
visible in the same numbers: success fills the pack, so
pack-full failures rise 2 -> 16, and one seed (60126) trades
a big-yield lottery for reliable small windows and loses haul
on that seed (609.7 -> 235.2) even as the band gains. The rule
is a GO, not a panacea: it fixes the empty-window failure
mode completely and exposes pack capacity as the next blank.

## Stage 1 — knowability (the finding the task ordered first)

KNOWABLE, with two qualifications — full code-path account in
the prereg, summarized here. The entry cell for a trip's first
candidate is a pure function of (current tile, current micro
cell, destination, destination detail), all readable at the
travelTargets call: travelTo computes the entry from the
travel direction sign plus the scholar's current micro cell,
then findWalkableEntry's deterministic BFS (no RNG; genDetail
is detailSeed/detailRand-seeded and returns the cache for
visited tiles). Verified empirically by the census instrument:
predicted entry == actual entry on 457/457 compared forage
travels in the census band, 457/457 on the pilot baseline
leg, and 205/205 on the pilot armed leg; sweep micro cell ==
travel entry cell on 486/486 census attempts. QUALIFICATION 1
(chain): candidates 2-3 enter from the previous candidate's
tile, so the menu ranking carries the from-current-position
window — exact for try 1, an approximation for tries 2-3.
The pilot is the test of that approximation, and it passes:
later-try attempts collapse 266 -> 42 because trips now end
on try 1. QUALIFICATION 2 (first-visit): tiles with no detail
at menu time have no honestly computable window (genDetail's
first visit strips cells and mutates stock — a side effect,
not a read), so they are left alone; census bound: 29/486
attempts were first-visit travels, 14 of them failures, so a
visited-only rule could at most prevent 330 of 344 failures.
The pilot's armed leg still shows 40 empty-window attempts —
the residual failure mode is first-visit ground, chain
approximation, and scorch (the rule counts scorched cells as
harvestable; see the prereg's caveat 1), not a broken signal.

## Pilot census (30d competent, DEPOSITGATE=0)

Per seed: trip = successful-trip days, failed = failed-trip days
(>= 1 attempt, 0 successes), share = failed / 30 loopDays.

| seed | base trip | base failed | base share | base haul | armed trip | armed failed | armed share | armed haul |
|---|---|---|---|---|---|---|---|---|
| 60121 | 20 | 8 | 0.267 | 267.8 | 25 | 3 | 0.100 | 999.5 |
| 60122 | 18 | 9 | 0.300 | 635.3 | 24 | 1 | 0.033 | 1537.6 |
| 60123 | 10 | 18 | 0.600 | 613.2 | 27 | 1 | 0.033 | 1667.7 |
| 60124 | 21 | 7 | 0.233 | 947.8 | 28 | 0 | 0.000 | 1011.7 |
| 60125 | 25 | 3 | 0.100 | 990.1 | 24 | 3 | 0.100 | 989.2 |
| 60126 | 26 | 2 | 0.067 | 609.7 | 23 | 3 | 0.100 | 235.2 |
| 60127 | 19 | 9 | 0.300 | 523.8 | 27 | 1 | 0.033 | 523.8 |
| 60128 | 22 | 6 | 0.200 | 482.2 | 26 | 2 | 0.067 | 778.5 |
| BAND | 161 | 62 | 0.258 | 633.7 | 204 | 14 | 0.058 | 967.9 |

Seven of eight seeds improve or hold on share; 60126 is the
exception on both legs (share 0.067 -> 0.100, haul 609.7 ->
235.2 — see "The 60126 divergence" below). 60127's mean haul
ties at 523.8 to one decimal while its daily distribution
differs — a rounding-level tie, not byte-identity. Wave reach
max 2 both arms; collapses 0 both arms; 8/8 survived 30
loopDays both arms.

## Engagement: the rule fired, and trips ended early

Armed band totals: 260 forage attempts (vs 489 baseline —
trips end on try 1 now), 1,291 penalized menus, 3,627
empty-window tiles demoted, 204 successful-trip days (vs 161).
First-attempt successes jump 59 -> 187; later-try attempts
collapse 266 -> 42. The prereg's engagement floor is far
exceeded (1,291 >> 10), so the pilot is interpretable and
the GO stands as a signal verdict. Prediction accuracy on
the armed leg stays 100% (205/205 compared travels) — the
chain approximation affects which tile is ranked, not whether
the entry computation itself is right.

## Predictor census on the pilot band (does the signal hold off-census?)

Pre-sweep entry-window harvest bucket vs attempt success, pooled:

| bucket (entry-window harvest) | baseline attempts | baseline successes | baseline rate | armed attempts | armed successes | armed rate |
|---|---|---|---|---|---|---|
| 0 (empty window) | 325 | 0 | 0.000 | 40 | 0 | 0.000 |
| 1-2 | 114 | 112 | 0.982 | 156 | 145 | 0.929 |
| 3+ | 50 | 49 | 0.980 | 64 | 59 | 0.922 |
| null (no window) | 0 | — | — | 0 | — | — |

The empty-window identity holds perfectly on both legs of a
fresh band (365 empty-window attempts, 0 successes). The
non-empty rate is no longer literally 1.000 off-census —
baseline 3 failures and armed 16 failures with a non-empty
window — and EVERY armed non-empty-window failure is a
pack-full refusal (16/16), with 2 pack-full failures on the
baseline leg as well. The ground signal is still perfect;
the bag is now the binding constraint. Failure reasons,
baseline -> armed: worked_out 323 -> 36, nothing_in_reach
3 -> 4, pack_full 2 -> 16.

## The 60126 divergence (the seed to watch in confirm)

Armed 60126 is the only seed that worsens on both legs, and
the mechanism is the trip-ends-at-first-success rule, not a
bug: baseline 60126 fails its first try twice, then lands
big-yield tiles on later tries (day hauls spike to 1,040);
armed 60126 succeeds on the first try on reliable small
windows and the trip ENDS — it never reaches the big tiles
(day hauls sit at 150-650). The rule trades success
certainty for yield size, and on this seed the trade loses
(-374.5 haul). Pack-full is NOT the cause here (0 pack-full
failures on armed 60126). Confirm must report 60126-type
seeds per-seed, not just band-pooled: if confirm shows a
class of seeds where reliable-small beats big-lottery
consistently, the follow-up is a yield-aware variant (rank
by window harvest count, not just empty/non-empty), not a
revert of the empty-window demotion — the demotion itself
never causes a failure on any seed in either band (every
empty-window attempt in the pilot failed, on both legs).

## The 60128 story: the anti-60108 (stranding improves)

Fertrot's harm case was a rule that stranded the scholar.
This rule does the opposite on the pilot's worst baseline
seed. Baseline 60128: 14 day-start / 15 day-end away days
(away from loopDay 16 through 30), 13 live returns.
Armed 60128: 4 day-start / 5 day-end away days (loopDays
18-22 only), 23 live returns, haul 482.2 -> 778.5, failed
share 0.200 -> 0.067. Band away day-ends fall 30 -> 17 and
away day-starts 27 -> 12. No seed shows the 60108 shape
(armed away day-ends >= 10 with baseline 0, plus starvation);
the baseline starvation deaths (60121 day 8, scholar's own
character; 60123 day 17, scholar's own character) both
disappear on the armed leg (0 starvation deaths band-wide).
Transcript extract in the corpus file
60128-armed-away.txt.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Armed 60128 loopDays 17-23 plus a loopDay 3 success (extract
in the corpus file 60128-armed-away.txt; full armed say lines
in the pilot jsonl):

- The lines read as a person, not a grid march: a successful
  sweep ("Unfamiliar unknown shoots — into the bag.
  (Unknowns lump together; sort them at camp.)"), journal
  beats, and worked-out refusals in the same honest voice as
  fertrot's band. Nothing robotic in the forage voice.
- The rotation choice is narratively INVISIBLE: zero lines
  in the armed band mark choosing ground by its entry window
  (a regex scan for entry/window/fertile/lush-choice returns
  only unrelated game lines — System interface windows, trial
  windows, journal entries, a storm's foraging time-window).
  Same invisibility class as patchrot rotation and fertrot
  fertility — behaviorally real, narratively unmarked.
- Stranding is likewise unmarked: zero lines say "can't get
  home" or "stuck" anywhere in the armed band, on any seed —
  including baseline-stranded 60128's armed run, where the
  scholar spends loopDays 18-22 away. The improvement in away
  days is therefore also invisible to the player; the trip
  simply comes home sooner, with no line saying why.
- This arm ADDS NO NARRATION, per its task — visibility is
  reported only. A future narration arm could mark either the
  choice ("this patch is picked clean where I'd step in —
  try the next ground") or the homecoming, but that is a
  separate arm's work, not a condition on this GO.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table /
wins: no seed can reach national in 30 days, and none does on
either arm. In-window: 8/8 survived 30 loopDays both arms
(median survival 30, max 30, collapses 0); wave reach max 2
both arms; waves 3-5 not reached (expected — early window).
National 0, table 0, wins 0 IN THIS WINDOW ONLY — not a wall
movement claim. Combined panel (§15, separate substrate,
context only): see sim-entrywindow-b-panel-summary.md.

## Balanced panel (section 15)

Pre-declared combined panel (both policies, same seeds/days,
one campaign) — the multisweep lesson applied, not re-learned.
Panel invocation, validity (sourcesStable true, neutrality
matched on both policies, zero warnings), and counts are in
sim-entrywindow-b-panel-summary.md; raw panel retained as
sim-entrywindow-b-panel.json.gz (16 cases, 0 reused). Panel
numbers are context, never verdict: the panel runs its own
substrate and its survival/death definitions differ from the
driver's judged cost bar. Panel context: 8/8 survived both
arms, won 0, national 0, table 0, maxRank village, maxArc 3,
waveReach 1-2 both arms (baseline 4× wave 1 / 4× wave 2, armed
2× wave 1 / 6× wave 2 — a context-only tilt on 16 cases),
vests 0 both arms — no wall movement shown or claimed.

## Caveats and attribution limits (honest, per prereg)

- SINGLE policy pair (competent vs its entry-window
  variant), 30-day early window, gate-off substrate only.
  Other policies, later windows, and gate-ON play may shape
  differently — in particular, gate-ON returns would change
  away-day shapes, and the chain approximation (from-origin
  window for tries 2-3) matters more on longer trips.
- THE RULE DEMOTES ONLY CERTAIN FAILURES: every
  empty-window attempt failed on both pilot legs (365/365),
  so the demotion cannot itself cause a failed attempt — but
  it CAN change which paying tile a trip lands on, and on
  60126 that trade lost haul. The GO is a verdict on this
  frozen rule (empty-window +99, no bonus, visited-only),
  not on yield-aware variants, which are future work.
- PACK-FULL IS THE NEW BINDING CONSTRAINT: armed
  non-empty-window failures are 16/16 pack-full. A follow-up
  arm on pack capacity / trip timing would now move the
  failure share more than any further ground signal — but
  that is a separate arm, not a condition on this GO.
- SCORCH CAVEAT (prereg caveat 1): the rule counts scorched
  cells as harvestable (cellScorched is origin-relative at
  menu time). The census predictor excluded scorch and
  separated perfectly; the pilot's armed leg still shows 40
  empty-window attempts (first-visit, chain, and scorch
  cases combined), so the caveat costs tries, not direction.
- POOLED VS MEAN-OF-MEANS: the prereg judges the
  mean-of-means (band haul +334.2); the pooled figure is not
  printed by the analyzer but is computable from the per-seed
  day rows in the analysis JSON, and it moves the same way
  (all seeds run 30 days, so pooled and mean-of-means differ
  only by seed weighting, which is flat here).
- No metric, threshold, seed, or rule was changed mid-run.
  The prereg, policy, driver, analyzer, proof test, registry
  line, and census outputs were committed (127ce4bd1) BEFORE
  any judged sim; the proof test (pure 14/14, live-control,
  live-det on non-judged seed 60109) was re-run after that
  commit and before the pilot; the pilot (60121-60128) ran
  only after that commit landed.

## Metric review (for the NEXT run; this run judged against its header)

- THE PAIR DID ITS JOB A FOURTH TIME — and this time it
  PASSES: share-down + haul-up + costs clean + away-days
  down is an unambiguous GO with no re-scoring temptation.
  The pair template (patchrot, routeblock, fertrot, now
  entrywindow) keeps catching exactly the shape it was built
  for, and this time the lever moves trips AND the pantry.
- THE ENGAGEMENT FLOOR WORKED AS DESIGNED: 1,291 penalized
  menus leave no doubt the rule engaged; the floor's job
  here was to certify the GO, not to excuse a NO-GO.
- THE SECONDARY AWAY METRIC EARNED ITS KEEP: promoting away
  day-ends after fertrot's 60108 gave this run a stranding
  verdict instead of a stranding anecdote — and the verdict
  is "improved", which a haul-only pair would have missed
  in the other direction. Keep away day-ends on future
  rotation arms.
- PACK-FULL NEEDS A METRIC HOME: pack-full failures went
  2 -> 16 as success rose, and they are now the ONLY
  non-empty-window failure mode on the armed leg. The next
  arm on this axis should pre-register pack-full failure
  share (or pack-headroom at trip end) as a secondary, so a
  future rule that fills the bag faster is judged on whether
  the food gets home, not just whether the sweep pays.
- PER-SEED REPORTING CAUGHT THE TRADE: band-pooled GO hides
  60126's loss; the per-seed table caught it. Confirm must
  carry a per-seed divergence note (any seed worsening on
  BOTH pair legs gets named), not just the band verdict.
- THE FIRST-TRY SUCCESS MECHANISM IS THE STORY: attempts
  fell 489 -> 260 while successful-trip days rose 161 -> 204
  — the rule's effect is mostly "stop wasting tries", not
  "find more food per try". Future rotation arms should
  report attempts-per-successful-trip as a diagnostic, since
  it is the mechanism's fingerprint.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it)
and does not append to sim-findings.md directly. The lines
below are in backlog format for the coordinator to append
verbatim if it wants them:

- [open] 2026-11-01 — food-economy / scholar supply — entry-window rotation GOES at pilot: a policy demoting only worked tiles whose entry window from the current position holds zero harvestable cells (+99 distance, no bonus, visited-only) cuts pooled failed-trip share 0.258 -> 0.058 and lifts mean daily haul 633.7 -> 967.9 on identical seeds (60121-60128, 30d competent, DEPOSITGATE=0), with median survival 30/30, starvation deaths 2 -> 0, and away day-ends 30 -> 17 — pilot GO, confirm pending on 12 fresh seeds (sim-entrywindow-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — pack-full is the next blank after entry-window rotation: on the armed leg all 16 non-empty-window failures are pack-full refusals (vs 2 baseline), because trips now succeed on try 1 and fill the bag — the ground signal is perfect and the bag binds (sim-entrywindow-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — entry-window rotation is narratively invisible: zero lines in the armed band mark choosing ground by its entry window, and zero lines mark stranding, the same invisibility class as patchrot rotation and fertrot fertility (sim-entrywindow-b evidence).

## Next lever candidate (or why there is none)

Confirm first: 12 fresh seeds (band TBD by fresh scan) under
the same rules; CONFIRM GO requires the same pair + cost
bars + the secondary away metric. If confirm GOES, the arm
lands (coordinator merge; ship loop owns push/bump/live).
Candidates AFTER confirm, in evidence order (each needs its
own prereg; none is claimed GO by this arm):

1. PACK-CAPACITY / TRIP-TIMING arm (this arm's metric
   review): the pack-full failure share (16 armed vs 2
   baseline) is now the largest remaining failure mode on
   this axis — pre-register pack-full share as a secondary.
2. YIELD-AWARE entry-window variant (60126 divergence):
   rank by window harvest COUNT (or expected kcal), not just
   empty/non-empty, so a trip that can reach a big-yield tile
   does not stop at the first small paying window. Judge
   per-seed as well as band-pooled; the empty-window
   demotion itself stays, since it never causes a failure.
3. WALKED-THROUGH tiles variant (prereg caveat 3): extend
   the visited set from foraged-only to any tile the scholar
   has stood on (detail exists, entry was experienced) and
   measure whether first-visit failures (14/344 in the
   census) shrink without breaking perception honesty.

## Infrastructure (loud, per task)

- SAFE-COMMIT INDEX CLOBBER (known class) hit the prereg
  commit again: after 127ce4bd1 the main index showed staged
  deletions plus untracked copies of the same files, and
  sweep-compare.js showed MM. The commit itself verified
  correct (8 files, 84,956 insertions). Repaired via
  git update-index --add --cacheinfo from HEAD blobs per file;
  verified git status --short empty + git diff HEAD empty +
  git diff --cached empty after repair. The pilot commit
  (this evidence + pilot outputs) must be checked the same
  way before the worker reports done.
- NO EPERM FLAP this run: no commit or file write was
  denied at any point (contrast fertrot's ~15-minute flap).
  The panel run completed on first attempt (16 cases, 0
  reused, no retries).
- Sibling trees untouched. Main tree at
  ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-entrywindow-b.js: pure 14/14 green (entry
prediction incl. BFS fallback + null-without-detail,
entry-window counts incl. wood-only/deadfall + scorched +
edge clipping, policy +99/identity + policy/driver count
agreement, analyzer census + ordinal split, compare GO/NO-GO
boundaries). Live modes on NON-JUDGED seed 60109 only:
--live-control green (30 loopDays, 49 forages,
predictedCompared 46, matched 46); --live-det green
(identical census across two runs). Proof runs executed
after the prereg commit (127ce4bd1), before the pilot — and
re-run in that order, not merely before the census.

## Files

- Prereg: evidence/2026-11-01/sim-entrywindow-b-prereg.md
  (commit 127ce4bd1, BEFORE any judged sim)
- Policy: scripts/policies/competent-entrywindow-b.js
  (registry line in scripts/sweep-compare.js)
- Instrument: scripts/entrywindow-b-driver.js,
  scripts/analyze-entrywindow-b.js
- Proof test: scripts/test-entrywindow-b.js (pure 14/14;
  --live-control 60109, --live-det 60109)
- Census (stage 2a, baseline only, fertrot band re-run):
  evidence/2026-11-01/sim-entrywindow-b-census-baseline.jsonl
  (8 lines), sim-entrywindow-b-census-analysis.json
- Pilot census: evidence/2026-11-01/sim-entrywindow-b-pilot-baseline.jsonl
  (8 lines), sim-entrywindow-b-pilot-armed.jsonl (8 lines),
  sim-entrywindow-b-pilot-analysis.json (analyzer summary + full
  per-seed tables)
- Panel: evidence/2026-11-01/sim-entrywindow-b-panel.json.gz,
  sim-entrywindow-b-panel-summary.md
- Corpus extracts: evidence/2026-11-01/sim-entrywindow-b-corpus/
  60128-armed-away.txt
- Evidence: evidence/2026-11-01/sim-entrywindow-b.md (this file)
