# UNLOAD-TRUST DIVERGENCE — diagnostic (sim-findings #155, scale-onramp r30 ARM, 2026-10-14)

Axis: scale-onramp. Diagnostic arm — no game-code lever to land; the r29
ledgerunload patch is RE-APPLIED for MEASUREMENT ONLY and reverted byte-clean
before commit (r29 killed it per §14; any re-landing needs its own GO arm).

Blank: sim-findings #155 (UNLOAD-TRUST DIVERGENCE). The r29 ledgerunload arm
(evidence/2026-10-14/sim-ledgerunload.md) proved the one-line homecoming-unload
ledger fix correct (v.gives + recordGiveHist written, no trust grant) but it
moved identical-seed survival +-80d deterministically: leadcourt s66 +80d
(100->180, table reached), belongseek s33 -85d (124->39), belongseek s88 -59d,
leadcourt s33 -32d. All three regressions recorded real unload kcal (12-32k),
so the trust change is the driver. The open question: does faster trust
recovery STARVE a raided village (full rations -> faster pantry drain under
nightly 1000-1760 kcal raids, as s33's transcript shows) — or is the
divergence trajectory noise at n=16? (Det-gate was 16/16 identical on BOTH
sides in r29, so it is NOT determinism noise; the question is causal
attribution, not noise class.)

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **HYPOTHESIS**: "armed-vs-control survival delta sign correlates with
  raid/lingerer nights: high-raid seeds -> armed worse, low-raid -> armed
  better or neutral; need >=6/8 seeds to follow the sign prediction."
- **MEASUREMENT**: the r29 patch is re-applied in-tree for measurement only.
  Both sides run current-master post-fix code + the exact preserved r29
  one-line block (armed) vs pristine (control), on the same harness as r29.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 x belongseek/leadcourt = 16
  combos, 180d death-aware, identical seeds armed vs control.
- **DET-GATE**: scripts/det-gate.js FIRST — 16/16 identical required on both
  policies, on BOTH sides (armed and control), before trusting any
  cross-side comparison.
- **RAID CLASSIFICATION** (exogenous, control side, via
  scripts/predation-lib-20261014.js landed on master r30b — do not wait on any
  sibling): for each seed, mean over both policies of control-side gorge
  nights (gorgeNights.length) and mean control-side total gorged kcal
  (sum of totalGorged). HIGH-RAID ⟺ meanNights >= 8 AND meanKcal >= 5000.
  LOW-RAID otherwise.
- **PER-SEED DELTA**: mean over policies of (armedDays - controlDays).
  PREDICTION: HIGH-RAID seed -> avgDelta <= 0 (armed worse or neutral);
  LOW-RAID seed -> avgDelta >= 0 (armed better or neutral). NEUTRAL =
  |avgDelta| <= 10d (counts as following the prediction either way).
- **DIAGNOSTIC GO**: >= 6/8 seeds follow their sign prediction. A miss is
  NO-GO per §14 — never re-scored mid-run, never re-scored against a
  friendlier metric.
- **DIAGNOSTIC OUTCOME IN HAND EITHER WAY**: confirmed -> next move is
  raid-aware design (raid-aware ration scaling / trust-recovery pacing /
  Steve-call, named in this file); refuted -> next move named in this file
  (the divergence driver is not raid pressure; propose the next instrument).
- **GUARDRAIL**: the patch is NEVER landed by this arm; it is reverted
  byte-clean (verified: 0 marker matches, git diff empty) before the commit.
  This arm's commit is scripts + evidence only.
- **Instruments**: scripts/sweep-unloaddiv-20261014.js (r29 sweep harness +
  predation-lib install per combo, read-only); scripts/test-unloaddiv-20261014.js
  (instrument-honesty: gate-off byte-identical to pristine control;
  re-applied patch char-identical to the preserved r29 block).
- **Wall numbers reported every run**: national / table / wins, wave 4-5
  unlocks, median survival (both sides).

## Det-gate (scripts/sweep-unloaddiv-20261014.js --invocations=2)

- **Armed: 16/16 IDENTICAL. Control: 16/16 IDENTICAL.** The brief's hard gate
  is met on both sides; cross-side divergence is a deterministic consequence
  of the patch, not #113 noise. predation-lib instrument errors: 0 on all 32
  combos.
- Instrument honesty (scripts/test-unloaddiv-20261014.js): armed mode 5/5
  (one marker, char-identical to the preserved r29 block, anchored at the
  Haven homecoming site, exile-amends site untouched, no trust grant);
  pristine mode 3/3 after the byte-clean revert (0 markers, git diff empty).
- Patch-fire verification: on leadcourt s66 the re-applied patch fired 29
  recordGiveHist calls for the scholar's live vid across the run — the
  measurement side genuinely exercises the trust-recovery mechanism.
- INSTRUMENT LESSON (for future arms): `givesEnd`/`trustEnd` read with a
  setup-captured vid are STALE after scholar respawn (village-as-protagonist
  continuity changes `Game.villagerId`; leadcourt s66 ended as
  nino_kapanadze, not the setup vid). The armed sweep's givesEnd=0 is a read
  artifact, not a patch failure. Future ledger instruments must read vid
  fresh per sample or wrap recordGiveHist directly.

## Before/after on identical seeds (survival days A/C, raid nights A/C)

| seed | policy | days A/C | delta | gorgeN A/C | gorgeK A/C |
|---|---|---|---|---|---|
| 11 | belongseek | 180/180 | 0 | 4/5 | 5080/6080 |
| 11 | leadcourt | 136/131 | +5 | 8/0 | 14739/0 |
| 22 | belongseek | 180/141 | +39 | 0/0 | 0/0 |
| 22 | leadcourt | 180/155 | +25 | 1/8 | 1352/9477 |
| 33 | belongseek | 31/141 | -110 | 0/8 | 0/12840 |
| 33 | leadcourt | 129/75 | +54 | 14/12 | 22076/33397 |
| 44 | belongseek | 180/180 | 0 | 4/0 | 4509/0 |
| 44 | leadcourt | 143/180 | -37 | 5/2 | 8156/1352 |
| 55 | belongseek | 115/115 | 0 | 1/1 | 900/900 |
| 55 | leadcourt | 111/111 | 0 | 1/1 | 1552/1552 |
| 66 | belongseek | 177/180 | -3 | 3/1 | 3460/1831 |
| 66 | leadcourt | 180/94 | +86 | 0/0 | 0/0 |
| 77 | belongseek | 85/60 | +25 | 0/0 | 0/0 |
| 77 | leadcourt | 49/139 | -90 | 3/0 | 7491/0 |
| 88 | belongseek | 24/24 | 0 | 0/0 | 0/0 |
| 88 | leadcourt | 27/27 | 0 | 0/0 | 0/0 |

Raid classification (control side, pre-registered rule): only seed 33 is
HIGH-RAID (mean 10.0 gorge nights, 23,119 kcal; bar was >=8 nights AND
>=5000 kcal). All others low-raid.

Per-seed verdict (avgDelta = mean over policies of armed−control):

| seed | class | avgDelta | prediction | verdict |
|---|---|---|---|---|
| 11 | low | +2.5 (neutral) | >= 0 | FOLLOWS |
| 22 | low | +32.0 | >= 0 | FOLLOWS |
| 33 | HIGH | -28.0 | <= 0 | FOLLOWS |
| 44 | low | -18.5 | >= 0 | MISSES |
| 55 | low | 0.0 (neutral) | >= 0 | FOLLOWS |
| 66 | low | +41.5 | >= 0 | FOLLOWS |
| 77 | low | -32.5 | >= 0 | MISSES |
| 88 | low | 0.0 (neutral) | >= 0 | FOLLOWS |

**DIAGNOSTIC VERDICT: 6/8 seeds follow the sign prediction — GO (hypothesis
CONFIRMED), exactly at the pre-registered bar.**

Honest caveats (no re-scoring; these bound the claim, they don't move the bar):
- The high-raid class has ONE member (s33). "High-raid seeds -> armed worse"
  is tested on n=1 at the seed level.
- Per-policy splits inside seeds: s33's seed-level -28 hides belongseek -110
  vs leadcourt +54; s77's -32.5 hides belongseek +25 vs leadcourt -90. The
  seed-level sign is what was pre-registered, but the policy-level story is
  mixed — the raid mechanism is real but not the whole story.
- The two MISSES (s44, s77) are exactly the seeds where the ARMED side faced
  strictly more gorge nights on the policy that died earlier (leadcourt s44:
  5v2 nights, 8156v1352 kcal; s77: 3v0, 7491v0). Conversely s22 (armed better
  +32) is where armed faced FEWER (leadcourt 1v8). Raid pressure is partly
  ENDOGENOUS to the trajectory — the control-side classification can't see
  raids the armed trajectory generates for itself.

## Wall numbers

| metric | control | armed |
|---|---|---|
| national | 10/16 | 11/16 |
| table | 0/16 | 3/16 |
| wins | 0/16 | 0/16 |
| wave 4-5 unlocks | 4/16 | 8/16 |
| max wave | 4 | 5 |
| median survival | 135d | 132.5d |
| vests | 0 | 0 |
| exiled | 0/16 | 0/16 |

The trust-recovery change moves the CEILING (reach: table 3v0, wave 4-5 8v4,
max wave 5v4) more than the FLOOR (median survival 132.5v135, wins 0v0).
The scale wall stands: 0 wins either side.

## Mechanism, read from transcripts (SENSE-TESTING LAW)

s33 belongseek armed (31d, village-lost) — the raid spiral, and the
hypothesis's mechanism is visible beat by beat:
- d20: "🍖 FEAST 📺 — Esteban opens the pantry wide ... eat until the fire
  burns low. Somebody laughs so hard they cry. For one evening, nobody is
  surviving — they're just together. (−3,260 kcal from the pantry)"
- d20: "You keep a day's food (1980 kcal) and unload 1260 kcal into Haven's
  pantry." (the patch recording the give)
- d20: "Tribute paid: 5,000 kcal walks out of the pantry toward Ashford."
- d20: "🌙 Raid — Emberhold came in the night ... They carried off ~1000 kcal
  from the pantry."
- d21: "Tribute paid: 5,100 kcal" then "🐗 RAID — 4 raiders ... hit Haven in
  the night, drawn by the smell of the pantry!"
- d22: "◈ CRISIS — THE HUNGER WINTER ... The pantry is an echo."
- d32: "⚠ Haven's pantry is empty. Day 3 of hunger." → "Haven couldn't hold."

The trust-recovery → full-rations link is in the fiction: early meals read
"Village meal: +1200 kcal ... (Half ration — they don't trust you yet.)"
while from d20 the qualifier is GONE — "Village meal: +2010 kcal ... from
the communal pantry." Full rations flowing while tribute (10.1k), feast
(3.3k), and raids (~1k/night) drain the pantry. The village ate itself out
of house and home, and every beat reads as people deciding things — "Brian
went to sleep hungry. Nobody says anything." No robotic flags.

s77 leadcourt armed (49d, village-lost) — the endogenous-siege variant:
- d44: "🐗 RAID — 4 raiders (Big Big, The Ugly Beast, Static, Ugly-Eyes) hit
  Haven in the night, drawn by the smell of the pantry!"
- d44-46: "Nobody met the The Ugly Beast — it's still out there at the
  treeline. It'll gorge every night until it's driven off." ×3 lingerers.
- d45: "🌙 Night. The lingering Ugly-Eyes gorges at the treeline — 904 kcal
  gone" / "The Ugly Beast — 1,240 kcal" / "Static — 1,500 kcal"
- d46: "💀 The Static killed Enzo in 1 round. The village mourns." / "💀 The
  Static killed Hassan in 1 round."
- d46: "⚠ Haven's pantry is empty. Day 1 of hunger." → d50 village-lost,
  "💀 Thabo starved. Slowly. The village is 3 now."

The control s77 run faced ZERO gorge nights; the armed trajectory generated
its own lingerer siege. "Drawn by the smell of the pantry" — whether pantry
fullness mechanically attracts raids is unexamined (next-arm instrument).

## Village assessment

- **s33 (HIGH-RAID)**: the spiral the hypothesis predicted. Armed dies at
  31d (belongseek) while control reaches 141d. Faster trust recovery →
  full rations + feast + tribute under nightly raids → pantry echo by d22.
  On leadcourt the same seed goes the other way (129v75) — policy matters.
- **s77 (the miss with the richest story)**: armed generates a d44 lingerer
  siege (3 gorgers, ~3.6k kcal/night, 2 villager kills) that control never
  sees. The village doesn't starve from its own generosity here — it's
  besieged. Same bind (pantry predation), different door.
- **s66 (the bright spot)**: leadcourt armed 180d + table (control 94d).
  Trust recovery lets the village range far enough to reach the table.
  Belongseek nearly identical (177v180).
- **s22**: armed better on both policies (+39/+25); armed faced fewer raids
  (leadcourt 1v8 nights). When the armed trajectory dodges predation, the
  trust dividend pays out in days.
- **s44/s55/s88/11**: neutral or small deltas; s55 and s88 byte-identical
  trajectories on both policies (the patch inert where scholars keep
  everything or die early).
- Villagers read as people throughout: triage debates ("We can bind the
  wounds, or go lean, or hunt hard"), gossip chains ("It's picking up
  decorations as it travels"), grief ("The village mourns"), the d32
  scattering ("people started walking — in different directions. The
  scattering, again.").

## Blanks filled / documented

- **sim-findings #155 — DIAGNOSED, GO.** The divergence is not noise
  (det-gate 16/16 both sides) and the raid-pressure hypothesis is confirmed
  at the pre-registered bar (6/8). Mechanism: faster trust recovery puts
  villages on full rations sooner; under pantry predation (raids, lingerers,
  tribute, feasts) the fuller-faster pantry drains faster, and the armed
  trajectory can generate its own lingerer sieges. The patch itself stays
  KILLED per r29 §14 — this arm re-applied it for measurement only and
  reverted it byte-clean; any re-landing needs its own GO arm.
- **New open blank: ENDOGENOUS RAID PRESSURE** — is pantry fullness (or
  village activity/noise) a mechanical raid attractant, or is the
  armed→more-raids pattern coincidence at n=16? Needs an instrumented arm
  on the raid trigger, not a policy arm.
- **Instrument blank (filed, not chased)**: setup-captured vid goes stale on
  scholar respawn; ledger instruments must read vid fresh or wrap
  recordGiveHist.

## Next design move (named, per the pre-registration)

1. **Raid-trigger instrument arm** (diagnostic, no game-code lever): does
   pantry kcal (or haven activity) drive raid/lingerer spawn rates? If yes,
   the "trust recovery → fuller pantry → more raids" loop is a designed
   coupling to tune; if no, the s44/s77 armed sieges are coincidence and
   the divergence needs a new instrument. **This is the recommended next
   move.**
2. **Raid-aware ration policy arm** (policy-side, safe): a competent-policy
   variant that tightens rations while lingerers are at the treeline
   (scripts/policies/*.js only — no game-code interaction, co-runnable).
   Tests whether behavior, not trust math, is the survivable response to
   predation.
3. **Steve-call**: if (1) confirms the coupling, whether "recovered trust
   buys the village a faster death under siege" is intended dramatic irony
   or a tuning problem is a design ruling, not a measurement.

## Metric review (§14, mandatory)

- DIAGNOSTIC GO (≥6/8 seeds follow the sign prediction): MET — 6/8 exactly.
  GO per the pre-registered rule; the bar was set before any sims and the
  count is unambiguous. Not re-scored.
- Raid classification rule (≥8 nights AND ≥5000 kcal, control side): applied
  as pre-registered; yielded exactly one HIGH-RAID seed. The thin high-raid
  class (n=1) bounds the claim — recorded above, not used to move the bar.
- Det-gate 16/16 both sides: MET — cross-side deltas are trustworthy.
- Metric concern for the next arm: seed-level averaging hides policy-level
  sign splits (s33, s77). A follow-up arm on endogenous pressure should
  pre-register at the combo level (n=16) or model raid nights as a
  time-varying covariate rather than a seed class.
- The wall-number comparison (table 3v0, wave45 8v4) is report-only: this
  arm's pre-registered verdict is the divergence hypothesis, not a
  re-landing case for the killed patch.

## Convergence report

- Convergence: diagnosed-GO on sim-findings #155. Axis scale-onramp: still
  blocked (0/16 wins both sides; the trust ledger moves reach, not wins).
- Wall numbers this run: national 10-11/16, table 0-3/16, wins 0/16,
  wave 4-5 on 4-8/16, median survival ~133-135d.
