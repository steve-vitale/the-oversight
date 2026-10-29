# sim-blockscreen2-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-blockscreen2-b, axis
food-economy (direct refused-evening blockage census).
Worktree sim-blockscreen2-b. This worker does NOT merge to
master itself — coordinator merges.

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/MAP.md §6 (the way home): node travel is free; the
  lodge detail walk bills walkStepKcal() per landed square;
  a human taps "Go around"; NO TELEPORT, ever.
- No canon doc covers evening-hop refusals specifically
  (stated in the blockedpath diag, the eveningdetour
  prereg, the blocktype prereg, and the blockscreen
  prereg, restated here, not invented over): the
  authority is the engine itself
  (travelTargets()/travelTo()/travelBlockage()) plus the
  prior evidence arms below.
- Design source (read only, NOT judged data):
  evidence/2026-10-29/sim-blocktype-b.md (1130Z arm:
  INSUFFICIENT-DATA — fresh blind band 12000–12079, 80
  seeds, 2383 evenings yielded only 2 refused-prone
  seeds / 4 refused evenings, 2.5% qualifier rate;
  instrument PROOF-GREEN) and its prereg
  sim-blocktype-b-prereg.md; evidence/2026-10-29/
  sim-blockscreen-b.md (1330Z arm: INSUFFICIENT-DATA —
  two-stage screen, fresh band 12200–12559, 360 seeds,
  26 away-prone qualifiers at 7.2%, bank 24 yielded
  only 5 refused-prone seeds, 21%; 48 refused evenings
  validation-only, all classified: creek 23,
  washed_out 17, fallen_tree 8, rubble 0 — these must
  NOT be quoted as type shares) and its prereg
  sim-blockscreen-b-prereg.md; backlog item 1421
  (marked claimed for this arm): bank wider
  (~550–650 scan seeds for ~10 refused-prone,
  conditional) OR screen DIRECTLY for refused-prone,
  bar ≥ 12 refused-prone seeds, reporting
  seeds-per-type ALONGSIDE evenings-per-type.

## Choice of screen (direct, not wider-bank — stated now, not after seeing yields)

This run takes option (b), the DIRECT refused-prone
screen, and does NOT take the wider-bank variant.
Reasons, all visible before any judged leg:
- The wider-bank variant inherits the known 21%
  conversion: ~550–650 away-prone-scan seeds buy
  ~40–48 away-prone qualifiers and only then the
  search legs, i.e. two drivers, two corpora, and a
  second selection step whose enrichment is already
  measured as weak — for the same ~600-seed budget
  the direct screen measures the census population
  itself.
- The direct screen's selection variable IS the
  census's conditioning variable (refused-proneness),
  so selecting on it does not bias the estimand:
  the census is quoted, explicitly, as type shares
  among refused evenings on refused-prone seeds
  from a direct screen — never as a blind-band rate.
  The screen's own qualifier rate (qualifiers /
  consecutive fresh seeds scanned) is additionally
  reported as a population-rate measurement directly
  comparable to the blocktype arm's 2.5% blind rate,
  since the scan is consecutive and unenriched.
- One driver, one corpus, one stop rule: fewer
  moving parts than the two-stage screen that just
  failed to form a pilot.

## Question (DIAG census, read-only/measurement-only)

On CURRENT master, with the evening-detour gate OFF
(default — no driver adopts it), which blockage types
still refuse evenings on refused-prone seeds drawn
from a DIRECT refused-prone screen, in what shares
(seeds-per-type AND evenings-per-type), and which
are already covered by a route-around (i.e. answered
by the eveningdetour lever) vs genuinely uncovered
(no BFS route-around home exists)? NO game change,
NO default flip, NO driver adopts anything in this
arm. If the census shows a type uncovered and a
lever is obvious, it is documented as the next arm
— NOT built here.

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
- Driver: scripts/blocktype-trace-b.js (POLICY=
  nighttravel, recorder ON iff BLOCKTYPE_DIAG=1)
  for BOTH the screen legs and the guard legs —
  there is no second driver in this arm. Screen
  legs (recorder ON) ARE the census legs: unlike
  blockscreen-b, whose stage-1 legs were a different
  driver/policy (insideevening control legs) and
  therefore could not be judged data, the direct
  screen's legs already carry the blocktype record
  on every refused evening, so the pooled bank IS
  the census. No screen leg is re-run as a census
  leg, and no census leg is run outside the screen.
