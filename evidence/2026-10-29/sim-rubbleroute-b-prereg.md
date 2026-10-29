# sim-rubbleroute-b — prereg: 12-STEP RUBBLE ROUTE-AROUND (DIAG, measurement only)

Run: oversight-flesh-out-loop-b, arm sim-rubbleroute-b, axis
food-economy. Worktree sim-rubbleroute-b. POLICY-SIDE DIAG
ONLY: scripts/policies/nighttravel.js gate
(COMPETENT_EVENING_DETOUR=1, default OFF, UNCHANGED) +
trace/analyzer/proof instruments. Zero src/js changes, zero
default flips, no driver adopts the policy. This worker does
NOT merge to master — coordinator merges. This prereg is
committed BEFORE any judged leg.

## Backlog question answered

Backlog #1427 (food-economy/travel — 12-STEP RUBBLE
ROUTE-AROUND, from loop-B arm sim-blockscreen2-b, run
fleshout-loop-b-20261029T1441Z,
evidence/2026-10-29/sim-blockscreen2-b.md + scan json
evidence/2026-10-29/sim-blockscreen2-b-scan.json, read
before writing this prereg). The census banked 12
refused-prone seeds, 81 refused evenings, 0 uncovered —
but one "covered" route is 12 steps long, and whether
the eveningdetour lever actually walks the full BFS path
on such a case (and whether a 12-step night walk reads
sensibly) was explicitly NOT answered by the census.

## Facts to start from (verified from the census corpus, not taken on faith)

- Seed 13224: 2 rubble refused evenings, loopDays 4–5
  (gameDays 4–5), departure creek (4,2), blocked tile
  (4,3), census BFS route-around length 12 via the map's
  top edge: [(4,2)–(3,2)–(3,1)–(3,0)–(4,0)–(5,0)–(6,0)–
  (6,1)–(6,2)–(6,3)–(6,4)–(5,4)–(4,4)] (13 nodes, 12
  steps). Census legs ran with the detour OFF.
- Seed 13029 (comparator): 5 rubble refused evenings,
  loopDays 19–23, departure meadow (4,2), blocked tile
  (4,3), census BFS route-around length 4: [(4,2)–(5,2)–
  (5,3)–(4,3)–(4,4)]. Confirmed from the census corpus
  file (not from the evidence prose alone): route length
  4 is inside the prereg's 2–5 short-route band. NOTE
  (recorded, not judged): the census path steps onto the
  blocked tile (4,3) from (5,3) — the blockage refuses
  the direct hop but the census BFS found the (5,3)→
  (4,3) step clean. The trace records the POLICY's own
  BFS path per evening; census-path vs policy-path
  agreement is reported, never assumed.

## Questions (DIAG, not a game change)

1. With the evening detour ON, does the villager on
   13224 days 4–5 actually WALK the full 12-step BFS path
   home (steps walked vs BFS length, arrival tile, ticks
   and kcal spent, arrival before sleep logic)?
2. Is the detour walk offered on every refused evening,
   or only some (offer rate on the seed's refused
   evenings)?
3. Does the night walk complete, truncate, or get
   interrupted (combat, sleep, departure logic)?
4. SENSE (SENSE-TESTING LAW — read tails for meaning,
   not just counts): does any line name the way around?
   Related blanks checked while here: #1428 (13224 wakes
   day 6 still camped at the creek with 182 kcal — is
   the night away marked anywhere?) and #1394 (detour
   narration blank — a routed return arrives as plain
   "Travel 3 tiles to Haven." with no "going around"
   line). Report what the player would actually read.

## Design (fixed before judging)

- SEEDS (fixed here): primary 13224, comparator 13029.
  No other seeds are judged. (A determinism re-run of
  one ON seed is a guard, not a judged seed.)
- HORIZON: 30 loop-days, death-aware (dead villages
  stop simulating; the driver records endReason).
- POLICY/SUBSTRATE (identical both legs, asserted FATAL
  in the tracer): POLICY=nighttravel,
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, BLOCKTYPE_DIAG=1 (recorder ON both
  legs: it fires only on travel-refused evenings, so it
  is silent on rescued evenings and still classifies
  any residual refused evening on the ON leg).
- LEGS: OFF (control, reproduces census;
  COMPETENT_EVENING_DETOUR=0) vs ON
  (COMPETENT_EVENING_DETOUR=1). One shared driver,
  scripts/rubbleroute-trace-b.js (nighttravel policy +
  blocktype recorder + dayTicks in snapshots + full-day
  say capture on detour/refused evenings + overnight say
  capture on the following morning row). The driver
  adds no say lines, draws no RNG, writes no game
  state, and never calls travelTo itself.
- INSTRUMENTS (committed with the evidence, after this
  prereg): scripts/rubbleroute-trace-b.js,
  scripts/analyze-rubbleroute-b.js,
  scripts/test-rubbleroute-b.js (proofs, green
  required).
- CORPORA (committed): evidence/2026-10-29/
  sim-rubbleroute-b-corpus-off/ and
  sim-rubbleroute-b-corpus-on/ (2 files each: 13224,
  13029), plus sim-rubbleroute-b-analysis.json.
