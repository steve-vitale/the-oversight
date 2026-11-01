# sim-haulsize-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-haulsize-b.
Worktree sim-haulsize-b, branch sim-haulsize-b. DIAG ONLY: new files
only, all names containing haulsize-b; ZERO src/js changes, ZERO
policy-default flips, ZERO edits to existing scripts/policies. This
worker does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Question (from the coordinator brief)

WHY does the haul-size ceiling exist? packcomp proved 51103/51104/
51108 never carry more than 8 nuts / 5 acorns on any return (best
combined packs 1,200 / 1,200 / 565), and shelling proved the shape
persists on fresh bands (51403/51406 pilot, 51411/51413/51417
confirm: max combined pack < 2,000 on every return). The blocker is
forage volume/targets, not identification or shelling. This arm
decomposes the cap on FRESH seeds: is it forage-target choice,
time/ticks, pack capacity, knowledge state, route/travel time, or
something else? A mechanism claim needs a count, not a story.

## Substrate (fixed, matches the shelling band exactly)

Competent policy, 30 days, DEPOSITGATE=0 (keep 2,000).
Env (FATAL if violated on the judged CLI path):
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=0,
POLICY=competent, DAYS=30. The * =1 flags barred in packcomp
(COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
COMPETENT_TRIPHOME_ROUTE_AROUND, WOODCARRY, WOODWARM,
MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING) must
NOT be 1. Fresh seed band only: pilot 51501-51508, confirm
51511-51522. Never reuse 511xx/512xx/514xx. Live control on
non-judged seed 51509 (instrument proof + determinism), never
counted in any judged band.

## Instrument (scripts/haulsize-b-driver.js, count-only wrappers)

Per loopDay (one policy daily call), the driver records:
- Day-start snapshot: dayTicks, pack value (finished + shelled-net
  + unknown-revealed, packcomp definitions), pack kg / cap, position,
  known-plant count, stocked travel-target candidates (count, nearest
  distance, tile types) — the target menu the trip chooses from.
- Every travelTo call: from -> to, dayTicks delta, moved/blocked.
- Every doAction('forage') call: tile + tile type, dayTicks delta,
  result (success / null), say lines fired during the call (failure
  reasons: pack-full, nothing-left, worked-out), species gained
  (known species via inventory delta; unknown species via an
  addUnknownToLump wrapper; harvested cell count + species list via
  the forage tele event), pack kg / cap before and after.
- Trip-end snapshot: the moment the scholar's walk home lands on the
  haven tile after a successful forage — dayTicks then, pack kg/cap
  then, stocked candidates remaining then (the next trip's menu).
- Every returnToVillage call (packcomp rule: live = Game.over false
  at entry): pack before (full item rows incl. lump keys/units),
  combined pack kcal, unload kcal. This ties the day decomposition
  to the packcomp/shelling return census (max combined per seed,
  haul-size-shaped flag = max combined < 2,000 over all live returns).
- Say lines all run, for the sense test + failure-reason evidence.

The driver NEVER moves the scholar: no travelTo, returnToVillage,
eat, donateToPantry, shellNuts, identifyPlant, or other state-moving
call in the judged path. Wrappers count only (assignments + orig
passthrough), verified by code read like packcomp.

## Stopping-reason classification (scripts/haulsize-b-lib.js, pure)

Unit = one SUCCESSFUL-TRIP day (a day with >= 1 successful forage).
Per such day, exactly one category, in this priority order:

1. PACK_FULL — a forage call that day returned null with a pack-full
   say line, OR pack kg at trip-end >= 95% of cap.
2. NO_MORE_TARGETS — stocked candidates remaining at trip-end = 0.
3. OUT_OF_TIME — ticks remaining at trip-end (512 - dayTicks) <
   that seed's median full-trip cost (travel out + forage + travel
   home ticks, measured across the seed's trip days; fallback 64
   if the seed has no measurable trip cost).
4. POLICY_ONE_TRIP — none of the above fired, yet no second forage
   trip was attempted that day: ticks remained for another trip,
   stocked targets remained, pack room remained, and the day still
   ended with one sweep. (The competent policy calls
   forageTripSeedFirst at most once per daily() and breaks after
   its first successful forage; this category names that structural
   cap when the measured constraints do NOT explain the stop.)

NO_TRIP days (no forage attempt: needTrip false — pantry >= 25,000
and scholar kcal >= half cap and a recent give) are counted
separately and NEVER classified as a stopping reason: a day with
no trip has no haul to cap.

Per-seed attribution: a seed is ATTRIBUTED to mechanism M iff M is
the modal stopping reason across that seed's successful-trip days
AND M's share >= 50% AND the seed has >= 5 successful-trip days.
Otherwise the seed is UNATTRIBUTED (scattered reasons, or too few
trip days to call). The analyzer prints the full per-day table, so
any classification can be re-derived by hand.

## Primary metric + GO threshold (judge exactly against this)

PRIMARY METRIC: the dominant stopping mechanism across pilot seeds
= the mechanism attributed on the most pilot seeds.

PILOT GO (to confirm): one mechanism attributed on >= 6/8 pilot
seeds. Then CONFIRM on 12 fresh seeds (51511-51522) under the same
attribution rule; CONFIRM GO requires the same mechanism attributed
on >= 9/12 confirm seeds.

PILOT NO-DOMINANT (a finding, not a failure): the instrument
attributes >= 6/8 pilot seeds individually, but to no single
mechanism at >= 6/8 (scattered attribution). Then NO confirm spend:
the pilot result stands as "no dominant mechanism — no single-lever
follow-up", and the evidence file says so. This kills any
single-lever follow-up by itself.

PILOT FAIL (kill, instrument failure): fewer than 6/8 pilot seeds
individually attributed (missing data, unclassifiable days, or
modal shares below 50% on most seeds). Then NO confirm, NO mechanism
claim, evidence only: the instrument could not attribute the
ceiling, and the next run must fix the instrument first.

Secondary (descriptive, never judged): haul-size-shaped seed count
per band (max combined < 2,000); the same attribution restricted to
haul-size-shaped seeds only; per-return combined pack kcal and
nut/acorn counts; ticks split per trip day (forage vs travel vs
other daily actions); known vs unknown species units per forage;
candidate-target profile (nearest stocked tile type/distance).

## Balanced panel (section 15) — inapplicability declaration

No panel compare is fabricated: the panel compares lever arms
through its standardized observer/scorecard/cohort rows; this arm
changes no game code, has no lever arm and no before/after pair —
it is a within-trajectory diagnostic on a single substrate, the
same standing as packcomp/depositkeep. The per-day decomposition
tables ARE the comparison surface. Declared here, before any sim,
not decided after seeing results.

## Sense test (SENSE-TESTING LAW)

At least one transcript slice (one trip day's forage + return
lines) read for meaning in the evidence file: does the day read as
a person foraging, or as a ledger event? Note anything robotic.

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No metric,
threshold, seed, or classification rule may change mid-run; doubts
go there for the NEXT run.

## Commit order (this file + skeletons BEFORE any judged sim)

This prereg, scripts/haulsize-b-lib.js, scripts/haulsize-b-driver.js,
scripts/analyze-haulsize-b.js, and scripts/test-haulsize-b.js (pure
checks + live-control/det paths) are committed FIRST. The pilot
(51501-51508) runs only after that commit lands. The live control
(51509) runs after the prereg commit too — it is instrument proof,
not a judged seed, and its numbers never enter a judged band.
