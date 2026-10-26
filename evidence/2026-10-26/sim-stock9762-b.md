# sim-stock9762-b — what seed 9762 stocks that the other seeds don't (DIAG ONLY, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1930Z, axis
food-economy. Measurement only: zero src/js changes, no default flips, no
throttle or garden redesign. This arm answers the blank named verbatim in
sim-throttledays-b's out-of-arm observations: seed 9762 is the one seed
where the throttle's drain reading and the village's real stockpile line
up — what does 9762 stock that the other seeds don't?

Pre-registration (written BEFORE any new sweep or name-level analysis):
evidence/2026-10-26/sim-stock9762-b-prereg.md. Judged ONLY against it.
The throttle-keying ruling itself is Steve's call — this arm MEASURES,
it does not decide it, and it changes no keying.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Seeds 9760–9767,
  100d, death-aware. This 8-seed band IS the pilot (a decomposition, not
  a lever effect, so no confirm band was spent).
- Instrument (DIAG only): scripts/inflow-capture.js,
  scripts/garden-capture.js, and scripts/throttledays-capture.js reused
  UNCHANGED, plus the NEW scripts/stock9762-capture.js installed AFTER
  throttledays-capture, which wraps resolveOneAssignment a further time
  and records, at entry to every garden resolution, an aggregated
  pantry-composition snapshot: per item-name channel, fresh /
  nonFresh (preserved/rendered/pemmican) / spoiled kcal, using the SAME
  classification as pantryFreshKcal. The sweep's daily wrapper also
  records one day-end snapshot per day. No Game.state write, no RNG
  use, no say/log write. No sibling capture file was modified (proof
  checks this).
- Corpus: evidence/2026-10-26/sim-stock9762-b-corpus/ (8 per-seed
  JSONs). Scripts: scripts/sweep-stock9762-b.js,
  scripts/stock9762-capture.js, scripts/analyze-stock9762-b.js.
  Proof: scripts/test-stock9762-b.js (green, exit 0 — see below).
- Canon read: docs/CANON.md + docs/GARDENS.md + docs/PRESERVATION.md
  (ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d). Nothing invented.

## Control reproduction: the gardenbar band, reproduced

All six gardenbar trajectory counts reproduce EXACTLY, so the band is
"the gardenbar band, reproduced", not a fresh band: 761 garden
resolutions, 750 engaged (98.6%), 11 NPC sows, 3,167 keeper turns,
32 beds, 235 player sows. The three throttle flags (garden,
throttledays, stock) agree on all 761 resolutions (0 mismatches), and
the snapshot rebuild (summed bucket freshKcal vs pantryFreshKcal())
agrees on all 761 resolutions (100.0%). The new recorder is neutral:
it reads, it does not move the game.

## Before/after numbers (this arm changes no lever, so "after" is a reproduction)

Per-seed median freshKcal at engaged resolutions — before
(throttledays evidence) vs after (this run, conventional median; see
"metric review" for the median rule):

| seed | engaged | before | after | disagree (throttledays) |
|------|---------|--------|-------|-------------------------|
| 9760 | 85 | 30,297 | 30,297 | 100.0% |
| 9761 | 96 | 32,950 | 32,950.5 | 100.0% |
| 9762 | 99 | 89,967 | 89,967 | 36.4% |
| 9763 | 78 | 16,196 | 16,196.5 | 100.0% |
| 9764 | 99 | 44,608 | 44,608 | 100.0% |
| 9765 | 99 | 24,250 | 24,250 | 100.0% |
| 9766 | 98 | 17,310 | 17,310 | 100.0% |
| 9767 | 96 | 38,522 | 38,522 | 100.0% |

