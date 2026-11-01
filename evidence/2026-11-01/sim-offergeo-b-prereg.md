# sim-offergeo-b — PRE-REGISTRATION (binding, committed BEFORE any judged census)

Run: oversight-flesh-out-loop-b, arm sim-offergeo-b, run
fleshout-loop-b-20261101T0630Z, axis food-economy (offer
geometry). Worktree sim-offergeo-b, branch sim-offergeo-b.
Base: worktree HEAD at prereg writing time (recorded in the
evidence file's Files section; the prereg commit hash is the
base for this arm). DIAG ONLY (measurement): zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. New files only:
this prereg, one new analyzer
(scripts/analyze-offergeo-b.js), one proof test
(scripts/test-offergeo-b.js), evidence, censuses, and
new-base leg corpora (if run). The absencehunt driver,
creekseek driver, absencehunt analyzer, awayeve analyzer,
eveningstep analyzer, and strandtile analyzer are REUSED
VERBATIM from the base (no edits). This worker does NOT
push, bump, verify live, merge into master, or touch the
sibling Loop A tree/branch, any journey-* tree/branch, or
the main tree; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator
merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (one continuous map;
home board 0..8; haven at the village coordinate, default
(4,4); travelTargets offers home tiles revealed within 3
or adjacent into fog; beyond-edge tiles adjacent-offered;
NO TELEPORT ever; a villager's RETURN walk may step
through beyond coordinates only because it retraces ground
already stood on) and docs/TIME-ECONOMY.md (one clock;
node travel is FREE — the steps to the edge already cost;
the world still takes one batch turn per travel). No canon
doc covers an evening-step leg taxonomy — the taxonomy is
read off the policy code itself
(scripts/policies/nighttravel.js nightStep,
scripts/policies/insideevening.js eveningStep), as the
prior eveningstep arm did, not invented as canon.
Standing rules that bear on it: perception law (Steve
2026-10-28: every census field is read from the
villager's own evening snap, its own day lines, and its
own following morning — never from a roster or list
feed) and "no silent actions" (the sense test reads
transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-eveningstep-b.md + prereg
  (DIAG-GO, run 0545Z): on seed 17563 day 5 the evening
  step offers haven, the hop moves the villager from
  (5,3) to the haven node, the lodge entry then FAILS
  (walk-no-path, she sleeps outside on the haven tile)
  — and the evening is still a haven evening because
  atHaven is position-based. Entry is proven
  unnecessary, not just unneeded. Pooled leg-path
  census 2,856 evenings: hop converts exactly 1 evening
  in 714 (17563 day 5 itself); hop-yes-entry-yes = 0 on
  both stacks. The other judged pairs were
  daytime-divergence, not evening conversions. The
  evening step's systematic work is attempting returns
  and being told home is unoffered.
- evidence/2026-11-01/sim-death17549-b.md + prereg and
  the awayeve corpora
  (evidence/2026-11-01/sim-awayeve-b-corpus-pilot-*
  and -confirm-*, base 6409c1312): reused VERBATIM
  where they carry what is needed. The 0545Z
  eveningstep censuses (sim-eveningstep-b-census-*.json)
  are also committed and reusable verbatim.
- Tracker next blank (1) from run 0545Z, in order:
  OFFER GEOMETRY — which departure tiles/distances
  offer haven at the evening step, and what does a
  lodge-entry failure on the haven node actually cost?

## The question

(1) OFFER GEOMETRY: for every evening on which the
evening step evaluates the offer, which departure tile
and which distance to haven was offered haven, and
which was not? (2) ENTRY-FAILURE COST: for evenings
where the lodge entry fails on the haven node, what
does the failure actually cost — measured in the
terms below, since haven-evening status itself is
already known to be position-based and therefore
unaffected by entry?

## Geometry, read off the code (not invented)

- DISTANCE METRIC (single, code's own): Manhattan
  distance, exactly as nighttravel.js computes it:
  `rec.havenDistance = |before.mapPx - hx| +
  |before.mapPy - hy|`, where (hx, hy) is the haven
  node from state.village.px/py (default 4,4). The
  engine's travelTargets() uses the identical formula
  (`d = |x - map.px| + |y - map.py|`) and offers a
  home tile iff `d > 0 AND (d <= 3 AND tile.revealed
  OR d === 1)`, plus orthogonal-adjacent beyond-edge
  tiles at d = 1. No second geometry is introduced.
- HAVEN COORDS: the corpus's havenPx/havenPy are
  null on every snap (eveningstep note), so haven is
  taken as (4,4): the nighttravel default, the
  village coordinate in MAP.md, and the coordinate of
  every haven evening snap in the corpora. The
  analyzer asserts this: any haven-tile evening snap
  NOT at (4,4) is reported as a surprise and breaks
  the haven-coords assumption openly, never silently.
- DEPARTURE TILE: the villager's map position at the
  moment nightStep starts (after competent.daily, and
  after the creek visit on creekseek). RECOVERY RULES
  (from the corpus alone, stated before counting):
  (i) For every evening on which the step moves
  nothing — out-of-reach, travel-refused,
  blocked-combat, blocked-tent — the evening snap's
  (mapPx, mapPy) IS the departure tile exactly: the
  step moved nothing, and the entry walk moves
  detail (mx, my) only, never map position.
  (ii) For hop evenings (travelledHome true) the
  evening snap is the haven node, NOT the departure;
  departure is recovered from the day's own lines
  ("Travel N tiles to Haven." gives N = the hop
  distance, hence the Manhattan band; the departure
  tile itself is stated only where the day lines plus
  the prior evening pin it, otherwise the tile is
  recorded line-derived/uncertain and the distance
  band — which the line states directly — is what
  the band table counts). Hop evenings are at most
  1 per stack-corpus, so this affects at most 2
  rows and is itemized per row, never pooled away.
  (iii) Daytime-arrival haven evenings (entry-only)
  have no departure question: the day ended at haven
  on its own, and the step never evaluates the offer.
- OFFER EVALUATED SET (the only evenings that enter
  the offer table): away evenings on P1/creekseek on
  which the step reached the offer check, i.e.
  outcomes out-of-reach (NOT offered), travel-refused
  (offered, hop refused), travelledHome true
  (offered, hop moved), travel-arrived-combat and
  travel-died (offered, hop moved, entry skipped) if
  any occur. EXCLUDED, with reason: entry-only haven
  evenings (step delegates to entry without an offer
  check — 680/stack in eveningstep), guard-combat /
  guard-tent evenings on haven days (guard fires
  before the offer check), BARE/P3 evenings (no step
  at all — no offer data exists), and game-over
  evenings. An offer table that counted entry-only
  haven evenings as "offered" would be exactly the
  pooled-share error eveningstep warned against.
- OFFER CLASSIFICATION from corpus fields alone:
  out-of-reach = not offered; travel-refused /
  travelledHome-true / travel-arrived-combat /
  travel-died = offered. The corpus does not store
  nighttravel's travelOffered boolean (only outcome /
  travelledHome), so this recovery is by the code's
  own branching: each of those outcomes is reachable
  by exactly one branch. Any outcome outside the
  taxonomy on an away evening is an instrument
  surprise and fails bar (c) if it falls on a
  counted evening.

## Distance bands (fixed before counting)

Bands, pooled across P1 + creekseek (the two stacks
with a step), across all 24 committed seeds:
  Band A: d <= 3 (the engine's revealed-offer zone)
  Band B: d = 4-5
  Band C: d >= 6
Band A is EXPECTED to be small — structurally: an
away evening at d <= 3 that is offered and unblocked
converts to haven the same night and therefore never
appears as an away evening; Band A can only ever
contain hop-refused, guard, and hop-converted
evenings. That expectation does NOT change the bands
mid-run: if a band falls short of n >= 20, bar (a)'s
alternative clause applies (proven statement + new
legs, below), never a re-banding.

## Entry-failure cost: cohorts and cost dimensions (fixed before counting)

Two cohorts, kept separate (conflating them is the
error this arm must not make):
- COHORT H (hop cohort): hop-yes evenings split by
  entry outcome — entry-no (walk-no-path /
  no-go-inside-button / entry-refused /
  walk-interrupted-combat) vs entry-yes (completed /
  already-inside). Eveningstep already reports
  hop-yes-entry-yes = 0 on both stacks; if that zero
  reproduces here, the zero IS the finding for
  cohort H and is stated as a proven zero, never
  padded with daytime-arrival successes.
- COHORT A (all-haven cohort): ALL haven-tile
  evenings split by entry outcome — entry-fail
  (walk-no-path / no-go-inside-button /
  entry-refused / walk-interrupted-combat, evening
  tile 'haven') vs entry-success (completed /
  already-inside). This is the cohort that can reach
  n >= 5 entry-fail evenings; cohort H alone cannot
  be expected to, and bar (b) is judged on cohort A
  for the n >= 5 count plus cohort H's proven-zero
  statement.
COST DIMENSIONS (all read from the villager's own
evening snap and its own following morning — perception
law; day-30 evenings have no following morning in the
30d window and are excluded from next-morning measures,
with the excluded count stated):
  1. Haven-evening rate for entry-fail evenings:
     share of entry-fail evenings whose evening class
     is haven. (Note, stated upfront: entry is only
     attempted on the haven tile, so this rate is
     definitional — 100% by construction — and the
     empirical cost question lives in dimensions 2-5,
     not here. Reporting 100% without that note would
     be misleading.)
  2. Next-morning inside status (inside true/false)
     and next-morning tile/map position (still at
     haven, or out again).
  3. Overnight kcal delta: next-morning kcal minus
     evening kcal (the only metabolic trace the corpus
     carries across the night; endDay burn is inside
     it, and it is reported as an observed delta, never
     labeled "sleep quality").
  4. Next-day departure: does the villager leave haven
     on the following day (following evening away vs
     haven), and does the vessel change (succession
     overnight — vesselId change morning-to-morning)?
  5. Next-morning inCombat / gameOver flags.
UNOBSERVABLE IN THIS CORPUS (stated, not invented):
HP, energy/rest quality, disease/exposure, and any
"sleep quality" score — no corpus snap carries such
a field, so no such cost is claimed. If a dimension
above proves uncomputable on a cohort (e.g. all its
evenings are day-30), that is reported as
uncomputable with counts, never filled with a proxy.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: the offer-by-distance table — offered
share per distance band over the offer-evaluated set
— plus the entry-failure cost deltas (cohort A
entry-fail vs entry-success on dimensions 2-5, and
cohort H's entry-yes count).

GO BARS (ALL must hold):
(a) OFFER-BY-DISTANCE TABLE: at least 3 distance
  bands (A, B, C above), each with n >= 20 evenings
  pooled across policies/seeds, with bands and
  counts stated; OR a proven, dated statement of why
  a band cannot reach n >= 20 on the available
  corpora PLUS the new-base legs run to close it
  (new seeds, same drivers, this base, labeled
  new-base and never presented as reproductions of
  the awayeve legs — a base move re-rolls the shared
  RNG stream, so new-base legs are new evidence,
  not a re-derivation).
(b) ENTRY-FAILURE COST quantified on at least 5
  entry-fail evenings (cohort A), with the
  haven-evening rate for entry-fail evenings stated
  (including the definitional note above); cohort H
  reported with its entry-yes count, or the
  proven-zero statement if entry-success is absent.
(c) PROOF TEST: scripts/test-offergeo-b.js green,
  and every census number in the evidence file
  re-readable from a committed corpus file (committed
  censuses under evidence/2026-11-01/
  sim-offergeo-b-census-*.json; new-base legs, if
  run, under sim-offergeo-b-corpus-newbase-*).

- GO: verdict = OFFER GEOMETRY MEASURED; the table,
  the cost deltas, and the sense read are reported.
  A GO here is still DIAG: it authorizes NO src/js
  fix and NO default change.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = OFFER GEOMETRY NOT
  MEASURED on this corpus; the failing bar is named
  exactly, with numbers. A documented failure to
  reach a band or a cost cohort is a NO-GO unless
  it meets bar (a)'s or (b)'s stated alternative.
- HELD: instrument blocked (needed field absent from
  every corpus and unrecoverable by the recovery
  rules above, and new-base legs cannot supply it) —
  the block is stated, no verdict is claimed.

Secondary reported items (never pooled into a verdict
count): the full departure-tile table (tile ->
offered / not-offered / hop-refused / hop-yes counts,
with hop rows flagged line-derived); creekseek vs P1
contrasts (the creek visit moves the departure tile
before the step — its departure is the post-visit
tile, stated per row); the guard-combat haven
evenings excluded from the offer table, counted
separately; and the following-morning stick rate for
hop evenings specifically (does the haven evening
stick overnight, 17563 day 5 already known: yes,
day 6 morning haven (4,4), kcal 1190, both stacks).

## Analysis corpus + new-base legs

COMMITTED (judged first): the awayeve corpora already
on master in this worktree
(evidence/2026-11-01/sim-awayeve-b-corpus-pilot-*
and -confirm-*, P1 = nighttravel-stack and creekseek,
24 seeds 17543-17566, 30d, base 6409c1312). No judged
row is re-run: re-running on this worktree's base
would re-roll trajectories and could move the cited
pairs, which is why the offer table is built on its
own corpus first.
NEW-BASE LEGS (only if a band or cohort falls short,
or to close bar (a)'s alternative): fresh seeds
17567-17590 (24 seeds, chosen as the next seed block
after the committed 17543-17566, no overlap), P1 and
creekseek, 30d, verbatim absencehunt/creekseek drivers
on THIS base, corpora under
evidence/2026-11-01/sim-offergeo-b-corpus-newbase-*,
split per seed, jsonl deleted after split, never
staged in /tmp. New-base counts are ALWAYS labeled
new-base and reported beside — never merged silently
into — the committed-corpus counts.
PILOT GATE (MEASUREMENT §§9-12, mapped to a census
arm): build the offer table on the committed pilot
corpora first (12 seeds, pilot dirs). If the
instrument (offer recovery / departure recovery /
haven-coords assertion) fails on the pilot, STOP and
report — no confirm-corpus spend on a broken
instrument. The confirm corpora (12 more seeds) are
the confirm spend; new-base legs are the close-the-
band spend, only after pilot + confirm both pass.

## Staging

- PREREG (this file): committed BEFORE any judged
  census and before any new-base leg.
- INSTRUMENTS: offergeo analyzer + pure proof test,
  committed before judged censuses. Pure proof must
  pass before any judged census is built. The proof
  test covers: Manhattan distance computation
  (including the (5,3)->(4,4) = 2 and creek (4,3)->
  (4,4) = 1 cases); offer classification for every
  outcome in the taxonomy (out-of-reach = not
  offered; travel-refused / travelledHome-true /
  travel-arrived-combat / travel-died = offered;
  entry-only / guard / no-step = excluded with
  reason); departure recovery rules (non-hop =
  evening snap; hop = line-derived flag); band
  assignment (d <= 3 / 4-5 / >= 6 boundaries);
  entry-fail vs entry-success cohort split; next-
  morning delta computation including the day-30
  exclusion; and analyzer wiring on a synthetic
  corpus dir.
- JUDGED CENSUSES: analyzer output to
  evidence/2026-11-01/sim-offergeo-b-census-*.json
  (committed-corpus table per policy + pooled, and
  new-base table per policy + pooled if run).
  Compare .md: matched seed-day tables (committed
  vs new-base labeled), never labeled a panel
  comparison.
- SENSE TEST (law): read full transcripts end to
  end for at least 2 offer days, 2 refusal days,
  and 1 entry-failure day, and quote them. Offer
  days = evenings where the offer was evaluated and
  a hop was attempted (in this corpus: 17563 day 5
  hop-yes and 17563 day 4 hop-refused are the only
  distinct offered evenings per stack — both are
  read, on P1, with the creekseek day-5 variant as
  a third). Refusal days = offer-no evenings
  (home unoffered): 17563 day 6 (creek (2,0)) and
  a 17549 (6,7) night, read end to end. Entry-
  failure day = 17563 day 5 P1 (the hop-yes-entry-
  no evening), read end to end including its
  following morning. A counts-only report FAILS
  the sense-testing law. Also sample villager
  behavior generally out of the read days (goals,
  routines, dialogue, reactions) and flag anything
  robotic, static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-offergeo-b.md
  — verdict judged against prereg, offer-by-distance
  table, departure-tile table, entry-failure cost
  with haven-evening rate, sense-read with quotes,
  metric review section, village assessment in plain
  words, wall numbers reported as "not measured by
  this pre-seat census" (never invented).

## Horizons (death-aware, never fixed 200d)

The judged window is the awayeve 30d window: the
harness stops at Game.over; dead villages stop
simulating. No 60d/200d extension is planned: an
offer-geometry question answers in-window, and any
episode open at day 30 is reported as still-away-
at-horizon by the awayeve census, not extended.
New-base legs use the same 30d horizon.

## §15 panel (non-applicability declaration, checked before judged censuses)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack, a
per-evening offer-geometry census, departure tiles,
entry-failure cohorts, or policies that are not in
the registry (creekseek, nighttravel-stack as a
census stack) — the same declaration every prior
strand arm made. The comparison here is matched
seed-day tables across policies on identical seeds
through the new offergeo analyzer, attached as
evidence/2026-11-01/sim-offergeo-b-compare.md,
never labeled a panel comparison. No panel result
is fabricated; the panel tool is not invoked on
this corpus. No lever change is panelled here —
like the eveningstep arm, the deliverable is matched
seed-day tables, stated explicitly, not silently
skipped.

## Metric review (open questions noted before any judged census, not resolved by re-scoring)

- Whether departure = evening snap for non-hop
  evenings is exact: YES by the code path (the step
  moves nothing on those outcomes; the entry walk
  moves detail position only). The one threat is a
  wrapper that moves map position post-step on a
  travel-refused evening — woodcarry's bridge does
  not move the villager, warmth does not move the
  villager; both are checked per row (woodcarry/
  warmth records non-null do not change mapPx/mapPy
  between step and snap, verified by the analyzer
  asserting evening snap == step-end position on
  the one row where the step record is independently
  known, 17563 day 4).
- Whether haven = (4,4) holds for every seed: the
  analyzer asserts haven-tile evening snaps sit at
  (4,4); a violation is a surprise, not a silent
  re-centering.
- Whether Band A can ever reach n >= 20: DOUBTFUL
  by construction (see bands section) — that doubt
  is why bar (a) carries its alternative clause, and
  why new-base legs are pre-authorized. If Band A
  stays short after new-base legs, the arm reports
  the structural reason with the rate arithmetic
  (offered-evening rate per evening on the pooled
  corpora) instead of claiming the band was measured.
- Whether cohort A entry-fail evenings are a fair
  cost comparator for cohort H: NO, not directly —
  cohort A mixes daytime arrivals (whose entry
  failure has different daytime causes) with hop
  arrivals. The evidence reports both cohorts side
  by side and never substitutes cohort A's deltas
  for cohort H's cost. Cohort H's cost, on n = 1
  per stack, is a case study with a following
  morning, not a rate.
- Carried doubt for the NEXT run: if the offer
  zone (d <= 3, revealed) is nearly empty of away
  evenings because competent.daily rarely ends days
  there, the next question is a daytime question
  (where do days END, by distance), not an evening
  question — and the offer table alone cannot answer
  it, because it conditions on evenings the step
  evaluates.
