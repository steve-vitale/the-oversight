# Succession inheritance feel — pre-registered bars (tackle-succession)

Steve's ruling (2026-10-27): when the player takes over as a villager, that
character must feel purpose-made and intentional — the items they would have,
the choices they have made, their build — not a blank or reset character.

Gating freeze respected: no deedGateReady / scale / stage / readiness-bar /
table-price changes anywhere in this workstream.

## Takeover case under test
Death mantle: `Game.playerDeath()` on current master, heir chosen by trust
(highest trust NPC). The proof test plants a fully-owned heir before the
death: distinct tongues, worn body + accessory gear, carried items, stashed
belongings, abilities, track XP, a pending level-up sheet, skills, plant
knowledge, a bond, and a personal goal — then checks what the new bearer
wakes up with. (Nomad-road mantle shares `mantleBecome`, so the code fix
applies there too; the road's own body-state handling is NOT changed here.)

## Bars (all must pass; a miss is NO-GO, never re-scored)
1. items-carried: every heir person.items id is in scholar.inventory or
   scholar.equipped after the death; no heir item is lost.
2. stashed-carried: every heir person.stashed id is in scholar.inventory
   after the death; person.stashed is emptied (no orphaned belongings).
3. worn-preserved: every slot the heir wore before death (body + acc1-4)
   still holds the same itemId after the death (free acc slots may gain a
   keepsake via the existing migrateKeepsakes pass; worn slots never move).
4. abilities-carried: scholar.abilities ids equal the heir's npcAbilities;
   the heir's knack stays latent.
5. tracks-carried: scholar.tracks xp equals the heir's npcXp per track, and
   scholar.levelUpQueue equals the heir's pending sheets.
6. knowledge-carried: codex plants include every plant the heir knew;
   codex skills include every heir npcSkill; codex ability levels never
   drop below the heir's npcKnow levels.
7. languages-carried: scholar.languages equals levelsOf(heir languages)
   plus the heir occupation's polyglot; englishLevel matches; the
   predecessor's tongues do NOT survive.
8. relationships-carried: the heir's bond to another villager is unchanged
   by the death; the heir's person.goal is unchanged.
9. predecessor-stays-dead: no predecessor inventory/equipped item appears
   in scholar.inventory/equipped after the death (death-pack rule: the old
   bearer's gear rides the corpse, it never auto-transfers).
10. new-body rules unchanged (NOT fix targets, barred against regression):
    scholar.statuses/diseases/poisons are empty; scholar.playstyle/practice/
    passives are fresh; scholar.stats are 5 + the heir's occupation bonuses.
    These have no villager-side record to carry from (no npcPractice /
    npcPassives / npcPlaystyle / npcStats maps exist), so resetting them is
    the new-body rule, not a blank.

## Deliberately NOT changed (audit notes, not bars)
- Trust formula (office 40% + own 40% + vouching): by design, the heir's
  own trust entry is consumed into the office number, not kept verbatim.
- scholar.prepStash: the expedition's prepared-food stash; treated as an
  office-level resource like the pantry, not a body possession. Left alone.
- scholar.kcal 1500 / full health / trauma 10: new-body defaults; NPCs track
  hunger as needs, not scholar kcal/HP, so there is no heir record to carry.
- Nomad-road body state (health/kcal/statuses are not reset by nomadKill):
  road system, out of this workstream's scope; noted for the coordinator.
- Field wounds: owned by the sibling tackle-wound workstream; untouched here.

## Audit findings (verified by probe on master, seed 4242, before any fix)
- LANGUAGES BLANK: heir set to spanish-native/english-basic woke up with
  the predecessor's {english:2}. scholar.languages is never set by
  mantleBecome/playerDeath.
- WORN GEAR DROPS: mantleBecome's equipped loop matches pool items by
  (itemId||id), but villager items are usually plain string ids, so NO worn
  slot ever matches — body gear falls into the pack unworn, and only the
  keepsake migration re-wears a reshuffled acc set (heir's worn multitool
  and mother's ring went unworn; an unworn whetstone got worn instead;
  the head slot was lost entirely).
- STASHED ORPHANED: heir person.stashed ([lighter]) survived the death
  untouched on the person record while scholar.inventory never gained it —
  unreachable by any player path afterwards (npcIds excludes the bearer),
  and lost entirely at the next death (death pack reads scholar only).
- CARRIES TODAY (no fix needed): abilities, tracks, deedDay, godhood,
  godpath, plant knowledge into the codex, bonds, personal goal, and the
  predecessor-gear-stays-on-corpse rule all behaved as designed in probe.
