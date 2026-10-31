# sim-tickbudget-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0007Z,
arm sim-tickbudget-b, axis food-economy (backlog #1570).
Worktree sim-tickbudget-b. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero new policy files, zero
edits to any existing policy file or existing script. New files
are measurement scripts only (scripts/tickbudget-trace-b.js,
scripts/analyze-tickbudget-b.js, scripts/test-tickbudget-b.js)
plus evidence files. Sibling trees, claims, and branches never
touched. The main tree never touched.

## The question (open finding from sim-fedexile-b, backlog #1570)

Loop-B arm sim-fedexile-b (run fleshout-loop-b-20261030T2230Z,
evidence/2026-10-30/sim-fedexile-b.md §4) found on warmth-off
guard-variant legs a day-10 press costing 17 ticks leaves the
villager 3 ticks short of a bridge (93 < 96) and adds a still
evening the control leg does not have. A morning behavior with
a tick cost can strand by time, not just by food or wood. This
arm is the tick-budget census: across the same 2230Z substrate
(guard/ON legs, POLICY nighttravel, DAYS=30 pre-seat), measure
for each strand leg every morning behavior's tick cost, the
bridge tick need, and every ticks-short evening — split into
ticks-short-alone vs ticks-short-plus-food/wood-short — and
attribute each ticks-short evening to a named tick cost (press
or other). A morning-behavior design must budget ticks, not
just kcal: quantify how often tick cost alone strands an
evening.

## Canon (read before judging)

- docs/CANON.md read first, then docs/TIME-ECONOMY.md (the
  clock: 512 ticks/day; forage 16 ticks; eat 1; fell 96;
  bridge 96; carry-tickAction 2; node travel free) and
  docs/PRESERVATION.md (food ladder; background only).
- Engine facts below are code reads, stated, not invented
  canon: bridge gate order in scripts/policies/woodcarry.js
  bridgeDecision is wood (>= 4) THEN kcal (>= 60) THEN ticks
  (>= 96) — so the spoken bridge line names only the FIRST
  failing gate and can never express a concurrent ticks
  shortfall behind a wood/kcal failure (the same
  first-failure incompleteness sim-kcalshort-b filed for
  wood+kcal "both" evenings). The census therefore uses RAW
  GATES from the classification record, never the skip
  reason alone.
- Loop-day tick anatomy (code reads: scripts/sim-harness.js
  runDays loop + src/js/game.js tickAction/endDay): each
  loop-day the harness waits 3x to part boundaries BEFORE
  policy.daily (morning dayTicks 256 or 384, i.e. 256/384
  wait ticks already spent at daily entry), then policy.daily
  plays entry behaviors + routine + evening bridge, then
  sleep() rolls the day. The bridge decision sees
  ticksToDayEnd = 512 - dayTicks at the woodcarry evening
  step, BEFORE the woodwarm post-step fire (ON legs) — so
  warmth-fire ticks can never cause that evening's refusal
  and are reported as post-decision context only, never as
  attribution. Morning dayTicks, classification dayTicks,
  and driver evening dayTicks are all recorded so the
  anatomy reconciles exactly (see Reconciliation).

## Definitions (the judged quantities)

- CREEK EVENING: an evening row whose woodcarry record has
  bucket 'creek' (classification present). STILL EVENING:
  a creek evening with rescued false. RESCUED EVENING: a
  creek evening with rescued true (bridge built, walked
  home). Non-creek refused evenings carry no bridge
  decision and are excluded, with the count reported.
- BRIDGE NEED (constant, verified against code): 96 ticks
  (TICKS_NEEDED), 4 logs (WOOD_NEEDED), 60 kcal
  (KCAL_FLOOR). Shortfall on an evening = 96 -
  ticksToDayEnd (positive only when ticks-short).
- RAW GATES (per creek evening, from classification):
  woodGate = woodPlayer >= 4; kcalGate = kcalLive >= 60;
  ticksGate = ticksToDayEnd >= 96.
- TICKS-SHORT EVENING: a creek evening with ticksGate
  false (ticksToDayEnd < 96), still or rescued (rescued
  evenings necessarily pass ticksGate at decision time,
  so in practice still evenings — verified, not assumed).
  Split, by raw gates:
  - TICKS-SHORT-ALONE: ticksGate false, woodGate true,
    kcalGate true. This is exactly bridge skip
    'ticks-short' (cross-checked, never assumed).
  - TICKS-SHORT-PLUS-WOOD: ticksGate false, woodGate
    false, kcalGate true.
  - TICKS-SHORT-PLUS-KCAL: ticksGate false, woodGate
    true, kcalGate false.
  - TICKS-SHORT-PLUS-BOTH: ticksGate false, woodGate
    false, kcalGate false.
  The plus classes are INVISIBLE to the spoken line
  (their skip names wood-short or kcal-short) — finding
  them is the census's point.
- MORNING BEHAVIOR: an entry behavior the policy stack
  performs at daily entry before the day routine:
  (a) pressb press + eat (fired mornings only; measured
  ticksSpent in the attempt record; engine costs forage
  16 + eat 1 = 17); (b) woodcarry morning carry
  (tickAction(2); fires only when starting at haven, so
  cost 0 on strand mornings — verified per morning, not
  assumed). The routine (nighttravel/competent day) is
  NOT a morning behavior; it is the day's remainder, and
  its total is measured by probe (see Instruments).
  Morning ticksLeft = 512 - morning dayTicks (the budget
  left after the harness waits, at daily entry).
- STRAND: same as fedexile (maximal run of consecutive
  still evenings). Strand legs = legs with >= 1 strand.
  The census covers ALL creek evenings on ALL 4 legs
  (strand evenings plus any other creek evening on any
  seed), so a ticks-short evening on a non-stranding
  seed still counts toward the distinct-seed clause.
- ATTRIBUTION (per ticks-short evening; the paired
  counterpart is the same seed, same loopDay, same
  WOODWARM, opposite PRESSB):
  - PRESS-DECISIVE: ticks-short-alone AND a press fired
    that loop-day with ticksSpent >= shortfall AND the
    counterpart leg is NOT ticks-short that day
    (counterpart ticksGate true, or rescued). Removing
    the press covers the shortfall and the counterpart
    proves the day otherwise bridges.
  - PRESS-CONTRIBUTING: a press fired that loop-day
    with ticksSpent > 0, but not decisive — either the
    counterpart is also ticks-short (routine alone
    already strands), or ticksSpent < shortfall, or
    the evening is ticks-short-plus (a wood/kcal gate
    fails regardless of ticks, so the still outcome
    stands with or without the press; the press only
    deepens the ticks hole).
  - ROUTINE-ONLY: no press fired that loop-day. The
    shortfall is routine + wait spend, decomposed as
    morning dayTicks (waits) + routine probe total +
    other entry behaviors (carry), with the day's
    fullDaySay lines as composition support (line
    counts, never presented as tick proof).
  - For ticks-short-plus evenings the OUTCOME-decisive
    gate (wood and/or kcal) is named alongside the
    ticks attribution: the evening stays still even if
    the press is removed, because the earlier gate
    still fails.
  - RNG-divergence caveat (as fedexile): counterpart
    comparison is observed difference, not a proven
    sole cause — EXCEPT where the probe decomposition
    shows the counterpart's routine total equal to
    the variant's routine total, in which case the
    press is the only differing cost and the
    attribution is stated as isolated, not merely
    observed.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash f52f08600550b0da8159849ffcfd5665c75e04f0
  ("sim-linkgen-a: regional link failure decomposition").
  This base is NEWER than fedexile's pin (359a384cc), so
  NOTHING is quoted from fedexile's censuses, strand days,
  or ticks numbers as current-base behavior: all 4 legs
  are re-derived on the pinned base and judged against
  those fresh numbers. Divergence from fedexile values
  is DRIFT to report (driver diff first, then base
  diff), never a failure to hide.
- Tracked diff guard: at evidence time, `git diff` of
  src/ between pinned base and final tree must be EMPTY,
  and scripts/policies/ must be byte-identical to base.
  New files are the three measurement scripts above plus
  evidence files only.

## Implementation (reuse + one probe driver, no reinvention)

- VARIANT POLICY: scripts/policies/pressb-diag.js
  UNMODIFIED (PRESSB=1 arms it; PRESSB=0 delegates
  untouched). Stack: pressb(warmed(woodcarry(nighttravel)))
  exactly as pressb-trace-b.js.
- DRIVER: scripts/tickbudget-trace-b.js (new, adapted
  from scripts/pressb-trace-b.js with ONLY these
  changes, disclosed here): (1) pure-read tick probes
  between stack layers — probeWrap records scholar
  dayTicks before/after each layer's daily (no RNG, no
  state edits, ctx passed through untouched), giving
  per-layer totals from which own-costs derive
  (pressbOwn = daily total - woodwarm total;
  woodwarmOwn = woodwarm total - woodcarry total;
  woodcarryOwn = woodcarry total - nighttravel total;
  routine = nighttravel total); (2) morning rows carry
  morningDayTicks; evening rows carry morningDayTicks,
  eveningDayTicks (driver-level, post-daily), and the
  per-layer tickProbe records for that loop-day.
  Env gates, seed order, write transport, and all other
  recording are VERBATIM from pressb-trace-b.js. Any
  further driver edit voids the reuse claim and must be
  disclosed.
