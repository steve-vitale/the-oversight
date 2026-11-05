# sim-banksnap-a — PREREGISTRATION (binding; committed BEFORE any judged re-run)

Run: oversight-flesh-out-loop, run fleshout-20261105T1215Z, arm
sim-banksnap-a, axis food-economy. Worktree sim-banksnap-a.
MEASUREMENT/DIAGNOSIS ONLY: no game-code change, no policy
change, no win-price / deed-gate / food-number change. Zero
src/js. Instrument-only fix + re-judgment. If the fix would
require a game change, STOP and report; do not make it.
Sibling Loop B run never touched; main tree never touched;
hidden_files never touched (coordinator owns the backlog /
tracker / claims — the coordinator marks sim-findings.md
#1756 `fixed` on landing from this arm's evidence).
Nothing is pushed, bumped, or live-verified by this worker
(coordinator merges via --ff-only); report 'merged locally,
pending ship' readiness. No [needs-eyes] — instrument-only.

## Canon read first

docs/CANON.md, docs/PRESERVATION.md (food ladder, spoilage).
No canon doc covers "banked evening food retention" as a
named rule — that still holds, as in all prior bankretain
arms. The engine's documented per-form dawn spoil sweep (a
form whose spoilDay has arrived is swept at dawn, other
forms persist) is the only overnight removal mechanism on
record. This arm does not invent canon. docs/MEASUREMENT.md
§§9-12, 14-15 read and followed (see below).

## Blank

sim-findings.md #1756 (claimed by this run): the substrate
arm sim-bankadded-substrate-a (run fleshout-20261105T1041Z,
evidence/2026-11-05/sim-bankadded-substrate-a.md) judged 14
distinct bank-band added events (13 staged + 1 genuine, 0
censored) 6 retained / 8 VANISHED, verdict
NO-GO-NON-UNANIMOUS — and traced the 8 VANISHED to a
snapshot-timing artifact, not a retention failure: in the
sleep-refused path (bank-band evenings, clock 449-483,
sleep refuses at <64 ticks remaining) the day rolls AFTER
upkeep #1 runs competentEat (eats pack food when scholar
kcal < 2040), but the instrument's first-upkeep snapshot
fires at upkeep #2 — so a hungry scholar's morning meal is
gone before the snapshot looks. Evening kcal splits exactly
at the 2040 trigger (retained 2181-2270, vanished 0-1510).
This arm fixes the instrument and re-judges the SAME 14
events. No third census: the substrate worked (14 judged,
0 censored) and needs no re-staging.

The 14 events (seed/loopDay, from the substrate evidence):
17025/32, 17025/33, 17051/11, 17059/5, 17059/6, 17060/8,
17060/9, 17063/13 (genuine), 17063/14, 17063/15, 17064/6,
17064/7, 17073/31, 17073/32. Corpus:
evidence/2026-11-05/sim-bankadded-substrate-a-corpus/
(8 files, seeds 17025, 17029, 17051, 17059, 17060, 17063,
17064, 17073).

## Instrument fix (pre-registered design)

The first-upkeep snapshot lives in scripts/policies/
bankfood-diag.js — the probe wrapper delegates to it
unchanged, so the fix lives there, not in the probe file:

- `withBankfood` upkeep records a snapshot at EVERY upkeep
  call into a new store array `st.upkeepSnaps`
  (scholarDay, upkeepIndex [running counter], afterDailyCalls,
  kcal, dayTicks, canonical pack snapshot), taken BEFORE
  delegating to inner.upkeep — the same position the
  first-upkeep snapshot already occupies, so a snap reads
  the pack before that call's upkeep eat. The existing
  firstUpkeeps behavior (first upkeep of a new scholar day)
  is UNCHANGED, so every prior analyzer keeps working.
  Pure recorder addition: no state edits, no RNG draws, no
  behavior change — trajectories must reproduce exactly.
- Driver scripts/bankadded-probe-trace-b.js attaches
  `upkeepSnaps: pbStore.upkeepSnaps` to each instance
  output, alongside the existing `firstUpkeeps`.
