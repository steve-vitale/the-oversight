# sim-lottery-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: flesh-out loop, run fleshout-20261029T0415Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-lottery-a.
Assignment: LOTTERY-COMPETITION lever, ranked next step #1 from
sim-funnel-a. This arm builds ONE lever and judges it on the funnel
band. It does not touch the homebody question (Steve-call, see
below) and does not touch departure gates or arrival.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands
850-1500 HP, damage 35-95) and evidence/2026-10-29/sim-funnel-a.md
(the funnel diag this arm continues). No CANON-registered doc
covers travel-to-known-monsters, field-fight returns, or the
daily pick lottery — that gap is stated here instead of invented
canon. The mechanism below is derived from code, verified by
reading src/js/villager-objectives.js (objPick, objHuntCandidate,
objHuntFromSite) before this prereg was written:

- RETURN-TO-FIGHT (verified): a villager who actually fights a
  living world monster remembers the fight's tile in
  state.village.monsterSightings[vid] = [{mid, tx, ty, day,
  part}], cap 4, oldest dropped first. Only that villager may
  ever be offered a HUNT back to it. Never from a mere sighting,
  never from gossip, never from the monster list, never for the
  scholar. PERCEPTION LAW (Steve 2026-10-28) is preserved by
  construction: the lever only ever touches a HUNT that
  objHuntCandidate already offers — a fresh fight memory for
  that tile, held by that villager. No roster, no live-monster
  lookup, no routing to a tile nobody fought on.
- HOW EAT BEATS HUNT (verified, and it is NOT a lottery line):
  objPick runs deterministic pre-lottery gates before any
  lottery is built. In order: energy < 35 -> REST; hunger > 55
  AND pantry > 500 -> EAT (indoor, at the fire); fresh
  unrevealed-flesh kill -> HAUL direct (r13 precedent, see
  below); knowledge-seeking -> SEEK. EAT is never a lottery
  candidate: a hungry villager with a fresh hunt memory never
  enters the lottery at all on that pick — the funnel recorder
  still reports a candidate for that pick (it recomputes
  objHuntCandidate after the pick), which is why funnel's
  "offered picks" include pre-lottery EAT picks. Of the funnel
  band's 22 offered picks in lottery-lost triples, 8 chose EAT:
  all 8 are pre-lottery bypasses, not lottery losses. The true
  lottery losses in that set are WATER 7, FORAGE 2,
  HAVEN_CHORE 3, VISIT 2.
- HOW WATER BEATS HUNT (verified): inside the lottery, HUNT
  weighs 2.0 against WATER 3.5-8.5 (ramps as village days-of-
  supply falls below 2; 8.5 when dry), FORAGE up to 4 (+1.5 for
  the feed goal), HAVEN_CHORE 1.4-3 (+goal), VISIT ~1.2-2
  (+goal), TRAPS 1.6, HAUL 1-5.5, EXPLORE/SEEK goal-gated.
  A typical thirsty-morning total is ~10-14, so HUNT's lottery
  share is ~15-20% when water is short, less when forage also
  fires. The funnel fixture lottery (fed, watered villager,
  day 1) drew HUNT 22/200 (11%); the corpus take rate on
  offered picks is 2/36 (5.6%) band-wide, 2/26 (7.7%) on the
  pilot subset 75101-75108 — the gap is the needs story, not
  a recorder gap.
