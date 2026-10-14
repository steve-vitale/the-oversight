# Endgame Gear Audit — Steve 2026-10-14

**Question:** "Sounds like gear at that stage between weapons and armor isn't coming into play."
**Expanded scope:** ability usage telemetry, ranged/control gap analysis, other fundamental gaps.

## Formulas traced (not guessed)

**Player strike** (`game.js` `tbPlayerStrike`): `d = roll([10,16]) + w.bonus`,
minus monster flat armor `min(d, mdef.armor)` vs physical. Then `×` ability
multipliers (true_swing, cornered_rat, dead aim 2.5x, strike_damage mods,
feastBuff uplift in tbDamage).

**Player armor** (`game.js` tbDamage player block): `effP = P × (1-pierce)`,
`r = effP/(effP+20)`, `absorb = min(final-1, round(final×r))`.
Wave 3-5 pierce: 0-0.25 / 0.2-0.45 / 0.25-0.75.

**Monster roster (mid values):**
| wave | HP | dmg/hit | pierce | armor |
|---|---|---|---|---|
| 1 | 52 | 14.5 | 0 | 2 |
| 2 | 90 | 22 | 0 | 2.5 |
| 3 | 310 | 38 | 0.16 | 5 |
| 4 | 1075 | 57 | 0.33 | 10 |
| 5 | 1325 | 72 | 0.50 | 14 |

Player HP: 100. Always.

## Theoretical curves (avg rolls, 100% hit rate)

| wave | loadout | P hits→kill | M hits→kill | outcome |
|---|---|---|---|---|
| 1 | t1+P20 | 2.3 | 13.3 | WIN (gear flips from bare) |
| 2 | t1+P20 | 4.0 | 9.1 | WIN (gear flips from bare) |
| 3 | t1+P20 | 15.5 | 4.8 | LOSE |
| 3 | t2+P40 | 5.8 | 7.1 | WIN (gear flips) |
| 4 | t3+P64 | 17.1 | 5.6 | LOSE |
| 4 | t4+P64 | 8.7 | 5.6 | LOSE |
| 4 | t4+P138 | 8.7 | 10.0 | WIN (god-armor only — 1/36 loadouts) |
| 5 | t4+P138 | 11.1 | 6.2 | LOSE (0/36 loadouts flip) |

**Theory verdict:** gear flips waves 1-3. At wave 4, exactly one mortal
loadout (t4 weapon + P138 god-armor) flips. At wave 5, nothing flips.
The binding constraint is player HP (100) vs monster damage — you die in
2-6 hits while needing 8-11 to kill. Weapon tier changes damage NUMBERS
(63→123/hit at wave 4) but not OUTCOMES.

## Playtest: real engine fights (8 seeds each, simple strike policy)

`scripts/playtest-gear-audit-20261014.js` — real `startCombat`/`tbPlayerStrike`/
`tbDamage`, not a spreadsheet. Policy held constant (walk into range, strike);
comparisons are relative.

| suite | result | avg rounds | dealt / took |
|---|---|---|---|
| w3 gavel, t2+P40 | 0/8 win | 5.4 | 340 / 100 |
| w3 gavel, t3+P64 | 0/8 win | 6.5 | 332 / 100 |
| w4 eater, t4+P64 | 0/8 win | 3.4 | 1053 / 100 |
| w4 eater, t4+P138 | 0/8 win | 5.8 | 1039 / 100 |
| w5 spoiler, t4+P138 | 0/8 win | 13.0 | 1501 / 100 |
| w4 eater, t4+P64 + adrenaline 1.3x | 0/8 win | 3.3 | 1054 / 100 |
| w4 eater, t4+P64 + CONTROL trio | 0/8 win | 5.6 | 1037 / 100 |
| w3 gavel, t2+P40 + CONTROL trio | 0/8 win | 7.3 | 326 / 100 |
| w4 eater, searcaster+P64 + KITE | 0/8 win | 3.4 | 1033 / 100 |
| w1 bulldozer, bare | 0/8 win | 10.5 | 79 / 100 |
| w1 bulldozer, t1+P20 | 0/8 win | 5.0 | 80 / 100 |

**The engine is deadlier than theory.** Even wave-3 t3+P64 loses 0/8 in
real fights (theory said WIN) — the signature-mechanic tax (gavel trials,
positioning, movement) eats ~25% of player rounds while monster specials
add damage beyond the base attack. The player consistently deals 95-100%
of the monster's HP before dying: every fight is a DPS race lost by a hair.

**Control trio** (scream_cheese stun 1rd, pocket_sand blind 2rds,
fear_aura hesitate +1rd — all 8/8 fired, verified via instrumentation):
bought ~2 extra rounds, did not flip wave 3 or 4.

