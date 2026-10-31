# sim-strandfix-ticks-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
arm sim-strandfix-ticks-b, axis food-economy (backlog: the
tickbudget strand-fix step). Worktree sim-strandfix-ticks-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing script.
New files are ONE policy instrument (scripts/policies/
strandfix-ticks-diag.js, default OFF), ONE driver
(scripts/strandfix-ticks-trace-b.js, adapted from
scripts/tickbudget-trace-b.js with ONLY the changes disclosed
below), ONE analyzer (scripts/analyze-strandfix-ticks-b.js),
ONE proof script (scripts/test-strandfix-ticks-b.js), plus
evidence files. Sibling trees, claims, and branches never
touched. The main tree never touched.

## Prior evidence read in full before designing anything

evidence/2026-10-30/sim-tickbudget-b.md,
sim-kcalshort-b.md, sim-fedexile-b.md, sim-warmfuel-b.md,
sim-strandbank-b.md — plus docs/CANON.md first, then
docs/TIME-ECONOMY.md (the clock: 512 ticks/day; forage 16;
eat 1; bridge 96; carry-tickAction 2; node travel free).
The strand is already fully priced (kcalshort + tickbudget):
strand evenings fail on food AND wood jointly, ticks are a
third gate. Tickbudget's census (orientation only, old base
f52f08600 — NOT quoted as current below): 8 ticks-short
evenings on 15215 — alone 5, plus-wood 2, plus-both 1;
PRESS-DECISIVE only 1 evening (guard-variant day 10);
ROUTINE-ONLY 5 including the day-7 hole (49 ticks short on
all 4 legs, no morning behavior fired). Every judged number
in this arm comes from THIS arm's own legs on the pinned
base below; sibling corpora were read for orientation and
prereg grounding only, never used as judged input.

## The question

Tickbudget's headline for the coordinator: a
morning-behavior design that budgets only the press still
strands day 7 on every leg — the day-7 hole is 49 ticks of
routine + waits, and no morning behavior exists on that
morning to budget. This arm is the next step, a
strand-fix DESIGN measurement, not a default flip: build
a tick-preservation instrument that addresses the ROUTINE
+ WAITS hole, and measure, on identical seeds, whether
removing routine ticks on creek days moves ticks-short
evenings — including whether day 7 moves or not. An
instrument that only trims the press is pre-registered
here to expect NO-GO on day 7; this instrument is NOT a
press trim (the press stays exactly as pressb-diag runs
it), so day 7 is reported separately and honestly, moved
or not, and the GO bar below does NOT require day 7 to
move — it requires a leg-total fall plus a genuine
bridge-built conversion, which the design below can in
principle supply through the press-decisive evening and
the plus evenings (see Expected shape).

## The instrument: creek-wake hold day (routine-zero counterfactual)

New policy scripts/policies/strandfix-ticks-diag.js,
default OFF (STRANDFIX=1 arms it; unset/0 delegates to
inner.daily untouched). It wraps nighttravel, inside the
woodcarry wrapper, so the woodcarry morning carry and
evening bridge still run around it (stack, instrument
legs: pressb(warmed(woodcarry(strandfix(nighttravel)))));
control legs run the tickbudget stack without it.

BEHAVIOR (one rule, pure gate, unit-tested): at daily
entry, if the villager WOKE ON A CREEK TILE, is NOT
inside haven, is NOT in a tent, is NOT dead or in
combat, and the day is already 3/4 spent
(morningDayTicks >= 384, i.e. ticksLeft <= 128 — the
sim-day budget left after the harness's 3 part waits),
then SKIP the routine (do NOT call inner.daily's
competent day) and run ONLY the night step
(nighttravel's exported nightStep, with the same
ctx._ntLast bookkeeping nighttravel.daily performs), so
the evening travel attempt and the woodcarry bridge
decision still happen that evening. The day's routine
tick spend is therefore 0 by construction (proven by
probe, not asserted), and the evening bridge sees
ticksToDayEnd = 512 - morningDayTicks - pressTicks
(press is outside the wrapper and still fires when its
own gate holds) — 128 on a press-free hold morning,
111 on a press-fired hold morning (384 + 17).

WHY THIS GATE, AND WHY IT CANNOT MOVE DAY 7: day 7's
morning wakes AT HAVEN (inside, tile haven, 4 logs,
~2364 kcal — tickbudget orientation), not at a creek,
so no creek-wake rule can fire on it; day 7 is the
first strand evening and has no still evening behind
it. The hold rule fires on strand-continuing mornings
(villager slept out at the creek) and on any other
creek-wake short-day morning — the pilot and confirm
censuses count ALL firings, not just 15215's, so a
broad firing pattern is visible, not hidden. The rule
uses ONLY what the villager itself knows at morning:
where it woke (its own tile, per the perception law —
no roster, no snapshot, no whole-tile scan), whether
it is inside, and the day-clock it can see (the UI
tick bar, docs/TIME-ECONOMY.md). It reads no future
evening, no previous-evening record (the woodcarry
wrapper resets ctx._wcLast before this wrapper runs,
so the gate is deliberately previous-record-free),
and draws no RNG. It edits no state except through
the engine's own night-step verbs (travel attempt +
evening step on arrival, exactly as nighttravel does);
on a refused evening it edits nothing at all.

