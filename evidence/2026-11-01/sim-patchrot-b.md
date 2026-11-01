# sim-patchrot-b — PATCH ROTATION vs the haul ceiling's failed-trip shape

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-patchrot-b.
Worktree sim-patchrot-b, branch sim-patchrot-b. The 1725Z next-blank
(4), first item in evidence order: the regrow / patch-rotation
follow-up to sim-haulsize-b. Policy-side ONLY: NEW policy file
scripts/policies/competent-patchrot-b.js, default OFF, zero src/js
changes, zero edits to scripts/policies/competent.js, plus one
additive panel-registry line in scripts/sweep-compare.js. Route
blockage NOT bundled (gates OFF, as in haulsize / multisweep).
This worker does NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Verdict: PILOT NO-GO — the pair splits, so no confirm spend

Prereg: evidence/2026-11-01/sim-patchrot-b-prereg.md (commit
b4418fadcb, BEFORE any judged sim). Judged exactly against the
prereg's divergence-aware pair + cost bars, 30d competent,
DEPOSITGATE=0, identical seeds both arms (pilot 51901-51908;
freshness verified by seed-field scan of evidence/2026-11-01/
*.jsonl before the pilot; the 51821-51832 multisweep confirm band
was NOT taken):

| Leg | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| (a) failed-trip day share, pooled | 0.346 (83/240 days) | 0.171 (41/240 days) | armed <= baseline - 0.10 | PASS, delta -0.175 |
| (b) mean daily haul, band mean of seed means | 511.9 kcal | 457.2 kcal | armed >= baseline | FAIL, delta -54.7 |
| Cost: median survival | 30 | 30 (ratio 1.0) | >= 0.8x | clean |
| Cost: starvation deaths | 1 | 1 (delta 0) | <= baseline + 1 | clean |

PILOT NO-GO: the pair requires BOTH legs, and (b) misses. No
confirm spend — confirm reserve 51921-51932 stays fresh, never
run. No re-score: the finished-pack diagnostic (pooled mean
398.7 baseline vs 365.3 armed) and unload (25,135 baseline vs 0
armed) are reported as diagnostics only and do not rescue the
primary, per the prereg. Cost bars clean does not rescue a
primary miss (multisweep precedent, same rule).

## The answer in one paragraph

Rotation works as a trip-finder and fails as a haul-grower.
The rule genuinely engages — 1,458 penalized menus, 445 forage
attempts, 67 visited tiles band-wide, and ZERO stale attempts
(the trip never fell back to a resting tile: fresh ground within
reach always existed) — and failed-trip days fall by more than
half in share (83 -> 41 days) with trip days rising 140 -> 179.
But the extra successful trips go to thinner ground: mean daily
haul falls 511.9 -> 457.2, and the per-seed picture is mixed, not
a rising tide (haul up on 51903/51905/51906/51907, down on
51901/51902/51904/51908). Rotation converts failed days into
successful days that yield less — it fixes the trip, not the
pantry. The remaining failed days (41) are still all
FAILED_WORKED_OUT: fresh-by-the-rule tiles can still come back
worked-out, so "not foraged in 2 days" is not the same as
"harvestable" — the rule rotates away from the scholar's own
recent picks, not from barren ground as such.

## Pilot census (30d competent, DEPOSITGATE=0)

Per seed: trip = successful-trip days, failed = failed-trip days
(>= 1 attempt, 0 successes), share = failed / 30 loopDays.

| seed | base trip | base failed | base share | base haul | armed trip | armed failed | armed share | armed haul |
|---|---|---|---|---|---|---|---|---|
| 51901 | 26 | 1 | 0.033 | 848.2 | 22 | 6 | 0.200 | 313.0 |
| 51902 | 20 | 8 | 0.267 | 811.9 | 22 | 4 | 0.133 | 706.8 |
| 51903 | 18 | 10 | 0.333 | 1098.2 | 25 | 3 | 0.100 | 1154.3 |
| 51904 | 17 | 11 | 0.367 | 605.0 | 19 | 9 | 0.300 | 513.2 |
| 51905 | 21 | 7 | 0.233 | 252.3 | 26 | 2 | 0.067 | 325.8 |
| 51906 | 12 | 16 | 0.533 | 147.0 | 21 | 5 | 0.167 | 241.7 |
| 51907 | 9 | 19 | 0.633 | 105.0 | 21 | 7 | 0.233 | 251.3 |
| 51908 | 17 | 11 | 0.367 | 227.7 | 23 | 5 | 0.167 | 151.8 |
| BAND | 140 | 83 | 0.346 | 511.9 | 179 | 41 | 0.171 | 457.2 |

Failed-trip attribution stays FAILED_WORKED_OUT wherever the
>= 5-day attribution floor is met (both arms); noTrip days are
2/seed on 13 of 16 legs (4 on armed 51902/51906 — needTrip gating
is not a driver here). Baseline failed share on this band (0.346)
is far below haulsize's 0.67 on the 515 band: bands differ, and
rotation's 17.5-point cut is measured against THIS band's
baseline, not haulsize's. Wave reach max 2 both arms; collapses 0
both arms; 8/8 survived 30 loopDays both arms.

