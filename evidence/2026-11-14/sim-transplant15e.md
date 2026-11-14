# sim-transplant15e — family 15E (resume / conversation repair) (Loop A, fleshout-20261114T1215Z)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-a, branch `sim-transplant15e-a`, worktree
`~/workspace/worktrees/sim-transplant15e-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-prereg.md
(committed 428e1536e, BEFORE the subject was cut or any judged sim
ran — the pre-check ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15E.

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 2)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15E. No judged sim ran. Survived/8: unmeasured.
  Per-seed days: unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-15e-subject`: cut at the far end, pick 1
  applied and LEFT in place at f541e4cd1 (tree
  f9e9b8b80156e7157793e7ee6a69306edcd5c738 — exactly the predicted
  pick-1-resolved tree). Pick 2 was attempted live and conflicted;
  the cherry-pick was aborted. Pick 3 was never attempted.
- STEP t15e-resume: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15e-prereg.md. Base:
far end 203a32775 (GOOD 4/8) with the roster-check standing fix
swapped in for every step (fix f8fda4295a99; native restored
byte-identical afterwards, sha-verified). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step. Thresholds for
the GROUP as one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
with a fresh STEP id; ≥3/8 NOT-CARRIER. STOP clause per the
coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z):
a pick conflicting ONLY on zero-src-reader tooling files
(scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json) resolves EACH such file with
`git checkout --ours` and continues; ANY other conflicted file
(any src/js, data, policy, docs, or test file) STOPS the arm
immediately, no hand-resolution, no narrowed re-run decided by
this arm.

## Family identity (verified at run start, before any sim)

- Pick 1: bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver
  unfinished thread on resume-offer Yes". First parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0 (Merge pull request #10,
  snippet-stage-direction-guard — family 14). Diff: 3 files —
  evidence/2026-11-08/story-offer-yes-followthrough.md +29/-0,
  scripts/test-story-offer-yes-20261108.js +73/-0 (new test),
  src/js/conversation.js +46/-4.
- Pick 2: 7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33: refresh
  stale quick proofs and fix outside-Muse fails". First parent
  c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212 (Merge pull request #28,
  dialog-recap-teach-35a9 — family 3). Diff: 12 files —
  evidence/2026-11-08/neutral-ove33-master-quick.json.gz (binary),
  evidence/2026-11-08/phone-ove33-frame-736-r1.json +2585/-0,
  evidence/2026-11-08/phone-ove33-frame-844-r1.json +2686/-0,
  scripts/balance-proof.json +2/-2,
  scripts/godpath/test-mobile-combat-cadence.js +4/-0,
  scripts/godpath/test-occupation-panels.js +1/-1,
  scripts/godpath/test-time-save-crashes.js +3/-2,
  scripts/phone-frame-proof.json +6/-6,
  scripts/test-establishment-r20-fixes-20261020.js +3/-0,
  scripts/test-snippet-stage-direction.js +4/-0,
  src/js/conversation.js +4/-0, sw.js +1/-0.
- Pick 3: 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 "OVE-57: triage
  tip quick-check after bond dawn". First parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc (OVE-54: record PR URL in
  companionScore evidence — family 15B). Diff: 4 files —
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz (binary),
  scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: bb6a301cf → 7041e1bfb → 4a1c77cf1
  (first-parent positions 10 / 24 / 42).
- Sequence dependencies: pick 1 IS an ancestor of pick 2's first
  parent; pick 2 IS an ancestor of pick 3's first parent. Pick 1's
  first parent 7688cb7a4 is NOT an ancestor of the far end.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check + live picks (the STOP)

- PICK 1 merge-tree prediction (base = pick's first parent
  7688cb7a4, ours = far end 203a32775, theirs = bb6a301cf):
  rc=0, CLEAN — no conflict. Merged tree
  f9e9b8b80156e7157793e7ee6a69306edcd5c738. Prediction commit
  19e50e1e0e48b21094eccc9b139672900afaba21 (commit-tree of that
  tree, parent = far end). PREDICTION: cherry-pick applies
  cleanly.
- PICK 2 merge-tree prediction (base = pick's first parent
  c32ff6fa8, ours = predicted pick-1 commit 19e50e1e0, theirs =
  7041e1bfb): rc=1, tree
  8e3ce24f9ddb300116ef2cedd310e8ebcf44128e, conflicted files:
  EXACTLY FOUR — scripts/balance-proof.json,
  scripts/phone-frame-proof.json,
  scripts/test-snippet-stage-direction.js,
  src/js/conversation.js. PREDICTION: CONFLICT, game-code included
  → STOP at pick 2. (Tree-OID note, learned while proving: the
  merge-tree OID depends on the refs AS SPELLED — short
  `7041e1bfb` gives 1c2a7ff1…, the full 40-char hash gives
  8e3ce24f…; the proof invokes it with full hashes, so 8e3ce24f is
  the recorded prediction. The conflicted-file list is identical
  either way.)
