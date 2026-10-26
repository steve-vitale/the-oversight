# sim-spoilvol-b — per-channel spoil-removal volume via sweep-path capture (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2130Z, axis
food-economy. Arm: the 2029Z run's next blank (2) — per-channel
SPOIL-REMOVAL VOLUME via sweep-path capture. Measurement only: zero
src/js changes, no default flips, no lever. This arm does NOT re-judge
the 1930Z NO-GO or the 2029 post-arrival GO — its verdict is ONLY
whether spoil-removal volume explains the Cattail collapse. Judged
ONLY against its pre-registration
(evidence/2026-10-26/sim-spoilvol-b-prereg.md, committed BEFORE any
sweep as 974336077).

## Verdict against the pre-registered bar: DIAG-NO-GO

| leg | bar | result |
|-----|-----|--------|
| 1. Neutrality / det-gate | SPOILVOL=0 vs 1 identical on inflow/mealdraw/deaths/wall | byte-identical ✓ |
| 2. Sweep integrity | pantry removedNotSpoiledKcal = 0 AND keptSpoiledKcal = 0 | 0 / 0 ✓ |
| 3. Appearance | Lamb's Quarters AND Cattail each grow on >= 2 pilot seeds | LQ 2/8, Cattail 0/8 ✗ |
| 4. Sink bar | (a) Cattail sweep >= 1.5x LQ sweep AND (b) Cattail sweep >= 50% of Cattail (inflow − draws) | UNMEASURED — no Cattail |