- ANALYZER: scripts/analyze-tickbudget-b.js (new, pure
  reads): creek-evening extraction per leg, raw-gate
  classification, ticks-short split, morning-behavior
  table per strand leg, probe own-cost decomposition +
  reconciliation, paired attribution with counterpart
  lookup, strand extraction, guardrail census
  (creek/still/rescued per leg, errs, stalls), wave
  reach, wall numbers, and the §15 paired compare .md.
  Analyzer outputs: evidence/2026-10-30/
  sim-tickbudget-b-census.json,
  sim-tickbudget-b-morning-table.json,
  sim-tickbudget-b-compare.md (plus pilot equivalents
  with -pilot suffix).
- PROOF: scripts/test-tickbudget-b.js — pure unit tests
  (raw-gate classification incl. all four ticks-short
  splits + skip cross-check; attribution classes incl.
  decisive/contributing/routine + plus-gate dominance;
  own-cost decomposition incl. warmth-after-decision;
  strand extraction) PLUS corpus checks (corpora
  present for all 10 bank seeds on all 4 legs; errs 0;
  press ticksSpent == 17 on every fired morning;
  reconciliation holds on every creek evening or each
  mismatch is named; pilot-vs-confirm byte-identical
  on all 8 overlapping seeds per leg; src/ diff empty;
  scripts/policies/ byte-identical to base).

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, wakeforage/pressb order): 15003, 15009,
15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439.
Horizon justification (30 loop-days, reused from
woodday/walktree/wakeforage/pressb/fedexile, NOT a fixed
200d): the strand cycle closes inside it (fedexile ON
strand days 7–23, both < 30); longer horizons add no
strand information on this bank. Death-aware: the driver
records daysAlive / endReason per seed and stops at
death; any leg death is reported per seed, never
averaged away. Ceiling note: all seeds survived 30 days
on fedexile's legs — if that repeats, median survival
30 is a window ceiling, not a survival claim.

