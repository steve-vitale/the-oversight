# sim-absencehunt-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-absencehunt-b, axis food-economy.
Worktree sim-absencehunt-b, branch sim-absencehunt-b.
DIAG ONLY (measurement): zero src/js changes, zero policy-default flips,
zero edits to any existing policy file or existing script. New files only
(driver, splitter, analyzer, proof test, prereg, evidence, corpora). This
worker does NOT push, bump, or verify live; the coordinator merges. Status
to coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/TIME-ECONOMY.md (ticks/day-parts; node
travel free, the steps to the edge already cost; forage 16 ticks +
60 kcal). No canon doc covers the departure gate itself — stated here
instead of inventing canon. Standing rules that bear on it: perception
law (Steve 2026-10-28: decisions from what the villager senses — its
own tile, its own pack, its own clock; the probe reads only those,
plus the policy ctx the harness itself hands the routine, which is the
routine's own memory, not a roster feed), and "no silent actions"
(every act narrated; the sense test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-strandbank-b.md + prereg (SUBSTRATE-MISSING:
  18 seeds, 36 legs, 0 still-creek evenings, 0 genuine creek evenings
  on the nighttravel competent stack; the 16506 haven-bucket case:
  bucket creek + rescued true while the vessel sits AT haven, outcome
  travel-refused — raw bucket counts and haven-checked counts diverge
  there, so this prereg states which count is primary).
- evidence/2026-10-31/sim-departdiag-b.md + prereg (DIAG-GO: departure
  gate = return leg; vessel leaves daily on 210/240 days per leg but
  returns nightly; metric review: the next departure census must
  count THREE things separately — overnight departures, day trips
  out-and-back, multi-hop non-forage excursions — and its new doubt:
  if walkHome + nighttravel-hop succeed on every band, no strand arm
  can ever re-derive an overnight absence, and strand work needs a
  return-failure substrate first).
- evidence/2026-10-31/sim-food-economy-round-1630-b.md (next blanks:
  an overnight absence must be producible before any strand arm is
  planned; day trips are not substrate).

## The question

Does a genuine overnight absence (a vessel ending the day away from
Haven) exist ANYWHERE on current master — on any policy, any seed
band, any horizon — or is the strand road dead on all searched bands?
This is a DIAG wide search, not a lever judgement: no lever is judged,
no parked strand design is revived by this arm (fedevening
branch-fire, axefirst joint proof stay PARKED unless this search
produces a genuine absence band with its own new prereg — this arm
only reports the band).

## What the code says before any sim (reading, not a verdict)

Three return mechanisms already identified in prior arms all push the
vessel home before night, and this search is designed to stress each:

1. competent.daily's end-of-day walkHome (competent.js ~1239: still
   away from haven -> walk home via walkHome) — binds P2.
2. forageTripSeedFirst's trailing walkHome (competent.js:1487) —
   binds every competent-based policy's forage trips.
3. nighttravel's evening hop home (policies/nighttravel.js: one
   honest travelTo hop when the day ends away but within reach) —
   binds P1 only; P2/P3/P4 have no evening rescue.

Two policies in the grid are NOT bound by all three, which is why
they are the search's live hypotheses:

- P3 deed-seeking (policies/deed-seeking.js): daily() runs
  competent.daily (which ends with walkHome) and THEN deedPatrol,
  which travels to up to 4 farthest-first non-haven tiles and
  forages, with NO walk home afterwards. A patrol day can
  therefore end away — the strongest haven-board candidate.
- P4 nomadseek (policies/nomadseek.js): on the road, the village
  daily is SKIPPED and the bearer <redacted> physically away. Road days
  are counted separately (below) and do NOT satisfy the GO bar: a
  road band is not a strand band, and the strand arm cannot use it.

## Base commit (pinned)

Base commit for every leg in this arm:
a3e57bfc17a95d90773634d24f7d39b8c34123c3 (worktree HEAD at prereg
writing time). The census is a fresh measurement on THIS base, never
a reuse of strandbank/departdiag corpora (their base f536e3ad3 is an
ancestor; intervening landings include journey-social r77 work).