- Analyzer: scripts/analyze-blocktype-b.js (census,
  partition, OFF-vs-ON diff).
- Proofs: scripts/test-blocktype-b.js (T1–T8,
  PROOF-GREEN on the 1130Z validation pair and the
  blockscreen-b 5-seed validation set) reused for
  the guard pair; NEW scripts/test-blockscreen2-b.js
  (staging + classification + guard proof, committed
  with this prereg): V1 prior-corpus classification
  reproduction, S1–S5 screen staging, C1 corpus
  identity, G1 OFF-vs-ON deep-equal on the
  validation subset, D1 determinism, U1
  unclassified == 0, P1 partition sums.

## Substrate (asserted FATAL in the driver)

COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 on every leg. POLICY=nighttravel,
DAYS=30, COMPETENT_EVENING_DETOUR unset / 0 (the
census measures current-master refusals, detour
OFF), no taps. Horizon 30 loop-days: the refused
pattern is visible inside 30 days (both prior arms
saw full episodes inside 30 days); dead villages
stop simulating, +10d tail cap, never a target.
The horizon is unchanged from the prior arms so
rates stay comparable (2.5% blind, 21% banked).

## Screen (fresh band, consecutive blocks, stated stop rule)

- Scan bands: consecutive blocks of 40 seeds
  starting at 13000 — block 1 13000–13039, block 2
  13040–13079, and so on, into ONE screen corpus
  directory (evidence/2026-10-29/
  sim-blockscreen2-b-corpus-on/).
- Scanning STOPS at the end of the first block that
  reaches >= 12 qualifiers, or after block 15
  (13000–13599, 600 seeds), whichever comes first.
  No partial blocks. At the blocktype arm's measured
  2.5% blind refused-prone rate, 600 seeds expect
  ~15 qualifiers; the cap is chosen so the run ends
  honestly instead of sweeping forever.
- This band is FRESH: it does not overlap the bank
  scan 11000–11447, the detour confirm scan
  11500–11519, the blocktype blind band 12000–12079,
  or the blockscreen band 12200–12559, and no seed
  from any of those ranges is used as judged data
  in this run. No seed is counted twice across
  bands: the screen is consecutive from 13000, and
  the proof script enforces uniqueness + exclusion
  mechanically (S1/S2).
- Qualifier rule (exact, SAME definition as both
  prior arms): a seed qualifies as refused-prone
  iff its screen leg has >= 1 travel-refused
  evening (eveningOutcome 'travel-refused',
  game-over evenings excluded from every count).
  N = 1, and why: it matches both prior arms'
  definition, keeping the qualifier rate comparable
  to 2.5% blind; refused evenings cluster in
  streaks, so N = 1 already selects episode seeds;
  N >= 2 would roughly halve the yield (on the
  blocktype evidence only 1 of 2 qualifiers had
  >= 2 refused evenings) and bias the census toward
  long episodes, for no census benefit. The guard
  against single-seed geography is the SEED-COUNT
  BAR (>= 12), not a higher N.
- Bank = ALL qualifiers found, in scan order (seed
  asc). No reordering, no hand-picked additions,
  no dropping a qualifier after seeing its type
  mix. If the bar block yields more than 12
  qualifiers, the bank is all of them (the stop is
  at a block end, never mid-block).
- If the bank hits the bar, BANK THE SEEDS (list
  them explicitly in the evidence file) for the
  next pilot run and STOP — no further ON legs,
  no further scan blocks, no OFF legs beyond the
  validation subset below. The pooled bank is
  already the census; nothing further is spent.

## Guard legs (validation subset only, preregistered here)

- Validation subset = the FIRST min(4, banked)
  seeds in bank order. Fresh recorder-OFF legs
  (blocktype driver, BLOCKTYPE_DIAG unset) into
  evidence/2026-10-29/sim-blockscreen2-b-corpus-off/.
- Guard requirement (G1): OFF-vs-ON deep-equal
  with the `blocktype` field stripped shows zero
  diffs on the validation subset (analyzer diff
  mode + test-blockscreen2-b.js G1). Partition
  sums hold on every screen seed (P1); recorder
  errors = 0 (T7 via the analyzer's recorderErrs
  field, reported per seed).
- Guard legs are run EVEN IF the bank falls below
  the bar (provided >= 1 qualifier exists): the
  non-perturbation check on this fresh band is
  cheap (<= 4 legs) and is instrument evidence for
  the next run. If the bank is 0, no guard legs
  exist and the guard is reported NOT PROVEN, never
  claimed.
