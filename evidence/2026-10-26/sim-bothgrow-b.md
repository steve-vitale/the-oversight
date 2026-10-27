# sim-bothgrow-b — the both-grow screen + the re-barred sink case study (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0049Z, axis
food-economy. Arm: the cattailband metric review's named next blank —
either a both-grow band screened under its own prereg, or the
re-barred single-seed case-study metric it proposed. Measurement
only: zero src/js changes, no default flips, no lever. This arm
does NOT re-judge the spoilvol DIAG-NO-GO, the cattailband
DIAG-NO-GO, or the lqpersist GO — its verdict is ONLY the
CASE-DIAG judgment below, against its pre-registration
(evidence/2026-10-26/sim-bothgrow-b-prereg.md, committed BEFORE
any judged sweep as 7f7b51387).

## Verdict against the pre-registered CASE-DIAG metric: CASE-DIAG-SUPPORTS

The paired single-seed contrast SUPPORTS the sink hypothesis — with
the single-seed caveat stated in this sentence, as the prereg
requires: this is a CASE-DIAG on two seeds, not a pooled GO, and it
does NOT overturn, confirm, or replace the cattailband DIAG-NO-GO
on the pooled bar, the spoilvol DIAG-NO-GO, or the lqpersist GO.

| leg | bar | result |
|-----|-----|--------|
| 1. Neutrality / det-gate | SPOILVOL=0 vs 1 identical on inflow/mealdraw/deaths/wall (seed 9761) | byte-identical ✓ (mealDraw 1464, inflows 266, deaths 2 both runs) |
| 2. Sweep integrity | removedNotSpoiledKcal == 0 AND keptSpoiledKcal == 0 across all re-run sweeps | 0/0 over 799 sweeps ✓ |
| 3a. Case contrast, share gap | Cattail-9761 share-of-uneaten exceeds LQ-9762 share-of-uneaten by >= 10pp | 84.2% vs 58.8% = 25.4pp ✓ |
| 3b. Case contrast, volume | Cattail-9761 sweep kcal >= LQ-9762 sweep kcal | 336,480 >= 160,800 ✓ |

No re-scoring was done: no switch to revision (b), no pooled
volumes as a leg, no Burdock-as-comparator, no means, no raw
spoilDay, no substitution of the published numbers. This re-run's
numbers govern — and they reproduce the published numbers exactly
(see "Determinism"), so there is no drift to report either way.

## Step 1 — the screen (FINAL: no qualifying both-grow band exists)

Screen rule (prereg-fixed): within ONE existing committed corpus
directory, BOTH Cattail and Lamb's Quarters grow on >= 2 seeds
each (>= 1 inflow record on that seed, recorder honesty rules).
Every inflow-carrying corpus screened, all FAIL: lqpersist pilot
9760–9767 (Cat 2 / LQ 1), lqpersist confirm 9768–9779 (0/0),
spoilvol pilot 9820–9827 (Cat 0 / LQ 2), cattailband re-run and
three other 9760–9767 re-observations (Cat 2 / LQ 1), 9750–9757
corpora (Cat 1 / LQ 0), smoke-eq confirm 9780–9795 (Cat 0 / LQ 4
— closest LQ picture anywhere, still no band). All other corpus
directories carry no `inflows` array and are not countable under
the rule. The pooled comparison as originally barred has no band
to run on. NO fresh band was screened and NO fresh seed was
spent on this arm, full stop.

## Step 2 — the ONE revision chosen

Revision (a) from the cattailband metric review: the paired
single-seed case study, 9761 Cattail against 9762 LQ, judged as
CASE-DIAG with the caveat in the verdict. Revision (b) (re-bar
leg 3 to >= 1 seed + >= 100,000 kcal, judge pooled leg 4) was
rejected in the prereg and is NOT judged here in any form:
pooled figures below appear only as clearly-labeled supporting
arithmetic, never as a pass.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. PAIRED REUSE
  of the lqpersist band 9760–9767, re-run with the spoilvol
  capture instrument into this arm's own corpus directory.
  Horizon 100d, death-aware; all 8 seeds survived to day 100.