- BALANCED PANEL (§15): NO panel compare .md is
  produced, as pre-registered before judging: this leg
  is a 30-day position trace of a POLICY-SIDE gate —
  zero src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the trace policies this arm
  measures. The pre-registered completeness bar below
  is the judge. No telemetry deviation check is
  meaningful on these corpora (no national / table /
  wins / exiled fields exist in 30-day position
  traces), so none is faked.

## Definitions (fixed before judging)

- A DETOUR EVENING is an evening row on the ON leg with
  detourAttempted=true (the policy attempted the BFS
  walk after a hop refusal).
- A detour evening's trace is COMPLETE iff it records
  all of: detour.path (non-null), detour.steps array
  with a moved flag per step, detour.stepsWalked,
  detour.kcalBeforeDetour, detour.kcalAfterDetour,
  detour.ticksBeforeDetour, the evening position
  (arrival tile, inside flag) and the NEXT morning's
  position (persistence past sleep), and the evening
  outcome. Missing any item = UNTRACED.
- OFFER RATE is reported two ways (divergence-aware):
  (i) ON-leg attempts / ON-leg hop refusals
  encountered (by construction expected 1.0 unless the
  gate or a guard intervenes — any miss is named);
  (ii) OFF-refused evenings re-encountered as hop
  refusals on the ON leg / OFF-refused count, with
  each non-re-encountered evening explained by the
  divergence audit (a rescued day-4 evening changes
  day 5's daytime path, so day 5 may never refuse).
  Neither rate is judged against a threshold — this
  is DIAG, and the rates are the answer.
- TICKS/KCAL SPENT on the walk: kcal delta =
  kcalAfterDetour − kcalBeforeDetour (policy
  snapshots, walk only, exact). Ticks: ticksBeforeDetour
  (policy) vs the evening row's post-entry dayTicks,
  with the entry leg's walkTarget.steps reported
  beside it (node travel is free by engine law, so a
  walk-tick count equal to entry steps is consistent
  with a zero-tick walk; any excess is reported as
  walk+entry overhead, never silently attributed).
- ARRIVAL BEFORE SLEEP: the evening row is recorded
  post-daily, pre-sleep by the driver, so an evening
  outcome of completed/already-inside with position
  inside at haven IS arrival before sleep logic; the
  next morning's row confirms persistence.
- UNCLASSIFIED EVENING: an evening row whose
  eveningOutcome is none of the policy's known
  outcomes, or a travel-refused evening whose
  blocktype record is missing or unclassified
  (probeAgrees false or any error field set).

## COMPLETENESS BAR (the DIAG judge)

Every detour evening on the primary + comparator seeds
has a complete walked-step trace (definition above) —
0 untraced detour evenings.

- DIAG-GO: the questions are answered with complete
  traces on both seeds (all four questions have a
  traced, quotable answer; guards a–d pass).
- DIAG-NO-GO: traces incomplete or contradictory on a
  named ground (the ground is named in the evidence;
  the bar is not lowered).
- INSUFFICIENT-DATA: the detour never engages on the
  primary seed (0 detour evenings on 13224 ON) or the
  tracer cannot observe the walk — the ground is
  named, the bar is not lowered.

## Guards (pre-registered)

(a) OFF-LEG REPRODUCTION: OFF evenings on 13224 match
    the census (2 rubble evenings, loopDays 4–5) or
    the mismatch is explained, never silently
    absorbed. Secondary: OFF evenings on 13029 match
    the census (5 rubble evenings, loopDays 19–23)
    or the mismatch is explained.
(b) DETERMINISM: re-running one ON seed (13224) to a
    scratch directory reproduces the judged ON file
    byte-identically; the scratch directory is deleted
    before handoff.
(c) DIVERGENCE AUDIT: the first OFF/ON evening-row
    difference (outcome, position, or kcal) on each
    seed occurs on or after that seed's first detour
    action (13224: loopDay 4; 13029: its first
    detour evening). Any earlier difference is a
    loud failure, not a footnote.
(d) UNCLASSIFIED EVENINGS == 0 on both legs, both
    seeds (definition above).

## What this arm does NOT judge

Whether a 12-step night walk SHOULD be offered — that
is a design question for the evidence's "next lever"
note (with the measured cost: steps, ticks, kcal,
arrival state), not a verdict smuggled in. A miss is
never re-scored; metric doubts go under "metric
review" for the NEXT run. Every evidence file carries
a "metric review" section.

## Wall numbers (every run)

National / table / wins are NOT OBSERVABLE on 30-day
pre-seat legs — reported, not claimed. Wave 4–5
unlocks and median survival are reported from the
corpora if present, never claimed as movement.

## Sense-testing plan

Read, for each detour evening (ON) and each refused
evening (OFF): the evening's full-day say lines
(captured only for detour/refused evenings) and the
following morning's overnight say lines. Judge: does
any line name the way around, the route, or the
detour? Does any line mark the night away (#1428)?
Does the routed return read as plain "Travel N tiles
to Haven." (#1394)? Quote the player-facing lines
verbatim in the evidence.
