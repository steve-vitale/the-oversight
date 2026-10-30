# sim-hatchequip-b — PREREG (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-hatchequip-b, axis food-economy
(daytime-wood). Worktree sim-hatchequip-b. DIAG ONLY: zero src/js changes,
zero policy-default flips, zero game-code arms. Recorder wrappers log only;
they call the original function with the original arguments and return its
return value unchanged.

## Question (backlog item, from sim-axeacq-b)

Why is a stashed hatchet never equipped? Axeacq measured (fresh band
16101–16116, 60d; bank 15337): 0/5 vessels who owned a stashed hatchet ever
held one, although stash-equip was reported to fire for a stone_knife
(16101, morning 5, empty weapon slot) and a looted hatchet is equipped the
next morning (16111). gearUp's own-carried → own-stashed order
(game.js:7415) exists in code but never surfaces a hatchet here.

## Primary metric

Per vessel case (a seed whose vessel owns a stashed hatchet at spawn, plus
the 16101 stone_knife control): the complete equip-choice trace —
every Game.villagerGearUp call targeting the vessel (acquire flag, pre/post
weapon bonus, pre/post stash), every Game.craft('stone_knife') call, every
Game.equip call on the vessel, and a morning snapshot of vessel stash /
scholar inventory / scholar equipped — from spawn through day 60, or
village loss / vessel death if earlier.

## DIAG-GO threshold (binding)

A named mechanism explaining the 0/5, reproduced on at least 3 independent
vessel cases, with the exact code path / condition that loses the hatchet
identified (not "gearUp is complex"). If the recorder shows the hatchet
DOES surface on fresh seeds, that refutation with counts is the verdict.

## Pre-registered hypotheses (judged, not assumed)

- H-A (primary): the vessel (player/scholar) is never the target of a
  Game.villagerGearUp acquire=true call. All acquire=true callers found by
  code read are NPC departure sites (villager-agency startExpedition,
  game.js resolvePatrol); every fight-time call passes acquire=false and
  returns before the stash block at `if (wb > 0 || !acquire) return;`
  (game.js, villagerGearUp). The sim bot's own equip
  (scripts/policies/competent.js gearUp) scans only scholar.equipped +
  scholar.inventory, never stashed. So a stashed hatchet has NO code path
  to the vessel's hands in sims.
- H-B (stone_knife control): 16101's morning-5 stone_knife is a
  policy-knapped craft (competent keepKnife/armUp: Game.craft('stone_knife'))
  + policy gearUp equip, NOT a stash move. Test: the stashed stone_knife
  is still in the stash after morning 5, and a craft('stone_knife') call
  precedes the equip. If instead the stash loses the stone_knife with no
  craft, H-B is refuted and a vessel stash path exists for some weapon.
- H-C (spawn context, not the equip mechanism): choosePersonalFive scores
  sentimental items at 1000 vs hatchet 200 (weapon bonus 15×10 + tool 50),
  so a 5-keepsake pool outranks the hatchet into the stash. Recorded as
  context for why the hatchet is stashed at all; it does not explain why
  it is never later equipped.

## Horizon + why

60 days, matching axeacq column (a): the latest fresh first-axe day there
was 50, and the stone_knife control fires on morning 5, so 60d covers both
the early control and the full axe window. Death-aware: runDays stops at
Game.over; dead runs end at death.

## Seeds

Fresh band 16101–16116 (the axeacq band, re-run under the recorder, same
substrate so traces are comparable to the axeacq corpus). Screening = all
16; no separate confirm band is needed unless the mechanism is ambiguous
after 16, in which case fresh seeds are added and the prereg is amended
BEFORE judging them.

## Policies / substrate (identical to axeacq guard leg)

nighttravel + woodcarry, WOODWARM=0 (guard leg), COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1. POLICY=nighttravel,
WOODCARRY=1. No WOODDAY probe, no thief grant, no taps, no state edits.

## Instruments

- scripts/hatchequip-trace-b.js (recorder driver; behavior-neutral wrappers)
- scripts/analyze-hatchequip-b.js (analyzer: per-seed verdicts + counts)
- scripts/test-hatchequip-b.js (proof: static code-path assertions +
  corpus assertions)

## Metric review (section in the evidence file, filled at write time)

Doubts about the metric itself go here for the NEXT run; they do not
re-score this run.
