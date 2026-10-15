# sim-siegedef2r — ADOPT the siegedef2 orphan (scale-onramp, run fleshout-a-2026-10-15-0015 ARM 3)

Adopted from the dead run's uncommitted tree (2026-10-14T16:28:01, orphan
~/workspace/worktrees/sim-siegedef2, REFERENCE ONLY — never written, never
released by this worker). Orphan files verified and copied as own working
copies: scripts/policies/siegedef2.js, scripts/test-siegedef2-20261014.js,
scripts/det-gate-siegedef2-20261014.js, scripts/measure-siegedef2-20261014.js,
scripts/sense-siegedef2-20261014.js. Orphan pilot JSONs (siegedef2-control.json,
siegedef2-armed.json) kept as cross-check reference only
(evidence/2026-10-14/orphan-siegedef2-{control,armed}.json), NOT the verdict.

Adoption protocol: the orphan's numbers are never trusted as the verdict —
this worker independently proves GREEN on current master (real RED phase),
re-runs the det-gate + pilot on identical seeds, reads transcripts.

Diagnosis inherited (evidence/2026-10-14/sim-w5death.md, read): 31 post-unlock
scholar combat deaths across 6 unlockers (5.17/unlocker); 84% at Haven —
a Haven-siege problem, not an expedition problem. Arm: post-unlock Haven-siege
defense DISCIPLINE (policy-side only, gate SIEGEDEF2=1): musterWatch (3
strongest on patrol, wounded <45 rotate to rest), tendPost (one medic on
tend), shelterRule (hunters pulled to garden in-window), scholarEngage
(post-unlock at haven: never solo-engage a lost fight — 0 allies + wave-5 or
2.2x-HP, or <50% HP without the watch — disengage through the barrier;
with the watch or a winnable fight, stand; sealed fights never fled).

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- SUBSTRATE: leadfeast, FEASTSCALE_R13=1 (the plentycost road).
- CONTROL: SIEGEDEF2 unset (pure leadfeast delegation). ARMED: SIEGEDEF2=1.
- Same code tree, identical seeds, env-var only. Policy-side only,
  no game-code changes.
- PRIMARY: post-unlock scholar combat deaths per unlocker <= control-2
  AND median survival >= control+10d. Both must hold.
- GUARDRAILS: national >= control-2; no new death mode (family level —
  combat/contest/expedition/starvation/disease).
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why: WIN-PATH HORIZON 180 (Steve 2026-10-13) — post-unlock survival is a
  late metric; shorter caps truncate exactly the long survivors it needs.
- SEEDS: 11/22/33/44/55/66/77/88/303 (per orphan's instrument files — 9 seeds;
  303 = the table-reacher deep dive).
- POLICIES: scripts/policies/siegedef2.js via measure-siegedef2-20261014.js.
- A miss is NO-GO — never re-scored against a friendlier metric mid-run.
  Confirm (12-16 seeds) ONLY if GO at pilot.

## Orphan's mid-run pilot (CROSS-CHECK ONLY, not the verdict)

From evidence/2026-10-14/siegedef2-{control,armed}.json, generated
2026-10-14T17:54/18:01Z, 9 seeds each, leadfeast FEASTSCALE_R13=1:

- control: postUnlockCombatDeaths 31 (5.17/unlocker), median 101d,
  national 6/9, table 4/9, wins 0/9, wave5 6/9.
- armed: postUnlockCombatDeaths 25 (4.17/unlocker), median 73d,
  national 3/9, table 4/9, wins 0/9, wave5 6/9.
- Siege counters fired: sdMusters 636, sdTends 208, sdJudgments 32,
  sdDisengages 27, sdEngages 15, sdBarrierPushes 26 — the layer engaged.

By this run's pre-registration, the orphan's pilot is NO-GO: primary needs
<= control-2 (<=3.17; measured 4.17) AND median >= control+10d (>=111d;
measured 73d). Guardrail national (3 vs >=4) also misses. If this worker's
own pilot reproduces a similar picture, the arm is KILLED AT PILOT.

## Runs