- PICK 3: prediction NOT runnable (needs the pick-2-applied tree,
  which cannot exist if pick 2 stops). No pick-3 conflict status
  is claimed either way.
- LIVE PICK 1 (subject branch `transplant-15e-subject`, cut at the
  far end): `git cherry-pick bb6a301cf` rc=0, clean. Output:
  "Auto-merging src/js/conversation.js". Result: commit f541e4cd1
  "Deliver unfinished thread on resume-offer Yes", 3 files
  +148/-4, tree f9e9b8b80156e7157793e7ee6a69306edcd5c738 — EXACTLY
  the predicted pick-1-resolved tree. The temp-index prediction
  is validated by the live pick.
- LIVE PICK 2: `git cherry-pick 7041e1bfb` rc=1. Output:
  "Auto-merging scripts/balance-proof.json", "CONFLICT (content):
  Merge conflict in scripts/balance-proof.json", "Auto-merging
  scripts/phone-frame-proof.json", "CONFLICT (content): Merge
  conflict in scripts/phone-frame-proof.json", "CONFLICT
  (modify/delete): scripts/test-snippet-stage-direction.js deleted
  in HEAD and modified in 7041e1bfb", "Auto-merging
  src/js/conversation.js", "CONFLICT (content): Merge conflict in
  src/js/conversation.js", "Auto-merging sw.js". Status at
  conflict: A evidence/2026-11-08/neutral-ove33-master-quick.json.gz,
  A evidence/2026-11-08/phone-ove33-frame-736-r1.json,
  A evidence/2026-11-08/phone-ove33-frame-844-r1.json,
  UU scripts/balance-proof.json,
  M scripts/godpath/test-mobile-combat-cadence.js,
  M scripts/godpath/test-occupation-panels.js,
  M scripts/godpath/test-time-save-crashes.js,
  UU scripts/phone-frame-proof.json,
  M scripts/test-establishment-r20-fixes-20261020.js,
  DU scripts/test-snippet-stage-direction.js,
  UU src/js/conversation.js, M sw.js. Conflict markers:
  src/js/conversation.js lines 1730 (`<<<<<<< HEAD`), 1731
  (`=======`), 1754 (`>>>>>>> 7041e1bfb (OVE-33: …)`);
  scripts/balance-proof.json lines 3/6/9;
  scripts/phone-frame-proof.json lines 7/15/23 and 81/91/101.
  The live pick reproduces the merge-tree prediction EXACTLY
  (same four files, same conversation.js hunk lines). Per the
  tooling-resolution rule the arm STOPPED: the cherry-pick was
  aborted (`git cherry-pick --abort`, rc=0), no file was
  hand-resolved, no narrowed re-run was decided.
- Recovery after the abort: HEAD back on
  transplant-15e-subject at f541e4cd1, tree
  f9e9b8b80156e7157793e7ee6a69306edcd5c738, tracked tree clean, no
  CHERRY_PICK_HEAD. The subject branch is LEFT in place at
  f541e4cd1 (pick 1 only) for reproducibility. PICK 3 was never
  attempted.
- Resolutions recorded (file, pick, method): NONE. Pick 1 applied
  cleanly (no resolution needed — it touches no tooling file).
  Pick 2 was aborted with no file resolved by any method: the two
  tooling files (balance-proof.json, phone-frame-proof.json) were
  NOT resolved --ours, because the pick also conflicted on
  src/js/conversation.js and scripts/test-snippet-stage-direction.js,
  and the rule stops the arm on any non-tooling conflicted file.

## Why pick 2 cannot land on the far end (plain words + mechanism)

Pick 2 (OVE-33) is mostly a proof refresh, but its one game-code
change — a 4-line quote check inside `convoSnippetIsStageDirection`
("a line with a quote in it is real speech, not stage direction")
— lives inside a function the far end does not have. That function
was introduced by family 14, PR #10 (snippet-stage-direction-guard,
merge 7688cb7a4 — pick 1's first parent), which is an ancestor of
pick 2's base but NOT an ancestor of the far end. The far end has
the sibling snippet helpers (convoSnippetIsHook, convoSnippetIsRealBeat)
but zero hits for convoSnippetIsStageDirection. In the merged tree
the conflict markers sit at conversation.js lines 1730/1731/1754
with an EMPTY ours side: the entire function is new content
relative to the far end, so git cannot place a 4-line edit inside
a function that is absent on our side. The test-file conflict is
the same class: scripts/test-snippet-stage-direction.js does not
exist at the far end (modify/delete — deleted in HEAD, modified in
7041e1bfb). Four origin-side commits between pick 1 and pick 2's
first parent touch conversation.js (2c01bb277, 5b7d83426, 3015beec0,
10724c18d) — origin-side evolution, not the cause. In short:
family 15E's second commit depends on family 14's code, and the
far end never had it. The group cannot be transplanted as a unit
onto the far end in origin order without family 14 landing first —
a coordinator decision, not this arm's.

## What this means (plain words)

