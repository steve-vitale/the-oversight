# journey-scale r31 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140)

Run id: oversight-playtest-loop-20261025T0207Z. Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
Base: master@2975c45d3 (pulled at run start).
Driver: scripts/journey-scale-r31-20261024.js (r30 driver, seeds + output names changed only).
Analyzer: scripts/analyze-scale-r31-20261024.js (r30 analyzer, names changed only).
Policy: scalecourt with ONE fix (see below). Pantry gate UNCHANGED.

## Leg question (from r30's metric review)

r30: pilgrimages 0/4, codex studies 0/4, on seeds where eligible below-bar
candidates existed all run (known, unlinked, opinion <10, codex unstudied).
Why did the climb verb never fire?

Root-cause hypothesis, found in code BEFORE this run's sims (not a post-hoc
re-score): the pilgrimage start gate in scripts/policies/scalecourt.js reads
the scholar's health as `s.hp` / `s.maxHp`:

    const s = Game.state.scholar || {};
    const hpPct = (s.hp || 0) / Math.max(1, s.maxHp || s.hp || 1);

But the scholar's hit points live in `scholar.health` (game.js: scholar.health
is synced from the fighter; max via `Game.maxHealth()`), and `scholar.hp` /
`scholar.maxHp` are never set. hpPct is therefore always 0, never > 0.7, so
no pilgrimage ever starts, no codex is ever studied by the policy, and
opinion can only climb on broadcast wins (+2). r30's "opinion climbs only on
broadcast wins" is thus a POLICY-ARTIFACT finding, not a proven game fact —
until this run re-measures with the climb actually running.

The fix (policy tooling only, zero src/js changes, zero game-bar changes):
read `s.health ?? s.hp`, max from `Game.maxHealth()` with fallback. The
>12,000 kcal pantry courtship gate is DELIBERATELY unchanged this run, so
any movement vs r30 attributes to the pilgrimage fix alone, not to
court-while-poor (that is a separate later arm).

## Design: matched worlds

Same seeds as r30 (85001–85004), same driver, same horizon (DAYCAP=150,
death-aware stop), same policy except the gate fix. Same starting worlds,
different policy: differences in bond timing are attributable to the fix
plus the divergence it causes, not to new world draws. A matched seed that
diverges early is still a matched comparison — report divergence, don't hide it.

PILOT GATE: seed 85001 runs first. If its pilgrimages == 0, STOP — do not
burn the other three seeds. Diagnose the walk/study path (travel, study
call, ctx persistence) and report the fix as failed.

## Pre-registered verdicts (binding, §14)

- F1 pilgrimage fix fires: pilgrimages >= 1 on >= 3/4 seeds AND climbStudies
  >= 1 on >= 3/4 seeds. r30 baseline: 0/4 and 0/4. A miss means the gate was
  not the (only) break — the walk/study path itself is broken — and the run
  reports that, it does not re-score F1 as "pilgrimages attempted".
- P1 third bond earlier: >= 3/4 seeds reach a 3rd covenant bond by d110.
  r30 matched baseline: 2/4 (85001 d83, 85003 d108; 85002 max 2 bonds, 85004
  max 1). Third-bond day read from the weekly village census (first week
  with covenant count >= 3; weekly granularity, ±7 days) plus final census links.
- L1 stay-green: national <= d140 on >= 2/4 seeds (same bar as r30; r30: 1/4).
- L5 stay-green: every ending voiced in full, class named (scatter vs die-out
  vs alive-at-cap — r30's wording lesson applied).
- M4 people: d90/d120 transcripts read in full; meaningful = NPC wants
  something, options engage/deflect, endings resolve/plant/owe; no fabricated
  shared history. Driver-picker artifacts named as driver, not content.

## What would count as interesting

- Pilgrimages fire AND bonds move earlier: the climb was the bottleneck;
  r30's d80–110 pace question gets a new answer, and Steve's pace call can be
  re-posed with a working climb verb.
- Pilgrimages fire but bonds DON'T move: the climb (+3 once) is too small
  against the opinion economy — the bottleneck is opinion gain rate, not
  verb availability. That points at broadcast frequency / aid / gifts, not
  at the pilgrimage code.
- Bonds move but national still misses d140: the seasoned bar (age >= 30,
  trust >= 40) or trust slide becomes the next named bottleneck — the run
  after this one, not this one, takes that up.

## Metric review (to fill after the run)
