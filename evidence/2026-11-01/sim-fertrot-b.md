# sim-fertrot-b — FERTILITY-SIGNAL ROTATION vs the haul ceiling's failed-trip shape

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-fertrot-b.
Worktree sim-fertrot-b, branch sim-fertrot-b. The 1725Z next-blank
(2), first item in evidence order after route-blockage (killed at
pilot 1930Z): the fertility-signal rotation follow-up to
sim-patchrot-b. Policy-side ONLY: NEW policy file
scripts/policies/competent-fertrot-b.js, default OFF, zero src/js
changes, zero edits to scripts/policies/competent.js, plus one
additive panel-registry line in scripts/sweep-compare.js. Patchrot
rotation NOT bundled, route gates NOT bundled, multi-sweep NOT
bundled — this arm is the fertility signal alone. This worker does
NOT push, bump, verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Verdict: PILOT NO-GO — the pair misses on both legs, and a cost bar misses too

Prereg: evidence/2026-11-01/sim-fertrot-b-prereg.md (commit
461f3c997, BEFORE any judged sim). Judged exactly against the
prereg's divergence-aware pair + cost bars, 30d competent,
DEPOSITGATE=0, identical seeds both arms (pilot 60101-60108;
freshness verified by all-evidence seed-field scans in both
spellings before the pilot — see the prereg's seed-band note:
the task's prescribed 52001-52008 band was already consumed by
the routeblock pilot, so this arm took the next verified-clean
band 60101-60108 instead of reusing it):

| Leg | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| (a) failed-trip day share, pooled | 0.342 (82/240 days) | 0.375 (90/240 days) | armed <= baseline - 0.10 | FAIL, delta +0.033 (wrong way) |
| (b) mean daily haul, band mean of seed means | 763.2 kcal | 727.4 kcal | armed >= baseline | FAIL, delta -35.8 |
| Cost: median survival | 30 | 30 (ratio 1.0) | >= 0.8x | clean |
| Cost: starvation deaths | 0 | 2 (delta +2) | <= baseline + 1 | FAIL |
| Engagement floor (interpretability) | — | 1,353 penalized menus, 3,524 fertile bonuses, 17 barren penalties | >= 10 adjustments | ENGAGED (not uninterpretable) |

PILOT NO-GO: the pair requires BOTH legs, and both miss — and
the starvation cost bar misses independently. No confirm spend
— confirm reserve 60121-60132 stays fresh, never run. No
re-score: the finished-pack diagnostic (990.7 baseline vs 957.3
armed) and unload (36,060 baseline vs 55,385 armed) are
reported as diagnostics only and do not rescue the primary, per
the prereg. The rule engaged heavily (see below), so this is a
real NO-GO on a live signal, not a routeblock-style
"no opportunity" absence.

## The answer in one paragraph

The fertility signal is real code but the wrong resolution.
The rule ranks by whole-tile harvestable-cell count (the sweep's
own test, read off ground the scholar worked), and it engages
constantly — 1,353 penalized menus, 3,524 fertile bonuses — yet
failed trips RISE 0.342 -> 0.375 and haul falls 763.2 -> 727.4.
Why: the count is nearly always >= 6 (whole-tile counts run
26-29 on the divergent seed), so the -1 "fertile" bonus fires
on almost every menu and merely reshuffles nearest-first order,
while the +99 "barren" penalty almost never fires (17 times
band-wide). And the reshuffle is not neutral: it is not
predictive at all — 95% of FAILED attempts on both arms happen
on tiles showing 6+ available cells (326/344 baseline, 334/352
armed). A tile can hold 26 harvestable cells and still fail
the sweep, because the sweep works only the 3x3 around the
entry cell, and yesterday's sweep emptied exactly that window.
Whole-tile fertility is blind to WHERE in the tile the cells
are. The signal that would predict success is the ENTRY-WINDOW
cell count (3x3 around the entry cell), not the whole-tile
count — that is the measured census answer, and the next
rotation-shaped arm must rank by it (or prove it cannot be
read honestly at menu time: entry depends on the path taken,
which the menu does not yet know).

## Pilot census (30d competent, DEPOSITGATE=0)

Per seed: trip = successful-trip days, failed = failed-trip days
(>= 1 attempt, 0 successes), share = failed / 30 loopDays.

