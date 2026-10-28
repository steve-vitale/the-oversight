# sim-calmbeast-b — PRE-REGISTRATION (committed before any after-measurement)

Run: fleshout-loop-b-20261028T0805Z, arm sim-calmbeast-b.
Worktree branch: sim-calmbeast-b. Background: evidence/2026-10-28/sim-barwhy-b.md
(0630Z B run): `_actionAvailable` hard-calls every precheck with null and the
action bar never passes a target, so `animal_ken.calm_beast`'s button is always
disabled ("Nothing here to calm.") even beside a live hostile, while a tap
given that fighter's key genuinely attempts. Barwhy's C1-combat scaffold is the
BEFORE fixture.

## Canon note (stated, not invented)

No canon doc covers ability-action refusals generally (open tracker blank).
Read: docs/CANON.md (manifest only for this area) + code truth:
`src/js/abilityActions.js` (prechecks, impls, `useAbility`) and
`src/js/app.js` `abilityBarHTML`/`wireAbilityBar` (the bar tap calls
`Game.activateAbility(id)` with NO target). Data truth:
`src/data/abilities.json` animal_ken: calm_beast is context combat, cost
{turn:true}, effect "Attempt to calm a non-predatory animal. May end the
fight peacefully."

## Fix scope — ONE option, pre-registered (no bundling)

DECISION, from the code: the fight-scanning precheck in the
`war_cry.challenge` pattern — NOT a targeting path. Reasons:
1. The bar tap passes no target and there is no target picker for bar
   actions (app.js: "Today all are self/none"); a targeting path would be
   a new UI surface (DOM-only, unprovable in the node harness beyond
   template extraction) for a choice that changes nothing mechanically:
   calm's effect ends the WHOLE fight (`tbEnd('calmed')`), so which
   eligible foe is named does not change the outcome.
2. Challenge already sets the precedent: precheck AND impl both resolve a
   null target from context (active conversation partner) instead of
   refusing. The calm fix mirrors it exactly: resolve a null target by
   scanning the live fight.
3. Scope stays inside abilityActions.js; app.js untouched.

Change (only this, in `src/js/abilityActions.js`):
- New helper `_calmableFighter(game)`: scan `game.tbfight.fighters` in
  order, return the first fighter that passes EXACTLY the precheck's
  current eligibility test (alive, kind not monster / player / villager).
  No new eligibility is invented: monsters stay uncalmable (the impl's
  explicit monster refusal stands), and the scan predicate is the
  precheck's predicate, not a new one.
- `animal_ken.calm_beast` precheck: when target is null, resolve via the
  scan; ok iff the scan finds one, else the existing
  'Nothing here to calm.' why. Explicit-target path untouched.
- `animal_ken.calm_beast` impl: when target is null, resolve via the
  same scan; if none, the existing 'Nothing here to calm. (Calm)'
  narration + false (defensive; the precheck normally blocks it).
  Explicit-target path untouched, narration text untouched.

Explicitly NOT changed: eligibility (no monster calming — whether
wave-1 animal-monsters should be calmable is a Steve design call, held
and documented, NOT bundled); any other action's precheck/impl; app.js
(no targeting UI); narration strings; costs; the `target:'none'` bar
contract.

## Primary metric: the bar tap attempts beside a live hostile

GO iff ALL hold:
(a) C1 fixture (barwhy scaffold: player + live hostile `h_x`, animal_ken
    granted): calm_beast row available=false on all 8 seeds BEFORE and
    available=true on all 8 seeds AFTER, identical seeds.
(b) Bar tap path (no target: `Game.activateAbility('animal_ken.calm_beast')`)
    in C1 narrates a genuine calm attempt on all 8 seeds AFTER — a
    success line ("then turns and goes") or a failure line ("too far
    gone") — and NEVER 'Nothing here to calm.' Before, the same tap
    narrates the refusal ('Nothing here to calm. (Calm)') via the
    precheck. Success/failure split across seeds is reported, not gated
    (50% coin per attempt; both narrations are honest attempts).
(c) Barwhy corpus parity: `scripts/test-barwhy-b.js` dump before vs after
    is identical on EVERY row EXCEPT the C1 calm_beast rows (2 seeds),
    which flip disabled->enabled as intended. No other availability
    change, no disabled row losing its why, no enabled row gaining one.
    (The barwhy assert mode would flag the intended flip, so parity is
    judged by the analyzer's allowed-flip rule, stated here.)
(d) Monster-only and no-foe guards: in a scaffold with only a live
    monster foe, calm_beast stays disabled before AND after (no monster
    expansion); with no foe at all, it stays disabled before AND after.
(e) Pilot band guardrail: competent policy, 100d death-aware cap, seeds
    10430-10437 (barwhy's band seeds), identical before/after. Completes
    8/8 both sides, no crash/hang; wall numbers (national/table/wins,
    wave 4-5 reach, median survival) and death-cause shares reported.
    Guardrail trip = crash, hang, or a death-cause category present
    after that never appeared before. The band is a regression guard,
    not an effect measurement (policies do not tap the bar).
(f) Sense-check: one tapped attempt's narration is read in full and
    judged as a person acting, not a button firing; quoted in evidence.

Fixtures: C1 scaffold copied from scripts/test-barwhy-b.js (player +
hostile, both alive, player unacted). Fixture seeds 9981-9988 (overlap
barwhy's 9981+9982, plus six). Proof script: scripts/test-calmbeast-b.js
(run mode dumps JSON); analyzer scripts/analyze-calmbeast-b.js judges
legs (a)-(d) against before/after dumps. Harness: scripts/sim-harness
(seed before eval, full src/js list minus DOM-only files, Game.save
never stubbed). Balance panel: attempted via scripts/balance-panel.js
on the band corpora; if it cannot ingest the fixture/band corpus (the
known corpus-ingestion class), that is stated explicitly and the
pre-registered analyzer comparison is attached instead — never a
silently skipped comparison.

## Metric review (to be filled at verdict time)

Doubts for the NEXT run, not this one: none pre-registered. If the
50/50 calm coin makes any single seed's tap narration uninformative,
the leg-(b) judgement is over the 8-seed set (attempt narration on
every seed), never over one seed. If the pilot band moves despite
policies not tapping the bar, that movement is investigated, not
explained away — the fix touches only calm_beast's null-target path,
so any band movement would implicate shared code.
