# sim-transplant15e-p3conv — narrowed family 15E pick 3, conversation.js ONLY (Loop A, fleshout-20261114T1736Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p3conv-a, branch
`sim-transplant15e-p3conv-a`, worktree
`~/workspace/worktrees/sim-transplant15e-p3conv-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-p3conv-prereg.md
(committed 18f6870fe, BEFORE the subject was cut or any judged sim
ran — the pre-check ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ evidence/2026-11-14/sim-transplant15e-prereg.md (pick identities,
first parents, tooling-resolution rule) +
evidence/2026-11-14/sim-transplant15e-1412.md (the 15E-on-14+12 arm:
proved live that pick 3's conversation.js hunk merges clean while
its villager-objectives.js hunk conflicts on a genuine Phase 4
dependency; its "Coordinator decision owed" candidate (e) is the
narrowed conversation.js-only route this arm executes, by
coordinator decision).

## Outcome

- OUTCOME: MEASURED — the narrowed unit was built and judged.
- VERDICT: NOT-CARRIER
- Survived: 4/8 — per-seed days: 86/144/150/43/150/87/150/150;
  survivors 190393, 190395, 190397, 190398.
- The per-seed days are EXACTLY the far-end days, seed-for-seed:
  the summary's own endpoints.far.days read
  86/144/150/43/150/87/150/150, and the subject reproduces them
  on all 8 seeds, with the same four survivors. The narrowed
  pick-3-conversation unit moves NOTHING on the collapse band —
  not survival, not a single seed's trajectory.
- Wave-5: 2/8 (190393, 190397), wave-4: 8/8, regional: 7/8,
  village: 1/8, national: 0, table: 0, wins: 0.
- Median: 150d, deaths: 629, standing range: 150–325, blooded:
  4/8, tribute-ready: 1/8 (190397, veterans 2, reason ready).
- Death-cause shares: villager combat 267 (42%), combat 130
  (21%), expedition 126 (20%), the wild 74 (12%), monster 13
  (2%), the rest ≤3 each (Spool 2, a stranger 2, the arena 2,
  ambush 3, contest 3, a wound that wouldn't close 3, the night
  1, Big-Eyes 1, alien 1, starvation 1). Combat/expedition-
  dominated, the same profile as the far end and every other
  transplant arm.
- Instrument errors: 0 on all 8 seeds.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15e-p3conv-prereg.md. Base:
far end 203a32775 (GOOD 4/8) with the roster-check standing fix
swapped in for every step (fix f8fda4295a99; native restored
byte-identical afterwards, sha-verified). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step. Thresholds
for the narrowed unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
with a fresh STEP id; ≥3/8 NOT-CARRIER. STOP clause per the
coordinator tooling-resolution rule, as narrowed by the
coordinator decision: the pick may conflict ONLY on the two
predicted files (balance-proof.json, tooling, resolved --ours;
villager-objectives.js, game code, DROPPED by coordinator
decision and restored byte-identical to the far end); a
conversation.js conflict, or any conflict on any other file,
STOPS the arm as UNMEASURED-BY-CONFLICT.

## The narrowed unit (what was measured, and what was not)

- Pick 3: 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 "OVE-57:
  triage tip quick-check after bond dawn". First parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc (family 15B). Diff:
  4 files — evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz
  (binary, new), scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2.
- MEASURED: only the conversation.js hunk — a trader introduction
  that survived Continue stays deferred
  (`c.tradeIntroDeferred = true` at close) and must still surface
  once the next opener has spoken (queueTraderIntro rework: a
  deferred intro surfaces once the opener has spoken, stage >= 1,
  instead of waiting for a whole new engagement arc to reach
  stage 3). In plain words: a trader who was about to introduce
  themselves before you saved doesn't lose their turn.
- UNMEASURED: the villager-objectives.js half of OVE-57 — the
  rally-guard path skips the invite lottery so it draws no new RNG
  (`rally-volunteer` decision, commit via objCommitGuardOffer). It
  stays UNMEASURED because it is written against the origin-line
  Phase 4 form of villager-objectives.js (ranked candidates via
  companionRank, the npcInviteDecision lure lottery,
  objCommitGuardOffer — 5 hits at pick 3's base, 0 at the far end)
  that the far end never had. It was NOT hand-resolved and NOT
  smuggled in: the subject restores that file byte-identical to
  the far end. Whether the rally-guard lottery skip carries any of
  the collapse is still UNKNOWN, and it stays on the suspect list
  until the coordinator decides its route (it needs the Phase 4
  objectives content landed first, or a re-implementation against
  the far end's form — a coordinator/Steve call, not this arm's).

## Merge-tree pre-check + live pick

- Pre-check (base = pick's first parent 134a3d0ab, ours = far end
  203a32775, theirs = 4a1c77cf1, full 40-char hashes):
  rc=1, merged tree 7dd5d9c62060d6b319ca7732a0baa10af3f1d400,
  conflicted files EXACTLY TWO — scripts/balance-proof.json
  (tooling) and src/js/villager-objectives.js (game code).
  src/js/conversation.js AUTO-MERGED CLEAN (merged blob
  8a20a5ec8e62fea3d159df66710b554f1d2c646a). Conflict markers in
  the merged tree: balance-proof.json lines 3/6/9;
  villager-objectives.js lines 23/25/29 and 957/972/1039 —
  EXACTLY the same files and marker lines the 15E-on-14+12 arm's
  pick-4 prediction named (its merged tree 627f198e…),
  reproduced here on the bare far end. BOTH section kinds were
  read (the `changed in both` stage 1/2/3 entries AND the
  `Auto-merging` messages).
- Predicted narrowed-subject tree (temp-index construction from
  the merge-tree output: merged tree with both conflicted files
  set to their far-end blobs and the new evidence receipt
  removed): 6ab07a5d4aa69dc66493e29cf6805e43849881a5; prediction
  commit dcbc30fba002d2c8a2772e36a45b0050b4b5eb09 (parent = far
  end). Its diff vs the far end is EXACTLY conversation.js
  +21/-2.
- LIVE PICK (subject branch `transplant-15e-p3conv-subject`, cut
  at the far end): `git cherry-pick 4a1c77cf1` rc=1. Output:
  "CONFLICT (content): Merge conflict in
  src/js/villager-objectives.js" (balance-proof.json conflicted
  too; the cherry-pick's own output named only the objectives
  file in the tail shown, but status showed both). Status at
  conflict: A evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz,
  UU scripts/balance-proof.json,
  M src/js/conversation.js,
  UU src/js/villager-objectives.js. The live pick reproduces the
  merge-tree prediction EXACTLY (same two files; conversation.js
  merged, not conflicted). Per the prereg method: both conflicted
  files resolved with `git checkout --ours` (far-end versions),
  the evidence receipt removed (`git rm -f` — it is a NEW file in
  the pick, ABSENT at the far end, so "byte-identical to the far
  end" means absent), then `git cherry-pick --continue`. Result:
  commit 740c9ab963da5434dd6166885020adb1143c2ae6 "OVE-57: triage
  tip quick-check after bond dawn", tree
  6ab07a5d4aa69dc66493e29cf6805e43849881a5 — EXACTLY the predicted
  narrowed-subject tree. Its diff vs the far end is exactly
  conversation.js +21/-2; villager-objectives.js and
  balance-proof.json are byte-identical to the far end; the
  evidence receipt is absent. Subject branch LEFT in place at
  740c9ab96 (far end + pick-3 conversation.js hunk only) for
  reproducibility. The arm branch was then checked back out
  (sim-transplant15e-p3conv-a at b3773679e, clean).
- Resolutions recorded (file, pick, method): pick 3 —
  scripts/balance-proof.json, `git checkout --ours` (far-end
  version kept byte-identical); pick 3 —
  src/js/villager-objectives.js, `git checkout --ours` (far-end
  version kept byte-identical — the hunk is DROPPED by
  coordinator decision, not hand-resolved); pick 3 — evidence
  receipt, REMOVED from the subject (absent at the far end).
- One resolution wrinkle, recorded honestly: the first
  `git checkout --ours` wrote the correct far-end content into
  the worktree files (0 conflict markers afterwards; hashes
  d0c6a42f / 9afc522b, the far-end blobs) but did NOT collapse
  the index stages — `git ls-files -u` still showed stages 1/2/3
  for both files, and the later `git cherry-pick --continue`
  failed twice on a transient index.lock ("File exists", no live
  git process held it, the file itself was gone on inspection —
  a concurrent index write elsewhere on the shared repo, same
  class as the 1412 arm's slow-checkout note). The resolution
  was completed with `git add` on the two already-correct files
  (conflict-resolution marking, not staging for a commit — the
  standard cherry-pick completion flow), after which
  `git ls-files -u` was empty and the continue succeeded. No
  file was hand-edited at any point; the resolved content is the
  far end's, byte-identical.

## Step

- STEP id: t15e-p3conv, ran ~34 min (STEP-EXIT 0), fix swapped in
  (f8fda4295a99), native restored sha-verified (75762cb2259d),
  policy a7ff5c516440 (far-end own policy).
- Driver log: evidence/2026-11-13/culpritbisect-a-t15e-p3conv-driver.log
- Summary: evidence/2026-11-13/culpritbisect-a-t15e-p3conv-summary.json
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t15e-p3conv/
  (8 per-seed JSONs).
- Per-seed table (days / end / wave / rank / standing / deaths):
  190391: 86 / village-lost / 4 / regional / 199 / 88
  190392: 144 / village-lost / 4 / regional / 199 / 77
  190393: 150 / survived / 5 / regional / 325 / 66
  190394: 43 / village-lost / 4 / village / 150 / 52
  190395: 150 / survived / 4 / regional / 199 / 96
  190396: 87 / village-lost / 4 / regional / 199 / 80
  190397: 150 / survived / 5 / regional / 275 / 74
  190398: 150 / survived / 4 / regional / 199 / 96
- Why the seed-for-seed identity is expected, not suspicious: the
  measured hunk gates a queued dialogue beat on a stage number
  (stage >= 1) and draws no new RNG — it cannot change the RNG
  stream, so a deterministic harness reproduces the far end's
  trajectories exactly when the trigger never fires. The trigger
  never fired on this band (see SENSE-TESTING below): no trader
  was met, so no intro was ever pending. The verdict is therefore
  a clean NOT-CARRIER on the survival metric, and the identity
  itself is the mechanism check that the hunk is inert here.

## What this means (plain words)

Family 15E is the resume / conversation-repair group. This arm
isolated its last commit's conversation half — the trader who was
about to introduce themselves before you saved doesn't lose their
turn — and put it alone on the far end. The far end survived 4 of
8 villages, and with the trader-intro repair in place it still
survived exactly the same 4, on exactly the same days, with the
same two villages reaching wave 5. The repair changes nothing
about whether villages live or die: it is not the collapse, and
not part of it. The other half of the same commit — a villager
volunteering as guard without rolling dice — could not even be
placed on this far end, because it is written for a newer version
of the guard-volunteer code the far end never had; whether THAT
half carries any of the collapse is still unknown, and it stays
on the suspect list. The wall numbers do not move: national 0,
table 0, wins 0 on the collapse band.

## SENSE-TESTING NOTE (read the transcripts, not just the counts)

- The sampled vetSays lines read as the game's established
  System voice, coherent throughout: door-defense reports name
  the defenders and who is hurt ("Lauren, Bessie, Pilar and
  Aroha met them at the door — 4 put down. Lauren, Bessie,
  Pilar, Aroha are hurt."); veteran-kill callouts name the killer
  and the beast on camera ("Bessie just put down Spool... on
  CAMERA. That's a veteran kill, folks. REMEMBER the name.");
  Arc IV arrives on the surviving seed ("FINALES need a NATION.
  You've got a region; now make it a REALM."). The lost seed
  (190391, dead day 86) fights at the door to the end, with
  repeated veteran kills (Elder Sunbasker, Ad Break, The Focus
  Group) — villagers act like people defending a home, not
  numbers draining.
- The honest limit: the measured dialogue path went UNEXERCISED —
  0 trader mentions across the whole 8-seed corpus (225 vetSays
  lines), and no `tradeIntroDeferred` state appears in any
  per-seed snapshot. The competent bot policy never meets a
  trader on this band, so no intro is ever pending, deferred, or
  re-surfaced. This arm therefore proves the hunk is
  survival-inert (4/8, seed-for-seed identical), NOT that the
  deferred intro surfaces correctly when it does fire — that
  behavior is proven only by the pick's own unit tests on the
  origin line, not by these sims. If the deferred intro ever
  needs sim-level proof, it needs a scenario that actually puts
  a trader in front of the player before Continue, not a
  survival band.

## Findings for the backlog

- None new from this arm's sims beyond the unmeasured-objectives
  half, which is already the standing coordinator decision owed
  from the 1412 arm (its candidate (e) route is now executed;
  the remaining decision is the villager-objectives.js half's
  route). No new sim-findings.md entry — the open item is the
  1412 arm's, not a new observation.

## Infrastructure

- HOST WRITE FLAP / INDEX LOCK: the flap-watch note updated
  2026-11-14 (alignment synthesis): the refusal is at the write
  step for fresh/empty files. This arm's writes all succeeded
  (no EPERM window struck any write). Two transient index.lock
  collisions struck git operations in this tree ("File exists",
  no live git process, lock file gone on inspection) — once
  during the cherry-pick resolution, once during a repair-pipe
  verification. Both cleared on retry; no data lost. The lock
  errors are concurrent-index-write collisions on the shared
  repo (the coordinator's status-check loop polls this tree
  every 240s), not flap denials — the lock file never persisted.
- SAFE-COMMIT INDEX CLOBBER: struck on BOTH commits in this arm
  (prereg commit 18f6870fe: files staged-deleted + untracked;
  stage-2 commit b3773679e: file MM). Both repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); verified `git status
  --short` empty + `git diff HEAD` empty + hash-object == HEAD
  blob per file afterwards. No work lost. One repair verification
  was itself misleading: the verification commands in the same
  invocation hit the transient index.lock and printed nothing,
  which read as "clean" — the clobber was only caught by a
  re-run that checked the INDEX blob explicitly
  (`git ls-files -s` showed the stale stage-1 blob). Lesson for
  future arms: verify a clobber repair by comparing the index
  blob (`git ls-files -s`) against HEAD, not by empty status
  output alone — an empty status can be a failed read, not a
  clean tree.
- COORDINATOR HEADS-UP (broader clobber, staged-deleted entries
  for untouched files + evidence/2026-11-12/ unreadable): checked
  at receipt and again after the step — NOT present at either
  check. Mid-step status showed only the expected swap (` M
  src/js/standing.js`) plus untracked step artifacts; after
  checkout back to the arm branch, status showed only the 3
  untracked step artifacts and `git diff HEAD` was empty. The
  warning describes a transient mid-checkout restat state (the
  step's detached checkout of the far-end-based subject tree
  temporarily drops arm-branch-only files from the index), not
  real deletions: every named file was verified byte-identical
  to HEAD where it exists in the worktree, and no deletion was
  committed. No action taken beyond verification.
- Slow git under load, not failed: `git checkout` back to the
  arm branch took ~3 min (index restat on the shared repo);
  the step ran ~34 min (vs transplant11's ~14.5 min) with
  sibling sims and check.js runs sharing the box.
- No pushes, no version bumps, no live verification (ship loop
  owns deploys).
- Telemetry deviation check: ATTEMPTED — REFUSED by the tool
  (recorder-corpus class: "refusing recorder-corpus input: all 8
  --current rows carry top-level anchorCommit, so they are sweep
  recorder rows, not runs"). Baseline NOT rolled. The refusal is
  the expected outcome for these corpora, recorded here, not
  waived.

## Metric review

No metric proved wrong. The primary (survived/8, thresholds fresh
per 2115 §3) read 4/8 outright — NOT-CARRIER, no re-run owed
(4/8 is not the 2/8 ambiguous band). The seed-for-seed identity
with the far end sharpens the verdict rather than weakening it:
a hunk that draws no RNG and whose trigger never fires cannot
move survival, and the identical days on all 8 seeds confirm
the mechanism (dialogue gating, no RNG) rather than merely the
count. One process note for future arms: a pick's merge-tree
prediction must be built on the TRUE preceding tree (here the
bare far end, per the prereg) — and the merge-tree OID depends
on the refs AS SPELLED: the proof invokes it with full 40-char
hashes, as the 15E prereg records (a short spelling gives a
different tree OID for the same file set — the stage-1 proof
caught exactly this, 93/94 before the fix). Wall numbers:
unmoved — survived 4/8, regional 7/8, national 0, table 0, wins
0, wave-5 2/8, wave-4 8/8, median 150d.

## Proof

- scripts/test-transplant15e-p3conv-a.js — stage 1: 94 passed, 0
  failed (committed with the prereg, 18f6870fe); stage 2 §8:
  113 passed, 0 failed total (live pick 740c9ab96, tree
  6ab07a5d… = predicted, diff exactly conversation.js +21/-2,
  both files byte-identical to the far end); stage 2 §9 appended
  after the step (step verdict 4/8 NOT-CARRIER, seed-for-seed
  far-end identity, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs (not re-run by this
  arm; the step tooling was untouched and the step ran through
  the same script — the step script is named, not executed, by
  this arm's proof).
