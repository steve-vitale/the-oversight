# sim-blocktype-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-blocktype-b, axis
food-economy (refused-evening blockage census). Worktree
sim-blocktype-b. Base: master c3c8a2718 (ship bump). NOTE ON
BASE: this branch also carries loop A's unmerged departhold
commits (5e502fc6a, b0dc9c81a, 4f2f6c8fa) above c3c8a2718 —
this worker does NOT touch them, and its own commits are
strictly its own files, so the coordinator may merge loop A
first or cherry-pick this arm's commits. This arm does NOT
merge to master itself.

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/MAP.md §6 (the way home): node travel is free; the
  lodge detail walk bills walkStepKcal() per landed square;
  a human taps "Go around"; NO TELEPORT, ever.
- No canon doc covers evening-hop refusals specifically
  (stated in the blockedpath diag and the eveningdetour
  prereg, restated here, not invented over): the authority
  is the engine itself (travelTargets()/travelTo()/
  travelBlockage()) plus the prior evidence arms below.
- Design source (read only, NOT judged data):
  evidence/2026-10-29/sim-blockedpath-diag-b.md (the 115
  refused hops, decomposed: washed_out 41, fallen_tree 33,
  rubble 24, creek 17; all 115 route-around-able, BFS
  lengths 2–5),
  evidence/2026-10-29/sim-eveningdetour-b.md (the detour
  lever: 32/32 refused evenings rescued on refused-prone
  seeds, default-OFF policy, no driver adopts it),
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b.md
  (pooled-36 verdict: 115/176 away evenings refused on a
  blockage). Open findings this arm updates:
  BLOCKED-PATH DOMINANCE (2026-10-29) and FALLEN TREE
  BLOCKS THE HOP HOME (2026-10-28, smoke seed 99994).

## Question (DIAG census, read-only/measurement-only)

On CURRENT master, with the evening-detour gate OFF
(default — no driver adopts it), which blockage types
still refuse evenings, in what shares, and which are
already covered by a route-around (i.e. answered by the
eveningdetour lever) vs genuinely uncovered (no BFS
route-around home exists)? NO game change, NO default
flip, NO driver adopts anything in this arm. If the
census shows a type uncovered and a lever is obvious,
it is documented as the next arm — NOT built here.

## Instrument (policy-side ONLY, default OFF)

- scripts/policies/blocktype-diag.js: `withBlocktypeDiag`
  wraps the nighttravel policy (nighttravel.js is NOT
  touched; competent.js is NOT touched; no src/js change).
  On-switch: BLOCKTYPE_DIAG=1 only. When unset, daily()
  delegates unchanged: no wraps, no ctx surface, no record.
- On a travel-refused evening only (ctx._ntLast.outcome
  === 'travel-refused': haven offered, hop refused, not
  combat, not tent), the recorder classifies AFTER
  inner.daily returns, on the true refused state
  (position unchanged by refusal):
  - blockage: scripts/creekpath-probe-b.js
    `directHopBlockage` (pure reads: destination first,
    then shortest-path intermediates, mirrored from
    travelTo) → {blockType, x, y, leg}. Cross-checked
    against the policy's own hopReturnKind
    ('block:<type>'): a mismatch is recorded as
    UNCLASSIFIED (honest miss, counts against the bar),
    never papered over.
  - route-around: `bfsRouteAround` (orthogonal BFS, each
    step travelBlockage-clean from its origin) →
    {length, path} or null. The BFS (orthogonal) is the
    judge, exactly as in the eveningdetour prereg: a
    diagonal-only passage with no orthogonal path counts
    as NO route-around, honestly uncovered.
  - record: {blockType, blockedTile, leg, hopReturnKind,
    probeAgrees, routeAroundLength, routeAroundPath,
    departure, haven, kcal} into ctx._blocktypeLast;
    the driver writes it into the evening row as
    `blocktype`. The recorder adds NO say lines, draws
    NO RNG, writes NO game state, wraps NO engine
    function. (crossingFix feasibility is NOT re-measured:
    the diag already answered it per type; this census
    asks type + route-around coverage only.)
- Driver scripts/blocktype-trace-b.js (modelled on
  scripts/eveningdetour-trace-b.js, leaner: evenings +
  mornings only, NO thief grant, NO taps — taps are not
  part of this question): one fresh game per seed,
  POLICY=nighttravel, recorder wrapped iff
  BLOCKTYPE_DIAG=1. Write transport mirrors the
  eveningdetour driver (retry + in-worktree staging on
  EPERM flap, never /tmp for final evidence).
- Analyzer scripts/analyze-blocktype-b.js: per-seed and
  pooled per-type tables, unclassified count, covered /
  uncovered split, distinct blocked tiles, episodes,
  OFF-vs-ON diff mode.
- Proof scripts/test-blocktype-b.js: T1–T7 (see below).

## Substrate (asserted FATAL in the driver)

COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=nighttravel,
COMPETENT_EVENING_DETOUR unset / 0 (the census measures
current-master refusals, detour OFF). Horizon 30
loop-days (same as the verdict/detour legs: the refused
pattern is visible inside 30 days; dead villages stop,
+10d tail cap, never a target). Tap days: none (no
taps in this driver).

## Seed plan (FRESH band — judged data never reuses the
eveningdetour/blockedpath corpora)

- SCAN (selection only, NOT judged): fresh band
  12000–12039 (40 seeds, plain nighttravel gate-OFF
  legs — the bank scanned 11000–11447 and the detour
  confirm scan used 11500–11519, so 12000+ is fresh).
  A seed qualifies as refused-prone iff its scan leg
  has >= 1 travel-refused evening. If fewer than 24
  seeds qualify, extend the band in +20 blocks (12040+)
  until 24 qualify or the band is exhausted (reported).
