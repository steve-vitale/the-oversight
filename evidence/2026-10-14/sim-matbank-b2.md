# sim-matbank-b2 2026-10-14 — ARM (materials-banking, corrected prescription), food-economy axis, POLICY-SIDE

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding)
- **Question:** sim-findings #81 refined prescription. The KILLED matbank arm
  banked a fixed 2+2 reserve — the dead snaregate band — while the LIVE L1
  blind gate is 3+3 (workTrapline: `level >= 2 ? 1+1 : 3+3`): it parked the
  pack one short of the craft threshold and the preference shut off AT the
  reserve line. Does banking to the CRAFT threshold move co-banking and
  blind snare crafts? The layer banks vine+stick until 3+3 is HELD at snare
  L1; the collection pull stays ACTIVE until the threshold is met and shuts
  off AT 3+3, not below it; at snare L2+ the target band is 1+1 (the blind
  gate drops — the reserve tracks the live gate); at snare L0 no reserve.
  Discretionary burns gated below the band: arrow (stick:2) and bark_armor
  (vine:2) ONLY — engine fires burn branch/wood/fusion only, so fires are NOT
  gated (the original finding's premise was wrong). Knife knapping never
  gated (priority). Below-band forage trips steer for thickets.
- **Arm:** scripts/policies/matbank2.js — opt-in layer (MATBANK2=1, default
  OFF), hooked into competent.js (forageTripSeedFirst thicket sort; gearUp's
  arrow and bark_armor craft sites). Policy-side ONLY — zero game-code edits.
- **Primary metric (1):** seeds where the scholar's pack held vine>=3 &&
  stick>=3 simultaneously on >=1 day. **GO:** >= 4/8 seeds (either policy).
- **Primary metric (2):** blind snare crafts (snare crafts at codex snare
  level 1). **GO:** armed >= 2x baseline AND armed >= 4 absolute (floor
  against the zero-baseline softness flagged in sim-snaregate's metric
  review).
- **Guardrails:** fires parity (armed firesLit >= baseline firesLit —
  structural, measured anyway); knife knapping provably ungated
  (proof-level per sim-matbank's metric review — no systematic block; raw
  counts informational, NO raw-count bar); median survival no worse than
  -10d vs baseline.
- **KILL:** a miss on (1), (2), or any guardrail -> delete the layer + revert
  the competent.js hooks before commit, keep only the evidence (killed arms
  leave no trace).
- **Horizon:** 180d death-aware (Game.over stops the run; dead villages stop
  simulating — no fixed tail). **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 ×
  leadcourt, belongseek (16 runs/side, IDENTICAL seeds baseline vs armed).
  (Standardized on the food-economy convention leadcourt/belongseek 180d —
  baseline re-measured; the GO is comparative.)
- **Sides:** baseline = MATBANK2 unset (default OFF); armed = MATBANK2=1.
  Code identical otherwise, same commit.
- **Convergence:** converging -> 12-16 seed confirm if GO met;
  killed-at-pilot otherwise.
- **Canon:** docs/CANON.md (standing rules). No canon doc covers
  trap-material banking specifically — the behavior is a player-behavior
  blank (a competent trapper banks cordage), not a system redesign; recipes
  and the vine race are engine canon (recipes.json, keepKnife's knap-first
  logic).

## Proof — scripts/test-matbank2-20261014.js (RED 8/8 -> GREEN 14/14)
RED (MATBANK2 off): the blank, demonstrated — arrow crafted at stick=2
(burns below the 3+3 band); bark_armor crafted at vine=2 (burns the last
vine); no collection signal at any band; the KILLED arm's 2+2 rule
re-implemented inline to show it shuts the pull off AT 2+2 (parks one short
of the 3+3 blind craft, and the parked state provably cannot craft —
workTrapline attempts 0 at 2+2/L1); the tied meadow-vs-thicket trip takes
the meadow. 8/8.
GREEN (MATBANK2=1): 14/14 —
- arrow NOT crafted at 2+2; crafted at 3+5 (surplus spent, stick 5->3, the
  3+3 band intact); at snare L2 the band is 1+1 — crafted at 1+3 (stick 3->1);
- bark_armor NOT crafted at 2+2; crafted at 5+3 (vine 5->3, band intact);
- knife knapping fires at stone=1/vine=1 even below the band (priority);
- snare craft at 3+3 still attempted (the reserve exists for it);
- collection signal TRUE below the band AND at 2+2 (the fix — the pull
  continues past the old park point), FALSE at 3+3 and above (shutoff AT the
  threshold); at snare L2 the pull tracks the 1+1 band (true at 0+0, false
  at 1+1); no pull at snare L0; the burn gate inert at L0;
- below-band trip steers for the thicket (collect before burning); at-band
  trip goes back to neutral (meadow — the pull is off).
Gate-off path draws no RNG and touches no state — baseline byte-identical
where the layer never fires (armed seeds 44/77 at snare L0: rows identical
to baseline, see pilot table).

## Pilot — scripts/matbank2-pilot-20261014.js (16 runs/side, identical seeds)

| side | national | table | wins | exiled | maxWave | crafts | blind | snareAtt | sets | coBank(3+3) | knives | arrows | bark | fires | fireDays | medianSurv | pdeaths (cause: n) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline (off) | 4 | 0 | 0 | 0 | 4 | 19 | 6 | 24 | 31 | 66 (1/8) | 6 | 0 | 0 | 0 | 1093 | 57d | combat 29, starvation 6, contest 3, expedition 2, lockjaw 1 |
| armed (MATBANK2=1) | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 12 | (0/8) | 4 | 0 | 0 | 0 | 939 | 47d | combat 36, starvation 11, contest 3, expedition 1, lockjaw 1 |

Per-seed (base | armed — surv, crafts, blind, coBank, vineMax/stickMax, snareL):
11: 44d 0/0/0 v2s0 L1 | 39d 0/0/0 v2s0 L1 · 37d 0/0/0 v2s1 L1 | 49d 0/0/0 v3s0 L1
22: 152d 0/0/0 v1s7 L1 | 134d 0/0/0 v1s4 L1 · 39d 0/0/0 v1s2 L1 | 38d 0/0/0 v2s2 L1
33: 45d 0/0/0 v6s2 L1 | 40d 0/0/0 v4s0 L1 · 41d 0/0/0 v4s0 L1 | 40d 0/0/0 v4s0 L1
44: 107d 0/0/0 v9s2 L0 | 124d 0/0/0 v7s1 L0 · 107d 0/0/0 v9s2 L0 | 124d 0/0/0 v7s1 L0 (byte-identical — pull never fires at snare L0)
55: 79d 0/0/0 v2s0 L1 | 82d 0/0/0 v2s0 L1 · 90d 0/0/0 v2s2 L1 | 102d 0/0/0 v3s13 L1 (stick banks, vine doesn't)
66: 41d 0/3/1 v3s6 L1 | 36d 0/1/0 v2s4 L1 · 41d 0/0/0 v0s3 L1 | 34d 0/0/0 v0s3 L1
77: 49d 0/0/0 v2s0 L0 | 74d 0/0/0 v3s0 L0 · 49d 0/0/0 v2s0 L0 | 74d 0/0/0 v3s0 L0 (byte-identical — snare L0)
88: 41d 5/1/0 v10s2 L2 | 65d 14/1/0 v8s2 L2 · 45d 0/0/0 v2s11 L1 | 56d 0/0/0 v2s14 L1 (the drift died: vine 8-10 -> 2)

## Verdict: KILLED at pilot

- Primary (1): co-banked (3+3) seeds 1/8 -> 0/8 (need >= 4/8). MISS.
- Primary (2): blind snare crafts 6 -> 0 (need >= 2x baseline = 12 AND >= 4
  absolute). MISS — a REGRESSION, not a flat miss. Snare craft attempts
  24 -> 0: on the armed side the pack never reached 3+3 once in 16 runs.
- Guardrails: firesLit 0 = 0 (parity holds); knife counts 4 vs 6 —
  informational per pre-registration (no systematic block: the proof shows
  no matbank2 call exists in any knife path — keepKnife/cleanCatch/armUp
  untouched; the hooks live only in gearUp's arrow/bark sites and the
  forage sort); median survival 57d -> 47d (inside the -10d gate, exactly
  at the boundary).
- Per the binding pre-registration, a miss on a primary is KILL: the layer
  (scripts/policies/matbank2.js + the competent.js hooks) was DELETED and
  competent.js reverted — killed arms leave no trace. Committed
  evidence-only: this file, the two pilot JSONs, the proof script, the
  pilot script, the diagnostic, the transcript probe.

## Why it died (mechanism, not just numbers)

The corrected prescription fixed the reserve band but not the mechanism.
The collection pull — steered for thickets/groves whenever below the
target band — fires NEAR-CONSTANTLY at snare L1 (3+3 is almost never held),
and that constancy is the killer: it over-harvests the vine-rich ground
faster than it regrows (~2d per the forage engine's regrowth), collapsing
the very supply line it was built to fill.

Diagnostic (scripts/matbank2-diag-20261014.js, seed 88, 80d — identical
seeds, baseline vs armed):
- baseline: 75 forage trips — grove 39 (vine 0.13/trip), meadow 24 (vine
  0.21/trip), forest_floor 12 (vine 0.25/trip). Total vine 13.
- armed: 99 trips — grove 71 (vine 0.04/trip), meadow 25 (vine 0.00),
  forest_floor 3 (vine 0.33). Total vine 4.
The pull steered the scholar into groves 71 times (vs 39); the groves were
picked clean and yielded 0.04 vine/trip, while the meadow/forest_floor trips
the pull forfeited were yielding 0.21–0.25/trip. The old knife-vine pull
fired only occasionally (stone>=1 && vine<1) and the scholar rotated; the
trapline pull never lets the ground rest.

Second mechanism: the burn-gate half is provably correct (proof 14/14) but
empirically inert — arrowCrafts = 0 and barkArmorCrafts = 0 on ALL 32 runs,
so there was never anything to block. The "collect before burning" premise
assumes burns happen; at these policies they don't. The entire arm reduced
to the thicket preference, and the thicket preference is a destination
reshuffle, not a materials pump: the engine's per-tile forage table sets
the yield, and hammering one tile type depletes it.

Baseline's crafts (seeds 66/88) came from UNDIRECTED drift to 3+3 + the 35%
blind success -> L2 -> the 1+1 band. The armed reshuffle moved the scholar
off both drifting trajectories (armed 88: vineMax 10/8 -> 2/2; the pack
filled with sticks instead — stickMax 11/14).

Where the layer never fired (seeds 44/77: snare L0), armed trajectories are
byte-identical to baseline — the inert checks draw no RNG and touch no
state, as designed.

## Metric review

§14: judged against the header exactly as written — no re-scoring. Three
notes for the NEXT run, not this one:

1. The knife guardrail pre-registration change worked: armed 4 vs baseline
   6 is recorded informationally, no false miss fired. The proof carries
   the guardrail (no gate exists in any knife path). Keep this form.
2. The two-conjunct primary design worked again: (1) showed the banking
   never materializes, (2) showed crafts regressed to zero. But note the
   asymmetry this run exposed: (1) measures the mechanism and (2) the
   outcome — when BOTH miss with a regression on (2), the mechanism section
   must explain the regression, not just the miss. Done above.
3. The blind-craft absolute floor (>=4) was the right call against the
   zero-baseline-softness worry, but this baseline measured 6 — the 2x bar
   (12) bound instead. Both bars were pre-registered; no review needed,
   just noting the floor didn't get exercised.

## Village assessment / blanks

- **Blank documented (refines sim-findings #81 — second kill):** the
  thicket pull is not just aimless, it is counterproductive. Vine-rich
  ground regrows in ~2 days; a near-constant collection preference
  over-harvests it and collapses per-trip vine yield (0.13 -> 0.04/trip on
  the diagnostic). Any future collection behavior must respect regrowth —
  rotate grounds, pull only when the knife already wants vine, or gate the
  pull on the ground's stock. AND: the discretionary-burn gate is a dead
  mechanism — arrow/bark crafts fired 0x on 32 runs. The real fight is vine
  accumulation and the policy cannot conjure vine; it is engine-side per
  tile type, depletable, and the blind craft is a drift event.
- **Corroborated:** the wire bypass remains the honest early trapline
  (snaremat); the craft line is an L2 luxury reached via a 35% blind
  success at 3+3. Vine is the binding half everywhere (armed 55/bB:
  stickMax 13 with vineMax 3; armed 88: stickMax 11–14 with vineMax 2).
- **Corroborated, not chased:** combat remains the player-killer (29 -> 36
  of ~41-52 player deaths); starvation 6 -> 11. Median survival 57d -> 47d
  (inside the gate, at the boundary).
- **Wall numbers:** national 4 -> 2, table 0, wins 0, exiled 0; max wave
  reach 4 both sides. No wall movement attributable to the arm.

## Sense read

Armed seed 55, 40d transcript (scripts/matbank2-transcript-20261014.js):
d9 "You also take some vine (crafting material)."; d10 "A sturdy stick
(crafting material)."; d10 "You make a Stone knife. flint knapped to an
edge, bound with vine. cuts meat, wood, cord."; end pack vinex1.
The layer narrates NOTHING itself — no reserve-hold lines, no steering
announcements (by design: no theater). The visible beats are honest engine
lines, and the villager snare-check beats read alive ("Wire doesn't
lie."). But the absence is the finding: 40 days of "banking" behavior
produces one vine and one stick. A player watching this would not perceive
"banking" — they would perceive wandering to groves. The intended behavior
never materializes as a felt activity, consistent with the pilot: the
mechanism doesn't move materials.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-14/matbank2-pilot-*.json'
--metrics flat.national,flat.table,flat.wins,flat.exiled`:

`LOUD: flat.national newly appeared: baseline 0 -> current 6 (n=2 files)`
VERDICT: explained, not a bug — same spurious class as sim-snaregate and
sim-matbank. The scale-wall.json baseline is seeded from a different
measurement context (different seeds/policies). Both of THIS arm's sides
are 4 (baseline) and 2 (armed) — no arm-attributable movement. Baseline
NOT rolled forward (policy-experiment convention).
