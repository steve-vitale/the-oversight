# sim-strandwide-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-strandwide-b, run
fleshout-loop-b-20261101T0119Z, axis food-economy (strand substrate).
Worktree sim-strandwide-b, branch sim-strandwide-b.
This arm is DIAG + POLICY-SIDE measurement: zero src/js changes,
zero policy-default flips, zero edits to any existing policy file
or existing script. New files only: this prereg, one new policy
file (scripts/policies/creekseek-b.js), one new driver file
(scripts/creekseek-trace-b.js, a copy of the absencehunt driver
with a creekseek-stack buildBase — the absencehunt driver itself
is NOT edited), one pure proof test (scripts/test-creekseek-b.js),
evidence, corpora, censuses, one compare .md. This worker does NOT
push, bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across the map;
~35% of creek tiles need a bridge or a swimmer — a creek tile is a
place, not a bucket class; the way home runs through the same
travelTo pipeline as walking out, orthogonal steps only) and
docs/TIME-ECONOMY.md (node travel is free; the lodge detail walk
bills per landed square). No canon doc covers a TILE-criterion
strand episode — stated in the strandtile prereg instead of
inventing canon, and reused here. Standing rules that bear on it:
perception law (Steve 2026-10-28: decisions from what the
villager senses — the creekseek step below reads only its own
tile, the engine's offered travel targets, and the haven node it
lives in) and "no silent actions" (the sense test reads
transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-strandtile-b.md + prereg (DIAG NO-GO
  on the count bar; base 5aa816b4e): the confirmed-night unit,
  the strand-episode definition, and the strand-rate baseline are
  reused VERBATIM below. Headline: on the P1 nighttravel stack,
  2 of 16 distinct seeds carry a failed-return strand episode
  (12.5%): 17513 (episode days 5-9, end SUCCESSION) and 17511
  (singleton day 10, end MOVED-ELSEWHERE). A fresh 8-seed P1 F1
  confirm cell held ZERO creek-tile evenings — the strand rate
  exists only on two named seeds so far. The bucket-vs-tile
  divergence is answered (bucket never classifies out-of-reach
  nights): judge by the TILE criterion only, never pooled.
- evidence/2026-10-31/sim-confirmednight-b.md + prereg (DIAG-GO):
  the confirmed-night unit (creek-tile evening + a following
  morning that exists and is away) and the return-story split,
  POLICY-PERFECT — P3 deed-seeking 149/149 NO-ATTEMPT, P1
  nighttravel-stack 6/6 FAILED-RETURN; 35 camps, ZERO walk-home
  ends. P3 F1 creek camps live on 17504/17506.
- The old strand sets (15215 / 15009) are NOT reused: the 1430Z
  round showed the next base move re-rolled the shared RNG stream
  and voided them. Everything here is measured on THIS base
  (below); the base-check legs below test whether the named
  strands survived the base move from 5aa816b4e to this base,
  and any move is reported with new names, never silently
  substituted.

## Base commit (pinned)

Base commit for every leg in this arm:
ee159dbc35d1af896638bbe851b5bd61e47d93c5 (worktree HEAD at
prereg writing time). This is NOT strandtile's base 5aa816b4e:
intervening landings may have moved trajectories, so every count
here is a fresh measurement on THIS base, never a reuse of
strandtile corpora.

## The question

The strand program's next blank (tracker next blank 1 from the
20261031T2343Z closeout): does the strand population exist
anywhere beyond the two named seeds, and can a policy that
actually puts villagers at creeks create it? Two halves, one
verdict:

(a) BAND: a wider fresh seed band on P1 (and a P3 census on
the same fresh band, for the creek-evening substrate).
(b) POLICY: a new creek-seeking policy variant, measured
against its matched P1 baseline on identical seeds.

## Definitions (exact, from the strandtile prereg — reused verbatim)