The gap to decompose: totalGap = 89,967 − 30,297 (median of the other
seven seeds' medians) = 59,670 kcal.

## Verdict against the pre-registered bar: NO-GO (failing leg: 3-channel-cover)

| leg | bar | result |
|-----|-----|--------|
| 1. Control reproduction exact | 761/750/11/3167/32/235 | exact ✓ |
| 2. Snapshot rebuild >= 99% | freshRebuilt == freshKcal | 100.0% (761/761) ✓ |
| 3. Channel cover >= 50%, present-across | single channel, or a set of <= 3 channels each >= 10%, covering >= 50% of totalGap, every member present on >= 80% of 9762's engaged resolutions AND >= 50 distinct days | FAILS ✗ — see below |

## The decomposition (primary, median-based, engaged resolutions)

| channel | med 9762 | med other seeds | gap | share of totalGap | present on 9762 (resolutions / days) | present-across? |
|---------|----------|-----------------|-----|-------------------|--------------------------------------|-----------------|
| Lamb's Quarters | 32,150 | 0 | 32,150 | 53.9% | 79/99 (79.8%), 79 days | NO — misses 80% by 1 resolution |
| Foraged food | 20,714 | 7,885 | 12,829 | 21.5% | 97/99 (98.0%), 97 days | yes |
| Dried beans | 11,250 | 0 | 11,250 | 18.9% | 99/99 (100.0%), 99 days | yes |
| Rice | 13,000 | 10,200 | 2,800 | 4.7% | 99/99 (100.0%), 99 days | yes (but < 10%, excluded from the set) |
| Canned soup | 7,500 | 6,500 | 1,000 | 1.7% | 99/99 (100.0%), 99 days | yes (but < 10%, excluded) |
| Peanuts | 1,020 | 0 | 1,020 | 1.7% | 65/99 (65.7%), 65 days | no |
| All other channels | — | — | ≤ 600 each | ≤ 1.0% each | — | no |

- Best present-across single channel: Foraged food, 21.5%.
- Best present-across set (<= 3 channels, each >= 10%):
  Foraged food + Dried beans = 40.4% < 50%.
- Median residual: −3.6% (channel shares sum to 103.6%; medians do not
  sum exactly across channels — reported, not hidden).
- NO-GO is the honest verdict under the pre-registered bar. The miss
  is narrow and specific, and it is named here rather than re-scored:
  Lamb's Quarters alone covers 53.9% of the gap but fails the
  present-across leg by ONE resolution (79/99 = 79.8% vs the 80% bar;
  80/99 = 80.8% would have passed). Nothing else in the bar was
  close to flipping: even a 4-channel present-across set (adding Rice
  and Canned soup, both < 10% and so excluded by the set rule) reaches
  only 46.8% — still under 50%. So relaxing the set-size rule alone
  would NOT flip the verdict; only the presence leg binds, and only
  for Lamb's Quarters. See "metric review" for the proposed revision
  for the NEXT run — the verdict here stays NO-GO.

## What 9762 actually stocks (the answer, in plain words)

9762's stockpile is NOT one windfall. It is three layers, and only the
top layer is 9762-specific:

1. THE SAME STARTING PANTRY AS EVERYONE. Day 2 on all 8 seeds is
   effectively identical: Rice 13,000 + Dried beans 12,000 + Canned
   soup 7,500 + Peanuts ~5,000 + Dried meat 400–4,400 (≈39,000–43,000
   fresh kcal). 9762 did NOT start richer. What differs is draw-down:
   on 9762, 9764, and 9767, Rice sits at exactly 13,000 on every
   snapshot for all 100 days — never touched. On 9763 it is eaten to
   zero; on 9760 to 4,800; on 9766 to 4,600. On 9762 the starting stock
   survives because the village never needs it: daily meals are
   covered by inflows, so the base is never drawn. The base is
   persistence by plenty, not a 9762-only item.

2. A STEADY DRIP OF LAMB'S QUARTERS, NOT A WINDFALL. 129 deposit-door
   events from day 20 onward, totaling 396,750 kcal (about 3,000 kcal
   each, roughly every day or two), all carrying gardenShares. The
   stock ratchets up and then stays: day-end Lamb's Quarters fresh
   kcal is 0 on day 11, 2,700 on day 21, 18,950 on day 31, 42,950 on
   day 41, 30,000 on day 51, 51,600 on day 71, 46,800 on day 91. It is
   absent from every engaged resolution on days 2–20 and on day 23,
   and present on EVERY engaged resolution from day 24 on. That is
   why it misses the 80% bar: the bar counts all 99 engaged days,
   including the 19 pre-arrival days when the channel could not
   possibly be present. After arrival it is as persistent as anything
   in the pantry (79 of the 80 engaged resolutions from day 21 on).
   The "present across the band" leg, as written, penalizes a channel
   for arriving on day 20. That is a property of the bar, not of the
   stockpile — and it is why the metric review below proposes a
   post-arrival persistence measure for the next run.

3. A FATTER FORAGED BASE. Foraged food's median on 9762 is 20,714
   (vs a 7,885 other-seed median) and it is present on 97 of 99
   engaged days — the largest present-across contributor (21.5%).

Why Lamb's Quarters persists while other seeds' big hauls do not is
the sharpest contrast in the corpus. Seed 9761 takes in 523,680 kcal
of Cattail (more than 9762's whole Lamb's Quarters inflow) yet its
Cattail median fresh stock is only 1,080: the stock spikes to 30,000–
38,000 and collapses back to ~0 in bursts. Seed 9760's Burdock
(147,870 kcal in) oscillates the same way (0–23,000). Flows do not
explain stocks: 9761's TOTAL inflow (583,933 kcal) exceeds 9762's
(452,718 kcal), yet 9761's median stockpile (32,951) is barely a third
of 9762's (89,967). What makes 9762 different is that its main inflow
ARRIVES STEADILY AND STAYS, while the other seeds' big hauls arrive
in pulses and drain away. The mechanism behind that persistence
(spoil timing vs meal-draw order vs deposit frequency) is NOT
established by this decomposition and is recorded as an out-of-arm
observation below, not claimed here.

Preserved stock is NOT the story: 9762's median nonFresh (preserved/
rendered/pemmican) stock is 47,833 kcal against 89,967 fresh, and
other seeds also carry 13,000–49,000 nonFresh. The gap is a fresh
gap, and the fresh gap is Lamb's Quarters + Foraged food + the
untouched starting base.

