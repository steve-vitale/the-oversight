# Pre-registration — sim-killconv-a (Loop A run fleshout-20261104T0215Z, axis scale-onramp)

DIAG-ONLY arm: zero src/js, no policy-file changes, no default flips,
no gate/price/deed/standing changes. A fix it specs is a future arm,
not this one.

## Primary metric
Kill-conversion census completeness + killer trace completeness on
the pilot.

## GO threshold (DIAG-GO) — all must hold on the 8-seed pilot
Seeds 99101–99108, policy scripts/policies/competent.js `{competent}`
VERBATIM at this anchor, default env, horizon 140 days death-aware
(per docs/MEASUREMENT.md §§9–12, 14–15):
(a) every TB exposure classified (kill / fighter-died / fled /
other) with 0 unclassified;
(b) every killer traced to end of run with a named death cause or
alive status;
(c) one named conversion lever with numbers;
(d) sense-test: at least 3 fight transcripts read and judged for
meaning (does a kill read as a person winning a fight? does a
death read as a fight lost, not a silent counter?).

If pilot GO, confirm on +8 seeds (99109–99116, same policy/horizon)
and check the census is stable. If pilot fails any leg, report
DIAG-NO-GO with the failing leg named — do not re-score against a
friendlier metric.

## Calibration (before the judged leg)
Re-run the baseline leg on current master first: the unmodified
tbfinish driver on seed 99107, compared against the 2315Z
tbfinish/ready5 anchor numbers for that seed (38d, village-lost,
0 wave-4 spawns, 0 TB, 0 kills, maxWave 3). If it diverges, the
judged baseline becomes whatever the pilot leg measures — stated
in a prereg addendum and in the evidence — and tbfinish numbers
are NOT cited as the baseline. Master has moved since 2315Z
(Loop B 0046Z, goals/journey landings), so divergence is expected.

## Balanced panel (§15)
N/A for a diag-only arm with no variant — no comparison is
fabricated. The instrument is the census; the pre-registered
threshold above is the judge.

## Instrument additions over tbfinish (scripts only)
- Round-1 capture: pending buffer for opening-pass actions during
  startCombat, attached to the exposure as openingActions (the
  2315Z pending-buffer spec). If it fails, round 1 stays bounded
  as in 2315Z (closing move, zero strikes/damage) and the miss is
  named, not papered over.
- Field-fight decomposition: fieldFight pre/post wrap capturing
  the returned record (outcome, rounds, vTaken, mDealt, HP left,
  log), fighter gear, kill rows fired during the call, and death
  events during the call.
- Killer tracing: tele 'death' hook (as ready5) stamped with the
  enclosing field-call id / TB exposure seq; end-of-run living
  check per killer vid.
- Zero-turn scripted routs pre-registered as a non-exposure class
  (2315Z suburb orphan lesson): an orphan tbEnd with zero turns
  and an untouched monster is classified 'scripted-rout', not an
  unclassified exposure.

## Evidence
evidence/2026-11-04/sim-killconv-a.md with header (primary metric,
GO threshold, horizon + why, seeds, policies), calibration section,
census tables, killer traces, named lever, sense-test, metric
review, findings list. Proof: scripts/test-killconv-20261104.js,
green before reporting done.
