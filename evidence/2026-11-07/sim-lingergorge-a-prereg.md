# sim-lingergorge-a — PRE-REGISTRATION (REGRESSION-VERIFICATION arm, committed BEFORE any judged sim)

Worker: sim-lingergorge-a (Loop A, food-economy / narration).
Run: fleshout-2026-11-07T0715Z. Coordinator claim:
`hidden_files/lever-claims/fleshout-2026-11-07T0715Z.json`
(axis food-economy, arm sim-lingergorge-a).
Assignment as written: BUILD the lingerer-gorge gate/relay fix
for finding #1792. SCOPE REVISION, recorded here BEFORE any
judged sim, with reasons: the fix is ALREADY BUILT, PROVED, and
LANDED on master by sibling arm sim-gorgeharness-a (run
fleshout-20261106T1115Z, fix 6aeba1c88, proof 42/42, verdict GO,
evidence/2026-11-06/sim-gorgeharness-a.md). Rebuilding it would
be a duplicate landing on top of landed code. This run is
therefore a REGRESSION-VERIFICATION arm: it re-runs the after
leg on current master, 231 commits after the census base, and
judges whether the landed gate still holds. No src/js change is
expected; if verification FAILS, the run becomes a repair arm
and the finding stays open with the failure quoted. Finding
#1792 is [claimed] by this run in sim-findings.md; the
harness-phase follow-up finding is already [fixed] by
gorgeharness-a. On a GO here, #1792 is marked [fixed] with this
run's evidence cited.

Base HEAD at prereg time: 59238bcca (worktree
sim-lingergorge-a; main-tree HEAD is the same commit).

No single canon doc covers endDay position-blind narration or
the lingerer-gorge; docs/ was checked — no lingerer/gorge/
haven-growth doc exists. The design lives in
evidence/2026-11-05/sim-gossipcensus-a.md, sim-enddaybeats-a.md
(+ prereg), sim-enddaybeats-fix-a.md (+ prereg), and
evidence/2026-11-06/sim-lingergorge-a.md (+ prereg) and
sim-gorgeharness-a.md (+ prereg). CANON.md was read first; no
canon is invented here.

## The question, precisely

On current master, with the landed gate in place, are gorge
lines still delivered while the scholar is away from Haven —
judged by FIRING-TIME position, any phase, on any away night —
at what rate vs the carried before-leg rate on identical seeds,
and do the at-Haven gorge lines still fire?

## Carried facts (NOT re-measured here — the judged before leg)

From sim-gorgeharness-a (base cc4345e1e, band 49001–49040,
60 loop-days, same policies/env as this run):

- BEFORE leg: 3 away-delivered gorge lines, all in the harness
  phase the morning after a combat-blocked wild night — seed
  49003, loop-day 44, two lines (The Redactor, 1,400 kcal; The
  Influencer, 730 kcal); seed 49014, loop-day 28, one line
  (The Grief Counselor, 800 kcal). 80 at-Haven gorge lines.
  Away linger-endDays 2, haven linger-endDays 39.
- AFTER leg (fixed code): 0 away lines anywhere on the band;
  at-Haven 80 → 80; trajectories identical on 40/40 seeds.
- Drift-off: 0 lines in either leg, away or haven (the ~6-night
  clock never wins its race on this substrate). Relay judged by
  B11 unit evidence, not by the corpus.
- Panel compare: review_required with EVERY paired delta
  exactly 0 (all 4 policies, all 32 cases); the label is driven
  only by insufficient-data luck metrics — investigated and
  explained in the gorgeharness evidence.

The carried before corpus is the judged baseline for this run.
No fresh before leg is possible: the fix is in master, and
reverting it to re-measure "before" is not this run's job.

## Code facts (verified by read on base 59238bcca)

- `havenGrowthDaily` (src/js/havenGrowth.js ~205–262): the
  nightly gorge lines (:266 got > 0, :268 empty-pantry) are
  wrapped in `if (this.scholarAtHaven &&
  this.scholarAtHaven())` — the landed gate (6aeba1c88).
  The drift-off line (:234) already calls `sayHavenNews(...,
  'raid')` — the landed relay.
- Mechanics above the gate (take draw, raidPillage kcal loss,
  drift clock, lastLingererOffer recording) run identically
  either way; the gate consumes no RNG.

## Primary metric (REVISED — adopted verbatim from the gorgeharness prereg)

PRIMARY: gorge lines delivered while scholarAtHaven() is FALSE
at FIRING TIME, ANY phase, on ANY away night (stranded +
combat-blocked + otherwise out). A hit counts iff the gorge
line's nearest pre-endday marker reports atHaven === false.
Both nightly variants count (got > 0 and empty-pantry). The
stranded-sleep window metric is RETIRED for this beat — it
missed the harness-phase channel by construction (proved by
the 0821Z census).

COUNTING RULES (bind this run):
- Firing-time position is the nearest `pre-endday` marker at or
  before the line's idx (gorgeharness-diag). The old
  marker-based positionAt is a cross-check: for every gorge
  hit, both readings are recorded; a disagreement is reported
  as a finding with the line quoted.