Garden harvest is zero in the strongest sense: the channel 'Garden
harvest' never appears as a pantry bucket on ANY seed in ANY
snapshot. That matches gardenbar's ripe == 0 on all 800 seed-days —
the garden contributes nothing to the pantry on this band, on any
seed, including 9762. (This also sharpens the open question below:
all 129 Lamb's Quarters deposits carry gardenShares, yet the garden
itself harvests nothing. Where the garden-attributed deposits come
from is not answered by this corpus.)

## Secondary figures (reported, not judged)

- Mean-based decomposition (same channels, means instead of medians):
  Lamb's Quarters mean gap 26,491; Foraged food 10,295; Dried beans
  7,975; Rice 4,068; Canned soup 1,756. Same ordering as the median
  decomposition; the verdict does not depend on the mean/median
  choice.
- Cumulative inflow totals by seed (flows, not stocks — contrast only):
  9760: 289,430 (deposit 256,355, stock 32,475); 9761: 583,933
  (deposit 532,480, stock 46,053); 9762: 452,718 (deposit 397,740,
  stock 51,978); 9763: 116,796; 9764: 151,782; 9765: 70,610;
  9766: 49,119; 9767: 76,759. Top inflow names: 9762 Lamb's Quarters
  396,750; 9761 Cattail 523,680; 9760 Burdock 147,870; 9764 Burdock
  100,980. Inflow dominance does NOT predict stock dominance
  (9761 Cattail is the largest inflow on the band and a ~0 median
  stock).
- Day-end snapshot medians track the resolution-entry medians closely
  (9762 day-end median fresh 96,397 vs 89,967 at resolutions; other
  seeds within ~1,000–4,000), so the gap is not an artifact of
  measuring at garden resolutions.
- Per-seed engaged medians for the top channels (fresh kcal):
  Lamb's Quarters: 9762: 32,150, all others 0. Foraged food: 9760:
  10,809; 9761: 6,975; 9762: 20,714; 9763: 11,816; 9764: 9,221;
  9765: 4,970; 9766: 4,489; 9767: 7,885. Dried beans: 9762: 11,250;
  9764: 10,950; 9767: 8,850; all others 0. Rice: 9762/9764/9767:
  13,000; 9761: 10,200; 9765: 11,800; 9760: 4,800; 9766: 4,600;
  9763: 0. Canned soup: 6,250–7,500 on all seeds except 9763 (0).

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Seed 9762, days 30–41, read in full (garden say-lines + that day's
stockpile):

- Spoken, every day: "🌱 Eduardo / Farid / Wilhelm / Liam waters and
  weeds the beds before taking up other work. The harvest can wait."
  (The keeper rotates daily — Eduardo, Farid, Wilhelm, Tyler, Luana,
  Liam — and each day's line names that day's keeper.)
- Spoken alongside: "You sow Lamb's Quarters: 30 days to first
  harvest. Later harvests need 28 days of regrowth." and "You coax 3–4
  growing beds forward by 12 days." The player keeps planting and
  tending while NPC duty weeds.
- That window's numbers: day-end freshKcal 77,006 (day 31) rising to
  99,442 (day 41); need-days at the median engaged resolution 4.34.
