# sim-confirmednight-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-confirmednight-b, run
fleshout-loop-b-20261031T2230Z, axis food-economy (strand substrate).
Worktree sim-confirmednight-b, branch sim-confirmednight-b.
DIAG ONLY (measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing script.
New files only (this prereg, a confirmed-night + return-story
analyzer, its pure proof test, evidence, corpora, censuses). This
worker does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across the map;
~35% of creek tiles need a bridge or a swimmer — a creek tile is a
place, not a bucket class) and docs/TIME-ECONOMY.md. No canon doc
covers a creek-evening strand criterion — stated here instead of
inventing canon. Standing rules that bear on it: perception law
(Steve 2026-10-28: decisions from what the villager senses) and
"no silent actions" (the sense test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-strandred-b.md + prereg (DIAG-GO, base
  b26777c16): the strict DEPARTURE-night unit counts 9 genuine
  creek-tile evenings on 2 seeds (17505, 17506) in the P3 F1 30d
  pilot, while a confirmed-night unit counts 60 creek nights on
  4 seeds on the class-based reading — 17504's whole creek life
  (16 tile evenings 30d, 36 in 60d) scores 0 under the strict
  unit because every camp opened with a departure from a
  non-creek tile.
- evidence/2026-10-31/sim-absencehunt-b.md + prereg (the
  driver/analyzer reused verbatim here:
  scripts/absencehunt-trace-b.js, scripts/analyze-absencehunt-b.js,
  scripts/split-absencehunt-jsonl-b.js; the strandred analyzer
  scripts/analyze-strandred-b.js is reused verbatim too).
- hidden_files/sim-findings.md #1658 (THIS arm's question: argue
  the confirmed-night unit explicitly, then census under it) and
  #1659 (the sibling arm's question — bucket-vs-tile divergence
  mechanism — NOT answered here, NOT pooled with this arm).

## Base commit (pinned)

Base commit for every leg in this arm: c9ac9183
(worktree HEAD at prereg writing time). This is NOT strandred's
base b26777c16: intervening landings (including the p4sleep arm)
may have moved trajectories, so every count here is a fresh
measurement on THIS base, never a reuse of strandred corpora.
Drift vs strandred's base cell is reported seed-for-seed, not
assumed.

## The question (#1658)

ARGUE the unit explicitly, then CENSUS under it — and classify
each confirmed creek night's RETURN STORY, so the next strand
arm knows whether creek camps are STRANDS (stuck) or CAMPS
(chosen). A camp with zero failed return attempts is not a
strand, however long it lasts — this arm says so plainly if
that is what the data shows.

## The unit argument (stated explicitly, before any judged leg)