- A drift-off line queued while away and flushed on return
  counts as a HAVEN delivery (said at the fire, on return),
  never as an away delivery.
- A gorge line fired on haven tiles (scholarAtHaven() true)
  is a Haven delivery, NOT the defect.

OPPORTUNITY UNIT: a LINGER-ENDDAY is one endDay pass with >= 1
lingering raider present, measured by >= 1 gorge or drift-off
line fired in that pass (grouped by the pre-endday marker the
lines belong to). An AWAY LINGER-ENDDAY is a linger-endDay
whose pre-endday marker reports atHaven === false.

POWER BAR (pre-registered, applied to the AFTER leg): total
gorge lines (all positions) >= 20 across the band AND away
linger-endDays reported. Rationale: the carried before leg had
83 total gorge lines; if the after leg on current master shows
< 20 total gorge lines, the 0-away result is unpowered (the
gorge may simply not have fired) and the verdict is
INSUFFICIENT-DATA, never GO. (The before leg's own power bar —
away linger-endDays >= 2 AND total gorge >= 20 — already
passed in the gorgeharness run and is carried, not re-judged.)

VERDICT RULE (pre-registered): GO iff the after leg is powered
AND the after leg shows 0 away-delivered gorge lines AND
guardrail (i) passes AND the det-gate holds AND both proof
tests are green. A residual away hit in the after leg is NO-GO
for the gate, quoted verbatim with the missed path named. The
relay is judged by B11 unit evidence, not by the corpus.

GUARDRAILS (pre-registered):
(i) NO SILENCING of at-Haven delivery. After-leg at-Haven
gorge count >= 50% of the carried before-leg at-Haven count
(80) — the gate suppresses delivery away, not the gorge
itself. Mechanics guards (unit B9/B10): kcal still taken,
offer still recorded, linger still ends, away queues nothing
for the nightly line. Held-volume accounting: the driver
records `pendingHavenNews` depth per evening (read-only);
report max/mean depth per seed.
(ii) DET-GATE: instrument ON vs OFF identical on seed 17021
(proof test). Any divergence = instrument contamination;
stop.
(iii) TRAJECTORY CAVEAT (revised from the assignment's
suggested "trajectories identical on all seeds" — that
threshold assumed a build arm with a fresh before leg on the
same base, which is false on current master): master moved
231 commits between the census base b5fb49607 and this base,
including real gameplay changes (armor curve K=20→6,
veteran's edge, bond-initiation, wanderer-spawn HP fix).
Per-seed daysAlive in the after leg is therefore NOT expected
to match the carried before leg seed-for-seed. daysAlive per
seed is reported in full; divergences from the carried table
are substrate drift from other landed arms, attributed as
such, not hidden — and the gate verdict does NOT depend on
trajectory identity in this verification arm (the fix's own
trajectory identity was already proven 40/40 by
gorgeharness-a on its base). Any seed whose gorge-count
pattern looks anomalous gets a read in the evidence.
(iv) NO gate/price/deed-RULE change: this arm makes no src/js
change at all. If a repair becomes necessary, it touches only
say calls, and the panel question re-opens (see below).
(v) REGRESSION ANCHORS: the 3 documented away deliveries
(s49003 d43→d44 grove, 2 lines; s49014 d27→d28 creek, 1 line)
must read 0 away deliveries on the after leg — IF those
trajectories reproduce on current master. If they do not
reproduce (substrate drift), that is reported as a finding,
not silently re-anchored; the verdict then rests on the
band-wide 0-away count.

SENSE TEST (SENSE-TESTING LAW): every residual away hit is
quoted verbatim with its full firing context read; per beat:
reads-true / gated / relayed-true / still-wrong. A gated gorge
must read true at the fire and never invite a sortie from the
wild.

## Balanced panel — OUT OF SCOPE for this verification arm (pre-registered scope decision)

gorgeharness-a already ran the §15 before/after panel compare
for this exact fix on this exact band: every paired delta
exactly 0, review_required driven only by insufficient-data
luck metrics, investigated and explained in its evidence. A
fresh compare on current master would measure 231 commits of
other arms' landed gameplay changes (armor curve, veteran's
edge, bond-initiation), not this fix — any signal would need
attribution work outside this arm, and a clean result would
prove nothing about the gate. The panel evidence therefore
stands cited, not re-run. If this arm has to BUILD a repair,
the panel question re-opens and a fresh before/after compare
is required before landing.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (same substrate; dead villages stop
  simulating, so 60 is a cap, not a sentence).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1
  WOODWARM=0 BANKFOOD=1 STRANDNARR=1 (the parent arm's leg,
  verbatim).
- Instrument: scripts/gorgeharness-trace-a.js + 
  scripts/policies/gorgeharness-diag.js (the judged
  revised-metric instrument, reused UNCHANGED — no new driver
  code in this arm). OUTDIR must be passed explicitly:
  evidence/2026-11-07/sim-lingergorge-a-corpus/after/
  (the driver's default points at the 11-06 gorgeharness
  before dir and must NOT be used).
- PILOT (8 seeds, judged first, before any confirm spend):
  49001–49008.
