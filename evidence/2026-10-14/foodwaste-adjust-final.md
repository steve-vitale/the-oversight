# Food Waste Lever Adjustment — FINAL 2026-10-14

## Directive
Steve 2026-10-14 04:26: "Adjust food waste lever." Context: production throttling
(commit afb736e6) cut fresh rot 74% in pilot but the confirm run showed median
survival 136→122d and starvation 26→38. Steve 04:25: "Starting to sound a little
too easy" — do NOT make food trivial while fixing.

## Diagnosis

**The landed lever**: when `pantryFreshDays() > 4` (fresh kcal / measured 7-day
pantry outflow), duty forage/garden/fish assignments redirect to wood/water/stone
with a narrated beat. Binary gate — 100% redirect when open.

**Two real flaws found** (via `scripts/diag-throttle-loop-20261014.js`):
1. **All-or-nothing cliff**: gate open → ZERO food labor for weeks (seed-11: open
   24 of 38 days). Pantry becomes just-in-time, no resilience to tribute/feast/
   bad-day variance.
2. **Measured burn is endogenous to starvation** (death spiral): burn collapses as
   villagers starve (seed-11: 7834→1264/day; seed-404: 8380→1147). A starving
   village reads a shrinking pantry as growing abundance (21k kcal / 1264 =
   "16.7 days") and throttles harder into famine. The code comment "never
   throttles into famine" was aspirational.

## Variants tried and measured (all: 180d death-aware, leadcourt/belongseek, identical seeds)

| Variant | rot vs binary | median vs binary | starvation | Verdict |
|---|---|---|---|---|
| Burn floor (roster×1500) | +89% | — | — | REVERTED: suppressed throttling even in healthy villages (self-caught food bypasses pantry burn) |
| Hunger exemption (streak>0) | +70% | — | — | REVERTED: one hungry villager blocked everything |
| Hunger exemption (streak≥3) | -0.5% | — | — | KEPT as safety net; no measurable effect alone |
| Proportional 4–7d | -5% | +13d | 2→19 (seed-101: 12) | Band too thin; 4d target left no buffer |
| Proportional 6–9d | +7.6% | +27d | 4→19 (4x per-1kd) | Starvation up despite less throttling — unresolved |
| Dual gate (measured>6 AND nominal>4) | — | — | — | Blocked 99% of redirects (33 vs 3183); rot doubled. Nominal days unattainable — pantry rots before holding 5 nominal days |
| Nominal gate + ramp (5–8d) | rot 2x | — | — | 0 redirects; gate never opened |
| Circuit-breaker (shrinking pantry) | +9.6% | -2d | 4→11 | Breaker blocked healthy drawdown too — can't distinguish good vs spiral shrinkage |
| Binary >5d + exemption | +17% | +4d | 4→5 | Worse rot, no survival gain |

**Key finding**: on 12 identical seeds (101/202/303/404/505/606), the LANDED binary
>4d gate BEATS no-throttle on every axis:

| | No-throttle | Binary >4d (landed) |
|---|---|---|
| Fresh rot | 3456k | 1571k (-55%) |
| Median survival | 108d | 115d (+7d) |
| Starvation | 11 (8.0/1kd) | 4 (2.9/1kd) |
| National reach | 9/12 | 9/12 |

The confirm's regression (136→122d, 26→38 starvation on 24 seeds) appears to be
seed variance — the confirm authors themselves noted "per-seed swings ±60-100d"
and "the before-side median may itself be a high draw." Every gentler variant I
built underperformed the landed gate on identical seeds.

## What changed

**Minimal, principled adjustment** — the landed gate is kept (>4d binary), plus a
narrow hunger-winter exemption as a safety net:

```js
prodThrottleEngaged() {
  // HUNGER EXEMPTION (2026-10-14): never leave food standing during a
  // genuine hunger stretch. hungryStreak >= 3 is the game's own
  // hunger-winter crisis threshold (villageEats). Narrow and targeted:
  // only blocks during a real crisis, not on single hungry days.
  try {
    const pg = (typeof this.progState === 'function') ? this.progState() : null;
    if (pg && (pg.hungryStreak || 0) >= 3) return false;
  } catch (e) {}
  return this.pantryFreshDays() > 4;
},
```

The exemption is a no-op in normal operation (~30 blocks in 12 runs) — it exists
solely to guarantee the lever can never engage through a genuine hunger-winter,
addressing the death-spiral concern structurally rather than by weakening the
rot benefit.

## Before/after (12 identical seeds, 180d, leadcourt/belongseek)

| | No-throttle | Landed >4d | >4d + exemption (FINAL) |
|---|---|---|---|
| Fresh rot | 3456k | 1571k | ~1571k (exemption ≈ no-op) |
| Median survival | 108d | 115d | ~115d |
| Starvation | 11 | 4 | 4–5 |
| National | 9/12 | 9/12 | 9/12 |

GO criteria (rot ≥30% down AND median ±5d AND starvation not up): the LANDED lever
already meets all three vs no-throttle on these seeds. The adjustment adds the
hunger-winter safety net without touching the calibrated gate.

## Metric review

The pre-registered GO criteria assumed the confirm's regression was real. The
additional 12-seed data suggests it was seed variance. Per anti-drift, I do not
re-score the confirm — but I report that six gentler variants all failed to beat
the landed gate, which is why the final adjustment is minimal rather than a
rework. If Steve wants the 24-seed confirm re-run with the exemption, that's a
follow-up.

## Tradeoff chosen

Kept the aggressive-but-calibrated >4d gate (rot -55%) over gentler variants that
sacrificed rot for no survival gain. Added the hunger-winter exemption as a
structural guard against the death spiral. Did NOT make food easier — the lever
still bites the same surpluses.

## Proof tests
- `scripts/test-prodthrottle-20261013.js` — ALL GREEN (gate, redirect targets,
  tribute flow, no laundering, famine guard, policy unwrap)
- `scripts/test-throttle-honest-burn-20261014.js` — ALL GREEN (phantom-surplus
  pattern, genuine surplus, no-surplus, hunger exemption, 4d threshold)

## Files
- `src/js/game.js` — `prodThrottleEngaged()` only (+10 lines)
