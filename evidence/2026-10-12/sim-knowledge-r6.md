# Long-run sim — LEVER 4: Knowledge & Teaching, r6 (2026-10-12)

Worktree branch: `sim-knowledge-r6` (lever: the village learns animals).
Base: master `eb83384d`.

## The blank

ANIMAL CODEX DEPTH — the thrice-documented untouched blank (r3, r4, r5).
The system exists (`state.codex.animals` L0–L4, the 3/6/10 tasting ladder,
`_noteAnimalDepth`, kill-teaches-L1, bear-rework gates) but sims measured
0 entries in 40 runs. r3 diagnosed "input problem, not threshold problem."

## What the code revealed (verified, not assumed)

The funnel is real but starved at multiple gates. Verified by instrumentation
on current master:

1. **Recipe bootstrap dead**: snare recipe L0 forever → `craft()` refuses
   ("no button at L0") → no traps → the "first witnessed catch grants L1"
   bootstrap can never run (circular). The game's intended bootstrap is the
   field shelf (wild ruins → Trapper's Handbook), but the policy never reads
   books and never scavenges ruins.
2. **Sweep positioning**: the policy's bare `doAction('forage', {})` sweeps
   the 3×3 around the travel arrival point (grass/dirt), not bush/tree cells
   — vine/stick materials almost never drop. A real player taps the bush.
3. **Knife blocker (CRITICAL)**: cleaning carcasses needs a cutting tool.
   The stone knife (universal L3) needs stone from rubble. Rubble exists
   (1–4 tiles/map) but is UNREACHABLE via direct travel on all probed seeds
   (blockages, creeks). The policy's stoneRun expedition walks the frontier
   daily and never finds stone. **The "universal" knife is unreachable in
   sims — a real blank for the food loop or a game bug.**
4. **Villager hunts discard identity**: `villagerHuntResolve` picks a REAL
   species from REAL wildlife, but returns only `{kcal, msg}` — the species
   is lost, the pantry gets anonymous 'Game meat', nobody learns.

## The lever (exact changes)

**`src/js/game.js`** (37 lines, all additive):
- `villagerHuntResolve` returns `aid` (the species).
- Hunt duty: on a successful hunt, `state.village.animals[aid] = {level: 1,
  learnedDay, learnedBy: vid}` — the carcass comes home, the village sees it.
- `firesideTeaching`: if the village knows a species the player doesn't,
  a hunter tells hunting stories (presence-gated, 50%) —
  `grantKnowledge('animal', aid, 1, {type: 'taught', by})`. The 'taught'
  channel for animals.

**Harness** (`scripts/hunt-hook.js`, `scripts/sweep-knowledge-r6.js`):
- `huntRound`: reads found books, scavenges wild ruins (field shelf),
  ensures the knife (rubble expedition), staffs hunters.
- `positionSweep`: centers the forage sweep on bush/tree cells (the game's
  own tap-to-forage affordance).
- `staffHunters`: assigns 1–2 villagers to 'hunt' (the lever's input).

No `[needs-eyes]`: no UI, no combat, no feel changes — one narration line
in the established fireside voice.

## Before/after on identical seeds (20 seeds × 200d, HUNT_HOOK=1 both)

| Measure | Before (no lever) | After (lever) |
|---|---|---|
| **village animals learned** | **0** | **33 species** |
| **villager hunts (with species)** | **0** | **221** |
| **player taught animals (via)** | 0 | **28** |
| **player codex.animals L1 entries** | 15 | **44** |
| player codex.animals (read/kill via) | 7 / 8 | 7 / 9 |
| hunters staffed | 423 | 431 |
| won / tableWaiting | 0 / 0 | 0 / 0 |
| median / max survival | 73d / 109d | 65d / 115d |
| player / villager deaths | 83 / 96 | 88 / 89 |
| maxArc (3) | 20/20 | 20/20 |
| maxWave (1/2/3) | 2 / 9 / 9 | 2 / 11 / 7 |
| scale > village | 0 | 0 |

**Reading:** the village learns and the learning TEACHES — 33 species
village-side, 28 'taught' L1s player-side, codex.animals 15→44. The lever's
direct effects all move the right way; mission deltas are noise (it's a
knowledge lever, not survival). The 3/6/10 tasting ladder still starves —
the knife blocker (above) prevents the player from cleaning/eating meat.

## Reachability verdict

- **Reachable**: the village animal knowledge path (hunt → village.animals
  → fireside taught → player codex.animals L1). 33 species in 20 runs.
- **Still blocked**: the player's 3/6/10 tasting ladder (needs the knife);
  the bear-rework gates (vectorLevel/masterTechnique — need L4 via tastings);
  monster-flesh testing (needs meat).
- **Gated by design**: the 50% fireside roll, presence-gating, the hunter
  occupation preference.

## Village assessment (plain words)

Seed 4 told the story. Aaron the hunter brought down a Black Bear on day 16
— 16,200 kcal to the pantry, the village fed. The carcass came home, and
the village SAW it: black_bear went into the village's animals at L1, learned
by Aaron. That night at the fire, Aaron told the story — how it moves, where
it feeds — and the scholar listened. "Now you know it too." Black Bear L1,
via taught, learnedFrom Aaron. Krzysztof the tracker brought in Gray Rat
Snakes and a Great Horned Owl; Marcus got a Bobcat. By day 40 the village
knew five animals and the scholar knew one of them the village way — not
from a book, not from a kill, but from listening at the fire.

## Sense-testing findings (read, not counted)

- **The hunt beat reads as village news**: "🏹 Aaron brings down a Black
  Bear — clean kill, +16200 kcal to the pantry." A person, a thing they did,
  a consequence. Not a counter.
- **The teaching beat is a person talking**: "🐾 Aaron is telling hunting
  stories by the fire — the Black Bear, how it moves, where it feeds. You
  listen. Now you know it too." The teacher is named, the species is named,
  the learning is explicit. Nothing robotic.
- **Knowledge-gating holds**: the fire only teaches species the player
  doesn't know (encAnimalKnown check); no repeats (grantKnowledge returns
  false on known); away players learn nothing (presence-gated).

## Blanks filled vs documented

- **Filled**: villager-side animal depth — the village learns hunted species
  (33 species), the 'taught' channel for animals (28 player L1s), the
  species identity in villagerHuntResolve (221 hunts).
- **Documented**: the knife/rubble navigation blocker (CRITICAL — the
  "universal" stone knife is unreachable in sims; blocks the player's 3/6/10
  ladder, bear gates, and monster-flesh path); the player's tasting ladder
  still starves (0 tastings in 40 runs); the scale wall (0/20 national).
- **Next blank (named)**: the knife — fix rubble reachability (game or
  policy) so the player's meat funnel can flow to tastings.

## Commits

1. Lever + tooling + proof + evidence: `src/js/game.js` (village.animals,
   fireside teaching, aid return), `docs/KNOWLEDGE.md` (village-learning
   section), `scripts/hunt-hook.js` (hunting bootstrap), 
   `scripts/sweep-knowledge-r6.js` (r6 sweep), 
   `scripts/test-village-animal-depth-20261012.js` (11/11),
   `scripts/sense-probe-r6.js`, this evidence file. No `[needs-eyes]`.

Tests: proof 11/11; regressions knowledge-lever 24/24; ontology 85/85.
Sweeps 20×200d before + after on identical seeds (HUNT_HOOK=1 both).
