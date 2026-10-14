# Combat-survival fixes — evidence (2026-10-13)

Worktree `sim-combatfix`. Implements the 6 ranked fixes from the combat-survival
audit (`/tmp/combat-survival-audit.md`): reactive flee floor, hopeless 0.6→0.85,
tactical ability parity (field_medicine, war_cry), monster fleeAt wiring,
healer rounds <70, helpful AI strikes.

## Pre-registered run header (MEASUREMENT §§9–11)

- **Primary metric:** (a) mechanism proofs: all assertions in
  `scripts/proof-combat-survival-20261013.js` pass; (b) smoke: tactical villager
  death rate per villager-fight vs gavel, before/after on identical seeds.
- **GO threshold:** 21/21 assertions green on seeds 7, 42, 99 (RED verified on
  the pre-fix tree); smoke shows an obvious raw-number drop in deaths.
- **Horizon:** mechanism proofs (no horizon) + smoke: 15-round tactical fights
  (matches the audit probe's effective horizon), 40 fights/seed.
- **Seeds:** 7, 42, 99 (fixed literals). **Policies:** n/a — tactical harness
  with a fixed bot (player strikes nearest each turn, unkillable to isolate
  villager outcomes).
- **What would kill it:** any proof assertion red on the fixed tree; smoke
  death rate flat or worse.

## Results

**Proofs — GREEN on all 3 seeds (21/21 each):**
`SEED={7,42,99} node scripts/proof-combat-survival-20261013.js`

- P1 reactive flee: burst hit 63→12 flees at damage time; round-1
  killable-next-hit flees; winning fighter below the personality line holds
  (5% floor); chip damage above the line never flees.
- P2 hopeless factor: 0.7× trajectory reads hopeless; 0.95× stays non-hopeless.
- P3a field_medicine: 50→70 HP, once-per-fight flag; no-ability control unhealed.
- P3b war_cry: fires instead of fleeing, monster hesitates; no-ability control flees.
- P4 fleeAt: 12 monsters.json entries carry values; wounded belltoad flees;
  ad-hoc mdef reads the behaviors-table fallback; hostile (mdef-less) no longer
  throws at the flee line; ad_sponsor still flees via its hook (unchanged).
- P5 healer rounds: villager at 60 HP treated (+15).
- P6 helpful AI: adjacent → strike; close-in → strike.

**RED verified:** on the pre-fix tree, 15/21 fail (the 6 controls pass on both
by design — they assert unchanged behavior).

**Smoke — tactical death rate vs gavel (identical seeds, identical driving):**

| side | fights | villager-fights | deaths | fled | death rate |
|---|---|---|---|---|---|
| before | 19 | 38 | 30 | 8 | **79%** (roster wiped in 5–7 fights) |
| after | 110 | 220 | 25 | 195 | **11.4%** (roster intact) |

Trace (after): R4 helpful 100→59 flees at damage time; R5 brave 100→63 holds
(above 0.4 line); R8 brave 63→12 flees at damage time — the R9 killing blow
from the audit's trace never lands. The burst-death gap is closed for villagers.

**Closest regressions:**
- `scripts/test-parity-abilities.js`: 14 pass, 1 FAIL — **pre-existing**
  ("Take Aim fires (patient_aim)" 7/120, fails identically on the pre-fix tree).
- `scripts/test-combat-engine-20261007.js`: stale — calls `C.monsterTacticPlan`,
  which no longer exists in engine/combat.js (pre-existing, untouched by this change).
- `scripts/validate-ontology.js`: 94 systems validated, release permitted.

**Convergence:** one-shot fixes, not tuning — n/a. Verdict: GO.

## Design decisions (Steve: "figure it out yourself")

1. **Hopeless factor changed in BOTH engines.** `tbVillagerHopeless` and
   `fieldFights.js` document the same trajectory formula; leaving them diverged
   would rot the contract. Slow bleeds now flee off-screen too (field death tail
   should shrink further — directionally fewer deaths, the goal).
2. **Reactive flee = the same decision, resolved at damage time.** Same
   personality lines (brave 0.4 / helpful 0.7 / cautious 0.5), same exceptions
   (sealed arenas, rallied, helpful holding for a critical player), plus the
   field engine's winning floor (winners hold to 5%) and a would-die-next-hit
   burst floor (covers round 1, where there is no trajectory yet). **Player flee
   mechanics untouched** (Steve's call on levers).
3. **Brace needed no work** — unbreakable was already wired in tactical tbDamage
   (parity audit 2026-10-10). Only field_medicine (+20, once/fight, <60%, spends
   the turn, fires before the hopeless read like field's action-then-morale
   order) and war_cry (once/fight, fires *instead of* fleeing, nearest foe
   hesitates) needed call sites.
4. **fleeAt migrated into monsters.json** (12 values, authoritative on the mdef
   the tactical check already reads) with the behaviors table as fallback for
   ad-hoc mdefs. `ad_sponsor`'s fleeAt:1 stays effectively hook-driven (its
   sponsorCling hook already fled it hostless — characterization test, no
   behavior change). Fixed the wrong code comment ("bulldozer retreats <25%,
   deer bolts <50%" — neither ever had values). The flee read is now null-safe:
   hostile fighters (no mdef) threw `TypeError` at that line on their turn.
5. **Healer rounds 50→70 only.** The pre-departure heal check already sits
   wounded villagers out at <70 — the rounds now match it.
6. **Helpful strikes when adjacent** (both the already-adjacent and
   moved-adjacent cases in `villagerDecide`). Its [2,4] harry was feeding the
   hopeless trajectory; [4,8] strikes give it an honest DPR.

## Metric review (§14)

- The smoke's absolute rates are probe-dependent (15-round horizon, unkillable
  player, gavel never dies) — the **before/after delta** is the claim, not the
  absolute 11.4%. Do not cite 11.4% as "the" tactical death rate.
- The 87% flee rate on the after tree (195/220) is intended for 100-HP
  villagers vs wave-3 gavels, but if villagers never contribute in wave 3+ in
  real sims, that's a tuning question for the loops — flagged, not chased here.
- Pre-existing failures found (not fixed, out of scope): Take Aim 7/120 in
  test-parity-abilities.js; stale test-combat-engine-20261007.js;
  hostile turns still die deeper in tbMonsterTurn (swallowed by the turn loop's
  try/catch — the flee line is fixed, the rest of the hostile turn is a
  separate bug for the loops).

## Files

- `src/js/game.js` — tbFightTrajectory (shared read, 0.85), tbVillagerReactiveFlee
  + tbDamage hook, field_medicine + war_cry in tbVillagerTurn, null-safe fleeAt
  with behaviors fallback, healerRounds <70
- `src/js/engine/combat.js` — helpful strikes when adjacent
- `src/js/fieldFights.js` — hopeless 0.6→0.85
- `src/data/monsters.json` — 12 fleeAt values spliced (pure additions)
- `src/data/monsterBehaviors.json` — _docs: fleeAt no longer documentary
- `src/data/build-notes.json` — player-facing entry (pruned oldest, still 15)
- `scripts/proof-combat-survival-20261013.js` — 21 assertions, seeds 7/42/99
- `scripts/smoke-tb-deaths-20261013.js` — before/after death-rate smoke
