# Party Bond — evidence (2026-10-12)

Steve's approval: "Yes to all" — (1) party bond mechanic, (2) tank role
abilities, (3) undying_ward godhood as the village-scale home.
"Think deeply and address all gaps."

## Design calls

### 1. Party bond (combat dimension on the existing pair-bond store)
- **Found, not built:** betrayal.js already owns `v.bonds["a|b"] = {v, depth,
  day, dayGain}` — social warmth from meals/visits/feasts (+6/pair/day cap,
  no bonds with the dead/gone). A parallel store would have been two
  systems answering overlapping questions. The party bond rides the SAME
  store as a second dimension: `bnd.combat` (0..100). Warmth is who you
  like; combat bond is who you'd stand beside in the treeline. (This also
  fixed a real bug found mid-build: my first draft wired bondGet/bondAdd
  and betrayal.js loaded later and overwrote them — proof test caught it.)
- **Keyed to pairs of people** (sorted `a|b`), not crews — close-knit
  friends, per Steve. Same key format as the social bond.
- **Growth:** +4 per shared fight survived (noteSharedFight), +1 per
  day-part on the same outdoor task (noteCrewTogether, via the existing
  _outdoorCrew snapshot). No day-cap on combat — fights are rare; the
  social +6/day cap is untouched.
- **Combat bonus:** `min(0.08, avgCombatBond × 0.001)` added to the
  existing holdBonus-per-ally hook in fieldFights.js. Bond 100 beside your
  people = +0.08 steadiness. Earned.
- **Death grief:** the dead's pairs lose their combat dimension (set to 0 —
  social warmth lingers as memory, betrayal.js owns that; the fighting edge
  must be re-earned). Pairs among the survivors of the dead's party scale
  `survivors/party`. Grief, not amnesia.
- **Surfaces:** fight logs ("A and B have bled together — it steadies
  them."), gossip (`seedGossip('blood_bond', {brave, loyal})` on first
  crossing of 60), trust (`bumpTrust` ±3 at milestone, +1 per shared
  fight). No new management UI — knowledge-gated: you tell who's close by
  watching them fight together.

### 2. Tank role (TANK ZERO → three System abilities)
- **Canon lane check (Steve 2026-10-11):** human skills ≠ alien abilities.
  These are System-granted (combat pool, `system_offer` unlock), never
  occupation-taught. Villager NPC combat kit now includes them.
- **Ability honesty law (Steve 2026-10-12):** descriptions name the real
  mechanic and its real scope — wild fights beside your people. No
  player-tactical hooks promised (future work, documented in code).
- draw_fire — monster's ally-hit share 40%→10% once per fight. Log:
  "draws its eye — 'Me. I'm the problem.' The beast turns."
- bodyguard — once per fight, an attack meant for a wounded-or-not ally
  lands on the fighter instead ("Not them."). Fires only when the ally
  would actually be hit.
- shield_wall — while an ally stands with them, damage taken ×0.75 (min 1).
  "The ward's takeWound capstone has a mortal version — this is it."
  Thematic continuity with undying_ward godhood (godhood.js takeWound).
- **AI wiring (the fight uses them, not just grants them):** draw_fire fires
  on the first monster attack when an ally is in; bodyguard intercepts at
  the hit-distribution site; shield_wall reduces damage in the fighter
  damage-taken block. All guarded by `vHasAb` on the fighter's NPC kit.

### 3. Ward village-scale bond
- **wardAnchor():** 1.0 if the Bearer ascended undying_ward (persistent
  godhood state), 0.5 if any villager walks the ward path (≥3 of
  triage/steady_hands/field_medicine/leech/purify/second_wind), else 0.
  Steve said "or leaning close — your call": the 0.5 tier is the lean.
- **Village pool** `v.villageBond` (0–100): +2 per villager fight survived
  (anchored only), ×0.9 on any villager death ("the village feels it — the
  bond dips, but holds"). Bonus = `anchor × villageBond × 0.0008` into
  holdBonus. Max +0.08 at full anchor and pool — same scale as the pair
  bond, so the ward feels like an extension, not a replacement.

### 4. Depth-probe gaps (in-theme: keeping your people alive)
- **Fitness gate:** villagers under 40 HP are refused outdoor assignments
  (assignTask) AND held at resolution (resolveAssignments — wounds happen
  mid-part, task leads assign themselves). Honest copy, not silent: "can
  barely stand (X HP) — not the treeline."
- **Newcomer pairing:** `arrivedDay` recorded in membership.js arrivalTick;
  newcomer = arrived <14 days. A newcomer on an outdoor task is paired with
  a veteran (bravery ≥10) already on the same task — `buddy` recorded on
  the assignment; the crew-together hook then grows their combat bond.
  No veteran on the crew: honest warning, assignment stands (the village is
  desperate, not stupid — but it says so out loud).

### Sibling coordination (party-wiring)
- They own ally ARRIVAL; I own the WHY. My fieldFights.js regions:
  holdBonus calc (~line 255), hit-distribution block (~line 490),
  fighter damage-taken block (~line 570), end-of-fight hooks (~line 680).
  All hooks are additive/optional — no shared index, no conflicts expected.

## Proof
scripts/test-party-bond-20261012.js — node harness via sim-harness
(seeded BEFORE eval; Game.save never stubbed).
- 36/36 green (SEED=20261012; deterministic).
- RED-verified: module removed → "Game.combatBondGet is not a function"
  (harness errors immediately); draw_fire hook neutered → both tank
  assertions fail (34/36). Restored → 36/36.
- Covers: bond growth (+4/fight, caps 100, symmetric), combat bonus
  scaling (0 → 0.08), grief proportional (2/3, not zero; dead pairs zeroed),
  shared survival through the real engine, draw_fire (log + 0 ally hits at
  forced share), bodyguard (exactly 1 intercept), shield_wall (vTaken lower
  same-seed), ward anchor 1.0/0.5/0 + village bonus, fitness gate
  (refused+wounded / assigned+healthy), newcomer buddy pairing,
  ability-data honesty (combat pool, undying_ward resonance, wild-scope
  descriptions).
- Ontology: validate-ontology.js — 87/87 systems validated.

## Files changed
- src/js/party-bond.js (new) — the system module.
- src/js/fieldFights.js — bond bonus, tank hooks, end-of-fight hooks.
- src/js/game.js — fitness gate, newcomer pairing, crew-together hook,
  tank abilities in NPC combat kit.
- src/js/membership.js — arrivedDay recording.
- src/data/abilities.json — draw_fire, bodyguard, shield_wall.
- index.html — load order (party-bond.js after party-formal.js).
- docs/ONTOLOGY.md — regenerated by validator.
- scripts/test-party-bond-20261012.js — proof.
