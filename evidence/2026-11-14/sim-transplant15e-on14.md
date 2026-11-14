# sim-transplant15e-on14 — family 15E on far end + family 14 (Loop A, fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-on14-a, branch `sim-transplant15e-on14-a`,
worktree `~/workspace/worktrees/sim-transplant15e-on14-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-on14-prereg.md
(committed f617102ba, BEFORE the subject was cut or any judged sim
ran — the pre-check ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15E +
evidence/2026-11-14/sim-transplant15e-prereg.md (the 15E-alone arm) +
evidence/2026-11-14/sim-transplant12-14-prereg.md (the 12+14
precedent). Coordinator decision:
evidence/2026-11-14/sim-transplant-round-1215.md (next blank #2).

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 2)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15E on far end + family 14. No judged sim ran.
  Survived/8: unmeasured. Per-seed days: unmeasured. Wave-5:
  unmeasured.
- Subject branch `transplant-15e-on14-subject`: cut at the far end,
  pick 0 (family 14) applied at f4cd969ab (tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — exactly the predicted
  pick-0-resolved tree) and pick 1 applied at fab68249a (tree
  96db10b05bc53edd44dcb614fd5d22696dc3e4e7 — exactly the predicted
  pick-1-resolved tree). Pick 2 was attempted live and conflicted;
  the cherry-pick was aborted. Pick 3 was never attempted. Subject
  LEFT in place at fab68249a (far end + 14 + pick 1) for
  reproducibility.
- STEP t15e-on14: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15e-on14-prereg.md. Base:
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

- Pick 0 (family 14): 7688cb7a46367c88c7bb85e976502ddc0d5456f0
  "Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard".
  First parent 16cdd690062b3551ff6b4b0d3639770c8af84b5f. Second-parent
  side is 1 commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". Diff: 2 files —
  scripts/test-snippet-stage-direction.js +21/-0 (new),
  src/js/conversation.js +12/-0.
- Pick 1: bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver
  unfinished thread on resume-offer Yes". First parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0 (family 14). Diff: 3 files —
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
  chain d229b58f5..a628aeaf3: 7688cb7a4 → bb6a301cf → 7041e1bfb →
  4a1c77cf1 (15E picks at first-parent positions 10 / 24 / 42).
- Sequence dependencies: family 14 IS an ancestor of pick 1's
  first parent (it IS pick 1's first parent) and of pick 2's first
  parent; pick 1 IS an ancestor of pick 2's first parent; pick 2 IS
  an ancestor of pick 3's first parent. Family 14 is NOT an
  ancestor of the far end. Family 12 (merge ac119e4ed) IS an
  ancestor of pick 2's first parent — family 12 is NOT on the far
  end and is NOT picked by this arm.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check + live picks (the STOP)

- PICK 0 merge-tree prediction (base = pick's first parent
  16cdd69006, ours = far end 203a32775, theirs = 7688cb7a4):
  rc=0, CLEAN — no conflict. Merged tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the tree the
  12+14 prereg predicted. Prediction commit
  faa868ec01d43faa3592ada6055b490b0d037c05 (commit-tree of that
  tree, parent = far end). PREDICTION: cherry-pick -m 1 applies
  cleanly.
- PICK 1 merge-tree prediction (base = pick's first parent
  7688cb7a4, ours = predicted pick-0 commit faa868ec, theirs =
  bb6a301cf): rc=0, CLEAN — no conflict. Merged tree
  96db10b05bc53edd44dcb614fd5d22696dc3e4e7. Prediction commit
  ea25872dd93e38f0dc27d7b6837f2aa1bc4ab9b7 (commit-tree of that
  tree, parent = predicted pick-0 commit). Its diff vs the pick-0
  tree is exactly pick 1 (3 files, +148/-4). PREDICTION:
  cherry-pick applies cleanly.
- PICK 2 merge-tree prediction (base = pick's first parent
  c32ff6fa8, ours = predicted pick-1 commit ea25872d, theirs =
  7041e1bfb): rc=1, tree
  6bff133d3ba77e5e8b1928d8892c816382e57a3b, conflicted files:
  EXACTLY FOUR — scripts/balance-proof.json,
  scripts/phone-frame-proof.json,
  scripts/test-snippet-stage-direction.js,
  src/js/conversation.js. PREDICTION: CONFLICT, game-code included
  → STOP at pick 2. Conflict markers in the merged tree:
  conversation.js lines 1738/1742/1756;
  test-snippet-stage-direction.js lines 18/21/26;
  balance-proof.json lines 3/6/9; phone-frame-proof.json lines
  7/15/23 and 81/91/101. NOTE: same four files as the 15E-alone
  arm's pick-2 prediction, but a DIFFERENT mechanism — the
  function now exists on our side (see §Pick-2 mechanism).
- PICK 3: prediction NOT runnable (needs the pick-2-applied tree,
  which cannot exist if pick 2 stops). No pick-3 conflict status
  is claimed either way.
- LIVE PICK 0 (subject branch `transplant-15e-on14-subject`, cut
  at the far end): `git cherry-pick -m 1 7688cb7a4` rc=0, clean.
  Output: "Auto-merging src/js/conversation.js". Result: commit
  f4cd969ab "Merge pull request #10 from steve-vitale/cursor/
  snippet-stage-direction-guard", 2 files +33, tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the predicted
  pick-0-resolved tree. The 12+14 prediction is reproduced live
  for the third time (scaffold e45649c68, 12+14 subject, this arm).
- LIVE PICK 1: `git cherry-pick bb6a301cf` rc=0, clean. Output:
  "Auto-merging src/js/conversation.js". Result: commit fab68249a
  "Deliver unfinished thread on resume-offer Yes", 3 files
  +148/-4, tree 96db10b05bc53edd44dcb614fd5d22696dc3e4e7 — EXACTLY
  the predicted pick-1-resolved tree. Subject diff vs far end at
  this point: 4 files, +181/-4 (conversation.js +58/-4 =
  family 14's +12 plus pick 1's +46/-4; test-snippet-stage-
  direction.js +21; story-offer-yes-followthrough.md +29;
  test-story-offer-yes-20261108.js +73).
- LIVE PICK 2: `git cherry-pick 7041e1bfb` rc=1. Output:
  "Auto-merging scripts/balance-proof.json", "CONFLICT (content):
  Merge conflict in scripts/balance-proof.json", "Auto-merging
  scripts/phone-frame-proof.json", "CONFLICT (content): Merge
  conflict in scripts/phone-frame-proof.json", "Auto-merging
  scripts/test-snippet-stage-direction.js", "CONFLICT (content):
  Merge conflict in scripts/test-snippet-stage-direction.js",
  "Auto-merging src/js/conversation.js", "CONFLICT (content):
  Merge conflict in src/js/conversation.js", "Auto-merging sw.js".
  Status at conflict: A evidence/2026-11-08/neutral-ove33-master-
  quick.json.gz, A evidence/2026-11-08/phone-ove33-frame-736-r1.json,
  A evidence/2026-11-08/phone-ove33-frame-844-r1.json,
  UU scripts/balance-proof.json,
  M scripts/godpath/test-mobile-combat-cadence.js,
  M scripts/godpath/test-occupation-panels.js,
  M scripts/godpath/test-time-save-crashes.js,
  UU scripts/phone-frame-proof.json,
  M scripts/test-establishment-r20-fixes-20261020.js,
  UU scripts/test-snippet-stage-direction.js,
  UU src/js/conversation.js, M sw.js. Conflict markers:
  src/js/conversation.js lines 1738 (`<<<<<<< HEAD`), 1742
  (`=======`), 1756 (`>>>>>>> 7041e1bfb (OVE-33: …)`);
  scripts/test-snippet-stage-direction.js lines 18/21/26;
  scripts/balance-proof.json lines 3/6/9;
  scripts/phone-frame-proof.json lines 7/15/23 and 81/91/101.
  One difference from the 15E-alone arm: the test file conflicts
  UU (content) here, not DU (modify/delete) — because the file
  EXISTS on our side now (family 14 added it). The live pick
  reproduces the merge-tree prediction EXACTLY (same four files,
  same marker lines). Per the tooling-resolution rule the arm
  STOPPED: the cherry-pick was aborted (`git cherry-pick --abort`,
  rc=0), no file was hand-resolved, no narrowed re-run was
  decided.
- Recovery after the abort: HEAD back on
  transplant-15e-on14-subject at fab68249a, tree
  96db10b05bc53edd44dcb614fd5d22696dc3e4e7, tracked tree clean, no
  CHERRY_PICK_HEAD, exactly 2 commits on top of the far end. The
  subject branch is LEFT in place at fab68249a (far end + 14 +
  pick 1) for reproducibility. PICK 3 was never attempted. The arm
  branch was then checked back out (sim-transplant15e-on14-a at
  f617102ba, clean).
- Resolutions recorded (file, pick, method): NONE. Pick 0 and
  pick 1 applied cleanly (no resolution needed — neither touches
  a tooling file). Pick 2 was aborted with no file resolved by any
  method: the two tooling files (balance-proof.json,
  phone-frame-proof.json) were NOT resolved --ours, because the
  pick also conflicted on src/js/conversation.js and
  scripts/test-snippet-stage-direction.js, and the rule stops the
  arm on any non-tooling conflicted file.

## Why pick 2 cannot land even with family 14 (plain words + mechanism)

Pick 2 (OVE-33) is mostly a proof refresh, but its one game-code
change — a 4-line quote check inside `convoSnippetIsStageDirection`
("a line with a quote in it is real speech, not stage direction")
— is written against the family-12-widened form of that function.
Family 14 supplies the function, but only in its narrow original
form: `const s = String(sn).trim();` and a 2-line return test
("Still on what they confided"). Pick 2's insertion anchors on
the line `const s = String(sn).trim().replace(...)` — the
quote-strip that family 12 added when it widened the guard to
cover warm silence ("You say nothing…"), recap scaffolding
("Still on…", "Say it plain…"), and wind-down filler ("Anyway. A
small smile."). That anchor line does not exist on our side, and
the whole function body differs, so git conflicts the hunk even
though the function itself is present. In the merged tree the OURS
side is the narrow body (lines 1739–1741) and the THEIRS side is
the widened body plus the OVE-33 quote check (lines 1743–1755).
The test-file conflict is the same class: pick 2's +4 inserts
OVE-33 assertions after the 'water haul' assertion, at a point
where the base file (74 lines) carries family 12's OVE-29
assertions immediately after and our file (21 lines, family 14
only) ends. Family 12 (merge ac119e4ed) IS an ancestor of pick 2's
first parent c32ff6fa8 and is NOT an ancestor of the far end.
In short: the (a) route decided in round-1215 — land family 14
first, then re-run 15E — does NOT unblock 15E as a unit, because
pick 2 depends on family 12's widening of the same guard, not
only on family 14's guard. The group needs 14+12 first, or a
narrowed route — a coordinator decision, not this arm's.

## What this means (plain words)

Family 15E is the resume / conversation-repair group: saying Yes
to "Want to hear where it left off?" now actually continues the old
conversation instead of brushing it off; quoted speech stops being
mistaken for stage direction in resume openers; a trader who was
about to introduce themselves before you saved doesn't lose their
turn. The first two steps landed cleanly on the far end exactly as
predicted — the guard itself and the resume-offer repair both
transplant fine, and the temp-index predictions were validated by
the live picks tree-for-tree. But the second 15E commit cannot be
placed at all, because it is written against a wider version of
the guard that the far end never had — a version that comes from
family 12, which this arm did not pick. Whether the group carries
any of the collapse is still UNKNOWN: only one of its three
commits (plus the prerequisite guard) sits on the far end, and no
sim ran. The group stays unmeasured and stays on the suspect list
until the coordinator decides the route.

## Coordinator decision owed

The route for family 15E given that the round-1215 (a) route
(land family 14 first) does NOT unblock it. Candidate shapes (the
arm decides none of these): (a2) land 14+12 first, then re-run
15E whole (the 12+14 pair is MEASURED NOT-CARRIER, so its subject
exists — the guard + widening together are a known quantity);
(b) measure pick 1 alone as its own transplant — TWO subject
branches already hold it (transplant-15e-subject at f541e4cd1 on
the bare far end, and this arm's transplant-15e-on14-subject at
fab68249a on far end + 14; the bare-far-end one is the cheaper,
cleaner instrument); (c) measure pick 1 + pick 3 (pick 3 touches
conversation.js regions that exist at the far end plus
villager-objectives.js — untested); (d) record the group
unmeasurable-by-conflict as a unit. Note for the decision: the
pick-2 conflict is a genuine code dependency (on family 12's
widening), not a tooling adjacency — the tooling-resolution rule
correctly stopped the arm, and no resolution of
balance-proof.json / phone-frame-proof.json would have helped.
The same family-12 dependency may recur in any arm whose picks
touch convoSnippetIsStageDirection or its test file past the
family-14 form.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  The flap-watch log read ALL-OK throughout the arm
  (14:24–14:28Z checks). No write failure occurred at any step
  (prereg, proof, commits, picks, abort all wrote cleanly). The
  one write-adjacent incident was the safe-commit index clobber
  below, which is a git-index phenomenon, not a flap denial.
- REGISTRY LOCK CONTENTION: the first heartbeat took ~87s to land
  (registry lock queue) — mild compared with the 11–16 min waits
  of the 1215Z run. A second heartbeat was run before the final
  commit; the tree was created with a fresh heartbeat and the
  reaper's staleness line is 4h, so there was no reaper risk.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (f617102ba) — `git status` showed both committed files as
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
predictions named all four conflicted files and the exact
conversation.js hunk lines for BOTH the pick-0/pick-1 clean
applies and the pick-2 STOP, the live picks reproduced all three
predictions exactly (including the pick-0-resolved tree
bc52919e… and the pick-1-resolved tree 96db10b0…), and the arm
stopped without hand-resolving anything. Two process notes for
future arms: (1) a pick's merge-tree prediction must be built on
the TRUE preceding tree — the pick-2 prediction rebuilt on the
family-14-applied tree (not the bare far end) is what exposed
the SECOND dependency: the 15E-alone arm's pick-2 conflict and
this arm's pick-2 conflict share the same four files, but the
mechanism differs (missing function vs narrow function body), and
only the rebuilt prediction shows the difference. (2) The
merge-tree OID depends on the refs AS SPELLED: full 40-char
hashes in every invocation, as the 15E prereg records — the proof
asserts the trees its own full-hash invocations produce (here
bc52919e…, 96db10b0…, 6bff133d…).

## Proof

- scripts/test-transplant15e-on14.js — stage 1: 172 passed, 0
  failed (committed with the prereg, f617102ba); stage 2: 208
  passed, 0 failed total (live pick-0/pick-1 tree equality,
  pick-2 STOP outcome, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs (re-run after the
  live picks; the step tooling was untouched, but the re-run
  confirms the shared harness still passes on this tree).
