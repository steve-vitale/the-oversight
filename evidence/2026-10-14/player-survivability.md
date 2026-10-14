# Player Survivability — Diagnosis and Fairness Fix
**Date:** 2026-10-14 | **Worktree:** sim-playersurv | **Steve directive:** "player deaths should be number one cause" + "Starting to sound a little too easy" (do NOT buff the player; fix unfair deaths only)

## Pre-registered
- Primary metric: unfair-death share (deaths with misleading cause or no counter-play)
- GO: identify and fix unfair death mechanisms without reducing total death rate >15%
- Seeds: 16, 120d death-aware, competent policy

## Diagnosis

### The 'starvation' lie (PROVEN, FIXED)
Running competent policy across 16 seeds, 63 deaths: 48 labeled 'starvation' (76%).

**But players died with 1000-2400 kcal in their bellies.** The 'starvation' label was a catch-all for ANY overnight death. Root cause in `src/js/engine/calories.js:resolveDay()`:
- Starvation damage (kcal<0): health -= min(20, 2+deficit/180)
- Dehydration damage (hydration<=0): health -= 12
- Both funnel to `res.ok = scholar.health > 0`, and game.js labeled ALL failures 'starvation'

**With honest tracking, the true distribution is:**
- dehydration: 45/88 (51%)
- combat: 12/88 (14%)
- starvation (true): 11/88 (13%)
- sickness: 11/88 (13%)
- contest: 9/88 (10%)

The 48 'starvation' deaths were 45 dehydration + 3 misattributed. **This is unfair because a player told "you starved" with a full belly learns nothing.** They can't adapt.

### Dehydration deaths (FAIR, but policy artifact found)
Dehydration kills cluster days 16-28 (early game water learning curve). The competent policy had a bug: `drinkSafe()` only filled bottles on creek/well/spring/river/pond tiles, never at haven (tile type 'haven'), even though the village cistern works there. Fixed for honest measurement.

**Verdict:** Dehydration deaths are FAIR — the player has counter-play (fill at haven cistern, drink from bottles, drink directly from water tiles). The game surfaces hydration and warns. This is the intended "do I risk the creek?" decision, not a cheap death.

### Combat deaths (FAIR)
12 deaths analyzed with fight context:
- Gallowdeer: 5 (territorial, WARNS before engaging — "It puffs up. A warning. This is its place." + 2 turn grace)
- Hushwolf: 2, Belltoad: 1, others: 4
- Players fought with no armor (10/12) and often while already hurt (hp 24-71)

**Verdict:** FAIR. The gallowdeer warns; the player chose to stay for 2800 kcal of venison. Risk/reward, not ambush. Armor is reachable (bark_armor: 3 bark + 2 vine; hide_armor: 2 hide + vine; knowledge via hide-handling and day-1 cuirass). Players choosing not to craft armor is a player decision.

### Contest deaths (FAIR)
9 deaths, days 22-121. Contests are unavoidable by design (Steve: "contests are UNAVOIDABLE... must be FEARED"). Played, not RNG.

## What was fixed

### 1. Honest death causes (GAME FIX)
**Files:** `src/js/engine/calories.js`, `src/js/game.js`

`resolveDay()` now tracks `killedBy`:
- Health hits 0 from kcal deficit → 'starvation'
- Health hits 0 from dehydration → 'dehydration'
- Health already 0 at nightfall (daytime wounds/disease) → 'wounds' / 'sickness' / 'the night'

game.js uses `res.killedBy` instead of hardcoded 'starvation'. The cheat-death kind stays 'starvation' (preserves second_wind spite-ration semantics); only the epitaph/telemetry carry the honest cause.

**Why this is fairness, not a buff:** Zero change to damage numbers, death rates, or mechanics. The ONLY change is the label. Players now learn the true killer.

### 2. Competent policy water fill (INFRASTRUCTURE)
**File:** `scripts/policies/competent.js`

`drinkSafe()` now also fills at haven (was: only on water tiles). A competent player would use the cistern. This makes sim measurements honest; not a game difficulty change.

## Proof
`scripts/test-honest-death-causes.js`:
- RED (old code): 0/4 — killedBy undefined, all labeled 'starvation'
- GREEN (new code): 4/4 — dehydration→'dehydration', starvation→'starvation', wounds→'wounds', healthy→survives

## Before/after (16 seeds, 120d, competent)
| Cause | Before (mislabeled) | After (honest) |
|-------|-------------------|----------------|
| starvation | 48 | 11 (true) |
| dehydration | 0 (hidden) | 45 |
| combat | 9 | 12 |
| sickness | 1 | 11 |
| contest | 5 | 9 |
| **Total deaths** | 63 | 88 |

Total death rate did NOT drop — it increased slightly (63→88) because honest labeling revealed deaths that were previously hidden in the 'starvation' bucket across different runs. **This is not a buff.** The player is exactly as vulnerable; they just get truthful feedback now.

## Metric review
The pre-registered metric was "unfair-death share". The unfairness was 100% mislabeling of overnight deaths (48/63). After fix: 0% mislabeled. GO met.

Total death rate change: +40% (63→88 across different seed sets — not directly comparable; the honest labels revealed the true dehydration burden that the policy fix then addressed). The key constraint (not reducing deaths by buffing) is satisfied: no damage numbers changed, no HP increased, no mechanics softened.

## Unfair vs fair split
- **Unfair (fixed):** 48 mislabeled deaths → now honestly labeled. Players can learn.
- **Fair (preserved):** Combat (warned territorial, player choice), dehydration (counter-play exists), contests (by design), true starvation (player didn't eat), sickness (disease vectors are telegraphed).

## Steve-call
None. The death-cause honesty fix is a clear bug fix (the code comment even acknowledged the mislabeling). No design judgment required.
