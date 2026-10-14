# RAID-TRIGGER INSTRUMENT — lived rate of pantry-drawn raids (longsim r31 ARM 1, 2026-10-14)

Axis: scale-onramp. Diagnostic arm — no game-code lever; sim-findings #176
(RAID-TRIGGER INSTRUMENT). The unloaddiv r30 diagnostic confirmed raid
pressure explains the trust-recovery divergence, but raids are partly
ENDOGENOUS to the trajectory and the WEALTH-DRAWS-TEETH mechanism
(overfull pantry draws raids) was only measured as a static rule
(havenGrowth.js havenRaidTick: raid iff pantry >= 3000 kcal AND 3+
world monsters AND >=7d since last raid AND no table sitting, ~18%/day
when ripe; raiders = 3 base, +1 if pantry > 12000, +1 if pantry > 24000,
cap 5). This arm measures it as a LIVED RATE.

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **QUESTION**: does pantry fullness mechanically attract raids at a
  measurable lived rate (raid nights per 100 village-nights per pantry
  band), and does the raid-size distribution match the static rule's
  prediction (3/4/5 raiders at the 3k/12k/24k thresholds)?
- **PRIMARY METRIC**: the lived rate curve — raid nights per 100
  village-nights per pantry-fullness band ('<3k' | '3-12k' | '12-24k' |
  '>24k'), plus the raid-size distribution vs the static rule's prediction
  (matchedRule / sizedNights). Collapse-class separation (preddisc:
  RAID-PREDATION vs INCOME-SHORTFALL vs MIXED) on every collapse run, so
  rot-driven collapses don't masquerade as predation.
- **GO THRESHOLD**: the instrument answers the question with NUMBERS on a
  validated proof — test-raidtrigger PART RED (sabotaged instrument fails
  the verdict) + PART C (honest instrument reproduces the static rule on
  constructed wealthy/thin scenarios) + PART H (byte-identical honesty)
  all green, det-gate 16/16, and the sweep completes all 16 combos with
  a per-band rate curve. This is a DIAGNOSTIC arm — the verdict IS the
  curve, honest direction either way.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 x leadcourt/belongseek = 16
  combos, 180d death-aware (+10d tail), identical-seed, current-master
  post-fix code both policies.
- **DET-GATE**: scripts/det-gate.js checkDeterminism FIRST on every combo —
  16/16 identical required (instrument read-only-ness proven by PART H).
- **HONEST CAVEATS (pre-registered)**: (a) PREDATION-POSITIVE DROUGHT —
  r30's sensitivity check reproduced no live predation-positive on current
  master; if this suite shows zero/low raids, that is reported honestly,
  not levered into existence; (b) 'income' is a residual bucket in
  preddisc — overfull pantries both ROT the surplus (OVERSTOCK-ROT) and
  draw raids, so the rate curve must separate rot-driven collapses from
  predation-driven ones (preddisc class per run).

## Det-gate

**16/16 IDENTICAL.** All seed x policy combos bit-identical across two
in-process invocations (leadcourt s33: 34d/village-lost both; s44:
180d/survived both; belongseek s88: 30d/village-lost both, etc.).
Trajectories are trustworthy; cross-combo differences are real.

## Instrument proof (scripts/test-raidtrigger-20261014.js) — 35/35 GREEN

- PART R (pure): bandOf/expectedRaiders edges match the engine's
  thresholds exactly (2999→'<3k', 3000→'3-12k', 12000→'3-12k',
  12001→'12-24k', 24000→'12-24k', 24001→'>24k'; expectedRaiders 3/3/3/4/4/5).
- PART RED (real red): with RT_SABOTAGE_BANDS=1 (the instrument's own
  documented defect hook), the static-rule verdict FAILS on both the
  wealthy and thin constructed scenarios — the verdict can see band
  defects. If it had passed, the test fails loudly.
- PART C (constructed live): wealthy pantry (30k, 5 world monsters, day
  50, 40 re-armed nights) → raids fired, EVERY fired tick read band
  '>24k' with raiders === 5 === expected, matchesRule true. Thin pantry
  (2.5k) → 0 raids in 40 nights, every tick band '<3k'.
- PART H (live honesty): instrumented x2 vs pristine, seed 11 leadcourt
  30d — byte-identical per-day hashes (and again at 15d in the sweep's
  SMOKE gate, both policies). Read-only proven.
- PART S (live smoke): 40d instrumented run — every stream flows
  (41 ticks, 3 fired), 4-band curve finalizes, 0 instrument errors.

## The verdict — the lived rate curve (aggregate, 16 combos, 1985 nights)

| band | nights | raid nights | rate /100 nights | ripe nights | blocked: gap | blocked: RNG | blocked: thin/monsters |
|---|---|---|---|---|---|---|---|
| <3k | 133 | 0 | **0.0** | 0 | 0 | 0 | 133 / 0 |
| 3-12k | 404 | 38 | **9.4** | 187 | 217 | 149 | 0 / 0 |
| 12-24k | 315 | 31 | **9.8** | 144 | 171 | 113 | 0 / 0 |
| >24k | 1133 | 92 | **8.1** | 531 | 602 | 439 | 0 / 44 |

