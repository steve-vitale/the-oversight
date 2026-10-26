# sim-cattailband-b — spoil-sink comparison on the paired-reuse band 9760–9767 (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2309Z, axis
food-economy. Arm: the spoilvol sink-comparison blank — the 2130Z
spoilvol run ended DIAG-NO-GO because Cattail grew on 0/8 fresh-band
seeds (9820–9827), so its sink-ratio leg was UNMEASURED. This arm runs
that comparison on the Cattail-growing substrate the spoilvol metric
review named: paired reuse of the lqpersist band 9760–9767. Measurement
only: zero src/js changes, no default flips, no lever. This arm does NOT
re-judge the spoilvol DIAG-NO-GO or the lqpersist GO — its verdict is
ONLY whether spoil-removal volume explains the Cattail collapse, judged
ONLY against its pre-registration
(evidence/2026-10-26/sim-cattailband-b-prereg.md, committed BEFORE any
sweep as 72866d03c).

## Verdict against the pre-registered bar: DIAG-NO-GO

| leg | bar | result |
|-----|-----|--------|
| 1. Neutrality / det-gate | SPOILVOL=0 vs 1 identical on inflow/mealdraw/deaths/wall | byte-identical ✓ |
| 2. Sweep integrity | pantry removedNotSpoiledKcal = 0 AND keptSpoiledKcal = 0 | 0 / 0 across 799 sweeps ✓ |
| 3. Appearance | Lamb's Quarters AND Cattail each grow on >= 2 pilot seeds | LQ 1/8, Cattail 2/8 ✗ |
| 4. Sink bar | (a) Cattail sweep >= 1.5x LQ sweep AND (b) Cattail sweep >= 50% of Cattail (inflow − draws) | UNMEASURED — leg 3 bars it |

The ratio leg is UNMEASURED, not failed: Lamb's Quarters grows on only
one seed of the reuse band (9762), so the pooled Cattail-vs-LQ
comparison the prereg demands cannot be judged — a "pooled" ratio
over a single LQ seed would be a single-seed contrast wearing a
pooled bar's clothes, and the prereg forbids exactly that. Per the
prereg, a channel that grows on 0–1 seeds is a finding, not a zero,
and never a GO. The fallback band was NOT triggered (Cattail grew on
2 seeds, meeting the fallback trigger's >= 2 condition), so no fresh
seed was spent. No confirm band is spent: the pilot is DIAG-NO-GO,
and no second Cattail-growing substrate is established anyway (the
lqpersist confirm band 9768–9779 shows Cattail inflow 0 on all 12
seeds). Seeds 9828–9839 remain unspent, as they must.

Supporting arithmetic (NOT judged — recorded so the next run can see
it, never claimed as a leg result): pooled Cattail sweep 336,480 vs
pooled LQ sweep 160,800 gives ratio 2.09 (bar 1.50) and Cattail sweep
share of Cattail (inflow − draws) 336,480 / 399,840 = 0.842 (bar
0.50). Both numbers lean the way the sink hypothesis predicts — but
the LQ pool is one seed, so under the prereg these numbers are not
a pass, not a GO, and not evidence the bar was met. They are the
reason the metric review below proposes a revised comparison for the
NEXT run instead of declaring victory here.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Pilot seeds
  9760–9767, 100d, death-aware. Substrate: PAIRED REUSE of the
  lqpersist band, stated intent in the prereg (a fresh band is the
  wrong substrate for a channel-specific comparison — spoilvol proved
  that at 0/8). The re-run is a deterministic re-run of the same
  instrument on the same seeds, not a fresh band: no new seed spent.
- Instrument (DIAG only, reused UNCHANGED): scripts/sweep-spoilvol-b.js,
  scripts/spoilvol-capture.js, scripts/inflow-capture.js,
  scripts/mealdraw-capture.js — all committed by the spoilvol run, none
  modified here (proof checks this). The sweep was invoked with
  SEEDS=9760..9767 and PERSEED_DIR pointed at this arm's own corpus
  directory; neither the spoilvol corpus nor the lqpersist corpus was
  overwritten.
- Corpus: evidence/2026-10-26/sim-cattailband-b-corpus/ (8 per-seed
  JSONs). Scripts: scripts/analyze-cattailband-b.js (new),
  scripts/test-cattailband-b.js (new, proof, green — see below).
- Canon read: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned 2d
  < cooked 5d < smoked 30d < rendered 90d < pemmican 120d) + the
  spoilvol prereg's code audit inherited unchanged (bonus-aware
  isSpoiled boundary, sweepSpoiled as the sole pantry spoil path,
  pantryDraw skips spoiled). Nothing invented.
