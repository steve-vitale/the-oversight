# Completion-attempt sims r1 (sim-completion r1) — 2026-10-12

**Steve 2026-10-12:** "do more testing sims that try to finish the game."
Sims that genuinely try to FINISH: winseek policy + pointer-heeding (hears the
new scale discoverability beats 4+5, commit 5e06dcc9, and acts on them).

## Arms (all 200d, identical seeds within arm)

| arm | policy | seeds | what it tests |
|---|---|---|---|
| A (unfed) | winseek + pointer-heeding | 1-8,10-16 (15) | honest completion attempt |
| B (fed) | fedseek + pointer-heeding | 1-8,10-12 (11) | completion when starvation removed (SIM INSTRUMENT — fedFloorRoad, not game code) |
| C (gated fed) | fedseek, POINTER_GATED=1 | 1-8,10-12 (11) | can the pointer ALONE bootstrap the climb? (no courtship until _scalePtrW4 heard) |

Pointer-heeding added to winseek.js (scripts-only): `pointerRoad` detects
`_scalePtrW4`/`_scalePtrW5`, records fire days, lowers courtship bars
(35/20 → 25/15, cap 2→3/day) while the W4 pointer is live, bids primacy
when the W5 pointer is live and eligible. POINTER_GATED=1 skips
courtshipClimb/diplomacyRoad until the W4 pointer is heard.

## Funnel

| metric | A unfed (n=15) | B fed (n=11) | C gated fed (n=11) |
|---|---|---|---|
| median / max days | 28 / 56 | 42 / 72 | 35 / 60 |
| arc ≥ 4 | 0 | 1 | 0 |
| wave ≥ 3 / ≥ 4 / ≥ 5 | 1 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 |
| regional / national / global | 8 / 0 / 0 | 10 / 1 / 1* | 0 / 0 / 0 |
| lesser / full seat | 0 / 0 | 1 / 0 | 0 / 0 |
| table fired / won | 0 / 0 | 1 / 0 | 0 / 0 |
| pointer W4 / W5 fired | 0 / 0 | 0 / 0 | 0 / 0 |
| proposals | 54 | 47 | 0 |

\* seed 8 ended global; the 5-day sampler caught regional:30 but missed the
national/global transitions (off-sample days).

## The closest run ever: seed 1, arm B (fed)

- Regional day 25 → national day 60 (BELONG, oath sworn, 294 tribute paid).
- Arc 4 day 70. Wave 3 day 55; faced 11/6/4 across waves 1–3.
- **Lesser seat day 70. Table FIRED day 70.**
- **Village lost day 72** — 2 days after the table fired. 13 deaths (combat).
- 8 contests survived, 5 proposals, 1 national beat answered.

First time the table has fired in any completion sim. The win was 2 days
away and the village died during the table sequence. (Why the table didn't
resolve to a win in 2 days is winpath-lever territory — the policy's
tableRoad answers tc.options[0]; whether the sequence needs more time or
the answer was wrong is unmeasured here.)

## Where runs die (arm A, 147 deaths)

Combat 122 (83%: villager-combat 41, monster 46, combat 35), starvation 10
(7%), wounds/sickness 10, contest 2, thirst 1. Every run ended
`village-lost`. Even fed (arm B), combat kills — the food wall is real
(fed vs unfed: median 28→42d, national 0→1, lesser 0→1) but combat is the
reaper.

## The pointer finding: trigger never reached in 26 runs

**Pointer W4 fired 0/26. Pointer W5 fired 0/26.**

The W4 pointer needs 4 wave-3 ledger points while village-scale
(`pts(3) >= bar(3,4) && !scaleAtLeast(rank,'regional')`). Closest approaches:

- Arm B seed 1: 4 wave-3 faced — but already national (pointer correctly silent; scale outran kills).
- Arm C seed 4: 1 wave-3 faced at village-scale — died day 53 before banking more.
- Arm C seed 7: 0 wave-3 faced at village-scale — died day 54.

**Analysis.** The trigger state (4 wave-3 kills while village-scale) is a
narrow window:
1. Scale-seekers outrun it — they're regional before banking 4 wave-3 points
   (courtship starts day 1, Regional Dawn ~day 25-48).
2. Non-seekers die in wave-3 combat before banking 4 points (median death
   day 28-35; wave 3 needs day 25+ to even unlock).

The pointer is correctly implemented (proof 17/17: fires on exact state,
silent otherwise, once-only), but its trigger may be too LATE for
discoverability. A player is "stuck" when wave 3 unlocks and wave 4 doesn't
come — not after they've fully cleared wave 3. **Design question (not
retuned — src/ untouched):** consider firing when wave 3 unlocks while
village-scale, or at 1–2 wave-3 points, rather than at the full bar.

The gated arm (C) was the honest test of "can the pointer alone bootstrap
the climb" — it couldn't, because the pointer never fired. The signals
themselves are unproven in live sims, not disproven.

## Walls documented (game-side, not retuned)

1. **Combat attrition** (lever 1): 83% of deaths. Winseek engages deliberately
   (deed bars need facing); villages bleed out in waves 1–3.
2. **Food wall** (lever 0): fed vs unfed delta proves it (median +14d,
   national +1, lesser +1, table +1). Confirmed THE binding constraint
   (travel r5).
3. **Wave-3 bar**: 4/4/3 faced needs luck + survival; only 3/26 runs even
   unlocked wave 3.
4. **National seasoning**: links snap ~day 70–90, re-linking resets the
   30-day clock (journey-scale r4).
5. **Pointer trigger rarity** (this run): see above.

## Files

- Policy: `scripts/policies/winseek.js` (pointerRoad, POINTER_GATED, lowered
  courtship bars when pointer live, primacy bids)
- Sweep: `scripts/sweep-completion-r1.js` (POLICY=winseek|fedseek,
  POINTER_GATED=1, pointer instrumentation)
- Raw: `/tmp/comp-r1.json` (A), `/tmp/comp-r1-fed.json` (B),
  `/tmp/comp-r1-gated.json` (C)
- Proof: pointer implementation proven by scripts/test-scale-pointers-20261012.js
  (17/17, commit 5e06dcc9); this run adds the live-sim trigger analysis.

## Regressions

None run — scripts-only policy changes, no src/ touched. The sweep is the
measurement; ontology gate unaffected (no game code changed).