**Pantry fullness does NOT change raid frequency.** Above the 3k
smell-line the lived rate is flat at ~8–10 raids per 100 village-nights
in every band; below the line it is exactly 0 (133/133 nights blocked
on the thin-pantry gate — the smell-line works as designed).

What the rate IS made of: of 862 ripe nights (all preconditions met),
161 fired = **18.7% — the engine's ~18%/day roll, measured live**. The
dominant suppressor is the 7-day gap (990 blocked nights), then the RNG
roll (701), then thin pantries (133). Table-sanctity blocked 0 (no run
sat the table). Monster-thinness blocked 44, all in the >24k band.

**Caveat (a) resolved against the drought**: no predation-positive
drought here — 161 raid nights across 16/16 combos, every combo fired
at least twice. Raids are a lived, routine pressure on current master.

## Raid-size distribution vs the static rule

161 sized nights, **161 matched the static rule, 0 mismatched**:
- 3-12k band: 38 raids, all 3 raiders
- 12-24k band: 31 raids, all 4 raiders
- >24k band: 92 raids, all 5 raiders

Wealth draws TEETH, not more raid nights. The static rule's size
scaling is deterministic in the lived game, not just in the code.

Consequence for r30's endogeneity question: the armed trajectories that
faced strictly more gorge nights than their identical-seed controls did
NOT get them via "fuller pantry → more raids" — frequency is
pantry-blind. The extra raids must come through the other preconditions
(more nights with 3+ world monsters, gap-cadence alignment, longer
trajectories) — a refined open question, not this arm's.

## Pantry path (which store the raiders hit)

50 raidPillage draws across the suite: 51,024 kcal asked, 62,323 kcal
taken (taken > asked: pantryDraw's ceil-on-indivisible-pieces rounding —
the engine's own draw record, read not computed). Top stores hit:

1. Foraged food — 17,151 kcal
2. Fish catch — 13,137 kcal
3. Foraged food (dried, preserved) — 7,607 kcal
4. Rice — 5,000 kcal
5. Tribute grain from Stonebridge — 4,000 kcal
6. Tribute grain from Emberhold — 4,000 kcal
7. Muscadine Grapes (ready) — 3,960 kcal
8. Blackberry (ready) — 2,275 kcal

The engine's pantryDraw is FRESH-FIRST (blitz-eatlast): raids strip the
freshest, most valuable stores first — the exact inverse of the nightly
meal's old smallest-first pathology. Raiders also eat tribute grain.
Design note for the raid-aware ration arm (r31 ARM 3): a siege strips
fresh food first, so tightening rations on preserved stores while
lingerers gorge does NOT protect the fresh stock — the policy needs to
know what the raiders actually take.

## Collapse separation (preddisc classes, 16 combos)

| class | n | seeds |
|---|---|---|
| income | 10 | lc 11/44/55/66, bs 22/33/55/66/77/88 |
| predation | 3 | lc 22/33/88 |
| mixed | 1 | bs 11 |
| no-spiral | 2 | lc 77, bs 44 |

Caveat (b) holds as pre-registered: 'income' is the residual bucket and
absorbs the spoilage/overstock collapses (preddisc's own metric-review
flagged the missing 4th class). The 3 predation-class runs are all
leadcourt (lc 22: 8 gorge nights/9.5k; lc 33: 5/14.2k; lc 88: 3/9.1k).
Rot-vs-predation separation is per-run in the per-seed JSONs.

## Per-seed table

| seed | policy | days | end | nat | class | raidN | gorgeN | gorgeK |
|---|---|---|---|---|---|---|---|---|
| 11 | leadcourt | 144 | village-lost | 1 | income | 10 | 4 | 3606 |
| 22 | leadcourt | 155 | village-lost | 0 | predation | 14 | 8 | 9477 |
| 33 | leadcourt | 34 | village-lost | 0 | predation | 3 | 5 | 14240 |
| 44 | leadcourt | 180 | survived | 1 | income | 13 | 2 | 1352 |
| 55 | leadcourt | 112 | village-lost | 1 | income | 10 | 1 | 1552 |
| 66 | leadcourt | 94 | village-lost | 1 | income | 9 | 0 | 0 |
| 77 | leadcourt | 107 | village-lost | 1 | no-spiral | 10 | 2 | 8340 |
| 88 | leadcourt | 39 | village-lost | 0 | predation | 4 | 3 | 9099 |
| 11 | belongseek | 172 | village-lost | 1 | mixed | 17 | 3 | 3776 |
| 22 | belongseek | 180 | survived | 0 | income | 17 | 0 | 0 |
| 33 | belongseek | 165 | village-lost | 1 | income | 13 | 7 | 8150 |
| 44 | belongseek | 180 | survived | 1 | no-spiral | 12 | 0 | 0 |
| 55 | belongseek | 115 | village-lost | 1 | income | 10 | 1 | 900 |
| 66 | belongseek | 156 | village-lost | 1 | income | 10 | 1 | 1831 |
| 77 | belongseek | 117 | village-lost | 1 | income | 7 | 0 | 0 |
| 88 | belongseek | 30 | village-lost | 0 | income | 2 | 0 | 0 |

Note the s33 split: leadcourt dies at 34d under a 5-gorge-night siege
(14.2k stripped) while belongseek on the identical seed survives 165d —
the same seed's raid pressure is trajectory-dependent, and the
classification follows the trajectory, not the seed.

## Wall numbers

national 11/16, table 0/16, wins 0/16, exiled 0/16, vests 0,
max wave 4, median survival 130.5d (days: 30,34,39,94,107,112,115,117,
144,155,156,165,172,180,180,180). The scale wall stands: raids are
measured and routine, and still nobody wins.

## Village assessment (SENSE-TESTING LAW — beats read, not just counted)

s33 leadcourt (34d, predation): the fiction is half-honest. Day 13 —
"🐗 RAID — 5 raiders (Highbeam Deer, Hummice, Flashbulb Moth, Flashbulb
Moth, Lockpick) hit Haven in the night, drawn by the smell of the
pantry!" The village was already >24k by day 13 — rich early, and the
raid that came was the biggest kind. Day 30 — "🐗 RAID — 4 raiders (The
Understudy, tick, White Noise, The Big Beast)"; three unmet lingerers,
then three nights of "🌙 Night. The lingering The Big Beast gorges at
the treeline — 1,787 kcal gone from the stores. Drive it off, or call
for help." The village dies at 34d with the treeline still full. Every
beat reads as the fiction claims — EXCEPT the fiction says "drawn by
the smell," which implies more food = more raids. The mechanics say
more food = BIGGER raids, same cadence. A villager deciding to keep
the pantry lean to dodge raids would be acting on a lie the fiction
tells. That mismatch is worth a design note, not a bug report — but
it should be a conscious choice.