WHAT THE HOLD IS AND IS NOT: it is a DESIGN
MEASUREMENT — the upper bound of what routine-trimming
can buy on creek days ("if the villager spent the
strand day idle at the creek, would the bridge
build?"). It is NOT a proposed villager behavior: a
person idle all day at a creek, foraging nothing, is
not sensible play, and the sense-read below reports
that emptiness as the instrument's cost. A real design
built on a GO here would trim selectively (skip the
second forage, the craft, the long walk — the
routine's own expensive beats), not idle the whole
day; this arm prices the bound, it does not prescribe
the trim. The WAITS part of the hole is NOT moved by
any policy: the 384 waits ticks are spent before
daily entry on ticks-short evenings, and no policy
can unspend them. The instrument moves the routine
part only; the waits stay in every anatomy line, and
the verdict must say so. With waits fixed at 384, a
hold morning leaves 128 (or 111 with press) ticks —
above the 96 bridge need — which is exactly why the
bound is informative: it separates "routine spend
strands the evening" from "waits alone strand the
evening" (waits alone leave 128 >= 96, so waits
alone never strand; routine + waits do).

EXPECTED SHAPE (prediction, NOT a judged number —
judged only on the fresh legs below; stated so a
divergence is visible): on the variant baseline the
ticks-short evenings are day 7 (alone, routine) on
both legs, guard day 10 (alone, press-decisive),
ON days 13 (plus-both), 18 and 22 (plus-wood). The
hold should: leave day 7 untouched on both legs
(haven wake, gate does not fire); rescue guard
day 10 (hold morning, press 17 + routine 0 = 401
dayTicks, 111 ticks left, wood 4, kcal fed — bridge
builds); clear the ticks gate on ON days 13, 18, 22
(routine 0, ticks 128/111 — evenings stay still on
their wood/kcal gates, honestly reported as
ticks-cleared-not-rescued, never as rescues). That
shape, IF it reproduces on the fresh base, gives a
leg-total fall of 4 (guard 2 -> 1, ON 4 -> 1) with
1 bridge-built conversion (guard day 10) — a GO
under the bar below, with day 7 honestly unmoved.
If the fresh base diverges (different strand days,
different morning alignments, warmth interaction),
the bar is judged on the fresh numbers, never on
this prediction.

## Canon (read before judging)

- docs/CANON.md first, then docs/TIME-ECONOMY.md.
- Engine facts, code reads, stated not invented:
  bridge gate order in scripts/policies/woodcarry.js
  bridgeDecision is wood (>= 4) THEN kcal (>= 60)
  THEN ticks (>= 96) — the spoken bridge line names
  only the FIRST failing gate (tickbudget + kcalshort
  first-failure incompleteness, extended here to
  ticks). The census therefore uses RAW GATES from
  the classification record, never the skip reason
  alone. Bridge need is constant: 96 ticks, 4 logs,
  60 kcal. Shortfall = 96 - ticksToDayEnd.
- Loop-day tick anatomy (sim-harness runDays + game
  tickAction/endDay): each loop-day the harness waits
  3x to part boundaries BEFORE policy.daily (morning
  dayTicks 256 or 384, i.e. 256/384 wait ticks already
  spent at daily entry), then policy.daily plays entry
  behaviors + routine + evening bridge, then sleep()
  rolls the day. The bridge decision reads
  ticksToDayEnd = 512 - dayTicks at the woodcarry
  evening step, BEFORE the woodwarm post-step fire
  (ON legs) — warmth-fire ticks can never cause that
  evening's refusal and are reported as post-decision
  context only, never as attribution.

## Definitions (the judged quantities)

- CREEK EVENING / STILL / RESCUED: as tickbudget
  (woodcarry bucket 'creek'; still = rescued false;
  rescued = bridge built, walked home). Non-creek
  refused evenings carry no bridge decision and are
  excluded, with the count reported.
- RAW GATES (per creek evening, from classification):
  woodGate = woodPlayer >= 4; kcalGate = kcalLive >=
  60; ticksGate = ticksToDayEnd >= 96.
- TICKS-SHORT EVENING: creek evening with ticksGate
  false. Split by raw gates into alone / plus-wood /
  plus-kcal / plus-both (tickbudget classes).
- ATTRIBUTION (per CONTROL ticks-short evening, the
  tickbudget classes, counterpart = same seed, same
  loopDay, same WOODWARM, opposite PRESSB — here the
  counterpart pair is control-variant vs
  control-control, exactly as tickbudget ran it):
  PRESS-DECISIVE / PRESS-CONTRIBUTING / ROUTINE-ONLY
  (no press fired that loop-day). A missing
  counterpart (no creek evening) never supports a
  decisive claim (tickbudget refinement, kept).
- HOLD MORNING: a loop-day on which the strandfix
  gate fired (store.holds row). HOLD EVENING: that
  loop-day's evening. ROUTINE on a hold evening = 0
  by construction (probe-verified: strandfix layer
  total equals night-step total, nighttravel probe
  absent because inner.daily was not called).
- CONVERTED TO RESCUED / BRIDGE-BUILT: a control
  ticks-short evening (seed, loopDay, WOODWARM leg)
  whose instrument-leg same-seed same-loopDay
  same-WOODWARM evening is a creek evening with
  rescued true AND bridge attempted + built true.
  Staying home by never leaving haven is NOT a
  conversion (no creek evening, no bridge) — it is
  reported, if it occurs, as an avoided evening,
  never counted toward the GO bar's rescue clause.
- TICKS-CLEARED-NOT-RESCUED: an instrument-leg
  evening on a control ticks-short (seed, loopDay,
  leg) that passes the ticks gate but stays still on
  wood and/or kcal. Reported separately from
  conversions; it contributes to the leg-total fall
  (it is no longer ticks-short) but NOT to the
  rescue clause.
- NEWLY-TICKS-SHORT / NEWLY-STILL: instrument-leg
  evenings ticks-short (resp. still) whose control
  same-seed same-loopDay same-leg evening was NOT
  ticks-short (resp. NOT still). The leg-total fall
  already nets these (fall = control total minus
  instrument total); they are additionally listed by
  evening so a fall driven by trajectory churn is
  visible, not hidden.
- STRAND: maximal run of consecutive still evenings
  (tickbudget/fedexile definition). Strand legs =
  legs with >= 1 strand. The census covers ALL creek
  evenings on ALL legs, so a ticks-short evening on
  a non-stranding seed still counts.
- DEATH-DELAY: bearer-death day pairing control ->
  instrument per seed per WOODWARM leg (fedexile
  definition: deaths of the played character across
  bearer changes; CENSORED if no bearer death on
  either leg; endReason + daysAlive paired).

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time,
  full hash 52df7e732d7e31c8cb6aae92c778f00cdebf8294
  ("journey-endgame r74: pellet-quote variant +
  return-ghost guard"). This base is NEWER than
  tickbudget's pin (f52f08600), so NOTHING is quoted
  from tickbudget's / fedexile's / kcalshort's /
  warmfuel's censuses, strand days, or ticks numbers
  as current-base behavior: all legs below are
  re-derived on the pinned base and judged against
  those fresh numbers. Divergence from prior values
  is DRIFT to report (driver diff first, then base
  diff), never a failure to hide.
- Tracked diff guard: at evidence time, `git diff`
  of src/ between pinned base and final tree must be
  EMPTY, and scripts/policies/ must contain NO edits
  to any pre-existing file (the ONE new policy file
  and the driver/analyzer/proof additions are the
  only policy/script changes; existing scripts are
  byte-identical to base).

## Implementation (reuse + one policy + one driver, no reinvention)

- VARIANT POLICY: scripts/policies/pressb-diag.js
  UNMODIFIED (PRESSB=1 arms it; PRESSB=0 delegates
  untouched). Stack on control legs (tickbudget
  driver): pressb(warmed(woodcarry(nighttravel))).
- NEW POLICY: scripts/policies/strandfix-ticks-diag.js
  (new file; header states DIAG ONLY, default OFF,
  gate, perception-law basis, and the routine-zero
  counterfactual reading). Exports withStrandfix,
  newStore, holdDecision (pure gate, unit-tested).
  The wrapper NEVER calls microMove, cutTree,
  clearBrush, forage, eat, or travelTo itself; on a
  hold morning it calls only nighttravel's exported
  nightStep (the engine travel + evening step the
  routine would have run anyway) with nighttravel's
  ctx bookkeeping replicated. At most one hold/skip
  record per loop-day. Recording errors are counted
  in store.errs and never thrown into the engine.
- DRIVER: scripts/strandfix-ticks-trace-b.js (new,
  adapted from scripts/tickbudget-trace-b.js with
  ONLY these changes, disclosed here): (1) stack
  pressb(warmed(woodcarry(strandfix(nighttravel)))))
  with a STRANDFIX env gate asserted FATAL
  ('0'|'1'); (2) a pure-read tick probe around the
  strandfix layer (same probeWrap as tickbudget's,
  no RNG, no state edits), so the probe chain is
  nighttravel, strandfix, woodcarry, woodwarm;
  (3) evening rows carry strandfixHold /
  strandfixSkip records for that loop-day plus the
  strandfix store summary; (4) fullDaySay is also
  recorded on held mornings (the sense-read needs
  the hold day's own lines, including a rescued
  hold day, which tickbudget's still-only rule
  would not record). Env gates, seed order, write
  transport, morning/evening recording, and all
  other behavior are VERBATIM from
  tickbudget-trace-b.js. Any further driver edit
  voids the reuse claim and must be disclosed.
- CONTROL DRIVER: scripts/tickbudget-trace-b.js
  UNMODIFIED, OUTDIR override only (the baseline
  legs below).
- ANALYZER: scripts/analyze-strandfix-ticks-b.js
  (new, pure reads): creek-evening extraction per
  leg, raw-gate classification, ticks-short split,
  attribution classes (tickbudget definitions),
  hold census (firings per seed/leg, morningDayTicks
  distribution, routine-zero probe check), paired
  conversion table (control ticks-short -> instrument
  same-day outcome: rescued / ticks-cleared /
  still-ticks-short / no-creek-evening / trajectory
  divergence), strand extraction, guardrail census
  (creek/still/rescued per leg, errs, stalls), warmth
  acted/spent comparison, death-delay pairing, wave
  reach, wall numbers, and the §15 paired compare
  .md. Analyzer outputs: evidence/2026-10-30/
  sim-strandfix-ticks-b-census.json,
  sim-strandfix-ticks-b-hold-table.json,
  sim-strandfix-ticks-b-compare.md (plus pilot
  equivalents with -pilot suffix).
- PROOF: scripts/test-strandfix-ticks-b.js — pure
  unit tests (hold gate: all fire/skip branches incl.
  haven wake, tent, combat, game-over, 256 vs 384
  boundary, creek vs non-creek wake; raw-gate
  classification incl. all four ticks-short splits;
  conversion classes incl. avoided-evening-is-not-
  conversion; counterfactual arithmetic) PLUS corpus
  checks (corpora present for all 10 bank seeds on
  all judged legs; errs 0; press ticksSpent == 17 on
  every fired morning; routine-zero probe check on
  every hold evening; pilot-vs-confirm byte-identical
  on all overlapping files per same-driver leg;
  det-gate census+trajectory identity, see below;
  src/ diff empty; no pre-existing policy/script
  file modified). Pure tests run before any leg;
  corpus checks run when corpora exist and are
  reported as skipped (not passed) before legs exist.

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, wakeforage/pressb order): 15003, 15009,
15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439.
Horizon justification (30 loop-days, reused from
woodday/walktree/wakeforage/pressb/fedexile/
tickbudget, NOT a fixed 200d): the strand cycle
closes inside it on every prior base (guard 7-9/10,
ON 7-16/23, all < 30); longer horizons add no strand
information on this bank. Death-aware: the driver
records daysAlive / endReason per seed and stops at
death; any leg death is reported per seed, never
averaged away. Ceiling note: all seeds survived 30
days on prior legs — if that repeats, median
survival 30 is a window ceiling, not a survival
claim. Same env gates on every leg: COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=nighttravel WOODCARRY=1 DAYS=30.