- Judgment: on 9762 the line reads TRUE — and that is the point.
  Throttledays' seed-9760 sample showed the same line spoken over a
  pantry holding 0.85 need-days, where "the harvest can wait" was
  unfaithful to the pantry. On 9762 the village genuinely holds
  4+ need-days plus ~48,000 preserved kcal, so the weeding keeper is
  telling the truth about plenty. The talk matches the measured
  stockpile here; the throttle's line is faithful exactly on the one
  seed where the stockpile is real. What still reads odd is the
  pairing: the player sows Lamb's Quarters in the beds every few
  days while the pantry's Lamb's Quarters arrives as deposits — the
  garden's spoken work and the pantry's Lamb's Quarters stock run in
  parallel without meeting (the plots never ripen). Villagers also
  react to events in the same window: day 39, "🌙 Raid — Thornfield
  came in the night... trampled 2 garden plots into mud. Nobody's
  dead, but the message is clear" (Trust −10); day 44, the same from
  Stonebridge. The village reads like people: rotating keepers, a
  player tending beds, raids answered with named grievances — not a
  static menu.

## Village assessment

What the village looked like: on all 8 seeds, villages that survived
the full 100 days (no village lost on this band) living around
pantries that, on 7 seeds, read as full on the drain gauge while
holding 1–2 need-days of fresh food — and on 9762, a pantry that
actually is full (median ~90,000 fresh kcal, ~141,000 total). Seed
9766 is still the never-sown village from gardenbar (98 engaged
resolutions, 0 NPC sows, beds built but nothing planted); seed 9763
is the counter-example where a real empty pantry let NPC duty sow 11
times.

Who thrived and died and why: 18 deaths across 8 seeds, none of them
starvation (same cause shape as gardenbar/throttledays): the arena
6, monster 4, ambush 2, dehydration 2, a wound that wouldn't close 1,
the expedition 1, "big ugly" 1, "extended warranty" 1. Per seed:
9760: 0, 9761: 2, 9762: 2 (monster 1, the arena 1), 9763: 3, 9764: 1,
9765: 1, 9766: 5, 9767: 4. The deaths are contest/arena/monster-shaped,
not pantry-shaped — the stocking question is about what the pantry
holds, not survival on this band.

What knowledge/capabilities were missing: nothing in this arm's scope
— the blank was the composition question, and it is now filled with
per-channel numbers on every engaged day. The remaining gaps are the
mechanism questions below (deposit origin, persistence mechanism,
meal-draw order), which need their own arms.

