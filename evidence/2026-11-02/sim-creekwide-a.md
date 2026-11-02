# sim-creekwide-a — WIDE SCREENING run for the creekwood 12-case confirm (follow-up to Loop A 1155Z, blank 1)

Run: follow-up to fleshout-20261102T1155Z, arm sim-creekwide-a, axis
scale-onramp. Worktree branch: sim-creekwide-a. INSTRUMENT/POLICY
ONLY — zero `src/js` changes unless a minimal fix is proven with a
proof test (none planned). Sibling trees/branches NOT touched;
food-economy axis NOT touched (sibling Loop B live on it).
Tracker/claim/lock/rotation files NOT touched (coordinator's).

Canon read first: docs/CANON.md, docs/MAP.md §1–2 (creeks
top-to-bottom, ~35% of creek tiles need a bridge or a swimmer;
bridge it, swim it, or go around; buildBridge = 4 wood + 60 kcal
+ 96 ticks), plus the 1155Z round evidence
(evidence/2026-11-02/sim-scale-onramp-round-1155.md) and the
creekwood arm evidence (evidence/2026-11-02/sim-creekwood-a.md).
No creek/travel canon doc beyond MAP.md §1–2 states the
bridge/swim/go-around rule — quoted, not invented.

## PRE-REGISTRATION (written BEFORE any new screen or judged run)

- Primary deliverable: a completed 300-seed screen of range
  97690–97989 (59 prior + 241 new) + a baseline classification of
  EVERY new tier2C_both nomination.
- Screen tool: scripts/creekwood-geometry-20261102.js, map-gen
  only, zero days run, one process per seed. The 59 prior seeds
  are NOT re-screened and NOT re-scored; the merged ledger must
  preserve all 59 prior rows byte-identical (proven by
  scripts/test-creekwide-screen-20261102.js).
- Tier rule (same as the prior screen, verified against the prior
  ledger before screening: derivation reproduces all 10 prior
  nominations exactly): tier2C_both = (5,4) needsBridge AND
  (6,4) needsBridge; tierL_64only = (6,4) needsBridge only;
  tierM_54only = (5,4) needsBridge only.
- Baseline full runs: scripts/creekwood-driver-20261102.js
  ARM=base, DAYS=180, frozen creekdetour stack, one process per
  seed. Run for every NEW tier2C_both nomination, plus any new
  nomination judged a plausible two-creek-wall case (reason
  stated per seed in the results).
- Classification (from the baseline record, same fields as the
  prior screen): never-located = lairTile null, 0 marches;
  arrived = reached true (way + day reported); bridge-blocked =
  >= 1 bridgeBlocked march day (a march day stopped by an
  unbridged creek on the lair path). A seed counts as a banked
  confirm candidate ONLY if its baseline full run fails to
  arrive AND its geometry is a two-creek wall (per the 1155Z
  case rule: lair heard + >= 1 march + 0 arrivals + >= 1
  bridgeBlocked day + lair tile a needsBridge creek, with the
  two-creek-series split reported separately).
- GO threshold for banking a confirm candidate: a seed whose
  baseline full run fails to arrive AND whose geometry is a
  two-creek wall. The confirm itself (creekwood arrival on
  >= 50% of confirm seeds) is a FOLLOW-UP run, NOT this arm.
  NO confirm rate is claimed from geometry alone, and NO
  confirm rate is claimed from unclassified nominations.
- Guardrails: no src/js changes; worktree contains only
  committed work at closeout; sibling trees untouched.

## RESULTS

(To be filled after the screen. If the screen finds zero new
tier2C cases, that is stated plainly here — a result, not a
failure — with the confirm-case yield it implies.)

## Metric review (for the NEXT run, not this verdict)

(To be filled at closeout.)

## Sense-testing

(Transcript notes for any full run that marches, filled at
closeout.)