| seed | base trip | base failed | base share | base haul | armed trip | armed failed | armed share | armed haul |
|---|---|---|---|---|---|---|---|---|
| 60101 | 13 | 15 | 0.500 | 1693.0 | 13 | 15 | 0.500 | 1693.0 |
| 60102 | 25 | 3 | 0.100 | 362.8 | 17 | 11 | 0.367 | 157.2 |
| 60103 | 26 | 2 | 0.067 | 1512.0 | 26 | 2 | 0.067 | 1512.0 |
| 60104 | 10 | 18 | 0.600 | 499.5 | 10 | 18 | 0.600 | 363.3 |
| 60105 | 18 | 10 | 0.333 | 1220.7 | 18 | 10 | 0.333 | 1220.7 |
| 60106 | 20 | 8 | 0.267 | 483.4 | 15 | 13 | 0.433 | 446.0 |
| 60107 | 8 | 20 | 0.667 | 200.0 | 10 | 18 | 0.600 | 230.0 |
| 60108 | 22 | 6 | 0.200 | 134.0 | 25 | 3 | 0.100 | 197.3 |
| BAND | 142 | 82 | 0.342 | 763.2 | 134 | 90 | 0.375 | 727.4 |

Three seeds are byte-identical between arms (60101, 60103,
60105): on ground where the fertile bonus does not reorder
the first 3 candidates, nothing changes. The damage
concentrates in 60102 (failed 0.100 -> 0.367, haul 362.8 ->
157.2) and 60106 (failed 0.267 -> 0.433, haul 483.4 -> 446.0);
60108 improves on both legs (failed 0.200 -> 0.100, haul 134.0
-> 197.3) but pays for it in stranding (below). Failed-trip
attribution stays FAILED_WORKED_OUT wherever the >= 5-day
attribution floor is met (both arms; only armed 60104 has a
non-worked-out failed day, 1 of 18). Pooled mean daily haul
equals the mean-of-means here (all seeds run 30 days), so the
patchrot mean-vs-pooled ambiguity does not arise. Wave reach
max 2 both arms; collapses 0 both arms; 8/8 survived 30
loopDays both arms.

## Engagement: the rule fired, the penalty did not

Armed band totals: 486 forage attempts, 1,353 penalized menus,
3,524 fertile-tile bonuses, 17 barren-tile penalties, 31
visited tiles band-wide (3 per seed on 6 seeds, 6-7 on the two
divergent ones). The asymmetry is the finding: visited tiles
almost always show 6+ available cells whole-tile, so the arm
is effectively "nearest-first, lightly reshuffled by a -1
bonus" with a barren penalty that exists on paper. A rule
whose penalty fires 17 times in 1,353 menus cannot move a
failed-trip share that needs a 10-point cut. The prereg's
engagement floor is far exceeded (1,353 >> 10), so the pilot
is interpretable and the NO-GO stands as a signal verdict,
not an engagement verdict.

## Predictor census (the fallback deliverable: what WOULD predict success)

Pre-sweep availableCells bucket vs attempt success, pooled:

| bucket (preAvail) | baseline attempts | baseline successes | baseline rate | armed attempts | armed successes | armed rate |
|---|---|---|---|---|---|---|
| 0 (barren whole-tile) | 1 | 0 | 0.000 | 2 | 0 | 0.000 |
| 1-5 (thin) | 19 | 2 | 0.105 | 16 | 0 | 0.000 |
| 6+ (fertile whole-tile) | 466 | 140 | 0.300 | 468 | 134 | 0.286 |
| null (no detail) | 0 | — | — | 0 | — | — |

Two readings. First, the whole-tile count barely separates
outcomes: even "fertile" attempts succeed only ~30% of the
time, because an attempt is one of up to 3 candidates tried
and the sweep tests the entry window, not the tile. Second,
and sharper: of all FAILED attempts, 326/344 baseline (95%)
and 334/352 armed (95%) carry preAvail >= 6. The failures
this axis is trying to fix happen ON fertile-by-the-count
ground. No whole-tile threshold rescues that: the failing
attempts and the succeeding attempts live in the same bucket.
The next arm's predictor must be entry-window cells (or
entry-window regrow state), measured the same way — pre-sweep,
per attempt — before any new rule is frozen around it.

## The 60108 story: a better trip rate that strands and starves

