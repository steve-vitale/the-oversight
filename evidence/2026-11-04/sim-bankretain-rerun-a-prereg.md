# sim-bankretain-rerun-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261104T1836Z, arm
sim-bankretain-rerun-a, axis food-economy. Worktree
sim-bankretain-rerun-a. Measurement re-run on current master;
NO game-code change is planned. If a traced vanish mechanism
yields a small proven fix, this arm STOPS and reports it as a
separate proposal rather than landing it silently.

Blank: banked evening food retention — the follow-up to
sim-bankretain-a (evidence/2026-11-04/sim-bankretain-a.md),
which returned INSUFFICIENT-DATA (SUBSTRATE-MISSING): 0 judged
known-edible bank events, 1 censored (seed 15003 day-30
Blackberry, village dies day 30 on all legs). Its key
observation, carried forward and NOT re-litigated: seed 16505
carried 540 kcal Muscadine Grapes into a stranded evening, all
intact at the first-upkeep snapshot, then morning upkeep
competentEat ate them before the daily-entry morning pack-eat
phase, which saw pack edible 0 and skipped. Morning pack-eat is
shadowed twice (lumps inedible + upkeep first).

Canon read first: docs/CANON.md, docs/PRESERVATION.md (food
ladder, spoilage), docs/STORAGE.md. No canon doc covers
"banked evening food retention" as a named rule — that still
holds. The engine's documented per-form dawn spoil sweep (a
form whose spoilDay has arrived is swept at dawn, other forms
persist — proven in sim-bankfood-a §3 note b) is the only
overnight removal mechanism on record. This arm does not invent
canon.

## Base