Blanks filled: (1) per-channel pantry composition at every garden
resolution on the gardenbar band (761 snapshots, 100% rebuild);
(2) the 9762-vs-others gap decomposed per channel (59,670 kcal, with
Lamb's Quarters 53.9%, Foraged food 21.5%, Dried beans 18.9%);
(3) the verdict that no single present-across channel and no
present-across set covers 50% under the pre-registered bar — the gap
is a combination, dominated by a late-arriving persistent channel.
Documented, not fixed: no game-code change was made (DIAG only), and
no prior evidence needs numeric revision — gardenbar's and
throttledays' numbers reproduce exactly.

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

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict follows
  from it: legs 1 and 2 pass cleanly, leg 3 fails on a named, narrow
  miss (Lamb's Quarters presence 79.8% vs 80%). The bar did its job —
  it prevented a "one channel explains it" claim that the presence
  leg does not support as written.
- Median rule (proposed revision for the NEXT run): the prereg said
  "median" without naming the even-n rule. The analyzer uses the
  conventional median (average of the two middle values for even n),
  which reproduces the throttledays evidence medians exactly
  (9761: 32,950.5; 9763: 16,196.5; 9767: 38,522); a floor-index median
  would shift 9761/9763/9767 by up to ~300 kcal and would NOT change
  the verdict (the binding leg is presence, not the median value).
  The next prereg for this family should name the median rule
  explicitly.
- Presence leg (proposed revision for the NEXT run): "present across
  the band" as share of ALL engaged resolutions penalizes a channel
  that arrives mid-band and then never leaves. Lamb's Quarters is
  present on 79 of the 80 engaged resolutions from its first
  appearance (day 21) onward (98.75%), and on every engaged day from
  day 24 on — a post-arrival persistence measure would pass it, and
  the single-channel cover (53.9%) would then meet the bar. The next
  run in this family should pre-register EITHER the all-band share
  OR a post-arrival persistence share (e.g. present on >= 80% of
  engaged resolutions from first appearance onward, with first
  appearance itself reported), and say which one judges the verdict.
  This revision is proposed, NOT applied: this run's verdict stays
  NO-GO under the bar as written.
- Set rule: the "each member >= 10%" clause excludes Rice (4.7%) and
  Canned soup (1.7%) from the set. Even without that clause, the
  4-channel present-across set reaches only 46.8% — so relaxing the
  set rule alone would not flip the verdict. The binding constraint
  is the presence leg, not the set rule.
- Residual: channel shares sum to 103.6% (residual −3.6%) because
  medians do not sum across channels. The residual is small and is
  reported; it does not threaten the verdict (the failing leg fails
  by presence, not by share arithmetic).
- No revision is proposed for legs 1–2: exact reproduction plus a
  100% rebuild is the right strictness for a decomposition arm.

## Out-of-arm observations (for the coordinator's sim-findings backlog;
not chased, not edited into the backlog from this worktree)

- Lamb's Quarters deposit origin: all 129 Lamb's Quarters deposits
  are deposit-door events carrying gardenShares, yet the garden's own
  harvest channel ('Garden harvest') is absent from every pantry
  snapshot on every seed (ripe == 0 throughout). Where do
  garden-attributed deposits come from if the plots never ripen? A
  trace arm (deposit-path attribution) could answer this; this arm
  only establishes the fact.
- Persistence mechanism: why does 9762's Lamb's Quarters stock ratchet
  and stay (30,000–52,000 kcal for 60+ days) while 9761's Cattail and
  9760's Burdock stocks pulse and collapse? Candidate mechanisms —
  spoil timing, meal-draw order, deposit frequency — are NOT
  distinguished by this corpus. A follow-up arm measuring spoil days
  and draw order per channel could answer it.
- Meal-draw order / starting-stock persistence: Rice, Dried beans,
  and Canned soup sit untouched for 100 days on 9762/9764/9767 but are
  eaten to zero (9763) or drawn down (9760/9766) on other seeds. What
  decides whether the starting stock is ever drawn? The draw-order
  rule behind this split is not in this corpus.
- Inflow-vs-stock lesson (method note for future arms): cumulative
  inflow totals do NOT predict stockpiles on this band (9761's
  583,933 kcal in, 32,951 median stock; 9762's 452,718 kcal in, 89,967
  median stock). Future stocking arms should measure snapshots, not
  just flows.

## Reproduction check (this run)

- Sweep scripts/sweep-stock9762-b.js ran 8 seeds, 100d,
  competent-nofeast, in ~1.2–2.2s of sim time per seed (plus container
  overhead); corpus at evidence/2026-10-26/sim-stock9762-b-corpus/
  (8 files, pure JSON).
- Analyzer scripts/analyze-stock9762-b.js prints reproduction,
  rebuild, flag agreement, the gap decomposition, GO legs, secondaries,
  and wall numbers.
- Proof scripts/test-stock9762-b.js green in this worktree, exit 0:
  corpus validity (8 seeds, policy fields, stock resolutions),
  reproduction exact (761/750/11/3167/32/235), rebuild 100.0%
  (761/761), independent GO recomputation (totalGap 59,670; best
  present-across single Foraged food 21.5%; best set Foraged food +
  Dried beans 40.4%; leg3 false; verdict NO-GO), determinism (fresh
  seed-9760 re-run reproduces all 85 stock resolutions identically),
  and hygiene (0 src/js files modified, 0 sibling capture files
  modified). No jest was run (nothing to test in jest — the proof is
  node, not jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files touched. Files in this
  commit: scripts/stock9762-capture.js, scripts/sweep-stock9762-b.js,
  scripts/analyze-stock9762-b.js, scripts/test-stock9762-b.js,
  evidence/2026-10-26/sim-stock9762-b-prereg.md,
  evidence/2026-10-26/sim-stock9762-b.md, and the 8 corpus files.

## Verdict (judged against the pre-registered bar, not re-scored): NO-GO

Legs 1 (reproduction exact) and 2 (rebuild 100.0%) pass; leg 3
(channel cover >= 50% present-across) FAILS — best present-across
single channel Foraged food 21.5%, best present-across set Foraged
food + Dried beans 40.4%, both under 50%. Lamb's Quarters alone
covers 53.9% of the 59,670-kcal gap but fails the present-across leg
by one resolution (79/99 = 79.8% vs the 80% bar), because it first
arrives on day 20 and is absent from the 19 pre-arrival engaged days.
The gap is a combination — a late-arriving persistent Lamb's Quarters
drip plus a fatter foraged base plus an untouched starting pantry —
not a single present-across channel. The throttle-keying decision
remains Steve's call; this arm changes no keying.
