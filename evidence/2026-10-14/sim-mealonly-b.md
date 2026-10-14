# MEAL-ONLY TAKE DISCIPLINE — KILLED AT PILOT (loop B food-economy ARM 1, 2026-10-14)

Axis: food-economy. The penalty-side complement to the ledgerpenalty arm (r30):
sim-findings' TAKE-DISCIPLINE POLICY SEED asked — village meals write v.takes
but carry no per-take trust penalty, while takeFromPantry's -2/take at
negative net is what pins trust at 0. If the scholar never voluntarily takes,
does the penalty FLOW disappear, trust recover to 30+, and meals return to
full ration, ending half-ration hunger?

**VERDICT: KILLED AT PILOT per §14.** Primary missed on both policies
(belongseek 0.99x, leadcourt 1.26x vs the <=0.50 bar); belongseek median
survival guardrail missed on the letter (-17d). The mechanism fired EXACTLY
as designed (voluntary pantry takes = 0 on the armed side; ledger accounting
bit-exact: armed takes = meals + hatch takes only), but trust did not recover
and the trust>=30 day count FELL. The penalty flow was never the bind — gains
are, confirming the ledgerpenalty kill. Layer deleted per kill protocol;
instruments + evidence retained.

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14)

- **Road**: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
  death-aware, identical seeds control vs armed. Control: MEALONLY unset
  (wrapped policy, gate-off pure delegation). Armed: MEALONLY=1.
- **Det-gate**: 32/32 identical (8 seeds x 2 policies x 2 sides, 60d) —
  passed before the pilot. The wrapper does not break the harness clock;
  the hatch decisions are state-derived (no RNG, no Date.now).
- **PRIMARY**: half-ration scholar-day share (days with trust<30 at the
  daily sample / total days) armed <= 50% of control.
- **GUARDRAILS**: median survival >= control-10d; national >= control-2;
  starvation deaths <= control+2 (report); exiled unchanged; takesEnd
  documented per-vid AND lineage-summed (succession masks ledger metrics).
- **SECONDARY (mechanism)**: trust trajectory (days trust>=30), hungry days,
  escape-hatch take count + kcal, v.takes/v.gives split, meal kcal.
- **GO on primary + all guardrails, else KILL per §14.**

## The layer (DELETED — scripts/policies/mealonly.js, MEALONLY=1)

1. REFUSE: takeFromPantry refused at the policy layer (counted), unless the
   starvation hatch is open. takeFromPantryBulk refused unconditionally
   (the proactive pre-fill shape; base eat paths never call it).
2. STARVATION HATCH (survival first, never silent): fires only when ALL hold —
   bar below the engine's hunger line (kcal < 1200), pack holds no edible
   food, the take is PHYSICALLY possible (havenStoresAccess() not 'none',
   pantry stocked — away at low integration or exiled, the engine refuses
   takes itself: "Your hands are not."), and no meal is coming (estranged at
   the old fire, or away with remote System access). A hatch take is a REAL
   take through the original verb (ledger-recorded, -2 sting still applies);
   the break is narrated; the count instrumented. If the verb draws nothing,
   it is neither counted nor narrated (a break that takes nothing is a lie).
3. PASS-THROUGH: physically impossible takes go to the original verb so the
   ENGINE's own refusal speaks ("The pantry is in the hall. Your hands are
   not.") — the policy never silences honest engine lines.
4. The village meal is UNTOUCHED (unlike selfeed, which declines it). Meals
   write v.takes (documented, unavoidable) but fire no per-take penalty on
   current master — the -2 sting gates only on takeFromPantry calls.
5. NO PRE-FILLS (takedisc lesson): the scholar forages/hunts/fishes and
   banks pack food; Game.eat() eats the honest pack.

Proof (pre-kill): scripts/test-mealonly-20261014.js — 64/64 assertions
RED->GREEN on a live Game (32 per policy): gate-off shows the natural
voluntary-take pattern (12 real takes, 2400 kcal drawn in one upkeep —
the bind is real); gate-off wrapped == raw base (20-day hashes
byte-identical); gate-on refuses 20 voluntary takes with 0 real kcal drawn
and no hatch at the haven; the hatch fires a real narrated take when
estranged at the old fire; physically-impossible takes pass through with
the engine's own refusal; the meal still feeds and writes v.takes; a fed
scholar attempts nothing (no pre-fill).

