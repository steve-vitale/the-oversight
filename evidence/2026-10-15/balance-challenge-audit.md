# Challenge interpretation and survival levers — 2026-10-15

Steve's latest direction: winning should be difficult. A decline in win rate
requires investigation and consideration, not an automatic regression judgment.

## Change and limits

`won` now has neutral direction plus bidirectional material-change review.
An absolute paired mean movement above 0.02 produces change_watch, or
change_signal when the exploratory 95% interval excludes zero. Both request
review; neither labels lower wins worse or higher wins better. Better/worse
counts are null; increased/decreased counts and raw paired results remain.
Other metrics retain their existing review thresholds. No gameplay cost,
reward, health, enemy or gate value was tuned by this change.

`docs/SURVIVAL-LEVERS.md` records the mechanism, source, costs and diagnostic
questions for each lever, plus the evidence/decision log and upkeep procedure.
AGENTS.md, MEASUREMENT-PLAN.md, SIMULATING.md and BALANCING.md direct both agents
to it. Steve's exact words are retained in the primary godpath canon. Historical
win quotas are retired. Old raw reports are preserved with their original
contract; their win-regression statuses are historical, not today's judgment.
Rerun both roots with the new observer/contract before comparing again.

## Verification

- Primary quick: 157/157; full: 929/929. Logs retained alongside this note.
- Focused scorecard: 27 assertions including declining/increasing win rate,
  uncertain movement, unchanged wins and independent food-security warnings.
- Source identity: three assertions, exercised on the main checkout and on a
  linked worktree with a `.git` file; nested source directories stay unknown.
- Maintenance hook: six checks with a fresh real four-policy seed-7 panel.
- Primary and shared game roots each ran all four default policies, observer
  on and off: eight full jobs per root, all rows and full gameplay hashes
  matched, no warnings/errors, stable source manifests. Retained panels are
  a neutrality smoke test, not a difficulty/balance estimate.
- Shared tooling quick: 95/97. Existing failures are sprite validation and
  stranger where-dialogue (`test-sprites-valid-20261014.js`,
  `test-where-are-we-20261014.js`). No tests were weakened or quarantined.
  The prior shared full net was 821/868; it was not rerun for this update.
  PR #1 stays draft; the shared game suite is not claimed green.

## Archive provenance correction

A frozen source archive inside the primary `.git` previously inherited the
surrounding checkout HEAD, because git walks to parent directories. The runner
now queries HEAD only if the specified source root has its own `.git` entry;
archives report null, retaining their complete normalized content manifest.
A real one-day capable/seed-7 CLI replay against the same frozen source proved:

- Old label: 3de7453d2c53ec2471ce62a6073118dcb076e567, though frozen game was
  based on 6c5211684c1cd8e6f70d86704050b4b10e371f7d plus the named feeder files.
- New label: null. Source manifest, standard row and full gameplay state hash
  were identical before/after. New observer on/off proof also passed.
- Both raw replay panels and exact old/new measurement source bytes are retained.

The earlier gift comparison was collected while its enclosing HEAD still
matched the frozen base; its content manifests and retained source bundle remain
the authoritative identities. No historical measurements were silently relabeled.
