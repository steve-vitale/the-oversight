# journey-scale r32 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140)

Run id: oversight-playtest-loop-20261025T0600Z. Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
Base: master@f35a6c0c2 (pulled at run start; worktree journey-scale).
Driver: scripts/journey-scale-r32-20261025.js (r31 driver, names/EVIDIR only, plus three census fields).
Analyzer: scripts/analyze-scale-r32-20261025.js (r31 analyzer, names only, plus poor-courtship counts).
Policy: scripts/policies/scalecourt-nogate.js — a VARIANT of scalecourt (which carries the r31 scholar.health pilgrimage-gate fix). Standing scalecourt.js is UNTOUCHED.

## Leg question (from r31's named next arm)

r31: the >12,000 kcal pantry gate on the courtship block freezes in-progress pilgrimages (85004: 1/5 completed) and starves courtship on poor villages. A real player courts while poor; this policy still cannot. Does dropping the gate move anything — or does courting while poor fail for game reasons (unaffordable gifts, trust slide, pantry collapse)?

## The arm (ONE change, policy tooling only, zero src/js changes)

In scalecourt-nogate.js the courtship-block gate `pantryKcal(Game) > 12000` is removed. Everything else is identical to r31's scalecourt: climb-before-knock, opinion-≥10 proposal bar, one proposal per day, 7-day cooldowns, pilgrimage HP gate (health/maxHealth). DELIBERATELY UNCHANGED pay-gates: tribute >15,000, trade-call >10,000, demand >12,000, counter-sweeten >25,000 — a poor village still does not pay what it cannot carry; only the courtship verbs (climb + propose) run while poor. Instrumentation: courtPoorDays (courtship days run while pantry <12,000), pilgrimagesPoor, proposedPeerPoor.

Picker UNCHANGED (r31's driver picker, more/goon loop included). Its cap is r33's own driver arm, per r31 discipline — one arm per run. Picker artifacts in r32 transcripts are reported as driver, not content, exactly as in r30/r31.

## Design: matched worlds

Same seeds as r30/r31 (85001–85004), same driver, same horizon (DAYCAP=150, death-aware stop), same policy except the gate drop. Matched at world-gen only: a policy change rewrites the RNG stream, so later divergence (village splits, deaths) is reported, not attributed. Bond/national timing differences in the first ~50 days are the clean comparison.

PILOT GATE: seed 85001 runs first. If it crashes or its pilgrimages == 0, STOP — do not burn the other three seeds. Diagnose and report the arm as failed.

## Pre-registered verdicts (binding, §14)

- G1 poor-courtship fires: on 85004 (r31's poor seed) courtPoorDays ≥ 10 AND pilgrimage completions ≥ 3 (r31: 1 completed of 5 started). A miss means the gate was not the binding freeze — the walk/study path or the pantry itself still blocks — and the run reports that, it does not re-score G1 as "courtship attempted while poor".
- P1 third bond earlier: ≥ 3/4 seeds reach a 3rd covenant bond by d110. r31 matched baseline: 2/4 (85001 week d49, 85003 d98). Third-bond day read from the weekly village census (±7 days) plus final census links.
- L1 stay-green: national ≤ d140 on ≥ 2/4 seeds (same bar as r30/r31; r31: 1/4, 85001 d77).
- L5 stay-green: every ending voiced in full, class named (scatter vs die-out vs alive-at-cap).
- M4 people: d90/d120 transcripts read in full; meaningful = NPC wants something, options engage/deflect, endings resolve/plant/owe; no fabricated shared history. Driver-picker artifacts named as driver, not content.

## What would count as interesting

- 85004 bonds move and/or its pilgrimage completion rate jumps: the gate was the freeze; courting while poor works in-game, and the standing policy's conservatism was the blocker, not the game.
- Courtship runs while poor but bonds do NOT move: the bottleneck is elsewhere (opinion gain rate, trust slide, village count) — the gate drop buys activity, not progress.
- Courting while poor HURTS (pantry collapse, earlier scatter, trust slide on new links): the gate was load-bearing after all, and the policy's caution is vindicated — report as a NO-GO for dropping it, not as a failure of the run.
- A 3-bond seed reaches national or misses on the seasoned bar (age ≥ 30 AND trust ≥ 40, SCALE.md): the seasoned-trust bar becomes the next named bottleneck, as r31 predicted for 85003-type seeds.

## Metric review (to fill after the run)
