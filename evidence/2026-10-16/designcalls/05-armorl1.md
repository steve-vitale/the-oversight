# Design call #5 — ARMOR L1 CHANNEL: hide→armor knowledge path
Date: 2026-10-16 | Worker: muse-designcalls (worktree dc5-armorl1)

## The call
"Handling monster hide should teach the first honest knowledge rung toward
armor crafting. `noteHideHandled` already exists — first VERIFY whether it
fully closes the hide→armor L1 knowledge path or if there's a gap; only add
what's missing."

Human-skill lane: hide-handling / armor knowledge is teachable earthly
knowledge (Steve 2026-10-11, docs/CANON.md). No System ability, no slot.

## Trace

### What noteHideHandled grants (src/js/corpses.js:495-505)
- `grantKnowledge('recipe', 'hide_armor', 1, { type: 'witnessed' })` → the
  player's codex: `state.codex.recipes.hide_armor = { level: 1, via: 'witnessed' }`
  (lands via `_grantRecipe`, src/js/game.js:17516 — records L1 + recipe
  knowledgeLevels[1] text + knowledgeReveal audio event).
- Fires-once: early-returns if hide_armor level ≥ 1.
- Narrow predicate: fires ONLY when `it.plantId === 'animal_hide'`.

### Call sites (all wired, all player loot actions)
1. src/js/corpses.js:485 — `_corpseTakeStack` (per-item take, `corpseTakeItem`).
2. src/js/corpses.js:673 — batch takeOne loop (batch loot).
Both pass the looted item to `noteHideHandled`.

### What armor crafting requires (src/js/game.js craft(), ~3331-3376)
- L0: blocked — "You don't know how to make a Hide armor yet."
- L1: blind attempt, 35% success, materials at risk; success teaches L2
  ("PRACTICE", game.js:3412).
- L2+: 85%. Materials: 2 hide + 1 vine (src/data/recipes.json:618-636),
  matched by `item.material === 'hide'`.

### Hide sources — how a hide actually gets into the player's hands
| Path | Item shape | noteHideHandled fires? |
|------|-----------|------------------------|
| Animal corpse loot (corpses.js:328-331) | `{ plantId:'animal_hide', material:'hide' }` | YES (both call sites) |
| Butchering a carcass (`carcassToMeat`, food.js:~591-606) | `{ material:'hide', name:'Hides' }` — **no plantId** | NO — never called; predicate would reject it anyway |
| Taking rawhide from the village stash (`takeMaterial`, storage.js:386) | `material:'hide'` via MAT_DEFS (storage.js:93-94) | NO |

### The gap
`carcassToMeat` is the PRIMARY hide path: every animal's butcher def yields
hides (deer 2, beaver 2, rabbit/squirrel/fox/opossum/raccoon 1, boar 1,
javelina 1 — src/data/animals.json). Corpse-loot hides are the exception
(found bodies), butchering is the rule (kills → carcass → clean → hide).
A player can butcher a dozen deer, sit on a stack of hides, and never receive
the L1 rung — the exact circular dependency `noteHideHandled` was built to
break (2026-10-13) is still broken on the butchering path. The takeMaterial
path is a secondary honest-handling gap (stash rawhide into your hands).

## Verdict: GAP — fixed, not verified-closed

### What changed (3 minimal wirings to the one existing beat)
1. **src/js/corpses.js** (`noteHideHandled`): predicate widened to
   `it.plantId === 'animal_hide' || it.material === 'hide'` — `material:'hide'`
   is the canonical hide identifier (MAT_DEFS, storage.js:93-94). Still
   fires-once, still L0-only, same grant, same narration.
2. **src/js/food.js** (`carcassToMeat`): the butchered hide yield now calls
   `this.noteHideHandled(hideItem)`. Both callers are player-performed
   (`cleanCarcass` from pack or stash UI; `dress_game` ability) — the player's
   hands do the work, so the beat is honest.
3. **src/js/storage.js** (`takeMaterial`): taking `'hide'` from the stash
   calls `this.noteHideHandled({ material: 'hide' })` — taking rawhide into
   your hands is handling the material (covers old saves / any future
   villager-deposit path).

No player-facing behavior change beyond the intended one beat: the first time
you handle a hide you get the honest L1 + the existing narration
("Your hands don't know it yet. Your eyes do."). L1 → blind 35% craft →
success teaches L2. The rest of the ladder is unchanged.

### Proof
- scripts/test-armorl1-20261016.js (RED→GREEN): seeds RNG, loads via
  scripts/sim-harness.js, butchers a deer carcass → asserts L1 granted with
  via:'witnessed'; takes stash hide → asserts idempotent; asserts craft gate
  opens (past the "don't know how" block, into honest blind attempt);
  asserts the pre-existing corpse-loot path still fires. RED on pre-fix code
  (L1 never lands via butchering), GREEN after the fix.
- `node scripts/check-wired.js` on changed files: no unwired additions
  (noteHideHandled was already called from game code; the new sites are
  call-sites into the same wired function).
- `node scripts/check.js --quick`: green.

### Metric review
This was a verification task with a repair. The metric was binary (path
closed vs gap) — the trace found a genuine gap on the primary hide path, so
a code change was warranted under the "only add what's missing" rule. No
mid-run rescoring.
