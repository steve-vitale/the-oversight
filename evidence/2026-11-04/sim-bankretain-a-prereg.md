# sim-bankretain-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261104T1647Z, arm
sim-bankretain-a, axis food-economy. Worktree sim-bankretain-a.
Blank: in-stack edible-bank retention — the ONE open sub-question
from sim-bankfood-a (evidence/2026-11-04/sim-bankfood-a.md §4/§8).
Prior arm's verdict stands and is NOT re-litigated: 8/8 banks
retained at the true post-sleep morning, 0 vanishes, 0 morning
pack-eat firings, because the banks held only unknown lumps that
morning pack-eat cannot eat. Its single known-edible bank (seed
15003, loop-day 30, 195 kcal Blackberry + 9 lump units) fell on
the final census day and has NO following morning — CENSORED,
not judged. This arm judges exactly that censored case.

Canon read first: docs/CANON.md, docs/PRESERVATION.md (food
ladder, spoilage), docs/STORAGE.md. No canon doc covers
"banked evening food retention" as a named rule; the engine's
documented per-form dawn spoil sweep (a form whose spoilDay has
arrived is swept at dawn, other forms persist — proven in
sim-bankfood-a §3 note b) is the only overnight removal
mechanism on record. This arm does not invent canon.

## Base

Pinned base: worktree HEAD at prereg writing time (recorded in
the commit; the prereg commit adds evidence only, so all legs
run on pinned-base game code verbatim plus the pre-existing
instruments below). POLICY-SIDE MEASUREMENT ARM: zero edits to
any existing policy file, zero src/js changes unless a traced
vanish mechanism yields a small proven fix (see verdict rules).
Sibling trees never touched; main tree never touched. Nothing
is pushed, bumped, or live-verified by this worker (coordinator
merges via --ff-only); report 'merged locally, pending ship'
readiness.

## Instruments (reused, not rebuilt)

- Policy: scripts/policies/bankfood-diag.js (unchanged) — evening
  bank/flip on stranded-away evenings + morning pack-eat on
  stranded-away mornings, canonical packSnap at every stage.
- Driver: scripts/bankfood-trace-b.js (unchanged) — run with
  DAYS=60 (see horizon) and OUTDIR under
  evidence/2026-11-04/sim-bankretain-a-corpus-{guard,on}-{off,variant}.
  Env gates asserted FATAL by the driver: COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=nighttravel,
  WOODCARRY=1, WOODWARM=0|1, BANKFOOD=0|1.
- Analyzer: NEW scripts/analyze-bankretain-b.js (committed with
  the instruments, before any judged sim) — extracts KNOWN-EDIBLE
  BANK events from the corpora (definition below) with the full
  stage chain: evening packBefore -> post-bank pack (postDailyPack)
  -> first-upkeep pack (true post-sleep morning) -> daily-entry
  morning-phase packBefore + eat firing + scholar kcal chain.
  The prior analyzer (analyze-bankfood-b.js) is NOT reused for
  judging: it counts every banked event (lumps included) and
  cannot isolate the edible delta.
- Proof test: NEW scripts/test-bankretain-b.js (committed with
  the instruments, before any judged sim) — pure checks for the
  edible-bank classifier (delta, censored, retained/vanished,
  spoil-shortfall naming) + corpus mode (files present + parse,
  bankfood errs 0, det-gate OFF vs control counts).

## Judged event definition (binding)

A KNOWN-EDIBLE BANK event is an evening record with mode bank|flip
and >= 1 forage action where:

- bankedEdibleDelta = postDailyPack.edibleKcal -
  evening.packBefore.edibleKcal is > 0 (the bank itself added
  edible-now food; press-level sum of Eknown must agree in sign),
  AND
- the bank has a FOLLOWING MORNING IN-STACK: the next loop-day
  row exists AND a firstUpkeep record exists for scholarDay =
  gameDay + 1 (the true post-sleep morning snapshot). A bank on
  the final loop-day, or followed by village death before the
  next morning snapshot, is CENSORED, not judged — the exact
  fate of the prior arm's day-30 event, which this horizon is
  designed to un-censor.

## Primary metric (binding)

Share of judged known-edible bank events RETAINED at the true
post-sleep morning (first-upkeep snapshot), plus morning
pack-eat firings on judged mornings.

- RETAINED: firstUpkeep.pack.edibleKcal >= postDailyPack.edibleKcal
  (no loss), OR the shortfall is exactly accounted for by a
  per-form dawn spoil sweep: a stack present post-bank with
  spoilDay <= the new scholarDay is absent/reduced at first
  upkeep, and every other edible stack persists in full. The
  swept form must be NAMED from the stacks; an unnamed shortfall
  is not retention.
- VANISHED: firstUpkeep.pack.edibleKcal == 0 while
  postDailyPack.edibleKcal > 0, and firstUpkeep scholar kcal
  does not account for the banked kcal (eaten-into-body excluded
  by the snapshot chain: first upkeep runs before any upkeep
  eat). A partial loss that is neither full retention nor a
  named spoil sweep is PARTIAL-UNEXPLAINED, reported as such,
  never rounded to either side.
- Morning-phase secondary: daily-entry morning packBefore
  edibleKcal + whether the morning phase fired Game.eat()
  (ate=true) on the judged morning, and the scholar kcal chain
  across it. Morning pack-eat firing on a retained edible bank
  is the positive control for the phase the prior arm never
  saw fire.