- Determinism (D1): re-run screen legs for 3 seeds
  (first 3 qualifiers if >= 3 exist, else the first
  3 scanned seeds) into a scratch directory inside
  the worktree, require byte-identical files and
  identical qualifier classification, then DELETE
  the scratch directory before handoff.

## Primary metric, verdict bars, guards (judge ONLY against these)

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

- PRIMARY (census completeness): unclassified
  refused evenings = 0 AND refused-prone seeds
  banked >= 12. (The prior arms' refused-n >= 8
  floor is retained as a secondary floor: a bank
  of >= 12 seeds with refused n < 8 is impossible
  under N = 1 — each banked seed contributes >= 1
  refused evening — so the floor is automatic, but
  it is still reported.)
- BANKED (>= 12) iff the primary bar holds AND all
  guards hold (G1 deep-equal on the validation
  subset, G-no-errors, G-partition on every banked
  seed). BANKED lands the census verdict: the
  per-type table (seeds-per-type AND
  evenings-per-type) and the uncovered set, quoted
  as "among refused evenings on refused-prone seeds
  from a direct refused-prone screen on fresh band
  13000+", NEVER as a blind-band rate. The banked
  seed list is published for the next pilot run.
  BANKED lands the default-OFF recorder instrument
  ONLY (already on master from the 1130Z arm's
  branch — this arm adds no new instrument unless
  a bug fix proves necessary); NO driver adopts it,
  NO default flip, NO src/js change.
- INSUFFICIENT-DATA iff the scan cap (600 seeds)
  hits with < 12 qualifiers banked. This is honest,
  not a kill: report the measured qualifier rate,
  the banked seeds found (if any), and the band
  size the next prereg would need (ceil(12 / rate)
  seeds, rounded up to whole 40-seed blocks, stated
  with the rate's own uncertainty — at thin counts
  the point estimate is noisy and the next prereg
  should budget above it, not exactly on it). Do
  NOT keep sweeping past the cap.
- NO-GO iff the guard fails (instrument
  perturbation, recorder errors, or unclassified >
  0 on banked seeds) — the census is invalid until
  the cause is found and fixed, and no verdict is
  claimed from the ON legs. A bank with
  unclassified > 0 is NO-GO (CENSUS-INCOMPLETE),
  whatever its n.

## Secondary (reported, never judged)

- Per-type table: counts AND shares under BOTH
  countings — evenings-per-type (refused evenings
  of that type / all refused evenings) and
  seeds-per-type (banked seeds contributing >= 1
  evening of that type / banked seeds; a type
  carried by one seed is flagged as a geography
  note, not a share, in the evidence text).
- Distinct blocked tiles, consecutive-day episodes,
  route-around length distribution, covered share
  (route exists) and uncovered count (no route)
  per type.
- The UNCOVERED set: every refused evening with no
  BFS route-around, listed individually (seed, day,
  departure, blocked tile, type) — the next arm's
  input, not a verdict on the detour lever.
- New-type watch: any blockType outside the known four.
- The direct-screen qualifier rate itself (banked /
  scanned) as a population-rate measurement,
  comparable to the blocktype arm's 2.5%.
- Wall numbers as OBSERVED, never claimed as
  movement: 30-day evening legs are pre-seat, so
  national / table / wins are NOT OBSERVABLE on
  them (no field) — reported explicitly as such.
  maxWaveUnlocked per banked seed and median
  survival (daysAlive) are reported labeled with
  the 30-day horizon.

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
change, a panel compare is run at that point. No
telemetry deviation check is meaningful on these
corpora either (no national / table / wins / exiled
fields exist in 30-day position traces), so none
is faked.

## Sense-testing (mandatory, in the evidence file)

Read 2–3 refused-evening traces end to end and judge
meaning: does the refusal read honestly in
narration? Does the blockage type match what the
player would see? Is any robotic/static/repeated
beat flagged? Refused evenings must read as real
blockages, not recorder artifacts. Judge meaning,
not counts.

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
evenings on refused-prone seeds from a direct
screen on fresh band 13000+; a thin denominator
does not rescue or sink anything beyond the bars
stated above. If the metric proves wrong (e.g. the
BFS judge vs hop-path distinction bites on a
judged seed, or the direct screen's qualifier rate
lands far from the 2.5% blind expectation in a way
that changes the next prereg's band math), write it
under "metric review" and propose the revision for
the NEXT run.
