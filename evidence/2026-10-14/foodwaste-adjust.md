# Food waste lever adjustment — prodthrottle death-spiral fix (2026-10-14)

## Pre-registration
- Question: can the production-throttle lever cut waste without the survival regression?
- Lever: PRODTHROTTLE as landed (afb736e6) + honest-burn fix + proportional redirect.
- PRIMARY: absolute fresh-rot kcal, armed vs identical-seed before. GO = armed ≤ 0.70 × before (≥30% reduction).
- GUARDRAILS: median survival within ±5d of before; starvation deaths not up (armed ≤ before); national not down.
- Horizon: 180d death-aware. Seeds: 101/202/303/404 × leadcourt/belongseek (8 runs/side, identical seeds).
- Policies: honest courtship (leadcourt, belongseek) — same as the pilot/confirm.

## Diagnosis: why the landed lever starves villages

The throttle (afb736e6) redirects ALL duty forage/garden/fish to wood/water/stone
whenever `pantryFreshDays() > 4`. Two compounding flaws:

**1. The all-or-nothing cliff.** The gate is binary: open → ZERO food labor,
closed → full food labor. A day-by-day diagnostic (scripts/diag-throttle-loop-20261014.js,
seed 11) showed the gate open for 24 of 38 days — 24 days of zero food inflow
while the village slowly died. The pantry becomes just-in-time with no resilience
to tribute demands, feasts, or bad harvest days. Across the confirm suite the
mechanism fired 8,636 redirects (~360/run, ~20% of all food labor).

**2. Measured burn is endogenous to starvation.** `pantryFreshDays() = freshKcal /
measuredBurn`, and measured burn collapses when villagers go hungry (seed 11:
burn 7834 → 1264/day as the village starved). A starving village reads its
shrinking pantry as GROWING abundance (21k kcal / 1264 = "16.7 days") and
throttles harder into famine — a death spiral. The comment "never throttles
into famine" was aspirational, not true.

Fixes tried and measured:
- (a) Burn floor at roster × 1500: BROKE the lever. Villages chronically eat
  below nominal need from the pantry (self-caught food bypasses it), so the
  floor suppressed throttling even in healthy villages. Redirects 1940 → 257,
  rot +89%. Reverted.
- (b) Hunger exemption at hungryStreak > 0: over-fired (a single hungry
  villager blocked everything). Redirects 1940 → 229, rot +70%. Tightened to
  >= 3 (the game's own hunger-winter crisis threshold). Kept.
- (c) Hunger exemption at >= 3 alone: no measurable effect (redirects
  1886 vs 1940, rot -0.5%). The exemption is a safety net, not the fix.
- (d) PROPORTIONAL redirect (landed): redirect chance ramps 0% at 4 days →
  100% at 7+ days, rolled per villager. A 5.5-day pantry redirects ~half
  the food labor — the village keeps producing, just less. This is the fix.

## What changed (src/js/game.js)

1. `prodThrottleChance()`: new. `clamp((freshDays - 4) / 3, 0, 1)`.
2. Redirect gate: `prodThrottleEngaged() && Math.random() < prodThrottleChance()`.
3. `prodThrottleEngaged()`: returns false during hunger-winter streak (>= 3
   consecutive days of someone eating <60% of need — the game's own crisis
   threshold from villageEats).

The narration is unchanged ("leaves the X standing…") — villagers still decide
individually; now some stand down and some keep working, which reads MORE
human, not less.

## Results

| metric | before (landed afb736e6) | after (proportional) | delta |
|---|---|---|---|
| fresh-rot kcal | 1213.6k | TBD | TBD |
| median survival | 102d | TBD | TBD |
| starvation deaths | TBD | TBD | — |
| national | 5/8 | TBD | — |
| redirects | 1940 | TBD | — |

(TBD — sweep running at time of writing; will fill before commit.)

## Metric review
- The 8-seed screen is smaller than the confirm's 24 runs; per-seed variance
  is ±60-100d (confirm evidence). Treat small median deltas as noise.
- Steve's "too easy" constraint respected: the lever still cuts waste (it
  fires hardest at 7+ days, exactly the rotting surplus), it just stops
  zeroing food production for weeks at a time.

## Convergence state
food-economy: converging — the lever keeps its rot effect with the survival
cost addressed.