The departure-night unit (strandred's primary) counts only
nights whose absence DEPARTED haven that same day. That is the
wrong unit for a future strand arm, for two reasons measured
on strandred's own corpus:

1. It discards lived nights. A villager who departs from a
   non-creek tile and then lives at the creek for weeks
   (17504: 16 evenings in 30d, 36 in 60d) contributes ZERO
   departure-nights. A strand arm built on the departure
   unit would design for 17505/17506's departure pattern
   and miss the longest creek lives in the data entirely.
2. It mistakes an administrative boundary for a lived fact.
   Whether the vessel left haven that morning says nothing
   about whether that night, at that creek, was slept
   through and survived to another away morning. The
   departure unit measures how absences BEGIN; a strand
   is about how nights are LIVED and whether home is
   reachable from them.

The confirmed-night unit measures the lived fact directly:
a night actually slept at the creek, confirmed by waking
still away. A future strand arm needs exactly this: a
population of nights the villager demonstrably spent at
the creek, from which it can then ask the strand question
(did they try to leave and fail?). Departure-nights are a
SUBSET of confirmed nights (the camp-opening nights that
also departed haven that day); continuation nights are
confirmed nights too, and they are the majority of creek
life. The confirmed unit therefore SUPERSEDES the
departure unit for strand purposes — it contains it, and
adds the nights the departure unit throws away.

One precision, stated here so it cannot be a mid-run
re-score: the brief's shorthand equates "following away
morning" with "genuine-class + away-continuation-class".
That shorthand is IMPRECISE, and this prereg corrects it
before any leg runs. An away-continuation evening is
classified by its START (morning away) and its evening
(away), NOT by its following morning — and on strandred's
own corpus, 7 away-continuation creek evenings are
followed by haven mornings, and 3 more end the run with
no following morning at all. Under a strict "waking still
away" reading, those 10 are NOT confirmed. This prereg
therefore defines confirmed STRICTLY (below) and reports
the class-based count alongside, with the gap itemized
night by night, so the next arm can see both numbers and
why they differ.

## Confirmed-night criterion (defined here, in one place)

All counts are per loop-day from the absencehunt driver
(morning snap at the START of that day's daily() call,
evening snap after daily(), before the harness's sleep).
atHaven is the absencehunt haven-checked definition
(insideHaven true OR tile 'haven' OR map position equals
the village (px, py) node). The absencehunt analyzer's
class labels are reused unchanged.

- CREEK-TILE evening: an evening snap whose tile is
  'creek' AND which is NOT atHaven AND NOT onRoad
  (roadActive/roadOnRoad false). Same definition as
  strandred.
- CONFIRMED creek night (PRIMARY metric unit): a
  creek-tile evening whose following morning EXISTS and
  is AWAY (not atHaven). In class terms: class 'genuine'
  (which guarantees a following away morning) OR class
  'away-continuation' WITH a following away morning.
  Excluded, and reported separately, never counted in
  the primary:
  - class 'sleep-return' (evening creek, following
    morning haven, departure day);
  - away-continuation creek evenings whose following
    morning is at haven (camp-final nights — on
    strandred's corpus every one coincides with a
    vessel change, i.e. a succession morning, not a
    walk home; this arm re-derives that, it does not
    assume it);
  - class 'genuine-end-of-run' (no following morning
    exists to confirm the night);
  - road creek evenings (excluded from creek-tile
    evenings already).
- UNCONFIRMED creek evening (reported, not hidden): any
  creek-tile evening that is not a confirmed night,
  itemized as sleep-return / haven-following /
  end-of-run, each with its following-morning vessel
  story (same vessel vs changed vessel).
- CONFIRMED CAMP: a maximal run of >= 2 consecutive
  loop-days whose evening snaps are creek-tile evenings,
  reported with its confirmed-night count inside it.
  (A camp's final evening is usually unconfirmed — it
  ends by succession or horizon — so camp length and
  confirmed count differ by design; both are reported.)

What this arm does NOT claim: a confirmed creek night is
not, by itself, a strand. Confirmation establishes the
night was lived at the creek. Strandhood is established
only by the return-story classification below. A
confirmed night with no failed return attempt is a CAMP
night, not a strand night, however long the camp lasts.

## Return-story classification (defined here, in one place)

For EACH confirmed creek night on loop-day D, the story
is classified from day D's own record (the day that ends
at the creek evening) — the evening record's outcome,
the day's ctx deltas, and the day's dayLines:

- FAILED-RETURN: day D attempted return home and the
  attempt failed. Signals, any one of which suffices
  (the firing signal is recorded per night):
  - eveningOutcome == 'out-of-reach' (nighttravel
    policy: home travel not offered — too far / no
    path; the policy's evening return step ran and the
    game refused it);
  - eveningOutcome in {travel-refused, detour-stopped,
    detour-nopath, detour-died, travel-died} (an
    attempted evening journey home that stopped short);
  - ctxDelta.tripHomeDetours > 0 (an evening home
    detour was attempted that day).
- NO-ATTEMPT: none of the above fires on day D. The
  villager spent the day foraging / patrolling / living
  at or near the creek and ended it there without any
  recorded attempt to get home. (On P3 deed-seeking the
  policy has no evening walk-home step at all, so
  NO-ATTEMPT is the expected story there — the arm
  measures it, it does not presume it.)
- UNCLASSIFIED: the record for day D is missing or
  internally inconsistent (no evening record, no
  outcome field at all). This bucket exists so
  classification completeness is honest; a night lands
  here only on instrument failure, never on ambiguity
  of story.

Secondary flags (reported per night, NEVER promoted to
FAILED-RETURN by themselves):
- BLOCKED-CROSSING flag: day D's dayLines contain the
  creek refusal line "no crossing without a bridge or
  a swim". The line fires as creek-tile text and does
  not name home as the destination, so it evidences a
  blocked crossing, not a failed return. Promoting it
  would overclaim.
- Probed and ABSENT (stated so the next arm does not
  re-hunt them): the phrases "lacking", "still evening",
  and "needTrip" as narration do not occur in
  strandred's creek-camp dayLines (needTrip is a
  competent-policy forage-trip function, not a return
  signal); "walk home" / "head home" as narrated
  return attempts do not occur on creek-camp days
  either. The classifier does not use them.

