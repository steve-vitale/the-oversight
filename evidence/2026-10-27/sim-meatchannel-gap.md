# Monster-meat channel gap (Triage A3) — evidence, 2026-10-27

Plain words: hauled monster meat used to arrive at the village, get tasted
by a villager, and then sit there — never cooked, and poison meat never
rotting away. This note covers the fix and the measurements behind it.

## Pre-registration (written BEFORE the fix panel ran; a miss is NO-GO, never re-scored)

- Ruling: Steve 2026-10-27 — villagers should test and cook monster meat.
  The haul → reveal → test → cook channel is to be made working.
- Baseline (still open, verified fresh on current code before any fix):
  r48 establishment panel re-run, LIGHT, seed 209, 42 days — byte-identical
  meat outcome to the original r48 analyzer: player testMonsterMeat calls 0,
  cooked monster-meat stacks 0, poison belltoad flesh still sitting in the
  pantry at 0 kcal at the end. No meat-channel code change landed between
  r48 (1bd0acb15) and this work (git log on food.js / game.js /
  villager-mapmem.js / villager-objectives.js / competent.js / meatseek.js
  since r48 is empty).
- Mechanism measured first (probe scripts/test-meatchannel-measure-20261027.js):
  the test verb itself works on pack AND pantry containers; the cook verb
  works on pantry containers; the village meal's cook flag consumes meat
  without ever leaving a cooked stack; hauled flesh carries no spoil day, so
  poison flesh never rots; the away-from-home test gate blocks villager
  tests while the player is away, but dropping it would produce neither
  player-test calls nor cooked stacks, and would break the presence-gated
  story rule — measured and NOT adopted.
- Panels: seeds 209, 228, 238, 239 (the r48 seeds), 42 days, LIGHT.
  Two panels on identical seeds: competent (control — game-side effects
  only) and meatseek (test-drive panel — player test + pack cook driven).
- Primary bar P1 (meatseek panel): player testMonsterMeat calls > 0
  panel-wide (was 0) AND cooked monster-meat stack-rows > 0 panel-wide
  (was 0).
- Clutter bar P2 (both panels): at panel end, no 0-kcal monster-meat stack
  that first appeared more than 2 days before the end is still sitting
  (poison/untested flesh must rot once its clock runs out).
- Pool bar P3 (proof test): every monster-meat quirk definition stays in
  the alien pool, and the village-cook flip adds no mundane disease
  attribution (diseaseRisk cleared, parasiteRisk deleted, no alien id
  passed to mundane medicine).
- Regression bar P4: (a) proof test — normal (non-monster) cleaned meat
  drawn with the village-cook flag keeps foodState 'cleaned' and its
  spoilDay unchanged; (b) competent panel seed 209 completes with deaths
  within ±2 of the verification run (7) and living villagers within ±2
  of it (10). A bigger shift is investigated, not waived.
- GO rule: P1 + P2 + P3 + P4 all pass → GO. Any miss → NO-GO, work stops,
  no re-scoring.

## What was built

Four small changes, no system rebuild, no pantry-ledger broadening:

1. Hauled flesh gets a clock (src/js/villager-mapmem.js): the haul deposit
   now stamps spoilDay = haul day + 2, the cleaned-meat shelf from
   docs/PRESERVATION.md. Before, it carried no clock at all.
2. Reveal sets a clock when one is missing (src/js/game.js,
   markMonsterFoodSafe): flesh revealed without a spoilDay gets day + 2
   from the reveal day; an existing clock is never shortened or extended.
3. Village meals leave cooked monster meat behind (src/js/game.js,
   pantryDraw): when a village-cooked meal (cook:true) draws cleaned
   monster-gated meat, the portions it does not eat stay cooked —
   foodState 'cooked', spoilDay day + 5, raw risk cleared, parasites
   dead, mirroring cookFood's cooked-through claim. Monster-gated meat
   only; normal meat, the pack, and every cook:false draw are untouched.
