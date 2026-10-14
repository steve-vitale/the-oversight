# Skill teaching and player track skills (parity)

Steve (2026-10-14, verbatim): "Villagers and players should get the same XP,
when in doubt we treat them the same way." and "Human skills should be
learnable before the system shows up."

This closes the two gaps in `skills-pre-system.md`.

## 1. One teaching mechanic (`src/js/skill-teaching.js`)

Anyone who knows a skill can teach it to anyone who doesn't: villager to
player, player to villager, villager to villager. All three go through
`teachSkill(teacher, learner, skillId)`.

- **The learner gets L1.** Use levels the skill as before (`gainSkillLaneXP`).
- **Cost.** One lesson per learner per day. For the player, a lesson also
  takes one conversation and 3 action ticks, the same cost as `teachPlant`.
  A villager pair spends that day's lesson.
- **Gates.** These are the same whichever way the lesson runs. The villager
  in the pair needs trust 15 or more (the snare lesson's regard gate), and
  the two need a shared language. There is no System gate.
- **Deed.** The teacher earns the `teaching` deed, with the same n and the
  same daily cap for everyone.
- **Data.** Every knowledge skill is teachable unless it is flagged
  `teachable: false`. Two skills are flagged: `system_theology` and
  `system_architecture`, which are knowledge about the System, not human
  skills.
- **Villagers know their old life.** The player starts with
  `grantOccupationSkills` and `grantBackgroundKnowledge`. A villager now
  gets the same two data routes as villager skills (`npcSeedSkills`), so
  they have something to teach.
- **Player UI.** The villager conversation can offer at most two lines:
  `"Teach me Hogtie?"` (they know a skill you lack) and
  `"I could show you Shield Wall."` (you know a skill they lack; it offers
  the one that fits their build best). These are earned verbs: off-thread,
  hidden while a question is pending, and each fits on one line. After one
  lesson in a conversation, neither line is offered again in it.
- **Villager agency.** `villagerSkillLessonsDay` runs from
  `villagerBuildDay`. Each villager at home finds the best-fitting skill a
  housemate can teach them. `skillFit` adds:
  - +1 if the skill's track is the one their target build needs
  - +1 if it is their strongest track
  - +1 for each build-around path shared with their build, up to +2
  - +2 for each synergy leg it fills

  A villager whose best fit is at least 1 takes a lesson on 15% of days.
  That roll is a fixed hash of the villager and the day. It takes no number
  from the shared seeded random stream, so every other roll in a seeded run
  lands where it did before. I made this change after a first version, which
  used `Math.random`, shifted the stream. That shift broke
  `test-food-granularity` and `test-wincensus`.

## 2. Player track skills (`tracks.js`, 2 lines)

The player now learns the next unknown track skill at `skillLevels` [2, 4],
the same rule villagers follow (`playerTrackSkills`, with a `rec.skilled`
catch-up for old saves). Two lines show it:
- at the level: `📈 Field 2: the work taught you Field Dressing.`
- when the System's sheet opens: `◈ LEVEL UP — FIELD 2. (The work taught you Field Dressing.) …`

## 3. Honest `unlock` data

No skill-lane ability claims `system_offer` or `latent_knack` any more. All
25 such entries now read `{type: "learned", routes: [...]}`. The routes are
computed from the data that actually teaches the skill:
- background: occupation `granted` or knowledge `backgrounds`
- track: the tracks.json `skills` lists
- practice and trial: the deed modules
- book: books.json
- bond: the shieldbearer path in party-bond.js
- teach: listed only when a root route exists

For the 11 orphans that had no root, new knowledge `backgrounds` give them
one:

| Skill | Backgrounds |
|---|---|
| thief | locksmith, street artist |
| grave_robber | mortician |
| scarecrow | hunting guide |
| tripwire | exterminator, soldier |
| shoulder_check | rancher |
| hogtie | rancher, police officer |
| come_get_some | bartender, hunting guide |
| draw_fire | firefighter |
| bodyguard | police officer |
| shield_wall | soldier |
| rally | firefighter |

still_hands is carried by steady_hands, which already had background and
track routes.

## Proof

`scripts/test-skill-teaching-20261014.js` is on the green list (quick).
- RED on master: 2 passed, 19 failed.
- GREEN: 39 passed, 0 failed.

It covers:
- a villager teaching the player through the real conversation menu,
  pre-System
- the player teaching a villager
- the gates
- villager background skills
- villager-to-villager lessons over 12 pre-System days (about 16 lessons)
- the player's field level 2 teaching Field Dressing, with both lines
- each of the 12 orphans: a working root route, with the data matching what
  works

## Balance notes

- **Villager lessons.** With no bot, endDay only, about 15 lessons in 42
  days per run (seeds 7 and 42, each run ended by village loss at day 42).
  Each villager gains about one skill per one to three weeks, and only skills
  that fit them.
- **Villager buff.** Seeding villagers with their occupation skills is a
  buff: it changes `npcHasAbility` for their trade's skill-lane abilities.
- **Player starts.** Players from these jobs start with one or two more
  combat skills:
  - soldier, police officer, firefighter and rancher
  - mortician, locksmith, bartender, hunting guide and exterminator

  A core match gives L2, as background knowledge always has.
- **Not measured.** I have not run the multi-seed sweep for this change.