### Proof (RED -> GREEN on current master)
- RED phase: test copied before the layer — `scripts/policies/siegedef2.js`
  absent — `Cannot find module './policies/siegedef2'`, exit 1, mechanism
  absent by design.
- GREEN phase: all 4 orphan files byte-identical to the orphan tree except
  scripts/sense-siegedef2-20261014.js (transcript output path repointed from
  the orphan tree to this tree's evidence/2026-10-15/ — the one deliberate
  deviation, so the reference tree is never written to).
- `node scripts/test-siegedef2-20261014.js`: ALL PASS — window timing (opens
  at unlock, closes unlock+60, no window pre-unlock), watch posted 3/3 with
  wounded rotation off, shelter pulled + tender posted, D1 solo-vs-wave-5 ->
  disengage with walk-out verbs, D2 2-allies -> engage, D3 sealed -> stand,
  D4 weak wave-1 -> engage, E real wave-5 haven fight -> disengage on the
  fired path, F gate-off inert, G gate-off wrapper == bare leadfeast
  byte-identical (fingerprint match).

### Det-gate: 16/16 GREEN
`node scripts/det-gate-siegedef2-20261014.js` — control (SIEGEDEF2 unset) 8/8
identical, armed (SIEGEDEF2=1) 8/8 identical, seeds 11/22/33/44/55/66/77/88,
180d, FEASTSCALE_R13=1. Note: the det-gate instrument runs its own mode
(different trajectories than the pilot — determinism proof only, not
measurement). Before/after pilot comparisons are trustworthy.

### SMOKE: GREEN
`SMOKE=1 node scripts/measure-siegedef2-20261014.js` — policy genuinely
drives (mean 4.8 policy calls/day, 2272 policy-origin acts), SIEGEDEF2=1:
watch musters (3), siege fight judged (1).

### Pilot (this worker, current master, 9 seeds x 180d death-aware)

Substrate leadfeast FEASTSCALE_R13=1. Control = SIEGEDEF2 unset; armed =
SIEGEDEF2=1. Same tree, identical seeds 11/22/33/44/55/66/77/88/303.

| seed | ctrl days/end | ctrl wave | ctrl postC | armed days/end | armed wave | armed postC |
|------|---------------|-----------|------------|----------------|------------|-------------|
| 11 | 145 village-lost | 5 (u106) | 5 | 120 village-dead | 5 (u106) | 2 |
| 22 | 86 village-lost | 4 | — | 86 village-lost | 4 | — |
| 33 | 111 village-lost | 5 (u75) | 8 | 107 village-lost | 5 (u75) | 7 |
| 44 | 180 survived | 5 (u71) | 6 | 97 village-lost | 5 (u71) | 4 |
| 55 | 85 village-lost | 3 | — | 85 village-lost | 3 | — |
| 66 | 75 village-lost | 5 (u75) | 0 | 75 village-lost | 5 (u75) | 0 |
| 77 | 75 village-lost | 5 (u65) | 6 | 73 village-lost | 5 (u65) | 3 |
| 88 | 58 village-lost | 4 | — | 58 village-lost | 4 | — |
| 303 | 76 village-dead | 3 | — | 76 village-dead | 3 | — |

Aggregates:

- postUnlockCombatDeaths per unlocker: control 25/5 = **5.00**; armed 16/5 =
  **3.20**. (GO: <= control-2 = <=3.00 — MISSED by 0.20)
- median survival: control **85d**; armed **85d**. (GO: >= control+10 = >=95d
  — MISSED)
- GUARD national: control 3/9, armed 3/9 (>= control-2 = >=1 — PASS)
- GUARD death modes: control {combat, sickness, dehydration, starvation,
  contest}; armed {combat, dehydration, starvation} — no new family (PASS)
- wins 0/9 both; table 1/9 both (seed 44); wave4 7/9 both; wave5 5/9 both.
- Layer fired: sdMusters 124, sdTends 57, sdJudgments 23, sdDisengages 14,
  sdEngages 11, sdBarrierPushes 17, sdWalks 2, sdPushStalls 1,
  sdRotations 0 (no wounded watch in 180d), sdShelters 0.