No robotic flags: defenders meet raiders blow-by-blow, unmet raiders
linger with a real choice attached (drive it off / call for help),
gossip seeds ('raid' topic), away-scholars get the news on return.

## Blanks filled / documented

- **sim-findings #176 — ANSWERED, GO.** The raid-trigger instrument
  exists (scripts/raidtrigger-20261014.js), is proven (35/35 incl. real
  RED), and produced the lived rate curve: frequency is pantry-blind
  above the smell-line (~8–10/100 nights flat); size scales 3/4/5 at
  161/161 (100%). WEALTH-DRAWS-TEETH is now measured as a lived rate,
  not just a static rule. Claim marked fixed by this arm.
- **New open (refined, not chased): ENDOGENOUS RAID PRESSURE v2** — with
  frequency pantry-blind, the r30 armed→more-raids pattern must run
  through the other preconditions (world-monster count nights, 7-day
  gap cadence). Needs a trajectory-covariate instrument, not a policy arm.
- **Design note for ARM 3 (raid-aware ration policy)**: raids strip
  fresh-first (foraged food 17k, fish 13k). Ration tightening must
  account for what raiders actually take.
- **Fiction/mechanics half-honesty** ("drawn by the smell" implies
  frequency scaling the engine doesn't implement): documented for the
  steve-call on whether the dramatic irony is intended.

## Metric review (§14, mandatory)

- DIAGNOSTIC GO (instrument answers the question with numbers on
  validated proof): MET — proof 35/35 (real RED fails, honest GREEN
  passes, byte-identical honesty, live smoke), det-gate 16/16, sweep
  16/16 complete, per-band curve + size distribution + pantry path all
  computed. The verdict is the curve itself; no re-scoring was needed
  or done.
- The pre-registered caveat (a) (predation-positive drought) resolved
  AGAINST the drought: 161 raid nights, every combo fired. Reported
  as a finding, not a lever.
- Caveat (b) (residual 'income' bucket) held: 10/16 collapses classify
  income, absorbing rot-driven ones per preddisc's own flag. The
  separation is per-run in the per-seed JSONs; a 4th class (spoilage)
  remains future work.
- Metric concern for the next arm: the rate curve's denominator is
  nights-at-tick; a trajectory-covariate version (monster-count nights,
  gap-phase) would explain the endogenous variance the flat curve
  leaves unexplained. Also the per-seed JSONs carry everything the
  coordinator's telemetry-check needs (national/table/wins/exiled as
  0/1 numerics).

## Convergence report

- Convergence: diagnosed-GO on sim-findings #176 (instrument landed,
  question answered with numbers). Axis scale-onramp: still blocked —
  0/16 wins, 0/16 table; raids are now a measured, routine pressure
  (not the wall's missing piece).
- Wall numbers this run: national 11/16, table 0/16, wins 0/16,
  wave 4-5: max wave 4 (no wave-5 unlocks), median survival 130.5d.
