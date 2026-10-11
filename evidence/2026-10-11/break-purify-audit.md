# Purify audit: human skills vs alien abilities (2026-10-11)

Steve 2026-10-11, overruling the r6 design call: "Purify should be an ability
not a skill. Thats magic. Audit thoroughly, let's not confuse human skills
and alien abilities that work more like magic."

Standing law (now in docs/CANON.md): HUMAN skills are teachable earthly
knowledge — occupations grant them as background, practice/discovery earn
them, they never take System slots. ALIEN abilities work like magic and come
ONLY from the System (offers, trials, milestones) into the 6 slots.

## Verdict: BROKE + FIXED (r6 reverted, full audit, 1 new System path)

Files: src/data/abilities.json, src/data/characterGen.json, src/js/game.js,
src/js/statusEffects.js, docs/CANON.md,
scripts/test-purify-audit-20261011.js (new),
scripts/test-abilities-breakit-r4/r5/r6-20261011.js (tripwire updates).
Proof: purify-audit 15/15 x3 seeds (20261011, 7, 99); FIX=0 goes 6-red on the
r6 misclassification. Adjacent: r6 20/20, r4 38/38, r5 23/23. Ontology 63/63.

## The purify fix (core directive)

- REVERTED r6: "purify" removed from pharmacist `granted` in
  src/data/characterGen.json. No occupation teaches magic anymore.
- abilities.json: purify unlock.type 'granted' -> 'system_offer'. It is now a
  System ability, acquirable through the System like the other 55.
- Counterplay (the r6 motivation, kept): TWO System paths, both following the
  established translator precedent ("friction inspires augmentation"):
  1. Day-7 `firstAbilityChoices()`: poisoned in week 1 -> purify is pushed
     into the 3 choices, leading (not the wild slot).
  2. NEW reactive offer: `maybeOfferPurify()` (game.js), hooked into
     `applyStatus()` (statusEffects.js) on scholar poison application.
     Post-day-7 only (canon: no System offers before arrival), idempotent
     (no duplicate while an offer is pending), slot-honest, skipped when
     purify is already held. The offer is a 3-choice sheet with purify first —
     agency preserved, the sheet is never a forced single.
- Activation path untouched (already worked): useAbility 'purify' ->
  cureStatus('scholar','poison'), once/day.
- NPC field kit keeps purify (7th, 32 XP): the System grants villagers
  directly — coherent, untouched.

## The audit: 18 occupations had magic in their background

Classification rule: HUMAN = a trained human with earthly tools could
plausibly do/learn this. ALIEN = violates physics/biology, supernatural
perception/transformation, or explicit System tech. Steve overrules edges.

Removed from occupation `granted` lists (all remain acquirable as System
offers — nothing deleted from the game):
- open_book x5: pharmacist, dispatcher_911, journalist, lawyer, bartender
  (reads numeric trust + secret fears — supernatural social perception)
- second_wind x4: physical_therapist, firefighter, mason, truck_driver
  (cheat death — unambiguously magic)
- third_eye x3: programmer, artist, pilot (forehead eye)
- taste_vision x2: chef, vintner (taste colors as loot radar)
- time_skip x1: programmer (skip time)
- scream_cheese x1: musician (stun monsters with a scream)
- fear_aura x1: mortician (supernatural dread)
- eyes_in_back x1: truck_driver (see behind you)
- dowsing x2: plumber, sailor (works 70%, "nobody knows why, including us"
  — folk magic that actually works; kept as System wacky gift)
