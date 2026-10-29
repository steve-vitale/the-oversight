# sim-blockscreen-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-blockscreen-b, axis
food-economy (two-stage refused-evening blockage census).
Worktree sim-blockscreen-b. This worker does NOT merge to
master itself — coordinator merges.

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/MAP.md §6 (the way home): node travel is free; the
  lodge detail walk bills walkStepKcal() per landed square;
  a human taps "Go around"; NO TELEPORT, ever.
- No canon doc covers evening-hop refusals specifically
  (stated in the blockedpath diag, the eveningdetour
  prereg, and the blocktype prereg, restated here, not
  invented over): the authority is the engine itself
  (travelTargets()/travelTo()/travelBlockage()) plus the
  prior evidence arms below.
- Design source (read only, NOT judged data):
  evidence/2026-10-29/sim-blocktype-b.md (1130Z arm:
  INSUFFICIENT-DATA — fresh blind band 12000–12079, 80
  seeds, 2383 evenings yielded only 2 refused-prone
  seeds / 4 refused evenings, 2.5% qualifier rate; the
  instrument itself is PROOF-GREEN) and its prereg
  sim-blocktype-b-prereg.md; the 115-evening
  decomposition in evidence/2026-10-29/
  sim-blockedpath-diag-b.md (away-prone-enriched
  population by construction); evidence/2026-10-28/
  sim-nighttravel-bank-b-prereg.md (the bank screen:
  insideevening control legs, qualifier >= 2 near-home
  away evenings at d <= 3 of haven (4,4), 36/448 = 8%
  qualifier rate on 11000–11447).

## Question (DIAG census, read-only/measurement-only)

On CURRENT master, with the evening-detour gate OFF
(default — no driver adopts it), which blockage types
still refuse evenings on refused-prone seeds drawn
from an away-prone screen, in what shares, and which
are already covered by a route-around (i.e. answered
by the eveningdetour lever) vs genuinely uncovered
(no BFS route-around home exists)? NO game change,
NO default flip, NO driver adopts anything in this
arm. If the census shows a type uncovered and a lever
is obvious, it is documented as the next arm — NOT
built here.

## Instrument (policy-side ONLY, default OFF, UNCHANGED)

- scripts/policies/blocktype-diag.js: `withBlocktypeDiag`
  wraps the nighttravel policy (nighttravel.js is NOT
  touched; competent.js is NOT touched; no src/js
  change). On-switch: BLOCKTYPE_DIAG=1 only. When
  unset, daily() delegates unchanged.
- Recorder behavior, classification rule, BFS judge,
  and record shape are EXACTLY as in the blocktype
  prereg (probe = scripts/creekpath-probe-b.js
  `directHopBlockage`, cross-checked against the
  policy's hopReturnKind; mismatch = UNCLASSIFIED;
  route-around = orthogonal BFS; diagonal-only
  passage with no orthogonal path counts as NO
  route-around, honestly uncovered). The recorder is
  reused UNCHANGED unless a bug is proven, in which
  case the fix lands under its own proof and is
  stated in the evidence file.
- Drivers: scripts/nighttravel-trace-b.js for stage-1
  scan legs (POLICY=insideevening, control legs only)
  and scripts/blocktype-trace-b.js for stage-2 census
  legs (POLICY=nighttravel, recorder ON iff
  BLOCKTYPE_DIAG=1). No new driver is written.
- Analyzer: scripts/analyze-nighttravel-scan-b.js
  (stage-1 qualifier order) and
  scripts/analyze-blocktype-b.js (stage-2 census,
  partition, OFF-vs-ON diff).
- Proofs: scripts/test-blocktype-b.js (T1–T8,
  PROOF-GREEN on the 1130Z validation pair) reused
  unchanged for the pilot pair and the full census;
  NEW scripts/test-blockscreen-b.js (staging +
  determinism proof, committed with this prereg):
  S1 scan seeds inside the declared range and in
  complete 40-seed blocks; S2 no scan seed in any
  excluded range; S3 qualifier order is
  (nearHomeAway desc, seed asc); S4 every qualifier
  has nearHomeAway >= 2; S5 bank = first 24
  qualifiers in order (or the short-bank branch);
  D1 determinism — re-running scan legs for 3
  banked seeds reproduces byte-identical files and
  the same qualifier classification (scratch dir
  inside the worktree, deleted before handoff).

## Substrate (asserted FATAL in the drivers)

COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 on every leg. Stage-1 scan legs:
POLICY=insideevening, DAYS=30, TAPDAYS=5 (identical
to the bank scan). Stage-2 census legs:
POLICY=nighttravel, DAYS=30, COMPETENT_EVENING_DETOUR
unset / 0 (the census measures current-master
refusals, detour OFF), no taps (the blocktype driver
has no taps). Horizon 30 loop-days: the refused
pattern is visible inside 30 days; dead villages
stop, +10d tail cap, never a target. Scan legs are
selection data, never judged data; stage-2 search
legs on non-refused-prone banked seeds are
selection data, never census data.

## Stage 1 — away-prone bank (fresh band, control legs only)

- Scan bands: consecutive blocks of 40 seeds starting
  at 12200 — block 1 12200–12239, block 2 12240–12279,
  and so on, into ONE scan corpus directory
  (evidence/2026-10-29/sim-blockscreen-b-scan-insideevening/).
  Scanning STOPS at the end of the first block that
  reaches >= 24 qualifiers, or after block 10
  (12200–12599, 400 seeds), whichever comes first.
  No partial blocks. The >= 24 stop is chosen so
  pilot (8 refused-prone) + full census (rest of
  the bank) can both stage; at the bank's measured
  8% qualifier rate, 400 seeds expect ~32 qualifiers.
- This band is FRESH: it does not overlap the bank
  scan 11000–11447, the detour confirm scan
  11500–11519, or the blocktype blind band
  12000–12079, and no seed from any of those ranges
  is used as judged data in this run.
- Qualifier rule (exact, SAME as the bank scan):
  a seed qualifies iff its control leg has >= 2
  NEAR-HOME AWAY evenings, where a near-home away
  evening is an evening row with eveningOutcome !=
  'game-over', preStepTile != null and != 'haven',
  and evening-end map coords (row.mapPx/mapPy)
  within Manhattan distance <= 3 of the haven node
  (4,4). The scan analyzer enforces control-only
  input mechanically (fatal on any non-insideevening
  file), so the screen cannot select on any
  policy-leg outcome.
- Qualifier ORDER (deterministic, declared now):
  nearHomeAway count desc, ties by seed asc. The
  bank = the first 24 qualifiers in this order.
- PROHIBITIONS (binding): never screen on
  travelOffered, converted, travel outcomes, or any
  policy-leg field; never re-order qualifiers by
  anything but the declared order; never add a seed
  outside the qualifier order to any band; never
  lower min-near or widen the d <= 3 envelope after
  seeing scan yields; never extend past block 10
  silently — if block 10 ends below 24 qualifiers,
  the band is exhausted and the verdict is
  INSUFFICIENT-DATA with the measured rate.

## Stage 2 — refused-prone census (recorder ON, banked seeds only)

- SEARCH: run recorder-ON legs (BLOCKTYPE_DIAG=1)
  on banked seeds IN QUALIFIER ORDER until 8
  refused-prone seeds are found or the bank is
  exhausted. A seed is refused-prone iff its ON leg
  has >= 1 refused evening (eveningOutcome
  'travel-refused', game-over evenings excluded
  from every count, exactly as in the blocktype
  prereg). Search legs on non-refused-prone seeds
  are selection data, not census data.
- PILOT DECLARATION: after the search, BEFORE any
  OFF leg is run, commit a pilot-declaration file
  naming the first 8 refused-prone seeds in
  qualifier order (the pilot). No OFF leg is run
  for any seed outside the declaration.
- PILOT (judged): fresh recorder-OFF legs
  (blocktype driver, BLOCKTYPE_DIAG unset) for the
  8 pilot seeds. Scan legs are NOT reused as OFF
  legs — they are insideevening control legs from
  a different driver, and the blocktype prereg's
  pilot rule requires both legs per seed from the
  same driver. (The 1130Z byte-copy shortcut was
  validation-only and must not become a pilot
  precedent — restated here, not used here.)
- PILOT GATE (all must hold, else the pilot is
  CENSUS-INCOMPLETE and no full-census spend
  follows): both legs present for all 8 pilot
  seeds; partition sums hold on every pilot seed;
  OFF-vs-ON deep-equal with the `blocktype` field
  stripped shows zero diffs (test-blocktype-b.js
  T5); recorder errors = 0 (T7); unclassified
  refused evenings = 0 on the pilot ON legs (T2).
  A pilot-gate failure is diagnosed in the
  evidence file (probe bug? new geometry? engine
  change?) before any further spend; the verdict
  in that case is NO-GO (invalid instrument),
  never a census.
