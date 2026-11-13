# journey-scale r195 — ADOPTION COORDINATOR NOTE (Lane A, leg 3 SCALE)

**Run:** `playtest-loop-a-20261113T1927Z` (scheduled 12:45 CST, timed out;
adoption coordinator, no panel re-run, no re-design).
**Base at run:** `e2e35630c`. **Master at adoption:** `340c6679a`
(culpritbisect round 12). **Merged HEAD:** `7982d7ba4`.

## What the run did (stands, not re-judged)

Panel seeds 135101–135104, DAYCAP=140: national 0/4, regional 4/4,
survived 1/4, wave-5 0/4, lesser seat priced 4/4. Q1 NATIONAL NO-GO with
a named per-seed blocker (135101 one seasoned subordinate short of LEAD
2/3; 135102/135103/135104 COLLAPSE before national). No `src/js` change:
three analyzer bugs fixed in the instrument, pinned by proof 29/29.
Full verdicts in `evidence/2026-11-13/journey-scale-r195.md`.

## Gate — the blocker, identified and adjudicated

The run's gate output was lost to `tail -30`. Adoption re-ran
`node scripts/check.js --quick` in full, output saved to
`evidence/2026-11-13/journey-scale-r195-gate.log`: **335 passed, 5
failed in 750s — GO after adjudication, 0 attributable.**

| Failure | Verdict |
|---|---|
| `test-measurement-proof-update.js` (exit 1) | Pre-existing staleness — fails identically on master by read-only run. Proof refresh rounds 11+12 owed. |
| `test-measurement-workflow.js` (8 passed, 1 failed) | Pre-existing staleness — identical 8/1 on master by read-only run. |
| `test-phone-frame-proof.js` (3 passed, 3 failed) | Pre-existing stale receipt — identical 3/3 on master by read-only run. |
| `test-living-garden-deed-attainment.js` (120.1s timeout in gate) | Load artifact — exit 0 standalone. |
| `test-one-person-army-deed-attainment.js` (120.1s timeout in gate) | Load artifact — exit 0 standalone. |

No sibling gate was running during the re-run (pgrep clean before
launch). The branch changes no `src/js`, so no failure can be
attributable to it.

## Adoption steps (verified)

- Heartbeat `journey-scale` first and throughout (REGISTRY.lock
  contention delayed one call ~7 min; heartbeat landed).
- Tree verified: 3 run commits + adoption commit, clean.
- Rebase onto explicit master `340c6679af8d435aaea93415cb00bdcdd2957645`:
  clean, no conflicts, no stop-at-pick quirk. Rebased tip `7982d7ba4`
  (`master..HEAD` = exactly the 4 branch commits).
- Proof re-run on rebased tip:
  `scripts/test-journey-scale-r195-analyzer-20261113.js` **29 passed,
  0 failed**.
- Telemetry re-check (scale.json baseline, trust corpus):
  same 2 LOUD lines as the run found (fightsTotal -75% 446→112,
  fightsByWave.4 -75% 289→72; maxGameDay quiet). Run's investigation
  stands (collapse + flee-behavior + 4-seed band noise); baseline NOT
  rolled.
- Merge `--ff-only` `340c6679a..7982d7ba4`, exit 0, verified HEAD +
  ancestor separately. No push, no version bump, no live claim.
- Safe-commit index clobber struck the adoption commit (D/MM/??);
  repaired with `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info`; status empty, diff empty, hash matches HEAD.
- Release: `worktree-release.sh journey-scale merged`; worktree removed
  (`--force`, exit 0); branch deleted (was `7982d7ba4`).
- Rotation: `journey-rotation-a.txt` 3 → 0.
- Lock `playtest-loop.lock` (run_id `2026-11-13T19:27:31Z`, verified
  against the run note in one call) deleted in a separate call.
- Orphan hbloop PID 167724 (`/tmp/journey-scale-hbloop-r195.sh`)
  killed by exact PID (verified by ps first); no hbloop survives
  (the one pgrep hit afterward was my own shell self-matching).
- Addendum commit on master (this file + run-note merge line):
  evidence-only, per the 1530Z precedent.
- No EPERM flap during this adoption.

## Carried (unchanged from the run note)

Daily-play chooser never takes invites (lane decision owed); tribute
ready-but-undelivered (r194's finding, echoed 0/7); belong-good-but-
realm-less (correct per canon); wave-5 door never opened; telemetry
fightsTotal baseline re-base (next run); proof refresh rounds 11+12.