- HUNT GATES (objHuntCandidate, all preserved by the lever):
  memory fresh (age 0-3 days), villager armed, 1 <= Chebyshev
  distance <= npcMaxDist, not sheltering, not resting off a
  bad flee. Homebodies (maxD 0) can never be offered a HUNT:
  this lever does NOT change that. Homebodies are excluded
  from the lever's claims and the question stays a Steve-call
  (funnel ranked next step #2).
- DEPARTURE STILL DECIDES (unchanged): objPick only chooses
  the errand (state 'ready'); objMaybeDepart later departs it
  through danger/heal gates, and a picked hunt can still be
  superseded the same day by a later pick. A take is not a
  departure and a departure is not a meeting — all three are
  reported separately.

## The lever (ONE lever): fresh-memory urgency

A fight memory rots in ~3 days, exactly like the fresh flesh
that earned HAUL its direct priority (r13 2026-10-17: a
time-critical known thing bypasses the chore lottery after
the body-first gates). The hunt offer gets the same urgency
shape, graded by memory age so ordinary days stay ordinary:

- Age 0: HUNT weight 2.0 (unchanged).
- Age 1: HUNT weight 5.0.
- Age 2: HUNT weight 8.0.
- Age 3 (LAST fresh day): HUNT is taken DIRECTLY, after the
  REST gate and preserving the fresh-HAUL direct priority
  (a rotting corpse still goes first), but before the EAT
  pre-gate and the lottery. The villager who knows this is
  the last morning the memory is fresh goes back for the
  beast instead of letting the memory rot over dinner.
  Departure gates, armed/range/fresh gates, and the
  homebody exclusion are untouched — the direct take only
  ever fires on a candidate objHuntCandidate already returns.

Implementation (src/js/villager-objectives.js only, one
rule): (a) after the REST gate, before the EAT gate, compute
the hunt candidate once; if its age is 3 and no fresh
unrevealed haul exists, build the HUNT objective via
objHuntFromSite and return; (b) in the lottery, the HUNT
candidate's weight is 2.0 + 3.0 * age (2/5/8; age 3 never
reaches the lottery). No other weights, gates, or objectives
change. No policy change. No other file's game behavior
changes.

Why this shape, and what it deliberately does NOT do: it
does not raise HUNT on ordinary days to a level that would
swamp food and water (that would be a villager who starves
chasing beasts), and it does not touch the EAT gate on ages
0-2 (a hungry villager still eats first while the memory has
days left). It answers funnel's sense finding — "a lever
that offers the hunt when needs are met, or that lets the
hunt carry its own water/food logic" — in the narrowest
honest form: on the last day, the hunt IS the need that
cannot wait, because tomorrow the memory is gone.

## Fresh band (this arm's own corpora, base vs arm)

- Seeds 75101-75108 (8, pilot) — the first half of the funnel
  band verbatim, so numbers are comparable to funnel/returns/
  w4dpr2. scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1 (all three diag recorders reused
  VERBATIM, never edited; the funnel recorder is
  observational only, pure pre-reads, no game writes, no RNG
  draws). 180d death-aware (runDays stops on death/win, as
  in the predecessor sweeps), competent policy
  (tableseat-nowait). Sweep script reused verbatim:
  scripts/test-funnel-a-sweep.js with SEEDS + EVID env
  overrides (base corpus evidence/2026-10-29/
  perseed-lottery-base/, arm corpus evidence/2026-10-29/
  perseed-lottery-arm/). The predecessor corpus is never
  overwritten and is used only for calibration, never as the
  judged baseline: the judged baseline is a fresh base-code
  sweep on identical seeds, and it is expected to reproduce
  the predecessor pilot rows exactly (determinism check).
- WHY 8 SEEDS: staged method (MEASUREMENT.md §§9-12) — pilot
  before any confirm spend. Confirm (seeds 75101-75116, 16)
  ONLY if the pilot passes its bar below.
- SUBSTRATE (named, never switched mid-run):
  tableseat-nowait. No other policy, no policy edit.

## Instruments (new, scripts/ only)

- scripts/test-lottery-a.js: analyzer. Derives survivor
  triples by the funnel rule verbatim (judgedA meetings:
  wave-4, field channel, caller resolve/patrol/aid,
  non-scholar leader, outcome vFlee, grouped by
  (seed, vid, mid), anchor = first meeting), reuses
  test-funnel-a.js's classifyTriple/isPostAnchorPick for
  the per-triple class, and reports: offered picks (post-
  anchor picks with candidate.mid == triple mid), takes
  (post-anchor picks with chosen.kind == HUNT and
  chosen.huntMid == triple mid), take rate = takes/offered,
  triple-window wave-4 HUNT departures (returns departures
  with objective.kind == HUNT and huntMid == triple mid at
  part >= anchor part), corpus-wide wave-4 HUNT departures
  and true drops, wall numbers (wins, full seat, national
  ever/final, table, entered, wave-4/5 reach, median days),
  guards (starvation deaths, death total). --out JSON for
  the evidence file. --sense prints one full triple trace
  verbatim from the corpus for the sense section.
- scripts/test-lottery-a-fixtures.js: live-harness proof
  of the lever. Seeded villager with a fresh armed in-range
  memory, hungry (hunger > 55, pantry > 500) and thirsty
  (waterDays < 2): age-3 pick MUST be HUNT direct (beats
  the EAT pre-gate and the WATER lottery); age-0 pick MUST
  NOT be forced HUNT (lottery path, weight 2.0 — asserted
  via repeated seeded draws containing a non-HUNT chosen,
  plus the weight helper values 2/5/8 by age). Homebody
  (maxD 0) age-3 pick MUST NOT be HUNT (candidate null,
  exclusion preserved). Determinism: same seed, same
  outcome.