- FULL CENSUS (only if the pilot gate passes):
  run recorder-ON legs on every remaining banked
  seed not yet ON-legged. The census = pooled over
  ALL refused-prone seeds in the bank (pilot 8 +
  newly found refused-prone seeds). Pilot-only
  numbers are reported as a staging diagnostic,
  never as the verdict once the full census runs.

## Primary metric, DIAG-GO bar, guards (judge ONLY against these)

A REFUSED evening = an evening row with
eveningOutcome 'travel-refused' (haven offered, hop
refused), excluding 'game-over' evenings from every
count. An evening is CLASSIFIED iff its blocktype
record exists, has a non-null blockType,
probeAgrees === true, and no recorder error is
attached. A blockType outside the four known types
{washed_out, fallen_tree, rubble, creek} counts as
classified ONLY if probeAgrees and it is reported
as a NEW TYPE (never folded into a known type).
Anything else is UNCLASSIFIED.

- PRIMARY (census completeness, full census):
  unclassified refused evenings = 0 AND refused
  n >= 8 AND refused-prone seeds >= 8.
- DIAG-GO iff the full census meets the primary bar
  AND all guards hold (G-deep-equal on the pilot
  pair, G-no-errors, G-partition on every census
  seed). DIAG-GO lands the default-OFF recorder
  instrument ONLY (already on master from the
  1130Z arm's branch — this arm adds no new
  instrument unless a bug fix proves necessary);
  NO driver adopts it, NO default flip, NO src/js
  change.
- INSUFFICIENT-DATA iff the bank yields < 8
  refused-prone seeds in total (including bank < 8
  away-prone, in which case no stage-2 leg is
  spent at all — DIAG-GO would be arithmetically
  impossible), or the stage-1 band exhausts below
  24 qualifiers with < 8 refused-prone seeds
  found. A band with n < 8 is INSUFFICIENT-DATA,
  not complete and not failed.
- NO-GO iff the pilot gate fails (instrument
  perturbation, recorder errors, or unclassified >
  0 on the pilot) — the census is invalid until
  the cause is found and fixed, and no verdict is
  claimed from the ON legs. A band with
  unclassified > 0 on the full census is likewise
  NO-GO (CENSUS-INCOMPLETE), whatever its n.

## Secondary (reported, never judged)

- Per-type table: counts, shares, distinct blocked
  tiles, consecutive-day episodes, route-around
  length distribution, covered share (route exists)
  and uncovered count (no route) per type.
- The UNCOVERED set: every refused evening with no
  BFS route-around, listed individually (seed, day,
  departure, blocked tile, type) — the next arm's
  input, not a verdict on the detour lever.
- New-type watch: any blockType outside the known four.
- The census is quoted as "among refused evenings on
  refused-prone seeds from an away-prone screen",
  NEVER as a blind-band rate.
- Wall numbers as OBSERVED, never claimed as
  movement: 30-day evening legs are pre-seat, so
  national / table / wins are NOT OBSERVABLE on
  them (no field) — reported explicitly as such.
  If any longer leg is run, its national / table /
  wins / wave 4–5 unlocks / median survival are
  reported labeled with its horizon.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here before judging: this leg is a
30-day position census of a POLICY-SIDE recorder —
zero src/js changes, so there is no game-root delta
for a panel to compare, and the panel's registry
policies do not include the trace policies this arm
measures. The OFF-vs-ON legs are an instrument-
perturbation check (G-deep-equal), not a game
comparison, and the pre-registered census bar above
is the judge. If a future lever becomes a game
change, a panel compare is run at that point.

## Sense-testing (mandatory, in the evidence file)

Read 2–3 refused-evening traces end to end and judge
meaning: does the refusal read honestly in
narration? Does the blockage type match what the
player would see? Is any robotic/static/repeated
beat flagged? Judge meaning, not counts.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who
thrived and who died and why, what knowledge /
capabilities were missing, which blank was filled
(measurement) or documented (evidence). Plus wall
numbers (national / table / wins, wave 4–5 reach,
median survival) even if NOT OBSERVABLE in a 30-day
leg — never claimed as movement unless measured.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. No
mid-run re-scoring: the denominator stays refused
evenings on refused-prone seeds from an away-prone
screen; a thin denominator does not rescue or sink
anything beyond the minimum-n rule stated above.
If the metric proves wrong (e.g. the BFS judge vs
hop-path distinction bites on a judged seed, or
the away-prone screen enriches a different
population than the 115 decomposition's), write it
under "metric review" and propose the revision for
the NEXT run.
