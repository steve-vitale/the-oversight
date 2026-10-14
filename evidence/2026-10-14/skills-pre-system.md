# Skills before the System: audit

Steve (2026-10-14, verbatim): "Human skills should be learnable before the
system shows up. Do a quick audit for exceptions."

Scope: every path that teaches, grants or levels a codex skill (`learnSkill`,
`teachAbilitySkill`, `gainSkillLaneXP`, `npcLearnSkill`, `npcGrantAbility` on
a skill-lane id), checked for a direct or indirect `systemArrived` gate
(the gate in the function itself, in its callers, or in the UI).

Proof: `scripts/test-skills-pre-system-20261014.js` (green list, quick). It
runs on day 1 with `systemArrived = false`. Before the fix: 18 passed, 3
failed (the shieldbearer path). After the fix: 21 passed.

## Audit table

| Path | Was gated? | Fixed / left gated because |
|---|---|---|
| Shieldbearer path, villagers (`party-bond.js noteShieldbearerOffer`: draw_fire, bodyguard, shield_wall, rally, all skill-lane) | **Yes**: early `return` before arrival, plus the 6-slot check | **Fixed.** Skill-lane entries are learned from day 1 and take no slot. A magic entry, if one is ever added to the path, still waits for the System and a slot. `test-village-bond-path-20261012.js` updated in the same commit (its "no offers before day 7" assertion encoded the old design) |
| Practice deeds, skill-lane (stalk, blood_trail, ambush, haymaker) `practice-deeds.js` | No | Open. Only war_cry (magic) credits a track |
| soft_step (20 quiet tiles) | No | Open. `isSkillLane` bypass already in `noteSoftStepTile` |
| Trial deeds, skill-lane (intimidating_presence, gossip_network, peacemaker, eagle_eye, evidence_board) `trial-deeds.js` | No | Open. Callers (intimidate, mediateConflict, markSeen, spreadGossip, truth.js, tbEnd) have no gate |
| Occupation `granted` + background knowledge (`grantOccupationSkills`, `grantBackgroundKnowledge`), newGame and succession | No | Open (day 1) |
| Books (`readBook` → `jackpotBook`) | No | Open |
| Roadside stranger (`maybeJackpotStranger`) | No System gate | Open, but **day ≥ 5 and 5%/day**, so in practice it rarely fires before day 7. Not a System gate; left as is |
| Insight jackpot (knowledge combines) | No | Open |
| Theorizing (`theorizeWith`) | Only the `system` topic | Open. Monsters/situation topics teach animal_behavior, track_read, tactics_small, read_people, morale_keep pre-System; the System topic is genuinely about the System |
| Examining cells (`carexplore.js` feedKnowledge) | No | Open |
| Nonverbal read → read_people | No | Open |
| Night hunting practice | No | Open |
| Skill-lane use XP (`gainAbilityXP` → `gainSkillLaneXP`) | No | Open. `useAbility` has no arrival gate |
| Keepsake L1 flashback skill reveal (`keepsakeLevelBeat` → `playFlashback`) | No | Open. Only the L3 relic offer (`keepsakeMaybeOffer`) is System-gated, and that one is a System event |
| Villager track skills (`tracks.js _villagerTrackXP`, levels 2/4 per `skillLevels`) | No | Open. Skills are learned before the `systemArrived` return; only the magic sheet waits |
| Villager level-up sheets (`villagerResolveLevelUps`) | Yes | **Left gated.** A System event, and magic only (`levelUpOffers` drops skill-lane) |
| Villager seek-knowledge / learn-from-talk (`villagerSeekKnowledge`, `npcLearnFromTalk`) | Yes | **Left gated.** These raise *knowledge about* abilities (npcKnow levels) for choosing System sheets. They teach no skill |
| Player track level-ups (`pumpLevelUps`) | Yes | **Left gated.** A System event, magic only. XP still accrues and queues pre-System |
| Audience trial lesson (`completeTrial`) | Yes | **Left gated.** A System event. Its lesson can be any skill; see the gap below for skills with no other deterministic route |
| Aid quest skill reward (`_completeAidQuest`: scrounger, tracker, swimmer, triage, field_medicine) | Yes (`offerAidQuest`) | **Left gated.** The System notices. All five also come from occupations |
| System ability sheet (`chooseAbility` → `teachAbilitySkill`) | Yes | **Left gated.** A System event (and the offer pools already exclude skill-lane) |
| Spawn knack | No (pre-System by design) | Magic only. still_hands and storm_ear moved to skills and are dropped from the knack pool |
| Skills panel (`app.js renderSkillsSection`, inside the 🧬 You sheet) | No | Visible pre-System. Its label read "(Codex)" before the Codex exists, so it now reads "(Journal)" until arrival |

## Gaps that are not System gates (need Steve's call)

1. **12 skill-lane abilities have no deterministic player route at any time.**
   thief, grave_robber, scarecrow, draw_fire, bodyguard, shield_wall, rally,
   tripwire, shoulder_check, hogtie, come_get_some, still_hands. Their data
   says `unlock.type: system_offer` (or latent_knack), but every System offer
   pool filters out `lane: 'skill'`. So the player can learn them only from
   the random roadside stranger (day ≥ 5, 5% a day) or from an audience
   trial lesson (after the System arrives). The cheapest human route would be
   a villager teaching the player a skill the villager knows: villagers now
   learn the shieldbearer four pre-System. No such player-from-villager skill
   teach exists today; `conversation.js` `teach` covers plants only. I did
   not add it because it is a new mechanic.
2. **Parity:** villagers learn track skills at track levels 2 and 4. The
   player's track level-ups give magic only and never teach a track skill.
   Not a System gate.

## Checks

- `node scripts/check.js --quick`: 73 passed, 2 failed. Both are the known
  reds, godpath/validate.js and godpath/ladder.js.
- `--only skill` 2/2, `--only knack` 1/1, `--only party-bond` 1/1,
  `--only bond-path` 1/1. `test-unified-tracks-20261014.js` 82/0.
