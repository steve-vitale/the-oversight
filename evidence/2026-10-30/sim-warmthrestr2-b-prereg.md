# sim-warmthrestr2-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0830Z,
arm sim-warmthrestr2-b, axis food-economy (warmth-default restraint).
Worktree sim-warmthrestr2-b. This is a CURRENT-MASTER RE-JUDGMENT of
the previous Loop B run's question, NOT a new design, and NOT a copy
of that run: its prereg and evidence were read as REFERENCE ONLY
(branch sim-warmthrestraint-b, old base 2138ad07e), its files were
NOT cherry-picked, copied, or committed, and its corpora are NEVER
quoted as current-master behavior. All legs below are FRESH legs on
the pinned base in this file, through this run's own driver.

MEASUREMENT ONLY: zero src/js changes, zero policy-default changes.
The restraint is an OPT-IN parameter on scripts/policies/woodwarm.js
(default null = unconditional behavior, so the prior proof still
passes unmodified). No bot default changes whatever the verdict.
The warmth-default Steve-call stays OPEN whatever the verdict.

## Canon (read before judging)

- docs/CANON.md read first, then docs/TIME-ECONOMY.md, docs/MAP.md,
  docs/ABILITY-REFUSALS.md. Closest grounded canon: bridge build =
  96 ticks, 60 kcal (TIME-ECONOMY); creeks block travel (MAP);
  refusals must be honest about why (ABILITY-REFUSALS).
- No canon doc covers the creek/bridge lacking-line narration itself
  — stated here instead of inventing canon. The line under
  measurement is the landed woodcarry.js lackingLine, wood-short
  branch, NOT re-specified here.
- Fire engine facts (code reads, game.js, as established in the
  woodwarm prereg): makeFire costs 32 ticks (+16 without beard-moss
  tinder; 8 with a lighter) + 70 kcal (5 with a lighter, clamped at
  0); success is a friction lottery; fuel is spent ONLY on success;
  fireFuel prefers 2 branches over 1 log, so a log is spent only
  when branches < 2. A warmth fire needs no food and no cooking step.

## The two restraints (exact rules — adopted verbatim, no mid-run swaps)

Bridge cost B = 4 logs (WOOD_NEEDED in scripts/policies/woodcarry.js;
the lackingLine names it: "a bridge needs 4."). Both restraints
apply AFTER the woodwarm warmDecision returns act (every other gate
unchanged: still-refused creek night, not at haven, not in tent,
branches < 2, wood >= 1, no near fire, ground found,
ticksLeft >= fireCost + 10) and BEFORE makeFire. A restraint block
is recorded as a miss with the full field set (woodBefore,
branchesBefore, ticksLeft, fireCost, ground), never silently.

- R1 — bridge-feasibility: warmth acts ONLY if woodBefore-1 >= 4
  (woodBefore >= 5), else miss 'restraint-r1'.
- R2 — bridge-already-lost: warmth acts ONLY if woodBefore < 4
  (act window 1..3, since warmDecision already requires wood >= 1),
  else miss 'restraint-r2'.