## Pre-registered GO threshold (binding — a miss is NO-GO)

PRIMARY METRIC: take rate over offered picks on the funnel
band, pilot seeds 75101-75108, triple-window definition
above (funnel's definition, so the baseline is comparable).
GO requires ALL of:
  (1) take rate >= 25% on the pilot band, against the
      pilot baseline (fresh base-code sweep, expected
      2/26 = 7.7% from the predecessor corpus calibration);
  (2) triple-window wave-4 HUNT departures >= 3 on the
      pilot band (baseline expected 1);
  (3) determinism: the base-code pilot sweep reproduces
      the predecessor pilot rows' judged channels exactly
      (fieldparty meetings, returns meetings/departures/
      drops per seed) — a mismatch stops the run before
      any arm number is judged.
Horizon 180d death-aware (why: matches the funnel band;
dead villages stop simulating, +10d tail max per the loop
body). Seeds 75101-75108 pilot; 75101-75116 confirm only
on pilot GO. Policy tableseat-nowait (substrate named
above — do NOT switch substrates mid-run).

## Guards (reported, NOT re-scored into a GO — a guard miss
is investigated, and a guard miss on starvation or survival
blocks landing even if the primary metric passes)

- STARVATION: arm starvation deaths <= baseline
  starvation deaths on identical seeds. (Pilot baseline
  starvation deaths from the fresh base sweep; predecessor
  calibration: 75101-75108 starvation detail to be read
  from the base corpus at analysis time, not assumed here.)
- MEDIAN SURVIVAL: arm median days >= baseline median
  days - 30. (A hunt that kills its hunters faster than
  it returns beasts is not a win, even at 25% takes.)
- DEATH TOTAL: reported per seed; a jump concentrated in
  villager monster/combat deaths is investigated as
  lever-caused harm before any landing claim.
- SENSE BAR: >= 1 full triple trace quoted verbatim from
  the ARM corpus (offered picks, what won, what it cost)
  AND a judgment of meaning/coherence — a take that reads
  as a lottery artifact is reported as a sense failure
  even if the counts pass.
- NEUTRALITY OF THE BASE SWEEP: base corpus returns
  channels equal the predecessor pilot rows exactly (see
  GO leg 3). The arm corpus is EXPECTED to differ (that
  is the lever); only the base corpus must reproduce.

## Calibration (from the predecessor funnel corpus, read-only,
NOT the judged baseline)

Pilot subset 75101-75108: 10 triples, 26 offered picks, 2
takes (7.7%), 1 triple-window wave-4 HUNT departure. Both
takes are age-3 picks (d135 pair, seeds 75106). Offered
picks by candidate age: age 1: 12, age 2: 7, age 3: 7,
age 0: 0. Triples with an age-3 offered pick and no take:
catalina_reyes/influencer (EAT), visjoin_102/eulogy
(WATER), ava_garcia/eulogy (WATER) — the direct-take
ceiling on the pilot is therefore 2 + 3 = 5 takes before
counting any age-1/2 weight-curve conversions; the 25% bar
(>= 7 takes at ~26-28 offered) requires the weight curve
to convert at least ~2 earlier-day picks as well. If the
curve converts none, the honest outcome is NO-GO on leg
(1) even if departures rise — the prereg does not lower
the bar after seeing the pilot.

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts about the metric, the lever, or the counting go
here in the evidence file, for the next run's prereg. In
particular: (a) the funnel "offered" definition counts
pre-lottery EAT picks as offered (candidate recomputed
after the pick) — the take rate therefore mixes two
mechanisms (pre-gate bypass vs lottery share); the
evidence reports the EAT-chosen share of offered picks
alongside the headline rate so the next run can judge
whether to split the metric. (b) Triple-window departures
join by part >= anchor part, not by pick linkage — a
departure for the same mid after the anchor counts even
if its pick predates the lever's direct take; the
evidence reports pick-linked departures alongside the
headline count. (c) The age-3 direct take fires on the
first age-3 pick of the day, which may be an idle re-pick
after an indoor objective rather than the dawn pick —
the trace quoted in sense review must show which.
