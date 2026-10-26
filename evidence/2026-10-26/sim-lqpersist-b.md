# sim-lqpersist-b — post-arrival persistence of Lamb's Quarters (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2029Z, axis
food-economy. Arm: 1930Z next blank 2 — a post-arrival persistence measure
for Lamb's Quarters, plus the mechanism separation (spoil timing vs
meal-draw order vs deposit frequency). Measurement only: zero src/js
changes, no default flips, no garden/throttle redesign. This arm does
NOT re-judge the 1930Z NO-GO verdict and does NOT re-litigate the gap
decomposition — its verdict is only the post-arrival persistence measure
and the mechanism separation below.

Pre-registration (written BEFORE any new sweep):
evidence/2026-10-26/sim-lqpersist-b-prereg.md. Judged ONLY against it.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Pilot seeds
  9760–9767, 100d, death-aware. Confirm seeds 9768–9779 (12 seeds),
  same band and instrument, run because the pilot verdict is GO
  (per the prereg's confirm rule).
- Instrument (DIAG only): scripts/inflow-capture.js,
  scripts/garden-capture.js, scripts/throttledays-capture.js,
  scripts/stock9762-capture.js, and scripts/mealdraw-capture.js reused
  UNCHANGED, plus the NEW scripts/lqpersist-capture.js installed AFTER
  stock9762-capture, which wraps resolveOneAssignment a further time
  and records, at entry to every garden resolution, a per-channel
  spoil/slab summary: freshKcal, spoiledKcal, stacks, slabFreshKcal
  (fresh kcal in stacks with kcalEach > 2000 — the pantryDraw slab
  line), and horizonMin/Med/Max (spoilDay − day over fresh stacks).
  No Game.state write, no RNG use, no say/log write. No sibling
  capture file was modified (proof checks this).
- Corpus: evidence/2026-10-26/sim-lqpersist-b-corpus/ (8 pilot per-seed
  JSONs) and evidence/2026-10-26/sim-lqpersist-b-corpus-confirm/ (12
  confirm per-seed JSONs). Scripts: scripts/sweep-lqpersist-b.js,
  scripts/lqpersist-capture.js, scripts/analyze-lqpersist-b.js.
  Proof: scripts/test-lqpersist-b.js (green, exit 0 — see below).
- Canon read: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned 2d
  < cooked 5d < smoked 30d < rendered 90d < pemmican 120d) + the
  pantryDraw code fact (spoilDay ascending, slabs > 2000 kcal ride
  last). Nothing invented.
- Base commit: recorded by the proof (git rev-parse HEAD at proof
  time); the pilot and confirm sweeps ran on this worktree's HEAD.
  No base move occurred between the pilot and confirm sweeps.

## Control reproduction: the gardenbar band, reproduced

All six gardenbar trajectory counts reproduce EXACTLY: 761 garden
resolutions, 750 engaged (98.6%), 11 NPC sows, 3,167 keeper turns,
32 beds, 235 player sows. The four throttle flags (garden,
throttledays, stock, lq) agree on all 761 resolutions (0 mismatches),
the snapshot rebuild (summed bucket freshKcal vs pantryFreshKcal())
agrees on all 761 resolutions (100.0%), and the new lq recorder's
freshKcal agrees with the stock recorder's on all 761 resolutions
(0 mismatches). The new recorders are neutral: they read, they do
not move the game.

## Before/after numbers (this arm changes no lever, so "after" is a reproduction)

Per-seed median freshKcal at engaged resolutions — before (1930Z
evidence) vs after (this run):

| seed | engaged | before | after |
|------|---------|--------|-------|
| 9760 | 85 | 30,297 | 30,297 |
| 9761 | 96 | 32,950 | 32,950 |
| 9762 | 99 | 89,967 | 89,967 |
| 9763 | 78 | 16,196 | 16,196 |
| 9764 | 99 | 44,608 | 44,608 |
| 9765 | 99 | 24,250 | 24,250 |
| 9766 | 98 | 17,310 | 17,310 |
| 9767 | 96 | 38,522 | 38,522 |

The decomposition reproduces exactly: totalGap 59,670 kcal; Lamb's
Quarters gap 32,150 (53.9%), Foraged food 12,829 (21.5%), Dried beans
11,250 (18.9%), Rice 2,800 (4.7%), Canned soup 1,000 (1.7%), Peanuts
1,020 (1.7%). (A "Winner's share (alien rations)" channel appears at
600 kcal / 1.0% in this run's full channel list — below the 1930Z
reporting cut, not a new finding.)

## Verdict against the pre-registered bar: GO