## Sample-size rule + pre-registered expansion (binding, never post-hoc)

- Pilot: 8 seeds (below), guard + ON legs, off + variant legs
  (32 runs at 60d). Judge ONLY the variant legs; off legs are
  the det-gate/neutrality comparison (OFF legs must reproduce
  control-leg behavior: survival/endReason match on every seed;
  any mismatch is reported, not judged away).
- JUDGEABLE BAR: >= 3 judged known-edible bank events across
  the pilot. Three is the smallest pattern that can show
  unanimous retention without statistics (§9: obvious in 8
  seeds); the prior arm's n=1 censored event is exactly why a
  bar above 1 is required.
- EXPANSION RULE (pre-registered): if the pilot yields < 3
  judged events, expand BEFORE judging to the full 16-seed
  wider band (add 15337, 15439, 16501, 16502, 16503, 16504,
  16505, 16506), same legs, same horizon, and judge the
  combined corpus. Expansion is a pre-registered sample-size
  rule, not a post-hoc rescue: the verdict thresholds below
  apply to the final judged set, whichever size it is.
- If the combined 16-seed corpus still yields < 3 judged
  events, the verdict is INSUFFICIENT-DATA (see verdict rules;
  §14a classification SUBSTRATE-MISSING: the edible-bank pool
  itself is too small to judge, not a failed concept).

## Verdict rules (judged exactly against these; a miss is NO-GO, never re-scored mid-run)

- RETENTION-CONFIRMED (measurement result, NOT a kill): >= 3
  judged events, ALL retained at first upkeep, no unexplained
  partial loss. The blank is closed as a measurement: known-
  edible banks survive the night in-stack. No fix lands (there
  is nothing to fix); the finding-backlog item is marked fixed-
  by-measurement with this evidence cited.
- VANISH-CHARACTERIZED: >= 1 judged event vanished (or
  partial-unexplained) WITH a traced mechanism stage named
  from the snapshot chain (which stage removes it, with the
  stack-level evidence). Then: fix small + documented +
  proof-tested if the mechanism is a genuine defect, and
  re-run the pilot band through the balanced panel
  (scripts/balance-panel.js) only if game code changes; or
  document precisely why it cannot be fixed (engine rule,
  out-of-scope voice-only gap, etc.). A vanish WITHOUT a
  named mechanism stage is DIAG, not a fix — no half-fix lands.
- INSUFFICIENT-DATA: < 3 judged events after the pre-registered
  expansion (or 0 judged events at any stage). §14a: this is
  SUBSTRATE-MISSING if the pool is empty/small (the strand +
  known-edible coincidence is rarer than the bar), NEVER
  CONCEPT-DEAD (no mechanism was staged and failed) and never
  a retention claim (retention on 1-2 events is reported as
  numbers, not a verdict).
- Guardrail: variant vs off survival/endReason identical on
  every seed (as in the prior arm); any deviation is reported
  and investigated before any verdict, not averaged away.

## Horizon, seeds, policy

- Horizon: 60 days, death-aware (dead villages stop simulating;
  the driver stops at village loss; +10d tail max per §10).
  WHY 60: the prior 30d horizon censored the only edible bank
  (day 30, the final day). 60d is the §10 early-game guide
  horizon, doubles the window for the 15003 strand (days 22-30
  at 30d) to continue past its day-30 bank — giving that bank
  class a following morning in-stack — and gives the early
  15376 strand (days 8+) room for repeat strands and fresh
  known-edible banks. Never a fixed 200d.
- Pilot seeds (8): 15003, 15376 (the ONLY 2 stranded seeds in
  the prior 16-seed sweep — the addressable pool), + 15009,
  15091, 15211, 15215, 15220, 15221 (the rest of the prior
  pilot band, to catch new strands at the longer horizon).
  Legs: guard (WOODWARM=0) and ON (WOODWARM=1), each off
  (BANKFOOD=0) and variant (BANKFOOD=1).
- Expansion seeds (8 more, only under the expansion rule):
  15337, 15439, 16501, 16502, 16503, 16504, 16505, 16506.
- Policy: competent-player policy (nighttravel stack) +
  bankfood wrapper, unchanged. No gate, price, deed bar, or
  win price changes. No new policy file is introduced by this
  arm (the wrapper already exists); if a fix lands it is a
  small game-code change with its own proof test, never a
  policy-default flip.

## Panel note (§15)

scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day evening
census, or an env-gated single-mechanism probe (same declaration
as every prior strand arm). Comparison here is off-vs-variant
legs on identical seeds through the bankretain analyzer, never
labeled a panel comparison — UNLESS a game-code fix lands, in
which case the before/after comparison for the fix runs through
the balanced panel and the compare output is attached or cited.

## Sense-testing law

Quote the actual morning/pack lines for EVERY judged bank
(retained or vanished), including any silent per-form spoil
sweep: check whether judged mornings NAME the swept form (the
prior arm's sense gap: the berries sweep at dawn day 10 showed
only as fewer lump units, unnamed). A retained bank whose
morning narration never mentions its food is reported as
silence, not as a sense pass.

## Metric review (for the NEXT run; filled at end)

- (filled at end of run; revisions never apply mid-run)
