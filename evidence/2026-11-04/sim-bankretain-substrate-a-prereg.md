# sim-bankretain-substrate-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261104T2230Z, arm
sim-bankretain-substrate-a, axis food-economy. Worktree
sim-banksubstr-a. Measurement on current master; NO game-code
change is planned, NO policy-default flip, NO edit to any
existing policy file. If a traced vanish mechanism yields a
small proven fix, this arm STOPS and reports it as a separate
proposal rather than landing it silently. Sibling trees never
touched; main tree never touched; never touch
~/workspace/goals/.../hidden_files (the coordinator owns the
backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Blank and why this run exists

Banked evening food retention has failed TWICE on
SUBSTRATE-MISSING, never on a mechanism: sim-bankretain-a
(0 judged known-edible banks, 1 censored) and
sim-bankretain-rerun-a (1 distinct judged event — the carried
16505/59 grapes, retained-then-eaten — vs bar 3; 1 censored).
Both runs agree the in-stack pool is ~1 edible stranded
evening per 16 seeds. This run does NOT re-run that census a
third time. It changes the substrate, as both prior arms'
metric reviews directed: a fresh seed band screened for
stranded evenings with edible pack food, with a pre-registered
probe fallback if the screen comes up short.

## Canon read first

docs/CANON.md, docs/PRESERVATION.md (food ladder, spoilage).
No canon doc covers "banked evening food retention" as a named
rule — that still holds, as in both prior arms. The engine's
documented per-form dawn spoil sweep (a form whose spoilDay
has arrived is swept at dawn, other forms persist) is the only
overnight removal mechanism on record. This arm does not invent
canon.

## Adopted accounting (from the rerun prereg, unchanged)

- Judged event (REDEFINED, rerun definition): an evening
  record with mode bank|flip AND post-bank edible food
  (postDailyPack.edibleKcal > 0) AND a FOLLOWING MORNING
  IN-STACK (next loop-day row exists AND a firstUpkeep record
  exists for scholarDay = gameDay + 1). Source recorded per
  event (banked / carried / mixed / carried-with-loss), never
  used to exclude. Mode 'skip' evenings are never events.
  Post-bank edible == 0 is lump-only / no-gain, excluded.
  No following morning = CENSORED, not judged.
- Morning upkeep's competentEat IS the morning meal for
  accounting: retained-then-eaten (edible present at the
  first-upkeep snapshot, then upkeep-eaten with the exact kcal
  chain) counts as RETAINED at the true morning, NOT vanished.
  Vanished = edible gone with no upkeep-eat accounting.
- Count DISTINCT events (seed + loopDay), never leg-instances:
  the same event reproduced on guard and ON legs counts once.
  Consensus rule (new instrument, scripts/
  union-bankretain-substrate-a.js): a distinct judged event is
  RETAINED iff every judged leg-instance of it is retained;
  differing instance verdicts flag the event DISAGREED, which
  fails unanimity and is never averaged away. A leg on which
  the same seed+loopDay is censored contributes no judged
  instance and does not veto the event.

## Primary metric (binding)

Share of DISTINCT judged events RETAINED at the true
post-sleep morning (first-upkeep snapshot), where retained =
classification RETAINED (no loss) or RETAINED-SPOIL-SWEPT
(every shortfall is a named per-form dawn spoil sweep; an
unnamed shortfall is not retention). Secondary, per judged
event: morning disposition (morning-phase-eaten /
upkeep-eaten / still-in-pack / morning-unaccounted /
no-morning-record) with the kcal chain shown. The primary
verdict rests on the first-upkeep snapshot only.

## Substrate design, chosen up front: (a) strand-screened fresh band

PRIMARY: screen a FRESH seed band — seeds 17001–17040, none of
which appear in the old 16-seed band (15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337, 15376, 15439, 16501, 16502,
16503, 16504, 16505, 16506) — for stranded evenings carrying
edible pack food into the night, and census ONLY screened
seeds.

- Screening leg: guard-variant only (BANKFOOD=1, WOODWARM=0),
  60d, death-aware. Screening runs in blocks of 8 seeds in
  seed order (17001–17008 pilot block first, then 17009–17016,
  17017–17024, 17025–17032, 17033–17040). After each block,
  the screen corpus is analyzed with scripts/
  analyze-bankretain-rerun.js (variant dir only; no off dir
  needed for screening). Screening STOPS early once cumulative
  DISTINCT judged events across screened blocks reach >= 3,
  or when the band is exhausted, whichever comes first.
  Early stopping is pre-registered and selection-neutral on
  the outcome: screening selects on EVENING pack contents
  only, never on the morning retention outcome.
- A seed is a CENSUS SEED iff it holds >= 1 distinct judged
  event in its screening leg. Censored-only seeds (edible
  stranded evening but no following morning) are reported as
  censored pool, never census seeds. If more than 8 seeds
  screen in, census the FIRST 8 in seed order (pre-registered
  cap, neutral on retention outcome).
- Census legs (census seeds only, 60d): guard + ON, off +
  variant (4 legs per seed). The screening guard-variant files
  ARE the census guard-variant corpus (same OUTDIR, reused,
  not re-run). Judge variant legs only; off legs are the
  det-gate / revised-neutrality comparison (below).
- Screening files live in evidence/2026-11-04/
  sim-bankretain-substrate-a-corpus-guard-variant; census adds
  -guard-off, -on-off, -on-variant dirs of the same stem.
  Sweep logs alongside, same stem.

## Pre-registered fallback: (b) probe-given food

If the full 40-seed screen band is exhausted with FEWER THAN
3 distinct judged events, the run switches to the probe arm
INSIDE this run — the fallback is declared here, not switched
silently, and the metric, bar, and counting rules DO NOT
change (same primary metric, same >= 3 / unanimity bar, same
distinct-event counting; probe events are reported under a
PROBE label and never pooled with natural counts).

- Probe design: a new driver (scripts/bankretain-substrate-
  probe-a.js, built only if the fallback triggers) wrapping
  the bankfood stack: on a stranded evening (bankfoodEvening
  mode bank|flip), after the evening phase and before the
  harness sleeps, it places KNOWN edible food in the scholar's
  canonical pack — 6 x 90 kcal Muscadine Grapes (540 kcal,
  the 16505 shape), spoilDay = scholar day + 3 so no dawn
  spoil sweep can confound the night — and records the
  injection (probeGivenKcal) on the evening row. The harness
  then sleeps honestly; retention is judged from the
  post-injection postDailyPack to the firstUpkeep snapshot
  with the same classifier (scripts/analyze-bankretain-
  rerun.js classifyRetention).
- Probe seeds: up to 8 seeds from the screen band that
  STRANDED (any stranded evening, even lump-only) but yielded
  no judged event, in seed order. Per seed, the probe fires on
  the FIRST stranded evening with a following morning; if
  that evening is censored (village death before morning),
  the probe moves to the seed's NEXT stranded evening, up to
  3 stranded evenings per seed. Each seed contributes at most
  1 probe judged event (first judged probe evening).
- Probe verdict labels: RETENTION-CONFIRMED (probe) requires
  >= 3 distinct probe judged events, all retained — the same
  bar, labeled as probe-substrate evidence about engine
  overnight retention, NOT as natural in-stack retention.
  Fewer than 3 probe judged events = INSUFFICIENT-DATA
  (SUBSTRATE-MISSING) again, and the run says so plainly.
- The probe injection is a measurement fixture, disclosed in
  the evidence: it tests whether known-edible pack food
  survives a stranded night in the engine, not whether
  villagers naturally acquire it. No game-code change is
  involved either way.

## Verdict rules (judged exactly against these; a miss is NO-GO, never re-scored mid-run)

- RETENTION-CONFIRMED (measurement result, NOT a kill):
  >= 3 distinct judged events, ALL retained at first upkeep
  (clean or spoil-swept). Unanimity standard kept deliberately
  from both prior arms: with single-digit n, a majority would
  let one unexplained loss hide inside a "confirmed" verdict.
  Retained-then-eaten counts as retained. No fix lands (there
  is nothing to fix); the finding is reported as a measurement.
- VANISH-CHARACTERIZED: >= 1 distinct judged event vanished
  (or partial-unexplained) WITH a traced mechanism stage named
  from the snapshot chain. Then: STOP and report the traced
  mechanism as a separate fix proposal; no silent landing. A
  vanish WITHOUT a named mechanism stage is DIAG, not a fix.
- INSUFFICIENT-DATA: < 3 distinct judged events after the
  screen band (primary) or after the probe (fallback). §14a:
  SUBSTRATE-MISSING if the pool is empty/small, NEVER
  CONCEPT-DEAD (no mechanism was staged and failed) and never
  a retention claim on 1-2 events (reported as numbers, not a
  verdict).
- NOT-CONFIRMED (mixed pattern): >= 3 distinct judged events
  but not all retained, and no single traced vanish mechanism
  unifies the losses. Reported as the pattern it is, with the
  loss stages named per event; no confirmation, no vanish claim.

## Revised neutrality guardrail (binding — from the rerun arm)

Per census seed and leg-pair (guard, ON): (1) trajectory
equality THROUGH THE LAST PRE-ACTION DAY (for every loop-day
before the variant leg's FIRST acted bank/flip evening, off
and variant evening rows agree on kcal, tile, mx, my,
gameDay); (2) a NAMED DIVERGENCE POINT for any later split
(first acted variant evening's loop-day + kcal delta);
(3) the OFF-LEG DET-GATE (every OFF leg: bankfood errs 0 AND
zero acted bank/flip evenings). The guardrail applies to
census legs only; screening legs (variant only) carry no
guardrail claim. Probe legs, if run, carry the det-gate on
their OFF legs and the same pre-action rule where a
comparable OFF leg exists; the probe injection itself is a
named divergence by construction and is never scored as a
guardrail failure.

## Horizon, seeds, policy

- Horizon: 60 days, death-aware (dead villages stop
  simulating; +10d tail max per §10). WHY 60: identical to
  both prior arms, so event rates are comparable. Never a
  fixed 200d.
- Pilot: the first screen block (17001–17008, guard-variant)
  is the pilot: it tests whether the fresh band strands at all
  before any further screen spend. Pilot yielding 0 judged
  events does NOT kill the run — screening IS the substrate
  search, and the pre-registered block sequence continues to
  the next block; only band exhaustion triggers the fallback.
- Policy: competent-player policy (nighttravel stack) +
  bankfood wrapper, unchanged. Env gates asserted FATAL by
  the driver: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, POLICY=nighttravel, WOODCARRY=1,
  WOODWARM=0|1, BANKFOOD=0|1. No gate, price, deed bar, or win
  price changes. No new policy file is introduced by the
  primary arm.

## Instruments (committed with this prereg, before any judged sim)

- Reused, unchanged: scripts/bankfood-trace-b.js (driver),
  scripts/analyze-bankretain-rerun.js (analyzer),
  scripts/test-bankretain-rerun-a.js (regression proof, pure
  30/30 green before any judged sim).
- NEW scripts/union-bankretain-substrate-a.js (distinct-event
  union across guard-variant + on-variant legs; stdout only,
  never writes into the repo) + NEW scripts/
  test-bankretain-substrate-a.js (pure 11/11 green before any
  judged sim: same event on two legs counts once, judged +
  censored legs, disagreement flags, distinct keys).
- Probe instruments (driver + proof test) are built ONLY if
  the fallback triggers, and are committed before any probe
  judged sim, with their own proof-green run.

## Panel note (§15)

scripts/balance-panel.js cannot express the nighttravel+
woodcarry+woodwarm strand stack, the 60-day evening census, or
an env-gated single-mechanism probe (same declaration as
every prior strand arm). Comparison here is off-vs-variant
legs on identical seeds through the rerun analyzer + the
distinct-event union, never labeled a panel comparison. No
game-code change is planned, so no panel comparison is owed.

## Sense-testing law

Quote 1–2 actual transcript lines from a stranded evening /
morning in the corpus and judge whether they read as a real
person (stranded scholar, morning meal) or as a blank. A
retained event whose morning narration never mentions its
food is reported as silence, not as a sense pass. The
silent-upkeep-breakfast narration gap (filed by both prior
arms) is NOT fixed here (separate blank).

## Wall numbers (observed, NOT attributed)

Report median survival and wave reach read from the corpus,
and state plainly what it does NOT read: wins / national /
table are not read by a 60-day strand census and are not
fabricated.

## Metric review (for the NEXT run; filled at end)

- (filled at end of run; revisions never apply mid-run)