The ratio leg is UNMEASURED, not failed: Cattail never arrives on
this fresh band, so there is no Cattail spoil volume to compare.
Per the prereg, a channel that never appears is a finding, not a
zero — and the finding is the verdict. The sink itself IS measured
(and is enormous — see below), but the Cattail-vs-LQ comparison
the question asks for cannot be run on seeds where Cattail does
not grow. No confirm band is spent: the pilot is DIAG-NO-GO, so
the prereg forbids confirm spend, and seeds 9828–9839 stay fresh
for a future run.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Pilot seeds
  9820–9827, 100d, death-aware. Seed freshness verified before the
  prereg (0 hits in evidence/2026-10-26/*.md, 0 corpus files for
  9820–9827 and for the confirm band 9828–9839; other-date .md
  hits for these numbers are non-seed statistics only). The
  reserved mealdraw confirm band 9780–9795 was NOT spent (its
  pilot gate forbids confirm spend; no 9780+ corpus file exists).
  The lqpersist bands 9760–9767 / 9768–9779 were NOT reused — no
  paired-reuse claim is made.
- Instrument (DIAG only): scripts/inflow-capture.js and
  scripts/mealdraw-capture.js reused UNCHANGED, plus the NEW
  scripts/spoilvol-capture.js (wraps Game.sweepSpoiled once:
  pre/post snapshots of pack, prep counter, village pantry, and
  corpse inventories; identity-matched removal deltas; per-sweep
  violation checks; bonus-aware horizons; bonus-saved piles) and
  the NEW scripts/sweep-spoilvol-b.js (same band/env assertions
  as sweep-lqpersist-b.js, plus day-end spoilvol snapshots and a
  spoil-voice say recorder gated by the same SPOILVOL flag so the
  det-gate compares the full instrument on/off). No sibling
  capture file was modified (proof checks this).
- Corpus: evidence/2026-10-26/sim-spoilvol-b-corpus/ (8 per-seed
  JSONs). Scripts: scripts/sweep-spoilvol-b.js,
  scripts/spoilvol-capture.js, scripts/analyze-spoilvol-b.js.
  Proof: scripts/test-spoilvol-b.js (green, exit 0 — see below).
- Canon read: docs/CANON.md + docs/PRESERVATION.md (ladder:
  cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican
  120d) + the code facts in the prereg (bonus-aware isSpoiled
  boundary, food.js ~2586–2599; sweepSpoiled pantry branch,
  food.js ~2668–2691; pantryDraw skips spoiled, game.js ~28630).
  Nothing invented.
- Base commit: 974336077 (the prereg commit itself; the pilot and
  det-gate runs ran on this worktree's HEAD, no base move).
- Infrastructure note (loud, per the flap rule): the container
  EPERM write flap blocked the pre-sweep safe-commit for ~50
  minutes (15 spaced attempts + 150 tight attempts, all
  "sha1 file '/tmp/idx-safecommit-*.lock' write error: Operation
  not permitted", plus a 0-byte worktree probe file proving
  write(2) itself was failing, not just /tmp). One tight attempt
  eventually landed the commit — and then the documented
  safe-commit index-clobber variant hit (main index showing the
  3 committed files staged-as-deleted, worktree files
  byte-identical to HEAD, verified by hash-object). Repaired per
  the documented recipe (`git update-index --add --cacheinfo`
  with the HEAD blob per file); after repair `git status --short`
  shows only the intended uncommitted analyzer, `git diff HEAD`
  and `git diff --cached` both empty. The commit itself was
  verified correct (message + 3 files + blob hashes). No ref
  surgery was performed at any point.

## Control: the det-gate (leg 1)

Seed 9820 run twice (SPOILVOL=1 vs SPOILVOL=0, stdout-JSON mode):
inflow records, mealdraw records, death lists, and wall fields
are BYTE-IDENTICAL excluding spoilvol fields and `ms`. The
SPOILVOL=1 det-gate run also reproduces the corpus seed-9820
counts exactly (mealDraw 1249, inflows 255, deaths 4). The new
recorders are neutral: they read, they do not move the game.
The wrapper's per-sweep violation checks (leg 2) confirm the
measurement is exactly the spoil sink: across all 799 pilot
sweeps, NOTHING was removed that wasn't spoiled
(removedNotSpoiledKcal = 0) and NOTHING spoiled was left
standing (keptSpoiledKcal = 0). The sweep is the pantry's only
spoil path, as the pre-sweep code audit concluded — now proven
per sweep, not assumed.

## What was measured: the sink is enormous

Per-seed per-channel table (inflow / meal-drawn / other-drawn /
sweep-removed / median post-arrival day-end stock; channels with
inflow >= 10,000 kcal or focal):

| seed | channel | in | meal | other | sweep | medPost |
|------|---------|----|------|-------|-------|---------|
| 9820 | Foraged food | 47,700 | 193,684 | 10,600 | 5,718 | 4,143 |
| 9820 | Expedition haul | 35,058 | 12,586 | 0 | 4,500 | 2,340 |
| 9820 | Fish catch | 20,715 | 9,395 | 0 | 1,500 | 1,320 |
| 9820 | Snared meat | 13,041 | 5,751 | 0 | 289 | 541 |
| 9821 | Muscadine Grapes | 151,830 | 2,520 | 1,260 | 118,620 | 11,070 |
| 9821 | Blackberry | 101,335 | 17,615 | 7,605 | 57,785 | 6,305 |
| 9821 | Foraged food | 27,772 | 91,781 | 15,962 | 195,368 | 7,102 |
| 9821 | Expedition haul | 14,493 | 6,238 | 0 | 3,000 | 3,119 |
| 9821 | Burdock | 12,420 | 2,880 | 0 | 0 | 2,070 |
| 9822 | Burdock | 159,030 | 24,210 | 2,070 | 52,200 | 16,380 |
| 9822 | Muscadine Grapes | 147,960 | 19,080 | 7,920 | 60,210 | 31,590 |
| 9822 | Foraged food | 32,702 | 91,843 | 16,031 | 77,094 | 15,853 |
| 9823 | Burdock | 78,480 | 36,450 | 810 | 12,510 | 270 |
| 9823 | Fish catch | 60,640 | 45,820 | 1,780 | 300 | 930 |
| 9823 | Foraged food | 52,234 | 138,415 | 11,010 | 21,611 | 2,700 |
| 9824 | Muscadine Grapes | 139,410 | 48,330 | 18,900 | 41,850 | 16,200 |
| 9824 | Burdock | 117,180 | 60,840 | 12,780 | 28,800 | 12,195 |
| 9824 | Foraged food | 26,901 | 153,699 | 14,753 | 26,386 | 2,732 |
| 9824 | Fish catch | 26,028 | 18,328 | 0 | 2,520 | 2,520 |
| 9825 | Muscadine Grapes | 222,750 | 116,730 | 4,050 | 71,820 | 14,400 |
| 9825 | Fish catch | 100,110 | 72,150 | 2,740 | 5,360 | 2,280 |
| 9825 | Foraged food | 83,845 | 94,766 | 6,344 | 31,132 | 3,386 |
| 9825 | Lamb's Quarters | 48,750 | 27,600 | 1,950 | 3,850 | 1,775 |
| 9825 | Mayapple | 13,580 | 5,530 | 1,330 | 3,710 | 6,790 |
| 9826 | Lamb's Quarters | 359,700 | 31,000 | 4,700 | 262,900 | 8,600 |
| 9826 | Foraged food | 31,577 | 61,111 | 2,800 | 205,944 | 7,138 |
| 9826 | Burdock | 29,250 | 0 | 0 | 7,380 | 10,395 |
| 9826 | Expedition haul | 21,598 | 1,570 | 0 | 13,734 | 3,358 |
| 9827 | Purslane | 220,560 | 111,420 | 8,250 | 38,220 | 20,970 |
| 9827 | Foraged food | 36,134 | 112,800 | 10,000 | 156,976 | 25,594 |
| 9827 | Expedition haul | 18,290 | 5,224 | 0 | 6,530 | 2,733 |
| 9827 | Burdock | 3,150 | 990 | 540 | 0 | 900 |

Pooled focal channels: Lamb's Quarters grows on 2 seeds
(9825, 9826): inflow 408,450, draws 65,250, sweep 266,750
(65% of inflow; 78% of inflow-minus-draws). Cattail grows on
0 seeds: inflow 0, draws 0, sweep 0 — in every record type
(inflows, sweep removals, mealdraw items, day-end snapshots),
verified by the proof across all 8 seeds. Burdock grows on 6
seeds: inflow 399,510, draws 141,570, sweep 100,890 (25% of
inflow; 39% of inflow-minus-draws).

The single most instructive seed is 9826, where Lamb's Quarters
IS the collapsing channel: 359,700 kcal arrives, 35,700 is
eaten, 262,900 rots in the sweep, and the pile ends at 3,600
fresh (+ 25,800 dried). On 9825 the same channel barely rots
(3,850 of 48,750). The sink is not a property of the channel
name — it is inflow rate vs rot rate, seed by seed. On 9826
the village eats a tenth of what arrives and the sweep takes
nearly three-quarters. Whatever made Cattail collapse on 9761,
a sink of this size is the right shape to be it — but shape is
not the comparison the prereg demanded, and this band cannot
run that comparison.

## Bonus-aware horizons (the 2029 metric review, honored)

- spoilBonusDays() across 799 pilot sweeps: 0 on 473 sweeps, 2
  on 124, 6 on 202 (median 0). The bonus is a run-level trait
  that can flip on mid-run (9820: 66 sweeps at 0 then 34 at 6;
  9822: 12 at 0 then 88 at 6; 9823: 29 at 0 then 71 at 2), while
  9821/9825/9826 sit at 0 throughout. The 2029 observation —
  LQ stacks surviving with median RAW horizon −1 — is exactly
  what a bonus of 1+ produces: the game eats bonus-aware, and
  this run watches it happen.
- Bonus-saved standing piles (post-sweep stacks with raw
  horizon <= 0 but bonus-aware horizon > 0 — food the raw clock
  calls rotten that the game still counts fresh): median 0 per
  sweep across the band, max 71,868 on a single sweep. Reported
  as a STANDING pile per sweep, never summed as volume: the
  same pile re-counted across 100 sweeps is not 100 piles' worth
  of food. (An early analyzer draft summed it; the committed
  analyzer reports the per-sweep median/max instead.)
- Every removed stack had bonus-aware horizon <= 0 by
  construction (violations 0); every removed stack therefore
  also had raw horizon <= 0 (bonus >= 0). The bonus's visible
  effect is entirely on the survival side: raw-past piles that
  stand, not extra rot.

## The (dried) family: the ledger needs the family, not the name

Every "(dried)" variant channel carries real pantry stock with
ZERO inflow-door records: Burdock (dried), Muscadine Grapes
(dried), Lamb's Quarters (dried), Purslane (dried), Foraged
food (dried), and others all appear in sweep removals, draws,
and day-end snapshots, but never in an inflow record. Dried
stock enters the pantry WITHOUT passing the three recorded
doors — via an in-place transformation (the village
preservation/racks path re-stating pantry stacks) or a direct
push. The per-channel ledger therefore cannot close on the base
name alone; it closes on the FAMILY (base + ' (dried)'):

| family (seed) | inflow | draws | sweep | net | last stocks | family residual |
|---------------|--------|-------|-------|-----|-------------|-----------------|
| Burdock (9822) | 159,030 | 44,571 | 64,380 | 50,079 | 39,150 + 3,828 | −7,101 |
| Lamb's Quarters (9826) | 359,700 | 53,010 | 276,880 | 29,810 | 3,600 + 25,800 | −410 |
| Muscadine Grapes (9821) | 151,830 | 5,916 | 123,871 | 22,043 | 10,890 + 21,360 | +10,207 |

The 9826 LQ family closes to within 410 kcal on 359,700
(0.1%): inflow, draws, and the sweep explain the stock. The
remaining family residuals (theft raids, direct-push inflows
like tribute/raid spoils, cap refusals) are second-order, not
measurement error in the sweep — the sweep itself is exact
(violations 0). Pooled family ledgers: LQ family sweep
280,730, draws 87,240; Burdock family sweep 129,732, draws
187,243.

The generic "Foraged food" channel does NOT close, for a
different, named reason: it holds the village's STARTING pantry
stock (a direct push that bypasses all three inflow doors) and
is drawn far beyond its recorded inflow on every seed (e.g.
9820: 47,700 in vs 193,684 meal-drawn). Its residuals (+52,960
to +287,658) are starting stock, not sweep error. A future
ledger arm must capture opening stock to close generic
channels; focal mid-band channels (firstDay >= 10) are
unaffected, since they start from zero.

Sweep edge note: seed 9827 records 99 sweeps vs 100 on every
other seed — its sweep days run 2–100 while the others run
2–101 (100 day-end snapshots each). The 101st dawn falls
outside 9827's run window. One sweep's worth of rot at the
boundary, not a missing measurement.

Secondary sweep totals (never mixed into pantry volume): pack
215,606 kcal, prep counter 8,775 kcal, corpses 0 kcal across
the band. The village pantry is where the rot lives.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Seed 9826, day 21 — the first pantry spoil voicing, and it
teaches:

> "The village threw out spoiled stores: Foraged food. Jorge
> mutters: \"Should've smoked that. Fresh stuff keeps a day or
> two on the shelf — the smoke rack is right there.\" (pantry)"

77 pantry spoil lines on 9826; after the first teaching, the
repeats condense to the thrown-out list with no mutter — the
village names the loss every time and teaches the fix once.
That reads as people behavior: a named loss, a named remedy,
then quiet routine. The one oddity: the teaching fires for
Foraged food (the generic starting pile) while the channel
actually collapsing that run is Lamb's Quarters — the voice
names the day's loss, not the run's story, which is honest
but not diagnostic.

Seed 9826, Lamb's Quarters day by day (arrived / eaten /
rotted / standing, from inflow + draw + sweep + day-end
snapshots together):

- Day 20: a trickle — 100 kcal arrives, 100 standing. The
  village notices the new food but barely has any.
- Day 23: 4,450 arrives, 2,200 eaten, 4,450 standing — the
  village eats half of what comes in, the pile holds.
- Day 24: 9,000 arrives, 550 eaten, 550 rotted, 9,000
  standing — arrivals already dwarf appetite, and the rot
  starts taking its share.
- Day 30: 6,600 arrives, 350 eaten, nothing rotted, 19,050
  standing — a good week, the pile looks healthy.
- Day 40: nothing arrives, nothing eaten, 2,350 rotted,
  13,200 standing — a quiet day where the only movement is
  decay. This is the collapse in miniature: when arrivals
  pause, the sweep is the only actor.
- Day 60: 15,600 arrives, 2,050 eaten, 19,100 standing —
  arrivals rescue the pile again.
- Day 100: nothing arrives, nothing eaten, 14,800 rotted,
  3,600 standing (+ 25,800 dried) — the run ends with the
  sweep taking a final large bite out of a pile the village
  never got around to eating.

Judgment: the spoil story reads sensically as people behavior
with a pantry too full to manage — food arrives faster than
appetite, the village eats what it wants, and the rest quietly
rots and gets thrown out with a mutter about the smoke rack.
What does NOT read as people behavior is the scale of the
waste (262,900 kcal rotted on one seed while the village
eats 35,700 of the same food): no village watches three
quarters of a harvest rot without smoking it, yet the smoke
rack stays a mutter rather than a response. That gap — voice
without action — is a design observation for the coordinator,
not a measurement error: the sweep is exact, the behavior it
reveals is the finding.

## Village assessment

What the village looked like: 8 villages surviving the full
100 days around pantries that rot as fast as they fill — the
dominant flow on most seeds is not eating but spoiling
(9821 Foraged food: 195,368 rotted vs 107,743 eaten;
9826 Foraged food: 205,944 rotted vs 63,911 eaten). The
pantries are not empty; they are churn. Rank stayed village
on all 8 seeds; no seed approached regional, let alone
national.

Who thrived and died and why: 38 deaths across 8 seeds (9820:
4, 9821: 1, 9822: 4, 9823: 9, 9824: 10, 9825: 6, 9826: 2, 9827:
2). The shape differs from lqpersist's arena/monster shape:
sickness dominates (17), then monster 5, ambush 4, a wound
that wouldn't close 4, the arena 3, contest 2, sunback 1,
alien 1, dehydration 1. No death is starvation-shaped — the
villages rot food while nobody starves, which is the same
churn story from the other side.

What knowledge/capabilities were missing: the Cattail
comparison itself (this band never grows it); the (dried)
transformation path (unrecorded door — the next ledger arm
must capture it); opening-stock capture for generic channels;
and any answer to why a village that mutters about the smoke
rack 77 times never smokes the pile.

Blanks filled: (1) the sweep sink is now MEASURED, not
inferred — per-channel, per-sweep, bonus-aware, with zero
violations: the pantry's spoil path is exactly sweepSpoiled,
and its volume is hundreds of thousands of kcal per band;
(2) the bonus-aware horizon is observed operating (bonus 0/2/6
blocks, bonus-saved standing piles to 71,868); (3) the
(dried)-family ledger rule (base name alone does not close;
family closes to 0.1% on 9826); (4) Cattail's absence on a
fresh competent-nofeast band is itself a finding — the
channel that dominated 9761 does not grow here at all.
Documented, not fixed: no game-code change was made (DIAG
only), and no prior evidence needs numeric revision — 2029's
numbers stand; this arm adds the sink measurement they
lacked, and the verdict they did not ask for.

## Reachability verdict

On this band (competent-nofeast, seeds 9820–9827, 100d):
waves 1–3 reached (9822/9824/9825 reach wave 3; the rest wave
2); waves 4–5 reached on 0/8 seeds. Regional, national,
table, and wins: 0/8. Rank stayed village on all 8 seeds. Arc
II/III/IV, four-realm formation, trap acquisition, counter
discovery/kill, and young-link succession survival are not
recorded in this corpus and are not estimated here. The scale
wall stands on this band; this arm measures a pantry sink, it
does not move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9820–9827)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach per seed: 9820: 2, 9821: 2, 9822: 3, 9823: 2, 9824: 3,
9825: 3, 9826: 2, 9827: 2. Median survival: 100d (censored at
the 100d horizon; all 8 seeds survived to day 100). Deaths:
38 total (causes above).

## Confirm band: NOT spent

Per the prereg, confirm seeds 9828–9839 (12 seeds) are spent
ONLY if the pilot verdict is GO. The pilot verdict is
DIAG-NO-GO, so no confirm band is spent and 9828–9839 remain
fresh (re-verified: 0 .md hits, 0 corpus files at prereg
time; the confirm-time re-check is moot because the band is
unspent).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: leg 1 passes byte-identically, leg 2 passes
  exactly (0/0 violations), leg 3 fails honestly on Cattail's
  0/8 appearance, and leg 4 is therefore UNMEASURED rather
  than fudged. The appearance leg did the job it was written
  to do: it stopped a ratio from being computed over a channel
  that never grew. No re-scoring was done (no switching to
  Burdock-as-Cattail, to means, to a single seed, or to raw
  spoilDay to rescue a leg).
- Bar lesson for the NEXT run: a fresh band is the wrong
  substrate for a channel-specific comparison. The next
  spoil-volume arm should FIRST screen bands for Cattail growth
  (or claim paired reuse of the lqpersist band 9760–9767, where
  Cattail grew to 523,680 kcal in, and state that intent in its
  prereg) and only then judge the ratio. Freshness is a virtue
  for new questions, not for channel comparisons.
- Ledger lesson for the NEXT run: the ledger unit must be the
  CHANNEL FAMILY (base + ' (dried)'), and the instrument must
  capture the (dried) transformation path (whatever renames or
  re-states pantry stacks into dried variants) plus opening
  stock for generic channels. Without those, per-channel
  residuals mislead in both directions (Foraged food's huge
  positives, Burdock's −41,400 base-name residual that the
  family nearly closes).
- Bonus-saved reporting lesson: a standing pile re-counted
  per sweep must be reported as a per-sweep median/max, never
  summed across sweeps as volume. The committed analyzer does
  this; the draft that summed it was corrected before the
  evidence was written.
- No revision is proposed for legs 1–2: byte-identical
  neutrality plus zero-violation sweep integrity is the right
  strictness for a sink measurement.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The det-gate (leg 1) is the
  before/after comparison: identical records with the
  instrument off vs on.

## Out-of-arm observations (for the coordinator's sim-findings backlog;
not chased, not edited into the backlog from this worktree)

- Cattail does not grow on a fresh competent-nofeast band
  (0/8 seeds, all record types) after dominating 9761 — the
  next spoil-volume arm needs a Cattail-growing band first
  (screen, or paired reuse of 9760–9767 with stated intent).
- (Dried) pantry stock enters with no inflow-door record —
  the transformation path (preservation/racks re-stating) is
  uninstrumented; the next ledger arm must capture it.
- Sickness is the top death cause on this band (17/38),
  unlike lqpersist's arena/monster shape — worth a look on
  its own, not chased here.
- Voice without action: 77 pantry spoil mutters on 9826
  while 262,900 kcal of Lamb's Quarters rots — the smoke rack
  is named but never used in response. Design observation,
  not a measurement error.
- Bonus flips mid-run (0 → 6, 0 → 2 within seeds) — the
  preservation_instinct bonus is not a static trait; a future
  bonus-aware arm should record WHAT flips it.

## Reproduction check (this run)

- Sweep scripts/sweep-spoilvol-b.js ran 8 pilot seeds, 100d,
  competent-nofeast; corpus at
  evidence/2026-10-26/sim-spoilvol-b-corpus/ (8 files, pure
  JSON).
- Analyzer scripts/analyze-spoilvol-b.js prints per-seed
  tables, pooled focal channels, GO legs, bonus distribution
  and standing piles, family ledgers, secondary sweep totals,
  wall numbers, and the sense line.
- Proof scripts/test-spoilvol-b.js green in this worktree,
  exit 0: corpus validity (8 files, policy fields, no
  truncation), det-gate byte-identical (plus corpus-9820
  count reproduction: 1249/255/4), independent leg
  recomputation (leg 2 pass, leg 3 Cattail-absent →
  DIAG-NO-GO, leg 4 unmeasured), Cattail absence across all
  record types, and hygiene (0 src/js files modified, 0
  sibling capture files modified, no modified tracked files
  at proof time). No jest was run (nothing to test in jest —
  the proof is node, not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- No game-code change: zero src/js files touched. Files in
  this run's commits: prereg commit 974336077
  (scripts/spoilvol-capture.js, scripts/sweep-spoilvol-b.js,
  evidence/2026-10-26/sim-spoilvol-b-prereg.md) plus the
  evidence commit (scripts/analyze-spoilvol-b.js,
  scripts/test-spoilvol-b.js,
  evidence/2026-10-26/sim-spoilvol-b.md, and the 8 corpus
  files).

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-NO-GO

Legs 1 (det-gate byte-identical) and 2 (sweep integrity 0/0)
pass; leg 3 fails on Cattail's 0/8 appearance, so leg 4 (the
Cattail-vs-LQ sink ratio and share) is UNMEASURED. The sink
itself is measured and enormous — 266,750 kcal of Lamb's
Quarters rotted on 2 seeds, 100,890 of Burdock on 6 — but
whether spoil-removal volume explains the Cattail collapse
specifically cannot be judged on seeds where Cattail never
grows. The next arm needs a Cattail-growing band first.