| leg | bar | result |
|-----|-----|--------|
| 1. Control reproduction exact | 761/750/11/3167/32/235 | exact ✓ |
| 2. Snapshot rebuild >= 99% + flags agree >= 99% | rebuild + agreement | 100.0% / 100.0% ✓ |
| 3. Post-arrival persistence >= 80% | LQ present on >= 80% of post-arrival engaged resolutions, seed 9762 | 79/80 = 98.8% ✓ |

Lamb's Quarters first appears on seed 9762 at day 21 (first engaged
resolution with LQ fresh > 0). Over the 80 post-arrival engaged
resolutions it is present on 79 — the single absence is day 23, the
same gap 1930Z reported ("absent on day 23, present on every engaged
day from day 24 on"). The band-start measure, reported alongside for
comparability only, reproduces 1930Z exactly: 79/99 = 79.8%. The
post-arrival measure passes by a wide margin (98.8% vs the 80% bar):
the 1930Z presence-leg failure was an artifact of counting 19
pre-arrival days, not a property of the stockpile. The 1930Z NO-GO
verdict stands under its own bar — this arm's GO is the post-arrival
verdict the 1930Z metric review proposed, not a re-score of 1930Z.

## Mechanism separation: UNDISTINGUISHED (no bar passes)

Comparators (fixed in the prereg): Cattail on 9761, Burdock on 9760.

| diagnostic | Lamb's Quarters (9762) | Cattail (9761) | Burdock (9760) | bar | passes? |
|------------|------------------------|----------------|----------------|-----|---------|
| Median horizon (raw spoilDay − day, per-resolution stack-median) | −1 | +1 | +2 | >= 2.0x pooled comparator median (2) = 4 | NO |
| Median slab share (slabFresh / fresh) | 0.000 | 0.000 | 0.000 | >= 0.50 | NO |
| Draw share vs stock share | 0.459 vs 0.365 (ratio 1.26) | 0.400 vs 0.107 | 0.135 vs 0.201 | draw <= 0.50x stock (0.183) | NO |
| Deposit-day coverage (window first→last deposit day) | 0.877 (129 events, days 20–100, median gap 1) | 0.463 (65 events, days 20–99, median gap 1) | 0.250 (29 events, days 21–100, median gap 4) | LQ >= 0.60 AND both comparators < 0.40 | NO |
| Median spoiled share of stock | 0.000 | 0.000 | 0.000 | (supporting only) | — |

Per the prereg's naming rule (name a mechanism iff EXACTLY ONE bar
passes), the mechanism is UNDISTINGUISHED — no bar passes, so none is
named. Each near-miss is informative, and none is forced:

- SPOIL TIMING fails on a raw-horizon bar that the game's own boundary
  undermines (see "metric review"): LQ's median raw horizon is −1,
  meaning its fresh stacks sit ~1 day past raw spoilDay at resolution
  entry yet still count as fresh — because isSpoiled is bonus-aware
  (spoilDay + spoilBonusDays <= scholar day; src/js/food.js). The
  comparators sit at +1/+2 raw. A 2.0x ratio on raw horizons near
  zero is meaningless, and the bar as written does not measure the
  boundary the game actually eats by. Spoil timing is NOT refuted —
  it is unmeasured by this bar. The next run needs a bonus-aware
  horizon (spoilDay + spoilBonusDays − day, with the bonus recorded
  at each resolution).
- MEAL-DRAW ORDER fails cleanly and directionally: LQ pieces are
  small (kcalEach ~40–50 in the draw records; the smoke record shows
  a 50-kcal LQ piece and a 40-kcal dried piece), so the slab share is
  0.000 — the slab-rides-last rule cannot be what shelters LQ. And
  meals do NOT skip LQ: its draw share (0.459 of all meal-drawn fresh
  kcal on 9762; 105,750 kcal meal-drawn + 17,500 kcal other-drawn)
  EXCEEDS its stock share (0.365). The "meals eat everything else
  first" version of draw order is refuted on this band: LQ is the
  most-eaten channel and still accumulates, because deposits
  (396,750 kcal) dwarf draws (123,250 kcal).
- DEPOSIT FREQUENCY fails narrowly and instructively: LQ covers
  0.877 of its deposit window, but Cattail covers 0.463 — above the
  bar's 0.40 comparator ceiling — so the bar's contrast condition
  fails. Frequency alone does not separate the persistent channel
  from a collapsing one: Cattail deposits on nearly half its days
  and still collapses.