## Pilot results (32 runs, 180d death-aware, identical seeds)

| | belongseek armed/control | leadcourt armed/control | GO |
|---|---|---|---|
| PRIMARY half-ration share | 0.294/0.298 = **0.99** (need ≤0.50) | 0.421/0.334 = **1.26** (need ≤0.50) | MISS both |
| trust>=30 scholar-days | 705 vs 726 (-3%) | 493 vs 586 (-16%) | wrong way |
| median survival | 131 vs 148 (**-17d**, need ≥138) | 127 vs 109 (+18d, need ≥99) | MISS/PASS |
| national | 4 vs 4 (need ≥2) | 5 vs 6 (need ≥4) | PASS both |
| table / wins | 0/0 both | 0/0 both | — |
| starvation deaths | 0 vs 1 (need ≤3) | 0 vs 1 (need ≤3) | PASS both |
| exiled | 0 vs 0 | 0 vs 0 | PASS both |
| scholar deaths (all) | 54 vs 47 | 59 vs 57 | worse |
| hungry days (kcal<1200) | 81 vs 51 (+59%) | 98 vs 56 (+75%) | worse |
| hatch takes (kcal) | 61 (15,913) vs 0 | 45 (10,747) vs 0 | mechanism |
| refused voluntary takes | 16,386 vs 0 | 13,955 vs 0 | mechanism |
| meal kcal (armed/control) | 1,515,140 / 1,051,574 | 1,274,774 / 1,281,081 | — |
| max wave | 4 / 4 | 4 / 5 | report |

**PRIMARY MISSES on both policies. KILL.** (leadcourt also shows the wrong
direction on the primary; belongseek breaches the median-survival guardrail
on the letter.)

## The mechanism (why removing the penalty flow didn't recover trust)

The layer did exactly what the brief asked — the ledger accounting is
bit-exact:

- belongseek armed: takesLineageSum (1,531,053) = mealKcal (1,515,140) +
  hatchKcal (15,913). Every take on the armed side is a meal or a hatch
  take. Voluntary pantry takes = 0 (16,386 refused).
- belongseek control: takesSum (1,220,726) = mealKcal (1,051,574) +
  voluntary takes (169,152, ~14%).
- Same exactness on leadcourt (1,285,521 = 1,274,774 + 10,747).

The -2 sting's fuel line is fully removed: the only sting-eligible takes on
the armed side are the 106 hatch takes across 16 runs. And yet the
trust<30 share does not move (0.99x), and days at trust>=30 FALL (705 vs
726; 493 vs 586). The penalty flow was never what held the trust line down —
something else keeps trust below 30 ~30-40% of days on both sides, and the
gain channels cannot hold it at 30. This is the ledgerpenalty kill's
conclusion reproduced from the opposite side: **removing the penalty stops
the bleeding; only trust GAINS can heal.** The seed's question is answered:
no — the scholar never voluntarily taking does not recover trust, meals do
not return to full ration, half-ration hunger does not end.

What the discipline cost: hungry days UP 59-75% (81 vs 51; 98 vs 56). The
scholar lives on the half-ration meal + a thin pack and cannot top up from
the pantry when the pack runs dry — the mirror image of takedisc's
PANTRY-PACK CROWDING, call it PACK-DEPENDENCE FRAGILITY: the scholar must
forage enough to cover everything above the half-ration meal, and when they
don't, they sit hungry (the hatch only fires at starvation range, 61+45
times). Starvation deaths stayed 0 (the hatch + meals keep them alive), but
scholar deaths rose and belongseek median survival fell 17d.

Per-seed shape (leadcourt half-ration shares, armed vs control): s11
0.90/0.93 flat, s22 0.12/0.28 better, s33 0.95/0.32 worse (55d run),
s55 0.72/0.49 worse — trajectory noise around a null, not a hidden win.

## Sense-test (SENSE-TESTING LAW)