- Instrument (DIAG only): scripts/sweep-spoilvol-b.js,
  scripts/spoilvol-capture.js, scripts/inflow-capture.js, and
  scripts/mealdraw-capture.js reused UNCHANGED, plus the NEW
  scripts/analyze-bothgrow-b.js and scripts/test-bothgrow-b.js
  (proof). No sibling capture file modified. Corpus:
  evidence/2026-10-26/sim-bothgrow-b-corpus/ (8 per-seed JSONs).
- Canon read: docs/CANON.md + docs/PRESERVATION.md (ladder:
  cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican
  120d), plus both cattailband files and the spoilvol evidence.
  Nothing invented.
- Base commit pinned: prereg parent e69842153; the judged
  re-run ran on the worktree HEAD after the prereg commit with
  no other commit in between. NOTE (recovery, see below): the
  re-run's second half (9764–9767) was executed by the
  coordinator after the container write flap lifted, on the
  same worktree HEAD, with the unchanged instrument — the base
  for the judgment is unchanged; only the operator changed.

## Recovery note (reported, not hidden)

A container-wide write(2) EPERM flap blocked every file-data
write from ~01:11 UTC to ~02:52 UTC (~101 min; prior precedents
were 11 and 20+ min). The worker's first-half corpus (9760–9763)
landed before onset; its second-half stdout payloads
(9764–9767) were captured in memory twice but never landed,
and were lost when the worker's round-2 driver was killed on
cron timeout (SIGTERM). The coordinator verified the flap had
lifted with direct data-write probes (evidence/, scripts/,
/tmp, ~/workspace — all WRITE-OK), then re-ran seeds
9764–9767 in file mode with the unchanged instrument. The
re-run reproduced the worker's stdout picture exactly on
wave/deaths (9764 wave 2 deaths 1; 9765 wave 3 deaths 1; 9766
wave 3 deaths 5; 9767 wave 3 deaths 4), and the analyzer's
determinism cross-check vs the cattailband corpus is 0
differing inflow channels on all 8 seeds. Nothing was
re-scored, re-barred, or substituted in recovery: the prereg,
the instrument, and the legs are the worker's, untouched.

## What was measured: the case study

### Per-seed per-channel table (this re-run; medPostDayEnd = median post-arrival day-end stock, the named basis)

| seed | channel | inflow (recs) | meal-drawn | other-drawn | sweep | medPostDayEnd |
|------|---------|---------------|------------|-------------|-------|---------------|
| 9760 | Burdock | 147,870 (29) | 33,300 | 630 | 75,780 | 14,670 |
| 9760 | Blackberry | 108,485 (25) | 35,555 | 4,160 | 49,530 | 4,160 |
| 9761 | Cattail | 523,680 (65) | 107,040 | 17,040 | 336,480 | 20,040 |
| 9762 | Lamb's Quarters | 396,750 (129) | 105,750 | 17,500 | 160,800 | 40,850 |
| 9762 | Burdock | 990 (1) | 0 | 0 | 0 | 990 |
| 9763 | Muscadine Grapes | 49,680 (20) | 4,140 | 360 | 14,400 | 900 |
| 9764 | Burdock | 100,980 (41) | 12,690 | 810 | 48,600 | 7,290 |
| 9764 | Snared meat | 11,294 (42) | 1,008 | 0 | 6,633 | 755 |
| 9765 | Expedition haul | 21,128 (10) | 5,299 | 500 | 5,992 | 1,714 |
| 9767 | Expedition haul | 20,122 (4) | 4,622 | 0 | 10,500 | 6,651 |
| 9767 | Cattail | 2,880 (6) | 2,400 | 240 | 0 | 720 |