- PILOT (gate before confirm spend): first 8 bank
  seeds (15003, 15009, 15091, 15211, 15215, 15220,
  15221, 15337) on 4 legs — control-variant guard/ON
  (tickbudget driver, PRESSB=1) and instrument
  guard/ON (new driver, PRESSB=1, STRANDFIX=1) — into
  evidence/2026-10-30/
  sim-strandfix-ticks-b-corpus-pilot-<leg> (32 files).
  Pilot gate (all must hold, else fix the instrument
  and re-pilot, never proceed to confirm): (a) all 32
  pilot files present, errs 0, stalls 0; (b) strandfix
  store rows present on every instrument pilot
  loop-day (hold or skip, no missing rows); (c)
  routine-zero probe check holds on every pilot hold
  evening (strandfix total == night-step total, no
  competent routine ticks) or each mismatch is named
  with a mechanism; (d) every pilot creek evening
  classifiable by raw gates (no null wood/kcal/
  ticks). The pilot is an instrument gate, not a
  verdict: no judged number comes from pilot legs
  alone.
- JUDGED (confirm) LEGS, all 10 bank seeds:
  (1) CONTROL-VARIANT guard + ON (tickbudget driver,
  PRESSB=1) — the GO bar's control; (2) INSTRUMENT
  guard + ON (new driver, PRESSB=1, STRANDFIX=1) —
  the GO bar's treatment; (3) CONTROL-CONTROL guard +
  ON (tickbudget driver, PRESSB=0) — the strand-set
  re-derivation (canonical strand census); (4)
  DET-GATE guard + ON (new driver, PRESSB=1,
  STRANDFIX=0) — instrument-OFF legs, into
  evidence/2026-10-30/
  sim-strandfix-ticks-b-corpus-detgate-<leg>.
  Confirm corpora: sim-strandfix-ticks-b-corpus-
  <control-variant|instrument|control-control|detgate>-
  <guard|on> (10 files each, 80 files).
