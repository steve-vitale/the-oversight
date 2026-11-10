# sim-wave5kill-a — prereg: a "blooded" damage/survivability lever for wave-5 kills

- Arm: sim-wave5kill-a (Loop A, run fleshout-20261110T0615Z)
- Branch: sim-wave5kill-a; base anchor `a5d615880674f233ce8a3e6746b1634e00338381`
  (worktree `~/workspace/worktrees/sim-wave5kill-a`; rebased onto the explicit
  master SHA read in the main tree immediately before rebasing; tree clean).
- Axis: scale-onramp / winnability chain. The chain binds at the wave-5 KILL.
- Grounding: sim-findings **#2062** + evidence/2026-11-09/sim-wave5face-b.md
  (DIAG-GO). Measured: villagers deal ~13–23 dmg/round vs 1000–1600 HP
  Producers hitting ~20–50/round through gear; a kill needs 50–80 rounds, a
  fighter dies in 1–3; 75 meetings, 0 kills, 31 scholar deaths; veterans 16
  meetings, 0 kills, 11 deaths, 5 flees. The release, the veterans, and the
  meetings all exist — the kill does not.
- Stale-brief check (done before this prereg): `git log master` shows NO
  wave5kill arm landed. Sibling Loop B JUST landed master `54b5389bb` /
  `a5d615880` (spearvolley-b NO-GO + volleysoft-b DIAG sizing). The spear /
  volley route is NOT re-litigated: this lever touches no volley, no ranged
  slot, no spear, no ammo. Damage/survivability only.
- Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-5 bands anchored:
  damage 50–130, HP 1000–2200, pierce 0.25–0.75; apex is a 7–10 round fight
  for a godhood build at ~220 dmg/round). No canon doc covers a veteran
  combat bonus — this lever is a new balance number on the existing veteran
  concept, not a canon rewrite. The veteran concept itself (living roster
  with a wave-(w-1)+ kill in `state.waveKillLog`) is the readiness gate's
  existing read (`waveCombatReadiness`, src/js/standing.js); this lever
  reuses that exact read and changes no gate.

## The lever — "blooded"

Fiction: the village's proven killers — people who have killed the tier
below — teach the village where the Producers bleed and how to stand
against them. Once the village has a living veteran (a wave-4+ killer),
its fighters hit wave-5 monsters harder and stand longer against them.

- Condition (both halves): target monster is wave 5 (`mdef.wave === 5`)
  AND the village currently has ≥1 living veteran (wave-4+ kill in
  `state.waveKillLog`, same living-killer read as `waveCombatReadiness(5)`).
  No veterans → no bonus. The bonus is a combat number, NOT a gate: no
  change to readyDemand, standing, unlocks, deeds, win prices, or the
  readiness hold/release beats.
- Outgoing: strike damage × `dmgMult` — field villager strike, field ally
  strike, TB villager strike, TB player (scholar) strike. The volley is
  NOT touched (ranged opening stays as-is). Ability multipliers stack
  as-is (rage, aim, haymaker, etc.).
- Incoming: damage from a wave-5 monster × `inMult`, applied after armor
  at the two absorb sites (field `wornDamage` site, TB `tbDamage` site).
- Narration: the first blooded strike in a fight names it once
  ("(blooded — the village knows where Producers bleed)" or equivalent);
  the damage number itself is the honest record. No silent buffs.
- Config: `Game.bloodedCfg()` in standing.js, defaults set by the sizing
  below (provisional: dmgMult 2, inMult 0.5). Env overrides
  `W5BLOODED_DMG` / `W5BLOODED_IN` exist ONLY as the sizing instrument
  (read per fight, `typeof process` guarded like VETSHAPE); the committed
  default is the landed number. If the sizing picks a different rung, the
  default is edited before the pilot and the edit is recorded here by
  correction commit.

## Stage 1 — constructed sizing (before any wild judged leg)

Ladder: dmgMult ∈ {1.5, 2, 3} × inMult ∈ {0.75, 0.5} (6 rungs), driven
through the real `Game.fieldFight`: a veteran spear fighter (armor P~20,
100 HP) + ally vs a Cancellation (1600 HP), 30 seeded streams per rung,
plus a ×1 / ×1 control rung (30 streams). Measures per rung: median
damage/meeting, median rounds survived, vKill / vDie / vFlee shares.