(Foraged food rows omitted from this table for length; its
residuals run +114,452 to +290,472 per seed — the known
stockSurplus shape, the stockdoors arm's territory, not
re-litigated here. Full per-seed tables, including Foraged
food, print from scripts/analyze-bothgrow-b.js.)

Appearance (this re-run's inflow records): Cattail 2/8, LQ 1/8,
Burdock 3/8 — identical to the prior-knowledge picture, no
base-move drift.

### Case contrast (the judged legs)

| figure | 9761 Cattail | 9762 LQ |
|--------|--------------|---------|
| inflow | 523,680 | 396,750 |
| draws (meal + other) | 124,080 | 123,250 |
| sweep | 336,480 | 160,800 |
| share of inflow | 64.3% | 40.5% |
| share of uneaten (sweep / (inflow − draws)) | 84.2% | 58.8% |
| median post-arrival day-end stock | 20,040 | 40,850 |

Gap 25.4pp (bar >= 10pp); sweep 336,480 >= 160,800. The
published cattailband numbers reproduce EXACTLY on both
seeds — this re-run is a reproduction, not a revision.

### (Dried)-family ledgers (supporting, not a leg)

9761 Cattail family: inflow 523,680, draws 153,711, sweep
351,712, share-of-uneaten 95.1%. 9762 LQ family: inflow
396,750, draws 143,170, sweep 167,020, share-of-uneaten 65.9%.
Dried-variant inflow is 0 on both — dried stock still enters
with NO door record (the driedpath instrument's known gap,
not this arm's question).

### Bonus and secondary figures

799 sweeps; bonus distribution {0: 481, 2: 133, 6: 185},
median 0, max 6. Bonus-saved standing pantry pile per sweep:
median 0, max 71,568 — a STANDING pile re-counted each sweep,
never summed as volume. Pack sweep-removal 298,742, prep
27,325, corpse 0 (secondary; never mixed into pantry volume).

## Determinism (base-move drift check)

Per-seed per-channel inflow totals of this re-run vs the
cattailband corpus: 0 differing channels on all 8 seeds.
The corpus-9761 counts reproduce via the det-gate run
(1464/266/2). No drift, no hidden trajectory move.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

9761 Cattail reads as a sawtooth, not a stockpile: big pulses
arrive (28,680 on day 23; 36,120 on day 26; 35,760 on day 29),
the village eats ~3,000 a day off each pulse, and then the
whole remainder rots at once — 14,640 swept day 25, 22,560
day 28, 24,600 day 31 — leaving the rack at the post-sweep
floor (the lqpersist "median 3,600" is that floor, not the
day-end median of 20,040). Late in the run the same shape
repeats smaller: day 71 standing 37,920, day 72 sweep 32,880
leaving 3,600, day 75 the last 3,600 swept. The village does
eat Cattail — 107,040 meal-drawn — but it eats it faster
than it can keep it, and every pulse ends the same way.

9762 Lamb's Quarters reads as the opposite story: a drip
that never stops (129 deposits from day 20) and a pile that
ratchets — 21,600 by day 29, 42,950 by day 41, 56,300 by day
74, 46,550 still standing at day 100. It rots too (160,800
swept), but in daily thousands, never in whole-pile
clear-outs, and the next deposit always arrives before the
pile empties. The difference between the two villages is not
appetite — draws are nearly identical (124,080 vs 123,250)
— it is arrival shape: pulses rot, drips persist.

The spoil voice knows the difference only as loss: 9761's
first spoil line, day 5: "Overnight, unknown shoots went bad
— beyond saving. You leave it for the flies." First Cattail
line, day 6: "Overnight, Cattail; unknown nuts went bad —
beyond saving. You leave them for the flies." 67 of 112
spoil lines on 9761 mention Cattail. 9762's first spoil
line, day 9, is the same unknown-shoots sentence. The voice
names what rotted; it never says why the pile keeps
collapsing, and it never suggests smoking the pulse — the
voice-without-action blank, third sighting, carried (not
re-judged here).

## Village assessment

What the village looked like: 8 villages surviving the full
100 days around pantries that mostly hold Foraged-food
surplus piles (residuals +114k to +290k — the unrecorded
stockSurplus door, still open at this arm's writing) plus
one named channel each that tells its own story. Rank stayed
village on all 8 seeds; no seed approached regional, let
alone national.

Who thrived and died and why: 18 deaths across 8 seeds
(9760: 0, 9761: 2, 9762: 2, 9763: 3, 9764: 1, 9765: 1, 9766: 5,
9767: 4) — the arena 6, monster 4, ambush 2, dehydration 2,
a wound that wouldn't close 1, the expedition 1, big ugly 1,
extended warranty 1. No death is starvation-shaped.

What knowledge/capabilities were missing: a both-grow band
(there is none in any existing corpus); a pooled sink
comparison (barred, twice, by appearance); and any voice
that turns a rot event into a preservation action.

Blanks filled: (1) the screen is now exhaustive over
inflow-carrying corpora — the pooled comparison as barred
has no band to run on, stated finally rather than left as a
hope; (2) the sink hypothesis now carries a judged
single-seed contrast, CASE-DIAG-SUPPORTS, on reproduced
numbers — Cattail's uneaten share exceeds LQ's by 25.4pp
and its swept volume is more than double. Documented, not
fixed: no game-code change was made (DIAG only), and no
prior verdict is revised — cattailband's pooled DIAG-NO-GO
stands under its own prereg.

## Reachability verdict

On this band (competent-nofeast, seeds 9760–9767, 100d):
waves 1–3 reached (wave 3 on 9760/9765/9766/9767, wave 2 on
the rest); waves 4–5 reached on 0/8 seeds. Regional,
national, table, and wins: 0/8. Rank stayed village on all
8 seeds. Arc II/III/IV, four-realm formation, trap
acquisition, counter discovery/kill, and young-link
succession survival are not recorded in this corpus and are
not estimated here. The scale wall stands on this band;
this arm measures a spoil sink, it does not move the wall
numbers.

## Wall numbers (this band, competent-nofeast, seeds 9760–9767)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach per seed: 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2,
9765: 3, 9766: 3, 9767: 3. Median survival: 100d (censored
at the 100d horizon; all 8 seeds survived to day 100).
Deaths: 18 total (causes above).

## Confirm band: NONE

Per the prereg, a case study is not a GO and takes no
confirm. No confirm band is spent under any outcome, and no
fresh seed was spent under any outcome.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the
  verdict follows from it: leg 1 passes byte-identically,
  leg 2 passes exactly (0/0 over 799 sweeps), leg 3 passes
  with margin (25.4pp vs a 10pp bar; 336,480 vs 160,800).
  No re-scoring was done (no revision (b), no pooled leg,
  no Burdock comparator, no means, no raw spoilDay, no
  substitution of published numbers — which in any case
  reproduce exactly).
- Bar lesson for the NEXT run: the case-study framing does
  what the pooled bar could not — it names the limitation
  instead of lowering a bar past it. But a single-seed
  contrast is still a single-seed contrast: the 25.4pp gap
  could still be a seed effect (9761's pulse shape) rather
  than a channel effect, and this verdict does not
  distinguish those. The next run that wants a channel
  claim needs either a both-grow band (none exists in any
  corpus — a fresh-band screen would be a new prereg with
  its own seed budget, not a quiet spend) or a mechanism
  argument (why pulses rot and drips persist) tested
  directly, not another contrast.
- Definition lesson (carried, not new): NEVER quote a stock
  median without its snapshot basis. This arm's day-end
  medians (Cattail 20,040; LQ 40,850) and lqpersist's
  post-sweep floor (Cattail 3,600) are different statistics;
  interchanging them reverses the apparent story (Cattail
  looks collapsed on the floor, merely lower on day-end).
- Instrument lesson: the recovery worked because the
  corpus is deterministic and the instrument is unchanged
  — a re-run after a flap reproduces byte-comparable
  numbers. The flap itself (101 min, container-wide,
  EPERM on data writes in every directory probed) is the
  longest of its class yet; the recovery pattern (probe
  data writes, not file creation; re-run; verify via the
  determinism cross-check) held.
- Balanced panel (MEASUREMENT.md §15): NO comparison
  exists — this arm changes no lever and no game code, so
  there is no before/after to panel. The det-gate (leg 1)
  is the before/after comparison: identical records with
  the instrument off vs on.

## Out-of-arm observations (for the coordinator's sim-findings backlog; not chased)

- Foraged-food residuals (+114k to +290k per seed) persist
  on this band exactly as in driedpath — the stockSurplus
  door, the stockdoors arm's question, not this arm's.
- Dried-variant inflow is 0 on both case seeds — dried
  stock still enters with no door record.
- Voice without action, third sighting: 67/112 spoil lines
  on 9761 mention Cattail while whole pulses rot, with no
  line suggesting the racks.

## Reproduction check (this run)

- Sweep scripts/sweep-spoilvol-b.js ran 8 pilot seeds, 100d,
  competent-nofeast (9760–9763 by the worker pre-flap,
  9764–9767 by the coordinator post-flap, same worktree
  HEAD, unchanged instrument); corpus at
  evidence/2026-10-26/sim-bothgrow-b-corpus/ (8 files, pure
  JSON).
- Analyzer scripts/analyze-bothgrow-b.js prints per-seed
  per-channel tables, appearance, CASE-DIAG legs, bonus
  statistics, wall numbers, determinism cross-check, and
  the sense block.
- Proof scripts/test-bothgrow-b.js green, exit 0:
  det-gate byte-identical (1464/266/2 both runs), corpus
  8 files with competent-nofeast policy fields and no
  truncation, spoil records present, corpus-9761 counts
  reproduced by the det-gate run, leg 2 integrity 0/0 over
  799 sweeps, leg 3a gap 25.4pp, leg 3b 336,480 >= 160,800,
  determinism 0 differing channels vs cattailband, and
  hygiene (0 src/js files modified, 0 sibling capture
  files modified). No jest was run (nothing to test in
  jest — the proof is node, not jest). No [needs-eyes]:
  this lands a measurement, not a player-visible change.
- No game-code change: zero src/js files touched. Files
  in this arm's commits: prereg commit 7f7b51387
  (evidence/2026-10-26/sim-bothgrow-b-prereg.md), plus
  the evidence commit (scripts/analyze-bothgrow-b.js,
  scripts/test-bothgrow-b.js,
  evidence/2026-10-26/sim-bothgrow-b.md, and the 8 corpus
  files).
- Infrastructure notes (loud): the safe-commit
  index-clobber variant hit the prereg commit (repaired
  via HEAD-blob cacheinfo by the worker, commit verified
  as exactly 1 file); the container write flap blocked
  all file-data writes ~01:11–02:52 UTC (see Recovery
  note); no ref surgery was performed at any point.

## Verdict (judged against the pre-registered bar, not re-scored): CASE-DIAG-SUPPORTS

Leg 1 (det-gate byte-identical), leg 2 (integrity 0/0 over
799 sweeps), leg 3a (share gap 25.4pp >= 10pp), leg 3b
(336,480 >= 160,800) all pass. The single-seed contrast
supports the sink hypothesis: on reproduced numbers,
Cattail's uneaten share (84.2%) exceeds Lamb's Quarters'
(58.8%) by 25.4 points. Single-seed caveat stated in the
verdict: this does not overturn the cattailband pooled
DIAG-NO-GO, and it does not prove a channel effect over a
seed effect.