- DETERMINISM: (a) pilot-vs-confirm byte-compare on
  all 8 overlapping seeds per same-driver leg (pilot
  control-variant vs confirm control-variant;
  pilot instrument vs confirm instrument) — a
  mismatch stops the run (instrument
  non-determinism, never re-scored). (b) DET-GATE:
  instrument-OFF legs must reproduce the
  control-variant legs' counts EXACTLY — per-seed
  creek/still/rescued, strand days, and per-evening
  wood/kcal/ticks plus per-loopDay eveningDayTicks
  trajectories. Byte-identity is NOT the det-gate
  test (the new driver's tickProbe arrays carry one
  extra layer record by design, so files differ in
  probe records even on identical trajectories);
  census + trajectory identity is the test, and any
  mismatch is named per seed/evening. A det-gate
  failure voids the instrument comparison (the
  driver, not the instrument, moved the numbers).

## Bars (GO, judged exactly as written; a miss is NO-GO, never re-scored)

- PRIMARY METRIC: ticks-short evenings (raw gate,
  ticksToDayEnd < 96) on the strand seed(s), control
  vs instrument, summed across guard + ON legs.
- GO iff (ticks-short evenings fall by >= 2 across
  guard + ON, control-variant total minus instrument
  total) AND (at least 1 control ticks-short evening
  is converted to rescued/bridge-built, per the
  Conversion definition above). Both clauses must
  hold; a fall driven only by ticks-cleared-not-
  rescued evenings (still still on wood/kcal) with
  zero bridge-built conversions is NO-GO; a single
  conversion with a fall of 1 is NO-GO.
