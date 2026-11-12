# sim-eldergrammar-a — veteran-monster say-line grammar fix (2026-11-12)

Loop A run fleshout-20261112T1315Z. Axis: scale-onramp. Tracker blank #6 from
the 2026-11-12 1218Z review; sim-findings.md line 2281 (Loop A arm
sim-stallcut-a, evidence/2026-11-12/sim-stallcut-a.md §6).

## The blank
The veteran-monster say line read: "This one is different — old, patient,
unhurried — it has seen your kind before. **A Elder** veteran." — "A Elder"
must be "An Elder". It fired 3 times on the stall-cut band (seeds
190391/190396/190397).

## What changed
- `src/js/game.js:35284` (one line, in `startCombat`): the veteran-variant
  say template now picks the article by variant —
  `${veteranVariant === 'elder' ? 'An' : 'A'} ${vNames[veteranVariant]} veteran.`
  The template is shared by all three veteran variants (scarred / elder /
  pack-leader); only "Elder" starts with a vowel, so only the elder branch
  changes. "A Scarred veteran" and "A Pack-leader veteran" are untouched and
  verified still correct by the proof test.
- `scripts/test-eldergrammar-a.js` (new): proof test, drives the real
  `startCombat` veteran path via the shared harness (`sim-harness` /
  `godpath/lib.js`), forcing each variant roll in turn through the feast-draw
  veteran flag.

No canon doc covers veteran-monster say lines: docs/MONSTER-WAVES.md mentions
veterans only as living-roster kill counts (line 398), not as narration. No
canon invented; this is a one-word grammar correction to an existing line.

## Proof result
`node scripts/test-eldergrammar-a.js` — 7 passed, 0 failed:
- elder variant emits "old, patient, unhurried — it has seen your kind
  before. An Elder veteran."
- scarred variant still emits "A Scarred veteran"; pack-leader still emits
  "A Pack-leader veteran"
- no "A Elder" in any captured say line across all three veteran fights
- no literal "A Elder" remains in src/js/game.js

## check.js --quick result
`node scripts/check.js --quick` — 333 passed, 7 failed in 975s (exit 1).
All 7 failures are PRE-EXISTING and unrelated to this change (verified: none
of the 7 failing test files mentions "veteran" anywhere):
- test-measurement-proof-update.js + test-measurement-workflow.js — retained
  neutrality-proof freshness failures; the identical inner FAIL lines appear
  in the earlier evidence/2026-11-12/journey-endgame-r185-checkquick.log
  (335 passed, 5 failed), which predates this change.
- test-phone-frame-proof.js — stale phone receipt (index.html); the listed
  stale inputs do not include game.js.
- test-living-garden-deed-attainment.js, test-one-person-army-deed-attainment.js,
  test-occupation-panels.js, test-trust-observer-neutrality.js — all 120s
  TIMEOUTs, not assertion failures; the whole run took 975s vs 652s for the
  r185 run, i.e. a slower box tripped the per-test cap on two extra slow
  tests. (The first check.js --quick attempt in this run was lost to a
  runtime restart with an empty log; the re-run above is the recorded result,
  full output in /tmp/eldergrammar-checkquick.log.)
The proof test scripts/test-eldergrammar-a.js is not on the green list, so
check.js did not run it; it was run directly (7/7, above).

## Sim impact
NONE. Narration string only — no stat, rule, policy, or telemetry change, so
no sim re-run was needed and none was run.

## Finding (not chased, per assignment scope)
Other `A ${...}` interpolations elsewhere in the codebase (e.g.
examine.js:206 "A ${known}", game.js:3605 "A ${recipe.name}") are different
template families, not the veteran say line, and were not audited or changed
here. If a vowel-initial name ever flows through one of them the same slip
could occur — worth a sweep by whoever owns those templates.

## Follow-up for the coordinator
sim-findings.md line 2281 is to be marked `fixed` after this lands — not
edited here (that file lives in the goal hidden_files, outside the repo).