All counts are per loop-day from the absencehunt/creekseek
driver (morning snap at the START of that day's daily() call,
evening snap after daily(), before the harness's sleep).
atHaven is the absencehunt haven-checked definition
(insideHaven true OR tile 'haven' OR map position equals
the village (px, py) node). The absencehunt analyzer's
class labels are reused unchanged.

- CREEK-TILE evening: an evening snap whose tile is
  'creek' AND which is NOT atHaven AND NOT onRoad
  (roadActive/roadOnRoad false).
- CONFIRMED creek night (PRIMARY metric unit): a
  creek-tile evening whose following morning EXISTS and
  is AWAY (not atHaven). Excluded, and reported
  separately, never counted in the primary: class
  'sleep-return'; away-continuation creek evenings whose
  following morning is at haven (camp-final nights);
  class 'genuine-end-of-run'; road creek evenings.
- FAILED-RETURN: a confirmed night whose day attempted
  return home and the attempt failed. Signals, any one
  of which suffices (the firing signal is recorded per
  night): eveningOutcome == 'out-of-reach' (nighttravel
  policy: home travel not offered — too far / no path);
  eveningOutcome in {travel-refused, detour-stopped,
  detour-nopath, detour-died, travel-died};
  ctxDelta.tripHomeDetours > 0.
- NO-ATTEMPT: a confirmed night on which none of the
  above fires.
- UNCLASSIFIED: a confirmed night whose day record is
  missing or internally inconsistent. Instrument failure
  only, never ambiguity of story.
- BLOCKED-CROSSING flag (secondary, never promoted):
  the day's dayLines contain "no crossing without a
  bridge or a swim". It evidences a blocked crossing,
  not a failed return, and never promotes a night to
  FAILED-RETURN by itself.
- STRAND EPISODE: a maximal run of consecutive loop-days,
  each a confirmed FAILED-RETURN night, for ONE vessel.
  A haven morning always breaks an episode; a vessel
  change breaks it even while still away; singletons are
  episodes of length 1. Episode-end classification is the
  strandtile prereg's exit-day rule, in its order
  (HORIZON / VILLAGE-DEATH / SUCCESSION / WALK-HOME /
  MOVED-ELSEWHERE / ATTEMPT-STOPS / SLEEP-RETURN /
  UNCLASSIFIED-EDGE). Death-aware caveat, stated on every
  citation: a horizon end is not a return, a village-death
  end is not a return, a succession end is a death, not a
  return.

## Policies

- P1 nighttravel-stack (baseline, existing files only, no
  edits, no default flips): competent.daily + nighttravel +
  withWoodcarry + withWoodwarm, WOODWARM=1, WOODCARRY=1.
- P3 deed-seeking (census only, existing file, no edits):
  deed-seeking policy; WOODCARRY/WOODWARM unset/0 per the
  absencehunt driver's FATAL asserts. P3 has no evening
  return step, so FAILED-RETURN is impossible on P3 by
  construction; any FAILED-RETURN night on P3 would be an
  instrument surprise, itemized, never pooled into strand
  numbers.
- CREEKSEEK-STACK (new file scripts/policies/creekseek-b.js
  ONLY, no default flips, no edits to existing policy
  files): creekseek replaces nighttravel in the P1 stack,
  i.e. woodwarm(woodcarry(creekseek)), WOODWARM=1,
  WOODCARRY=1, CREEKSEEK_B=1. creekseek.daily runs
  competent.daily, then the CREEK MOVE (below), then
  nighttravel's exported nightStep with nighttravel.daily's
  ctx bookkeeping (ctx._ntLast, ntEvenings counters) —
  imported, not copied, so the evening return step is
  byte-identical to P1's. The driver for creekseek legs
  is the new scripts/creekseek-trace-b.js (absencehunt
  driver shape, creekseek-stack buildBase, same snap
  logic, same substrate FATAL asserts plus
  CREEKSEEK_B=1).

CREEK MOVE (the one new behavior; pure decision function
creekseekDecision, unit-tested before any judged leg):

- Gate: CREEKSEEK_B=1, else lever-off (record, no move,
  nightStep still runs — so a gate-off leg equals P1).
- Skip (record reason, no move) when: game over; combat
  live; inside a tent (a deliberate camp stays); already
  on a creek tile; already at haven (tile 'haven' or
  insideHaven — a villager home for the night is NOT
  dragged out to a creek; the move serves villagers
  already out in the wild, not home villagers).
- Otherwise: read Game.travelTargets() (the engine's own
  offered hops, d<=3, no force, no route-around, no
  blockage clearing). Filter to targets whose tile type
  (Game.tileAt) is 'creek'. If none offered: record
  no-creek-offered, no move. If offered: choose the
  nearest by Manhattan distance, tie-break lowest x then
  lowest y (deterministic; the policy draws NO RNG).
  ONE Game.travelTo(tx, ty). If the position did not
  change: record travel-refused, stay put. If combat
  starts: record arrived-combat (nightStep will then
  block-combat, honestly).
- After the move, nightStep runs unchanged: if the creek
  is within a haven hop, the villager goes home (the
  creek evening never happens — an honest creek VISIT,
  not a creek night, and it counts nowhere in the strand
  numbers); if haven is out of reach, the evening is a
  creek-tile evening and the FAILED-RETURN machinery
  classifies it exactly as on P1. The policy therefore
  raises creek-tile evenings ONLY on out-of-reach nights
  and raises creek visits on in-reach nights; the two
  are never conflated in any count.
- Sense rationale (stated before legs, judged after):
  a villager ending the day already away stops at the
  nearest water on the way to night — to drink, to fish
  — and sleeps there when the way home will not open.
  It does not invent a creek trip from home, and it does
  not override a deliberate tent camp.

Substrate env asserted FATAL in both drivers for ALL legs:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0,
WOODCARRY=1, WOODWARM=1 for P1/creekseek stacks (unset/0 for
P3). Instruments are the absencehunt driver/analyzer/
splitter and the strandtile analyzer verbatim; the ONLY
new instruments are the creekseek policy, its driver, and
its pure proof test.

## Search grid (declared fully, run exactly)

Fresh bands beyond 17501-17516 (no overlap with strandtile's
F1 17501-17508 or F2 17511-17518, and no overlap with the
named seeds 17513/17511):

- Band G1: 17519, 17520, 17521, 17522, 17523, 17524, 17525, 17526
- Band G2: 17527, 17528, 17529, 17530, 17531, 17532, 17533, 17534,
  17535, 17536, 17537, 17538, 17539, 17540, 17541, 17542

PILOT (8 seeds before any confirm spend, MEASUREMENT §9):
P1 G1 x 30d (8 legs) + P3 G1 x 30d (8 legs, census only) +
creekseek G1 x 30d (8 legs, matched to P1 G1 seed-for-seed).
INSTRUMENT GATE before any confirm: every pilot leg errs 0,
decisions == evenings in count, loop-days complete or a
game-over with its day recorded. If the gate fails, STOP
and report — no confirm spend on a broken instrument.

BASE CHECK (2 legs, NOT counted in any bar): P1 F2 x 30d on
17513 and 17511 only — do the named strands still re-derive
on this base? Reported as drift, with new names if moved,
never silently substituted. Runs with the pilot; its result
does not gate the confirm (the bars judge fresh seeds).

CONFIRM (only on a pilot instrument-gate pass, §9 Stage 2):
P1 G2 x 30d (16 legs) + creekseek G2 x 30d (16 legs,
matched to P1 G2 seed-for-seed). Confirm total 32 legs.
No judged band is ever below 8 seeds. P1 G1 and creekseek
G1 legs are kept identical for before/after comparability.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d
tail max is the harness's own end handling). Never a fixed
200d. The 30d horizon matches strandtile so counts are
band-comparable. A 60d extension runs ONLY if the pilot
justifies it (an episode whose last confirmed night is day
29-30, i.e. truncation risk, or a creekseek creek night on
day 30) — and then only as a supplementary end-story read,
never counted toward the band or policy bars, which are
30d bars.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: strand episodes per seed on the P1 wide
band (G1+G2, 24 legs, 30d), plus the creekseek-vs-P1
creek-tile-evening delta on identical seeds.

GO BARS (ALL must hold):
1. INSTRUMENT GATE: every judged leg (pilot + confirm,
   P1 + P3 + creekseek) errs 0, decisions == evenings,
   loop-days complete or game-over with day recorded.
2. CLASSIFICATION COMPLETENESS: >= 95% of confirmed
   nights across the judged P1 + creekseek cells carry a
   FAILED-RETURN or NO-ATTEMPT story (unclassified nights
   itemized; P3 is reported separately and excluded from
   this rate because its story split is NO-ATTEMPT by
   construction).
3. POPULATION BAR (either half suffices):
   3a. BAND: >= 2 seeds outside the named set {17513,
       17511} with >= 1 failed-return strand episode on
       P1 G1+G2 (24 legs, 30d).
   3b. POLICY: creekseek creek-tile evenings STRICTLY
       GREATER than matched P1 baseline creek-tile
       evenings on identical seeds (pooled G1+G2), AND
       >= 1 creekseek failed-return episode on a seed
       outside {17513, 17511}.
4. SENSE PASS: the sense-read episode (longest new
   episode if one exists, else the longest creekseek
   creek-night run) reads as a person away from home
   (or the evidence states plainly why it does not, with
   quotes — a failed sense-read is a documented finding
   and fails this bar).

- GO: verdict = STRANDWIDE COMPLETE; the wider-band strand
  rate and/or the creekseek-created population is reported
  per cell. A GO here is still DIAG + POLICY-SIDE: it
  authorizes NO src/js fix and NO criterion merge; the
  creekseek policy file itself is a measurement policy,
  not a landed default change.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = STRANDWIDE NOT COMPLETE on
  this band on current master; the failing bar is named
  exactly, with numbers.
- HELD: instrument blocked (bar 1 fails) — the block is
  stated, no verdict is claimed.

Secondary reported counts (every leg, never pooled across
bands in verdict counts): creek-tile evenings, confirmed
nights, return-story split with firing signals,
blocked-crossing flag counts, unconfirmed creek evenings
by kind, camps + camp-end stories, genuine overnight
absences (absencehunt primary), creekseek move records
(attempted / already-creek / at-haven skip / no-creek-
offered / travel-refused / arrived-combat), errs,
game-overs, survival (daysAlive, endReason).

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: creekseek policy + driver + pure proof
  test, committed before judged legs. Pure proof must
  pass before any judged leg runs.
- JUDGED LEGS: stdout-runner transport (sim prints one
  JSON line per seed to stdout; stdout -> file in
  evidence/ in a foreground exec; idle splitter splits
  into per-seed files; jsonl deleted after split).
  Judged corpora are NEVER staged in /tmp, and judged
  legs NEVER write files from a game-loaded process.
- BASE CHECK: P1 17513/17511 30d re-derivation, reported
  as drift before the confirm is judged.
- SENSE TEST (law): read one full strand episode's (or,
  if none exists, the longest creekseek creek-night run's)
  transcript/dayLines end to end from THIS arm's corpus
  and judge meaning/coherence: does the record read as a
  person stuck away from home, or as a bookkeeping
  artifact? Quote the lines. A counts-only report FAILS
  the sense-testing law.
- EVIDENCE: evidence/2026-11-01/sim-strandwide-b.md —
  verdict judged against prereg, census tables, drift
  section, sense-read with quotes, compare .md attached,
  metric review section, village assessment in plain
  words.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare POLICY_REGISTRY
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel+
woodcarry+woodwarm stack, a 30-day per-day creek census,
creek-tile evenings, or a policy that is not in the
registry — and registering creekseek would require editing
scripts/sweep-compare.js, an existing script outside this
arm's new-files-only scope. The same declaration every
prior strand arm made. The before/after comparison here is
a matched-seed census across bands and across policies on
identical seeds through the strandtile analyzer, and the
compare .md (evidence/2026-11-01/sim-strandwide-b-compare.md)
is attached to the evidence file. No panel result is
fabricated; the panel tool is not invoked on this corpus.
If a lever comparison on panel terms arises (none is
planned — this arm's lever is a census policy, not a
survival lever), it will run through scripts/balance-panel.js
and the compare .md will be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a singleton failed-return night should count as
  a strand episode: YES under this prereg (inherited from
  strandtile; singletons are episodes of length 1, and the
  length distribution keeps them visible).
- Whether the POLICY bar's episode half should accept an
  episode on a named seed: NO — the bar demands a seed
  outside {17513, 17511}, because the question is a NEW
  population, not re-measurement of specimens.
- Whether creek VISITS (creekseek move followed by a
  successful trip home) should count toward any strand
  number: NO — they are reported as move records only,
  never as creek-tile evenings (the evening snap is at
  haven) and never as episodes.
- Whether P3 creek camps should pool with P1 strand
  numbers: NO — P3 has no return mechanism; its camps are
  substrate census only, reported separately.
- Carried doubt for the NEXT run: if the wider band is
  again empty of creek evenings, the question shifts from
  "where are the creek evenings" to "what does competent
  daily do with its evenings at all" — but that revision
  is for the NEXT run; this run is judged on the bar it
  pre-registered.