Camp-end story (secondary, per confirmed camp): how the
camp ends, from the morning after its last creek
evening: SUCCESSION (vessel changed — the camper died
and the mantle passed to someone at haven), WALK-HOME
(the day after the last creek evening starts away with
the same vessel and ends at haven), MOVED-ELSEWHERE
(morning away, evening non-creek non-haven),
WOKE-AT-HAVEN-SAME-VESSEL (morning at haven with the
same vessel — mechanism unexplained if seen), HORIZON
(no following day — the run ended during the camp).

## Policies (existing files only, no edits, no default flips)

- P3 deed-seeking (pilot + 60d confirm, judged):
  competent.daily + deedPatrol (far patrol, no walk
  home after) + surgeUpkeep. The policy that produced
  the creek camps in absencehunt/strandred.
- P1 nighttravel-stack (confirm band, judged for its
  own counts, NOT pooled with P3 in verdict counts):
  withWoodwarm(withWoodcarry(nighttravel)), WOODWARM=1.
  The only stack on which the evening return step runs
  (eveningOutcome 'out-of-reach' is observable here),
  and the stack of 17513's days 5-10 camp.

Substrate env asserted FATAL in the driver for ALL legs:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0.
P1 additionally WOODCARRY=1, WOODWARM=1; P3 WOODCARRY/WOODWARM
unset/0. Instruments are the absencehunt driver/analyzer/
splitter verbatim plus the strandred analyzer verbatim;
the ONLY new instrument is scripts/analyze-confirmednight-b.js,
which reads the same per-seed corpora, reuses
classifySeed + classifyCreek, and adds confirmed-night
counts + return-story + camp-end classification WITHOUT
redefining any absencehunt or strandred class. Its pure
proof test (scripts/test-confirmednight-b.js) must pass
before any judged leg runs.

## Search grid (declared fully, run exactly)

Seed bands (the absencehunt/strandred bands, reused
deliberately so drift vs b26777c16 is measurable
seed-for-seed):

- Band F1: 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508
- Band F2: 17511, 17512, 17513, 17514, 17515, 17516, 17517, 17518

PILOT (8 seeds before any confirm spend, MEASUREMENT §9):
P3 F1 x 30d = 8 legs. INSTRUMENT GATE before any confirm:
every leg errs 0, decisions == evenings in count, loop-days
complete or a game-over with its day recorded. If the gate
fails, STOP and report — no confirm spend on a broken
instrument.

CONFIRM (only on a pilot GO, MEASUREMENT §9 Stage 2):
P3 F1 x 60d = 8 legs (same seeds, extended trajectory —
tests whether confirmed creek life persists past 30d) AND
P1 F2 x 30d = 8 legs (covers the named P1 band seeds
17511/17513 for the return-story contrast on the original
stack incl. 17513 days 5-10 camp). Confirm total 16 legs.
No judged band is ever below 8 seeds.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d
tail max is the harness's own end handling). Never a
fixed 200d. The 30d horizon matches strandred so the
re-derivation is seed-comparable; 60d tests persistence,
not reachability.

## Primary metric + verdict bar (judged exactly as written)

Primary metric: confirmed creek nights in the P3 F1 30d
pilot, with return-story classification completeness.

GO BAR (pre-registered exactly, ALL THREE must hold):
1. INSTRUMENT GATE: every pilot leg errs 0, decisions ==
   evenings in count, loop-days complete or a game-over
   with its day recorded.
2. CLASSIFICATION COMPLETENESS: >= 90% of confirmed
   nights in the pilot carry a FAILED-RETURN or
   NO-ATTEMPT story (i.e. UNCLASSIFIED share <= 10%).
   A miss here is NO-GO even if counts are high — an
   unclassified census cannot answer camp-vs-strand.
