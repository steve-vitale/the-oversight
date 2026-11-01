# sim-routeblock-b — ROUTE-BLOCKAGE GATES vs the haul ceiling's failed-trip shape

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-routeblock-b.
Worktree sim-routeblock-b, branch sim-routeblock-b. The 1725Z next-blank
(1), first item in evidence order: the route-blockage follow-up to
sim-haulsize-b, left open by sim-patchrot-b. Policy-side ONLY: NEW
policy file scripts/policies/competent-routeblock-b.js, default OFF,
zero src/js changes, zero edits to scripts/policies/competent.js, plus
one additive panel-registry line in scripts/sweep-compare.js. Rotation
(patchrot) NOT bundled, multi-sweep NOT bundled — this arm is the
gates alone. This worker does NOT push, bump, verify live, or merge
into master; the coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: PILOT NO-GO — the gates barely engage, and the pair misses on both legs

Prereg: evidence/2026-11-01/sim-routeblock-b-prereg.md (commit
6bb9dcafb, BEFORE any judged sim). Judged exactly against the
prereg's divergence-aware pair + cost bars, 30d competent,
DEPOSITGATE=0, identical seeds both arms (pilot 52001-52008;
freshness verified by seed-field scan of evidence/2026-11-01/
*.jsonl before the pilot; the 51821-51832 and 51921-51932 reserves
belong to other arms and were NOT taken):

| Leg | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| (a) failed-trip day share, pooled | 0.450 (108/240 days) | 0.450 (108/240 days) | armed <= baseline - 0.10 | FAIL, delta 0.000 |
| (b) mean daily haul, band mean of seed means | 901.7 kcal | 896.7 kcal | armed >= baseline | FAIL, delta -5.0 |
| Cost: median survival | 30 | 30 (ratio 1.0) | >= 0.8x | clean |
| Cost: starvation deaths | 0 | 0 (delta 0) | <= baseline + 1 | clean |
| Secondary: day-end away days | 0 | 0 | reported, not verdict | no stranding on this band at all |
| Secondary: day-start away days | 0 | 0 | reported, not verdict | same |

PILOT NO-GO: the pair requires BOTH legs, and both miss. No
confirm spend — confirm reserve 52021-52032 stays fresh, never
run. No re-score: the finished-pack diagnostic (955.6 baseline
vs 951.2 armed) and unload (107,265 baseline vs 75,985 armed)
are reported as diagnostics only and do not rescue the primary,
per the prereg. Cost bars clean does not rescue a primary miss
(patchrot / multisweep precedent, same rule).

## The answer in one paragraph

On this band there is almost nothing for the gates to do. The
scholar never ends a day away from the haven on either arm
(endAway 0/240 days both arms, startAway 0/240), so the standing
go-home rule never fires (standingHomeDays 0 band-wide) — the
creekpath 10772 stranding shape does not occur in this 30-day
competent substrate at all. The only counted gate engagement in
the whole pilot is 3 trip-home detour steps, all on seed 52001
days 21-23, and they hurt: the detour rerouted the trip's third
candidate from (5,4) to (3,5), turning baseline day 21's success
into a failure and shifting the whole subsequent trip pattern,
so 52001's failed share rose 0.367 -> 0.433 and its haul fell
517 -> 317. The one seed that improves, 52006 (failed 0.367 ->
0.300, haul 892 -> 1051), improves through the UNCOUNTED
channel: a 27-travel walk on day 12 that reaches (4,2) for a
success, with zero counted trip-home detours — a general
walkTo route-around, the spillover the prereg flagged as
uncounted. The gates are not broken; they are nearly inert in
this window, and the one place they bite, they bite the wrong
way. The failed-trip shape here is worked-out ground
(FAILED_WORKED_OUT share 0.6-1.0 on every seed), not blocked
roads — the gates answer a question this band does not ask.

## Pilot census (30d competent, DEPOSITGATE=0)

Per seed: trip = successful-trip days, failed = failed-trip days
(>= 1 attempt, 0 successes), share = failed / 30 loopDays.

| seed | base trip | base failed | base share | base haul | armed trip | armed failed | armed share | armed haul |
|---|---|---|---|---|---|---|---|---|
| 52001 | 17 | 11 | 0.367 | 517.0 | 15 | 13 | 0.433 | 317.3 |
| 52002 | 23 | 5 | 0.167 | 1779.5 | 23 | 5 | 0.167 | 1779.5 |
| 52003 | 18 | 10 | 0.333 | 385.5 | 18 | 10 | 0.333 | 385.5 |
| 52004 | 10 | 18 | 0.600 | 125.7 | 10 | 18 | 0.600 | 125.7 |
| 52005 | 13 | 15 | 0.500 | 1870.8 | 13 | 15 | 0.500 | 1870.8 |
| 52006 | 17 | 11 | 0.367 | 891.7 | 19 | 9 | 0.300 | 1051.1 |
| 52007 | 18 | 10 | 0.333 | 1643.7 | 18 | 10 | 0.333 | 1643.7 |
| 52008 | 0 | 28 | 0.933 | 0.0 | 0 | 28 | 0.933 | 0.0 |
| BAND | 116 | 108 | 0.450 | 901.7 | 116 | 108 | 0.450 | 896.7 |

