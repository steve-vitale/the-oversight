# Journey leg ESTABLISHMENT — r85 pre-registration (2026-11-04)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r83/r84 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks (r84 loop rule);
never tick a dead village to fill the leg.

## Leg question
In the CURRENT build, does armor (bark / hide) actually get made and worn
during the establishment window — and does the village reach day 42 alive
and fed while doing it?

## Why this question is fresh (not a re-proof)
- 2026-10-28 establishment runs found ZERO armor_craft attempts in-window:
  stash bark/vine/hide was 0 at day 43, so the attempt gate never opened.
- Since then the supply/craft chain changed three times: bark flows into
  storage faster, villagers handling hide learn its shape and actually make
  and wear hide armor, and the player's own hide-armor attempt was fixed
  (gap-hidecraft, landed on master: the player tries hide first when it
  would be an upgrade). The gap-hidecraft proof was fixture-level
  (forced gearUp calls), never a full run.
- No full-run check since those fixes has shown armor firing in-window.
  This run is that check. If armor still never fires, the trace (stash
  arrivals vs gate vs policy) names the next fix; if it fires, the Oct 28
  zero is closed with full-run evidence.

## Method
- Driver: `scripts/journey-establishment-r85-20261104.js` — lean clone of
  the r84 driver loop (competent policy, 3 day-parts/day, fights +
  contests driven, sleep) with NO favor wedge, NO door-walk, NO travel-out.
  The only wedges are read-only instruments: Game.craft wrap (armor
  attempts), villagerArmorCraftDay wrap (NPC craft-beat calls), per-dawn
  material trace (stash / player pack / NPC packs), daily alive + pantry
  trace, end census, 2 held end-of-run convos (goon-first, same method
  as r81–r84).
- Seeds (fresh, unused band): 1101, 1102, 1103, 1104. One process per seed.
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Canon: docs/CANON.md + docs/DIRECTIVES.md read before running. No canon
  doc covers armor crafting specifically (ITEMS.md lists items, not the
  craft flow) — the craft flow is taken from landed code + the
  gap-hidecraft note, not invented.
- Evidence: `evidence/2026-11-04/journey-establishment-r85-seed{1101..1104}.json`
  + `-convo-seed{...}.txt`, analyzer
  `scripts/analyze-journey-establishment-r85-20261104.js`.

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)
- M1 ARMOR-ATTEMPTS: armor craft attempts per seed = player Game.craft
  calls for bark_armor/hide_armor + villagerArmorCraftDay calls that record
  an attempt. GO: >= 1 attempt on >= 3/4 seeds.
- M2 ARMOR-WORN-END: people wearing bark_armor or hide_armor at end of run
  (census equipped). GO: >= 1 wearer on >= 2/4 seeds.
- M3 SURVIVAL-42: village not over AND >= 1 villager alive at day 42
  (daily trace). GO: >= 3/4 seeds.
- M4 PANTRY-GUARDRAIL: no death with cause matching starvat|hunger|thirst
  before end of run. GO: >= 3/4 seeds with zero such deaths.
- M5 PEOPLE: 2 held convos per seed, read IN FULL, judged on meaning /
  coherence / consequence (SENSE-TESTING LAW) — verdict per convo in the
  run note, not exchange counts. No numeric threshold; a nonsense convo
  is a blank to fill or document.
- M6 FIRST-CONTESTS (descriptive, no threshold): contests faced in-window
  per seed from telemetry + whether they were played (damage rows), as
  context for the wave-1 experience in this leg.

## What counts as an interesting finding
- M1 GO: armor fires in full runs for the first time since the Oct 28
  zero — closes that blank; report worn counts + who wears what.
- M1 NO-GO: armor still never fires in full runs despite the fixes —
  the per-dawn trace says whether materials never arrived (supply),
  arrived but unattempted (gate/policy), or attempted but failed (rolls).
  That traced cause IS the finding and names the next fix.
- Either way: no re-scoring against a friendlier metric mid-run. If a
  metric proves wrong, it goes under "metric review" for the NEXT run.

## Out of scope
- No armor-on vs armor-off panel this run (that comparison needs a
  villager-armor toggle that does not exist; the player-only toggle
  would measure half the system). This run establishes the in-window
  baseline the panel would compare against.
- No game-code change unless the run finds a concrete, fixable blank;
  any fix gets its own proof test and a re-run of affected seeds.
