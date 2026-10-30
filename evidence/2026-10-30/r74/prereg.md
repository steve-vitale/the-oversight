# Journey social r74 — PREREGISTRATION (lane B, 2026-10-30)

Leg 5 (social life). r73's named-next, adopted verbatim from its metric
review + Q1/Q3, not re-scored: (1) record p.kept RAW, count kept only on
kept===true; (2) count completes from deliver EVENTS, never the
end-of-run ledger snapshot; (3) split forageBarren into node-barren vs
travel-blocked days, log travelTo's blockage on every failed jump;
(4) the no-micro-pos mechanism needs a position-history instrument
before any fix is proposed; (5) the r73 wedge's travel strategy is the
next blank (d=2-3 jumps refused on intermediate blockage, 3 targets/day,
no d=1 hop, no escalation when stuck).

## What changes in r74 (driver policy only, ZERO src/js)

- Wedge fork scripts/journey-social-r74-outing-wedge.js: (a) promiseKept
  is RAW everywhere (true / false / 'broken' / null) — the `!!` coercion
  is retired; (b) forage-leg travel: when a direct travelTo jump fails
  to arrive, the wedge step-walks toward the target (d=1 travelTo steps
  along a BFS path probed with travelBlockage) and logs walkAttempted +
  pathFound + blockage; (c) stuck escalation: a live outing with
  STUCK_DAYS=7 consecutive no-progress outing days is escalated at the
  next outing day — hop home, then the game's own forage_end action
  (status-gated, performForageFavor(vid,f,true)) if offered, logged
  'outing-ended-stuck'; if not offered, 'outing-end-blocked' with the
  status reason (logged on day 7 and every 7th day after, to bound
  spam); (d) 'forage-barren' entries carry barrenKind: 'travel-blocked'
  (0 nodes reached), 'node-barren' (>=1 reached, all barren), or
  'no-target'; (e) recordPosHistory: a once-per-day snapshot of which
  roster villagers currently hold a micro position (firstDay/lastDay).
- Driver fork scripts/journey-social-r74-20261030.js: r73 verbatim
  except the r74 wedge, fresh seeds, and funnel additions
  (completeOutingsEvents, keptMatchedStrict, forageBarrenTravel,
  forageBarrenNode, posHistory output). Snapshot completeOutings is
  KEPT only as the artifact comparison, never the judged count.

## Run shape (r73 verbatim otherwise)

Fresh seeds 6401-6404, smoke 6405 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON. Base master
6cec51d44 (r73 landed, merged locally pending ship).

## Bindings (a miss is NO-GO, never re-scored)

- B1 (travel): 100% of forage-travel-blocked entries carry
  walkAttempted=true, pathFound, and a blockage read; 100% of live
  outings reaching 7 consecutive no-progress outing days carry an
  escalation entry (outing-ended-stuck or outing-end-blocked) within
  1 outing day of day 7.
- B2 (kept raw): zero wedge log entries where the game line says the
  promise was missed while the recorded kept value reads true; every
  wedge log entry carrying a promise field carries the RAW value.
  keptMatchedStrict (snapshot kept===true) is reported alongside the
  deliver-event count with any gap explained, not hidden.
- B3 (completes): completeOutingsEvents (deliver events with
  deliveredKcal>0, counted once per favor) is THE completion count;
  it must be >= snapshot completeOutings (the snapshot can only
  undercount, per r73 Q4).
- B4 (position history): 100% of no-micro-pos dawn blocks classify
  as ever-before (partner held a micro pos on an earlier snapshot
  day) vs never-before (no earlier snapshot). No unknowns.
- B5 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending.
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r73, zero new, adjudicated by name.

## Questions (judged by the bindings, not by hoping)

- Q1: does the d=1 walk dissolve the 6304 stuck-outing class, or is
  the intermediate tile itself impassable (a real game wall)?
- Q2: once a stuck outing is ended, do later outings start (is the
  gate freed), or does end-blocked (adjacency) become the new wall?
- Q3: what does position history say about no-micro-pos partners —
  do they ever gain a position, and on what kind of day?
- Q4: with raw kept + event completes, what is the true kept/deliver
  picture (r73 corrected: 17 delivers / 21 starts)?

## Named next (not pre-judged)

Whatever Q1-Q3 show: if end-blocked dominates, the next run owns the
adjacency-at-home question; if walk dissolves travel blocks, the
next run owns whether the walk belongs in the base competent policy
rather than the wedge.
