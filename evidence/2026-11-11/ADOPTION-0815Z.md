# convfirst-a adoption — fleshout-20261111T0815Z (timed out, main-session inspection 2026-11-11 ~10:20 UTC)

## Verified by the main session (not the worker's word)
- Proof test `scripts/test-convfirst-a.js`: **17/17 PASS, exit 0** (re-run 10:20 UTC).
- Uncommitted diff: 4 files, 516 insertions / 35 deletions
  (`convfirst-instrument`, `convfirst-driver`, `convfirst-analyze`, `test-convfirst-a`).
- Pilot round 1 (worker's numbers, NOT re-run): control 8/8 valid; neutral 4/8
  (flap killed seed 190205). Headline: 893 talkTo opens, 0 turns, 0 answers,
  32 confessions; v2 classification: 62 unclassified sources -> 0, 55 unknowns -> 2.
- trustfirst-a worker is DEAD (no processes, heartbeat 08:31:55Z, tree CLEAN —
  no uncommitted work, nothing to adopt). abilityfirst-a never registered
  (branch at 5bb3c595a, clean, 0 commits — nothing to adopt).
- Lock `fleshout-loop.lock` (0815Z, 08:17:04Z) and claim
  `lever-claims/fleshout-20261111T0815Z.json` are STILL LIVE — left in place
  deliberately so the next Loop A occurrence sees the axis as claimed and does
  stale-lock recovery itself.

## Still owed (next Loop A occurrence owns this)
1. PlayerDeath purge wrap on the v2 instrument (the worker stopped before it).
2. Commit via the worktree's own safe-commit.sh (flap-gated — probe first).
3. Pilot 2 re-run on the committed instrument.
4. Evidence file `evidence/2026-11-11/sim-convfirst-a.md` (run note + metric review).
5. Gate + ff-only merge + release + tracker update + claim retirement
   (retire the 0815Z claim to .DEAD at closeout, per the 0630Z precedent).
6. Restart trustfirst-a as a fresh arm (its worker produced nothing).

## Do NOT
- Do not re-run pilot 1 — the v1 corpus is in `evidence/2026-11-11/perseed-convfirst-a/`
  (12 files) and the v2 classification numbers above already supersede it.
- Do not delete the 0815Z lock/claim from any other session — the adopting run
  owns that step.