Per-unlocker-seed: armed won 4/5 (s11 2<5, s33 7<8, s44 4<6, s77 3<6;
s66 0=0). The mechanism is real and fires — it genuinely cut post-unlock
scholar combat deaths 25 -> 16 (-36%). But median survival did not move:
85d -> 85d. The control's one survivor (s44, 180d) became a 97d village-lost
under the arm; ends reshuffled {control: lost 8, survived 1, dead 1} ->
{armed: lost 7, dead 2} with no village lifted.

**VERDICT: KILLED AT PILOT — NO-GO per §14.** Primary missed both bars.
Layer deleted per kill protocol; instruments kept.

### Sense (transcript read, SENSE-TESTING LAW)
`SEED=55 DAYS=150` armed run -> evidence/2026-10-15/siegedef2-transcript-s55.txt
(15,740 lines). Note: the sense script's mode string differs from the measure
instrument, so this is a different RNG timeline (village died d78 in this
timeline) — read for sense, not measurement.
- Villagers act like people through the window: fire-side dialogue continues
  ("Do you think they're watching right now?"), the d12 SYSTEM SIEGE crisis
  beat reads, tending/grief beats fire on deaths. Nothing robotic about the
  social layer.
- The watch muster produces NO player-facing narration — assignTask is silent;
  the only "watch" lines are pre-existing ambient flavor ("arguing about the
  watch rotation", "The watch holds the wall" crisis beat). The player never
  learns the village posted a watch. (Appended to sim-findings as open: any
  future defense discipline needs a muster beat — "no silent actions".)
- The disengage itself goes through the engine's real tbBarrierExit chase
  stages (narrated by the engine, chase_not_roll) — engine-honest, no
  fabricated retreat text.
- The sense timeline's d78 village-death — while the scholar chain was still
  being defended — corroborates the pilot's story: the binding constraint is
  the VILLAGE collapsing (roster killed out), not the scholar chain.

## Metric review (§14)

PRIMARY missed both bars (3.20 vs <=3.00; 85d vs >=95d). No metric was moved;
the arm stands killed. Review notes for the NEXT run (not a re-score):
1. The conjunction (<=control-2 AND median >= control+10) is a hard gate —
   the arm moved the first leg most of the way (5.0 -> 3.2, -1.8 of -2.0) and
   nothing on the second. A future siege arm should pre-register villager
   (non-scholar) combat deaths as a co-primary: the pilot suggests the wall
   is the village dying around the scholar, which a scholar-centric metric
   cannot see.
2. Control median drifted (orphan's 101d -> this worker's 85d) because master
   moved between runs — the control was correctly re-measured; this is why
   the adoption protocol forbids trusting the orphan's JSONs.
3. Seed 303's new 76d village-dead (wave<=3) on both sides: current master
   has a harder early game on this seed than the orphan saw — a datapoint for
   the scale-wall, not this arm.

## Village assessment

The siege is real and the discipline fired (124 musters, 14 disengages), but
the village dies around the defended scholar. The orphan's diagnosis was
scholar-centric (84% of post-unlock scholar deaths at Haven); this pilot
says the deeper wall is roster-level: seed 11's armed line died as a
village-dead at d120 with the scholar protected to 2 post-unlock deaths
(against 5); seed 44's protected scholar still lost its village at d97. The
watch intercepted the siege at the scholar but the siege ground the village
down anyway — mustered patrollers (3 villagers on patrol) were also fewer
than the orphan saw (636 musters vs 124: the unlock window is narrower on
current master). Blanks: (a) villager combat-death telemetry during the
window — we measured scholar deaths but the wall lives in the roster;
(b) the muster needs a player-facing beat.

## Blanks filled / documented

- FILLED: the adoption itself — the dead run's layer independently proven
  (real RED->GREEN), det-gated 16/16, smoke-gated, and piloted on current
  master with a verdict: KILLED AT PILOT. The orphan's numbers were never
  trusted; the cross-checks (orphan-siegedef2-{control,armed}.json) agree in
  direction (mechanism fires, median doesn't move) but differ in level
  because master moved.
- DOCUMENTED: silent muster (no player-facing narration) -> appended to
  sim-findings as open; scholar-centric metric blind to roster collapse ->
  noted in metric review for the next arm's design.
