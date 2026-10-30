# sim-sicktick-b — PREREGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-sicktick-b (DIAG ONLY).
Parent: loop-B arm sim-starveplenty-b, run fleshout-loop-b-20261030T1030Z,
evidence/2026-10-30/sim-starveplenty-b.md, observation 3 + wound probe
evidence/2026-10-30/sim-starveplenty-b-wounds-9983.json.

## Question

On seed 9983, villager gen_a29exbk's sickness tick steps up from −3/day
to −5/day in the starving phase (days 37–38), cause label 'sickness' in
both phases, unexplained by the meal trace. Is the step-up a real
condition/phase change, or a labeling artifact of two different ticks
sharing the 'sickness' label?

## Code hypothesis (read BEFORE running; judged against the recorder, not assumed)

The only villager-sickness hurtVillager caller is villageSicknessTick
(src/js/game.js, ~line 31585): sickDmg = max(1, 1 + severity*2 −
(healer ? 1 : 0)). Attainable values: sev1 → 3 (no healer) / 2 (healer);
sev2 → 5 (no healer) / 4 (healer). A −3→−5 step is therefore NOT
explainable by a healer arriving/leaving alone, and NOT by any
starvation term (the formula has none). The live hypotheses are:
(H1) severity-1 record expires and a NEW severity-2 record starts
(wound fever at hp<40, or gut rot from dirty water — the tick's own
vector phase, candidates exclude the already-sick, so a new record
requires the old one to be gone first; day 36 has NO sickness row
for gen_a29exbk in the wound probe, a gap consistent with H1);
(H2) the same record's severity is raised in place (no in-tick code
path does this — treatment only LOWERS severity — so H2 needs a
named writer or it falls);
(H3) labeling artifact: two different ticks sharing 'sickness'
(e.g. villageSicknessTick vs a status-engine tick) — the recorder
captures the call stack of every sickness hurt row, so H3 is
decided by caller identity, not by damage values.

## Primary metric (pre-registered)

Day-level attribution table for gen_a29exbk on 9983, days 28–39:
per sickness hurt row — day, damage, cause label, caller (stack),
sick record at that tick (name, severity, daysLeft), healer
present (haven/here), starving that day (any starvation hurt row
for the same vid that day), village hungryDays snapshot. The
step-up day must show WHAT changed versus the previous sickness
tick: record identity (same vs new, by daysLeft continuity),
severity, healer, caller.

## DIAG-GO threshold (pre-registered, binds this run)

DIAG-GO iff BOTH hold:
(a) the step-up reproduces on 9983 under the recorder with
    day-level attribution naming the cause (a specific
    condition/phase transition/code path), AND
(b) the same attribution holds on at least 2 other seeds showing
    a −3→−5 (or equivalent damage-increase) sickness step.
OR a proven refutation: no step-up on re-run with the recorder,
with the reason the earlier read differed (e.g. recorder shows
the wound probe's −3/−5 rows came from different callers, or
the trajectory moved and why).
No re-scoring mid-run; metric doubts go under "metric review".

## Horizon, seeds, policies

- Horizon: death-aware, 180d cap (9983 ends day 39 village-lost;
  fresh seeds run to village-lost or the cap, same as the
  starveplenty census).
- Seeds: 9983 (reproduction) + fresh band 10101–10108 (8 seeds,
  never used by the starveplenty census). If fewer than 2 fresh
  seeds confirm, extend the band in blocks of 8 and say so;
  do NOT shrink the band or cherry-pick confirming seeds.
- Policy: competent (scripts/policies/competent.js), same as the
  parent arm. One process per seed, sequential.
- Instrument: scripts/trace-sicktick-b.js — record-only wrappers
  (hurtVillager, villageSicknessTick, filtered say lines). No RNG
  rolls, no state initialization inside wrappers. Fidelity gate:
  9983's death sequence must still equal the wall corpus /
  wound-probe deaths exactly (14 deaths, same day/kind/who/cause),
  else the recorder perturbed the trajectory and the run is void.
- Analyzer: scripts/analyze-sicktick-b.js — builds per-villager
  sickness-damage sequences, flags every damage increase between
  consecutive sickness ticks, and classifies each by record
  continuity, severity change, healer change, caller change,
  gap days, and starving flag.

## What counts as "equivalent" step

Any increase between consecutive sickness hurt rows for the same
vid (e.g. 2→4, 3→5, 4→5) counts for clause (b) PROVIDED the
analyzer classifies it with the same mechanism as 9983 (same
record-transition shape). A step with a different shape is
reported separately, not counted as confirmation.

## DIAG scope

Zero src/js changes, zero policy-default flips, zero game changes.
This arm documents the named next fix; it does not land one.
