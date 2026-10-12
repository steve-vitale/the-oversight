# Knowledge

Registered 2026-10-11 (longsim knowledge lever): the knowledge & teaching
system had no canon doc — only scattered code. This registers the map, the
laws, and the channels as they exist in code. Read before touching anything
that teaches, identifies, or gates on knowledge.

## Steve's laws

- **Experiment before identification** (standing): foraged things are
  experimentable for calorie and sickness knowledge BEFORE full
  identification. Player paths: `testCautiously` / `testMonsterMeat`
  (food.js) — inspect → skin → lips → taste → wait, honest risk, real cost.
  Village path (2026-10-11): `villagerExperimentBeat` (game.js) — once per
  day a villager runs the protocol on an unknown lump/meat at the fire;
  verdicts land in `sharedKnowledge` and travel with later identifications.
- **"If you don't know, it doesn't show"**: knowledge gates every surface —
  names, kcal, prep text, uses, monster meat edibility (`monsterFoodSafe`),
  pantry counts (`pantryItemKnown`). A level-0 tasting entry is bookkeeping,
  not knowledge — the Codex never lists it (`codexEntries` K0 honesty).
- **Human skills ≠ alien abilities** (2026-10-11): human skills are teachable
  earthly knowledge (occupations grant them, practice/discovery earn them,
  never take System slots). Alien abilities come ONLY from the System into
  the 6 slots. Never confuse the lanes.
- **Names are earned**: `identifyPlant` is the one path for plant naming;
  monsters are named by village agreement (`villageName`) or System arrival —
  never by true name on first encounter.
- **Wrongness is real**: lessons can be false (`wrongAs`, deliberate or
  honest); handling/tasting/trading truth yourself clears it. The codex is
  honest about disagreement.

## The stores

| Store | Holds | Leveled? |
|-------|-------|----------|
| `state.codex.plants[pid]` | player plant knowledge | L0–L4 + `prepKnown` + `tested` verdict |
| `state.codex.animals[aid]` | player animal knowledge | L0–L4 (tasting track) |
| `state.codex.monsters[mid]` | monster entry | stages observed/slain, `villageName`, `foodSafe` |
| `state.codex.skills[sid]` | human skills (knowledge.json) | L1–L3, `via` |
| `state.codex.trees / .recipes / .techniques` | trees, recipes, techniques | trees leveled; recipes/techniques binary |
| `village.taught[vid]` | in-run villager plant knowledge | binary (identity only) |
| `village.familiar[vid]` / `village.plantKnowledge[vid]` | background familiarity / occupation background | binary |
| `plantKnownBy/plantsKnownBy` | THE villager check | union of all three stores |
| `village.sharedKnowledge[pid]` | village-level record | level + `tested` verdict + `testedBy` |

Villagers know plants **binary** (name or not) — depth lives with the player
and with knowledge traders. `v.taught[]` is what `villageEats` reads.

## Depth ladders (player)

- **Plants**: L1 name (identify) → L2 parts/prep (5 harvests) → L3 uses
  (3 tastings at L2) → L4 mastery (15 harvests at L3). L2 unlocks the primary
  use; L3 all uses. `prepKnown` is a separate track — you can know HOW to
  prepare something without knowing WHAT it is (first bite teaches it).
- **Animals**: L2/L3/L4 at 3/6/10 tastings of known meat.
- **Combination**: `combineKnowledge` — if others know deeper, overlap unlocks
  the next level at a toll scaling with the depth differential: 3 personal
  harvests when they're one level deeper, 2 when two deeper, 1 when three
  deeper (never 0 — your hands must have held it at least once; longsim
  knowledge r3 2026-10-11). Traders teach at L2/L3.

## Teaching channels (all observed live in sims)

Player learns via: `fireside` (0.6 roll, presence-gated), `taught`
(villager/teacher quality, trust, language-gated), `sample` (villagers bring
samples), `shared` (village shared knowledge), `gratitude`, `fieldwork`
(3+ examinations), `traded` (knowledge traders, L2/L3), `tested` (cautious
protocol), books, background, strangers, agency teachables (expedition
ask-path, declining). Villagers learn via: fireside, `word of mouth`
(`spreadPlantKnowledge`, brisk 2 chances/part), `observed`, `foraging`,
`working` (day labor, caps at 12), `mentored` (party), player-taught
(conversation + `teachPlant`).

## Word-of-mouth rules

Slow by design (Steve 2026-10-05): at most one witness learns on the spot;
the rest learn over days via rumor. Presence-gated: the away player neither
teaches the fire nor learns from it — knowledge travels home in their head
(`awayLearned`, brokered at `returnToVillage`). An exposed liar's word
carries no weight (`distrusted` excluded from teaching).

## Files

- `src/js/game.js` — `identifyPlant`, `plantKnown/plantLevel/plantUses`,
  `teachPlant`, `learnSkill`, `grantKnowledge`, `firesideTeaching`,
  `spreadPlantKnowledge`, `combineKnowledge`, `villagerExperimentBeat`,
  monster naming (`monsterDisplayName`, `villageName`)
- `src/js/food.js` — `testCautiously`, `testMonsterMeat`, `sortBag` (camp
  ritual: the sorter names what THEY know; you learn by watching)
- `src/js/journal.js` — pre-codex journal framing
- `src/data/knowledge.json` — human skill definitions (levels 1–3)
- `src/js/conversation.js` — player↔villager teaching in dialogue