The sharpest secondary contrast in the corpus (reported, not judged):
net inflow-minus-draw does NOT predict stocks either. Cattail's net
(+399,600 = 523,680 in − 107,040 meal-drawn − 17,040 other-drawn)
EXCEEDS LQ's net (+273,500 = 396,750 − 105,750 − 17,500), yet
Cattail's median stock is 3,600 (post-arrival) against LQ's 34,150.
The missing sink for Cattail must be a non-draw removal — spoiled
stacks swept out of the pantry (the 1930Z finding-7 class: kcal
vanishing without a recorded draw). Spoiled kcal sits at 0.000
median share for all three channels, so spoiled stock never lingers
long enough to be snapshotted: the sweep removes it between
snapshots. That sink — per-channel spoil-removal volume — is the
unmeasured quantity, and it is the next arm's question (see "metric
review"). Burdock's post-arrival presence (58/65 = 89.2%) also
passes the 80% post-arrival bar on its own seed, which warns against
reading the post-arrival measure as 9762-specific: it measures
persistence-after-arrival wherever a channel arrives mid-band.

Cross-checks (all clean): meal-context item-sum equals taken-sum
(230,403 = 230,403 on 9762); mealCall anchor (villager-home
freshTaken + spoiledGot == drawn) 596/596; drawSpoiled total got 0
(the desperation path never fired on 9762 either); no truncation on
either recorder.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Seed 9762, the arrival window and the ratchet, read from inflows +
meal draws + day-end snapshots together:

- Day 20: the first Lamb's Quarters arrives — 6,300 kcal deposited,
  1,650 kcal eaten at meals the same day, 6,300 kcal standing at
  day-end (the pantry held 42,860 total). The village tastes the new
  food the day it arrives; it does not hoard it untouched.
- Day 21: 1,600 in, 1,250 eaten, 2,700 standing. Day 22: nothing
  arrives, 1,450 eaten, 1,450 standing — the stock nearly winks out.
  Day 23: 7,700 arrives, nothing eaten, 7,700 standing — the one
  post-arrival absence in the resolution record (the stock was there
  by day-end, but no engaged resolution that day caught it present;
  the day-23 gap is a sampling-day artifact, not an empty pantry).
- Day 24 on: the ratchet. 3,000 in, 250 eaten, 10,700 standing;
  day 26: 9,750 in, 0 eaten, 14,200 standing; day 29: 12,500 in, 500
  eaten, 21,600 standing; day 41: 10,300 in, 1,150 eaten, 42,950
  standing. From day 24 the village never eats more than a fifth of
  what arrives on any day, and on most days eats nothing from LQ at
  all while the pile grows — not because meals refuse it (LQ is the
  single most-drawn channel over the band), but because the daily
  inflow is several times the daily appetite for it.
- The talk matches: every day the keeper waters and weeds ("The
  harvest can wait" — Eduardo, Farid, Wilhelm, Tyler, Luana, Liam
  rotating), and on 9762 that line is true in the strong sense:
  day-end fresh 77,006 (day 31) rising to 99,442 (day 41) while the
  raids keep coming (days 39/44, Thornfield/Stonebridge, plots
  trampled, Trust −10 each). The village reads like people with a
  full pantry and a trampled garden, not a static menu. One oddity
  carried from 1930Z, unchanged: the player keeps sowing Lamb's
  Quarters in beds while the pantry's Lamb's Quarters arrives as
  deposits — garden work and pantry stock run in parallel without
  meeting (plots never ripen).

## Village assessment

What the village looked like: identical to the 1930Z band (this is
that band, reproduced) — 8 villages surviving the full 100 days
around pantries that, on 7 seeds, read as full on the drain gauge
while holding 1–2 need-days of fresh food, and on 9762, a pantry
that actually is full (median ~90,000 fresh kcal). The new
knowledge is what the persistence looks like from inside: a drip
that starts on day 20, nearly dies on day 22, then ratchets past
30,000 kcal by day 41 and never looks back — eaten eagerly, outrun
by arrivals, never sheltered by a draw rule.

Who thrived and died and why: 18 deaths across 8 seeds, none of
them starvation (same cause shape as 1930Z): the arena 6, monster 4,
ambush 2, dehydration 2, a wound that wouldn't close 1, the
expedition 1, "big ugly" 1, "extended warranty" 1. Per seed: 9760: 0,
9761: 2, 9762: 2 (monster 1, the arena 1), 9763: 3, 9764: 1, 9765: 1,
9766: 5, 9767: 4. The deaths are contest/arena/monster-shaped, not
pantry-shaped.

What knowledge/capabilities were missing: the persistence mechanism
is still unmeasured (see below) — this arm narrowed it to the
spoil-removal sink, but did not measure that sink.