Reading notes, stated up front (adopted from the reference prereg):
R1's parenthetical "pack strictly above bridge cost after spend" is
read as the feasibility threshold (pack >= 4 after spend). The literal
>4 reading would additionally forbid spending a 5th log down to
exactly 4, which still leaves a buildable bridge and so contradicts
"the bridge stays feasible". On this bank the two readings COINCIDE
(max pack is 4 in the reference corpus), so the choice cannot move
the bank verdict if reproduction holds; unit tests pin the
feasibility reading (wood 5 -> act, wood 4 -> block). R2's rejected
reading ("tonight's bridge skip is kcal-short or ticks-short, so
tonight's rescue already failed") is NOT implemented and NOT judged:
the guard trajectory proves kcal/ticks recover (reference day 10:
180 kcal, 110 ticks, rescued), so spending on a kcal-short night
would still destroy tomorrow's rescue.

PREDICTED BANK OUTCOME, stated before any leg (falsifiable, not
re-scored): BOTH variants predict ZERO warmth acts on this bank.
R1 needs pack >= 5; the morning carry tops the pack to exactly 4.
R2 needs pack < 4; on this bank a pack below 4 occurs only after a
warmth spend, which R2 blocks. DIVERGENCE CONDITIONS (if either
fires, the prediction is falsified and reported as such): R1 fires
if daytime wood gain ever pushes the pack >= 5; R2 fires if wood
ever drops below 4 via a non-warmth cause (daytime bridge spend,
other fuel use). STRUCTURAL NOTE: any FIRST spend at pack 4 breaks
the bridge (4 -> 3), so no restraint that permits a first spend at
pack 4 can keep the guard strand; the only benefit-preserving middle
would need daytime wood recovery, which the reference bank shows
does not happen. These legs test that structural claim, not just
the two rules.

## Strand definition (the judged quantity)

Per seed, a STRAND is a maximal run of still-refused creek evenings
on CONSECUTIVE loop-days (corpus: evening with bucket creek,
rescued false; a gap or a rescued evening breaks the run). Strand
length = run length in nights. Reference trajectories (to be
RE-DERIVED below, not quoted): reference guard 15215 strand = days
7, 8, 9 (3 nights; rescued day 10); reference guard 15009 strand =
1 night; all other reference bank seeds guard strand = 0. Reference
ON 15215 strand = days 7-16 (10 nights).

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full hash
  ee3be4fc5f4e3561e6f98df359e680d70a4d8b8e.
  The prereg commit adds ONLY this file (no code, no policy, no
  driver change), so the legs run on pinned-base game code verbatim.
  The evidence file will verify with git diff that pinned base ->
  final tree differs in game code by nothing (only measurement
  scripts + evidence + corpora; the one policy addition extends
  scripts/policies/woodwarm.js with an OPT-IN restraint parameter
  that defaults to off).
- Base drift is real on this repo: this base is NEWER than the
  reference pin by sibling landings, so the guard AND unconditional-
  ON trajectories are RE-DERIVED on the pinned base from fresh legs
  (below) and judged against those fresh numbers, never quoted from
  the reference censuses unless the re-derivation reproduces them
  exactly. If it diverges, the divergence is reported under DRIFT
  and the old censuses are not cited as current-base behavior;
  variant legs are then judged against the fresh baseline, and the
  divergence itself is investigated before any GO is claimed.

## Implementation (policy-side only)

- scripts/policies/woodwarm.js is EXTENDED, not rewritten:
  withWoodwarm(inner, store, opts) accepts opts.restraint in
  {null, 'R1', 'R2'} (default null = byte-identical unconditional
  behavior); restraintDecision(restraint, wood) is a pure exported
  gate, unit-tested by the proof script. No existing warmDecision
  gate changes; no driver behavior changes when restraint is null.
  The prior proof script (scripts/test-woodwarm-b.js) must still
  pass unmodified against the extended policy.
- Driver: scripts/warmthrestr2-trace-b.js (this run's own driver,
  adapted from the current scripts/woodwarm-trace-b.js in this
  worktree; same honesty guards: no thief grant, no taps, no state
  edits, no clock-setting, no top-ups, no driver travelTo; same
  morning/evening position, woodcarry, carry, and warmth records
  plus the restraint field on every warmth record). Env asserted
  FATAL on every leg:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0|1
  WARMTH_RESTRAINT=off|R1|R2 (required explicitly on every leg)
  DAYS=30.
  Baseline legs run through THIS driver (not the old driver) so
  driver-equivalence is itself tested by the reproduction bars below.
- Analyzer: scripts/analyze-warmthrestr2-b.js (this run's own
  analyzer; adds per-seed strand runs + restraint miss breakdown +
  wood-max / sub-4-without-spend divergence scan). Pure reads; no
  game code.

## Legs (all on pinned base, identical driver env)

- DRIFT/BASELINE legs (BEFORE judging any variant leg): guard
  (WOODWARM=0) + ON (WOODWARM=1, WARMTH_RESTRAINT=off) on all 10
  qualifier seeds, in screen order (15003, 15009, 15091, 15211,
  15215, 15220, 15221, 15337, 15376, 15439), 30 loop-days each, into
  evidence/2026-10-30/sim-warmthrestr2-b-corpus-guard and
  -corpus-on. REPRODUCTION BARS (drift protocol, reference values):
  guard 15 creek / 4 still / 11 rescued, wood 4 on all 15, 0 warmth
  acted; ON 21 creek / 11 still / 10 rescued, still skip kcal 3 /
  ticks 1 / wood 7, warmth acted 6 / log-spent 4 / fire-failed 2,
  spend nights 15215 days 9/11/12/13, staged 7, guard 15215 strand
  days 7-9, ON 15215 strand days 7-16. Any miss on these bars =
  DRIFT: stop, report, investigate (driver diff first, then base
  diff); do NOT judge variants against old numbers. Judged legs
  are judged against the FRESH guard, whatever it is, once drift
  is understood — never against the reference numbers alone.
- PILOT (instrument validation): R1 + R2 on the first 8 bank seeds
  (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337), 30
  loop-days each. Pilot checks: errs 0, restraint records present
  with the full field set (restraint miss reasons recorded, not
  blank), no day-rollover (evening loopDay sequences intact),
  determinism re-run of 15215 R1 byte-identical. A pilot instrument
  failure stops the run (fix the instrument, never the bar). The
  pilot seeds are bank seeds, so the pilot legs ARE judged bank
  legs, not extra draws (woodwarm precedent, stated here before
  the legs).
- BANK (judged variant legs): R1 + R2 on all 10 qualifier seeds
  (pilot 8 + remaining 15376, 15439), 30 loop-days each, into
  evidence/2026-10-30/sim-warmthrestr2-b-corpus-r1 and -corpus-r2.
  No cap, no subset, no seed added after the bank runs.
  Qualifiers were selected for OFF creek evenings, independent of
  restraint — no selection on the judged outcome.
- Horizon justification (30 loop-days, reused from woodwarm, NOT a
  fixed 200d): the strand cycle the question is about closes inside
  it (guard rescue day 10, ON refill day 17, both < 30); longer
  horizons add no strand information on this bank. Death-aware:
  the driver records daysAlive/endReason per seed and stops at
  death; any variant-leg death is reported per seed, never
  averaged away.

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- PRIMARY per variant: 15215 strand nights == guard strand nights
  (3, from the FRESH baseline — 3 only if reproduction holds) AND
  no bank seed's variant strand exceeds its guard strand. GO iff
  both hold; NO-GO iff either fails.
- SECONDARY (reported, NO bar — the tradeoff, stated so it cannot
  be re-scored into a bar later): per variant, log-spends retained
  vs unconditional 4; staged wood-short evenings retained vs 7;
  warmth acted vs 6; rescued creek evenings vs ON 10 / guard 11.
  INTERPRETATION RULE (pre-registered): a variant meeting PRIMARY
  with ZERO benefit retained is reported as GUARD-EQUIVALENT —
  trap prevented, warmth benefit fully forgone — NOT as a
  warmth-preserving default. A variant earns the words
  "warmth-preserving restraint" ONLY if PRIMARY holds AND benefit
  >= 1 log-spend (possible only via the named divergence
  conditions). The overall evidence verdict states plainly which
  case each variant falls in; a GUARD-EQUIVALENT GO must never be
  reported as "warmth works with restraint".
- INSTRUMENT bars: recorder/classifier errs == 0 on judged legs;
  determinism re-run byte-identical; guard legs 0 warmth acted;
  baseline reproduction bars above all hold.
- SENSE-TEST: at least one full tail sense-read passing per variant
  on seed 15215 (nights 7-10 on the predicted guard-equivalent
  trajectory: stranded nights with no spend lines, then the day-10
  rescue reading as a bridge built; if a variant diverges from
  guard, the divergent nights are read instead). If a variant's
  trajectory is byte-identical to guard on 15215, the sense-read
  is performed on the variant corpus itself (not quoted from the
  guard corpus) and reported as such.
- CLOSE-AS-UNPLAYABLE is NOT an available verdict: the woodwarm run
  already proved the line plays via warmth. What this run CAN close
  is narrower: "no named-tracker restraint preserves warmth benefit
  on this bank" — true only if BOTH variants meet PRIMARY with
  zero benefit retained AND the divergence scan finds no pack >= 5
  evening and no sub-4-without-spend evening on any leg.

## Forbidden (violations void the run)

- Changing either restraint definition after any judged leg starts;
  swapping R1/R2 readings mid-run; lowering any bar; re-screening
  legs hoping for a better draw; quoting the reference censuses as
  current-base behavior without the re-derivation above; staging
  via dropItem; lighting a fire on a non-stranded night; lighting a
  fire with a cooking purpose; building a bridge except through the
  engine's own evening step; any state edit outside engine verbs;
  claiming a GUARD-EQUIVALENT variant as warmth-preserving;
  cherry-picking, copying, or committing files from branch
  sim-warmthrestraint-b.

## Metric review (for the NEXT run)

- If both variants land GUARD-EQUIVALENT, the next prereg should
  NOT re-test R1/R2 on this bank — it should either take the
  daytime wood-recovery question (can a stranded bot regain a
  bridge log during the day, and at what cost) or carry the
  GUARD-EQUIVALENT finding to the Steve-call as the measurement
  answer (unconditional traps, restrained = never, no middle on
  this trajectory).
- No balanced-panel compare .md is produced, as pre-registered:
  this is a 30-day position measurement of a policy-side behavior
  with zero src/js changes, so there is no game-root delta for a
  panel to compare, and the panel's registry policies
  (scripts/sweep-compare.js POLICY_REGISTRY) do not include the
  nighttravel trace policy — the panel runs 150-day observer
  comparisons over registry policies, not this driver. The
  determinism re-run is the instrument-perturbation proof, and
  the bars above are the judge. (Same standing as the woodwarm
  prereg.)
- Metric review section (this run's doubts, to be answered in the
  evidence file): whether the strand-length primary still
  separates unconditional from guard/restrained cleanly on the
  fresh base; whether the benefit-secondary interpretation rule
  still prevents a GUARD-EQUIVALENT GO from reading as
  "warmth works"; whether the divergence scan fields are still
  the right falsifier for the "no middle" claim.