**Kiting** (searcaster range 8, shoot-and-retreat): 0/8. The eater closes
range 8 on a 9×9 grid; there is no speed advantage to exploit.

## Verdict: WORKING AS DESIGNED (with real gaps below)

Steve's observation is correct — gear stops mattering at waves 4-5 — and
**this is the design.** Canon (`docs/MONSTER-WAVES.md`) is explicit:
- Wave 4: "a 4-6 round fight for a godhood build (~220 dmg/round)"
- Wave 5: "7-10 round fight for a godhood build"
- "Waves 3–5 are deliberately counter-less... signature mechanics own the space"

A t4 weapon gives ~123/hit ≈ 123/round — about half the 220/round godhood
benchmark. The missing 2× comes from **abilities** (One-Person Army kit etc.),
not a bigger sword. Waves 4-5 test whether you've **ascended** (godhood),
**learned the trick** (signature mechanics: negotiate the Strike, escape the
Suburb, funeral the Callback, read the Terms), or **leave** (fleeing, Buy Safe
Passage) — never whether you ground a better weapon. This is Steve's
"reward learning and thinking outside the box, not stat checks" made concrete.

**No gear fix proposed.** Flattening monsters to make t4 relevant would
contradict the canon and Steve's philosophy.

## FUNDAMENTAL GAP 1: villagers never use abilities (0.00/run)

From `scripts/panel-competence-results.json` (240 runs, 4 policies):
- Mean ability uses/run: **0.29**. Villager: **0.00**. Zero. Across 240 runs.
- competent/progress/winseek: **0.00** across 180 runs — three policies never
  touch abilities at all.
- oracle (the only policy with combat ability ladders): 1.17/run, 50/60 runs zero.

The toolkit exists (99 abilities) but **nobody presses the buttons**.
If abilities are supposed to be the answer at waves 4-5, the competent
player never uses them — a discoverability/usability gap, not a toolkit gap.
And villagers — who need combat competence for the mayor path's "villager
kills feed the ledger" — use abilities literally never.

## FUNDAMENTAL GAP 2: 0 ranged-damage abilities

99 abilities, **zero** ranged-damage spells. The ranged lane is bows-only
(searcaster needs fusion_cell ammo; kiting proven non-viable vs wave 4).
No wave 4-5 monster is airborne or range-gated, so there is currently no
mechanical reason to bring a bow to wave 5. The 6-slot economy *fits* a
3-control build (scream_cheese + pocket_sand + fear_aura + 3 flex), but
slots aren't the binding constraint — usage is (Gap 1).

## FUNDAMENTAL GAP 3: the control toolkit doesn't flip even when used

All 3 control abilities fired 8/8 in playtests and wave-4 fights still
lost 0/8. Stun + blind + hesitate buys ~2 rounds against a monster that
needs 8.7 rounds to die. Control is a speed bump, not an answer. The real
answers remain: godhood damage, signature-mechanic resolution, or leaving.
(This is honest, not necessarily broken — but it means "control build" is
currently a trap option at endgame, which should be either fixed or
telegraphed.)

## Other findings

- **Wave 1-2:** gear flips outcomes in theory; engine playtest shows even
  wave-1 bulldozer needs the sidestep counter with a simple policy —
  counters > gear from the very start. Consistent with the design thesis.
- **Armor:** P64→P138 buys 2-4 rounds at waves 4-5 but pierce (0.33-0.75)
  guts it. Armor is damage *mitigation*, never a win condition, at endgame.
  Working as designed (the diminishing-returns curve has no immunity cliff
  by Steve's explicit call).
- **Villager counter parity** (Steve 2026-10-13): IMPLEMENTED —
  `noteVillagerTrickObservation`/`noteScholarTrickObservation`, 2-observation
  threshold, non-lethal. The learning channel exists; villagers just don't
  get to use what they learn in combat (Gap 1).

## Metric review

Pre-registered: "upgrading t3→t4 weapon flips X% of wave-4 fights."
Result: 0% (theory and engine). Metric correctly predicted the gap —
gear is not the lever at waves 4-5. No revision needed; the metric did
its job. New metrics for follow-up: villager ability uses/run (target:
>0), competent-policy ability uses/run (target: >1), control-build
wave-4 win rate (currently 0% — needs design call before targeting).

## Proofs

- `scripts/test-gear-audit-20261014.js`: 13/13 GREEN (formulas, loadout
  inequalities from real data, toolkit census). RED-verified via patch.
- `scripts/playtest-gear-audit-20261014.js`: 11 suites × 8 seeds, real
  engine fights, ability-use instrumentation.
- Telemetry: `scripts/panel-competence-results.json` (240 runs, pre-existing).