Blanks filled: (1) the post-arrival persistence measure itself —
LQ is present on 98.8% of post-arrival engaged resolutions, so the
1930Z presence-leg failure is diagnosed as a bar artifact, not a
stockpile property; (2) the slab hypothesis is dead (slab share
0.000, LQ pieces ~50 kcal); (3) the skip hypothesis is dead
(draw share exceeds stock share); (4) the frequency-contrast
hypothesis fails (Cattail deposits on 46% of its days and still
collapses); (5) inflow-minus-draw is ruled out as the explanation
(Cattail's net exceeds LQ's, stocks invert). Documented, not fixed:
no game-code change was made (DIAG only), and no prior evidence
needs numeric revision — 1930Z's numbers reproduce exactly.

## Reachability verdict

On this band (competent-nofeast, seeds 9760–9767, 100d): waves 1–3
reached (9760/9765/9766/9767 reach wave 3; 9761/9762/9763/9764 reach
wave 2); waves 4–5 reached on 0/8 seeds. Regional, national, table,
and wins: 0/8. Rank stayed village on all 8 seeds. Arc II/III/IV,
four-realm formation, trap acquisition, counter discovery/kill, and
young-link succession survival are not recorded in this corpus and
are not estimated here. The scale wall stands on this band; this arm
closes a measurement-meaning blank, it does not move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9760–9767)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach per
seed: 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2, 9765: 3, 9766: 3,
9767: 3. Median survival: 100d (censored at the 100d horizon; all 8
seeds survived to day 100). Deaths: 18 total (causes above).

## Confirm band (prereg rule: pilot GO → 12 seeds 9768–9779)

The pilot named no mechanism (UNDISTINGUISHED), so per the prereg
the confirm is DIAG-only — no PASS/FAIL, just the distribution.
Result: CONFIRM-DIAG.

Only 1 channel across all 12 confirm seeds qualifies (median fresh
share >= 10% of its seed's median total fresh AND first-appearance
day >= 10): Burdock on seed 9770 — first appearance day 34,
post-arrival engaged 67, present 58 (86.6%), median horizon 3
(pooled other-channel 6), slab share 0.000, draw share 0.070 vs
0.50x stock share 0.244, deposit coverage 0.250. All three
mechanism bars false for it, exactly as on the pilot band.

That single channel carries the generality point: Burdock — the
"pulse-collapse" comparator on the pilot band — itself passes the
80% post-arrival bar on a fresh seed (86.6%). The post-arrival
measure is a general persistence instrument, not a 9762 detector;
mid-band arrivals that stick around pass it wherever they occur.
The scarcity of qualifying channels is itself informative: on
these bands, almost every dominant channel is either starting
pantry (arrives day 1–2) or holds under 10% median share — the
mid-band-arrival dominant channel is the exception, not the rule.

Confirm wall: national / table / wins 0/12; wave-4/5 unlocks 0/12;
wave reach: 9768: 3, 9769: 3, 9770: 2, 9771: 2, 9772: 2, 9773: 3,
9774: 3, 9775: 3, 9776: 2, 9777: 2, 9778: 3, 9779: 3. Median
survival 100d (all 12 survived to day 100). Deaths 48 (arena 23,
monster 9, ambush 2, wound 3, hushpuppy 2, dehydration 1,
expedition 1, contest 2, nevermore 1, union rep 1, choir toad 1,
the night 1, the redactor 1). Rank village on all 12 seeds. The
scale wall stands on the confirm band too; the confirm never
overrides the pilot verdict (GO).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict follows
  from it: legs 1 and 2 pass exactly, leg 3 passes widely (98.8% vs
  80%). The post-arrival measure does the job the 1930Z metric
  review asked of it — it separates "arrived late" from "failed to
  persist." The band-start measure is kept alongside for
  comparability and reproduces 79/99 exactly.
- Bar A (spoil timing) is the metric that proves wrong, in a specific
  and fixable way: it measures RAW spoilDay − day, but the game
  eats and counts by a BONUS-AWARE boundary (isSpoiled: spoilDay +
  spoilBonusDays <= scholar day). LQ's median raw horizon of −1 does
  not mean LQ is spoiled — it means LQ's stacks sit inside the bonus
  window. Worse, a 2.0x ratio is unstable when the pooled comparator
  median is 2 days: a one-day shift flips the bar. Proposed revision
  for the NEXT run: record spoilBonusDays at each resolution and
  judge on bonus-aware horizons (spoilDay + bonus − day), with an
  absolute-difference bar (e.g. >= 5 days) instead of, or alongside,
  the ratio. This revision is proposed, NOT applied: this run's
  mechanism stays UNDISTINGUISHED under the bar as written.