- Base commit: prereg commit 72866d03c; the pilot and det-gate runs
  ran on this worktree's HEAD, no base move.
- Corpus-gap verification (before the prereg): the lqpersist corpus
  files carry NO spoilvol records (key inspection: no `spoilEvents`,
  no `spoilDays`), so the sink volumes for 9760–9767 did not exist
  anywhere before this re-run.

## Control: the det-gate (leg 1) + determinism reproduction

Seed 9761 run twice (SPOILVOL=1 vs SPOILVOL=0, stdout-JSON mode):
inflow records, mealdraw records, death lists, and wall fields are
BYTE-IDENTICAL excluding spoilvol fields and `ms`. The SPOILVOL=1
det-gate run also reproduces the corpus seed-9761 counts exactly
(mealDraw 1464, inflows 266, deaths 2). The recorders are neutral:
they read, they do not move the game.

Stronger still, the re-run reproduces the lqpersist corpus EXACTLY on
inflow: per-seed per-channel inflow totals differ on 0 channels on
all 8 seeds (proof cross-check). Deaths per seed match lqpersist
exactly too (9760: 0, 9761: 2, 9762: 2, 9763: 3, 9764: 1, 9765: 1,
9766: 5, 9767: 4), as does wave reach. The reuse substrate is not
approximately the lqpersist band — on inflow, deaths, and waves it
IS the lqpersist band, re-observed with the spoil recorder added.

## What was measured: the Cattail sink, on the seed where it grows

Per-seed per-channel table (inflow / meal-drawn / other-drawn /
sweep-removed / median post-arrival day-end stock; channels with
inflow >= 10,000 kcal or focal):

| seed | channel | in | meal | other | sweep | medPost |
|------|---------|----|------|-------|-------|---------|
| 9760 | Burdock | 147,870 | 33,300 | 630 | 75,780 | 14,670 |
| 9760 | Blackberry | 108,485 | 35,555 | 4,160 | 49,530 | 4,160 |
| 9761 | Cattail | 523,680 | 107,040 | 17,040 | 336,480 | 20,040 |
| 9762 | Lamb's Quarters | 396,750 | 105,750 | 17,500 | 160,800 | 40,850 |
| 9763 | Muscadine Grapes | 49,680 | 4,140 | 360 | 14,400 | 900 |
| 9764 | Burdock | 100,980 | 12,690 | 810 | 48,600 | 7,290 |
| 9767 | Cattail | 2,880 | 2,400 | 240 | 0 | 720 |

Pooled focal channels: Cattail grows on 2 seeds (9761, 9767):
inflow 526,560, draws 126,720, sweep 336,480. Lamb's Quarters grows
on 1 seed (9762): inflow 396,750, draws 123,250, sweep 160,800.
Burdock grows on 3 seeds (9760, 9762-trickle, 9764): inflow 249,840,
draws 47,430, sweep 124,380.

On 9761 itself, the sink is the dominant Cattail flow: 523,680 kcal
arrives, 124,080 is eaten, 336,480 rots in the sweep (64% of inflow;
84% of inflow-minus-draws on that seed alone: 336,480 / 399,600).
The village eats roughly a quarter of the Cattail it takes in and
throws away nearly two-thirds. On 9767, the other Cattail seed, the
trickle (2,880 in) is eaten almost entirely (2,640 drawn, 0 swept)
— small piles get eaten, big pulses rot. That contrast is the
spoilvol band's lesson repeated: the sink is inflow rate vs rot
rate, not a property of the channel name.

## Bonus-aware horizons (the 2029 metric review, honored)

- spoilBonusDays() across 799 pilot sweeps: 0 on 481 sweeps, 2 on
  133, 6 on 185 (median 0). Same 0/2/6 block structure as spoilvol's
  band (799 sweeps there too — a coincidence of the shared 100d
  horizon, not the same sweeps).
- Bonus-saved standing piles (post-sweep stacks with raw horizon
  <= 0 but bonus-aware horizon > 0): median 0 per sweep across the
  band, max 71,568 on a single sweep. Reported as a STANDING pile
  per sweep, never summed as volume.
- Every removed stack had bonus-aware horizon <= 0 by construction
  (violations 0). Judged ONLY on bonus-aware horizons, as the
  prereg requires; no raw-spoilDay bar was used anywhere.

## The (dried) family ledger closes again

Base-name ledgers do NOT close (9761 Cattail residual −62,160;
9762 LQ residual −66,150) — for the same named reason spoilvol
found: base stock is transformed into (dried) stock, which is then
drawn and swept under the dried name. The FAMILY ledger (base +
' (dried)') closes:

| family (seed) | inflow | draws | sweep | net | last family stock | family residual |
|---------------|--------|-------|-------|-----|------------------|-----------------|
| Cattail (9761) | 526,560 | 156,351 | 351,712 | 18,497 | 16,192 | −2,305 (0.4%) |
| Lamb's Quarters (9762) | 396,750 | 143,170 | 167,020 | 86,560 | 86,000 | −560 (0.1%) |

The remaining residuals are second-order (raid/direct-push effects),
not sweep error — the sweep itself is exact (violations 0). This
re-confirms spoilvol's ledger lesson on a second band: judge sink
comparisons on families, not base names, and capture the (dried)
transformation path before trusting any base-name residual.

Secondary sweep totals (never mixed into pantry volume): pack
298,742 kcal, prep counter 27,325 kcal, corpses 0 kcal across the
band. Sweep edge note: seed 9760 records 99 sweeps vs 100 on every
other seed — the same one-dawn boundary effect spoilvol saw on
9827, not a missing measurement.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Seed 9761, Cattail day by day (arrived / eaten / rotted / standing,
from inflow + draw + sweep + day-end snapshots together; a day with
no Cattail stacks at day-end reads as standing 0):

- Day 20: 6,000 arrives, 2,760 eaten, 6,000 standing — the village
  tastes the new food the day it arrives.
- Day 23: 28,680 arrives, 3,120 eaten, 28,680 standing — a pulse
  dwarfs appetite, and the pile holds for a day.
- Day 25: nothing arrives, nothing eaten, 14,640 rotted, standing
  0 — the first zeroing. The pile does not decline; it vanishes.
- Day 26: 36,120 arrives, 2,160 eaten, 36,120 standing — arrivals
  rescue the pile the very next day, and the sawtooth is set.
- Days 28/31: 22,560 then 24,600 rotted, standing 0 each time —
  the pattern repeats: big arrival, small eating, whole-pile rot.
- Days 40–52: the mature sawtooth — arrivals of 9,480–20,520 every
  day or two, eating ~3,000/day, sweeps of 4,320–17,520, standing
  pinned at 30,000 then cut to 19,200, back to 30,000. The pile
  never settles; it breathes between a cap and a cut.
- Day 58: 31,680 rotted, standing 3,600 — the recurring post-sweep
  floor. (This 3,600 is the same floor lqpersist's
  resolution-time snapshots reported as Cattail's "median stock":
  different snapshot basis, same floor — the pile's resting state
  after a big rot day, not its typical day-end state, which this
  arm measures at median 20,040.)
- Day 72: 32,880 rotted, standing 3,600 again; day 75: the last
  3,600 rotted, standing 0. Days 79–99: a trickle (1,080, 120, 240,
  960) that the village mostly leaves alone, ending at 960.

Judgment: the collapse reads sensically as a pantry that can only
hold a pulse for a day or two — food arrives faster than appetite,
the village eats what it wants, and the rest rots whole. What does
NOT read as people behavior is the same gap spoilvol found: the
voice names the loss and the fix, and nothing changes.

The voice, verbatim from the corpus (61 "threw out spoiled stores"
lines on 9761):

> Day 25: "The village threw out spoiled stores: Cattail, Foraged
> food. Chloe mutters about the smoke rack going cold. (pantry)"
>
> Day 28: "The village threw out spoiled stores: Cattail, Foraged
> food, Snared meat. Pavel kicks the ash pile. The smoke rack stays
> empty. (pantry)"
>
> Day 29: "The village threw out spoiled stores: Foraged food.
> Sigrun gives the smoke rack a long look, then walks off. (pantry)"

Three days, three villagers, three versions of noticing — and the
rack stays empty while 336,480 kcal of Cattail rots. The village
names the loss every time, teaches the fix, and never uses it.
That is people behavior in the voicing and a design gap in the
response, exactly as spoilvol reported on its band.

## Village assessment

What the village looked like: the same 8 villages lqpersist
watched, re-observed — all 8 survive the full 100 days around
pantries that churn: on most seeds the dominant flow is not eating
but spoiling (9764 Foraged food: 241,057 rotted vs 71,597 eaten;
9761 Foraged food: 136,393 rotted vs 104,024 eaten). Rank stayed
village on all 8 seeds; no seed approached regional, let alone
national.

Who thrived and died and why: 18 deaths across 8 seeds, identical
in count and cause shape to lqpersist (same band, deterministic
reproduction): the arena 6, monster 4, ambush 2, dehydration 2, a
wound that wouldn't close 1, the expedition 1, "big ugly" 1,
"extended warranty" 1. No death is starvation-shaped — villages rot
food while nobody starves, the churn story from the other side.