- PILOT (gate before confirm spend): first 8 bank seeds
  (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337)
  on all 4 legs, into evidence/2026-10-30/
  sim-tickbudget-b-corpus-pilot-<leg>. Pilot gate (all
  must hold, else fix the instrument and re-pilot, never
  proceed to confirm): (a) all 32 pilot files present,
  errs 0, stalls 0; (b) press ticksSpent == 17 on every
  fired pilot morning; (c) every pilot creek evening
  classifiable by raw gates (no null wood/kcal/ticks);
  (d) reconciliation holds on every pilot creek evening
  (see Reconciliation) or each mismatch is named with a
  mechanism. The pilot is an instrument gate, not a
  verdict: no judged number comes from pilot legs alone.
- JUDGED (confirm) LEGS: all 10 bank seeds on all 4 legs
  (ON control PRESSB=0 WOODWARM=1; ON variant PRESSB=1
  WOODWARM=1; guard control PRESSB=0 WOODWARM=0; guard
  variant PRESSB=1 WOODWARM=0), into evidence/2026-10-30/
  sim-tickbudget-b-corpus-<leg>. Same env gates as
  fedexile (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 DAYS=30).
- DETERMINISM: pilot-vs-confirm byte-compare on all 8
  overlapping seeds per leg (32 files). A mismatch stops
  the run (instrument non-determinism, never re-scored).

## Reconciliation (the arithmetic must close)

Per creek evening, still evenings in particular:
- dailyTotal = eveningDayTicks (driver, post-daily) -
  morningDayTicks.
- dailyTotal == pressbOwn + woodwarmOwn + woodcarryOwn
  + routine (probe decomposition, exact integer equality).
- classificationDayTicks (bridge-decision moment) ==
  morningDayTicks + pressbOwn + woodcarryOwn + routine
  (excludes woodwarmOwn: the fire, if any, runs after
  the decision). On guard legs woodwarmOwn is 0 by
  construction (lever-off records, never acts).
- ticksToDayEnd == 512 - classificationDayTicks.
Any equality failing on any judged creek evening is
reported as a named mismatch with the evening and the
numbers, and the affected evening's attribution is
marked unreconciled (never silently adjusted).

## Bars (DIAG-GO, judged exactly as written; a miss is NO-GO, never re-scored)

