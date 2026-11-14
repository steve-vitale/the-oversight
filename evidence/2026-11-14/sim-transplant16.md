# sim-transplant16 — family 16 (js=0 merges, the last family) (Loop A, fleshout-20261114T2115Z)

Run: fleshout-20261114T2115Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant16-a, branch `sim-transplant16-a`, worktree
`~/workspace/worktrees/sim-transplant16-a`.
Prereg: evidence/2026-11-14/sim-transplant16-prereg.md (committed
b831a3ec7, BEFORE the subject was cut or any judged sim ran — the
pre-check ran during prereg preparation; see the prereg's ordering
note). Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md
§3 (H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + hidden_files/family15-grouping-prereg-2026-11-14.md
(closing note: family 16 is the last unmeasured family) +
evidence/2026-11-14/sim-transplant15f.md and its prereg (model for
merge-tree pre-checks, the tooling-resolution rule, and the STOP
clause).

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 1)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 16. No judged sim ran. Survived/8: unmeasured.
  Per-seed days: unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-16-subject`: cut at the far end and
  LEFT in place at 203a32775 (tree = the far-end tree; ZERO picks
  applied — pick 1 was attempted live and conflicted; the
  cherry-pick was aborted. No pick-1 commit exists).
- STEP t16-merges: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant16-prereg.md. Base: far end
203a32775 (GOOD 4/8) with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified). Seeds 190391–190398, 150d death-aware,
competent verbatim own-policy per step. Thresholds for the GROUP as
one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
STEP id; ≥3/8 NOT-CARRIER. STOP clause per the coordinator
tooling-resolution rule (decided 2026-11-14 ~10:00Z): a pick
conflicting ONLY on zero-src-reader tooling files
(scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json) resolves EACH such file with
`git checkout --ours` and continues; ANY other conflicted file
(any src/js, data, policy, docs, evidence, or test file) STOPS the
arm immediately, no hand-resolution, no narrowed re-run decided by
this arm.

## Family identity (verified at run start, before any sim)

- Pick 1: b9f64660c "Merge pull request #15 holdout-tradeoff-007e".
  Diff: 1 file — evidence/2026-11-08/prove-out-holdout.md (20/10).
  js=0.
- Pick 2: b74db6460 "Merge pull request #17 phone-fun-proof-master".
  Diff: 4 files — phone-fun-frame-736/844-r1.json (+2624/+2696),
  phone-fun-frame-r1.md (+5), scripts/phone-frame-proof.json
  (96/82). js=0.
- Pick 3: eb975a8a2 "Merge pull request #19 phone-fun-r2-master".
  Diff: 4 files — phone-fun-frame-736/844-r2.json (+2704/+2620),
  phone-fun-frame-r1.md (6/2), scripts/phone-frame-proof.json
  (6/6). js=0.
- Pick 4: 9f388a524 "Merge pull request #21 living-garden-deed-master".
  Diff: 4 files — living-garden-deed-attainment panel/log/md
  (+1262/+16/+54), scripts/godpath/test-living-garden-deed-attainment.js
  (+389). js=0.
- Pick 5: cd535096f "Merge pull request #23 bonds-goal-pick-probe-9cfc".
  Diff: 1 file — scripts/probe-bonds-goal-pick-20261108.js (+460).
  js=0.
- Pick 6: aa5d9ef92 "Merge pull request #24 heard-raid-danger-3a06".
  Diff: 2 files — evidence/2026-11-08/raid-danger-heard.md (4/1),
  scripts/test-raid-danger-heard.js (+46). js=0.
- Pick 7: b41bd6300 "Merge pull request #27 dawn-scoring-entry-7449".
  Diff: 3 files — dawn-pick-conflict.json (+114), .md (+49),
  scripts/probe-dawn-pick-conflict-20261108.js (+320). js=0.
- Pick 8: 230dba219 "Merge origin/master (#31 one_person_army
  attainment) into OVE-37 port". Diff: 4 files —
  one-person-army-deed-attainment panel/log/md (+1048/+16/+55),
  scripts/godpath/test-one-person-army-deed-attainment.js (+331).
  js=0.
- Pick 9: 18ed96788 "Merge pull request #49 phase6-role-census-01bc".
  Diff: 38 files, all additions, 2943 insertions — role-census
  panel/analysis + 32 one-line seed JSONs + analyzer/probe scripts.
  js=0.
- Pick 10: 3339c0195 "Merge pull request #50
  improvements-verify-evidence-f8e3". Diff: 8 files, 7744 insertions
  — improvements-verify panel (one binary .gz). js=0.
- Pick 11: da153118c "Merge pull request #119 ove-159-phone-refresh-01a5".
  Diff: 4 files — phone-ove159-frame-736/844-r1.json (+2583/+2592),
  phone-ove159-frame-r1.md (+12), scripts/phone-frame-proof.json
  (5/5). js=0.
- Pick 12: a628aeaf3 "Merge pull request #121 ove-161-capable-seed-65".
  Diff: 1 file — scripts/test-capable-bot-20261014.js (1/1, seed
  63 → 65 re-seed, no assertion changed). js=0. (Also the origin
  tip — the second parent of the merge e4dbe581b.)
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: b9f64660c → b74db6460 → eb975a8a2 →
  9f388a524 → cd535096f → aa5d9ef92 → b41bd6300 → 230dba219 →
  18ed96788 → 3339c0195 → da153118c → a628aeaf3 (positions 13, 14,
  15, 16, 18, 19, 22, 27, 46, 47, 49, 51 of 51).
- No pick touches src/js/standing.js, scripts/policies, or
  scripts/green-list.txt. None of the twelve is an ancestor of the
  far end (all verified with `git merge-base --is-ancestor`).
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy sha256 a7ff5c51… (same substrate as
  the bisect prereg).

## Merge-tree pre-check + live pick (the STOP)

- PICK 1 merge-tree prediction (base = pick's first parent
  e44b0206e, ours = far end 203a32775, theirs = b9f64660c):
  rc=1, tree 7c338f19a15d8ee0430560227bbc97b5a08e4498, conflicted
  files: EXACTLY ONE — evidence/2026-11-08/prove-out-holdout.md
  (stages 1 + 3 only: base blob aff0d5ec…, theirs blob d1b27ea5…,
  no stage 2). CONFLICT (modify/delete): "evidence/2026-11-08/
  prove-out-holdout.md deleted in 203a32775… and modified in
  b9f64660c…". PREDICTION: CONFLICT, NON-TOOLING → STOP.
- PICKS 2–12 have NO chained prediction (the chain stops at pick 1).
  Far-end-based reads, INFORMATIONAL ONLY: #17 clean; #19 conflicts
  on phone-fun-frame-r1.md (modify/delete) + phone-frame-proof.json
  (tooling); #21 clean; #23 clean; #24 conflicts on
  raid-danger-heard.md + test-raid-danger-heard.js (both
  modify/delete); #27 clean; #31 clean; #49 clean; #50 clean; #119
  conflicts on phone-frame-proof.json only (tooling — would resolve
  --ours); #121 conflicts on test-capable-bot-20261014.js (content,
  non-tooling). Full trees in the prereg. These are NOT predictions:
  a chained conflict set can differ from a bare-far-end set.
- LIVE PICK 1 (subject branch `transplant-16-subject`, cut at the
  far end): `git cherry-pick -m 1 b9f64660c` rc=1. Output:
  "CONFLICT (modify/delete): evidence/2026-11-08/prove-out-holdout.md
  deleted in HEAD and modified in b9f64660c (Merge pull request #15
  from steve-vitale/cursor/holdout-tradeoff-007e). Version b9f64660c
  ... of evidence/2026-11-08/prove-out-holdout.md left in tree."
  Status at conflict (scoped `git status --porcelain=v1`):
  DU evidence/2026-11-08/prove-out-holdout.md
  (unmerged list from the index: exactly that one file; stages 1 + 3
  only — base blob aff0d5ec… and theirs blob d1b27ea5…, no stage 2;
  no conflict markers — modify/delete leaves the theirs version in
  the tree). The live pick reproduces the merge-tree prediction
  EXACTLY (same file, same modify/delete class, same blobs).
  Per the tooling-resolution rule the arm STOPPED: the
  cherry-pick was aborted (`git cherry-pick --abort`, rc=0), no
  file was hand-resolved, no narrowed re-run was decided.
- Recovery after the abort: HEAD back on
  transplant-16-subject at 203a32775, tracked tree clean, no
  CHERRY_PICK_HEAD. The subject branch is LEFT in place at
  203a32775 (zero picks applied) for reproducibility. PICK 1 was
  never applied. HEAD then returned to the arm branch
  sim-transplant16-a; heartbeat re-landed.
- Resolutions recorded: NONE. No file was resolved by any method —
  the single conflicted file is non-tooling, so the rule stops the
  arm before any resolution.

## Why pick 1 cannot land on the far end (plain words + mechanism)

Pick 1 (#15) accepts the prove-out holdout tradeoff in writing — it
re-writes the "Written tradeoff" section of the holdout evidence
note to say the panel's `review_required` label stands, with the
numbers that justify it. But the holdout note itself lives only on
the origin line: side-branch commit 0ee7b3a39 added it ("evidence:
prove-out 64-seed holdout on 816404356") and side-branch commit
ef7383bc0 — pick 1's second parent — wrote the accepted tradeoff
into it (+20/-10). The far end never had any of it: no holdout
note at all. Pick 1's write-up is written on top of a file the far
end does not have, so when it meets the far end both sides disagree
about whether the file exists at all — git calls that modify/delete,
and it cannot combine them. No resolution of the proof JSONs would
have helped. In short: family 16's first merge depends on a
prove-out holdout note (PR #15 side content), and the far end never
had it. The group cannot be transplanted as a unit onto the far end
in origin order without that file landing first — a coordinator
decision, not this arm's. Same missing-file dependency shape as 15F
pick 7 (person-trust), one pick earlier — the second sighting of
the shape in this program.

## What this means (plain words)

Family 16 is the evidence/proof/test-only merge group: twelve
merges that add phone screenshots, re-run neutral panels, screen
role censuses, and write deed-attainment tests — no game code in
any of them. Whether the group carries any of the collapse is still
UNKNOWN: the very first merge, the holdout tradeoff acceptance,
cannot be placed at all, because it is written against a holdout
note the far end does not have — and an evidence note is never read
by the game anyway, so even a successful landing would be expected
to read NOT-CARRIER. The group stays unmeasured and stays on the
suspect list until the coordinator decides the route — most
plausibly measuring picks 2–12 with pick 1 dropped (the
informational reads say #17/#21/#23/#27/#31/#49/#50 are clean
against the far end, #119 is tooling-only, while #19/#24 carry the
same missing-file shape and #121 conflicts on a test file), or
landing the holdout note first and then re-running 16 whole.

Note the family-16 program position: families 11–15 are measured
(15C OVE-52 is the identified carrier); 16 was the last unmeasured
family. It remains unmeasured — by conflict, not by verdict. The
transplant program's family-by-family coverage is now complete
except for the two unmeasured-by-conflict groups (15F as a unit,
16 as a unit), both held on the same missing-file dependency shape.

## Coordinator decision owed

The route for family 16 given the pick-1 dependency on the
prove-out holdout note. Candidate shapes (the arm decides none of
these): (a) measure picks 2–12 alone as their own transplant
(dropping pick 1; the informational reads suggest most land clean,
but a chained pre-check must be built on the true preceding tree —
the far-end-based reads are NOT predictions for the chained
sequence); (b) land the holdout note (origin side content, commits
0ee7b3a39 + ef7383bc0) first, then re-run 16 (picks 1–12) on far
end + holdout note; (c) record the group unmeasurable-by-conflict
as a unit and move on. Note for the decision: the pick-1 conflict
is a genuine missing-file dependency, not a tooling adjacency —
the tooling-resolution rule correctly stopped the arm, and no
resolution of balance-proof.json or phone-frame-proof.json would
help. The same missing-file dependency may recur in any arm whose
picks touch files added by side-branch commits on the origin line.

## Sense-testing

No judged sim ran, so no transcripts exist to read — nothing to
sense-test. What the family content says in plain words: every
pick is a measurement artifact (a receipt, a panel, a probe, a
test, an evidence note). None of it is read by the game at runtime:
probe/test scripts run only when a human or a harness invokes
them, evidence JSON/md files are never loaded by src/js, and the
proof JSONs are digests checked by scripts. No measured path goes
exercised by this family in the game, so a survival band would
prove survival-inertness, not the behavior of any of these files —
and no survival band exists, because the subject could not be
built. The one file with any game-adjacent meaning, the
capable-bot test's seed (pick 12, 63 → 65), changes only which
seed the test fixture runs on, with its own note saying all
sections pass and no assertion changed.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes. The
  flap-watch log read A/B/C/D OK throughout (E FAIL@open errno=17
  File exists and I FAIL node-oexcl EEXIST are pre-existing probe
  artifacts — a stale probe lock file — not write denials). All
  git writes and file writes completed.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (b831a3ec7) — `git status` showed both committed files as
  deleted although the commit was correct (worktree files
  byte-identical to the HEAD blobs). Repaired with the documented
  pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); verified `git status --short` empty +
  `git diff HEAD` empty afterwards. No work lost. Second sighting
  of the clobber class on a transplant arm (15F hit it on its
  prereg commit too).
- No runtime restart struck this arm. No safe-commit refusal.
  Heartbeat landed promptly on both attempts.
- Telemetry deviation check: NOT RUN — no corpus exists to check
  (no judged sim ran; recorder-corpus class would refuse it
  anyway, same as all prior bisect/transplant arms). Baseline NOT
  rolled.

## Metric review

No metric proved wrong — no metric was exercised. The primary
(survived/8, group thresholds fresh per 2115 §3) never got a
reading because the subject could not be completed. The
tooling-resolution rule worked as designed: the merge-tree
prediction named the one conflicted file and the exact
modify/delete class for pick 1, the live pick reproduced it
exactly (same file, same blobs, same stages), and the arm stopped
without hand-resolving anything. Two process notes for future arms:
(1) a pick's merge-tree prediction must be built on the TRUE
preceding tree — the temp-index build plus the live
tree-equality check is what makes each next prediction
trustworthy; a prediction built on the bare far end would have
missed the pick-1 shape only if the file existed on the far end
(it does not — but the chained-vs-bare distinction still matters
for picks 3, 6, and 12, whose bare-far-end sets are recorded as
informational only, never as predictions). (2) The grouping
prereg's family-16 note ("test only if no carrier explains the
collapse") needed the coordinator's standing decision to measure
anyway — recorded in the prereg so no future arm re-litigates it.
(3) The family-16 STOP is the SECOND missing-file-dependency STOP
in the program (15F pick 7 was the first) — grouping notes for
future programs should flag picks whose files were added by
side-branch commits, not just tooling adjacency.

## Proof

- scripts/test-transplant16.js — stage 1: 290 passed, 0 failed
  (committed with the prereg, b831a3ec7); stage 2: 316 passed, 0
  failed total (26 stage-2 legs: live pick-1 STOP outcome,
  subject left at the far end with zero picks, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs, re-run on the branch
  tip after the live pick: 116 passed, 0 failed (the step tooling
  was untouched by this arm and no judged sim ran, but the shared
  harness is confirmed green on this tree).
