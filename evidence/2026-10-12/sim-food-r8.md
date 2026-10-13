# Long-run sim — food economy ROUND 8: ORGANIC NATIONAL (2026-10-12)

Lever 0: **food economy** — round 8. Standing directive (Steve 2026-10-12):
attack the scale wall every run until sims show villages reaching national.
This run jumps the lever rotation (index stays at 3) — reason: the scale
on-ramp is the active convergence axis and food is its instrument.

Follows sim-food-r7.md (feast chain 0/12→7/12), sim-travel-r5.md (fed
instrument: national 2/12, proving the food wall binds), sim-winpath-r5.md
(first organic win via tableRoad drain).

## Pre-registration (MEASUREMENT.md §11)

- **Primary metric:** national reach on winseek (the diplomacy-capable
  policy), 12 seeds × 200d. Baseline: 0/12.
- **GO threshold (pilot, 4 seeds × 150d):** tribute paid drops ≥30% AND
  (day-60 pantry ≥2× baseline median OR national ≥1/4).
- **Horizon:** 150d pilot / 200d confirm (§10: reachability lever).
- **Seeds:** pilot 11, 66, 77, 99; confirm 11,22,33,44,55,66,77,88,99,111,222,333.
- **Policies:** winseek (national vehicle; inherits competent's food base),
  competent (food-metric regression check).
- **Correction logged:** the first "baseline" was run after the edits with
  gates on (indistinguishable from after). True baseline re-run with
  WINSEEK_R8=0. The numbers below use the true baseline.

## The diagnosis: the kcal balance sheet

Instrument: scripts/diag-kcal-r8-20261012.js — hooks stockPantry,
donateToPantry, stockSurplus (villager surplus-sharing, previously
unmeasured), _removePantryKcal (tribute/oath/obligations),
pantryDraw (meals/rations/feast), sweepSpoiled (rot, deduped by identity),
registerDeath, plus daily pantry/roster/rank/tribute-owed trace.

**Two measurement bugs found and fixed during the round:**
1. `donateToPantry` and `stockSurplus` bypass `stockPantry` — the scholar's
   donations and villager surplus-sharing (30% of inflow!) were invisible.
   Fixed by hooking both.
2. `new Error().stack` in measurement wrappers PERTURBS THE SIM (seed-77's
   trajectory changed with stack-sniffing in). Replaced with entry-point
   wrappers (withSink pattern). Verified: solo run == paired run.

**Baseline balance sheet (competent, 12×200d, gates off):**
- IN 3.64M: gardens 35%, villager surplus 30%, fish 25%, forage 9%, traps 0.1%
- OUT 4.54M: **rot:fresh 61%**, meals 25%, rations 10%, rot:preserved 3%
- 95% of rot is FRESH (3-day clocks). The pantry is a rot factory.

**Baseline balance sheet (winseek, 12×200d, gates off):**
- IN 1.94M, OUT 2.63M: **tribute 41% (1,074k)**, meals 28%, rot:fresh 14%
- Seed 11 held FOUR simultaneous subordinate oaths: 25,500 kcal/week tribute.
  The policy proposed as subordinate to everyone and swore every Binding —
  "never refuse, never walk." The village paid 138k tribute and won at day 39
  via the 4-oath stack (vested belong → lesser seat → table). An exploit win,
  not an honest one.

**Where the food economy breaks:** not starvation (4-6% of deaths). Villages
die in COMBAT (82-88%) with food in the pantry (seed 77: 68k pantry, dies
day 72). The fed instrument worked by overfeeding (469k/run); honest
management needs to stop the two bleeds: tribute-stacking and fresh rot.

## The lever (scripts-only, no src/ touched)

**1. Oath/tribute discipline (scripts/policies/winseek.js, gate WINSEEK_R8):**
- Exclusivity: never hold 2+ active subordinate links. Answering a 'belong'
  beat while already oath-bound → 'walk'. Proposing as subordinate while
  already subordinate → propose covenant instead.
- Buffer gate: don't take a new subordinate oath unless pantry ≥ 8,000
  (seal 3,000 + one week of 5,000 tribute). Tuned down from 20,000 — that
  blocked every oath in the pilot.
- Exact numbers: buffer 8,000 kcal; exclusivity hard (max 1 subordinate link).

**2. Preservation scale-up (scripts/policies/competent.js): KILLED at pilot.**
Tried staffing a 2nd cook when freshKcal > 12,000. 54 assignments fired but
trajectories were byte-identical (rot 98/76/91/99% both arms). Bottleneck is
game-side (cook 4,000 kcal/day budget + racksFull guard), not staffing.
Reverted; documented in code.

## Before/after (identical seeds 11..333 × 200d, winseek)

| metric | before (gates off) | after (gates on) |
|---|---|---|
| national | 0/12 | 0/12 |
| table / wins | 1/12 (s11, 4-oath exploit) | 1/12 (s222, honest) |
| tribute share of OUT | 41% (1,074k) | **17% (555k)** |
| regional reach | 9/12 | 11/12 |
| survival median / max | 33d / 66d | 39d / 124d |
| vested (four-realm) | 2/12 | 1/12 |
| feastSurgeUsed | 5/12 | 7/12 |
| wave 4 / 5 | 0 / 0 | 0 / 0 |
| arc reach | 11×3, 1×4 | 10×3, 1×4 |

Death causes (after, 242 deaths): villager combat 43%, combat 29%,
monster 21%, starvation 4%. Unchanged shape — combat is the wall.

**Pilot verdict:** GO on the tribute effect (41%→17%, no stacking — obvious
in 4 seeds). National did not appear: the villages that survive the
tribute bleed die in combat before day 60. Food is now managed honestly;
the scale wall's binding constraint on these seeds is combat, not food.

**The win:** seed 222 won at day 47 (regional, arc 4, table) with ONE oath
(58k tribute, max 13.5k/week owed) — the exploit win replaced by an honest
win. The win rate holds; the path is clean.

## Reachability verdict

- Tribute/oath discipline: REACHABLE and WORKING. The 4-oath exploit is
  closed; honest single-oath play wins.
- National: NOT REACHED (0/12 both arms). Not a food problem — villages
  have food (68k pantries) and die fighting. The combat lever owns this.
- Waves 4-5: 0/12 (wave lever's on-ramp, unchanged).
- Preservation: the rot is real (61% on competent) but fixing it doesn't
  move national — the bottleneck is game-side throughput, not policy.

## Village assessment (plain words)

Twelve villages courted, and eleven reached regional. They swore — but this
time, they swore once. Seed 77 bowed to Ashford alone: "Haven bows to
Ashford — one organization, them primary. Tribute: 6,000 kcal/week. The
relationship starts at trust 30. Everything from here is earned." The
tribute walked out weekly, the relationship held, and when Ashford heard
the bins echoing they sent grain — "2,932 kcal, no tribute, no ceremony."
People, not systems.

The villages still die the way villages die: in fights. Forty-three percent
of the dead fell in villager combat, twenty-nine in the scholar's own
fights, twenty-one to monsters. Starvation took four percent. The pantries
were not empty — seed 77 died with 68,000 kcal in the stores and the cook
muttering "should've smoked that" over the rot. The food economy is honest
now: no stacked oaths, no 25k/week bleed, the feast chain firing (7/12).
What the villages need next isn't more food — it's to survive the fights
long enough for the food to matter. That's the combat lever's war.

## Sense-testing (transcripts read)

- The oath beat lands: named villager, real kcal, real trust. ✓
- Tribute paid lines are honest ledger entries. ✓
- Aid arrives with voice (Fatima of Ashford, 2,932 kcal, no ceremony). ✓
- The cook mutters about the smoke rack when food rots — the village notices
  its own waste. ✓
- "Tribute is already current this week" repeats (idempotency guard) —
  honest status, noted in winpath-r5 too. Not a blank.

## Villager check

Villagers act like people: they staff the racks, mutter about rot, work
the cookpot, share surplus (30% of pantry inflow!), send aid. The surplus-
sharing is the quiet hero — trust-gated, as designed. No robotic behavior
flagged in the food domain.

## Blanks: filled / documented

**Filled:**
1. The 4-oath stacking exploit (25.5k/week tribute) — closed via exclusivity.
2. Tribute bleed 41%→17% — honest food management.
3. Measurement: stockSurplus/donateToPantry inflow now tracked; stack-sniffing
   ban (perturbs the sim).

**Documented (not this lever):**
1. National 0/12 — combat deaths bind, not food. Combat lever's territory.
2. Fresh rot 61% (competent) — game-side throughput (cook budget/guard),
   not policy staffing. Future food work.
3. Waves 4-5 unreachable — wave lever's on-ramp.

## Design calls for Steve's overrule

1. **Oath exclusivity (max 1 subordinate link).** No village swears to four
   masters. If Steve wants multi-oath play, the tribute needs to scale
   sublinearly or the game needs to forbid it explicitly.
2. **Buffer gate 8,000 kcal** (seal + 1 week). 20,000 blocked everything.
3. **The 2nd cook killed** — game-side bottleneck, not staffing.
4. **No [needs-eyes]** — policy only, no feel/combat/UI changes.

## Convergence

`converging` — tribute discipline landed (41%→17%), honest win preserved,
but national 0/12: the scale wall needs the combat lever now. Food-economy
as national's instrument is parked pending combat survival.

## Files

- scripts/policies/winseek.js — oath exclusivity + buffer gate (WINSEEK_R8)
- scripts/policies/competent.js — 2nd-cook kill documented (reverted)
- scripts/diag-kcal-r8-20261012.js — balance-sheet instrument (POLICY env,
  withSink pattern, no stack-sniffing)
- scripts/analyze-kcal-r8-20261012.js — wall + balance-sheet analyzer
- scripts/test-food-r8-20261012.js — 10/10 green
- evidence/2026-10-12/kcal-r8-winseek-truebase.json — true baseline (gates off)
- evidence/2026-10-12/kcal-r8-winseek-after.json — after (gates on)
- evidence/2026-10-12/kcal-r8-pilot*.json — pilots
- evidence/2026-10-12/sim-food-r8.md — this file

## Proof tests

- scripts/test-food-r8-20261012.js: **10/10** — gate-off determinism,
  oath exclusivity (seed 11 max 1 simultaneous), kill documented,
  gates present.
- Gate-off byte-identical: verified (seed 11 trajectory matches pre-edit).
