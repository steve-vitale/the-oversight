# sim-food-economy-round-0835-b — coordinator evidence (Loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0835Z.
Axis: food-economy (converging). Loop A live on scale-onramp the whole run
(0755Z claim, w4funnel-repin + finalloss-rebase, landed 6b7eb4496 mid-run,
NOT touched) -> B worked food-economy, the second non-converged axis.
Both arms DIAG/measurement only, zero src/js, merged locally pending ship.
No push, no version bump (the batch ship job owns deploys).

## STALE-LOCK RECOVERY at start

The 0630Z B run was dead by the body's guard: its lock was 119 minutes old,
its tree sim-ledgerbound-b heartbeat 07:59Z (36 minutes stale, past the
15-minute guard), and its worker had committed 07:57Z and been idle since.
Lock deleted, dead 0630Z claim retired to
lever-claims/fleshout-loop-b-20261027T0630Z.json.DEAD. Its residual2b arm
had already landed (6fdcbfce3); its ledgerbound arm was stranded committed
in its worktree and is adopted here as Arm 1. Nothing of Loop A's was
touched. Pre-flight: main tree clean, disk 28%, worktree-reap safe
(only LOUD warnings about other owners' uncommitted trees, left alone).

## Arm 1 — sim-ledgerbound-b-land (adoption of the stranded 0630Z arm)

Stranded branch sim-ledgerbound-b, tip d5c9a9d57 (prereg 2ff5e518f +
evidence d5c9a9d57): boundary-aware ledger re-judge, PILOT GO (named 11/12,
generic 8/8, dried 0.91%) + CONFIRM-GO (named 5/5, generic 12/12, dried
0.36%), zero src/js. Coordinator adoption, not a re-judgment: the verdict
stands in evidence/2026-10-27/sim-ledgerbound-b.md and is not re-scored here.

- Rebased onto master fc57dd0bd clean (new tip 3a0ddb016), then onto
  feb723d76 (journey-landing r60 landed under the run) clean (1a40dfe69),
  then onto 6b7eb4496 (Loop A's 0755 round landed under the run) clean
  (a2e3e2719). Zero file overlap on every rebase; ff-only correctly
  refused the diverged branch twice before each rebase.
- Proof re-run on the pinned base after every rebase
  (PINNED_GAMEJS_BLOB=b2ba423afdfbdce8c98751ef544f10805b46cfa6,
  pre-c04d4e0cb game.js): pilot proof GREEN (det-gate reproduces corpus
  9820 counts 255/1249/4/163, boundary legs GO), confirm proof GREEN on
  the first base (named 5/5, generic 12/12, dried 0.36%). After each proof,
  game.js restored from the out-of-repo backup and verified
  (hash bfa3631982cb2233fdc40ff54c4269bd2649c1fd, git status clean,
  diff HEAD empty). The pin was never committed.
- Merged --ff-only as a2e3e2719, verified ancestor of master. Tree released
  done-merged, branch deleted, worktree removed, main tree clean.
- BASE PIN note: the ledgerbound corpus trajectories are pre-c04d4e0cb
  trajectories and must not be cited as current-base trajectories.

## Arm 2 — sim-raiddor-ledger-b (worker, raid-door-wrapped ledger re-judge)

Worker in fresh tree sim-raiddor-ledger-b (registered at fc57dd0bd).
Prereg committed BEFORE any judged sweep (c0f8c6f98, rebased to f753041e2);
evidence commit deb8276b9 (rebased to 964d2d7b2). Instrument vendored
under new raiddor names only (sweep/analyze/test/trace/stockdoors-capture
-raiddor); zero sibling files modified; zero src/js. Verdict GO against
its own pre-registered bar (not re-scored by the coordinator):

- (a) Pilot, seeds 9820-9827, pinned base: named 12/12, pooled 0 /
  1,687,320 = 0.000%; generic 8/8, pooled -29 / 2,225,865 = 0.001%; dried
  pooled -4,996 / 774,536 = 0.65%. Controls reproduce exactly:
  old-boundary pilot named 9/12 (NO-GO), ledgerbound-boundary pilot named
  11/12 (the single failure is LQ 9825 -800, the raid).
- (b) Targets exactly as named raid-door records on seed 9825, caller
  villageAgencyDaily: day 75, Muscadine Grapes (dried) 12u x 72 = 864
  (asked 800, whole-unit overshoot); day 81, Lamb's Quarters (dried)
  20u x 40 = 800 (asked 800). No decomposition, no remainder.
- (c) Confirm, fresh seeds 9870-9881, pinned base: named 8/8 — exactly the
  prereg's named-row minimum, so the rate bar was judged, not waived —
  pooled 0 / 1,082,450; generic 12/12, pooled 742 / 3,785,372 = 0.020%;
  dried pooled -3,560 / 1,043,449 = 0.34%.
- Proof GREEN on both corpora in the worker's runs (pilot 37 checks,
  confirm 34 checks; det-gate RAIDDOORS on vs off byte-identical on
  non-raid fields and reproduces corpus 9820 counts 255/1249/4/163;
  raid item sums = returned kcal, 0 retMismatches; raid/direct
  disjointness proven). One honest proof fix recorded in the arm
  evidence: a stale stockdoors-off check carried from ledgerbound's
  det-gate failed the first pilot proof run and was corrected to the
  RAIDDOORS toggle actually tested, then fully re-run GREEN.
- Coordinator re-ran both proofs post-rebase on the pinned base: GREEN,
  no FAIL lines; game.js restored (bfa36319…) and tree clean before
  merging. Rebased onto master 3e2f8beef (w4melt-a landed under the run)
  clean, merged --ff-only as 964d2d7b2, verified ancestor of master.
  Tree released done-merged, branch deleted, worktree removed.
- BASE PIN note: the raiddor corpora are pre-c04d4e0cb trajectories and
  must not be cited as current-base trajectories.
- Coverage honesty (from the arm evidence, not hidden): all 37 raid
  records on both bands are raid-unanswered; no other _removePantryKcal
  caller (tributes, dues, aid, answered raids) fired on either band, and
  no raid landed on a closing-snapshot day, so the post-snapshot raid
  adjustment is implemented but unexercised. The confirm band proves
  instrument stability, not a second raid rescue — the rescue rests on
  the pilot band.
- Balanced panel (MEASUREMENT.md §15): N/A, stated explicitly in the arm
  evidence — this arm changes no lever or game code, so there is no
  before/after to panel; the det-gate is the instrument before/after.

## Wall numbers (this run's judged corpora, competent-nofeast, 100d)

- Ledgerbound bands (20 configs): national 0/20, table 0/20, wins 0/20,
  wave 4-5 0/20, median survival 100d capped.
- Raiddor bands (20 configs): national 0/20, table 0/20, wins 0/20, wave
  4-5 0/20, median survival 100d (9881 lost day 61, death-aware horizon
  working); waves 1-3 only on both bands.
- The scale wall stands on every band in this run. The ledger work does
  not move it, and this report does not claim otherwise.

## Village assessment (plain words)

Forty village-runs around pantries now watched down to the unit, and the
story they tell is not hunger: nobody's books fail on food, and the
villages that lost the most people lost them to sickness, arenas, and
fights, not empty shelves. Villagers cook for the haven, work the smoke
racks, eat from the pantry by name, and share surplus back into the
stores — and on 16 of the 20 raiddor villages, a night raid at the
treeline went unanswered, so raiders walked off with a fixed 800-kcal
share of the longest-keeping stores (usually Canned soup, the
whole-unit overshoot of an 800 ask). A raid costs about 1,000 kcal
against pantries holding hundreds of thousands: a tax, not a famine.
The raid take is not silent — it is narrated with names and numbers
that match the ledger to the kcal ("Aisha of Emberhold didn't wait —
they hit the stores and melted back into the dark with 864 kcal"),
with a social consequence attached (opinion -5, journal entry). What
was missing was never food; it was a witness to the last unwrapped
door, and now there is one. Nothing robotic, static, or repeated was
found in the sampled dialogue; the one repetition (the 800-ask /
1,000-take shape) is the mechanism's honest whole-unit arithmetic.

## Metric review (MEASUREMENT.md §14)

- Ledgerbound's confirm named count (5 rows) was weak evidence as a rate;
  raiddor's prereg fixed that prospectively with an 8-row minimum, and
  the confirm band landed exactly on 8 — the rate bar was judged, not
  waived. That rule should stay in future ledger preregs.
- Raiddor's confirm raid legs equal its boundary legs exactly (no
  confirm raid touched a focal row): the confirm proves the instrument
  is stable, not that the rescue generalizes. The next ledger prereg
  that wants a second rescue must pre-register a band where raids hit
  focal rows, or say plainly that it is a stability band.
- The post-snapshot raid adjustment and the non-raid _removePantryKcal
  callers are implemented-but-unexercised. They are coverage items for
  the next prereg (see Next blanks), not verdicts, and must not be
  cited as proven until a band exercises them.
- No metric was re-scored mid-run anywhere in this round: ledgerbound's
  verdict was adopted as judged, raiddor's was judged against its own
  prereg, and the controls (old-boundary NO-GO, ledgerbound-boundary GO)
  reproduced exactly in both arms.

## Telemetry deviation check

Ran scripts/telemetry-check.js (baseline
hidden_files/telemetry-baselines/scale-wall.json, metrics
national,table,wins,exiled) on all three new corpora:
raiddor pilot (n=8), raiddor confirm (n=12), ledgerbound pilot (n=8).
Same 3 LOUD lines on each (national 12->0, table 16->0, wins 16->0), all
REGIME artifacts of a competent-nofeast pre-seat substrate vs the
WINSEAT baseline — no exiled LOUD line. Baseline NOT rolled, no new
investigation item.

## Infrastructure

- Master moved 4 times under this run (w4funnel-repin + finalloss-rebase
  landings, journey-landing r60, Loop A's 0755 round, w4melt-a). Every
  rebase was clean, zero file overlap, proofs re-ran green after every
  rebase and on merged master. ff-only correctly refused diverged
  branches twice (ledgerbound) before rebasing.
- Safe-commit index clobber hit the raiddor worker's commits (both,
  staged-deletion variant) — worker-repaired per the documented
  cacheinfo recipe, verified by the coordinator at handoff (worktree
  clean, hashes matching, merged commits intact). No clobber on the
  coordinator evidence commit (verified below). No EPERM flap blocked
  this run's writes after the raiddor prereg.
- check.js --quick NOT re-run: zero src/js, zero green-list files in
  either arm, and Loop A's 0755Z round recorded the standing profile
  on the same master lineage. Arm proofs are the attributable
  verification.

## Convergence

food-economy stays converging (NOT converged): the ledger instrument
now closes on two independent bands with every known pantry door
wrapped, and the two residual2b targets are named raid-door records to
the kcal — the ledger-boundary blank and the raid-door blank are
closed. The axis is not converged: the scale wall (national / table /
wins) is untouched by this axis, and ledger coverage (other
_removePantryKcal callers, day-100 raid adjustment) is still
unexercised. scale-onramp stays converging (untouched; sibling Loop A).
Next blanks, in order: (1) a regional-politics band that exercises the
other _removePantryKcal callers (tributes, dues, aid, answered raids)
under the raiddor instrument; (2) a day-100 raid seed to exercise the
post-snapshot raid adjustment; (3) the 0530Z carried blanks, still open
and untouched: garden-attributed deposits with zero garden harvest,
starting-stock draw order, spoilage-boundary split (meal vs cook),
~5,900 kcal non-draw removal day-82/83. Claim deleted; lock deleted.
Evidence: evidence/2026-10-27/sim-food-economy-round-0835-b.md (this
file) + sim-ledgerbound-b.md + prereg + corpora + sim-raiddor-ledger-b.md
+ prereg + corpora. Merged locally, pending ship.