Family 15E is the resume / conversation-repair group: saying Yes
to "Want to hear where it left off?" now actually continues the old
conversation instead of brushing it off; quoted speech stops being
mistaken for stage direction in resume openers; a trader who was
about to introduce themselves before you saved doesn't lose their
turn. The first commit landed cleanly on the far end exactly as
predicted — the resume-offer repair itself transplants fine. But
the second commit cannot be placed at all, because it is written
against a snippet-guard function the far end does not have.
Whether the group carries any of the collapse is still UNKNOWN:
only one of its three commits sits on the far end, and no sim ran.
The group stays unmeasured and stays on the suspect list until the
coordinator decides the route — most plausibly landing family 14
(snippet-stage-direction-guard) first and then re-running 15E on
top of it, or splitting 15E so pick 1 is measured alone (the
subject branch already holds it at f541e4cd1 — the STEP would run
against that tip). Note: pick 3 (OVE-57, trader-intro deferral +
rally-guard) touches conversation.js in regions that DO exist at
the far end (queueTraderIntro, close-out) plus villager-objectives.js,
so a pick-1+pick-3 pairing might merge where pick 2 cannot — but
that is a coordinator call, not this arm's; this arm attempted the
group in origin order only.

## Coordinator decision owed

The route for family 15E given the pick-2 dependency on family 14.
Candidate shapes (the arm decides none of these): (a) land family
14 first, then re-run 15E (picks 1–3) on far end + family 14; (b)
measure pick 1 alone as its own transplant (the subject branch
already holds it at f541e4cd1 — the STEP would run against that
tip); (c) record the group unmeasurable-by-conflict as a unit and
move on to 15B–15F. Note for the decision: the pick-2 conflict is
a genuine code dependency, not a tooling adjacency — the
tooling-resolution rule correctly stopped the arm, and no
resolution of balance-proof.json / phone-frame-proof.json would
have helped. The same family-14 dependency may recur in any arm
whose picks touch convoSnippetIsStageDirection or its test.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  The flap-watch log was not re-read this arm; no write failure
  occurred at any step (prereg, proof, commits, picks, abort all
  wrote cleanly). The one write-adjacent incident was the
  safe-commit index clobber below, which is a git-index
  phenomenon, not a flap denial.
- REGISTRY LOCK CONTENTION: the heartbeat script blocks on
  REGISTRY.lock (`flock -x`); the first heartbeat attempt took
  ~11.5 min to land (started ~12:26Z, completed 12:37Z with
  "heartbeat sim-transplant15e-a", rc=0) while the lock was held
  by queued sibling heartbeats and a Loop B process. The tree was
  created with a fresh heartbeat at 12:20:16Z and the reaper's
  staleness line is 4h, so there was no reaper risk during the
  wait. Recorded so the lock-queue delay is not mistaken for a
  flap window. A second heartbeat was not attempted after the
  first landed; the run's remaining work was short.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (428e1536e) — `git status` showed both committed files as
  staged-deleted although the commit was correct (worktree hashes
  matched the HEAD blobs exactly). Repaired with the documented
  pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); verified `git status --short` empty +
  `git diff HEAD` empty + `git diff --cached` empty + hash-object
  == HEAD blob per file afterwards. No work lost.
- No runtime restart struck this arm. No safe-commit refusal.
- Telemetry deviation check: NOT RUN — no corpus exists to check
  (no judged sim ran; recorder-corpus class would refuse it
  anyway, same as all prior bisect/transplant arms). Baseline NOT
  rolled.

## Metric review

No metric proved wrong — no metric was exercised. The primary
(survived/8, group thresholds fresh per 2115 §3) never got a
reading because the subject could not be completed. The
tooling-resolution rule worked as designed: the merge-tree
prediction named all four conflicted files and the exact
conversation.js hunk lines, the live picks reproduced both
predictions exactly (including the pick-1-resolved tree OID), and
the arm stopped without hand-resolving anything. Two process notes
for future arms: (1) a pick's merge-tree prediction must be built
on the TRUE pick-1-resolved tree — the temp-index build plus the
live pick-1 tree-equality check is what makes the pick-2
prediction trustworthy. (Checked after the fact: a prediction
built on the bare far end gives a different tree, 5cc41c03…, but
the SAME four conflicted files — the file list would not have
missed the conflict; what would be lost is the exact marker
context and the pick-1 tree-equality validation.) (2) The
merge-tree OID depends on the refs AS
SPELLED: short hashes in the invocation give different conflict
labels (and a different tree OID) than full hashes — record which
spelling the proof uses, and assert the tree the proof's own
invocation produces (here 8e3ce24f…, full hashes).

## Proof

- scripts/test-transplant15e.js — stage 1: 129 passed, 0 failed
  (committed with the prereg, 428e1536e); stage 2: 153 passed, 0
  failed total (live pick-1 tree equality, pick-2 STOP outcome,
  evidence records).
- scripts/test-culpritbisect-a.js — 116 legs (re-run after the
  live picks; the step tooling was untouched, but the re-run
  confirms the shared harness still passes on this tree).