The one seed where rotation hurts on both legs is 51901: failed
share 0.033 -> 0.200 and haul 848.2 -> 313.0. On a seed whose
nearest patch was already productive, pushing the trip to
farther fresh ground trades a good patch for thin ones. That is
the mechanism behind the band haul decline in miniature.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Full extracts: evidence/2026-11-01/sim-patchrot-b-corpus/
51903-day3-51901-day4.txt.

- 51903, loopDay 3 (armed): a worked-out patch ("This patch is
  worked out — step to another green patch and forage again."),
  then a fresh tile pays in unknown nuts ("Unfamiliar unknown
  nuts — into the bag."). It reads as a person stepping to
  another green patch — nothing robotic, and nothing that marks
  the step as ROTATION rather than the baseline's ordinary
  step-to-another-patch. The rotation is narratively invisible:
  the game never says "you skip yesterday's patch" or "you try
  ground you haven't worked lately." Same invisibility class as
  multisweep's missing "head back out" line — behaviorally real,
  narratively unmarked. Not a grid march (no pattern language,
  no marching order in the lines), but also not a choice the
  player can see being made.
- 51901, loopDay 4 (armed): two worked-out patches, then a third
  tile pays (grapes + unknown roots + vine). Same honest voice
  throughout; the frustration, where it exists, is the world's
  (worked-out ground), not the narration's.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does on either
arm. In-window: 8/8 survived 30 loopDays both arms (median
survival 30, max 30, collapses 0); wave reach max 2 both arms;
waves 3-5 not reached (expected — early window). National 0,
table 0, wins 0 IN THIS WINDOW ONLY — not a wall movement claim.
Combined panel (§15, separate substrate, context only): 16/16
survived, won 0, national 0, table 0, maxRank village, maxArc 3,
waveReach 1-2, both arms — see sim-patchrot-b-panel-summary.md.

## Balanced panel (section 15)

Pre-declared combined panel (both policies, same seeds/days, one
campaign) — the multisweep lesson applied, not re-learned: the
formal single-policy compare path is not used, because it
returns "invalid" for new-policy arms by construction. Panel
invocation, validity (sourcesStable true, neutrality matched,
zero warnings), and counts are in
sim-patchrot-b-panel-summary.md; raw panel retained as
sim-patchrot-b-panel.json.gz. Panel numbers are context, never
verdict: the panel runs its own substrate and its survival/death
definitions differ from the driver's judged cost bar.

## Caveats and attribution limits (honest, per prereg)

- SINGLE policy pair (competent vs its rotation variant), 30-day
  early window, gate-off substrate only. Other policies, later
  windows, and gate-ON play may shape differently.
- "FRESH" IS RULE-FRESH, NOT GROUND-TRUTH FRESH: the rule knows
  only the scholar's own forage history. A tile never foraged by
  the scholar can still be cell-barren (detail with no
  harvestable cells), which is why 41 armed failed days remain
  FAILED_WORKED_OUT with zero stale attempts. Rotation solves
  re-trying your own picks, not finding fertile ground.
- The +99 distance reweighting has the two spillovers stated in
  the prereg (nearestRubble min-d choice; feast-patrol descending-d
  top-4 while feasted, with COMPETENT_FEAST=0 here). Neither is
  measured separately in this pilot; the stoneRun spillover is a
  possible confound on knife-stone days, bounded by the fact that
  stoneRuns are a minority of days.
- Unload 0 on the armed band (vs 25,135 baseline, nearly all from
  baseline 51904) is a diagnostic curiosity, not a judged leg:
  with DEPOSITGATE=0, finished packs below the 2,000 keep do not
  unload, and the armed band's finished packs (pooled mean 365.3)
  never clear it — the same shape haulsize reported band-wide.
  Why baseline 51904 unloads 24,505 while its finished mean is
  273.5 is not decomposed here; it does not touch the verdict.
- No metric, threshold, seed, or rule was changed mid-run. The
  prereg, policy, driver, analyzer, proof test, and registry line
  were committed (b4418fadcb) BEFORE any judged sim; the live
  control (51909) and determinism runs ran after that commit and
  are instrument proof only, never judged seeds.

## Metric review (for the NEXT run; this run judged against its header)

- THE PAIR DID ITS JOB: the divergence-aware primary caught
  exactly what multisweep missed — a lever that improves the
  trip rate while shrinking the haul. A finished-pack-only
  primary would have called this a miss too (365.3 vs 398.7),
  but for the wrong reason; the pair names the real shape
  (more trips, thinner ground). The pair should stay the
  template for haul-ceiling follow-ups.
- THE HAUL LEG NEEDS A POOLED SENSITIVITY: mean-of-seed-means
  lets one seed (51901, -535) dominate the band call. The NEXT
  arm should report the pooled mean daily haul alongside the
  mean-of-means and pre-declare which one judges — it would
  not have changed THIS verdict (both directions agree here:
  pooled haul is also down, since trip-day gains are thin), but
  the ambiguity should not ride into a closer run.
- ROTATION NEEDS A FERTILITY SIGNAL, NOT JUST A REST CLOCK: the
  next rotation-shaped arm should pre-register a rule that
  prefers tiles with observed harvestable cells (visited tiles
  whose detail grids showed forageables) over merely
  not-recently-visited tiles — or measure whether the worked-out
  failures on rule-fresh tiles share a tile type / detail state
  the policy could read honestly. Rest-clock rotation alone is
  a NO-GO; do not re-run it with a different window and call it
  new.
- 51901 IS THE COUNTEREXAMPLE TO KEEP: any future rotation rule
  must be judged per-seed as well as band-pooled, with a
  pre-registered guard against hurting already-productive seeds
  (e.g. "do not rotate away from a tile that paid yesterday" is
  a different rule — a success-anchored rotation — and needs its
  own prereg, not a tweak to this one).

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it) and
does not append to sim-findings.md directly. The lines below are
in backlog format for the coordinator to append verbatim if it
wants them:

- [open] 2026-11-01 — food-economy / scholar supply — patch rotation cuts failed trips but not haul: a 2-day rest-clock rotation policy (tiles foraged within 2 days sort 99 steps farther) cuts pooled failed-trip share 0.346 -> 0.171 and lifts trip days 140 -> 179 on identical seeds, but mean daily haul falls 511.9 -> 457.2, so the pilot is NO-GO on its divergence-aware pair; the extra trips go to thinner ground, and rule-fresh tiles still fail worked-out (sim-patchrot-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — rotation is narratively invisible: a rotated trip reads identically to the baseline step-to-another-patch; no line marks skipping yesterday's patch or choosing unworked ground, the same invisibility class as multisweep's missing second-outing line (sim-patchrot-b evidence).

## Next lever candidate (or why there is none)

No confirm, no landing: the arm is killed at pilot. The candidate
NEXT arms, in evidence order (each needs its own prereg; none is
claimed GO by this arm):

1. ROUTE-BLOCKAGE arm (haulsize blank, still open): measure
   whether route-around / standing-home gates (currently OFF)
   change failed-trip rates and stranding on identical seeds.
   Do NOT bundle with rotation.
2. FERTILITY-SIGNAL rotation (this arm's metric review): a rule
   that prefers tiles with observed harvestable cells over
   merely not-recently-visited tiles, judged on the same pair.
3. SUCCESS-ANCHORED rotation (51901 counterexample): a rule that
   does NOT rotate away from a tile that paid yesterday, judged
   per-seed as well as band-pooled.

## Infrastructure (loud, per task)

- SAFE-COMMIT INDEX CLOBBER (known class) hit the prereg commit:
  after b4418fadcb the main index showed staged deletions plus
  untracked copies of the same files, and sweep-compare.js showed
  MM. The commit itself verified correct (940 insertions, 6
  files). Repaired via git update-index --add --cacheinfo from
  HEAD blobs per file; verified git status --short empty + git
  diff HEAD empty + git diff --cached empty after repair.
- No EPERM write flap this run.
- Sibling trees untouched. Main tree at
  ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-patchrot-b.js: pure 9/9 green (window boundaries,
+99 penalty, fresh-before-resting order, fresh-object menus,
analyzer GO/NO-GO boundaries incl. share-miss, haul-down, and
cost-miss cases). Live modes on NON-JUDGED seed 51909 only:
--live-control green (30 loopDays, 72 forages, 7 visited tiles,
survived); --live-det green (identical census across two runs).
Proof runs executed after the prereg commit, before the pilot.

## Files

- Prereg: evidence/2026-11-01/sim-patchrot-b-prereg.md
  (commit b4418fadcb, BEFORE any judged sim)
- Policy: scripts/policies/competent-patchrot-b.js
  (registry line in scripts/sweep-compare.js)
- Instrument: scripts/patchrot-b-driver.js,
  scripts/analyze-patchrot-b.js
- Proof test: scripts/test-patchrot-b.js (pure 9/9;
  --live-control 51909, --live-det 51909)
- Pilot census: evidence/2026-11-01/sim-patchrot-b-pilot-baseline.jsonl
  (8 lines), sim-patchrot-b-pilot-armed.jsonl (8 lines),
  sim-patchrot-b-pilot-analysis.json (analyzer summary + full
  per-seed tables)
- Panel: evidence/2026-11-01/sim-patchrot-b-panel.json.gz,
  sim-patchrot-b-panel-summary.md
- Corpus extracts: evidence/2026-11-01/sim-patchrot-b-corpus/
  51903-day3-51901-day4.txt
- Evidence: evidence/2026-11-01/sim-patchrot-b.md (this file)
