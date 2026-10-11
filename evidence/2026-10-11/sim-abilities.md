# Long-run sim: abilities & godhood, lever 9 (2026-10-11)

First long-run-sim (not break-it) pass on lever 9. Prior break-it findings
skimmed (evidence/2026-10-11/break-abilities-r6.md) — succession background
kits, succession synergy recompute, purify grant, 16 dead abilities + 20
undiscoverable synergies (Steve's pick pending) not repeated.

Canon read: docs/CANON.md, docs/SYSTEMS.md (stale 2026-10-05 — tabulated map,
not a design doc; verified against code). No abilities-specific canon doc
exists beyond SYSTEMS.md/PROGRESSION.md/ENDGAME-BUILDS.md — noted, nothing
invented. Human≠alien lane respected throughout (purify = System magic per
Steve 2026-10-11; no occupation grants touched).

## Lever played: synergy discovery reachability

Sub-question: are synergy pairings actually discoverable/triggerable in a
200-day competent run? (Sharpest of the three: slot economy and unlock ladder
measured as context.)

Two small, documented changes (abilities & godhood only):

1. **Use-log hygiene** (src/js/game.js, noteAbilityUse): six call sites logged
   "uses" for abilities the scholar doesn't hold — cold_blooded/hollow_bones
   on travel, rain_dancer on dowsing-in-rain, grave_robber on scavenge,
   photosynthesis/third_eye on forage, chitin_skin on EVERY damage taken.
   The 40-entry abilityUseLog is what checkSynergyDiscovery reads for its
   "seen earlier today / same day-part" windows; the noise evicted real uses
   and broke sequential/simultaneous pairing. Now only held abilities log
   (tech/skill synthesis ids still pass through). chitin_skin is a synergy
   leg (perfect_chrysalis, living_armor) — the unguarded damage-taken logging
   was one bad day from phantom-adjacent noise.
2. **Hint honesty** (src/data/abilities.json): 5 of 7 synergyHints pointed at
   non-existent pairings — triage→"Adrenaline Control" (real: surgeons_calm
   = triage+steady_hands), adrenaline_control→"Triage + Adrenaline" (real:
   borrowed_surge = adrenaline_control+brawler's_instinct),
   field_dressing→"Preservation Instinct" and adrenaline_surge→"Triage"
   (neither ability has ANY synergy — hints removed, no false promise),
   lie_detector→"read_people skill" (real: tells = lie_detector+open_book).
   SENSE-TESTING failure: the discovery surface actively lied.

Proof: scripts/test-synergy-hygiene-20261011.js — 9/9 (hint honesty 5/5,
log hygiene 4/4). Adjacent: break-it r6 20/20, r5 23/23. Ontology gate has
1 pre-existing error (hierarchy.js grief_coalesces, travel worker's — verified
identical on pristine stash).

## Before/after (identical seeds, god policy, 200-day horizon)

Policy note: the stock competent policy takes ability offers but never
activates abilities. A real competent player uses their kit, so the sweep
uses a `god` variant (competent + fires available explore/camp/social/combat
ability actions, ≤3/day, no theft/grave-robbing). This is harness tooling,
not a game change. 6 seeds × 200 days.

| Metric (god policy) | Before fix | After fix |
|---|---|---|
| Synergies discovered | 3/6 runs | 3/6 runs |
| Synergy type ever discovered | peacemakers_voice only | peacemakers_voice only |
| Mean synergy attempts | 1.5 | 1.5 |
| Use-log volume (cap 40) | 40.0 (flooded) | 9.5 (honest) |
| Use-log distinct (held only) | 4.2 (incl. unheld noise) | 1.0–2.0 (held only) |
| Hint honesty (static) | 2/7 | 7/7 |
| Mean resonance | 23.7 (max 57) | 23.7 (max 57) |
| Resonance ≥35 (devotion lane) | 1/6 | 1/6 |
| Mean abilities held | 1.83 (max 3) | 1.83 (max 3) |
| Slots (abilitySlots) | 5.67 (integ 89–100) | 5.67 (integ 89–100) |
| Slot moments fired | 20/40/60/70/80 (all) | all |
| Villager abilities granted | 206 (60 villagers) | 206 (60 villagers) |
| Wins / table / Arc IV | 0 / 0 / 0 | 0 / 0 / 0 |

With the passive (stock competent) policy: 0/6 synergies — the player must
actually use the kit across contexts (social actions were the missing piece;
peacemakers_voice needs mediator.mediate_dispute pressed 3 times, diplomat
resonates passively). The mechanic works; the policy was underplaying it.

## Reachability verdict

- **Synergy mechanics: REACHABLE, but starved.** 3/6 with competent play —
  but only 1 of 51 synergies was ever in reach, because only
  diplomat+mediator legs are ever held together. The other 50 are decoration
  for competent play: not broken mechanics, acquisition-starved legs.
  Tease escalation (whisper→shimmer+hint→hero card) reads well; discovery
  narration is coherent System voice (SENSE-TESTING pass).
- **6-slot economy: DECORATIVE.** Slots reach 6 (integration 94–100, all
  five slot moments fire), but players hold 1–3 abilities. Acquisition
  (~1 ability / 30 days: day-7 offer + rare trial gifts) is the constraint,
  not slots. Slot 4/5/6 is empty capacity, not a real constraint.
- **Unlock ladder: capacity reachable, content not.** Slot moments, trials,
  mentorship beats all fire. But the rungs are empty — nothing to put in
  the slots, no legs to deepen. No run completed a synergy deepening beyond
  the single peacemakers_voice discovery; L3 mastery (35 uses/ability) never
  approached (best: mediator L2).

## Villagers act like people? (godhood)

Villagers EARN like people: deed-based XP tracks (combat/field/social/craft,
thresholds 3/8/16/32/64) granted 206 abilities across 60 villagers, System
announces each ("THE SYSTEM has been watching… Earned, not given"). Field
track dominates (60) — villagers work the land. Abilities are consulted as
real modifiers (tracker, game_sense, field_dressing, triage, haymaker…).

But the deep half of godhood is player-only: no villager ability use, no
villager synergy discovery, no villager deepening/resonance. progression.js
claims "NPCs climb the same ladder visibly (gossip)" — they climb the grant
ladder, not the practice ladder. Documented as blank (full villager synergy
is not a small change).

## Village assessment

Six villages, all village-lost by day 94 (median ~55). The godhood track is
a sidecar on a survival run: integration maxes effortlessly (curiosity pays),
slots open on schedule, the System hands out 1–3 abilities — and then the
village dies of combat/exposure before godhood matures. Who thrived: the
diplomat-mediator scholars who mediated disputes (peacemakers_voice in 3/6).
Who died: everyone, mostly to combat (51) and villager combat (22).
Missing capabilities: ability legs worth holding (only diplomat/mediator ever
co-occur), reasons to press combat/social actions deliberately, villager
practice. The blank filled: the discovery signal is honest now (log + hints).
The blank documented: 50/51 synergies and slots 4–6 are content without a
path — acquisition pace has no canon doc; not changed (would be inventing).

## Files
- scripts/sweep-abilities.js (new harness: god policy + ability telemetry)
- scripts/test-synergy-hygiene-20261011.js (proof, 9/9)
- scripts/test-synergy-stall.js (diagnostic replay)
- src/js/game.js (noteAbilityUse held-guard)
- src/data/abilities.json (5 hint fixes)
