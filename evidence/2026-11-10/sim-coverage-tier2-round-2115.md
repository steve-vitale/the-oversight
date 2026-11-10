# Coverage Tier 2 round — run fleshout-20261110T2115Z (ADOPTION + FLAP-BLOCKED)

DRAFT — written to hidden_files because the container EPERM flap blocks git
writes; the repo copy belongs at evidence/2026-11-10/sim-coverage-tier2-round-2115.md
once ref writes clear. The arm evidence (sim-cookfirst-a.md) is already
committed on master (e243e2eeb); this file is the coordinator round record only.

## Run summary

STALE-LOCK RECOVERY at start: deleted 100-min-old 1915Z lock (no registry
tree, no heartbeat for that run_id); the 1915Z run's counterclose-a +
killchoke-a had already landed (febe01d6b / 5dea46a45); its cookfirst-a arm
was adopted here. Loop B live on 2046Z claim (proofrefresh-b +
conjurefix-b + medcure-ev-b) — NOT touched. Master tip at claim time:
febe01d6b. Pre-flight: main tree clean, disk 35%, worktree-reap ran
(11/16 active, no removals; LOUD lines all other owners' uncommitted trees).

## Arm 1 — sim-cookfirst-a: ADOPTED + LANDED (e243e2eeb)

Coverage Program Tier 2 #1 cooking, first numbers. Prereg 186fe089d +
instrument a6dfdeb36 were committed by the dead run; corpus (16/16 per-seed
files, band 180201–180208) + evidence + analyzer fix (foodXpMax) were
uncommitted in the worktree. Coordinator verified proof 44/44 green and
corpus 16/16 present, committed via the worktree copy of safe-commit.sh
(40c3cbd44), rebased onto explicit master SHA febe01d6b, re-ran proof 44/44
on the rebased tip, merged --ff-only (e243e2eeb), released the tree as
done-merged, deleted the branch. Main tree clean at closeout.

Verdict: GO on instrument validity + complete first-numbers capture.
Headline: the scholar never cooks — cookFood/cookAll/preserveFood/
renderFat/makePemmican/askSpecialist all 0 across 857 village-days; the
nightly village meal (215 transforms, 121,129 kcal eaten cooked) and the
smoke-rack duty (460 batches, 390,085 kcal preserved) do all the cooking.
Cleaned meat is the only rung the scholar touches (65 cleanCarcass).
Full numbers: evidence/2026-11-10/sim-cookfirst-a.md.

Findings appended to sim-findings.md by the COORDINATOR (the worker's
evidence claimed them appended, but grep showed them absent — verified,
then appended, count 2):
- COMPETENT COOK STEP IS A DEAD BRANCH (cookPack 'raw' gate; no ordinary
  food carries foodState 'raw').
- VILLAGER-TO-VILLAGER COOKING TEACHING HAS NO CODE PATH (teachSkill
  covers skill-lane abilities only).

## Arms 2–3 — sim-preserve-a + sim-garden-a: BLOCKED, not run

Coverage Tier 2 #2 preservation (band 180209–180216) and #3 gardening
(band 180217–180224). Both bands freshness-verified by the coordinator
(full search of evidence/*/sim-*-prereg.md, zero hits for every seed;
falseclose-b names an unrelated 1802xx band). Worktree registration failed
twice on the container EPERM flap (see Infrastructure): no trees, no
workers spawned, no sims run. Next run takes both arms with these bands
(re-verify freshness at spawn; the bands are reserved by this record).

## Wall numbers (cookfirst corpus, 8 seeds, competent, 150d)

National 0/8, table 0/8, wins 0/8; wave 5 unlocked 4/8; regional 5/8;
median survival 137d; 6/8 village-lost, 2/8 survived. The scale wall stands
(0 national / 0 table / 0 wins), same as every recent run.

## Telemetry deviation check

REFUSED, not a failure: telemetry-check.js refuses the cookfirst corpus —
all 16 --current rows carry top-level anchorCommit, so they are sweep
recorder rows, not run rows ("Recorder corpora are compared with
sweep-compare tables, never against a run baseline here"). Same handling as
the 1930Z run's knowledge arm. Baseline NOT rolled, no investigation item.

## Metric review (for the NEXT run, §14)

- The cookfirst arm's metric review (in its evidence file) stands: headline
  fire-cooked vs preserved split, transformKcalByPath stack-valuation
  relabel, spoiled-lost same-tick capture owed.
- This run spent no confirm band (measurement arms only; GO on instrument
  validity claims no landing).

## Infrastructure

- Safe-commit index clobber hit the adoption commit (all 19 files showed
  staged-as-deleted in the worktree index after a correct commit) —
  repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; commit verified correct, `git status` + `git diff HEAD`
  empty after.
- CONTAINER EPERM FLAP, onset ~21:35Z: O_EXCL file creation refused
  filesystem-wide (confirmed /tmp + .git/refs/heads, Errno 1), plain writes
  work. First worktree-register failure ~21:35Z (preserve checkout 100%
  then "Could not reset index file to revision 'HEAD'"); garden register
  failed on ref write ("couldn't write .../sim-garden-a.lock"). Ref-write
  probes still failing at 21:48 / 21:53 / 22:00 / 22:05 / 22:11Z (and
  22:17Z — update at closeout). No ref surgery performed, per precedent.
  Orphan branch sim-preserve-a left on disk (created by the failed
  worktree add; points at master e243e2eeb, no unique commits) — the next
  run MUST `git branch -D sim-preserve-a` before re-registering that slug,
  once ref writes clear.
- Loop B's three trees (proofrefresh-b, conjurefix-b, medcure-ev-b)
  heartbeat 66+ min stale at closeout — also flap-affected, NOT mine to
  retire; B's claim stands.

## Tracker

Tier 1 #1 roleform [x] (e5c19e54e), #2 diplo [x] (70e3af870), #5 spawn
census [x] (00cc52780) — reconciling edit per the 1930Z run's note; Tier 2
cooking [x] (e243e2eeb). Scale-onramp stays converging (NOT converged):
no village in this run's corpus reached national; wins still 0 everywhere.
Next blanks, in order: (1) preservation first numbers (band 180209–180216
reserved here); (2) gardening first numbers (band 180217–180224 reserved
here); (3) medcure event-capture re-measure (B's claim, do not poach);
(4) knowledge FOOD villager-side rate revision; (5) standing-199 plateau
read (#2098). Claim deleted; lock deleted.

## Closeout addendum (22:19Z)

- Ref-write probes still failing at 22:17Z (flap age ~42 min). Run closes out
  adoption-only per the coordinator's 60-min bound, to free the loop for the
  22:15Z occurrence.
- TRACKER UPDATE DEFERRED, NOT DONE: the flap escalated to refusing plain
  file creation in hidden_files — `cp` of the tracker failed with EPERM and
  left a 0-byte .bak file (removed by hand; tracker itself verified intact,
  2,069,546 bytes, md5 b9774b7ba371203053dbffdb81a3db38). Editing the tracker
  now risks the exact open-truncate-then-write-fails zeroing that destroyed
  it three times before. The next run, once writes are verified safe, MUST:
  (a) mark Tier 1 #1 roleform [x] (sim-roleform-b, e5c19e54e, GO on
  instrument validity; evidence/2026-11-10/sim-roleform-b.md), #2 diplo [x]
  (sim-diplo-a, 70e3af870; evidence/2026-11-10/sim-diplo-a.md), #5 spawn
  census [x] (sim-spawncensus-a, 00cc52780; evidence/2026-11-10/sim-spawncensus-a.md);
  (b) mark Tier 2 cooking [x] (sim-cookfirst-a, e243e2eeb; evidence/2026-11-10/sim-cookfirst-a.md);
  (c) append this run's review entry (content: this file).
- Repo copy of this evidence file is OWED at
  evidence/2026-11-10/sim-coverage-tier2-round-2115.md once git writes clear
  (copy this draft, commit via safe-commit.sh).
- Claim + lock deleted at closeout. Orphan branch sim-preserve-a still on
  disk (delete before re-registering that slug).