What knowledge/capabilities were missing: the barred pooled
comparison itself (this band grows LQ on only 1 seed); a band
where Cattail and LQ both grow on >= 2 seeds (none known — the two
channels grow on DISJOINT seeds on this band: Cattail 9761/9767,
LQ 9762); and any answer to why a village that mutters about the
smoke rack 61 times never smokes the pile.

Blanks filled: (1) the Cattail sink volume is now MEASURED on a
Cattail-growing seed — 336,480 kcal swept on 9761, the dominant
Cattail flow, with zero sweep violations; (2) the reuse substrate
is proven identical to lqpersist on inflow (0 differing channels
on all 8 seeds), deaths, and waves — paired reuse is sound, not
approximate; (3) the (dried)-family ledger rule re-confirmed on a
second band (family residuals −2,305 and −560 vs base-name
residuals of −62,160 and −66,150); (4) the appearance structure
itself is now a finding: on the only known Cattail-growing band,
the comparator channel grows on 1 seed — the pooled comparison as
barred may have no band to run on. Documented, not fixed: no
game-code change was made (DIAG only), and no prior evidence needs
numeric revision — spoilvol's and lqpersist's numbers stand; this
arm adds the sink volumes they lacked and the verdict they did
not ask for.

## Reachability verdict

On this band (competent-nofeast, seeds 9760–9767, 100d): waves 1–3
reached (9760/9765/9766/9767 reach wave 3; the rest wave 2); waves
4–5 reached on 0/8 seeds. Regional, national, table, and wins: 0/8.
Rank stayed village on all 8 seeds. Arc II/III/IV, four-realm
formation, trap acquisition, counter discovery/kill, and
young-link succession survival are not recorded in this corpus
and are not estimated here. The scale wall stands on this band;
this arm measures a pantry sink, it does not move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9760–9767)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach per
seed: 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2, 9765: 3, 9766: 3,
9767: 3. Median survival: 100d (censored at the 100d horizon; all
8 seeds survived to day 100). Deaths: 18 total (causes above).
This is the competent-nofeast measurement profile (national/table/
wins 0), reported as a profile, not a regression.

## Confirm band: NOT spent

Per the prereg, confirm seeds are spent ONLY if the pilot verdict is
GO AND a second Cattail-growing substrate is established. The pilot
verdict is DIAG-NO-GO, and no second substrate is established (the
lqpersist confirm band 9768–9779: Cattail inflow 0 on all 12 seeds).
No confirm is run, and the fallback fresh band was not triggered
(Cattail 2/8 on the reuse band). No fresh seed was spent by this
arm at all; 9828–9839 remain unspent.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: leg 1 passes byte-identically, leg 2 passes
  exactly (0/0 violations over 799 sweeps), leg 3 fails honestly
  on LQ's 1/8 appearance, and leg 4 is therefore UNMEASURED rather
  than fudged. The appearance leg did the job it was written to
  do: it stopped a single-seed contrast from being sold as a
  pooled comparison. No re-scoring was done (no switching to
  Burdock-as-comparator, to means, to a single seed, to raw
  spoilDay, or to the 2.09/0.842 arithmetic as a pass — those
  numbers are reported above as supporting arithmetic, explicitly
  NOT judged).
- Bar lesson for the NEXT run, stated plainly: the spoilvol
  question AS BARRED may have no band to run on. Cattail and LQ
  grow on disjoint seeds wherever they have been observed:
  Cattail 9761/9767, LQ 9762 on this band; Cattail 0/8 on the
  fresh spoilvol band; Cattail 0/12 on the lqpersist confirm
  band. A future arm that wants this comparison barred as written
  must FIRST establish a band where BOTH channels grow on >= 2
  seeds — and screening fresh bands for that is exactly the
  fresh-band hoping the spoilvol metric review warned against,
  so such a screen needs its own prereg and its own seed budget,
  not a quiet spend inside another arm.
- Proposed revision for the NEXT run (proposed, NOT applied):
  judge the sink as a paired single-seed case study — 9761
  Cattail (336,480 swept, 64% of inflow) against 9762 LQ
  (160,800 swept, 41% of inflow) — with the single-seed caveat
  stated in the verdict itself (CASE-DIAG, not pooled GO), OR
  re-bar leg 3 as "each focal channel grows on >= 1 seed with
  inflow >= 100,000 kcal" (which this band WOULD pass: Cattail
  9761 at 523,680, LQ 9762 at 396,750) and judge leg 4 on the
  pooled volumes with the asymmetry named. Either revision
  changes what the verdict means and therefore belongs to the
  next run's prereg, not to this run's judgment. The numbers lean
  toward the sink hypothesis (ratio 2.09, share 0.842) — but a
  lean is not a barred pass, and this run does not claim one.
