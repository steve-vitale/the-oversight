# sim-preddisc — RAID-PREDATION vs INCOME-SHORTFALL discriminator (sim-findings #163)

Arm: `sim-preddisc` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Instrument-only — `scripts/preddisc-20261014.js` (+ proof `scripts/test-preddisc-20261014.js`,
driver `scripts/sweep-preddisc-20261014.js`). Zero src/js game-code changes, zero
policy changes. Reuses `scripts/predation-lib-20261014.js` (landed on master, r30b)
for gorge/lingerer telemetry rather than rebuilding it.

Lineage: the spiralverb kill (evidence/2026-10-14/sim-spiralverb.md) showed s44's
pantry collapse was RAID-DRIVEN (~4.4k kcal/night stripped; fresh-days 24.0->1.6 in
days; the base policy's own forage trips already returning empty on worked-out
patches) while the pantry-trajectory marker couldn't distinguish it from an income
shortfall — and the haul/forage-priority verbs answered the wrong cause (-48d).
Sim-findings #163 names the next instrument: a predation discriminator
(gorge/lingerer telemetry in the marker set) before any pantry verbs are built.
THIS arm builds it. No canon doc covers the spiral posture (noted in the
spiralverb evidence) — the design constraint is the r29 kill itself.

## THE DESIGN (frozen)

`attachPreddisc(Game)` installs read-only wraps (byte-identicality proven by the
proof test, PART H):
- predation-lib's `installPredation` — gorge nights (day, kcal asked/got, monster
  id + wave), lingering episodes (entity-keyed, first/last day, gorge nights +
  kcal, resolution: killed / moved-on / lingering-at-end), drive-off records.