- Feasibility bars (all three, per rung): median damage/meeting ≥ 200
  (≤8 meetings to grind 1600 HP — the observed grind path, wounds
  persist) AND median rounds survived ≥ 4 AND vDie share ≤ 50%.
- Selection: the SMALLEST rung meeting all three (smallest dmgMult, then
  largest inMult — least intervention first). The picked rung becomes the
  committed default before the pilot.
- Kill-at-sizing: if NO rung meets all three bars, the arm is killed at
  sizing (DIAG — the lever cannot work at any reasonable size) with the
  sizing numbers as the evidence. No wild pilot is burned.

## Stage 2 — wild pilot (8 seeds, before/after, identical seeds)

- Band: **99641–99648** (8 seeds), competent policy verbatim, 150d
  death-aware horizon, driver scripts/wave5face-driver-20261109.js,
  analyzer scripts/wave5face-analyze-20261109.js (the wave5face
  instrument already measures wave-5 kills, meetings, veterans, and the
  wall numbers on this band). Legs: RUN=wave5kill-before (on pristine
  code, before the lever lands in the tree) and RUN=wave5kill-a (lever
  at the picked rung).
- Band freshness (per the seed-band skill, full search): 99641–99648 is
  NOT fresh — named by 8 preregs (grind-a, finishersize-a,
  killersurvive-b, firstkiller-b, vetkilltale-a, vetfinish-b,
  wave5face-b, spearvolley-b; evidence/*/sim-*-prereg.md). Reuse is
  DELIBERATE per the coordinator brief: the before/after must run on
  identical seeds against the wave5face baseline. The before-leg
  re-baselines on current master `a5d615880`, so base drift since the
  wave5face anchor (`2d7bcf514`) cannot masquerade as a lever effect.
  The confirm stage (on pilot GO) uses a FRESH band, chosen then by
  the same full search.
- Primary metric: wave-5 kills on the 8-seed pilot band, before vs after.
  **GO: ≥ 2 wave-5 kills (from 0) AND wave-5 scholar deaths per meeting
  down vs control.** (Baseline: 0 kills / 75 meetings / 31 scholar deaths.)
- Cost bar (brief): starvation deaths ≤ control+2 on totals AND on
  arm-only deaths; median survival ≥ 0.8× control median.
- Co-primary per MEASUREMENT §14c: villager (non-scholar) combat deaths
  reported alongside the scholar metric (field + TB, per meeting).
- Guards reported, not re-scored: national / table / wins (0/8 at
  baseline), wave-4 kills, wave-5 unlocks, release days. Overshoot watch:
  kills ≥ 7 on the band → GO-with-overshoot (lever likely too strong;
  recommend a smaller rung next run, do not silently keep the rung).
- Balance panel (§15): NOT part of the pilot judgment (the panel runs its
  own full panel and takes no corpus input — same precedent as
  grind-a / finishersize-a / adopt-a / vetfinish-b / spearvolley-b). On
  pilot GO, the confirm stage runs `scripts/balance-panel.js` compare
  (16 matched seeds, reconciled policies) as the guard instrument, plus
  the 12–16 seed confirm on a fresh band. The panel never overrides the
  pre-registered verdict.
- Telemetry: run `scripts/telemetry-check.js` per the loop body after the
  evidence is written; a LOUD line is a same-run investigation item.
  (Prior arms record the tool refusing recorder-corpus input; if it
  refuses again, record the refusal, do not reseed.)

## Confirm (only on pilot GO)

12–16 seeds on a FRESH band (full freshness search at that time),
competent, 150d, same primary + cost bar. Killed arms leave no trace:
game code reverted before commit, no policy files (none planned).

## Sense-testing

Read transcripts from the pilot corpus (field + TB wave-5 meetings):
does the blooded narration read, do fighters still walk in to parley
(finding #2063 is OUT of scope — do not chase it), do the fights stay
coherent? Judge meaning, not counts.

## Metric review (filled at evidence time)

- (to fill: did the sizing ladder pick cleanly? did the pilot primary
  bind? any metric-shape error?)