- Counting-method note: appearance counted by inflow RECORD count
  (the prereg's rule) agrees with appearance counted by summed
  kcal on this corpus — every focal inflow record carries
  kcal > 0 — so the record-vs-kcal ambiguity is moot here. A
  future prereg can keep either counting rule for these channels.
- No revision is proposed for legs 1–2: byte-identical neutrality
  plus zero-violation sweep integrity is the right strictness
  for a sink measurement. No revision is proposed for the
  bonus-aware horizon rule: it held throughout.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The det-gate (leg 1) is the before/after
  comparison: identical records with the instrument off vs on.
  The before/after numbers in this file are reproduction
  (lqpersist inflow picture) vs re-run (identical inflow plus
  new sweep volumes).

## Out-of-arm observations (for the coordinator's sim-findings backlog;
not chased, not edited into the backlog from this worktree)

- Cattail and Lamb's Quarters grow on disjoint seeds on every
  observed band (Cattail 9761/9767, LQ 9762; Cattail 0/8 fresh
  spoilvol band; Cattail 0/12 lqpersist confirm band) — the pooled
  spoil-sink comparison as barred may have no band to run on;
  the next arm needs either a both-grow band (screened under its
  own prereg) or a re-barred single-seed case-study metric.
- Voice without action, third sighting: 61 "threw out spoiled
  stores" lines on 9761 while 336,480 kcal of Cattail rots — the
  smoke rack is named (Chloe, Pavel, Sigrun) but never used in
  response. Design observation, not a measurement error.
- The Cattail sawtooth: the pile does not decline, it zeroes and
  rebounds (days 25/28/31/58/72/75) — a pulse-arrival channel's
  collapse shape, distinct from a steady drain. The lqpersist
  "median stock 3,600" is the post-sweep floor on this basis,
  not the day-end median (20,040 here); snapshot basis must be
  named whenever a stock median is quoted.
- Bonus flips mid-run (0/2/6 blocks across the band) — the
  preservation_instinct bonus is not a static trait; a future
  bonus-aware arm should record WHAT flips it (carried from
  spoilvol, unchanged).

## Reproduction check (this run)

- Sweep scripts/sweep-spoilvol-b.js (reused UNCHANGED) ran 8 pilot
  seeds, 100d, competent-nofeast, PERSEED_DIR=
  evidence/2026-10-26/sim-cattailband-b-corpus/ (8 files, pure
  JSON). No fresh seed spent.
- Analyzer scripts/analyze-cattailband-b.js prints per-seed
  tables, pooled focal channels, GO legs, bonus distribution and
  standing piles, family ledgers, secondary sweep totals, wall
  numbers, the 9761 Cattail day-by-day narrative, and the sense
  lines.
- Proof scripts/test-cattailband-b.js green in this worktree,
  exit 0: corpus validity (8 files, policy fields, no
  truncation), det-gate byte-identical (plus corpus-9761 count
  reproduction: 1464/266/2), independent leg recomputation
  (leg 2 pass, leg 3 LQ-1/Cattail-2 → DIAG-NO-GO, leg 4
  unmeasured), determinism cross-check (0 differing inflow
  channels vs the lqpersist corpus on all 8 seeds), and hygiene
  (0 src/js files modified, 0 sibling capture files modified,
  no modified tracked files at proof time). No jest was run
  (nothing to test in jest — the proof is node, not jest). No
  [needs-eyes]: this lands a measurement, not a player-visible
  change.
- No game-code change: zero src/js files touched. Files in this
  run's commits: prereg commit 72866d03c
  (evidence/2026-10-26/sim-cattailband-b-prereg.md) plus the
  evidence commit (scripts/analyze-cattailband-b.js,
  scripts/test-cattailband-b.js,
  evidence/2026-10-26/sim-cattailband-b.md, and the 8 corpus
  files).

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-NO-GO

Legs 1 (det-gate byte-identical) and 2 (sweep integrity 0/0 over 799
sweeps) pass; leg 3 fails on Lamb's Quarters' 1/8 appearance, so
leg 4 (the Cattail-vs-LQ sink ratio and share) is UNMEASURED. The
Cattail sink itself is measured and dominant on its growing seed —
336,480 kcal swept on 9761 — but whether spoil-removal volume
explains the Cattail collapse as barred cannot be judged on a band
where the comparator channel grows on one seed. The next arm needs
a both-grow band or a re-barred metric, under its own prereg.
