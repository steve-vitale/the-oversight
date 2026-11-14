# sim-transplant15f — family 15F (proof refreshes, likely inert) (Loop A, fleshout-20261114T1215Z)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15f-a, branch `sim-transplant15f-a`, worktree
`~/workspace/worktrees/sim-transplant15f-a`.
Prereg: evidence/2026-11-14/sim-transplant15f-prereg.md (committed
39983cc74, BEFORE the subject was cut or any judged sim ran — the
pre-check ran during prereg preparation; see the prereg's ordering
note). Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md
§3 (H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + hidden_files/family15-grouping-prereg-2026-11-14.md §15F.

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 7)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15F. No judged sim ran. Survived/8: unmeasured.
  Per-seed days: unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-15f-subject`: cut at the far end, picks
  1–6 applied and LEFT in place at 4eca36017 (tree
  7bee7b39eb98ce201163aaf86528d7aed220ce5b — exactly the predicted
  pick-6-resolved tree). Pick 7 was attempted live and conflicted;
  the cherry-pick was aborted. No pick-7 commit exists.
- STEP t15f-proofs: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15f-prereg.md. Base: far end
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

- Pick 1: 055c48f62 "OVE-37: refresh phone/balance proofs on master
  tip". Diff: 5 files — neutral-ove37-master-port.json.gz (new,
  binary), phone-ove37-master-frame-736/844-r1.json (+2613/+2609),
  scripts/balance-proof.json (2/2), scripts/phone-frame-proof.json
  (9/9). js=0.
- Pick 2: 97a67d4f8 "OVE-47: refresh phone-frame proof on master
  tip". Diff: 4 files — phone-fun-reverify-frame-736/844-r2.json
  (+2660/+2727), phone-fun-reverify-r1.md (+9),
  scripts/phone-frame-proof.json (8/8). js=0.
- Pick 3: 49341fd78 "OVE-53: refresh phone-frame proof after favor
  thresholds". Diff: 4 files — phone-favor-frame-736/844-r1.json
  (+2561/+2653), phone-favor-frame-r1.md (+10),
  scripts/phone-frame-proof.json (5/5). js=0.
- Pick 4: 6e53adc62 "OVE-56: refresh phone-frame proof after bond
  dawn". Diff: 4 files — phone-bond-frame-736/844-r1.json
  (+2729/+2725), phone-bond-frame-r1.md (+11),
  scripts/phone-frame-proof.json (10/10). js=0.
- Pick 5: a1567198c "OVE-55: Phase 4 social rates screen on tip
  748cce3b8". Diff: 4 files — phase4-social-rates-analysis.json
  (+207), .md (+66), phase4-social-rates-panel.json (+3008),
  scripts/probe-phase4-social-rates-20261108.js (+606, new).
  js=0.
- Pick 6: be39a0a4e "OVE-57: refresh proofs on tip 134a3d0ab after
  rebase". Diff: 7 files — neutral-ove57-tip-134a3d0ab.json.gz (new,
  binary), neutral-ove57-tip-6e53adc62.json.gz (DELETED),
  phone-ove57-frame-736/844-r1.json (+2633/+2712),
  phone-ove57-frame-r1.md (+8), scripts/balance-proof.json (2/2),
  scripts/phone-frame-proof.json (6/6). js=0.
- Pick 7: 74a16306c "OVE-61: refresh person-trust non-aimed errand
  mix baseline". Diff: 2 files —
  evidence/2026-11-08/person-trust-prereg.md (+42/-0),
  scripts/test-person-trust-20261108.js (+8/-7). js=0.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: 055c48f62 → 97a67d4f8 → 49341fd78 →
  6e53adc62 → a1567198c → be39a0a4e → 74a16306c.
- No pick touches src/js/standing.js, scripts/policies, or
  scripts/green-list.txt.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy sha256 a7ff5c51… (same substrate as
  the bisect prereg).

## Merge-tree pre-check + live picks (the STOP)

- PICK 1 merge-tree prediction (base = pick's first parent
  23245d5d6, ours = far end 203a32775, theirs = 055c48f62):
  rc=1, tree 1a2a7a47cb3e9c406200b0b442a0b6c23f0c80e1, conflicted
  files: EXACTLY TWO — scripts/balance-proof.json AND
  scripts/phone-frame-proof.json. No src/js conflict, no docs
  conflict, no green-list.txt conflict. PREDICTION: CONFLICT,
  tooling-only → resolve with `git checkout --ours`, continue.
- PICK-1-RESOLVED TREE (predicted, temp-index build): merge tree
  1a2a7a47… with both conflicted files forced to the far-end
  version → 67eb5c3763a9122a2063917c4f81bfc4e0088bfb (3 files,
  all additions). Prediction commit
  54ee8f9dc967595700ea9b768455147b9e9f149e.
- PICK 2 merge-tree prediction (base = c937de65f, ours = predicted
  pick-1 commit 54ee8f9dc, theirs = 97a67d4f8): rc=1, tree
  85563e78dafece7d8b389702d3ff508866d47d74, conflicted files:
  EXACTLY ONE — scripts/phone-frame-proof.json. PREDICTION:
  CONFLICT, tooling-only → resolve --ours, continue. Resolved
  tree 875ce641821a1d07fd13123b567ed08a684d9993, prediction commit
  6c0e62869bfd31fd2e62a7b47f445f2dba790579.
- PICK 3 merge-tree prediction (base = 4594de6b5, ours = predicted
  pick-2 commit 6c0e62869, theirs = 49341fd78): rc=1, tree
  249dc673425f2d195dde6b5fc2ce1dd4e96aae1e, conflicted files:
  EXACTLY ONE — scripts/phone-frame-proof.json. PREDICTION:
  CONFLICT, tooling-only → resolve --ours, continue. Resolved
  tree 62931b19ce3e3745968d4a6a288ab6a3924c26a7, prediction commit
  3f61a00fc721e7dabeaa76830f83d988dec9cc01.
- PICK 4 merge-tree prediction (base = 1c1b23482, ours = predicted
  pick-3 commit 3f61a00fc, theirs = 6e53adc62): rc=1, tree
  a647e5e0a1a1c884b648adc8c2d70e9d16a9c1d7, conflicted files:
  EXACTLY ONE — scripts/phone-frame-proof.json. PREDICTION:
  CONFLICT, tooling-only → resolve --ours, continue. Resolved
  tree f8d9ce88b8d0c835b452a06de16b8e484696fabe, prediction commit
  97104ebe4f817bfc4d310835c10fb9a44dffc297.
- PICK 5 merge-tree prediction (base = 6e53adc62, ours = predicted
  pick-4 commit 97104ebe4, theirs = a1567198c): rc=0, tree
  043917f554d59a316b57bd34a010d2e97b49b6e3, conflicted files:
  NONE. PREDICTION: CLEAN apply. Resolved tree = merge tree,
  prediction commit 0352381b7b46dc9e265ae88c7fcb4e9833e60604.
- PICK 6 merge-tree prediction (base = 4a1c77cf1, ours = predicted
  pick-5 commit 0352381b7, theirs = be39a0a4e): rc=1, tree
  c4ee41198c86ece805c2712019b2e92676a52e00, conflicted files:
  EXACTLY TWO — scripts/balance-proof.json AND
  scripts/phone-frame-proof.json. PREDICTION: CONFLICT,
  tooling-only → resolve EACH with `git checkout --ours`,
  continue. The pick's .gz deletion
  (neutral-ove57-tip-6e53adc62) is CLEAN: the file is absent from
  ours (added on the origin line by 4a1c77cf1, after the far end
  diverged) and deleted by theirs — both sides deleted, so it
  stays absent. Resolved tree
  7bee7b39eb98ce201163aaf86528d7aed220ce5b, prediction commit
  0dd7267b1953938815e7c992fd8adc2dcfc579b4.
- PICK 7 merge-tree prediction (base = be39a0a4e, ours = predicted
  pick-6 commit 0dd7267b1, theirs = 74a16306c): rc=1, tree
  13f1049ef9b229ca9d70a6486f38f093d45004d6, conflicted files:
  EXACTLY TWO — evidence/2026-11-08/person-trust-prereg.md AND
  scripts/test-person-trust-20261108.js. PREDICTION: CONFLICT,
  NON-TOOLING → per the tooling-resolution rule the live pick 7
  is expected to STOP the arm.
- LIVE PICK 1 (subject branch `transplant-15f-subject`, cut at the
  far end): `git cherry-pick 055c48f62` rc=1. Output:
  "Auto-merging scripts/balance-proof.json", "CONFLICT (content):
  Merge conflict in scripts/balance-proof.json", "Auto-merging
  scripts/phone-frame-proof.json", "CONFLICT (content): Merge
  conflict in scripts/phone-frame-proof.json". Status at conflict:
  UU scripts/balance-proof.json, UU scripts/phone-frame-proof.json.
  Resolved per the tooling-resolution rule: `git checkout --ours`
  on both files, then `git add` to mark resolved, then `git
  cherry-pick --continue`. Result: commit c833d182d "OVE-37:
  refresh phone/balance proofs on master tip", 3 files (all
  additions), tree 67eb5c3763a9122a2063917c4f81bfc4e0088bfb —
  EXACTLY the predicted pick-1-resolved tree. The temp-index
  prediction is validated by the live pick.
- LIVE PICK 2: `git cherry-pick 97a67d4f8` rc=1, conflicted files:
  EXACTLY ONE — scripts/phone-frame-proof.json. Resolved --ours
  + add, continue. Result: commit 1654a4f67 "OVE-47: refresh
  phone-frame proof on master tip", tree
  875ce641821a1d07fd13123b567ed08a684d9993 — EXACTLY the predicted
  pick-2-resolved tree.
- LIVE PICK 3: `git cherry-pick 49341fd78` rc=1, conflicted files:
  EXACTLY ONE — scripts/phone-frame-proof.json. Resolved --ours
  + add, continue. Result: commit e59dfa262 "OVE-53: refresh
  phone-frame proof after favor thresholds", tree
  62931b19ce3e3745968d4a6a288ab6a3924c26a7 — EXACTLY the predicted
  pick-3-resolved tree.
- LIVE PICK 4: `git cherry-pick 6e53adc62` rc=1, conflicted files:
  EXACTLY ONE — scripts/phone-frame-proof.json. Resolved --ours
  + add, continue. Result: commit bc5fbf752 "OVE-56: refresh
  phone-frame proof after bond dawn", tree
  f8d9ce88b8d0c835b452a06de16b8e484696fabe — EXACTLY the predicted
  pick-4-resolved tree.
- LIVE PICK 5: `git cherry-pick a1567198c` rc=0, clean apply.
  Result: commit 952d4cf04 "OVE-55: Phase 4 social rates screen on
  tip 748cce3b8", 4 files, tree
  043917f554d59a316b57bd34a010d2e97b49b6e3 — EXACTLY the predicted
  pick-5-resolved tree.
- LIVE PICK 6: `git cherry-pick be39a0a4e` rc=1, conflicted files:
  EXACTLY TWO — scripts/balance-proof.json AND
  scripts/phone-frame-proof.json. Resolved EACH --ours + add,
  continue. Result: commit 4eca36017 "OVE-57: refresh proofs on
  tip 134a3d0ab after rebase", 4 files
  (neutral-ove57-tip-134a3d0ab.json.gz added; the
  tip-6e53adc62.json.gz deletion leaves no trace — the file was
  absent on both sides), tree
  7bee7b39eb98ce201163aaf86528d7aed220ce5b — EXACTLY the predicted
  pick-6-resolved tree.
- LIVE PICK 7: `git cherry-pick 74a16306c` rc=1. Output:
  "CONFLICT (modify/delete): evidence/2026-11-08/person-trust-prereg.md
  deleted in HEAD and modified in 74a16306c (OVE-61: refresh
  person-trust non-aimed errand mix baseline). Version 74a16306c
  of evidence/2026-11-08/person-trust-prereg.md left in tree."
  and the same for scripts/test-person-trust-20261108.js. Status
  at conflict (scoped `git status --porcelain=v1`, verified by a
  second live attempt):
  DU evidence/2026-11-08/person-trust-prereg.md
  DU scripts/test-person-trust-20261108.js
  (unmerged list from the index: exactly those two files; stages 1 + 3 only — base blob
  cadcb6e4…/1e5037c2… and theirs blob 06c4d95a…/d9cfe464…, no
  stage 2; no conflict markers — modify/delete leaves the theirs
  version in the tree). The live pick reproduces the merge-tree
  prediction EXACTLY (same two files, same modify/delete class).
  Per the tooling-resolution rule the arm STOPPED: the
  cherry-pick was aborted (`git cherry-pick --abort`, rc=0), no
  file was hand-resolved, no narrowed re-run was decided.
- Recovery after the abort: HEAD back on
  transplant-15f-subject at 4eca36017, tree
  7bee7b39eb98ce201163aaf86528d7aed220ce5b, tracked tree clean, no
  CHERRY_PICK_HEAD. The subject branch is LEFT in place at
  4eca36017 (picks 1–6) for reproducibility. PICK 7 was never
  applied.
- Resolutions recorded (file, pick, method): scripts/balance-proof.json,
  pick 1, `git checkout --ours` (far-end version kept
  byte-identical) + `git add` to mark resolved;
  scripts/phone-frame-proof.json, pick 1, same method;
  scripts/phone-frame-proof.json, pick 2, same method;
  scripts/phone-frame-proof.json, pick 3, same method;
  scripts/phone-frame-proof.json, pick 4, same method;
  scripts/balance-proof.json, pick 6, same method;
  scripts/phone-frame-proof.json, pick 6, same method. No other
  file was resolved by any method. All three tooling files
  (balance-proof.json, phone-frame-proof.json, green-list.txt) are
  byte-identical to the far end at the subject tip; the subject's
  diff vs the far end is exactly picks 1–6 minus tooling (20
  files, all additions).

## Why pick 7 cannot land on the far end (plain words + mechanism)

Pick 7 (OVE-61) refreshes the baseline of the person-trust test —
it re-tunes the tolerance for errands the feature did not aim at,
and appends 42 lines to the feature's prereg. But the person-trust
feature itself — villagers writing each other's trust maps from
lived events — lives only on the origin line, in side-branch commit
458811411 (which added src/js/person-trust.js, the test file, and
the prereg). The far end never had any of it: no trust-writer code,
no test file, no prereg. Pick 7's refresh is written on top of
files the far end does not have, so when it meets the far end both
sides disagree about whether the files exist at all — git calls
that modify/delete, and it cannot combine them. No resolution of
the proof JSONs would have helped. In short: family 15F's last
commit depends on the person-trust feature (family 10's PR #4 side
content), and the far end never had it. The group cannot be
transplanted as a unit onto the far end in origin order without
that feature landing first — a coordinator decision, not this arm's.

## What this means (plain words)

Family 15F is the proof-refresh group: six of its seven commits
just re-take phone screenshots and re-run neutral balance panels
after other work landed, and one screens social rates. All six
landed on the far end cleanly (the proof files were the only
friction, and keeping the far end's copies resolved every one) —
the subject branch now holds exactly those six, byte for byte as
predicted. Whether the group carries any of the collapse is still
UNKNOWN: the seventh commit, the person-trust baseline refresh,
cannot be placed at all, because it is written against a trust
feature the far end does not have — and a test file is never read
by the game anyway, so even a successful landing would be expected
to read NOT-CARRIER. The group stays unmeasured and stays on the
suspect list until the coordinator decides the route — most
plausibly measuring picks 1–6 alone as their own transplant (the
subject branch already holds them at 4eca36017 — the STEP would run
against that tip), or landing the person-trust feature first and
then re-running 15F whole.

## Coordinator decision owed

The route for family 15F given the pick-7 dependency on the
person-trust feature. Candidate shapes (the arm decides none of
these): (a) measure picks 1–6 alone as their own transplant (the
subject branch already holds them at 4eca36017 — run STEP
t15f-proofs against that tip, or a fresh STEP id); (b) land the
person-trust feature (family 10 side content, commit 458811411)
first, then re-run 15F (picks 1–7) on far end + person-trust;
(c) record the group unmeasurable-by-conflict as a unit and move
on. Note for the decision: the pick-7 conflict is a genuine
missing-feature dependency, not a tooling adjacency — the
tooling-resolution rule correctly stopped the arm, and no
resolution of balance-proof.json or phone-frame-proof.json would
have helped. The same person-trust dependency may recur in any arm
whose picks touch the person-trust test or prereg.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes. The
  flap-watch log read ALL-OK throughout (last lines 13:29–13:31Z,
  load 16–31, mem available 2–4GB). The box was heavily loaded
  instead: sibling check.js / balance-panel / sim processes
  saturated the machine (load 16–31), which made a full-tree `git
  diff` take ~16 min. All git work in this arm used bounded
  commands (object-database reads, pathspec-scoped diffs) and
  completed; the proof notes the scoping.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (39983cc74) — `git diff HEAD` showed both committed files as
  differing although the commit was correct (worktree hashes
  matched the HEAD blobs exactly: prereg 2ca2b94f…,
  proof 76c24686…). The checkout of the subject branch refused
  until the index was repaired. Repaired with the documented pipe
  (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); verified `git diff HEAD` empty + `git diff
  --cached` empty afterwards. No work lost.
- BACKGROUND EXEC SIGTERM: one background exec session (the
  checkout-back-to-arm-branch + heartbeat command) was SIGTERM'd
  by the runtime after its git work had finished (checkout
  complete, INDEX==HEAD) but before its trailing checks ran. No
  work was lost; the checks were re-run in a fresh exec and the
  heartbeat was re-landed (rc=0). Recorded so the termination is
  not mistaken for a flap window or a git failure.
- REGISTRY LOCK: the heartbeat landed promptly on both attempts
  (no lock-queue wait this arm), unlike the 15A-narrowed arm's
  contention.
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
prediction named both conflicted files and the exact modify/delete
class for pick 7, the live picks reproduced all seven predictions
exactly (including all six pick-resolved tree OIDs), and the arm
stopped without hand-resolving anything. Two process notes for
future arms: (1) a pick's merge-tree prediction must be built on
the TRUE preceding tree — the temp-index build plus the live
tree-equality check is what makes each next prediction
trustworthy; a prediction built on the bare far end would have
missed the pick-7 modify/delete shape (the files are absent from
the far end, so a far-end-based prediction would have shown a
different conflict class). (2) `git checkout --ours` does not mark
a conflict resolved — `git add` is still required before `git
cherry-pick --continue`. (3) The grouping prereg's 15F WARNING
named only the three tooling files, but pick 7's conflict is a
missing-feature dependency — future grouping notes should flag
picks whose files were added by side-branch commits, not just
tooling adjacency.

## Proof

- scripts/test-transplant15f.js — stage 1: 236 passed, 0 failed
  (committed with the prereg, 39983cc74); stage 2: 286 passed, 0
  failed total (50 stage-2 legs: live picks 1–6 tree equality,
  pick-7 STOP outcome, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs (re-run after the
  live picks; the step tooling was untouched, but the re-run
  confirms the shared harness still passes on this tree).