Pinned base: worktree HEAD at prereg writing time (recorded in
the commit; the prereg commit adds evidence + instruments only,
so all legs run on pinned-base game code verbatim plus the
pre-existing instruments below). POLICY-SIDE MEASUREMENT ARM:
zero edits to any existing policy file, zero src/js changes
unless the stop-and-propose clause above triggers. Sibling
trees never touched; main tree never touched; never touch
~/workspace/goals/.../hidden_files (the coordinator owns the
backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Instruments (reused, not rebuilt, except the analyzer)

- Policy: scripts/policies/bankfood-diag.js (unchanged) —
  evening bank/flip on stranded-away evenings + morning
  pack-eat on stranded-away mornings, canonical packSnap at
  every stage.
- Driver: scripts/bankfood-trace-b.js (unchanged) — run with
  DAYS=60 and OUTDIR under
  evidence/2026-11-04/sim-bankretain-rerun-a-corpus-{guard,on}-{off,variant}.
  Env gates asserted FATAL by the driver: COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=nighttravel,
  WOODCARRY=1, WOODWARM=0|1, BANKFOOD=0|1.
- Analyzer: NEW scripts/analyze-bankretain-rerun.js (committed
  with the instruments, before any judged sim) — extracts
  REDEFINED judged events (below) with the full stage chain:
  evening packBefore -> post-bank pack (postDailyPack) ->
  first-upkeep pack (true post-sleep morning) -> daily-entry
  morning-phase packBefore + eat firing + scholar kcal chain.
  The prior analyzer (analyze-bankretain-b.js) is NOT reused
  for judging: it counts only bank-added edible events and
  cannot see carried food or upkeep-eat accounting.
- Proof test: NEW scripts/test-bankretain-rerun-a.js
  (committed with the instruments, before any judged sim) —
  pure checks for the redefined classifier (carried vs banked
  vs mixed, censored, retained, upkeep-eaten, vanished,
  spoil-shortfall naming) + corpus mode (files present +
  parse, bankfood errs 0, OFF-leg det-gate, revised
  neutrality). Proof green BEFORE the judged sims.

## REDEFINED judged event (binding — the change vs sim-bankretain-a)

An evening record with mode bank|flip AND post-bank edible
food (postDailyPack.edibleKcal > 0) AND a FOLLOWING MORNING
IN-STACK (the next loop-day row exists AND a firstUpkeep
record exists for scholarDay = gameDay + 1).

The prior definition required the bank itself to add the
edible food (delta > 0). That was too narrow, as
sim-bankretain-a §6 proved: in-stack, the edible food that
reaches a stranded morning is CARRIED (foraged during the
competent day, as on 16505/59), not bank-added. The event is
now "edible pack at a stranded evening -> true morning",
regardless of which phase put it there. Source is recorded
per event, never used to exclude:

- banked: delta > 0 and packBefore edible == 0 (the bank
  itself added it; the prior arm's case).
- carried: delta == 0 and packBefore edible > 0 (the
  16505-shape case).
- mixed: delta > 0 and packBefore edible > 0.
- carried-with-loss: delta < 0 and packBefore edible > 0
  (evening phase reduced edible; reported with numbers).

A bank/flip evening with post-bank edible == 0 is excluded
(lump-only / no-gain, as before). A bank on the final
loop-day, or followed by village death before the next
morning snapshot, is CENSORED, not judged — same rule as
before. Mode 'skip' evenings are not stranded evenings and
are never events.

## UPKEEP-EAT MECHANISM DECISION (binding, picked BEFORE any sim)

The morning upkeep's competentEat IS the morning meal for
accounting purposes. Justification: the 16505 chain proves
upkeep eats real edible pack food between the true-morning
snapshot and the daily-entry morning phase, and the
daily-entry phase then correctly sees an empty pack. Calling
that sequence a "vanish" would misread the engine's own
ordering as a loss; the food reached the scholar's body, which
is what retention is for. Therefore:

- RETAINED-then-eaten: edible present at the first-upkeep
  snapshot (retained at the true morning) and then
  upkeep-eaten, shown by the kcal chain: daily-entry morning
  kcalBefore minus first-upkeep kcal EQUALS the edible kcal
  lost between the first-upkeep pack and the daily-entry
  morning packBefore (exact, e.g. 884 - 344 = 540). This
  counts as RETAINED at the true morning, NOT vanished.
- VANISHED: edible gone with NO upkeep-eat accounting — i.e.
  either the first-upkeep pack already lost it with no named
  spoil sweep, or the loss between the first-upkeep pack and
  the daily-entry morning packBefore is not accounted for by
  the kcal chain (gain != loss, and no morning-phase eat
  accounts for it either).
- Morning-phase-eaten (positive control, secondary): the
  daily-entry morning phase itself fires Game.eat()
  (ate=true) and its kcal gain accounts for the food. This
  is also retained, with a different morning disposition.
- A partial loss that is neither full retention, a named
  spoil sweep, nor kcal-accounted eating is
  PARTIAL-UNEXPLAINED, reported as such, never rounded to
  either side.

The silent-upkeep-breakfast narration gap (the 540-kcal meal
leaves no line) is a SEPARATE blank: it is reported as an
out-of-scope finding, NOT fixed in this arm, per the task.

## Primary metric (binding)

Share of judged events RETAINED at the true post-sleep
morning (first-upkeep snapshot), where retained =
classification RETAINED (no loss) or RETAINED-SPOIL-SWEPT
(every shortfall is a named per-form dawn spoil sweep: a
stack present post-bank with spoilDay <= the new scholarDay
is absent/reduced at first upkeep, and every other edible
stack persists in full; the swept form must be NAMED from
the stacks; an unnamed shortfall is not retention).

Secondary, per judged event: morning disposition
(morning-phase-eaten / upkeep-eaten / still-in-pack /
morning-unaccounted / no-morning-record) with the kcal chain
shown. The primary verdict rests on the first-upkeep
snapshot only; the morning disposition characterizes what
happened next, it never re-scores the primary verdict.

## Sample-size rule (binding, never post-hoc)

- Judged corpus: the FULL 16-seed band below (pilot 8 +
  expansion 8), guard + ON legs, off + variant legs (64
  runs at 60d). Judge ONLY the variant legs; off legs are
  the det-gate / revised-neutrality comparison (below).
- Why the full band up front, with no conditional expansion:
  sim-bankretain-a already ran the conditional expansion and
  established that the pool needs 16 seeds; re-running only
  8 and then deciding whether to expand would re-introduce
  exactly the post-hoc choice the prior prereg closed.
  Running the identical 16-seed band on current master with
  the redefined event is the pre-registered corpus — the
  only changes vs sim-bankretain-a are the current-master
  base and the redefined event.
- JUDGEABLE BAR: >= 3 judged events across the corpus.
  Three is the smallest pattern that can show unanimous
  retention without statistics (same bar as the prior arm).

## Verdict rules (judged exactly against these; a miss is NO-GO, never re-scored mid-run)

- RETENTION-CONFIRMED (measurement result, NOT a kill):
  >= 3 judged events, ALL retained at first upkeep (clean
  or spoil-swept). Bar choice, justified: the prior arm's
  unanimity standard is kept deliberately — with n in the
  single digits, a 2/3 majority would let one unexplained
  loss hide inside a "confirmed" verdict, and the blank
  ("does banked evening food survive the night?") is only
  closed by a pattern with no unexplained loss. Retained-
  then-eaten counts as retained (see the mechanism decision).
  No fix lands (there is nothing to fix); the finding is
  reported as a measurement.
- VANISH-CHARACTERIZED: >= 1 judged event vanished (or
  partial-unexplained) WITH a traced mechanism stage named
  from the snapshot chain. Then: STOP and report the traced
  mechanism as a separate fix proposal (per the task); no
  silent landing. A vanish WITHOUT a named mechanism stage
  is DIAG, not a fix.
- INSUFFICIENT-DATA: < 3 judged events after the full band.
  §14a: SUBSTRATE-MISSING if the pool is empty/small, NEVER
  CONCEPT-DEAD (no mechanism was staged and failed) and
  never a retention claim (retention on 1-2 events is
  reported as numbers, not a verdict).
- NOT-CONFIRMED (mixed pattern): >= 3 judged events but not
  all retained, and no single traced vanish mechanism
  unifies the losses. Reported as the pattern it is, with
  the loss stages named per event; no confirmation, no
  vanish claim.

## REVISED neutrality guardrail (binding — replaces whole-run survival equality)

Whole-run survival equality is INVALID for acting variants
(sim-bankretain-a §3, seed 15376: the first acted variant
evening diverges the RNG stream and flips village fate).
The guardrail is now, per seed and leg-pair (guard, ON):

1. Trajectory equality THROUGH THE LAST PRE-ACTION DAY:
   for every loop-day before the variant leg's FIRST acted
   bank/flip evening (non-empty actions, mode bank|flip),
   the off and variant evening rows agree on (kcal, tile,
   mx, my, gameDay). Any pre-action mismatch is reported
   and investigated before any verdict.
2. A NAMED DIVERGENCE POINT for any later split: the first
   acted variant evening's loop-day, with the kcal delta
   shown. Post-divergence survival differences are
   expected, not guardrail failures.
3. The OFF-LEG DET-GATE as the instrument check: every OFF
   leg must show bankfood errs 0 AND zero acted bank/flip
   evenings (the wrapper delegates untouched when OFF —
   verified on the prior corpus: guard-off 15376 shows zero
   acted evenings). An OFF leg with an acted evening is
   instrument corruption, investigated before any verdict.

## Horizon, seeds, policy

- Horizon: 60 days, death-aware (dead villages stop
  simulating; the driver stops at village loss; +10d tail
  max per §10). WHY 60: identical to sim-bankretain-a, so
  the only changes vs that arm are the base and the event
  definition. Never a fixed 200d.
- Pilot seeds (8): 15003, 15376, 15009, 15091, 15211, 15215,
  15220, 15221.
- Expansion seeds (8, run up front per the sample-size rule
  above): 15337, 15439, 16501, 16502, 16503, 16504, 16505,
  16506.
- Full band (16): 15003, 15009, 15091, 15211, 15215, 15220,
  15221, 15337, 15376, 15439, 16501, 16502, 16503, 16504,
  16505, 16506. Legs: guard (WOODWARM=0) and ON
  (WOODWARM=1), each off (BANKFOOD=0) and variant
  (BANKFOOD=1).
- Policy: competent-player policy (nighttravel stack) +
  bankfood wrapper, unchanged. No gate, price, deed bar, or
  win price changes. No new policy file is introduced by
  this arm.

## Panel note (§15)

scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day
evening census, or an env-gated single-mechanism probe (same
declaration as every prior strand arm). Comparison here is
off-vs-variant legs on identical seeds through the rerun
analyzer, never labeled a panel comparison — UNLESS a
game-code fix lands, in which case the before/after
comparison for the fix runs through the balanced panel and
the compare output is attached or cited. No fix is planned,
so no panel comparison is owed by this prereg.

## Sense-testing law

Quote the actual morning/pack lines for EVERY judged event
(retained or vanished), including any silent per-form spoil
sweep and any silent upkeep breakfast. A retained event
whose morning narration never mentions its food is reported
as silence, not as a sense pass. The silent-upkeep-breakfast
narration itself is NOT fixed here (separate blank).

## Wall numbers (observed, NOT attributed)

Report median survival and wave reach read from the corpus,
and state plainly what it does NOT read: wins / national /
table are not read by a 60-day strand census and are not
fabricated.

## Metric review (for the NEXT run; filled at end)

- (filled at end of run; revisions never apply mid-run)
