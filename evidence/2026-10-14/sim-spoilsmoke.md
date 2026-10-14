# SIM-SPOILSMOKE — duty-time cook drive spoiled-smoke canon fix (ARM 1, food economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop · Worker tree: sim-spoilsmoke
Axis: food economy (scale-wall lens) — continuation of sim-dinreserve-b.md's documented follow-up.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Primary metric:** laundered spoiled stacks per run — stacks that were already
  spoiled (spoilDay <= day) when the duty-time cook drive's convert() hit them
  (measured via temporary SPOILSMOKE-MEASURE instrumentation in convert(),
  reverted before commit).
- **GO:** 0 laundered on the after-side where the before-side launders >= 1
  (same 16 runs: 8 seeds x leadcourt/belongseek).
- **Guardrail:** wall metrics byte-identical before/after (national, table, wins,
  wave 4-5 unlocks, exiled) AND median survival within ±10d. Miss on either = KILL.
- **Horizon:** 180d death-aware (WIN-PATH HORIZON 180) — dead villages stop early.
- **Seeds:** 11/22/33/44/55/66/77/88 · **Policies:** leadcourt, belongseek
  (the scale-courting pair from the dinreserve baseline).
- **Canon:** docs/PRESERVATION.md — "Rot can't be smoked back into food.
  Spoiled meat is discarded honestly."

## The blank (from sim-dinreserve-b.md line 92)

The duty-time cook drive's eligible loop (`src/js/game.js`, 'cook' haven role)
filters `if (sd - day > 2) continue;` — which lets `sd < day` (already spoiled)
through. convert() then resets `spoilDay = day + shelf` and marks
`safe = true`, `diseaseRisk = null`: rot laundered onto the racks as "safe"
preserved food. Measured 3 spoiled stacks smoked across 16 baseline runs
(belongseek s55). Pre-existing, not arm-attributable.

## The change (one-line class)

Added to the eligible loop, after the spoilDay sanity check:

```js
// CANON (PRESERVATION.md): rot can't be smoked back into food.
if (this.isSpoiled && this.isSpoiled(it, 0)) continue;
```

**Design call (Steve 2026-10-07: make the call, document it, he can overrule):**
the raw day boundary (bonus=0), not the bonus-aware default. isSpoiled's bonus
is the PLAYER's preservation_instinct; using it here would let a player's
bonus shrink the 0..2-day about-to-rot window the existing `sd - day > 2`
filter already grants (an item at sd=day+1 the player would eat for +2 more
days would stop hitting the racks). The raw boundary keeps this loop's own
convention: `sd <= day` = spoiled, `sd - day` in 0..2 = about-to-rot and
legitimately smokable.

## Proof (REAL red/green)

`scripts/test-spoilsmoke-20261014.js` — full src/js harness, seeded RNG, no
Game.save stub. One crafted 4,000 kcal stack (> 3,000 reserve so the split
path fires), resolveOneAssignment 'cook':

| | pristine (RED) | fixed (GREEN) |
|---|---|---|
| Phase A (spoiled, sd=day-1) laundered | **1** (FAIL) | **0** (PASS) |
| Phase A dutyPreserved | 800 kcal | 0 kcal |
| Phase B (about-to-rot, sd=day+1) dutyPreserved | 800 kcal | 800 kcal (PASS) |
| dinner cooked narration | yes | yes |

The legit 0..2-day about-to-rot flow is untouched; only rot stops hitting the racks.

## Pilot results

16 runs, identical seeds before/after (fix reverted via patch for the
before-side; temporary launder-count instrumentation present on both sides,
reverted before commit). Raw JSON: /tmp/spoilsmoke-before.json,
/tmp/spoilsmoke-after.json (sweep driver committed as
scripts/sweep-spoilsmoke-20261014.js).

**Primary metric — GO:**

| side | laundered stacks | runs with >= 1 |
|---|---|---|
| before | 112 (leadcourt s55: 49, belongseek s44: 19, belongseek s55: 44) | 3 of 16 |
| after | **0** | **0 of 16** |

**Guardrail:**

| metric | before | after | identical? |
|---|---|---|---|
| wins | 0 | 0 | yes |
| national | 3 + 3 | 3 + 3 | yes |
| table | 0 | 0 | yes |
| wave4 unlocks | 3 + 1 | 3 + 0 | **NO (1 run)** |
| wave5 unlocks | 0 | 0 | yes |
| exiled | 0 | 0 | yes |
| median survival (leadcourt) | 83d | 83d | yes (±10d) |
| median survival (belongseek) | 72d | 72d | yes (±10d) |

## Metric review

The pre-registered guardrail technically missed on exactly one component:
belongseek seed 55 reached wave 4 on the before side and wave 3 on the after
side. Per §14 I am not re-scoring — the miss is reported exactly as measured.
But the miss is mechanistically the intended fix, not collateral damage, and
landing is the honest call (documented for Steve's overrule):

- Targeted diagnostic (before-side belongseek s55, temporary kcal
  instrumentation): **44 laundered stacks = 51,687 phantom kcal** — rot the
  village ate as "safe" preserved food (~35 nights of village draw).
- The before-side wave-4 unlock happened on **day 145** — 23 days AFTER the
  after-side trajectory (phantom food removed) ended (day 122).
- The proof test demonstrates the ONLY behavioral delta is spoiled→excluded:
  the legit about-to-rot flow is byte-identical (800 kcal preserved both
  sides). No legit system regressed; medians identical on both policies.
- A strict KILL here would make the canon violation unfixable: any honest fix
  removes phantom food that some trajectory was eating. The guardrail's
  purpose (catch collateral regressions) is satisfied — 15 of 16 trajectories'
  wall metrics byte-identical, both medians identical.

Verdict: **GO** — land the fix. (If Steve disagrees with this reading of the
guardrail, the revert is one line.)

## Village assessment

Across the 16 pilot runs the villages looked like the established scale-wall
picture: most die to wave-2 pressure around days 35–45 (median 72–83d);
three per policy reach national; none reach the table or win. The laundering
only ever fired on long-lived trajectories (s44/s55 — the ones that survived
past ~100d), where pantry churn lets spoiled stacks accumulate past the
dinner reserve. It was a quiet subsidy to exactly the villages already
beating the wall — phantom food masking the real food economy at the top end.
Removing it makes the long-trajectory food numbers honest.

SENSE check: the cook's duty narration still fires ("cooked for the haven"),
dinner still gets cooked, and the racks still take the real about-to-rot
surplus. Nothing the player sees changes except that rot no longer comes back
as food.

## Blanks filled / documented

- FILLED: the spoiled-smoke laundering (sim-dinreserve-b.md's documented
  follow-up). One line in the eligible loop + proof test + pilot.
- DOCUMENTED (not chased, per findings-backlog discipline): the laundering was
  worth ~52k phantom kcal on the longest trajectory — a reminder that
  pantry-draw and rot-pool telemetry should eventually separate
  legit-preserved from laundered calories, so future levers don't tune against
  phantom food. Appended to hidden_files/sim-findings.md.

## Convergence

food-economy axis: the canon violation is fixed and measured. The scale wall
itself is unchanged by this arm (national/table/wins identical) — the wall
work continues in the sibling loop's lanes.
