# Long-run sim — lever 1 r1: the scale wall's combat face (2026-10-12)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Primary metric:** village survival days (median across seeds) AND the
  scale-wall numbers: national reached / table reached / wins, wave 4–5
  unlocks. Combat death-share is the diagnostic, not the goal.
- **GO threshold (pilot → confirm):** after-run median survival ≥ 85d OR
  national reached on ≥1/8 runs OR a wave-4 organic unlock — with no
  starvation-collapse (starvation share of deaths must not rise above
  baseline +10 points). A change that moves none of these is killed at pilot.
- **Horizon:** 150d cap, death-aware. Sim stops at Game.over / village
  extinction (pop 0) — harness-enforced. Rationale: the wall window is
  days 30–90 (villages die before the day-76/90 rung gates per the
  2026-10-12 run); 150d covers the window plus margin without simulating
  corpses. Never a fixed 200d.
- **Seeds:** 11, 22, 33, 44 (subset of the r8 seed set — cross-referenceable).
- **Policies:** competent + winseek (8 runs: 4 seeds × 2 policies). winseek
  actively courts scale and the table; competent plays survival.
- **Lever:** ONE combat lever, chosen AFTER the baseline diagnosis reads
  the transcripts (SENSE-TESTING LAW). Before/after on IDENTICAL seeds.
- **Convergence judged at end:** converging | converged | parked |
  killed-at-pilot.

## Canon read
- docs/CANON.md (monster encounters fought not rolled; contests played not
  RNG; "If you don't know, it doesn't show"; monster tiers ≠ loot tiers).
- docs/MONSTER-WAVES.md (wave law; villager kills score the ledger like the
  player's; counters wave 1–2; wave 3+ deliberately counter-less — signature
  mechanics instead; anchored bands).