Armed 60108 is the only seed that improves on both primary
legs, and it is also the arm's harm case. Baseline 60108: 0
day-start away days, 0 day-end away days, 29 live returns.
Armed 60108: 15 day-start away days, 18 day-end away days, 13
live returns — and the band's only starvation deaths, both
with player:true (the scholar's own character, twice: day 12
and day 18, succession carrying the run to 30 days). The
transcript shows the mechanism plainly: loopDay 11 the scholar
forages (1,4) successfully (preAvail 29), then the walk home
to (4,4) is refused washed_out — the creek crossing, with the
route gates OFF in this substrate — and it stays at (2,4).
LoopDay 12 it forages (1,4) again and FAILS "worked out"
with preAvail still 26: yesterday's sweep emptied the entry
window while 26 cells elsewhere in the tile remained. It then
succeeds at (2,2) (preAvail 29) and again fails the washed_out
walk home. The scholar cycles two near tiles west of the
creek, carrying bags of unnamed nuts ("Not food until
identified — sort them at camp") it cannot reach camp to
identify, and starves. The haul gain on this seed (134.0 ->
197.3) never becomes village food, because haul counts
day-row gains regardless of homecoming. Baseline 60108 never
goes west of the creek at all (0 away days) — the fertility
reshuffle created the stranding; it did not merely fail to
prevent it. (Baseline 60106 also shows away days, 7 start /
8 end, so away day-ends exist in this substrate without the
rule — but armed 60108's 15/18 is the rule's own divergence,
not background.)

## Sense test (SENSE-TESTING LAW: read, don't just count)

Armed 60108, loopDays 11-12 (extract in the corpus file
60108-day11-12.txt; full armed say lines in the pilot jsonl):

- The lines read as a person, not a grid march: a successful
  sweep ("A shot in the dark — you take what's green: 8x
  unknown nuts. Into the bag, unnamed."), an honest worked-out
  refusal ("This patch is worked out — step to another green
  patch and forage again."), and a walk home that simply
  does not happen (the washed_out refusal is in the travel
  record; the transcript carries no "I can't get home" line —
  the stranding itself is narratively unmarked, the same
  invisibility class as the detour/rotation findings before
  it).
- The fertility choice is narratively invisible: zero lines
  in the armed band mention fertility, lush ground, or rich
  ground. The rule changes which tile the trip tries, and the
  player sees only the ordinary step-to-another-patch lines.
  Same class as patchrot's invisible rotation — behaviorally
  real, narratively unmarked.
- Nothing robotic in the forage voice; the frustration, where
  it exists, is the world's (a washed-out crossing, a
  worked-out entry window), not the narration's. What the
  narration never says is why the trip went west at all, or
  that the scholar is now stuck there.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does on either
arm. In-window: 8/8 survived 30 loopDays both arms (median
survival 30, max 30, collapses 0); wave reach max 2 both arms;
waves 3-5 not reached (expected — early window). National 0,
table 0, wins 0 IN THIS WINDOW ONLY — not a wall movement claim.
Combined panel (§15, separate substrate, context only): see
sim-fertrot-b-panel-summary.md.

## Balanced panel (section 15)

Pre-declared combined panel (both policies, same seeds/days, one
campaign) — the multisweep lesson applied, not re-learned: the
formal single-policy compare path is not used, because it
returns "invalid" for new-policy arms by construction. Panel
invocation, validity (sourcesStable true, neutrality matched,
zero warnings), and counts are in
sim-fertrot-b-panel-summary.md; raw panel retained as
sim-fertrot-b-panel.json.gz (16 cases). Panel numbers are
context, never verdict: the panel runs its own substrate and
its survival/death definitions differ from the driver's judged
cost bar. Panel context: 8/8 survived both arms, won 0,
national 0, table 0, maxRank village, maxArc 3, waveReach 1-2,
vests 0 both arms — no wall movement shown or claimed.

## Caveats and attribution limits (honest, per prereg)

- SINGLE policy pair (competent vs its fertility variant),
  30-day early window, gate-off substrate only. Other
  policies, later windows, and gate-ON play may shape
  differently — in particular, gate-ON returns would change
  the 60108 stranding shape entirely (the washed_out walk home
  is exactly what the routeblock gates address, and this arm
  deliberately does not bundle them).
- THE BONUS DOMINATES THE PENALTY BY CONSTRUCTION: the -1
  fertile bonus fires on nearly every visited-tile menu entry
  (whole-tile counts are large), so the armed leg is mostly a
  nearest-first reshuffle, not a barren-avoidance rule. The
  NO-GO is a verdict on this frozen rule (whole-tile count,
  0 / 6+ thresholds), not on entry-window signals, which were
  never ranked by this arm.
- ATTEMPT COUNTS ARE IDENTICAL BAND-WIDE (486 both arms):
  the rule changes WHICH tiles are tried, not how many
  attempts the trip makes. The pair movement comes from
  reordering, not from more or fewer tries.
- PRE-SWEEP availCells IS AN UPPER BOUND (prereg caveat 1,
  now measured): the sweep works the entry 3x3, the count
  covers the whole 9x9. The 95%-of-failures-on-fertile-count
  result is the measurement of that gap, not a surprise to
  be explained away.
- SCORCHED CELLS NOT EXCLUDED (prereg caveat 2): any
  overcount biases toward trying, not skipping, and cannot
  explain a failed-trip share that rises.
- No metric, threshold, seed, or rule was changed mid-run.
  The prereg, policy, driver, analyzer, proof test, and
  registry line were committed (461f3c997) BEFORE any judged
  sim; the live control (60109) and determinism runs ran
  after that commit and are instrument proof only, never
  judged seeds.

## Metric review (for the NEXT run; this run judged against its header)

- THE PAIR DID ITS JOB A THIRD TIME: share-up + haul-down +
  a cost-bar miss is an unambiguous NO-GO with no
  re-scoring temptation. The pair template (patchrot,
  routeblock, now fertrot) keeps catching exactly the shape
  it was built for: a lever that moves trips without moving
  the pantry.
- THE ENGAGEMENT FLOOR WORKED AS DESIGNED: pre-registering
  "uninterpretable if < 10 adjustments" forced the honest
  distinction between routeblock (no opportunity) and this
  arm (ample engagement, wrong signal). Keep the floor on
  future signal arms.
- THE NEXT SIGNAL MUST BE ENTRY-WINDOW, NOT TILE-WINDOW:
  the census proves whole-tile counts cannot separate failing
  from succeeding attempts (95% of failures sit in the
  fertile bucket). A follow-up arm must FIRST measure the
  entry-window predictor (pre-sweep 3x3 count around the
  entry cell) on this same census instrument, and only then
  freeze a rule around it. If the entry cell cannot be
  known at menu time (it depends on the path), that
  impossibility is itself the finding — and the arm should
  say so rather than ranking by another whole-tile proxy.
- 60108 IS THE COUNTEREXAMPLE TO KEEP: any future ranking
  rule must be judged on stranding as well as haul — a rule
  that improves the trip rate while stranding the scholar
  west of a creek is worse than neutral, and the starvation
  cost bar caught it here. Future rotation arms should carry
  away day-ends as a secondary (routeblock's secondary,
  promoted by this evidence).
- POOLED VS MEAN-OF-MEANS DID NOT MATTER HERE: identical
  (all seeds 30 days), so the patchrot ambiguity stays
  theoretical for this band — but the dual reporting stays
  in the template for bands where seeds die early.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it) and
does not append to sim-findings.md directly. The lines below are
in backlog format for the coordinator to append verbatim if it
wants them:

- [open] 2026-11-01 — food-economy / scholar supply — whole-tile fertility does not predict sweep success: a policy ranking forage targets by whole-tile harvestable-cell count (worked tiles with 0 cells +99, with 6+ cells -1) moves pooled failed-trip share 0.342 -> 0.375 and mean daily haul 763.2 -> 727.4 on identical seeds, so the pilot is NO-GO on its pair; 95% of failed attempts on both arms happen on tiles showing 6+ available cells, because the sweep tests only the 3x3 entry window while the count covers the whole 9x9 tile (sim-fertrot-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — fertility reshuffle strands the scholar: on seed 60108 the fertility rule sends the scholar west of a washed-out creek crossing it cannot recross (gates OFF), producing 15 day-start / 18 day-end away days vs 0/0 baseline, 13 live returns vs 29, and the scholar starving twice (days 12, 18) while carrying unidentified nuts it cannot reach camp to sort — a trip-rate gain (haul 134.0 -> 197.3) that never becomes village food (sim-fertrot-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — fertility choice is narratively invisible: zero lines in the armed band mark choosing fertile ground, the same invisibility class as patchrot rotation and routeblock detours; the stranding itself is also unmarked (no "can't get home" line) (sim-fertrot-b evidence).

## Next lever candidate (or why there is none)

No confirm, no landing: the arm is killed at pilot. The candidate
NEXT arms, in evidence order (each needs its own prereg; none is
claimed GO by this arm):

1. ENTRY-WINDOW rotation (this arm's metric review): rank by
   the pre-sweep 3x3 entry-window cell count (or entry-window
   regrow state) instead of the whole-tile count, judged on
   the same pair, with away day-ends as a secondary. First
   measure whether the entry cell is knowable at menu time.
2. SUCCESS-ANCHORED rotation (patchrot 51901 counterexample,
   still open): a rule that does NOT rotate away from a tile
   that paid yesterday, judged per-seed as well as band-pooled.
3. STRANDING SUBSTRATE arm (routeblock metric review, now
   with a live example): a longer-horizon or farther-travel
   substrate where away day-ends actually occur — 60108 armed
   proves the 30d competent window CAN strand under a ranking
   rule — with away day-ends as the primary, NOT a re-run of
   the gates on the same substrate.

## Infrastructure (loud, per task)

- EPERM FLAP, LONG (this run): the container write flap denied
  git index writes (safe-commit /tmp private-index lock) for
  ~15 minutes across the prereg commit attempts (7 failures,
  then landed on retry 5 of the second loop, commit
  461f3c997), and later denied balance-panel case writes
  (worker writeFileSync) across 5 + 1 + 8 + 1 failed attempts
  before the flap lifted and retry 2 of the final loop
  completed 16 cases (see sim-fertrot-b-panel-summary.md for
  the acquisition note). No bare commits, no script edits;
  the loop out-waited the flap for both the commit and the
  panel. Diagnostic detail: during the flap, several panel
  attempts exited 1 with 0-byte logs (even stderr writes were
  denied) and orphaned .json.tmp case files — the flap denies
  write(2) itself, not just particular paths.
- SAFE-COMMIT INDEX CLOBBER (known class) hit the prereg
  commit again: after 461f3c997 the main index showed staged
  deletions plus untracked copies of the same files, and
  sweep-compare.js showed MM. The commit itself verified
  correct (1,174 insertions, 6 files). Repaired via
  git update-index --add --cacheinfo from HEAD blobs per file;
  verified git status --short empty + git diff HEAD empty +
  git diff --cached empty after repair.
- Sibling trees untouched. Main tree at
  ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-fertrot-b.js: pure 9/9 green (availableCells
count incl. regrow skip, barren +99 / fertile -1 / thin and
unknown identity, menu fresh-objects + barren-last +
fertile-first + unknown-untouched order, frozen constants,
analyzer GO/NO-GO boundaries, real-analyzer predictor census).
Live modes on NON-JUDGED seed 60109 only: --live-control green
(30 loopDays, 84 forages, visitedTiles 3, survived);
--live-det green (identical census across two runs). Proof runs
executed after the prereg commit, before the pilot.

## Files

- Prereg: evidence/2026-11-01/sim-fertrot-b-prereg.md
  (commit 461f3c997, BEFORE any judged sim)
- Policy: scripts/policies/competent-fertrot-b.js
  (registry line in scripts/sweep-compare.js)
- Instrument: scripts/fertrot-b-driver.js,
  scripts/analyze-fertrot-b.js
- Proof test: scripts/test-fertrot-b.js (pure 9/9;
  --live-control 60109, --live-det 60109)
- Pilot census: evidence/2026-11-01/sim-fertrot-b-pilot-baseline.jsonl
  (8 lines), sim-fertrot-b-pilot-armed.jsonl (8 lines),
  sim-fertrot-b-pilot-analysis.json (analyzer summary + full
  per-seed tables)
- Panel: evidence/2026-11-01/sim-fertrot-b-panel.json.gz,
  sim-fertrot-b-panel-summary.md
- Corpus extracts: evidence/2026-11-01/sim-fertrot-b-corpus/
  60108-day11-12.txt
- Evidence: evidence/2026-11-01/sim-fertrot-b.md (this file)
