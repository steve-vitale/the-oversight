# Design call #4 — Standing opens the door, readiness decides (2026-10-16)

## Mechanism found

Wave unlocks live in two places:

1. **`Game.unlockedWave()`** (src/js/game.js) — the door. Waves 4/5 open on
   `villageStandingTotal() >= t4/t5` (100/200, Steve's 2026-10-13
   flexible-route call: standing earned by blood, bonds, or bread).
2. **`Game.villageStandingTotal()`** (src/js/standing.js) — the gated number.
   Three layers sit on the honest breakdown (war/diplomacy/plenty):
   plenty-cap toward T5, faced-experience deferral, monotonic peak ratchet.
   `monsterWavePool()` reads `unlockedWave()`, so a held total keeps the new
   wave out of spawns entirely — the door opens but the village never walks
   through. Beats are honest (`_standingHoldBeat`, `_standingReleaseBeat`,
   `standingLine` HELD notes) — no silent gates.

## Root cause

The 2026-10-15 readiness-gate v3's "readiness" is **exposure, not capability**:
`waveUnlockReady()` demands N distinct wave-(w-1) types *faced*, and
`waveEngaged()` explicitly counts **fleeing** ("Fleeing counts — you stood on
the grid"). A village can flee three wave-3 monsters and be deemed ready for
wave-4 monsters (damage 35–95, HP 850–1500, pierce 0.2–0.5) while unarmored,
unarmed, trickless, and bloodless. Deeper: `waveEngaged` was declared
ENGINE-UNUSED for unlocks by Steve's 2026-10-10 reversal of 8730921c; v3
re-purposed it anyway. And standing itself is a *recognition* currency — the
bread road (5 feasts → 100) opens the wave-4 door with zero combat
capability. Nothing in the unlock path reads combat capability at all: no
armor worn, no weapons available, no counters known, no record of who has
fought and won. Villages get promoted into wars they can't fight.

## The readiness formula (new `waveCombatReadiness(w)`, standing.js)

Four named bars, all read from LIVE village state, fail-closed (missing API
reads as 0 — never ready by accident). Fighters = `state.village.roster`
(13th entry: the scholar, roster[0]) minus the dead (`vpOf(vid).dead`).

- **ARMORED** — fighters with armor *worn* (`S.equipment.armorOf(vp,
  data.items)`, the same reader the armor model uses; scholar via
  `armorBonus()`) at P ≥ demand. w4: 4 fighters @ P≥15 · w5: 6 @ P≥20.
  (Armor tier anchors: medium ≥10, heavy ≥25; P=20 halves hits.)
- **ARMED** — fighters with a weapon *equipped* (`meleeWeaponOf` /
  `rangedWeaponOf`) or a weapon item carried in their pack (scholar via
  `equippedWeapon().unarmed===false` or inventory). w4: 5 · w5: 7.
- **TRICKS** — counters known under the `monsterCounterKnown` convention
  (`state.monsterCounters[id]` + def carries `counter`): the village learns
  monster tricks. w4: 3 · w5: 4. (Waves 3–5 are deliberately counter-less,
  so this is a learning signal, not wave-matched.)
- **VETERANS** — living roster members with a recorded kill of a wave-(w-1)+
  monster in `state.waveKillLog` (`by` = vid; the scholar's kills land under
  `this.villagerId` via `recordWaveKill`). Survivors of combat — fleeing
  records nothing here. w4: 2 (killed wave-3+) · w5: 3 (killed wave-4+).

`waveUnlockReady(w)` keeps its contract (the deferral layers, beats, and
peak ratchet are untouched) but is rebuilt on `waveCombatReadiness`:
`ready` = all four bars met; `short[]` names the missing bars so the hold
beat can say exactly what's wanted. Waves 1–3 unchanged (never gated).
Demands live in `standingCfg()` as sim starting points — tune on evidence,
Steve can overrule.

## The call made (Steve: make the call, he can overrule)

- Standing opens the wave door, gated exactly as now (blood/bonds/bread,
  plenty cap toward T5, peak ratchet).
- Readiness decides whether the village walks through: the faced-experience
  deferral is REPLACED by the combat-capability bars (deliberate — exposure
  is not readiness, and Steve's 2026-10-10 reversal already said
  engagements don't unlock waves).
- Unreadiness is never silent: the hold beat names the short bars
  ("arm the village — 2 of 5 fighters armed; learn tricks — 0 of 3 known")
  with the existing initial + 7-day reminder cadence, and `standingLine`
  names the HELD wave. Wave-4's title stays unnamed before wave 3 unlocks
  (the 2026-10-15 knowledge-gate discipline) — the bar is named, not the
  wave: the village knows it's not ready; the scouts report the horde.

## Proof

`scripts/test-readiness-20261016.js` (RED→GREEN, seeded): a bread-road
village (standing 100 via 5 feasts, day 60, wave-3 open) that FLED three
wave-3 monsters and is unarmored/unarmed/trickless/bloodless. On pristine
code it unlocks wave 4 (the bug — promoted into a war it can't fight);
after the fix it holds at wave 3 with the hold beat naming the bars.
Gear it up (4× hide armor P≥15, 5 weapons, 3 counters, 2 veterans with
wave-3 kills) → unlock releases to wave 4. A fully ready village unlocks;
waves 1–3 unchanged; plenty cap, peak ratchet, no-win-before-90 intact.

## Metric review

- The four demand numbers are sim starting points, not canon — the sim
  loops own tuning. Steve can overrule any of them.
- ARMOR DIAGNOSTIC TENSION (honest): the 2026-10-15 readinessbind diagnostic
  put armor P OUT of the bar ("armor and trust INVERT" as covariates on
  diplomacy/plenty roads). Design call #4 (Steve-approved 2026-10-16)
  explicitly requires "armor worn" as an input — the diagnostic measured
  armor as a *correlate of outcomes* under the old exposure framing; the
  call reframes it as a *capability floor* (a village in hide armor can
  still lose, but an unarmored village cannot be called ready). If the sim
  loops find the armored bar binding wrongly, the demand numbers (or the
  bar) are the lever — the representation stays.
- Known approximation: "veterans" counts killers, not everyone who fought
  and lived without landing the blow — per-fighter non-kill participation
  is not tracked anywhere in state (fights-fled are explicitly
  non-recorded). Kills are the hard proof of combat survived.
- Armor reads WORN armor only (packs don't count — you don't fight in
  what's in your pack); weapons count equipped OR carried (a spear in the
  pack is available to grab).