- docs/DISEASES.md (two pools — checked: no disease vector changes in this
  run's scope; wounds "wouldn't close" are mundane).
- r8 baseline (2026-10-12): 12 seeds × 200d competent: median 69–72d,
  11/12 village-lost; player deaths 83% combat; villager deaths 63%
  field-combat (+13% wounds); field fights: vFlee 43%, vDie 6.1%;
  wave-3 player fights 11 deaths / 21 (52%); national 0/12.

## Baseline — below.

## BASELINE (4 seeds × 2 policies, 150d death-aware cap)
Probe: `scripts/probe-combat-r1-20261012.js` (r8 probe + POLICY param +
scale snapshots). Seeds 11,22,33,44.

| policy | seed | days | end | scaleMax | P deaths | V deaths |
|---|---|---|---|---|---|---|
| competent | 11 | 69 | village-lost | village | 3 | 8 |
| competent | 22 | 150 | survived | village | 6 | 4 |
| competent | 33 | 14 | village-lost | village | 2 | 3 |
| competent | 44 | 90 | village-lost | village | 4 | 5 |
| winseek | 11 | 32 | village-lost | regional | 4 | 7 |
| winseek | 22 | 124 | village-lost | regional | 4 | 7 |
| winseek | 33 | 15 | village-lost | village | 2 | 7 |
| winseek | 44 | 34 | village-lost | regional | 5 | 7 |

**Wall numbers (baseline):** national 0/8, table 0, wins 0, wave 4–5
unlocks 0. Median survival: competent 79.5d, winseek 33d. maxWave: 3 on
4/8 runs (wave 3 unlocks, but 0 wave-3 kills — the village can't kill
wave-3 monsters).

**Death causes, day 30–95 window (the on-ramp):** combat 11 (belltoad 4,
w2: landlord/understudy/voice_mimic 3, gallowdeer/hushwolf/nightcourt/
mirrormoth 4), sickness 4, starvation 5, wounds 1. Combat is the plurality.
**Day 0–29:** 40 combat deaths (wave-1 field + wild), ~8 starvation/thirst.
The first month is the slaughter.

**Key structural finding:** villages die by SCATTERING (famine), not
combat extinction. Death counts (5–11) never reach 12 — the combat
attrition shrinks the workforce below the food-sustaining threshold, the
pantry empties, the remnant walks away. Combat-attrition → food-collapse
→ scattering. (Seed 33 both policies: scattered d14–15 after gallowdeer
mobbing + famine.)

**Field fights (429 villager fights):** vDie 6.1% overall; hushwolf 68
fights/11 deaths, gallowdeer 48/10 (early), belltoad 21/3 (d43–64).
Counters: 8–15 discovered per run (player-side), 6–8 known by day 30 —
including belltoad, hushwolf, gallowdeer (the killers). But villagers
never execute them (fieldFights has no counter path — "no grid" scope
boundary).

## THE LEVER: "the village knows the tricks" — KILLED AT PILOT
**Design:** villagers execute village-known monster counters in field
fights. Per-kind translations (exact numbers): opening strike
`lroll([4+wb,8+wb])` (×2 for strike_first) for the strike family;
windup-2+ attacks dodged for the evasion family (move_windup/sidestep/
move_x2); monster damage ×0.75 for keep_distance; non-lead pack skips
round 1 for shout; base attack only for wait. offer_food: documented gap
(no off-screen translation). Gate v1: player-known (`monsterCounterKnown`).
Gate v2: player-known OR villageSlain ≥ 2 (villagers learn from their own
kills; player codex untouched).

**Proof:** `scripts/test-counter-execution-20261012.js` — 15/15 green
(mechanism fires, narrates, per-kind effects verified, villageSlain gate,
codex separation). [needs-eyes] would have applied had it shipped.

**Before/after (identical seeds):**
| metric | before | after (v1 gate) | after (v2 gate) |
|---|---|---|---|
| competent median | 79.5d | 62.5d | 62.5d (byte-identical to v1) |
| winseek median | 33d | 27d | 27d (byte-identical) |
| national / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| wave-4 unlocks | 0 | 0 | 0 |
| villager vDie (competent) | 4.4% | 4.3% | — |
| villager vDie (winseek) | 9.3% | 11.5% | — |
| villager vKill (winseek) | 22.5% | 17.6% | — |

**Verdict: KILLED AT PILOT.** Fails every GO criterion. The v2 gate
produced byte-identical output to v1 — the villageSlain≥2 gate is
REDUNDANT with player knowledge (the player cracks every counter the
village has 2+ slain for; the sets overlap completely in these sims).
The v1 gate is flat-to-negative on the direct mechanism.

**Why it failed (diagnosis):**
1. **Wrong window.** The lever helps d30+ (counters must be learned).
   The binding slaughter is d0–29 (40 combat deaths) — before any counter
   is knowable. Optimizing the smaller part of the problem.
2. **"Winning → hold" backfire.** The opening strike inflates the early
   trajectory read (vDpr), flipping the morale check to "winning" →
   fleeAt drops to the 0.05 floor → villagers hold 1–2 rounds longer in
   fights they then lose. Unit test: vTaken 4098 → 4215 (+2.8%) with the
   trick. The hopeless check catches it, but late.
3. **RNG-stream divergence** confounds 4-seed before/after (the treatment
   changes draw counts; trajectories diverge). The negative survival
   signal may be noise, but the flat direct mechanism (vDie, vKill) is not
   promising enough to spend confirm seeds on.

**Reverted.** `src/js/fieldFights.js` restored to HEAD. The probe stays
(measurement tool).

## Reachability verdict
Waves 1–3: reachable (w3 unlocks 4/8 runs). Wave 4/5: 0 unlocks — still
decoration in sims. Regional: 3/4 winseek runs (day 24–25). National: 0.
Table: 0. The on-ramp (30–90) remains uncrossed: villages die before the
day-76/90 rung gates.

## Village assessment (plain words)
The village is a place that bleeds out in the first month and starves in
the third. Wave-1 monsters (hushwolf packs, the Highbeam Deer, choir
toads) kill 2–5 villagers before day 30; the survivors can't feed the
remnant; the pantry empties; people walk away in different directions.
The few villages that survive the first month (seed 22 competent: 150d)
do it by luck of the draw, not by learning — the counters are discovered
but the knowledge doesn't save lives fast enough to matter. The wall's
combat face is the d0–30 slaughter, not the mid-game attrition.

## Blanks documented (not filled)
1. **The d0–30 slaughter.** 40 combat deaths in the first month across 8
   runs. Villagers walk into wave-1 fights (awareness check fails vs
   pack/ambush: hushwolf evade ~7%) and die at 6–9%/fight. Counters can't
   help (nothing is known yet). This is the binding combat bottleneck.
   Candidate levers (not tried): awareness/evade tuning, expedition
   contact rate, early armor.
2. **"Winning → hold" trajectory.** One-time openings (ambush, counter)
   inflate vDpr and cause 1–2 rounds of false confidence. A trajectory
   fix (exclude one-time damage from DPR) is a separate lever.
3. **Player bare-handed deaths.** 83% of player deaths are combat; the
   r8 note and a sibling's in-progress `armUp` policy change (competent.js,
   NOT MINE — see loud failure below) both point at players fighting
   unarmed. Policy-side, not game-side.
4. **Sickness clusters.** 4 villagers died of sickness d59–68 (competent
   seed 11). Disease lever (7), not mine.

## Sense-testing (transcripts read)
- Understudy kill (d68): "Mirror Strike finds you — no dodging it... hits
  you for 20... You go down." Legible, no robbery.
- Hummice field fight: 4 pack hits (22 total), Sofia strikes for 26, lead
  falls, "the pack's coordination shatters." Real blow-by-blow.
- Villagers grieve, flee believably ("sees how this ends — and runs while
  running still works"), bind wounds (field medicine). Nothing robotic.

## Convergence state: killed-at-pilot
Scale-onramp stays the topmost non-converged axis. This lever did not move
it. The wall's combat face is the d0–30 slaughter — the next combat-lever
run should attack contact/awareness there, not mid-game trick execution.

## LOUD FAILURE: worktree isolation violation
At 2026-10-13 02:32:51 UTC, while this worker was active, a SIBLING
edited this worktree: `scripts/policies/competent.js` (+20 lines, `armUp`
function, attributed to "longsim combat r1 2026-10-12" — yesterday's run)
and created `scripts/test-armup-r1.js`. I did NOT make these changes. They
are uncommitted and NOT mine. I did not commit them, did not revert them,
and did not include them in my measurements (my baseline and after1 runs
completed BEFORE 02:32; the after2 run's byte-identical output confirms
neither my v2 gate nor the sibling's armUp affected those trajectories).
My worktree contains uncommitted non-my files — FAIL LOUD per the loud
rules. Coordinator: identify the sibling and reinforce worktree isolation.
The sibling's work is preserved in place; I touched nothing of theirs.

