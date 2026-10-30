# sim-raidname-reproof-b — drift re-proof of the landed raidname-collision arm

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0049Z,
axis food-economy, arm sim-raidname-reproof-b. MEASUREMENT ONLY:
zero game-code changes, zero default flips, zero new proof legs.
The COLLISION_TRACE-gated instrument scripts/fightorigin-trace-b.js
was NOT flipped on (default OFF throughout; the landed proof was
run exactly as documented, with no COLLISION_TRACE env set).

## Verdict against the pre-registered GO threshold (binding)

**GO — MECHANISM-PROVEN / FREQUENCY-OPEN still stands on current master.**

- Full proof green on the worktree's current-master base, and the
  census-level conclusion is unchanged: both misfire mechanisms
  still fixture-proven, no new collision class appears, and the
  committed v2 census reproduces exactly under an independent
  analyzer re-run (output to /tmp, not committed).
- No base drift detected. This is a clean re-proof, not a
  diagnosed-drift result: nothing failed, so no drift diagnosis
  was needed and no verdict falls.

## Canon status (stated, not invented)

docs/CANON.md read first. No canon doc covers raids, raid
narration, or palisade sleep (same finding as sim-raidname-b,
sim-raidguard-b, and sim-raidname-collision-b; the raid rule
lives only in a havenGrowth.js header comment). This arm
invents no canon: it re-runs the landed proof, it does not
re-litigate the mechanism.

## Base

Worktree HEAD at proof time: 60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479
(journey establishment r60: panel driver + analyzer; measurement
only, zero src/js). This base postdates the arm's landing
(a051538aa) and includes the journey and gaps2 lanes that landed
since — the exact drift surface this re-proof was ordered to
check. The arm's landed files (proof, analyzer, instrument,
corpora, analyses) are present on this base unchanged.

## Proof run (full suite, landed proof, unmodified)

Command (from the arm evidence, verbatim):

```
node scripts/test-raidname-collision-b.js --corpus
  evidence/2026-10-29/sim-raidname-collision-b-corpus
  --base-corpus
  evidence/2026-10-29/sim-raidname-collision-b-corpus-off
  --analysis
  evidence/2026-10-29/sim-raidname-collision-b-analysis.json
```

**RESULT pass=33 fail=0 skip=0, exit 0**, identical to the
arm's landing run (33/0/0). Breakdown, all green:

- T-B1 (9 pass incl. preconditions + controls): non-raid
  pending resolving while a same-species raidBorn lingerer
  sits on the player tile still says the raid line
  (species misfire, mechanism proven); control without a
  raidBorn tile entity says no line; genuine raid pending
  says the line and consumes its shadow (correct case).
- T-A1 orphan chain (10 pass incl. control): mismatch
  fight clears the raid pending but KEEPS the shadow
  (orphan created); a later non-raid same-species pending
  then says the raid line via the orphan shadow (mechanism
  proven) and consumes it; matching first fight consumes
  the shadow, no orphan (control).
- T-ORIGIN (6 pass incl. preconditions): direct tile
  fight against a raidBorn entity says the line; against a
  non-raid entity says none — the analyzer's origin model
  still validates.
- T-CORPUS (8 pass): instrument integrity (shadowLog +
  collision fields present on all ON files/creations,
  bad=0); OFF/ON neutrality deep-equal 8/8 pilot files;
  pilot move counts match the raidname band (bad=0);
  shadowLog records 65 raid shadow sets; analyzer
  invariants (collisions list == totals 0 == 0;
  A + B == collisions 0 + 0 == 0; oppB list == totals 0;
  oppB fired + not-fired == oppB 0 + 0 == 0).

`node --check` clean on scripts/test-raidname-collision-b.js,
scripts/analyze-collision-b.js, scripts/fightorigin-trace-b.js.

## Census re-run (independent analyzer pass, /tmp output)

```
node scripts/analyze-collision-b.js --corpus
  evidence/2026-10-29/sim-raidname-collision-b-corpus
  --out /tmp/reproof-analysis.json
```

Re-run totals are byte-for-value identical to the committed
v2 analysis (totals block, collisions list, seeds list all
equal). Judged numbers, unchanged:

- Fights 134 (123 creations + 11 ended-inside attempts);
  raid lines 95, all same-raid; unclassified lines 0.
- Collisions: A 0, B 0, total 0. No new collision class.
- Opportunities: OPP-B 0, OPP-A-WINDOW 0, distinct pending
  pairs 0. Shadows: 65 set, 65 consumed, 0 overwrite-cleared,
  0 live-at-end, 0 other-cleared. Dawn-raid mornings 61.
- Provenance: raid-pending 65, tile 65, contest 4.

The census-level conclusion is therefore unchanged: the
caveat is real (fixtures prove both misfires given their
configurations) and it fired zero times on the 40-seed band,
with zero risk opportunities on that band. The arm's named
next step stands as written and is NOT this arm's work: a
TARGETED leg staging the B1 configuration in live sims
(raidBorn lingerer held on the haven tile while a
same-species non-raid pending resolves), counting
B-collisions per staged configuration. More blind seeds
remain NOT the next step.

## Drift check (what moved since the landing, and whether it mattered)

Landings between a051538aa and this base include the
journey establishment r60 panel driver/analyzer and the
gaps2-returns evidence/analyzer work (both measurement-only,
zero src/js per their commit messages), plus loop A's
shoutrec landing already present before this base. None of
them moved the proof: fixtures stage their configurations
through the same harness paths and produce the same lines,
and the corpus legs read committed files, so the corpus
invariants cannot drift except through the analyzer or
instrument — both unchanged on this base. No game-affecting
landing in this window touched the raid-shadow or
_originIsFighter paths, and the green run confirms it
behaviorally rather than by commit-message inspection
alone. No src/js file was changed, opened for edit, or
needed by this arm.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the task's pre-registered GO bar:
  full proof green on current master AND census-level
  conclusion unchanged. Both hold; no re-scoring, no
  threshold moved mid-run, no assertion loosened (repo
  rule honored: the proof ran unmodified and passed
  unmodified).
- No revision proposed for the next run's metric. The
  only open item is the arm's own named next step
  (targeted B1-configuration leg), which needs its own
  prereg before it runs.
- No balanced-panel compare .md: same pre-registered
  analogy as the arm — a 30-day diagnosis leg whose panel
  metrics (national / table / wins) cannot be observed
  inside 30-day instances. The judged instrument is the
  proof + census, and both are green/unchanged.

## What was NOT done (scope discipline)

- No new scripts/test-*.js leg: none was genuinely needed;
  the landed proof covers both mechanisms, the origin
  model, neutrality, and the census invariants.
- No corpus regeneration: re-running blind seeds would
  answer a question the v2 band already answered, and
  the task orders a re-proof, not a new band.
- No src/js change, no default flip, no push, no version
  bump, no live verification. Coordinator merges via
  --ff-only; report is "merged locally, pending ship"
  once the coordinator lands it.

## Verdict (judged against the pre-registered bar): GO — MECHANISM-PROVEN / FREQUENCY-OPEN stands on current master (proof 33 pass / 0 fail / 0 skip; census 0 collisions, reproduced exactly)