- Analyzer scripts/analyze-bankadded-probe.js adds the
  pre-snapshot window classification (below) and reports
  BOTH the old first-upkeep verdict and the re-judged
  verdict per event, on identical events. Old verdict
  fields and GO math are kept untouched for backward
  compatibility; the new fields sit alongside them.

## Re-judgment rule (pre-registered, binding)

For each judged event, the analyzer finds the pre-snapshot
window from the upkeep snaps:

- snapPre = the LAST upkeep snap with scholarDay == gameDay
  (the evening day) and afterDailyCalls == loopDay — the
  first upkeep call of the following loop-day, taken before
  that call's inner.upkeep.
- snapPost = the first-upkeep snap of scholarDay gameDay+1
  (the existing firstUpkeeps record).

A first-upkeep VANISHED / PARTIAL-UNEXPLAINED staged event
is re-classified RETAINED-THEN-EATEN iff ALL of E1–E5 hold:

- (E1) snapPre exists and its injected-stack units
  (key 'Muscadine Grapes|40|true|raw', spoilDay gameDay+2)
  == 18, and snapPre edible kcal == post-bank edible kcal
  (the pack at snapPre is the post-bank pack — nothing left
  the pack between the evening and the pre-snapshot upkeep).
- (E2) snapPost exists and its injected-stack units == 0.
- (E3) The drop localizes to ONE inter-snap step:
  snapPost.upkeepIndex == snapPre.upkeepIndex + 1, and no
  snap between them shows injected units strictly between
  0 and 18 (no partial drop, no transformation — a cooked
  grape stack would read as a key change, not a drop).
- (E4) Eat trigger fired: scholar kcal at snapPre < 2040
  (0.85 x 2400 cap, competentEat's trigger).
- (E5) Spoil immunity: injected spoilDay (gameDay+2) >
  snapPost scholarDay — the dawn sweep cannot explain it.
- (E6) KCAL ACCOUNTING QUOTED per event (not exact-matched
  — see the improvement note below): kcal(snapPre),
  kcal(snapPost), eaten 720, endDay burn 2200 (ACTIVE_DAY,
  src/js/engine/calories.js), residual
  R = kcal(snapPost) - (kcal(snapPre) + 720 - 2200),
  attributed per event from the snaps (pantry guard-loop
  takes, overnightBankBurn, metabolic drain, action costs)
  or named as an open instrument question in the metric
  review. A residual that cannot be attributed does NOT
  overturn a pack-side E1–E5 pass, because the kcal side
  is corroborating, not the proof (reason below).

Mechanism basis for E1–E5 (code read, committed before the
re-run; the snaps verify it, they do not assume it): the
only edible-pack consumer in the [snapPre, snapPost]
window is the upkeep eat — competent.upkeep calls
competentEat (pack first, most-perishable first, eats
until the cap or the food runs out); cookPack needs a fire
(stranded, no fire) and transforms rather than removing;
eveningFeast/surplusFeast require playerAtHaven (stranded,
not at haven); endDay's dawn spoil sweep is spoilDay-gated
(E5); villagerTurn/monsterTurn/driveFights never touch the
scholar's pack. For the 8 VANISHED events the post-bank
pack held ONLY the 720 injected grapes as edible food, so
a triggered Game.eat in that window eats exactly them.

IMPROVEMENT WITH REASON (brief's "same-window kcal rise",
adopted in form, corrected in substance): a raw kcal rise
cannot be the arbiter in this window, because the endDay
burn (2200) and competentEat's pantry guard-loop takes
share it — the existing corpus already proves it: retained
17051/11 went 2240 -> 0 overnight while retained 17025/32
went 2230 -> 2090, the same trigger state (no eat, both
>= 2040) with wildly different overnight kcal moves. So
the brief's "kcal rise accounts for it" is implemented as
(E6): the full window accounting is QUOTED per event with
its residual attributed or named open — the proof itself
is the pack-identity drop localized to the eat window
(E1–E3) + the fired trigger (E4) + spoil immunity (E5).
If the re-run's snaps contradict this reasoning (e.g. a
drop that does NOT localize, or a cooked-grape stack), the
event is NOT explained — it stays unexplained-vanished
and the verdict is NO-GO.

