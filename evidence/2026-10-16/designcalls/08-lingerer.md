# Design call #8 — LINGERER ANSWER (2026-10-16)

Steve-approved: wave-4/5 lingerers (monsters that won't leave) are answered by
**"Endure it"** (the default) or a **real costly played sortie** — never a flat
button/roll. Implemented on branch `dc8-lingerer`.

## Root cause

There was **no flat button or roll to replace** — the honest gap was that neither
half of the design call existed yet:

- `driveOffFeastDraw` (feastBuff.js) IS a flat free button — but it declines the
  feast-draw *pending encounter*, narrated honestly as declining the fight. Not a
  lingerer; deliberately-designed; left alone.
- `answerRaidDefense('fight')` (villageAgency.js) IS a flat roll (15% death per
  mustered villager) — but it answers *human village* raids (`pendingRaidDefense`
  is only queued by villageAgency for village champions). Not monsters; out of
  scope for this call.
- Monster lingerers (`m.lingering` world-monster entities, havenGrowth.js
  `havenRaidTick` → `havenGrowthDaily` gorge): the nightly gorge text said
  *"Drive it off, or call for help"* — implying answers that were barely real:
  - drive-off existed only as *incidental* patrol/wild-encounter fights routed
    through `aidFight`/`fieldFight` — real played fights, but dormant in practice
    (sim-predation-b 2026-10-14: 0/17 wave-4/5 drive-off kills).
  - call-for-help was a trap for lingerers: gorgcall-b (2026-10-14) proved
    arrived help ("Darius Haddad of Emberhold walks in with 4") never engaged —
    the gorge continued 7 nights (7,980 kcal) with help at the door; `aidFight`
    dormant, no path routed arrivals into the lingerer.
  - the *de facto* default was already the 6-day safety valve
    (comms.js `commsTick`: `day - crisis.sinceDay > 6` → `resolveAidCrisis('moved-on')`,
    lingering flags cleared) — but it was never *presented* as the answer.
- The raidshield attempt (2026-10-16, reverted zero-trace) tried a "treeline
  sortie at 3 dawns" as *automatic* defense and was killed at NO-GO for doubling
  the body count. Lesson applied: the sortie must be **player-initiated** with
  honest stated costs, not an automatic tax.

## The call made (option (a): build the played sortie)

- **"Endure it" is now the explicit honest default.** The nightly gorge text names
  it and its price: *"Endure it (they drift off within ~6 nights — the gorge is
  the price), or send a sortie: fighters, rations, real risk."* The "Endure it"
  beat button just says so aloud — doing nothing was always the same answer.
- **`Game.lingererSortie()`** (havenGrowth.js): player-initiated, no flat rolls:
  - **Risk:** musters 3 villagers via `_musterAway(3, 'defense')` (needs ≥2, else
    honest refusal); each lingerer is fought by the party leader + allies through
    the existing `fieldFight` blow-by-blow engine (real monster stats, real
    villager stats/gear/armor, morale-driven flight). Villagers can die —
    `hurtVillager` runs the real death pipeline; a fallen leader breaks the sortie.
  - **Resources:** each fighter takes a day's marching rations — 2,000 kcal each,
    deducted from the real pantry via `_removePantryKcal` (whole-unit doctrine,
    actuals reported).
  - **Planning:** a played sequence — named muster, the march, one real fight per
    lingerer in turn, honest aftermath per fight (kill → corpse/loot/ledger;
    monster flees → lingering flag cleared, it's driven off the treeline but still
    out there; party flees or leader dies → sortie breaks, the rest keep gorging).
    Treeline cleared → `resolveAidCrisis('fought')` for raid crises, so the
    'the-siege' win-path beat fires (wealth drew teeth; teeth were answered).
  - Not routed through `aidFight`: it would replace the mustered party with
    foreign allies mid-sortie and resolve the crisis after the first kill. The
    sortie is the village's own fight.
- Canon check: "Monster encounters are fought, not rolled" (Steve 2026-10-08) —
  the sortie plays through `fieldFight` (its @ontology: "never an outcome
  table"); no new roll/table anywhere in this change. Human-skills/alien-abilities
  untouched. Knowledge gating respected (`monsterNoun` for names).

## Why not option (b)

(b) said: if a real sortie is infeasible, remove the flat option and leave
"Endure it" + ordinary combat. There was no flat option for monster lingerers to
remove, and the sortie was feasible on existing machinery (`fieldFight`,
`_musterAway`, `_removePantryKcal`, `resolveAidCrisis`) — so (a) was the honest one.

## Proof

`scripts/test-lingerer-20261016.js` — RED→GREEN on the sim-harness
(seeded Math.random before eval, full index.html module list minus DOM-only,
`delete global.window` before play, `Game.save` never stubbed):

- RED (pre-fix, via `git stash`-free checkout of HEAD versions — see script):
  `typeof Game.lingererSortie === 'undefined'`; the gorge text offers no
  endure/sortie choice; no engine path lets the player answer a lingerer.
- GREEN: sortie requires 2+ fighters (refuses honestly with a bare bench);
  deducts rations from the pantry (delta == min(pantry, 2000×fighters));
  plays real `fieldFight`s (asserted via a call counter — no flat rolls in the
  path); a kill removes the entity and stops its gorge; the treeline cleared
  resolves the raid crisis 'fought'; "Endure it" changes nothing and costs nothing.
- Result: **36/36 GREEN** across the seeded matrix (RED: methods deleted —
  no sortie path exists pre-fix; GREEN parts 1–9 above).

## Caveats

- [needs-eyes] on combat feel: a wave-5 lingerer (e.g. The Rerun, HP in the
  hundreds, damage 20-70) vs 3 villagers is usually lethal for the party —
  that IS the honest price, but Steve should see the narration tone.
- The call-for-help trap (gorgcall-b) is NOT fixed by this change: arrived help
  still doesn't engage lingerers on its own. The sortie is the player's answer;
  making arrivals join sorties is follow-up work.
- The sortie button renders in the beats panel while lingerers persist; the
  "Endure it" button dismisses it for the day. The 6-day valve is unchanged.
- `check.js --quick` run pre-commit; green-list rules observed.

## Metric review

Pre-registered: RED must show no sortie path and no honest endure framing;
GREEN must show rations deducted, real fieldFights played, risk real
(fighter damage/death possible), no flat outcome tables in the path. All held.
No mid-run re-scoring.