- purify x1: pharmacist (Steve's ruling)

Gap fills (occupations must not arrive empty-handed):
- programmer: third_eye+time_skip removed -> granted **evidence_board**
  ("Who said what, when. The contradictions surface." — the debugging
  mindset; trial-type like the adrenaline_control precedent)
- truck_driver: second_wind+eyes_in_back removed -> granted **pathfinder**
  ("You don't get lost." — long-haul navigation; granted-type, homeless)

Kept as HUMAN background (borderline, noted): animal_ken (beekeeper —
"understand, not talk" reads as expert stockmanship), cornered_rat (soldier —
adrenaline), dowsing stays System-only (see above).

## Consequences, stated honestly

- Dead-ability tripwire: 16 -> 14 (evidence_board, pathfinder homed).
- Undiscoverable synergies: 20 -> 15 — farsight, trails_end, string_wall,
  trailblazers_promise, green_highway become discoverable through honest
  acquisition. Strict improvement; tripwires updated, Steve can overrule.
- clean_plate (purify + iron_stomach): purify leg now System-acquirable;
  iron_stomach still dead (documented).
- r6's "pharmacist grants purify" proof is superseded by the new C3
  (System-magic law); r6 FIX=0 still replays the r6 state per that file's
  convention.

## Sibling sweep

- NPC track kits (game.js NPC_ABILITY_KITS): System grants villagers directly
  — alien abilities there are COHERENT (the System is the granter). No change.
  Purify sits in the field kit; fine.
- System shop / aid quests: the aid-quest ability reward offers triage +
  field_medicine (human skills) as System gifts — the System being helpfully
  unhinged, not confusion; descriptions stay honest. No change.
- Synergy legs: no synergy required a removed background ability (removals
  were all system_offer, which keep their System home). Full leg census in
  the proof test.
- Mentorship teaches PLANTS, never abilities — no NPC ability-teaching path
  exists for the player. No change.
- `paths` fields are UI flavor dots only (app.js) — not a grant path.

## The (b) direction: human skills in the System pool

26 HUMAN abilities are system_offer-acquirable (pocket_sand, thief, rage,
dead_aim, camp_cook, diplomat, ...). Recommendation: KEEP. The System's gifts
explicitly "tend to utility (practical)" — an unhinged alien genuinely trying
to help hands you earthly tricks. That's coherent fiction, not confusion; no
description presents them as magic. Noted, not "fixed" — Steve can overrule.

## Census (85 abilities)

HUMAN (55): triage, steady_hands, game_sense, patient_aim, field_dressing,
preservation_instinct, field_medicine, herbal_remedy, brawler_instinct,
silver_tongue, pathfinder, lie_detector, iron_stomach, adrenaline_surge,
adrenaline_control, eagle_eye, evidence_board, gossip_network,
intimidating_presence, peacemaker, trade_of_blows, stalk, blood_trail,
ambush, haymaker, war_cry, soft_step, survivor, wanderer, green_thumb,
tracker, diplomat, camp_cook, generous, scrounger, loud_chewer, hoarder,
thief, cornered_rat, dead_aim, second_skin, mediator, compost_king,
pocket_sand, grave_robber, poisoner, scarecrow, cold_blooded, rage,
unbreakable, cannibal_frenzy, animal_ken, pyrokinesis, night_eyes, swimmer.

ALIEN (30): purify, photosynthesis, second_wind, lucky_rock, bird_whisperer,
chitin_skin, extra_stomach, deep_reserves, eyes_in_back, hollow_bones, molt,
third_eye, hive_mind, phoenix_clause, time_skip, water_breathing, blood_magic,
pact, symbiote, echo_location, translator, open_book, fear_aura, leech,
beard_moss, dowsing, rain_dancer, scream_cheese, squirrel_friend, taste_vision.

## Design calls made (Steve: figure it out yourself; overrule welcome)

1. Purify's home is system_offer + reactive poison offer (not trial, not
   milestone): poison is the trigger, so the cure should answer the trigger.
2. evidence_board -> programmer, pathfinder -> truck_driver (fiction fit).
3. dowsing classified ALIEN (supernatural-that-works) — removed from
   plumber/sailor backgrounds, kept as System wacky gift.
4. animal_ken / cornered_rat kept as HUMAN background.
5. Human skills in the System pool: intentionally kept (coherent generosity).
6. Pre-day-7 poison has no System counterplay (canon: the System hasn't
   arrived) — heal through it or don't get bitten.

## No [needs-eyes] decision

Acquisition path changed (purify via System now) — flagging [needs-eyes] so
Steve can feel the reactive offer on his phone.