## Base-equality check (BEFORE judged legs, NOT judged)

Run scripts/morningcarry-trace-b.js VERBATIM (unmodified, as
committed on this base) on seed 15215, guard + ON legs, DAYS=30,
substrate env exactly as strandbank used it (POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
WOODCARRY=1, WOODWARM=0/1, MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB
unset/0), OUTDIR redirected to this arm's basecheck dirs only.
Record verbatim: creek evenings per leg (raw bucket AND haven-
checked), still evenings, evenings at haven, days survived, spawn
vessel id. STOP CONDITION (from the brief, binding): if the
verbatim instrument does NOT reproduce the current-base [] / []
reading (creek [] and still [] on both legs, haven-checked), STOP
and report — do not judge, do not re-derive, do not proceed to
Stage A. The basecheck corpora are never mixed into judged corpora.

## Policies (existing files only, no edits, no default flips)

- P1 nighttravel-stack: withWoodwarm(withWoodcarry(nighttravel)),
  WOODWARM=1 (the full stack; guard/ON decision identity on
  stay-home bands was established by departdiag + strandbank, and
  the basecheck above carries the guard leg on 15215).
- P2 competent: plain competent.daily, no wrappers, no evening
  rescue beyond competent's own end-of-daily walkHome.
- P3 deed-seeking: competent.daily + deedPatrol (far patrol, no
  walk home after) + surgeUpkeep.
- P4 nomadseek: capable base + road drive; village daily skipped
  on road days by the policy's own design.

Substrate env asserted FATAL in the driver for ALL policies:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0.
P1 additionally asserts WOODCARRY=1, WOODWARM=1; P2/P3/P4 assert
WOODCARRY/WOODWARM unset/0 (no woodcarry bucket on those legs —
stated, not hidden). Capable's internal env save/restore is
policy-internal behavior, not a default flip by this arm.

## Search grid (declared fully, run exactly)

Seed bands (fresh 175xx range, disjoint from the strandbank bank
15xxx, stage-2 16501-16508, and the departdiag band; no seed in
either band was used by any prior strand arm):

- Band F1: 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508
- Band F2: 17511, 17512, 17513, 17514, 17515, 17516, 17517, 17518

Stage A — PILOT (8 seeds before any confirm spend): F1 x 30d x
all 4 policies = 32 legs. INSTRUMENT GATE before Stage B: every
leg errs 0, decisions == evenings in count, loop-days complete or
a game-over with its day recorded. If the gate fails, STOP and
report — no confirm spend on a broken instrument.

