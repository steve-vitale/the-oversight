# sim-transplant15a-narrowed — family 15A NARROWED (dawn scorer / convo wants) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-narrowed-a, branch
`sim-transplant15a-narrowed-a`, worktree
`~/workspace/worktrees/sim-transplant15a-narrowed-a`.
Prereg: evidence/2026-11-14/sim-transplant15a-narrowed-prereg.md
(committed cb8cdcb47, BEFORE the subject was cut or any judged sim
ran — the pre-check ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15A.

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 2)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15A. No judged sim ran. Survived/8: unmeasured.
  Per-seed days: unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-15a-narrowed-subject`: cut at the far
  end, pick 1 applied and LEFT in place at 493d7a975 (tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree). Pick 2 was attempted live and conflicted;
  the cherry-pick was aborted. Pick 3 was never attempted.
- STEP t15a-narrowed: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15a-narrowed-prereg.md. Base:
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

- Pick 1: c937de65f32d26e064d8935dd984490b2ee50a6c "OVE-48:
  convoSelectWant reads dawn commitment and top drive". First
  parent 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32. Diff: 4 files —
  docs/ONTOLOGY.md +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1.
- Pick 2: 4594de6b528e40872c356f1d465762581ce06cd1 "OVE-50: unify
  favor-need selection and liveness thresholds". First parent
  9bc88d85d7ee4c2f6d3c4c0715315f24b628e449. Diff: 4 files —
  docs/ONTOLOGY.md +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-favor-need-threshold-unify.js +171/-0 (new test),
  src/js/convo-wants.js +171/-43.
- Pick 3: 748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6 "OVE-51:
  bond/link raises as scored dawn candidates". First parent
  49341fd7824023543b13dca40831d704d49e4637. Diff: 5 files —
  docs/ONTOLOGY.md +6/-4, scripts/green-list.txt +1/-0,
  scripts/test-bond-dawn-candidates.js +264/-0 (new test),
  src/js/bond-initiation.js +298/-69, src/js/villager-brain.js
  +17/-4.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: c937de65f → 4594de6b5 → 748cce3b8.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check + live picks (the STOP)

- PICK 1 merge-tree prediction (base = pick's first parent
  1e03b3d69, ours = far end 203a32775, theirs = c937de65f):
  rc=1, tree 77512a52b7c7537d28d07e193c10cf0799c3b442, conflicted
  files: EXACTLY ONE — scripts/green-list.txt. No src/js conflict,
  no docs conflict. PREDICTION: CONFLICT, tooling-only → resolve
  with `git checkout --ours`, continue.
- PICK-1-RESOLVED TREE (predicted, temp-index build): far end +
  pick-1 diff minus green-list.txt → tree
  6d6216e3e414518d2c335829e130e65ec849941b (3 files, +320/-3).
- PICK 2 merge-tree prediction (base = pick's first parent
  9bc88d85d, ours = predicted pick-1 commit 2a66d802, theirs =
  4594de6b5): rc=1, tree
  ff493cec33720c28342cb3711e7fba3e9869a583, conflicted files:
  EXACTLY TWO — scripts/green-list.txt AND src/js/convo-wants.js.
  PREDICTION: CONFLICT, game-code included → STOP at pick 2.
- PICK 3: prediction NOT runnable (needs the pick-2-applied tree,
  which cannot exist if pick 2 stops). No pick-3 conflict status
  is claimed either way.
- LIVE PICK 1 (subject branch `transplant-15a-narrowed-subject`,
  cut at the far end): `git cherry-pick c937de65f` rc=1. Output:
  "Auto-merging docs/ONTOLOGY.md", "Auto-merging
  scripts/green-list.txt", "CONFLICT (content): Merge conflict in
  scripts/green-list.txt", "Auto-merging src/js/convo-wants.js".
  Status at conflict: M docs/ONTOLOGY.md, UU
  scripts/green-list.txt, A scripts/test-convo-dawn-priorities.js,
  M src/js/convo-wants.js. Conflict markers at
  scripts/green-list.txt lines 803–809 (one hunk) — identical to
  the first arm's live confirmation. Resolved per the
  tooling-resolution rule: `git checkout --ours --
  scripts/green-list.txt` (sha256 138a5e86… — byte-identical to
  the far end's green-list.txt, verified before continuing), then
  `git add` to mark resolved, then `git cherry-pick --continue`.
  (Note: `checkout --ours` alone restores the worktree file but
  leaves the index stages unmerged — the `git add` is what marks
  the resolution; the first `continue` attempt failed on that
  until the add landed. Recorded so the next arm does not
  re-learn it.) Result: commit 493d7a975 "OVE-48:
  convoSelectWant reads dawn commitment and top drive", 3 files
  +320/-3, tree 6d6216e3e414518d2c335829e130e65ec849941b — EXACTLY
  the predicted pick-1-resolved tree. The temp-index prediction
  is validated by the live pick. green-list.txt is NOT in the
  commit's file list.
- LIVE PICK 2: `git cherry-pick 4594de6b5` rc=1. Output:
  "Auto-merging docs/ONTOLOGY.md", "Auto-merging
  scripts/green-list.txt", "CONFLICT (content): Merge conflict in
  scripts/green-list.txt", "Auto-merging src/js/convo-wants.js",
  "CONFLICT (content): Merge conflict in src/js/convo-wants.js".
  Status at conflict: M docs/ONTOLOGY.md, UU scripts/green-list.txt, A scripts/test-favor-need-threshold-unify.js, UU src/js/convo-wants.js. Conflict markers: src/js/convo-wants.js
  lines 1868 (`<<<<<<< HEAD`), 1876 (`=======`), 1885
  (`>>>>>>> 4594de6b5 (OVE-50: …)`); scripts/green-list.txt
  lines 803/804/810. The live pick reproduces the merge-tree
  prediction EXACTLY (same two files, same convo-wants.js hunk
  lines). Per the tooling-resolution rule the arm STOPPED: the
  cherry-pick was aborted (`git cherry-pick --abort`, rc=0), no
  file was hand-resolved, no narrowed re-run was decided.
- Recovery after the abort: HEAD back on
  transplant-15a-narrowed-subject at 493d7a975, tree
  6d6216e3e414518d2c335829e130e65ec849941b, tracked tree clean, no
  CHERRY_PICK_HEAD. The subject branch is LEFT in place at
  493d7a975 (pick 1 only) for reproducibility. PICK 3 was never
  attempted.
- Resolutions recorded (file, pick, method): scripts/green-list.txt,
  pick 1, `git checkout --ours` (far-end version kept
  byte-identical, sha 138a5e86…) + `git add` to mark resolved.
  No other file was resolved by any method.

## Why pick 2 cannot land on the far end (plain words + mechanism)

Pick 2 (OVE-50) unifies the favor-need gate on top of the
believed-pantry code — villagers judging "does the village need
this favor?" from what they BELIEVE is in the pantry, not from
live totals. That believed-pantry rewrite is commit 03436c1bc
(family 15D), which lives on the origin line: it is an ancestor
of pick 1's first parent, of pick 2's first parent, and of pick 1
itself — but it is NOT an ancestor of the far end. The far end's
favor-need scan is the older direct-read version (it checks the
water and pantry numbers straight off the villager record). Pick
2's diff rewrites the believed-pantry version of that block, so
when it meets the far end's older version, both sides have
changed the same lines and git cannot combine them — the conflict
at convo-wants.js lines 1868–1885 is the two versions of the same
favor scan side by side. No intervening commit between pick 1 and
pick 2's first parent touches convo-wants.js, so the divergence
is not pick-1 fallout; it is the missing 15D base. In short:
family 15A's second commit depends on family 15D's code, and the
far end never had it. The group cannot be transplanted as a unit
onto the far end in origin order without 15D landing first — a
coordinator decision, not this arm's.

## What this means (plain words)

Family 15A is the dawn-scorer / conversation-wants group: it makes
what villagers talk about follow what dawn already decided they
are doing, puts favor requests behind one shared gate instead of
two different ones, and lets bond and village-link raises compete
as scored dawn choices. The narrowed route worked for the first
commit: the test-list conflict resolved cleanly by keeping the far
end's list, and the live first commit landed exactly on the
predicted tree — the tooling-resolution rule did its job. But the
second commit cannot be placed at all, because it is written
against a pantry-belief system the far end does not have. Whether
the group carries any of the collapse is still UNKNOWN: only one
of its three commits sits on the far end, and no sim ran. The
group stays unmeasured and stays on the suspect list until the
coordinator decides the route — most plausibly landing 15D
(believed pantry/cistern) first and then re-running 15A on top
of it, or splitting 15A so pick 1 is measured alone.

## Coordinator decision owed

The route for family 15A given the pick-2 dependency on 15D.
Candidate shapes (the arm decides none of these): (a) land 15D
first, then re-run 15A (picks 1–3) on far end + 15D; (b) measure
pick 1 alone as its own transplant (the subject branch already
holds it at 493d7a975 — the STEP would run against that tip);
(c) record the group unmeasurable-by-conflict as a unit and move
on to 15B–15F. Note for the decision: the pick-2 conflict is a
genuine code dependency, not a tooling adjacency — the
tooling-resolution rule correctly stopped the arm, and no
resolution of green-list.txt would have helped. The same
believed-pantry dependency may recur in 15D-adjacent arms whose
picks touch the favor scan.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  The flap-watch log read ALL-OK throughout (last lines
  10:48–10:52Z, load 2–16). The box was heavily loaded instead:
  sibling check.js / balance-panel / sim processes saturated the
  machine (load 13–16), which made `git status` take 60s+ (timed
  out twice) and the first proof run take ~5 min. All git work in
  this arm used bounded commands and completed.
- REGISTRY LOCK CONTENTION: the heartbeat script blocks on
  REGISTRY.lock (`flock -x`); two attempts timed out (120s,
  280s) while the lock was held by queued sibling heartbeats and
  a Loop B process. A third attempt (900s timeout, backgrounded)
  landed: "heartbeat sim-transplant15a-narrowed-a", rc=0. The
  tree was created 10:33:59Z and the reaper's staleness line is
  4h, so there was no reaper risk during the wait. Recorded so
  the lock-queue delay is not mistaken for a flap window.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (cb8cdcb47) — `git diff HEAD` showed both committed files as
  deleted although the commit was correct (worktree hashes
  matched the HEAD blobs exactly). Repaired with the documented
  pipe (`git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info`); verified `git diff HEAD` empty +
  `git diff --cached` empty afterwards. No work lost.
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
prediction named both conflicted files and the exact convo-wants.js
hunk lines, the live picks reproduced both predictions exactly
(including the pick-1-resolved tree OID), and the arm stopped
without hand-resolving anything. Two process notes for future
arms: (1) a pick's merge-tree prediction must be built on the
TRUE pick-1-resolved tree — the temp-index build plus the live
pick-1 tree-equality check is what makes the pick-2 prediction
trustworthy; a prediction built on the bare far end would have
missed the convo-wants.js conflict's exact shape. (2) `git
checkout --ours` does not mark a conflict resolved — `git add`
is still required before `git cherry-pick --continue`.

## Proof

- scripts/test-transplant15a-narrowed.js — stage 1: 131 passed, 0
  failed (committed with the prereg, cb8cdcb47); stage 2: 155
  passed, 0 failed (live pick-1 tree equality, pick-2 STOP
  outcome, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs (re-run after the
  live picks; the step tooling was untouched, but the re-run
  confirms the shared harness still passes on this tree).
