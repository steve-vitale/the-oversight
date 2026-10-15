# Shared measurement publication — 2026-10-15

The `codex/balanced-measurement` branch is based on regional master
`15614d035c9ea7caa77310cc0a678cd303fa4800`. It contains tooling, evidence,
agent instructions and LF checkout settings. It changes no src/ or index.html
Git objects and imports no Codex regional/godpath gameplay changes.

Read `docs/MEASUREMENT-PLAN.md` (including Use from Muse's working branch),
then `docs/SIMULATING.md`. The branch keeps master's capable policy, adds
maker/merchant/caregiver and their missing public cooking helper, and carries
the standard driver's region selection and pending-choice handling. Profiles
are mixed campaigns, not pacifist challenges. Use identical policy/harness
versions on both roots; create a fresh baseline on the actual game/region.

## Proof

- The complete feature branch was pushed at `9bfe9b53`: quick 154/154,
  full 926/926, with 23 focused scorecard assertions and six upkeep assertions.
- The shared package ran all four default policies for seed 7 over 150 days.
  All four observer-on/off pairs matched standard rows and gameplay hashes,
  with zero warnings or observer errors. All eight full job records are retained
  in `balance-shared-observer-proof.json.gz`. Repeating the command reused eight
  cached jobs. This is an execution/neutrality smoke test, not a balance screen.
- Shared master lacks food-intake receipts; usefulIntake is explicitly unknown
  in every cohort. The feature census retains available/unreached methods.
- `check.js --only balance` passed both discovered scripts; the upkeep check
  passed separately. Quick: 94 passed, two failed. Full: 821 passed, 47 failed.
- Frozen unmodified master: quick 91 passed, three failed; full 812 passed,
  54 failed. The two candidate failures absent from that one baseline run are
  legacy unseeded setup checks (`test-kgate-audit.js`, `test-past-deflect-gate.js`).
  Running each on both roots with seeds 7, 42 and 99 produced identical output
  and exit status in all six comparisons. Both scripts reproduced their setup
  failures on baseline. These are diagnostic controls, not a repaired test suite.

The shared full game suite remains red. Its remaining failures are retained,
not quarantined or weakened. See `balance-shared-validation.json` and the
baseline/candidate full logs for exact failure lists and SHA-256 provenance.
LF checkout settings eliminate several platform-dependent failures but do not
repair content/knowledge/legacy fixture problems in Muse's game.

## Keeping it current

AGENTS.md directs both agents to use the vector of per-playstyle guardrails.
check.js automatically discovers the scorecard tests and the fast measurement
maintenance check in quick/full mode. The latter checks the actual retained
neutral panel, metric coverage and normalized collector/contract fingerprints.
Changes need a fresh neutral proof; SIMULATING.md gives the update procedure.
Case content/result hashes prevent stale or corrupted cache reuse. Disjoint
shards merge only with matching source, observer, contract and configuration.

The 16-seed feast calibration uses its own recorded runtime/policy lineage.
It found worse outcomes across the four mixed policies; do not cherry-pick a
win headline or compare it directly with the shared master smoke. Confirmation,
fixed exposure windows, opportunity-conditioned contest/show cohorts, landed
ability effects, NPC parity and human playtests remain on the measurement plan.