4. Test drive reaches the pantry and cooks (scripts/policies/meatseek.js,
   NOT competent.js — that file's own rule): the test drive now also scans
   the village pantry, but only while the player is at haven (the pile is
   at the fire; away from home it is out of reach, and packing unknowns
   stays gated). A new cook drive cooks revealed cleaned monster meat in
   the pack or on the counter at a fire (revealed meat only, spoiled
   skipped, 6-stack cap). The away-from-home villager-test gate was
   measured and deliberately NOT changed: dropping it would produce
   neither player-test calls nor cooked stacks, and would break the
   presence-gated story rule.

Proof (identical seeds, before/after): scripts/test-meatchannel-gap-20261027.js
— 8/16 before the fix, 16/16 after. The diagnostic probe that chose the
fix is scripts/test-meatchannel-measure-20261027.js.

## Results

- Proof, identical seeds (scripts/test-meatchannel-gap-20261027.js):
  8/16 before the fix → 16/16 after. The failing eight before were the
  haul clock, the reveal clock, the cooked leftovers (state, clock,
  risks), the pantry test-drive scan, the pantry test-drive call, and
  the test-drive cook — all green after.
- Competent panel (control, seeds 209/228/238/239, 42 days, LIGHT):
  player tests 0 (expected — the baseline policy never calls the verb),
  cooked monster-meat rows 2 (seed 238, village-cook leftovers),
  stale 0-kcal end stacks 0. Seed 209 guardrails match the pre-fix
  verification run exactly (deaths 7, living 10), and its poison belltoad
  stacks — which sat in the pantry at the end before — are gone (rotted
  on their new clock).
- Meatseek panel (test-drive, same seeds/days): player tests 10
  (seed 209: 4, 238: 4, 239: 2; seed 228: 0, the villager beat had already
  tested its flesh), cooked monster-meat rows 2, stale 0-kcal end stacks
  0. Seed 238 ends with a real cooked stack on the counter: glasswing,
  44 kcal, cooked, spoil day 46. Seed 239 ended early (day 35) and still
  counted; its tests fired before the end.
- Verdict: P1 GO (meatseek), P2 GO (both panels), P3 GO (proof F6),
  P4 GO (proof F4 + competent seed 209 exact match). Overall GO.
- Targeted existing suites, all green: knowledge-lever 24/24,
  blitz-eatlast, crisis-r55 crumb-break ALL GREEN, forager-meal 14/14,
  break-food 20261010c/d/e and 20261011. Two notes, both honest:
  (a) test-break-food-engines fails at world setup with `Text is not
  defined` — a pre-existing gap in that old harness (it does not load
  the text helper; the failure is in character generation, code this
  work never touched, and the test carries no quick tag, so the quick
  gate would not run it). Reported, not fixed — out of this item's
  scope. (b) The full check.js --quick gate was started and stopped
  after 43 minutes without a verdict: 287 quick jobs under five-way
  sibling-suite contention on one box. The targeted suites above are
  the ones that actually cover the changed lines.
- Post-fix codex species drift slightly from r48 (seed 209: nevermore
  where r48 had mirrormoth; seed 238: nightcourt where r48 had
  anaconda_empress). That is the expected downstream effect of flesh
  now rotting and being eaten on different days, not a defect: seed
  209's guardrails match exactly.

## Metric review

- Player-test attribution gap (for the NEXT run, not this one): the
  player's own test move does not record foodTestedBy in the codex
  (the villagers' beat does), so player-tested species show a blank
  tester in codex snapshots. Calls were counted directly, so no bar
  depended on it — but a follow-up could set the tester to the player
  for symmetry.
- Cooked rows need a partial draw: a stack eaten whole leaves no cooked
  leftover behind. Seed 238 produced the competent panel's cooked rows
  for exactly that reason; fully-eaten stacks are not a miss.
- The away-from-home villager-test gate stays as designed. A future
  worker could revisit deferred narration (test while away, tell the
  story on return), but that is a design change, not a fix, and it was
  not needed to pass any bar here.