Stage B — unconditional on RESULTS, conditional only on the Stage A
instrument gate: F2 x 30d x all 4 policies (32 legs) + F1 x 60d x
all 4 policies (32 legs). Total grid: 96 legs. Horizons are
death-aware: the harness stops at Game.over (dead villages stop
simulating; the +10d tail is the harness's own end handling).
Never a fixed 200d.

## Primary metric + verdict bar (judged exactly as written)

Per loop-day, the driver records a morning snap (state at the
START of that day's daily() call) and an evening snap (state
after daily(), before the harness's sleep). Definitions (the
analyzer implements exactly these):

- atHaven (HAVEN-CHECKED, PRIMARY — this answers strandbank's
  lesson): morning/evening insideHaven true OR tile 'haven' OR
  map position equals the village (px, py) node. For P1 the
  analyzer ALSO reports the raw woodcarry-bucket creek count;
  if raw and haven-checked diverge, the haven-checked count is
  primary and both are reported.
- eveningAway: evening snap NOT atHaven.
- morningAway: following loop-day morning snap NOT atHaven.
- onRoad: nomad road active at the evening snap (state.road.active
  or Game.nomad.onRoad() true). A road eveningAway is a ROAD
  ABSENCE, counted separately, never in the primary count.
- GENUINE overnight absence (primary): eveningAway AND NOT onRoad
  AND (following morning away OR no following morning because the
  run ended that night — a vessel that dies away or whose run
  ends away still spent the night away). An eveningAway whose
  following morning is AT haven is a SLEEP-RETURN artifact,
  excluded from primary, reported separately.
- Departure: a haven-morning -> away-evening transition
  (haven-board only; road transitions counted separately).
- Day trip out-and-back: starts at haven, ends at haven, with
  outward evidence that day: forageTrips delta > 0 OR patrols
  delta > 0 OR >= 1 travel-leg line in that day's say lines.
- Multi-hop non-forage excursion: starts at haven, ends at
  haven, forageTrips delta == 0 AND patrols delta == 0 AND
  >= 4 travel-leg lines in that day's say lines. (Travel-leg
  line = a say line matching /travel \d+ tile|walk back into
  haven|you walk|walked to/i — the analyzer's regex, pure-tested.)
- Away-origin day: a morning away (continuation of an absence,
  not a new departure).

Counts are reported separately on EVERY leg for all three
departdiag classes (overnight departures, day trips, multi-hop
excursions) plus road absences, away-origin days, and
sleep-return artifacts. Nothing is pooled across policies or
bands in the verdict counts.

GO BAR (pre-registered exactly): >= 3 seeds with >= 1 genuine
haven-board overnight absence AND a named band/policy the next
strand arm can use (band + policy + seeds listed in the
evidence). Road-only absences do NOT satisfy the GO bar.
If zero genuine haven-board absences on the whole
pre-registered grid, verdict = ABSENCE-UNREACHABLE on the
searched grid on current master (strand work pivots — this
does NOT claim universal impossibility beyond the grid).
No metric is re-scored mid-run: a miss is NO-GO under §14,
never re-scored against a friendlier metric.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: driver + splitter + analyzer + pure proof test,
  committed before judged legs. Pure proof must pass before any
  judged leg runs.
- BASE-EQUALITY CHECK (above): before judged legs, never judged.
- JUDGED LEGS: stdout-runner transport (sim prints one JSON line
  per seed to stdout; stdout -> file in evidence/ in a foreground
  exec; idle splitter splits into per-seed files; jsonl deleted
  after split). Judged corpora are NEVER staged in /tmp, and
  judged legs NEVER write files from a game-loaded process.
- SENSE TEST (law): if absences exist, read the absence days'
  transcripts end to end (departure day, away night, return or
  continuation) on at least two seeds; if no absences exist,
  sense-read haven-bound days on at least two policies (P3 patrol
  days + P1 anchor), all 30 days skimmed, days 1-7 read closely:
  transcripts, dialogue, meaning/coherence. A village that reads
  as people living days is a PASS on what exists, with the
  absence gap stated, not hidden. A silent day, a repeated loop
  with no variation, or a line that claims travel that did not
  happen is a sense failure, reported as such.
- EVIDENCE: evidence/2026-10-31/sim-absencehunt-b.md — census
  tables per policy/band/horizon, village assessment in plain
  words, wall numbers as not-observable, metric review, §15
  declaration.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm stack, the
deed-seeking far patrol, the nomad road, a 30/60-day per-day
absence census, or a census with no variant. The comparison here
is a census across policies on identical seeds through the census
analyzer, never labeled a panel comparison. No panel result is
fabricated; the panel tool is not invoked on this corpus. If a
lever comparison arises (none is planned — this arm is DIAG
only), it will run through scripts/balance-panel.js and the
compare .md will be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether the primary still/away count should be raw or
  haven-checked: HAVEN-CHECKED is primary here (strandbank's
  16506 lesson); raw bucket counts are reported alongside for
  P1 so any divergence is visible, not smoothed.
- Whether a road absence should count toward a strand band: NO
  under this prereg (different board/system, unusable by a
  strand arm); road absences are reported as their own class
  so a future prereg can argue otherwise with evidence.
- Whether the sleep-return artifact class will be non-empty: if
  an eveningAway is followed by a haven morning, the next run
  should instrument Game.sleep itself (as morningcarry did) to
  find which night step returns the vessel.
- Whether deed-seeking patrol days that end away but in combat
  (blocked-combat evenings) count: YES under this prereg if the
  evening snap is away and the following morning is away or the
  run ended — combat does not cancel an absence; the evening
  outcome is recorded alongside so the class is auditable.
