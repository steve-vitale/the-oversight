# sim-awayeve-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-awayeve-b, run
fleshout-loop-b-20261101T0330Z, axis food-economy (away-evening
census). Worktree sim-awayeve-b, branch sim-awayeve-b.
This arm is DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing policy
file or existing script. New files only: this prereg, one
new analyzer (scripts/analyze-awayeve-b.js), one pure proof
test (scripts/test-awayeve-b.js), evidence, compare,
corpora, censuses. The absencehunt driver, creekseek
driver, absencehunt analyzer, confirmednight analyzer, and
strandtile analyzer are REUSED VERBATIM from the base (no
edits). This worker does NOT push, bump, verify live, or
merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across
the map; ~35% of creek tiles need a bridge or a swimmer —
a creek tile is a place, not a bucket class; the way home
runs through the same travelTo pipeline as walking out,
orthogonal steps only; NO TELEPORT ever) and
docs/TIME-ECONOMY.md (one clock; node travel is free; the
day has a fixed 512-tick budget; day-parts derive from
ticks). No canon doc covers an AWAY-EVENING census unit
or a return-story taxonomy for non-creek evenings —
stated here instead of inventing canon. Standing rules
that bear on it: perception law (Steve 2026-10-28:
decisions from what the villager senses — every census
field below is read from the villager's own evening
snap, its own day lines, and its own following morning,
never from a roster) and "no silent actions" (the sense
test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-strandwide-b.md + prereg
  (DIAG-GO via POLICY half, base ee159dbc3): creekseek
  converts only away evenings it is offered — 14 vs 9
  creek evenings pooled G1+G2, all delta from G1; P1
  ends days at haven while P3 deed-seeking ends days
  out (P3 G1: 38 creek evenings vs P1's 8). The carried
  conclusion, quoted: "the binding scarcity is away
  evenings, not creek proximity." Strandwide's metric
  review names THIS arm's question explicitly: measure
  the away evening itself rather than only its creek
  subset. Definitions reused verbatim below: the
  haven-checked atHaven, the creek-tile evening, the
  confirmed night, FAILED-RETURN / NO-ATTEMPT with
  their firing signals, the blocked-crossing flag
  (never promoted), the strand episode, the
  exit-day end rule, and the death-aware caveat (a
  horizon end is not a return, a village-death end is
  not a return, a succession end is a death, not a
  return).
- evidence/2026-10-31/sim-confirmednight-b.md + prereg
  (DIAG-GO, base c9ac9183): the confirmed-night unit
  argued; the return-story split POLICY-PERFECT —
  P3 deed-seeking 149/149 NO-ATTEMPT, P1
  nighttravel-stack 6/6 FAILED-RETURN; 35 camps, ZERO
  walk-home ends. Camp-final haven mornings coincide
  with vessel changes (succession), never with a
  same-vessel walk home, on that corpus. The strict
  confirmed count (50, not the class-based 60) is the
  precedent for refusing to count a haven-following
  morning as a return without a daytime walk.
- evidence/2026-11-01/sim-gate2hunt-b.md (DIAG-GO,
  base ee159dbc3): travel-refused definition
  (eveningOutcome 'travel-refused': haven offered AND
  one honest travelTo hop attempted AND post-hop
  position not haven); 'out-of-reach' is NO hop
  offered, never counted as a refusal there. THIS
  PREREG DIFFERS DELIBERATELY on that one point for
  the end-cause label only (see "End-cause" below):
  on a nighttravel-stack evening the evening step
  RAN and found home unoffered, so out-of-reach is
  grouped with travel-refused under
  "return-attempted" — following confirmednight's
  FAILED-RETURN signal set, not gate2hunt's refusal
  definition — while travel-refused vs out-of-reach
  are always reported as separate subkinds, so the
  gate2hunt reading can be re-derived from the
  census without re-running anything.
- Strandtile / strandred lineage (bases 5aa816b4e,
  c9ac9183, ee159dbc3): the named strands 17513
  (episode days 5-9, SUCCESSION) and 17511
  (singleton day 10, MOVED-ELSEWHERE), plus strandwide's
  new named seed 17523 (P1 episode days 7-13,
  SUCCESSION; creekseek second episode days 18-21,
  SUCCESSION). The old strand sets (15215 / 15009)
  are NOT reused: a base move re-rolls the shared RNG
  stream and voids them. Everything judged here is
  measured on THIS base (below).

## Base commit (pinned)

Base commit for every leg in this arm:
6409c13128f3f986f9a7f6b756483a8aeb07d18c (worktree
HEAD at prereg writing time). This is NOT strandwide's
base ee159dbc3: intervening landings (including a
journey-landing commit at HEAD) may have moved
trajectories, so every count here is a fresh
measurement on THIS base, never a reuse of strandwide
corpora. The base-check legs below test whether the
named 17523 strands survived the base move from
ee159dbc3 to this base, and any move is reported
with new names, never silently substituted.

## The question

Strandwide's next blank (tracker next blank 1 from
the 0249Z closeout, and sim-findings "AWAY EVENINGS
ARE THE BINDING SCARCITY", loop-B 0119Z strandwide
arm): creekseek converts only away evenings it is
offered, P1 ends days at haven while P3 deed-seeking
ends days out — so measure the away evening itself:
what ends days away, on which policies — rather than
only its creek subset. Four policies on identical
seeds, one shared 30d window, every evening classified.

## Definitions (exact)

All counts are per loop-day from the absencehunt /
creekseek drivers (morning snap at the START of that
day's daily() call, evening snap after daily(), before
the harness's sleep). atHaven is the absencehunt
haven-checked definition, reused verbatim (insideHaven
true OR tile 'haven' OR map position equals the
village (px, py) node). Road status is the evening
row's roadActive OR roadOnRoad.

- HAVEN evening: evening snap atHaven.
- ROAD evening: evening snap NOT atHaven AND on road
  (roadActive or roadOnRoad true). Reported separately
  in every table, NEVER pooled into away evenings.
  (A road evening is a leg-board / nomad-road night,
  not a wild-tile night; pooling it would mix two
  different ways of being out.)
- AWAY evening (PRIMARY unit): evening snap NOT
  atHaven AND NOT on road. Every away evening carries
  exactly one end-cause label and exactly one return-
  story label (rules below). Counts and shares are
  reported per policy on identical seeds; shares use
  total evenings as denominator, so haven + away +
  road = 100% in every cell, with the away share of
  non-road evenings also reported for readability.
- Evening tile: the evening snap's tile type
  ('creek', 'forest_floor', 'meadow', 'trail_edge',
  'grove', 'wetland', ...). A creek away evening is
  the strandwide creek-tile evening (same definition);
  creek is one tile value among others here, never a
  separate census.
- Start: DEPARTURE if the day's morning snap is
  atHaven, CONTINUATION if it is away. (Road mornings
  are away mornings: a day that starts on the road and
  ends on a wild tile is a continuation, and the road
  flag on the morning is recorded, not hidden.)
- Day shape (reported, never promoted to cause):
  forageTrips delta > 0, patrols delta > 0,
  travel-leg lines >= 1 (absencehunt TRAVEL_RE),
  blocked-crossing flag (dayLines contain "no
  crossing without a bridge or a swim" — the
  confirmednight regex, a flag only, never a
  FAILED-RETURN signal by itself), inCombat,
  insideTent, woodcarry bucket (P1 only), creekseek
  move record (creekseek only).

### End-cause (what ended the day away) — single label, in order

1. blocked-combat: evening row inCombat true.
2. tent-camp: evening row insideTent true (a
   deliberate camp; the evening step does not move a
   tented villager).
3. return-attempted: eveningOutcome in the
   confirmednight FAILED_OUTCOMES set
   (out-of-reach, travel-refused, detour-stopped,
   detour-nopath, detour-died, travel-died) OR
   ctxDelta.tripHomeDetours > 0. Subkinds always
   reported separately: travel-refused (hop
   attempted, blocked) vs out-of-reach (step ran,
   home not offered) vs detour-* vs tripHomeDetours.
   On P3 and BARE this label is IMPOSSIBLE by
   construction (no evening return step runs);
   any such night there is an instrument surprise,
   itemized, never pooled away.
4. no-return-step: eveningOutcome == 'policy-no-record'
   (no evening return machinery exists on that
   policy: P3 deed-seeking, BARE competent-only).
   On P1 / creekseek this label is a surprise,
   itemized, never pooled away.
5. other: any other eveningOutcome (including
   'game-over'). Subkind recorded verbatim.

### Return story (what happened to that night) — single label, in order

Let d be the away evening's loop-day, next the
loop-day d+1 record (decision + evening), vessel the
morning vesselId.

1. If no next decision record exists: still-away-at-
   horizon if the leg's endReason is 'survived'
   (the window ended mid-absence); else ended-other
   (subkind village-death, with endReason recorded).
2. Else if next morning's vessel differs from d's
   morning vessel (both non-null): ended-other
   (subkind succession — a death, never a return,
   per the confirmednight precedent).
3. Else if next morning is atHaven (same vessel):
   ended-other (subkind woke-at-haven-same-vessel —
   NO daytime walk was observed, so this is NOT
   counted as walked-home; if this subkind is
   non-zero it is a sleep-step finding, reported
   as such).
4. Else (next morning away, same vessel): if next
   evening record is missing: UNCLASSIFIED
   (instrument failure only). Else if next evening
   is atHaven: walked-home-next-day (a daytime
   walk home on day d+1, as on gate2hunt's 17734
   days 17 and 30). Else if next evening is a road
   evening: ended-other (subkind road-transition).
   Else (next evening away, non-road): failed-return
   if d's end-cause is return-attempted;
   no-attempt if d's end-cause is no-return-step;
   else ended-other (subkind = d's end-cause, e.g.
   tent-camp-continuation, blocked-combat-
   continuation).
5. UNCLASSIFIED is instrument failure ONLY: a missing
   or internally inconsistent day record. It is never
   used for story ambiguity — every resolved case
   above has a label, and ended-other always carries
   its subkind.

### Away episode (derived, secondary — not the primary metric)

A maximal run of consecutive loop-days, each an away
evening (non-road), for ONE morning vessel. A haven
evening, a road evening, or a vessel change breaks
it. Episode-end classification, from the day after
the last away evening (same exit-day rule shape as
strandtile, adapted to all tiles): WALK-HOME (next
day starts away, same vessel, ends at haven);
WOKE-AT-HAVEN-SAME-VESSEL (next morning at haven,
same vessel); SUCCESSION (next morning vessel
differs); HORIZON (no next day, survived);
VILLAGE-DEATH (no next day, not survived, or next
day game-over); ROAD-TRANSITION (next evening is a
road evening); ENDED-OTHER (any other resolved
end). Episodes are reported per policy (counts,
length distribution, end split) but judged by no
bar — the bars judge evenings, not episodes.

## Policies (existing files only, no edits, no default flips)

- P1 nighttravel-stack (absencehunt driver,
  POLICY=nighttravel-stack): competent.daily +
  nighttravel + withWoodcarry + withWoodwarm,
  WOODWARM=1, WOODCARRY=1.
- P3 deed-seeking (absencehunt driver,
  POLICY=deed-seeking): deed-seeking policy;
  WOODCARRY/WOODWARM unset/0 per the driver's FATAL
  asserts. P3 has no evening return step.
- CREEKSEEK-STACK (creekseek driver,
  POLICY=creekseek-stack, policy file landed by
  strandwide, FOUND not recreated):
  scripts/policies/creekseek-b.js, WOODWARM=1,
  WOODCARRY=1, CREEKSEEK_B=1. creekseek replaces
  nighttravel in the P1 stack; its evening return
  step is nighttravel's imported nightStep.
- BARE (absencehunt driver, POLICY=competent):
  competent.daily ALONE — no evening step at all,
  WOODCARRY/WOODWARM unset/0. This is the day's own
  ending: what competent.daily leaves, with no
  return machinery and no creek move. It is the
  baseline that isolates the evening step's effect
  (P1 minus BARE = what nighttravel + woodcarry +
  woodwarm do to evenings; P3 minus BARE = what
  deed patrols do to evenings). NAMING NOTE, stated
  to prevent a collision: gate2hunt/refusedband's
  "BARE" is a DIFFERENT stack (nighttravel +
  creekremedy-diag, no wood wrappers). That stack
  is NOT a cell here — its refusal geometry was
  already hunted, and it differs from P1 only by
  trigger wrappers, so it cannot isolate the
  evening step. In this prereg BARE means
  competent-only, everywhere, without exception.

Substrate env asserted FATAL in both drivers for ALL
legs: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, MORNINGCARRY/WINDOWCARRY/STRANDFIX/
PRESSB/FEDEVENING unset/0, WOODCARRY=1, WOODWARM=1
for P1/creekseek stacks (unset/0 for P3/BARE).

## Search grid (declared fully, run exactly)

Fresh bands beyond strandtile F1 17501-17508 and F2
17511-17518, strandwide G1 17519-17526 and G2
17527-17542, refusedband/gate2hunt 176xx/177xx bands
(no overlap with any of them):

- Band A1 (pilot): 17543, 17544, 17545, 17546, 17547,
  17548, 17549, 17550
- Band A2 (confirm): 17551, 17552, 17553, 17554,
  17555, 17556, 17557, 17558, 17559, 17560, 17561,
  17562, 17563, 17564, 17565, 17566

BASE CHECK (2 legs, NOT counted in any bar, run
FIRST — see "Staging"): P1 17523 x 30d + creekseek
17523 x 30d, analyzed with the strandtile analyzer
verbatim, compared to strandwide's P1 G1 / creekseek
G1 counts for 17523 (P1: 8 creek evenings, 7
confirmed, 7 FAILED-RETURN, episode days 7-13;
creekseek: 13 creek evenings, 11 confirmed, 11
FAILED-RETURN, episodes days 7-13 and 18-21).
Instrument-gate failure on a base-check leg STOPS
the run (no judged spend on a broken instrument);
count drift is REPORTED, never silently substituted,
and does NOT gate the judged legs — judged legs are
fresh measurements on THIS base regardless.

PILOT (8 seeds before any confirm spend,
MEASUREMENT §9): P1 A1 x 30d (8 legs) + P3 A1 x 30d
(8 legs) + creekseek A1 x 30d (8 legs) + BARE A1 x
30d (8 legs), all seed-matched. INSTRUMENT GATE
before any confirm: every pilot leg errs 0,
decisions == evenings in count, loop-days complete
or a game-over with its day recorded (the strandtile
gateOk predicate, reused: days-complete OR an
evening row with gameOver true OR a recorded
harness endReason other than 'survived'). If the
gate fails, STOP and report — no confirm spend on
a broken instrument.

CONFIRM (only on a pilot instrument-gate pass,
§9 Stage 2): P1 A2 x 30d (16 legs) + P3 A2 x 30d
(16 legs) + creekseek A2 x 30d (16 legs) + BARE A2
x 30d (16 legs), all seed-matched to each other.
Confirm total 64 legs; judged total 96 legs
(pilot 32 + confirm 64). No judged band is ever
below 8 seeds. A1 legs are kept identical for
before/after comparability.

Horizons are death-aware (MEASUREMENT §10): the
harness stops at Game.over; dead villages stop
simulating (+10d tail max is the harness's own end
handling). Never a fixed 200d. The 30d horizon
matches the strand program so counts are band-
comparable. No 60d extension is planned: a 30d
away-evening census answers its question in-window,
and any truncation note (an away episode open at
day 30) is reported as still-away-at-horizon, not
extended.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: away evenings per seed and away share
of evenings, by policy, on identical seeds (A1+A2
pooled, with per-band splits always reported, never
pooled away).

GO BARS (ALL must hold):
(a) INSTRUMENT GATE: every judged leg (pilot +
confirm, all four policies) errs 0, decisions ==
evenings, loop-days complete or game-over with day
recorded (strandtile gateOk predicate above).
(b) CLASSIFICATION COMPLETENESS: >= 95% of away
evenings across the judged cells carry a return
story (failed-return / no-attempt / walked-home-
next-day / still-away-at-horizon / ended-other
with subkind); UNCLASSIFIED evenings itemized.
(c) CENSUS DELIVERED: away-evening counts AND shares
by policy on identical seeds, with per-policy
breakdowns by evening tile, by start
(departure/continuation), by end-cause (with
travel-refused vs out-of-reach split), and by
return story — sufficient to answer, in numbers,
which policies end days away, how often, and what
ends them (deed-seeking patrols? creek tiles?
travel-refused? no-return-step days?). A missing
breakdown fails this bar even if counts exist.
(d) SENSE PASS: at least one away-evening episode
from THIS arm's corpus, read end to end in
transcript, judged as a person away from home (or
the evidence states plainly why it does not, with
quotes — a failed sense-read is a documented
finding and fails this bar).

- GO: verdict = AWAYEVE COMPLETE; the census tables
  per policy, the policy contrasts (P1-vs-BARE,
  P3-vs-BARE, creekseek-vs-P1), and the sense-read
  are reported. A GO here is still DIAG: it
  authorizes NO src/js fix and NO default change.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = AWAYEVE NOT COMPLETE
  on this band on current master; the failing bar is
  named exactly, with numbers.
- HELD: instrument blocked (bar (a) fails) — the
  block is stated, no verdict is claimed.

Secondary reported counts (every leg, never pooled
across bands in verdict counts): haven evenings,
road evenings (separate, with road tile/position
notes), away episodes (counts, length distribution,
end split), creek away evenings (the strandwide
subset, for continuity), genuine overnight absences
(absencehunt primary, for continuity), camps (P3
creek camps, confirmednight definition, for
continuity), errs, game-overs, survival (daysAlive,
endReason), maxWaveUnlocked per leg (reported as
wall context only, never as a wall measurement).

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: awayeve analyzer + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs. The proof test covers:
  atHaven reuse (inside / tile / node cases), road
  separation (road evening never counted away),
  departure vs continuation, end-cause ordering
  (combat > tent > return-attempted > no-return-step
  > other) with the travel-refused / out-of-reach
  subkind split, return-story cases (walked-home-
  next-day, failed-return, no-attempt, still-away-
  at-horizon, succession, woke-at-haven-same-vessel,
  road-transition, village-death, UNCLASSIFIED on
  missing next evening), away-episode grouping and
  end classification, and analyzer wiring on a
  synthetic corpus dir.
- BASE CHECK: P1 + creekseek 17523 30d re-derivation
  with the strandtile analyzer verbatim, reported as
  drift before the confirm is judged.
- JUDGED LEGS: stdout-runner transport (sim prints
  one JSON line per seed to stdout; stdout -> file
  in evidence/ in a foreground exec; idle splitter
  splits into per-seed files; jsonl deleted after
  split). Judged corpora are NEVER staged in /tmp,
  and judged legs NEVER write files from a
  game-loaded process.
- SENSE TEST (law): read one full away-evening
  episode's transcript/dayLines end to end from THIS
  arm's corpus and judge meaning/coherence: does the
  record read as a person away from home, or as a
  bookkeeping artifact? Quote the lines. A
  counts-only report FAILS the sense-testing law.
  Also sample villager behavior generally out of the
  sims (goals, routines, dialogue, reactions) and
  flag anything robotic, static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-awayeve-b.md —
  verdict judged against prereg, census tables,
  drift section, sense-read with quotes, compare .md
  attached, metric review section, village
  assessment in plain words, wall numbers if
  measured (report-only if the census doesn't cover
  them, never invented).

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack, a
30-day per-day away-evening census, away-evening
tiles/outcomes/return stories, or policies that are
not in the registry (creekseek, BARE-competent as a
census stack) — and registering them would require
editing scripts/sweep-compare.js, an existing script
outside this arm's new-files-only scope. The same
declaration every prior strand arm made. The
before/after comparison here is a matched-seed census
across bands and across policies on identical seeds
through the new awayeve analyzer (which reuses the
absencehunt classifier verbatim), and the compare .md
(evidence/2026-11-01/sim-awayeve-b-compare.md) is
attached to the evidence file. No panel result is
fabricated; the panel tool is not invoked on this
corpus. If a lever comparison on panel terms arises
(none is planned — this arm's lever is a census,
not a survival lever), it will run through
scripts/balance-panel.js and the compare .md will
be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether out-of-reach should group with
  travel-refused under "return-attempted": YES under
  this prereg (confirmednight's FAILED-RETURN signal
  set), with the subkind split always reported so
  the gate2hunt reading (refusal = hop attempted
  only) re-derives exactly.
- Whether a woke-at-haven-same-vessel morning should
  count as walked-home: NO under this prereg (no
  daytime walk observed); it is ended-other with
  its subkind, so a future prereg can argue it with
  evidence if the subkind turns out non-zero.
- Whether road evenings should ever pool into away
  evenings: NO under this prereg (different way of
  being out); they are reported in their own column
  in every table.
- Whether BARE should have meant refusedband's
  nighttravel-without-wood stack: NO under this
  prereg (see Naming Note) — that stack cannot
  isolate the evening step, and its geometry is
  already hunted. A future arm that wants the
  wood-wrapper contrast (P1 vs nighttravel-bare)
  must name it nighttravel-bare, never BARE.
- Carried doubt for the NEXT run: if BARE ends days
  away at a high rate while P1 ends days at haven,
  the next question is which evening-step leg (the
  hop offer, the hop itself, or the lodge entry)
  does the bringing-home — but that decomposition
  is for the NEXT run; this run is judged on the
  census it pre-registered.