- NEW: `doAction('forage')` wrap — pack-kcal delta per forage attempt (the
  trip's real return); "worked out" beat counter; daily pantry sampler
  (kcal + `pantryDaysEstimate` fresh-days); scholar-death days (vid changes).

`classifyRun(T)` — the frozen rule (v1):
- Collapse window: maximal span with fresh-days < 3 (merged gaps < 4d, blips
  < 3d dropped); longest wins, ties latest.
- Attribution window: collapse window extended BACKWARD to the fall start
  (fresh-days kept falling) — the raids that cause a collapse gorge BEFORE
  fresh-days crosses below 3.
- `raidExplains` = gorge kcal in attribution window / pantry drain over the
  same window (drain floored at 3000 kcal ~ 1.5 village-days so the ratio
  can't fire on noise).
- `predation` iff raidExplains >= 0.40 OR (gorge nights >= 3 AND gorge kcal
  >= 6000). `mixed` iff raidExplains >= 0.15. Else `income`. No window ->
  `no-spiral`.
- Output: class + confidence + features + the marker set the future
  conditional-posture arm consumes (`spiral.type`, `spiral.predation`
  {gorgeNights7d, gorgeKcal7d, lingerNights7d, raidExplains7d},
  `spiral.income` {forageKcal7d, forageSuccess7d, forageTrips7d,
  freshDaysSlope7d}, `spiral.window`, `spiral.deaths` {accel per the
  spiralcond spec}) + the verb map (combat-spiral -> homebound-brace;
  pantry-income -> ranging-income-priority; pantry-raid -> raid-defense
  (UNBUILT, see #161); mixed -> combat-posture-wins per the r29 tie-break;
  none -> no-posture). The succession-feed marker is documented in the
  marker set but unimplemented — it fired 0 times in 32 runs across r28+r29;
  any consumer must measure its base rate first.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the adjudicated sweep

- INSTRUMENT: scripts/sweep-preddisc-20261014.js; per-seed JSON
  evidence/2026-10-14/preddisc-sweep.json. Policies run gate-off identical
  to baseline (FEASTSCALE_R13=1 only).
- SEEDS x POLICIES: 44 x leadfeast, 44 x belongseek, 22 x leadfeast,
  22 x belongseek (the 4 named cases), plus 55 x leadfeast, 88 x leadfeast
  (2 additional hand-verified seeds). 6 runs.
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why 180:
  the named collapses are post-wave-5-unlock phenomena (s44 d63-78, s22
  d84-171 in the historical record); shorter caps truncate the windows.
- PRIORS (from the r27/r28/r29 hand attributions): seed 44 -> predation
  (raid-driven pantry collapse); seed 22 -> income / attrition, not
  predation (pantry dips answered by income verbs, or attrition on a strong
  village).
- DIAGNOSTIC GO: the classifier's class matches the HAND-VERIFIED
  transcript/trajectory attribution on >= 4/4 named runs, PLUS >= 2
  additional hand-verified seeds classified (agreement with their
  hand-verified attributions). A miss is NO-GO per §14.
- WHAT WOULD KILL IT: any named run where the classifier disagrees with the
  hand-verified causal story; any instrument error (non-empty instrErrors);
  byte-identicality failure.
- §14 BINDING: the GO is adjudicated against the hand-verified attribution
  of the CURRENT-master runs, established from transcripts/trajectories.
  The historical parentheticals are priors, not bindings.
- MASTER-DRIFT CAVEAT (recorded pre-sweep from the 2026-10-14 shakedown):
  a 120d s44/leadfeast shakedown did NOT reproduce the r27/r28/r29
  raid-driven collapse — the run survived to the d120 cap (u5=58), showed
  only 2 gorge nights / 3095 kcal total, and its collapse window (d98-115,
  raidExplains 0.117) centered on a d95-98 pantry cliff (31.6k -> 7.1k
  kcal, 13 -> 2 fresh-days) of non-raid origin. Master moved between r29
  and now (sixthlink kill, subaid land, ledgerunload revert, coordinator
  repairs) and s44 may be a TIMESTAMP-ID-RESIDUAL flip seed. If the
  adjudicated runs don't reproduce the historical shapes, the evidence
  records the drift; the instrument is judged against OBSERVED ground
  truth, and a systematic historical-vs-current mismatch is a drift
  finding, not an instrument miss — UNLESS the instrument disagrees with
  the hand-verified current attribution, which is a NO-GO.

## Proof tests

scripts/test-preddisc-20261014.js — RED phase run against the stub
(31 failures as designed: 'unclassified' / null), then GREEN after
implementation: 38/38.
- PART P: classifyRun on synthetic shapes — s44-shaped (gorge-heavy,
  raidExplains 0.978) -> predation; s22-shaped (no gorge) -> income;
  both-causes (raidExplains 0.195) -> mixed; no collapse -> no-spiral.
- PART W: findCollapseWindow — finds the <3-fresh-days span, merges <4d
  gaps, drops <3d blips, latest-wins ties.
- PART M: the marker set carries every verb class the spiralverb kill names.
- PART H: s44 60d wraps vs no-wraps — per-day state hashes BYTE-IDENTICAL
  (read-only instrument).
- PART S: 40d instrumented leadfeast sim — all streams flow, classifyRun
  returns a valid class.

## RESULTS

Sweep: 6/6 runs completed (4 named + 2 additional, 180d death-aware,
deterministic single-process; instrument attached, policies gate-off
identical to baseline). Per-seed JSON:
evidence/2026-10-14/preddisc-sweep.json (44/22 x leadfeast/belongseek),
evidence/2026-10-14/preddisc-sweep-add.json (55/88 x leadfeast).
Proof scripts/test-preddisc-20261014.js: 38/38 GREEN (RED phase: 31
failures against the stub, as designed). No instrument errors in any run.

### Classification table (classifier output vs hand-verified attribution)

| Run | Days / end | u5 | Classifier | raidExpl | gorge (n/kcal) | Hand-verified causal story | Match |
|-----|-----------|----|-----------|----------|----------------|---------------------------|-------|
| leadfeast s44 | 140 lost | 58 | income (med) | 0.117 | 2 / 3,095 | Overstock 39.8k -> wealth-drawn 5-monster raid d94 -> 4 lingerers gorge ~3k (12% of 26k drain) -> 4.7k aid sent -> spoilage discard ~10-12k -> grind (worked-out patches, human raids) -> lost d140. NOT raid-driven at collapse scale. | YES |
| leadfeast s22 | 178 lost | 96 | income (high) | 0.000 | 0 / 0 | Terminal spoilage cascade ("threw out spoiled stores" xN) + human raids/extortion + worked-out forage + scholar starving. 0 gorge in-window. NOT raid-predation. | YES |
| belongseek s44 | 72 lost | — | income (high) | 0.000 | 0 / 0 | Early collapse: 19k cliff d42-43 (spoilage pattern), grind to 0 by d69, 0 gorge, 0 lingerer episodes. NOT raid-predation. | YES |
| belongseek s22 | 180 survived | 85 | no-spiral (high) | — | 0 / 0 | Thriving village; pantry 47k->86k; fresh-days never <3 for >=3d. Correctly no call. | YES |
| leadfeast s55 | 180 survived | 86 | no-spiral (high) | — | 0 / 0 | Survived; pantry 4.4k-84k; no collapse window. Correctly no call. | YES |
| leadfeast s88 | 27 lost | — | income (high) | 0.000 | 0 / 0 | Early collapse: trust-trap starvation (STARVING d14 with 27k in pantry) + 7 villager/villager deaths + consumption; 0 gorge. NOT raid-predation. | YES |

6/6 classifier-vs-hand-verified agreement.

### The master-drift finding (pre-registered caveat confirmed)

The historical s44 raid-driven collapse (r27/r28/r29: ~4.4k kcal/night
stripped, fresh-days 24.0->1.6) did NOT reproduce on current master in ANY
of the 6 runs. The closest live predation event — leadfeast s44's d94
5-monster wealth-drawn raid with 4 lingering gorgers — produced only 3,095
kcal of gorge against a 26,377 kcal drain (raidExplains 0.117): a real raid,
correctly rejected as the collapse driver. Predation sensitivity is therefore
proven on synthetic s44-shaped telemetry only (proof PART P: raidExplains
0.978 -> predation). The next validation of this instrument should seek a
live predation-positive case (or a forced-gorge full-collapse scenario in
the style of the predation-lib proof's PART B).

### The spoilage theme (out of arm scope — documented, not chased)

3 of the 4 collapse runs were spoilage-driven, not income- or raid-driven:
s44 ("Spoiled and discarded" x10+ on d96 after the racks held 15,626 kcal,
"more than the haven can eat before it turns"), s22 ("The village threw out
spoiled stores" repeatedly d161-168, "Should've smoked that"), belongseek
s44 (same beat d45+). The villages OVER-PRODUCE into pantries the
preservation chain can't hold, then rot the surplus — and the overfull
pantry literally draws raids ("WEALTH DRAWS TEETH": 3 raiders base, +1 per
12k kcal above the 3k smell-line, cap 5 — src/js/havenGrowth.js). The
discriminator's 'income' class is currently the residual "not raid-driven"
bucket for these; the future verb mapping needs a preservation /
pantry-management answer, because ranging/income verbs would not have
prevented the s44/s22 cliffs (foragers had already stood down: "the pantry
can't take more; the wild will keep"). Filed as a new sim-findings item.

## Per-run autopsy (hand-verified — SENSE-TESTING LAW)

**leadfeast s44 (d140 village-lost).** The transcript reads as a village
that ate itself rich and then rotted. d88: "🍖 FEAST 📺 — Leandro opens the
pantry wide" and "The racks are already full (15,626 kcal kept — more than
the haven can eat before it turns), so Ivy left the fresh pile for tonight's
dinner instead of smoking it". d90-94: "🌿 Devon checks the pantry before
heading out — the shelves are full... The pantry can't take more; the wild
will keep." d94: "🐗 RAID — 5 raiders (Big Ugly, Big Loud, The Spoiler, The
Eulogy, Old Stare) hit Haven in the night, drawn by the smell of the
pantry!" / "Nobody met the The Spoiler — it's still out there at the
treeline. It'll gorge every night until it's driven off." d95: three gorge
beats ("The lingering Old Stare gorges at the treeline — 1,083 kcal gone
from the stores. Drive it off, or call for help."), plus "🌾 Haven sends
1,583 kcal of grain to Emberhold's fire" x3 (4.7k aid). d96: "You are full
enough. Spoiled and discarded: Fish catch (smoked). The Codex notes the
waste." x10+. Then the grind: "This patch is worked out" xN, "🌙 Raid —
Thornfield... carried off ~600 kcal", "🌙 Raid — The Bloodied... carried off
~1352 kcal", "⚠ STARVING: health and energy falling", d101: "🗣️ Emma to
Elena, by the fire: 'The pantry's the thing. We don't raise The Palisade on
empty shelves — 6,908 of 14,000 kcal.'" The village talked about its
problem, named it, and died of it anyway. Classifier: income (medium) —
correct rejection of predation; the medium confidence is honest about the
real-but-small raid component.

**leadfeast s22 (d178 village-lost).** A 178-day run with 12 scholar deaths
and a d96 wave-5 unlock that ends in a spoilage terminal spiral. d161-168:
"The village threw out spoiled stores: Tribute grain from Emberhold...
Tariq mutters: 'Should've smoked that. Fresh stuff keeps a day or two on
the shelf — the smoke rack is right there.'" d161: "🌙 Raid — Emberhold...
carried off ~1500 kcal". d164: "🌙 Night. Shouts from the treeline — Omar of
The Bloodied with 3 others... 'Your pantry or your blood. Choose.' (They
want ~2,000 kcal.)" d166: "🧳 A traveler from northeast says Emberhold is
starving — Deshawn's been seen counting empty jars, and the kids have gone
quiet." The scholar starves ("You keep a day's food (450 kcal) — nothing
extra for the pantry this time") while the pantry rots. Zero monster gorge
in the window. Classifier: income (high) — correct.

**belongseek s44 (d72 village-lost, no unlock).** A fast early collapse:
pantry 42.1k (d42) -> 23.2k (d43) -> 0 (d69). d45+: "threw out spoiled
stores", "This patch is worked out" xN, "⚠ STARVING", "🌙 Raid — Stonebridge
... carried off ~1197 kcal" (human). Zero monster gorge, zero lingerer
episodes in the entire run. Classifier: income (high) — correct.

**belongseek s22 (d180 survived).** The thriving counterfactual: pantry
47k->86k, wave-5 at d85, no collapse window, 10 scholar deaths absorbed.
Classifier: no-spiral (high) — correctly makes no call.

**leadfeast s55 (d180 survived).** Survived; pantry 4.4k-84k; fresh-days
never below 3 for 3+ days. Classifier: no-spiral (high) — correct.

**leadfeast s88 (d27 village-lost, no unlock).** Early violence collapse: 7
villager/villager deaths in 27 days, scholar STARVING on d14 with 27k in the
pantry ("Village meal: +2000 kcal... Half ration — they don't trust you
yet" — the trust trap), pantry 27k -> 0 by d27. Zero gorge. Classifier:
income (high) — correct rejection of predation (the collapse is
violence/attrition-driven, but the pantry fell without any raid looting).

## Adjudication (§14 — binding)

- DIAGNOSTIC GO: classifier matches hand-verified attribution on 4/4 named
  runs (leadfeast s44: income; belongseek s44: income; leadfeast s22:
  income; belongseek s22: no-spiral) PLUS 2 additional hand-verified seeds
  (leadfeast s55: no-spiral; leadfeast s88: income) — 6/6 agreement. GO MET.
- WHAT WOULD KILL IT: no misses; instrErrors empty in all 6 runs;
  byte-identicality holds (proof PART H).
- The GO is met on observed ground truth per the pre-registered binding.
  The historical priors (s44 -> predation) did not reproduce — recorded as
  master drift above, not an instrument miss: the instrument correctly
  rejected predation on the current-master s44 (raidExplains 0.117, real
  raid but not collapse-driving).

## Verdict: GO — instrument proven and validated (with recorded caveats)

The predation discriminator is built, proven (38/38), and validated: 6/6
agreement with hand-verified transcript/trajectory attribution, read-only
(byte-identical), complete marker set for the future conditional-posture
arm. Sim-findings #163 is FIXED by this arm (the named next instrument
exists). Caveats for the consumer arm: (1) no live predation-positive case
reproduced on current master — sensitivity proven on synthetic shapes only;
(2) the 'income' class is currently the residual "not raid-driven" bucket
and absorbs spoilage-driven collapses, for which ranging/income verbs are
the wrong answer — the verb mapping needs a preservation/pantry-management
branch.

## Metric review

§14 honored: GO adjudicated against hand-verified current-master
attribution, not the historical priors. Doubts for the NEXT run:
(1) The adjudication set contained zero live predation-positives, so this
GO tests specificity (correctly rejecting predation) but not live
sensitivity. Next validation should construct or find a live
predation-positive (forced-gorge full-collapse scenario, or a wider seed
sweep on a master where the r27-r29 s44 shape reproduces).
(2) The 3-class scheme has no "spoilage/overstock" class — 3 of 4 collapse
runs were spoilage-driven. If the consumer arm keys verbs to these classes,
'income' will misfire ranging verbs on rot collapses. Consider a 4th class
or a spoilage sub-marker (discard kcal in-window is measurable from the
"threw out spoiled stores" / "Spoiled and discarded" beats).
(3) The ring-buffer transcript (latest 400 collapse-relevant lines) served
hand-verification, but long windows push out early-window lines (the d88-96
lines were lost behind d97+ chatter on s44). Future drivers should capture
per-window (e.g., flush the buffer at window detection) rather than
latest-N.
(4) The 180d x 6-run adjudication cost ~10 minutes of compute — wider seed
sets are affordable; the 8-seed pilot minimum from §9 is a floor, not a
ceiling, for instrument validation.