- PILOT (judged): 8 refused-prone seeds from the scan,
  by refused-count descending, ties → lower seed first.
  Two legs per seed: recorder OFF (plain nighttravel)
  and recorder ON (BLOCKTYPE_DIAG=1). Pilot seeds are
  declared in a pilot-declaration file committed AFTER
  the scan and BEFORE any pilot judged leg (mirroring
  the eveningdetour confirm-declaration pattern — the
  prereg declares the SELECTION RULE, the declaration
  names the seeds).
- CONFIRM (judged, only if pilot passes): 12–16 further
  refused-prone seeds from the scan (never pilot seeds),
  recorder ON only (OFF-vs-ON perturbation is proven on
  the pilot band; re-proving it on confirm would double
  cost for no new information — stated here, not
  decided after seeing pilot data).
- The scan legs themselves are never judged data and
  never pooled into a verdict.

## Primary metric, census bar, guards (judge ONLY against these)

A REFUSED evening = an evening row with eveningOutcome
'travel-refused' (haven offered, hop refused), excluding
'game-over' evenings from every count. An evening is
CLASSIFIED iff its blocktype record exists, has a
non-null blockType, probeAgrees === true, and no
recorder error is attached. A blockType outside the
four known types {washed_out, fallen_tree, rubble,
creek} counts as classified ONLY if probeAgrees and
it is reported as a NEW TYPE (it must never be folded
into a known type). Anything else (missing record,
probe error, hop/probe type mismatch) is UNCLASSIFIED.

- PRIMARY (census completeness, per band): unclassified
  refused evenings = 0 AND refused n >= 8.
- CENSUS-COMPLETE requires pilot AND confirm both meet
  the primary bar. A band with unclassified > 0 is
  CENSUS-INCOMPLETE for that band, whatever its n; a
  band with n < 8 is INSUFFICIENT-DATA, not complete
  and not failed.
- G-deep-equal (instrument perturbation, pilot only):
  OFF vs ON evening rows, with the `blocktype` field
  stripped, must be deep-equal on all 8 pilot seeds
  (evenings, mornings, daysAlive, endReason, deaths
  included in the row comparison via the corpus files).
  ANY diff = the recorder perturbs play: the census is
  INVALID until the perturbation is found and fixed,
  and no verdict is claimed from the ON legs.
- G-no-errors: recorder errs = 0 on every judged leg
  (a recorder error on a refused evening makes that
  evening unclassified by definition; errors on other
  evenings are reported, never hidden).
- G-partition: on every judged seed, evenings =
  refused + converted + out-of-reach + blocked-combat +
  blocked-tent + already-inside + other outcomes +
  game-over, with unclassifiedAway-style leftovers = 0;
  the analyzer prints the full partition, and any
  leftover is an investigation item before judging.

## Secondary (reported, never judged)

- Per-type table: counts, shares, distinct blocked
  tiles, consecutive-day episodes, route-around length
  distribution, covered share (route exists) and
  uncovered count (no route) per type.
- The UNCOVERED set: every refused evening with no BFS
  route-around, listed individually (seed, day,
  departure, blocked tile, type) — this is the next
  arm's input, not a verdict on the detour lever.
- New-type watch: any blockType outside the known four.
- Wall numbers as OBSERVED, never claimed as movement:
  maxWaveUnlocked per leg, median survival; national /
  table / wins NOT OBSERVABLE in 30-day position
  traces (no field) — reported, not claimed.

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

## Staged gates

- PILOT GATE: both legs present for all 8 pilot seeds,
  partition sums hold on every seed, no unresolved
  unclassified investigation. If pilot unclassified >
  0, the pilot is CENSUS-INCOMPLETE — diagnose (probe
  bug? new geometry? engine change?) before any
  confirm spend; never confirm on an incomplete
  instrument. If pilot passes, confirm MAY be spent
  (12–16 seeds) only if time remains in this run.
- CONFIRM (only if pilot passes): same primary bar
  pooled over the confirm band; the pilot census is a
  staging result, never pooled into a confirm verdict
  after the fact (pooled numbers are context only).

## Landing rule

- CENSUS-COMPLETE (pilot, and confirm if spent): lands
  the default-OFF recorder instrument ONLY
  (scripts/policies/blocktype-diag.js + trace/analyzer/
  proof instruments, as a policy file no driver adopts
  by default). NO driver adopts it, NO default flip,
  NO src/js change, NO nighttravel.js / competent.js
  change. This worker does NOT merge to master —
  coordinator merges.
- CENSUS-INCOMPLETE / INSUFFICIENT-DATA: the branch
  stays HELD as a landed lever, with corpora committed
  for the next run and the gap named in evidence.
- No lever is built in this arm under any verdict.

## Sense-testing (mandatory, in the evidence file)

Read transcripts end-to-end for at least one refused
evening per type present in the judged bands: does the
refusal line name the block honestly, does the evening
read as a played night away (not a teleport, not a
stall), and is any robotic/static/repeated beat flagged?
Judge meaning, not counts.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who thrived
and who died and why, what knowledge/capabilities were
missing, which blank was filled (measurement) or
documented (evidence). Plus wall numbers (national /
table / wins, wave 4–5 reach, median survival) even if
NOT OBSERVABLE in a 30-day leg — never claimed as
movement unless measured.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. No mid-run
re-scoring: the denominator stays refused evenings on
refused-prone seeds (fresh band); a thin denominator
does not rescue or sink anything beyond the minimum-n
rule stated above. If the metric proves wrong (e.g.
the BFS judge vs hop-path distinction bites on a
judged seed, or the scan enrichment misleads), write
it under "metric review" and propose the revision for
the NEXT run.
