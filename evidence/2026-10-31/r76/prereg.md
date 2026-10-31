# Journey social r76 — PREREGISTRATION (lane B, 2026-10-31)

Leg 5 (social life). r75's named-next, adopted verbatim from its metric
review + run note, not re-scored: (1) post-ending starts stay uncaught
for stuck/end-blocked endings — r76 measures the post-ending window
over ALL ended favors, not just stuck ones; (2) partner-away is the
dominant dawn wall (21/39 in r75) — r76 owns the away question: where
do partners go at dawn, can the player meet them there, or is waiting
the honest play?; (3) walk + retry promotion question (r74's
named-next, now ripe) — delivered as a DECISION NOTE in the run note,
NOT implemented: folding driver moves into policies/competent.js is a
behavior change for a decision, not a silent move; (4) moots escalate
from watch item to named question: 0 on all 12 seeds across r73+r74+r75
— is a moot convenable at all under this driver, or is the trigger
never met?; (5) lure acceptance 15% (3/20) stays a watch item.

## What changes in r76 (driver policy + recording only, ZERO src/js)

- Wedge fork scripts/journey-social-r76-outing-wedge.js: r75 verbatim
  EXCEPT dawnDiag gains the away record when one exists: awayPurpose,
  awayReturnDay, awayReturnPart, awayNode {nx, ny} (pure reads of
  v.away[vid] = {nx, ny, purpose, returnPart, returnDay}; no movement,
  no RNG, no behavior change).
- Driver fork scripts/journey-social-r76-20261031.js: r75 verbatim
  except (a) fresh seeds + evidence dir; (b) ARMS: 6601/6602 'linger'
  = r75 policy verbatim + recording-only additions; 6603/6604
  'mootprobe' = linger + the moot probe below; (c) RECORDING-ONLY
  additions on both arms: daily change-only case snapshot
  (Game.betrayalState().cases rows: id, status, charge, accused
  names, target name, playerRole, knownToPlayer, mootIn, trial
  present) and a per-convo betrayal-offer scan (every betrayal:*
  choice offered, first-seen turn, moot offers split out); (d) MOOT
  PROBE (probe arm only): when a betrayal:moot:<caseId> choice is
  offered and that caseId has not been probed this run, pick it once
  (after the favor-accept block, before gossip/ans/linger), record
  the pick + caseId; at most one probe pick per case per run, so
  trial perturbation is bounded. The probe consumes a convo turn
  and may convene a trial — arm comparisons are descriptive, NOT a
  balanced-panel claim (arms differ by construction, RNG streams
  differ).
- Analyzer fork scripts/analyze-journey-social-r76-outing-20261031.js:
  r75 verbatim plus case timelines, betrayal-offer census, moot-probe
  results, away census (purpose split, return-day distribution, node
  distance from home), and the post-ending repeat-start window.

## Run shape (r75 verbatim otherwise)

Fresh seeds 6601-6604, smoke 6605 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON.

## Bindings (a miss is NO-GO, never re-scored)

- B1 (moot census): every seed's per-seed JSON carries caseSnaps
  (change-only daily case rows, plus a final row) AND
  betrayalOfferConvos. The analyzer reports case timelines + offer
  counts per seed. A seed missing either census is a binding miss.
- B2 (away census): 100% of away start-blocks carry awayPurpose,
  awayReturnDay, awayNode. The analyzer reports the purpose split,
  return-day distribution, and node distance from home. An away block
  without the away record is a binding miss.
- B3 (moot probe, probe arm only): every betrayal:moot offer on a
  probe seed is picked at most once per case, and every probe pick
  is recorded with caseId + outcome (moot convened or not, from
  mootsConvened delta + trial presence). Offered-0 on a seed is
  REPORTED, not failed: the surface never appearing is the finding.
- B4 (post-ending window): the analyzer reports, per seed, every
  ended favor (broken, delivered, or expired) followed by a later
  same-villager accept that started, with day gaps. An unreported
  window (endings exist, no start window examined) is a miss. No
  "gate freed" claim without a caught start.
- B5 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending.
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r73/r74/r75, zero new, adjudicated by name. Lure acceptance:
  watch item. Moots: reported, not celebrated without a read.

## Decision note (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold into
policies/competent.js so every bot benefits. This run measures; the
note weighs the perturbation (walk/retry consume ticks, kcal, and
ensure-RNG) against the gain (starts 51%, delivers 89% in r75) and
recommends a lane, but changes NO policy file.