- DAY-7 CLAUSE (reported, NOT part of the GO bar):
  the day-7 hole is reported separately per leg —
  moved (instrument same-day evening rescued or
  ticks-cleared) or not (still ticks-short, or no
  creek evening) — with its full arithmetic. The
  prereg expectation is NOT MOVED (haven wake, gate
  does not fire; see Expected shape), but the
  verdict follows the fresh legs, never this
  expectation: if day 7 moves, the mechanism (which
  gate fired, which routine changed) must be named,
  because a haven-wake hold would contradict the
  gate as written.
- SECONDARY (reported, NO bar): per-evening
  ticks-shortfall + attribution class on control and
  on remaining instrument ticks-short evenings;
  kcal/wood gates on converted evenings (a ticks fix
  that strands on kcal instead is a gate-shift, not
  a rescue — converted evenings must pass all three
  gates by definition, and any instrument evening
  that is still on kcal where its control was
  rescued is listed as a gate-shift cost);
  death-delay; hold firing census (all seeds, all
  legs); warmth acted/spent control vs instrument;
  newly-still evenings; wave reach (1-5) and wall
  numbers (national/table/wins — structural 0s
  expected on this 30-day pre-seat substrate, stated
  with that reason, not as a game verdict; median
  survival with the ceiling note); villager-behavior
  sample + sense-reads (below).