- DIAG-GO iff ticks-short evenings attributable to a
  named morning tick cost (press or other, per the
  Attribution classes above) occur on >= 2 distinct
  seeds OR on >= 2 legs of the 15215 substrate, with
  the full tick arithmetic shown per evening (named
  cost, bridge need 96, ticksToDayEnd, shortfall,
  counterpart outcome where decisive is claimed).
  A single-seed, single-leg anecdote is DIAG-NO-GO.
- The bar judges the CENSUS, and the census must
  additionally headline, separately from the verdict,
  the PRESS-DECISIVE count on its own (how many
  evenings the press itself decisively strands), so a
  GO driven by routine-attributed evenings is never
  misread as a GO driven by press-attributed ones.
- SECONDARY (reported, NO bar): per-leg creek/still/
  rescued counts; morning-behavior cost table per
  strand leg (press fired/skipped counts + skip
  reasons, carry acted counts); warmth-fire tick costs
  on still evenings (post-decision context); wave
  reach (1–5) and wall numbers (structural zeros
  expected on national/table/wins — 30-day pre-seat
  window, reported as the window's value with that
  reason, not as a game verdict); villager-behavior
  sample + one sense-read ticks-short story (below).
- SENSE-TEST: one ticks-short evening's full day lines
  read end to end (guard-variant day 10 if it
  reproduces, else the first ticks-short-alone evening
  found), judged for meaning: does the narration
  explain the TIME shortfall (a person running out of
  day), or does the evening read as a food/wood
  failure with the time cause hidden? Plus a
  villager-behavior sample out of the sims (anything
  robotic, static, or repeated is flagged, not chased
  mid-run — appended to sim-findings.md per loop
  rules).
- PANEL (§15): the official balance-panel driver cannot
  express this arm — its policies are sweep-compare
  registry policies, not the nighttravel+woodcarry+
  woodwarm strand stack, and the 23-metric contract has
  no ticks-short / shortfall / morning-tick-cost
  metrics (same standing as sim-pressb-b,
  sim-fedexile-b). The §15 compare attached to the
  evidence is therefore the paired compare .md written
  by scripts/analyze-tickbudget-b.js (per-seed paired
  control-vs-variant on the pre-registered ticks
  metrics + guardrail metrics: survival, death causes,
  wave reach), with this deviation stated on its face.
  Running the official driver on a different stack/
  horizon would measure a different question and is NOT
  done as a substitute. This is a DIAG census with a
  paired comparison judged for completeness, not a
  before/after lever claim.

## Forbidden (violations void the run)

- Any src/js change; any edit to scripts/policies/* or
  any existing script; any new policy file; flipping
  any default; quoting fedexile's / kcalshort's /
  pressb's old-base strand days, ticks numbers, or wave
  reach as current without the fresh legs above; using
  any sibling arm's output (including fedexile's
  corpora) as this arm's judged input — sibling corpora
  were read for orientation and prereg grounding only;
  every judged number comes from this arm's own legs;
  touching sibling trees, claims, branches, or the main
  tree; writing sweep outputs anywhere but worktree
  evidence/.

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether the
  raw-gate split (alone vs plus) is the right unit for
  "tick cost strands an evening" (a plus evening is
  still a still evening, but ticks are not its decisive
  gate — the evidence must never count plus evenings
  as "stranded by ticks" without the plus qualifier);
  whether the harness waits (256/384 ticks before
  daily) belong in the attribution anatomy (they are
  harness pacing, not player choices — the evidence
  reports them as a separate anatomy line so the reader
  can re-judge attribution with waits excluded: with
  waits excluded, the bridge question becomes whether
  entry + routine alone exceed 512 - waits, which is
  exactly what the counterpart comparison tests);
  whether the counterpart comparison survives RNG
  divergence (the probe routine-total equality check
  is the answer: equal routine totals isolate the
  press; unequal totals keep the attribution at
  "observed difference");
  whether morning ticksLeft < 17 ever gates the press
  itself on this substrate (checked: press skip reasons
  are tallied; if a 'ticks-short' press skip appears,
  it is reported as a morning behavior gated by ticks,
  a distinct finding from an evening stranded by ticks).
- If the verdict is DIAG-GO, the next step is the
  coordinator's design decision on morning-behavior
  tick budgets (accept, or commission a tick-budgeting
  behavior as a new measured arm), NOT another
  measurement of the same mornings. If DIAG-NO-GO, the
  next run must name the bar that failed and fix the
  instrument, not re-ask the question on the same legs.