Five of eight seeds are byte-identical between arms (52002,
52003, 52004, 52005, 52007): no refused step, no away day-end,
no gate engagement of any kind. Only 52001 and 52006 diverge,
in opposite directions, nearly cancelling (haul -199.7 on
52001, +159.4 on 52006). Seed 52008 is a dead seed on both arms:
0 successful-trip days, 28 failed days, 0 haul, yet it
survives all 30 days (upkeep food, not foraging, keeps it
alive) — a haul-ceiling extreme worth a look by a later arm,
but not this arm's question. Wave reach max 2 both arms;
collapses 0 both arms; 8/8 survived 30 loopDays both arms.

## Sense test (SENSE-TESTING LAW: read, don't just count)

- Armed 52001, loopDays 21-23: each day carries exactly 1
  counted trip-home detour step, and the say lines contain NO
  detour narration at all — no "go around", no "another way",
  no mention of the blockage being circumvented. The keyword
  scan over the armed 52001 transcript returns only unrelated
  "word gets around" gossip and a fairy-ring "step around it"
  from day 3. The detour is narratively invisible: the player
  sees the same failed forages and the same walk home, with the
  route choice made silently underneath. Same invisibility
  class as multisweep's missing second-outing line and
  patchrot's unmarked rotation. A detour the player cannot see
  being chosen is invisible even when it changes the outcome —
  and here it changed the outcome for the worse (day 21's
  success became a failure) with no line explaining why the
  trip went to (3,5) instead of (5,4).
- The 52006 day-12 long walk (27 travels to (4,2) for a
  success) likewise carries no "long way around" narration in
  the lines. The walk reads as travel, not as a decision.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does on either
arm. In-window: 8/8 survived 30 loopDays both arms (median
survival 30, max 30, collapses 0); wave reach max 2 both arms;
waves 3-5 not reached (expected — early window). National 0,
table 0, wins 0 IN THIS WINDOW ONLY — not a wall movement claim.
Combined panel (§15, separate substrate, context only): see
sim-routeblock-b-panel-summary.md.

## Balanced panel (section 15)

Pre-declared combined panel (both policies, same seeds/days, one
campaign) — the multisweep lesson applied, not re-learned: the
formal single-policy compare path is not used, because it
returns "invalid" for new-policy arms by construction. Panel
invocation, validity, and counts are in
sim-routeblock-b-panel-summary.md; raw panel retained as
sim-routeblock-b-panel.json.gz. Panel numbers are context, never
verdict: the panel runs its own substrate and its survival/death
definitions differ from the driver's judged cost bar.

## Caveats and attribution limits (honest, per prereg)

- SINGLE policy pair (competent vs its gates variant), 30-day
  early window, gate-off substrate only. Other policies, later
  windows, and longer horizons may strand more — the standing
  gate's creekpath precedent (10772 day 11) came from a longer,
  different substrate, and this pilot does not test whether
  stranding appears past day 30 or under other policies.
- THE THREE GATES RIDE TOGETHER: per-gate attribution is
  diagnostic only. The counted split is tripHomeDetours 3 (all
  52001) vs standingHomeDays 0; the general walkTo channel is
  uncounted by competent.js, so 52006's improvement cannot be
  cleanly assigned to a single gate — it is consistent with a
  general walkTo route-around, but the counter does not exist
  to prove it. A future arm that wants per-gate attribution
  must first bank general walkTo detour steps in ctx.
- 52001's harm mechanism is path divergence, not just the
  detour step: after the day-21 reroute, days 24-30 run a
  different trip pattern (fewer travels, different first
  candidate) than baseline. The detour changed state (ticks /
  position), and the divergence compounded. Attributing all of
  52001's -199.7 haul delta to "3 detour steps" overstates the
  step and understates the divergence.
- The analyzer shipped in the prereg commit carried a stale
  function-name reference (main() called analyzeSeedPatch after
  the rename to analyzeSeedRouteblock); it was fixed before any
  analysis ran, with zero definition changes — the judged
  numbers come from the fixed analyzer, and the analysis output
  itself proves the path works. No metric, threshold, seed, or
  rule was changed mid-run.
- No metric, threshold, seed, or rule was changed mid-run. The
  prereg, policy, driver, analyzer, proof test, and registry line
  were committed (6bb9dcafb) BEFORE any judged sim; the live
  control (52009) and determinism runs ran after that commit and
  are instrument proof only, never judged seeds.

## Metric review (for the NEXT run; this run judged against its header)

- THE PAIR DID ITS JOB AGAIN: share-flat + haul-down is a clean
  NO-GO, and the per-seed table shows why — five identical
  seeds, two diverging in opposite directions. A finished-pack
  primary would also have missed (951.2 vs 955.6), but the pair
  names the real shape (no trip-rate change, no haul change).
