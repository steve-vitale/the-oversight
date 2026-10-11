# Spawn Knack — Steve 2026-10-11

**Directive:** "the player gets a mysterious first ability during the spawn
sequence — pre-System, no System overlay, framed as 'you feel capable of
something you can't quite explain — choose an ability'."

**What was built:** the level-up mechanic's first rung. A latent knack —
not a System ability (the System hasn't arrived), not a teachable earthly
skill (nobody can teach it; it's unexplained). Backstory-rooted via the
lifeseed's skill origins ("the trick you learned long ago"). Fills slot 1.
The day-7 System arrival notices the anomaly ("you had that BEFORE we got
here") in one beat, System voice, no explanation offered.

## Files
- `src/data/abilities.json` — 9 knacks, `pool: 'latent_knack'`,
  `unlock.type: 'latent_knack'` (pure addition, 192+/0-)
- `src/data/schemas.json` — 'latent_knack' added to pool + unlock.type enums
- `src/js/spawn-knack.js` — NEW module (wraps newGame, systemArrivalBeats,
  npcGossipAbout, integrate; zero game.js edits)
- `src/js/app.js` — `knackSheet()` (quiet framing); `processPendingSheets`
  gates the day-7 gift on a free slot (honest wait, never eaten)
- `index.html` — script tag after lifeseed.js
- `scripts/test-spawn-knack.js` — proof, 32/32 ×3 seeds

## The 9 knacks
| Knack | Does | Lifeseed roots |
|---|---|---|
| Storm-ear | rain catch ×1.5 | forecast |
| Bloodhound | hunt find ×1.3 | tracking |
| The Touch | healing ×1.3 | medicinal |
| Green Whisper | forage gift ×1.4 | food |
| Still Hands | craft success ×1.3 | mending, sewing |
| Pathfinder | travel cost ×0.85 | navigation |
| Beast-calm | monster detect ×0.75 | husbandry |
| Iron Gut | food poison ×0.6 | butchery, canning |
| Night Eyes | stealth silent ×1.3 | trapping, fishing |

All modifiers are real pipeline targets (verified via `allModifiers()`),
scale with level, and deepen through the existing abilityXP (10/25 uses).

## Slot math (the honest part)
- Knack fills slot 1 at spawn. Day-7 gift needs slot 2 (integration 20).
- If the player tries to take the gift with no free slot, `chooseAbility`
  refuses honestly ("No free ability slots") and the offer stays PENDING —
  never cleared, never eaten.
- `processPendingSheets` doesn't queue the modal gift sheet while slots are
  full; instead the System says its piece once ("We'll hold it") and the
  `integrate()` wrapper announces when the slot opens.

## Transcript 1 (sense-read)
**Saul Zhong, mushroom grower** — lifeseed: tracking, canning.

> 💭 Something you never told anyone
>
> The fire crackles. Twelve strangers breathe in the dark around you.
>
> And under all of it — under the fear, under the wrong-colored sky —
> something in you is awake. It's always been there. A knack. A trick you
> learned long ago that you never could explain, so you never mentioned it.
>
> The world ended. It didn't take this. If anything, it's louder now.
>
> Which one is it?
>
> **Iron Gut** — You've eaten things that should have killed you. They
> didn't. Your stomach is a matter of local legend.
> *Amanda dared you to eat the thing. You did. Then you ate more. The story
> got bigger every year. The stomach stayed the same.*
>
> **Bloodhound** — You can smell water. And fear. You've never told anyone —
> people look at you funny when you find things by smell.
> *You found Amanda's lost tools by smell alone, near the treehouse out past
> Dodge City. Nobody could explain it. You stopped trying to.*
>
> **Pathfinder** (wild) — You've never been lost. Not once. Even in places
> you've never been, your feet know the way.
> *You walked Amanda home through the treehouse out past Dodge City in the
> dark — no map, no light. 'How did you know the way?' You didn't. Your
> feet did.*

After choosing: "💭 Iron Gut. It was always there. Now you've named it, and
naming it makes it yours on purpose. (Your first ability — it deepens with use.)"

Sense notes: choices 1–2 map to the lifeseed (canning→Iron Gut,
tracking→Bloodhound); the wild third is a real alternative. Memories name
a real kin (Amanda) and a real place. No System chrome anywhere — no 🎁,
no "PICK A TRICK", no System voice. Reads quiet, personal, earned.

## Transcript 2 (sense-read)
**Maeve Sullivan, journalist** — lifeseed: canning, trapping.

Choices: Iron Gut ("Kenneth dared you..."), Night Eyes ("You'd sit up at
the farmhouse upstate watching the dark..."), Storm-ear (wild, "Kenneth
used to laugh when you'd call rain under a clear sky..."). Same shape —
two rooted, one wild. The memories vary by seed, not template.

## Day-7 anomaly beat (sense-read)
Fires once, only when the player holds a latent knack, spliced after the
'food' beat:

> [sys] WAIT. Hold on. [shuffling noises] There's a reading on YOU. A little
> glow, person-shaped, doing... whatever it is you DO.
>
> [sys] We didn't put that there! We'd REMEMBER! We remember EVERYTHING!
> (We remember the pellet. We remember the burying. We remember.)
>
> [sys] You had that BEFORE we got here. That's BACKWARDS! First we arrive,
> THEN the glowing! That's the ORDER!
>
> [narr] It goes quiet for a moment. When it comes back, it's brighter. Too bright.
>
> [sys] ...Probably a rounding error! Filed! Moving on! 🎉

Sense notes: System voice is right (bright, procedural, wrong). It notices,
it doesn't explain. The pellet callback lands. The narr beat ("brighter.
Too bright.") gives it a chill without explaining anything.

## Villagers
Every roster villager gets 1 lifeseed-tied knack at spawn (`npcKnacks`).
Gossip-visible via `npcGossipAbout` fallback — e.g. "swear Mara can smell
rain coming. Never wrong about it, either." Never UI. Knack modifiers are
player-pipeline only (documented, not wired to villager sims).

## Proof
`scripts/test-spawn-knack.js`: **32/32 ×3 seeds** (20261011, 42, 777, 12345).
RED-first verified (EXCLUDE_KNACK=1 fails as expected). Covers: 3 lifeseed-
tied choices, slot-1 fill with no System chrome, day-7 offer fires/waits/
fills slot 2 honestly, villager knacks, anomaly beat once (and absent
without a knack), pool purity (no system_offer/vile/body_horror), ontology
green.

## Open / not built
- Villager knack modifiers don't feed villager sims (player pipeline only).
- Knacks have no synergies yet (no knack legs defined).
- The knack sheet is modal — the first rung must be named. If Steve wants
  it skippable, that's a one-line change (dismissible: true) plus a
  "your knack waits" reminder.