- SENSE-TEST: (a) the first converted evening if
  any (else the first ticks-cleared evening), full
  day lines read end to end, judged for meaning:
  does the day read as a person saving time for a
  bridge, or as an empty day with a bridge at the
  end? The hold day's emptiness is the instrument's
  cost and must be stated, not smoothed over.
  (b) the day-7 evening on the instrument legs,
  read end to end, judged for meaning (unchanged
  routine day ending ticks-short, or moved — with
  mechanism). (c) near-miss texture: tickbudget's
  finding (decisive evenings draw no reaction) is
  noted ONLY if the instrument changes it — no
  wording change is proposed or measured here, and
  none is claimed.
- PANEL (§15): the official balance-panel driver
  cannot express this arm — its policies are
  sweep-compare registry policies, not the
  nighttravel+woodcarry+woodwarm strand stack, and
  the 23-metric contract has no ticks-short /
  shortfall / hold-firing metrics (same standing as
  sim-pressb-b, sim-fedexile-b, sim-tickbudget-b).
  The §15 compare attached to the evidence is
  therefore the paired compare .md written by
  scripts/analyze-strandfix-ticks-b.js (per-seed
  paired control-vs-instrument on the pre-registered
  ticks metrics + guardrail metrics: survival, death
  causes, wave reach), with this deviation stated on
  its face. Running the official driver on a
  different stack/horizon would measure a different
  question and is NOT done as a substitute. This is
  a DIAG design measurement with a paired
  comparison judged for completeness, not a
  before/after lever claim for a game change.

## Forbidden (violations void the run)

- Any src/js change; any edit to scripts/policies/*
  or any existing script; any policy-default flip;
  quoting prior arms' old-base strand days, ticks
  numbers, or wave reach as current without the
  fresh legs above; using any sibling arm's output
  (including tickbudget's corpora) as this arm's
  judged input — sibling corpora were read for
  orientation and prereg grounding only; every
  judged number comes from this arm's own legs;
  touching sibling trees, claims, branches, or the
  main tree; writing sweep outputs anywhere but
  worktree evidence/; re-scoring the GO bar against
  a friendlier metric mid-run (a miss is NO-GO;
  metric doubts go under "metric review" for the
  NEXT run).

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether the
  leg-total fall (robust to trajectory divergence)
  vs a paired-evening fall (fragile once hold days
  change later days) is the right GO unit — the
  prereg judges the leg total, with the paired
  conversion table alongside so divergence is
  visible, not hidden; whether ticks-cleared-not-
  rescued evenings should count toward the fall
  (they do, by the fall definition — they are no
  longer ticks-short — but they never count toward
  the rescue clause, which is what keeps the fall
  from being a pure gate-relabel); whether the
  holds' kcal cost (skipped routine foraging that
  would have fed the evening) shows up as
  gate-shift still evenings, and whether that cost
  is priced in the verdict (it must be listed, and
  a GO with a large gate-shift cost must say so);
  whether the harness waits (384) belong in the
  attribution anatomy (they are reported as their
  own line, never folded into routine — with waits
  excluded, the hold question is whether entry +
  routine alone leave < 96, which the hold answers
  by construction on hold days); whether the
  det-gate's census+trajectory identity (not byte
  identity) is the right neutrality test for a
  driver that adds a probe layer (it is — the probe
  records differ by design, the trajectory must not).
- If the verdict is GO, the next step is the
  coordinator's design decision on selective
  routine-trimming (which routine beats to skip,
  priced by this bound) — NOT another measurement
  of the same hold, and NOT a default flip of this
  counterfactual instrument. If NO-GO, the next run
  must name the bar that failed (fall clause or
  rescue clause) and fix the instrument, not re-ask
  the question on the same legs. If day 7 moves,
  the gate as written is contradicted and the next
  run must explain the mechanism before any design
  use.