- SCREEN / CONFIRM (runs ONLY after the pilot): the same
  driver over 49009–49040 (32 seeds). Every seed in the band
  runs, stranding or not, so the screen cannot inflate the
  rate by selection.
- EXTENSION RULE (pre-registered): if the pooled after leg
  misses the POWER BAR (total gorge lines < 20), extend the
  AFTER leg with 49041–49064 (24 seeds, verified fresh below)
  and re-pool. No cherry-picking, no other seeds. The before
  leg is carried and is not extended.
- SEQUENCING (pre-registered): (1) prereg commit; (2) proof
  tests on the fixed code — expect test-lingergorge-a.js 33/33
  (the 4 checks red on unfixed code go green) and
  test-gorgeharness-a.js 42/42; (3) AFTER pilot → judge;
  (4) AFTER screen; (5) evidence. No instrument commit is
  needed (reuse as-is); no fix commit is expected.

## Band freshness (verified BEFORE any judged sim)

Band 49001–49040 (pilot + screen), extension 49041–49064.
This is DELIBERATE reuse of this arm's own judged band (named
in sim-lingergorge-a-prereg.md 2026-11-06 and in
sim-gorgeharness-a-prereg.md), NOT a fresh-band claim — the
after leg must run on the same seeds that produced the defect
observation. Whole-token grep, run 2026-11-07 ~01:50Z, over
the worktree:

- ALL dated preregs (evidence/*/sim-*-prereg.md): no prereg
  other than this arm's own (11-06) and gorgeharness's names
  any token in 49001–49064.
- sim-findings.md: ZERO tokens in 49001–49064.
- ALL evidence .md: the only in-band token outside this arm's
  and gorgeharness's files is INCIDENTAL — 49016 is a
  pantry-kcal table value in sim-preservesched-b.md (already
  documented in the 11-06 prereg).
- Forbidden-band lists (99201–99248, named in the 2026-11-04
  preregs): the band does not touch them.
- No file anywhere carries a 49001–49064 token in its name
  outside this arm's corpus dirs.
- The band stands for this arm's reuse; no new band is
  assigned in this run.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood
evening records, morning records, first-upkeep kcal series,
and daily-entry scholar kcal must be identical (covered by
the proof tests' det-gate checks). Any divergence =
instrument contamination; the run stops and the instrument
is fixed first.

## Anchor reproduction (judged in the proof tests)

- 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — do not
  assume): the anchor has drifted repeatedly (57d lost → 60d
  survived → 52d lost → 60d survived on b5fb49607; 60d
  survived on cc4345e1e). The proof tests assert the 17021
  facts AS FOUND on this base (recorded, not assumed). If the
  facts moved again, that is reported as a finding (substrate
  drift), not silently re-anchored.
- Known non-stranded sleep-window gossip hit: seed 15003
  loop-day 7 (strandnarr-a §2). The proof tests assert the
  driver captures a `Word gets around the haven` line inside
  the loop-day-7 sleep window on seed 15003, classified
  non-stranded sleep with the scholar inside Haven at fire
  time. If the exact loop-day does not reproduce, that is
  reported as a finding (substrate drift), not silently
  re-anchored.
- The 3 documented away deliveries are regression anchors for
  the after leg, not proof anchors (see guardrail (v)).

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA per the rules above, never re-scored
against a friendlier metric mid-run. If a metric proves
wrong, it goes under "metric review" in the evidence file
with a revision proposed for the NEXT run. Every evidence
file carries a "metric review" section.

## Wall numbers (carried, NOT re-measured)

This is a narration verification corpus; it records no scale
outcomes. Carried state from the 1041Z round (0915Z run, 24
distinct seeds): wins 0/24, national 0/24, table 0/24,
wave-5 0/24, readiness-5-ready days 0/24.

## Secondary deliverable (open item from the gorgeharness prereg)

state.lastLingererOffer reader verdict: grep the whole tree
(src/js AND scripts/ AND docs/) for readers. Preliminary read
(done before any judged sim): the only src/js mention is the
writer in havenGrowth.js; readers exist ONLY in sim/test
tooling (scripts/policies/sortieretry.js,
scripts/policies/sortietarget.js, scripts/sortietarget-fixture.js).
The evidence file reports the final verdict (DEAD STATE in the
shipped game vs FOUND READER), naming each reader and what it
does with the offer. No recording change is made (the fix does
not need it).

## Deliverables

- evidence/2026-11-07/sim-lingergorge-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-07/sim-lingergorge-a.md (verdict, rates
  with denominators, every away hit quoted verbatim if any,
  sense verdict, metric review, panel scope decision)
- evidence/2026-11-07/sim-lingergorge-a-corpus/after/ (per-seed
  JSON from the reused gorgeharness driver: judged lines with
  firing-time position + pre-endday markers; linger-endDay
  table; pendingHavenNews depth series; per-beat total line
  counts)
- No new scripts, no src/js change on a GO. On a NO-GO the
  run becomes a repair arm and the prereg is amended by
  correction commit before any repair is built.
- sim-findings.md: #1792 marked [fixed] on a GO (citing this
  run's evidence + the landed fix 6aeba1c88), left [claimed]
  with the failure quoted on a NO-GO.
