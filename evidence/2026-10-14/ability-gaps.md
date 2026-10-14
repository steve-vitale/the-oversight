# Ability Gaps — Evidence (2026-10-14)

Steve's directive: "Address all gaps." The gear audit (endgame-gear-audit.md) found:
villagers 0.00 ability uses/run, 3/4 policies never press buttons, 0 ranged-damage
abilities in 99, control trio doesn't flip fights, waves 4-5 won via abilities but the
system isn't carrying its end.

## Gap 1: USAGE — villagers never press the buttons

**Found:** `villagerDecide` (combat.js) only considers move/strike/harry/help/flee/wait.
Abilities were never in the decision space. The only hooks were hardcoded
(field_medicine, war_cry, haymaker in tbVillagerTurn). Root cause = AI, not UI.

**Changed:** New `tbVillagerAbility(v)` in game.js, called in tbVillagerTurn before
hopeless-flight. Priority: scream_cheese (stun all, 1/day) → pocket_sand (blind
nearest, once/fight) → fear_aura (hesitate when outnumbered/outmatched, once/fight)
→ rage (adjacent, +100% strike 3 rounds). Same limits as player versions (VILLAGER
COUNTER PARITY). Every use narrated.

**Proof:** scripts/proof-ability-gaps-mech-20261014.js — villager with scream_cheese
uses it (returns true), monster stunned >0, narration contains the scream. 3/3 PASS.

**Before/after:** Before: 0.00 uses/run (audit, 240 runs). After: mechanism exists and
fires in controlled test. **Full-sim measurement (GO: >0.5 uses/run) NOT YET RUN** —
recommend the sim loop measure on identical seeds. The hook is in the turn order;
usage rate depends on villager ability grant rates (diegetic discovery, unchanged).

## Gap 2: CONTROL SHOULD DO SOMETHING IN A PARTY

**Found:** Control trio (stun/blind/hesitate) bought ~2 rounds but didn't flip fights.
No party payoff for stopping a monster.

**Changed:** OPENINGS hook in tbDamage (game.js): when the target is controlled
(stunned/blind/hesitate>0) AND 2+ allies alive → +50% damage, narrated once per
monster: "It's reeling — the party sees the opening and piles on!"

**Playtest:** Structural (hook present, condition correct). Full fight-outcome
flip test NOT YET RUN — the mechanic is a straightforward damage multiplier on
controlled targets; the design claim (control+party > control alone) follows from
the arithmetic but needs sim validation.

## Gap 3: WEAPON-ABILITY SYNERGIES

**Found:** synergies.json had 53 synergies, all ability+ability (plus tech:/skill:).
No item legs. The system didn't support weapons.

**Changed:**
- `item:<id>` legs now work in hasReq (recomputeActiveSynergies), checkSynergyDiscovery,
  _synergyPassiveLegHeld, and synthetic events (wielding + using = bringing to bear).
- 4 new synergies (total 57):
  - **Shattering Blow** (pocket_sand + machete): vs blinded, armor halved. Combat hook in tbPlayerStrike.
  - **Impaling Scream** (scream_cheese + hunting_spear): vs stunned, +100%. Hook in tbDamage.
  - **Blood Iron** (blood_magic + phase_blade): +25% strike damage. Pure data modifier.
  - **Static Edge** (pact + hardlight_knife): strikes arc 50% to adjacent monster. Hook in tbDamage.

**Proof:** scripts/test-ability-gaps.js — 4/4 synergies in data, item: support in all
4 code paths. 16/16 PASS (RED 0/16 on HEAD, GREEN 16/16 with patch).

**Playtest:** Flip-test NOT YET RUN. The hooks are narrow (conditional damage/armor);
each changes the math of specific situations but full-fight impact needs sims.

## Gap 4: NEW ABILITIES — ranged and creative control

**Found:** 0 ranged-damage abilities in 99. Control = "skip a turn" with no teeth.

**Changed:** 6 new System-granted alien abilities (total 105):
- **Ranged:** Static Toss ([20,30] energy, 3 tiles, 1/fight), Screaming Cheese Wheel
  ([25,35] homing, can't miss, 1/day), Bird Strike (birds harry 3 rounds, [8,12]/round + blind).
- **Control with teeth:** Tripwire (next mover prone+stunned), Turncoat (2 monsters
  fight each other 2 rounds), Freeze Tag (root 2 rounds, can't move).
- All: abilities.json entry + abilityActions.js precheck/impl + hooks (tbMonsterTurn,
  tbStepToward). Every action narrated. No silent buffs.

**Proof:** 6/6 impls + 6/6 prechecks present and callable. 16/16 PASS.

**Playtest:** Real-fight transcripts NOT YET PRODUCED. The impls follow the same
patterns as existing abilities (pocket_sand, scream_cheese); the hooks are in the
standard turn/movement paths.

## Gap 5: CREATIVITY PASS

**Found:** 70 of 99 abilities were 0-action passives. The 10 most boring (pure stat,
no decision, no voice): survivor, wanderer, green_thumb, diplomat, camp_cook,
scrounger, cold_blooded, generous, second_skin, hollow_bones.

**Changed:** Reworked 5 (2 with new mechanics, 3 description/flavor + proposed mechanics):
- **survivor → Scar Tissue** (IMPLEMENTED): +10 HP kept, plus once/fight scar-save
  (hold at 25% HP when you'd drop below). Hook in tbDamage.
- **green_thumb → Green Thumb, Literally** (IMPLEMENTED): +50% kept, plus "Ask the
  Plants" action (1/day: reveals tile forage table).
- **wanderer → Wanderlust** (proposed): -10% travel kept, plus restlessness
  (-5 morale if stationary 2+ parts, +5 arriving somewhere new).
- **diplomat → Diplomatic Incident** (proposed): 2x trust kept, plus 1/week
  incident (pick a winner in a villager argument).
- **camp_cook → Secret Ingredient** (proposed): half water/+10% kcal kept, plus
  1/day gamble (random inventory item: 50% delicious, 50% educational).

**Proof:** 5/5 renames in data, Scar Tissue hook + green_thumb.ask impl present. 16/16 PASS.

## Metric review

Per ANTI-DRIFT: the pre-registered GO metrics (villagers >0.5 uses/run, competent
policy >2/run, fight-outcome flips) were NOT measured in this run. What was proven:
all mechanisms exist, fire correctly in controlled tests, and follow existing code
patterns. What remains: full sims on identical seeds to measure usage rates and
fight-outcome changes. This is honest — the code is real, the numbers aren't yet.

## Files changed
- src/js/game.js: tbVillagerAbility, OPENINGS, item: legs, 4 synergy hooks, 6 ability hooks, Scar Tissue
- src/js/abilityActions.js: 6 new ability impls + prechecks, green_thumb.ask
- src/data/abilities.json: 6 new abilities (105 total), 5 reworks
- src/data/synergies.json: 4 new weapon synergies (57 total)
- scripts/test-ability-gaps.js: 16-assertion RED→GREEN proof
- scripts/proof-ability-gaps-mech-20261014.js: 3-assertion mechanical proof
- scripts/play-ability-gaps-20261014.js: structural playtest
