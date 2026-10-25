# sim-food-confirm-awayration-round-2330 — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b-20261024T2330Z (cron), axis food-economy.
Loop A live on scale-onramp at run start (2315Z claim, vetkill + vetshape,
NOT touched) -> B worked food-economy (converging), the second non-converged
axis. Loop A landed mid-run (110eb84e0 coordinator evidence, vetkill
DIAG-GO + vetshape NO-GO); both B branches rebased clean in their own
worktrees, proofs green after every rebase, then merged ff-only.

Pre-flight note: the main tree was dirty at run start with the batch ship
loop's version bump to 2baa1e23e (touched 23:24Z). Per the body, the run
waited 10 minutes instead of failing; the bump committed as 327e16b69 and
the tree was clean before any worktree registration. No sibling files
touched, no reset used.

## Arm 1 — sim-fullpantry-confirm-b (commit 1debe3bd0, rebased from b1816e6a9)

Fresh-seed CONFIRM of sim-fullpantry-diag-b (backlog #938/#942), same
instrument derived into new -confirm-b scripts, diag-b scripts untouched.
Competent policy unmodified, env PLENTYDEPRI=1 / DEPOSITGATE=1, horizon
150d death-aware. Seeds 94421-94436 verified fresh before sims; pilot
yielded 1 full-pantry death (< 8), so the pre-registered extension ran;
16/16 seeds complete, attempt 1, no retries, no EPERM failure.
Proof 31/31 post-rebase (incl. live determinism leg: seed 94421 re-run
matches the pilot corpus exactly).

Verdict: NO-GO (NO-GO-on-sample) — the diag-b claim is neither confirmed
nor refuted. Judged numbers (this run only, binding pre-reg): pooled
full-pantry villager starvation deaths n = 1 vs required n >= 8; share A
(away-ration) = 1.000 vs required >= 0.80; named mechanism A count = 1 vs
required >= 2, with 1 quoted case. The share bar passes but both hard
gates fail, so per §14 this is NO-GO even at share 1.000. Pooled with
prior runs 9/9 away, 0 haven (diag 3 + pantrystarve 5 + confirm 1) is
context only, never the verdict.

The single case is David, d139 s94425 (pantry 16,744 kcal, 3.7 fresh days,
away-at-death, class A) — the low-health + short away meal shape for a
third straight run (health 60 -> 8 after fleeing a "landlord" fight, then
a 996 kcal pack meal), not prolonged away decline, which did not occur at
all this run. The other 3 villager starvations and the 1 player starvation
were all pantry-0 famine in collapsing villages — ordinary famine, not
distribution failure. Kcal-only context = 0.

Wall (confirm corpus, 16 seeds): national 0/16, table/wins 0/16
(competent-only, expected, not chased); wave 1 16/16, wave 2 16/16, wave 3
13/16, wave 4 4/16, wave 5 0/16; Arc III 16/16; median survival 150d
(capped), max 150d; 12 survived / 4 village-lost. Death causes (132):
the arena 47, monster 24, sickness 20, ambush 10, wound-that-wouldn't-close
6, contest 5, starvation 5, others <= 2 each. No vesting field exists in
this instrument — no vesting number invented.

## Arm 2 — sim-awayration-size-b (commit a3e45499f, rebased from d986852a1)

DIAG measuring away-day ration adequacy (backlog #942), zero src/js
changes, no fix landed. Competent policy unmodified, same env, horizon
150d death-aware. Seeds 94501-94508 verified fresh; 8/8 complete,
extension correctly never ran (away villager-days 3,336 >= 200).
Proof 37/37 post-rebase (incl. live determinism leg: seed 94501 re-run
produces a byte-identical corpus file; pack-day alignment 0 misaligned
rows, 0 duplicate pack rows across 531 pack rows).

Verdict: DIAG-NO-GO — judged strictly on the pre-registered bar, never
re-scored. Seeds 8/8 complete, away villager-days 3,336 >= 200, all
primary metrics reported — but literal pack coverage 531/3,336 = 0.159 <
0.90.

Metric review (in the arm evidence file; the verdict is NOT revised on
this basis): the NO-GO is a metric misspecification, not a capture
failure. A dawn pack only exists when an away villager's own production
falls short (dayWant > 50). 2,807 of 3,336 away days are self-fed with no
pack drawn; on the 529 pack-draw days, capture is 529/529 = 1.000.
Forcing dawn draws for self-fed villagers would corrupt the measurement
(it would pull pantry food they don't need), so the denominator — not
the capture — was wrong. Recommended revision for the next run:
pre-register coverage on pack-draw days.

The size answer (fully measured, stands regardless of verdict):
- Pack/need ratio, joined away days (n = 531): median 0.432, Q1 0.366,
  Q3 0.500, 94.9% below 0.6 (min 0.222, max 0.800). Median pack 880 kcal
  vs ~2,000-kcal needs.
- The pack cannot reach need by construction: formula ceiling 1,450 kcal
  (800 + 500 + 150) before the hunger penalty, and hunger at pack time
  is median 98 (91.3% >= 70), so the -3/point penalty is near-max
  exactly on hungry days.
- The pantry is NOT the limiter: median 32,133 kcal on shelves at draw
  time; only 4/531 packs drawn with pantry under 5,000 kcal.
- Away meal adequacy 3,311/3,336 = 0.993; haven 0.999. Inadequacy
  concentrates on pack days: 24 of 25 inadequate away days are draw
  days (draw-day adequacy 505/529 = 0.955; self-fed 2,806/2,807).
- Streaks: median per-villager max 0, global max 4 (lena_ruiz, s94507
  d27-30, survived). Starvation deaths: 4 villagers, all full-pantry +
  away-at-death, all trailing streak 1, days-since-adequate 1, share
  preceded by >= 3 inadequate away days 0/4. Prolonged away streaks do
  NOT explain starvation deaths here; the operative mechanism is
  low-health (3-7 HP) + short away meal, 4/4 — the same shape as
  fullpantry, now with ration sizes attached (600-832 kcal).

Wall (awayration corpus, 8 seeds): median survival 150d (capped), max
150d, national 0/8, table/wins 0/8 (competent-only, expected), wave 1
8/8, wave 2 8/8, wave 3 7/8, wave 4 5/8, wave 5 0/8, Arc III 8/8. Death
causes (79): the arena 47, monster 7, starvation 4, sickness 4,
dehydration 3, ambush 3, night 2, combat 2, contest 2, 5 singles. Player
starvation deaths: 0.

## Pooled wall (this run's judged corpora, 24 seeds, competent-only)

National 0/24, table 0/24, wins 0/24, wave 5 0/24, median survival 150d
capped. These are measurement corpora, not win-seeking runs — the zeros
are the expected competent-only profile, not a regression.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<corpus-glob>' --metrics national,table,wins,exiled`, run on both
corpora: 3 LOUD lines each (national 12 -> 0, table 16 -> 0, wins
16 -> 0) — all REGIME artifacts of competent-only / pre-seat measurement
corpora vs the WINSEAT baseline, the same shape as 1955Z/2115Z/2215Z/
2230Z/2315Z. Baseline NOT rolled, no investigation item.

## Infrastructure

- Safe-commit index clobber hit both worker commits (repaired by the
  workers via cacheinfo on their own entries only, commits verified
  correct); no clobber on the coordinator commit (see below).
- No EPERM flap this run (after the run-start ship-bump wait).
- check.js --quick NOT re-run: both arms touch zero src/js and zero
  green-list files, and loop A's 2315Z run just recorded the same
  standing profile (280 passed / 7 failed, pre-existing parity gear
  assertion) as 2115Z/2215Z. Re-running ~550-850s under sibling load
  would re-measure a known profile, not this run's work.
- Both trees released done-merged, branches deleted, main tree clean
  at closeout (a3e45499f + this evidence commit).

## Metric review (coordinator)

- The confirm's n = 1 exposes the event-rate problem plainly: at ~1
  full-pantry death per 16 seeds, a confirm sized to n >= 8 needs a
  case-count-sized band (order ~100+ seeds at this rate) or a
  pre-registered stopping rule — not another 16-seed band. The next
  confirm must pre-register its band size from this rate, not from
  habit.
- The awayration coverage bar must be re-registered on pack-draw days
  before any re-judgment; this run's DIAG-NO-GO stands as written.
- Neither verdict re-scores the other: the confirm does not confirm
  the classification, and the size measurement does not price a fix.
  The away-ration fix remains unlanded by design (confirm-first).

food-economy stays converging (NOT converged): the classification is
still small-sample-unconfirmed, the ration size is now quantified
(median 0.432 of need, pantry not the limiter), the starvation mechanism
is now low-health + short away meal rather than prolonged away decline,
but no fix has landed and no deciding corpus under the governing
verdict system has run on the rot question. scale-onramp stays converging
(untouched; sibling loop A). Claim deleted; lock deleted.

Evidence: evidence/2026-10-24/sim-fullpantry-confirm-b.md,
evidence/2026-10-24/sim-awayration-size-b.md, this file.
Merged locally, pending ship.