- THE ENGAGEMENT COUNTERS WERE THE FINDING: the pair alone
  would say "no effect"; the counters say "no opportunity" —
  zero away day-ends, zero standing fires, 3 detour steps. The
  NEXT route-shaped arm must pre-register an engagement floor
  (e.g. "pilot is uninterpretable if counted gate fires < 10
  band-wide") or pick a substrate where stranding actually
  occurs (longer horizon, policies that travel farther, seeds
  screened for away day-ends) — otherwise it re-measures the
  same absence.
- STRANDING NEEDS A DIFFERENT SUBSTRATE, NOT A DIFFERENT GATE:
  this pilot proves the 30d competent window does not strand.
  Do not re-run the gates on the same substrate and call it new.
  The next stranding question belongs to a longer-horizon or
  farther-travel arm, with away day-ends as its primary, not a
  secondary.
- 52008 IS A BLANK IN ITS OWN RIGHT: 0 trips, 0 haul, 30 days
  survived on upkeep alone. A seed where foraging never pays
  once is a haul-ceiling extreme the food-economy axis should
  look at — but it is not a route question (identical on both
  arms, zero gate engagement).

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it) and
does not append to sim-findings.md directly. The lines below are
in backlog format for the coordinator to append verbatim if it
wants them:

- [open] 2026-11-01 — food-economy / route blockage — route gates nearly inert in the 30d competent window: turning ON ROUTE_AROUND + TRIPHOME_ROUTE_AROUND + STANDING_HOME changes pooled failed-trip share 0.450 -> 0.450 and mean daily haul 901.7 -> 896.7 on identical seeds, so the pilot is NO-GO on its pair; the scholar never ends a day away (0/240 day-ends both arms), the standing rule never fires, and the only counted engagement is 3 trip-home detour steps on one seed (sim-routeblock-b evidence).
- [open] 2026-11-01 — food-economy / route blockage — detours are narratively invisible: a counted trip-home detour step leaves no "go around" line in the transcript; the player sees the same failed forages and walk home with the route choice made silently, the same invisibility class as multisweep second outings and patchrot rotation (sim-routeblock-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — seed 52008 never forages successfully: 0 successful-trip days, 28 failed days, 0 haul over 30 days on both arms, yet survives on upkeep alone; a haul-ceiling extreme for a later arm (sim-routeblock-b evidence).

## Next lever candidate (or why there is none)

No confirm, no landing: the arm is killed at pilot. The candidate
NEXT arms, in evidence order (each needs its own prereg; none is
claimed GO by this arm):

1. FERTILITY-SIGNAL rotation (patchrot metric review): a rule
   that prefers tiles with observed harvestable cells over
   merely not-recently-visited tiles, judged on the same pair.
2. SUCCESS-ANCHORED rotation (patchrot 51901 counterexample): a
   rule that does NOT rotate away from a tile that paid
   yesterday, judged per-seed as well as band-pooled.
3. STRANDING SUBSTRATE arm (this arm's metric review): a
   longer-horizon or farther-travel substrate where away
   day-ends actually occur, with away day-ends as the primary —
   NOT a re-run of the gates on the 30d competent window.

## Infrastructure (loud, per task)

- SAFE-COMMIT INDEX CLOBBER (known class) hit the prereg commit
  again: after 6bb9dcafb the main index showed staged deletions
  plus untracked copies of the same files, and sweep-compare.js
  showed MM. The commit itself verified correct (936
  insertions, 6 files). Repaired via git update-index --add
  --cacheinfo from HEAD blobs per file; verified git status
  --short empty + git diff HEAD empty + git diff --cached empty
  after repair.
- Analyzer stale-name fix (see Caveats): main() referenced the
  pre-rename analyzeSeedPatch; fixed before analysis, zero
  definition changes.
- No EPERM write flap this run.
- Sibling trees untouched. Main tree at
  ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-routeblock-b.js: pure 9/9 green (gate list, set /
restore, pre-existing-value preservation, restore-after-throw,
policy id, analyzer GO/NO-GO boundaries incl. share-miss,
haul-down, and cost-miss cases). Live modes on NON-JUDGED seed
52009 only: --live-control green (30 loopDays, 45 forages,
standingHomeDays 0, tripHomeDetours 0, survived); --live-det
green (identical census across two runs). Proof runs executed
after the prereg commit, before the pilot.

## Files

- Prereg: evidence/2026-11-01/sim-routeblock-b-prereg.md
  (commit 6bb9dcafb, BEFORE any judged sim)
- Policy: scripts/policies/competent-routeblock-b.js
  (registry line in scripts/sweep-compare.js)
- Instrument: scripts/routeblock-b-driver.js,
  scripts/analyze-routeblock-b.js
- Proof test: scripts/test-routeblock-b.js (pure 9/9;
  --live-control 52009, --live-det 52009)
- Pilot census: evidence/2026-11-01/sim-routeblock-b-pilot-baseline.jsonl
  (8 lines), sim-routeblock-b-pilot-armed.jsonl (8 lines),
  sim-routeblock-b-pilot-analysis.json (analyzer summary + full
  per-seed tables)
- Panel: evidence/2026-11-01/sim-routeblock-b-panel.json.gz,
  sim-routeblock-b-panel-summary.md
- Evidence: evidence/2026-11-01/sim-routeblock-b.md (this file)