- Bar C (deposit frequency) fails on its contrast clause, not on
  LQ's own coverage (0.877 is high by any reading). The 0.40
  comparator ceiling was set without knowing Cattail's coverage
  (0.463). A future frequency bar should be set from a stated
  contrast model (e.g. coverage gap >= 0.30) rather than an absolute
  ceiling on the comparator. Proposed, not applied.
- The unmeasured quantity, named for the NEXT arm: per-channel
  spoil-removal volume — kcal leaving the pantry without a recorded
  draw (sweep path). The corpus proves a sink of that class must
  exist (Cattail net +399,600 vs stock ~0; spoiled share 0.000
  everywhere), but no recorder in this run sits on the sweep path.
  A sweep-path capture (before/after the overnight spoil sweep, per
  channel) would separate "rotted away" from "never arrived" and is
  the sharpest next measurement for the persistence mechanism.
- No revision is proposed for legs 1–2 or leg 3: exact reproduction
  plus a 100% rebuild plus a post-arrival presence bar is the right
  strictness for a persistence arm.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever, so there is no before/after to panel. The
  reproduction check above is the control.

## Out-of-arm observations (for the coordinator's sim-findings backlog;
not chased, not edited into the backlog from this worktree)

- Spoil-removal sink: per-channel kcal removed by the overnight
  spoil sweep is unmeasured; it is the leading candidate for why
  Cattail collapses while LQ ratchets, given nets invert stocks.
  Needs a sweep-path capture arm.
- Bonus-aware horizon: the next persistence arm should record
  spoilBonusDays per resolution and judge spoil timing on
  bonus-aware horizons with an absolute-difference bar.
- Burdock post-arrival persistence (89.2% on 9760) passes the same
  80% bar as LQ — the post-arrival measure is a general persistence
  instrument, not a 9762 detector; the confirm band tests exactly
  this generality.
- Garden-deposit paradox (carried from 1930Z): all 129 LQ deposits
  are deposit-door events, yet the garden's own harvest channel is
  absent from every pantry snapshot (ripe == 0 throughout). Where
  garden-attributed deposits come from is still unanswered.

## Reproduction check (this run)

- Sweep scripts/sweep-lqpersist-b.js ran 8 pilot seeds + 12 confirm
  seeds, 100d, competent-nofeast; corpora at
  evidence/2026-10-26/sim-lqpersist-b-corpus/ (8 files) and
  evidence/2026-10-26/sim-lqpersist-b-corpus-confirm/ (12 files),
  pure JSON.
- Analyzer scripts/analyze-lqpersist-b.js prints reproduction,
  rebuild, flag agreement, the gap decomposition, GO legs, mechanism
  bars, secondaries, sense block, and wall numbers (pilot mode) and
  the qualifying-channel table + confirm line (confirm mode).
- Proof scripts/test-lqpersist-b.js green in this worktree, exit 0:
  corpus validity (8 files, policy fields, recorders, no
  truncation), reproduction exact (761/750/11/3167/32/235), rebuild
  100.0%, flags 100.0%, independent GO recomputation (post-arrival
  79/80; bars A/B/C all false; verdict GO; mechanism
  UNDISTINGUISHED) agreeing with the analyzer's printed lines,
  determinism (fresh seed-9760 re-run reproduces the corpus file
  exactly except `ms`), and hygiene (0 src/js files modified, 0
  sibling capture files modified, no modified tracked files). No
  jest was run (nothing to test in jest — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files touched. Files in this
  commit: scripts/lqpersist-capture.js, scripts/sweep-lqpersist-b.js,
  scripts/analyze-lqpersist-b.js, scripts/test-lqpersist-b.js,
  evidence/2026-10-26/sim-lqpersist-b-prereg.md,
  evidence/2026-10-26/sim-lqpersist-b.md, and the 8 + 12 corpus
  files.

## Verdict (judged against the pre-registered bar, not re-scored): GO

Legs 1 (reproduction exact) and 2 (rebuild 100.0%, flags 100.0%)
pass; leg 3 (post-arrival persistence >= 80%) passes at 98.8%
(79/80 post-arrival engaged resolutions, first appearance day 21).
The mechanism is UNDISTINGUISHED under the pre-registered bars: no
bar passes, so none is named. The 1930Z NO-GO verdict stands under
its own band-start bar; this arm's GO is the post-arrival verdict
the 1930Z metric review proposed. The next measurement for the
persistence mechanism is the per-channel spoil-removal sink
(sweep-path capture), with bonus-aware horizons as the corrected
spoil-timing instrument.