Already-retained events (6): the re-judgment must AGREE
with the old verdict — for a staged event the old verdict
RETAINED / RETAINED-SPOIL-SWEPT stands only if the snaps
show injected units 18 at BOTH snapPre and snapPost (the
food was still there at the snapshot, eaten later); a
disagreement reads DISAGREED and fails GO. The genuine
event (17063/13, no injection) keeps its old verdict with
the snaps quoted as consistency (food present at snapPre
and snapPost, eaten after the snapshot).

If a required snap is missing for an event, that event is
UNRESOLVED-NO-PRE-SNAP — it counts as unexplained and the
verdict is NO-GO. No silent fallback to the old verdict
for the re-judgment.

## Primary metric (binding)

Re-judgment of the same 14 distinct bank-band added events
(seed + loopDay, as listed above) under the fixed
every-upkeep snapshot. Each event's final verdict is
RETAINED, RETAINED-SPOIL-SWEPT, or RETAINED-THEN-EATEN.

GO threshold: re-judge ALL 14 events; GO iff the
re-judgment is UNANIMOUS retained-or-retained-then-eaten —
every one of the 8 prior VANISHED explained per E1–E6
with its kcal accounting quoted, and every one of the 6
prior retained confirmed by the snaps. If any event
remains unexplained-vanished, DISAGREED, or UNRESOLVED,
verdict is NO-GO with that event named. A miss is NO-GO,
never re-scored against a friendlier metric mid-run.

DETERMINISM GUARD (stop condition, not a re-score): the
re-run must reproduce the substrate's event set exactly
(same 14 seed/loopDay/kind/delta, same per-seed staged
counts). If the event set differs, STOP and report — do
not judge a different set as if it were the same 14.
Instrument errors (bankfood errs + probe errs) must be 0
in the new corpus, as in the substrate corpus.

## Bands (reuse, NOT fresh)

No fresh seed band. Same 8 seeds as the substrate corpus:
17025, 17029, 17051, 17059, 17060, 17063, 17064, 17073.
60d death-aware horizon (dead villages stop simulating;
substrate corpus: median 60d, 2 of 8 villages lost at
day 35/42). Legs: guard-variant (WOODWARM=0, BANKFOOD=1,
BANKADDED_PROBE=1, same env gates as the substrate arm:
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1,
POLICY=nighttravel, WOODCARRY=1). OUTDIR
evidence/2026-11-05/sim-banksnap-a-corpus. The substrate
corpus is NOT overwritten; the new corpus is a separate
directory for this arm.

## Stages (§9 pilot gate)

- Proof first: scripts/test-banksnap-a.js (new) green AND
  scripts/test-bankadded-probe-a.js still 58/58 green
  BEFORE any judged re-run.
- Smoke: 1 seed (17063 — 3 events incl. the genuine) to a
  /tmp dir, verifying the snaps land and the events
  reproduce, before the full band.
- Band: the full 8-seed re-run (the pilot IS the band at
  this size; no confirm spend beyond it — the event set
  is fixed at 14).

## Panel note (§15)

scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day
evening census, or an env-gated single-mechanism probe
(same declaration as every prior strand arm). The
comparison here is old-snapshot vs new-snapshot verdicts
on identical events by one analyzer — a before/after on
the same corpus, never labeled a panel comparison. No
game-code change was made, so no panel comparison is owed.

## Wall numbers

Not re-measured this run (diagnosis arm; recorder corpus,
not a scale panel — same caveat as the 1041Z run).
Carried: standaccum2 band national/table/wins 0/16, wave-5
0/16, median survival 90.5d; Loop B 0618Z postblood
wild-dominant. Full seat still unwon; wave-5 kills still 0
in normal play.

## Metric review (section required in the evidence file)

A miss is NO-GO, never re-scored against a friendlier
metric mid-run. If the metric proves wrong, write it
under "metric review" and propose the revision for the
NEXT run. Convergence state reported in one line.