3. COUNT BAR: >= 2 pilot seeds with >= 1 confirmed creek
   night (the strandred bar, re-judged under the new
   unit).
- GO: verdict = CONFIRMED-NIGHT CENSUS COMPLETE; confirm
  runs as declared above; report the confirmed counts
  and the return-story split (FAILED-RETURN vs
  NO-ATTEMPT) per policy/band, never pooled across
  policies/bands in verdict counts; name the seeds/bands
  for the next strand arm, split by story (strand
  candidates = FAILED-RETURN nights; camp candidates =
  NO-ATTEMPT nights).
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = CONFIRMED-NIGHT CENSUS
  NOT COMPLETE on this band on current master; NO
  confirm spend; the failing bar is named exactly.
  A count miss does NOT get rescued by the class-based
  (genuine + all away-continuation) count, and a
  classification miss does NOT get rescued by dropping
  unclassified nights from the denominator — both are
  reported as their own findings either way.

Secondary reported counts (every leg, never pooled across
policies/bands in verdict counts): creek-tile evenings,
confirmed creek nights + days, unconfirmed creek evenings
by kind (sleep-return / haven-following / end-of-run),
return-story split with firing signals, blocked-crossing
flag counts, confirmed camps + camp-end stories,
genuine overnight absences (absencehunt primary, for
drift comparison vs b26777c16), errs, game-overs.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: confirmed-night analyzer + pure proof
  test, committed before judged legs. Pure proof must
  pass before any judged leg runs.
- JUDGED LEGS: stdout-runner transport (sim prints one
  JSON line per seed to stdout; stdout -> file in
  evidence/ in a foreground exec; idle splitter splits
  into per-seed files; jsonl deleted after split).
  Judged corpora are NEVER staged in /tmp, and judged
  legs NEVER write files from a game-loaded process.
- SENSE TEST (law): read at least one confirmed creek
  camp end to end from THIS arm's corpus (departure
  day, creek nights, following mornings, and any
  return-attempt lines) and judge camp-vs-strand in
  plain words: does the villager read as stuck or as
  camping? Read one camp per policy if both policies
  show confirmed camps.
- EVIDENCE: evidence/2026-10-31/sim-confirmednight-b.md —
  the unit argument, per-seed confirmed-night counts +
  return-story classification (failed-return vs
  no-attempt, with counts), GO/NO-GO verdict exactly as
  judged, named seeds/bands for the next strand arm,
  wall numbers ONLY if the corpus actually measures
  them (otherwise "not measured by this census"),
  metric review, §15 declaration.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the deed-seeking far patrol, the
nighttravel+woodcarry+woodwarm stack, a 30/60-day per-day
creek census, or a census with no variant — the same
declaration every prior strand arm made. The comparison
here is a census across policies on identical seeds through
the census analyzers, never labeled a panel comparison. No
panel result is fabricated; the panel tool is not invoked
on this corpus. If a lever comparison arises (none is
planned — this arm is DIAG only), it will run through
scripts/balance-panel.js and the compare .md will be
attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether camp-final nights followed by succession
  mornings should count as confirmed: NO under this
  prereg — the following morning's vessel is a different
  person at haven, so "waking still away" fails, even
  though the dead camper did sleep at the creek. The
  nights are itemized as haven-following unconfirmed
  nights, not hidden, so a future prereg can argue a
  death-aware unit with evidence.
- Whether the bridge-refusal line should ever promote
  a night to FAILED-RETURN: NO under this prereg — it
  does not name home as the destination. If a future
  arm grounds home-directed crossing attempts (e.g.
  via movement vectors toward haven), it can re-argue
  with that evidence.
- Whether P3's NO-ATTEMPT story means "chose to camp"
  or "no mechanism exists to attempt return": the
  census measures the absence of attempts; the sense
  test judges the reading, and the evidence file states
  which reading the transcripts support. The policy
  (deed-seeking, no walk-home step) makes "no
  mechanism" the prior; only transcript evidence of
  settling/camping intent would move it toward "chose".
- Whether a confirmed night should require the vessel
  to have ARRIVED at the creek that day: NO — camp
  continuations are confirmed nights too, same as
  strandred's camp rule. Camps are reported as runs so
  a future prereg can argue arrival-only with evidence.