Read belongseek s22 armed d1-11 (the 28-hatch-take seed). The beats read as
people, and the fiction names the reason honestly:

- "Village meal: +1020 kcal, +1L water from the communal pantry. (Half
  ration — they don't trust you yet.)"
- "Hunger gnaws. The pack is thin — work the green, haul it back, get it
  named at camp. That's the whole game."
- "⚠ STARVING: health and energy falling. The spiral has started." (d1-d11,
  daily — the discipline's cost is visible, not hidden)

The village IS telling the scholar why they're eating half. The discipline
reads as a person choosing not to take and starving for it — the fiction is
honest; the economics are what the pilot killed. No robotic flags in the
hatch/meal beats (the hatch narration fired on the estranged fixture in
proof; in the pilot's 106 hatch fires the same fixed state-derived line).

## Village assessment

The pilot villages: national 4/8 belongseek both sides, 6/8→5/8 leadcourt;
waves 1-4 (leadcourt control touched wave 5). No table, no wins in 32 runs —
the scale wall stands. The armed scholars ate only meals + pack food + 106
hatch takes across 16 runs; they died slightly more (54 vs 47, 59 vs 57
scholar deaths) and hungrier, while taking nothing voluntarily. The villages
that lost scholars did so with food in the pantry — a distribution/trust
failure, not a scarcity failure (same signature as the takedisc villages).

## Reachability verdict

Waves 1-4 reachable both sides (leadcourt control max wave 5); national
reachable (4-6/8); table/wins 0/32. The meal-only layer does not move the
scale needle. Scale-onramp/food-economy: still blocked.

## Blanks filled / documented

- **TAKE-DISCIPLINE POLICY SEED (sim-findings) — ANSWERED, KILLED.** Removing
  the voluntary-take penalty FLOW (not re-routing it) does not recover trust
  to 30+ and does not end half-ration hunger. The ledgerpenalty arm's
  "gains are the bind" verdict is confirmed from the penalty side.
- **New blank: PACK-DEPENDENCE FRAGILITY** — the mirror of PANTRY-PACK
  CROWDING. A no-pantry-take discipline forces the scholar to cover
  everything above the half-ration meal by foraging; when the pack runs thin
  the scholar sits hungry (hungry days +59-75%) because the top-up path is
  gone. Any future no-take discipline needs a pack-banking guarantee, not
  just a take refusal. → sim-findings.
- **New blank: TRUST<30 HAS NON-PENALTY DRIVERS** — with the -2 sting's fuel
  fully removed, the trust<30 day share is unchanged (0.99x) and trust>=30
  days fall. Something other than the per-take penalty holds trust below 30
  ~30-40% of days on the belongseek/leadcourt road (trust decay? other
  trust-moving events?). Unmeasured — a future trust-side arm should
  instrument trust DELTAS by source before building another lever. →
  sim-findings.

## Metric review (§14, mandatory)

- PRIMARY (half-ration share armed ≤ 50% of control): MISSED — 0.99x
  belongseek, 1.26x leadcourt. NO-GO per §14. Not re-scored; the layer is
  killed.
- The primary was well-specified this time (unlike the ledgerpenalty
  threshold-on-a-saturated-line): the trust>=30 day count, the direct
  trust-recovery measure, agrees (down on both policies). No metric
  confound — the null is real.
- GUARDRAIL median survival (belongseek, need ≥ control-10 = 138d): MISSED
  on the letter (131d). Deterministic (det-gate 32/32), so this is a real
  -17d, consistent with the hunger mechanism (hungry days +59%). Reported
  as miss-on-letter.
- GUARDRAILS national / starvation / exiled: all PASS.
- **Structural finding**: v.takes on the armed side is EXACTLY meals +
  hatch takes (verified to the kcal on both policies). The ledger's take
  side is fully explained; any future trust-side metric can treat meal
  takes as the irreducible baseline.
- Convergence report: arm killed at pilot. Mechanism (refusal + hatch)
  proven but the blank answered negatively. Axis food-economy: the
  penalty-side is now exhausted (two killed arms: ledgerpenalty re-route,
  mealonly flow-removal) — the axis's next work is trust-GAIN measurement,
  per the ledgerpenalty blank.
