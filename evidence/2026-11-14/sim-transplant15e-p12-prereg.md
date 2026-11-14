# sim-transplant15e-p12-prereg — 15E picks 1+2 on far end + family 14 + family 12 (Loop A, fleshout-20261114T1736Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p12-a, branch `sim-transplant15e-p12-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p12-a`.

## Authority

This arm measures the unit the prior arm left measurable: the
15E-on-14+12 arm (evidence/2026-11-14/sim-transplant15e-1412.md,
arm sim-transplant15e-1412-a) stopped UNMEASURED-BY-CONFLICT at
its pick 4 (4a1c77cf1, OVE-57 — villager-objectives.js Phase 4
dependency); its subject branch `transplant-15e-1412-subject`
already holds far end + family 14 + family 12 + 15E pick 1
(bb6a301cf) + 15E pick 2 (7041e1bfb) at 312647db0, and its STEP
t15e-on1412 never ran. The coordinator decision owed in that
evidence file lists candidate (c) "measure picks 2+3 (both apply
cleanly on 14+12 — the subject at the STOP point holds exactly
that, plus the tooling-resolved pick 3)" — in this arm's
numbering, picks 1+2. This arm takes candidate (c): it measures
picks 1+2 as one unit on the already-built subject. It does NOT
re-litigate the pick-4 conflict and does NOT decide any other
candidate.

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md
§3 (H1 transplant program definition + thresholds + conflict
rule) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99,
step mechanics) + evidence/2026-11-14/sim-transplant15e-prereg.md
(pick identities, first parents, tooling-resolution rule,
merge-tree pre-check convention) +
evidence/2026-11-14/sim-transplant15e-1412-prereg.md (the 14+12
route, pick numbering 0–4) +
hidden_files/family15-grouping-prereg-2026-11-14.md §15E.

## COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's family-15 arms, decided 2026-11-14 ~10:00Z)

Pick in origin order. If a pick conflicts ONLY on zero-src-reader
tooling files (scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json), resolve EACH such file with
`git checkout --ours` (keep the far-end version byte-identical)
and continue the cherry-pick — do NOT hand-edit. If ANY other file
conflicts (any src/js, data, policy, docs, or test file), STOP
immediately, report the exact conflict list, do NOT hand-resolve,
do NOT decide a narrowed re-run. The proof MUST assert: (1) the
subject's game-code diff equals the picks' diff exactly, and (2)
each resolved tooling file is byte-identical to the far end.
Record every resolution (file, pick, method) in prereg + evidence.

This arm performs NO cherry-pick: the subject already exists
(built by the prior arm, verified here — see §Subject
verification). The rule therefore binds only as the record of
how the subject's pick 2 (7041e1bfb) was resolved (tooling-only,
both files --ours, recorded in sim-transplant15e-1412.md). No
resolution is performed or decided by this arm.

## Prereg (binding, committed BEFORE running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check
  standing fix swapped in for every step exactly as the bisect
  prereg specifies (fix file sha f8fda4295a99, from commit
  5157782a4; native restored byte-identical afterwards,
  sha-verified).
- Subject: the EXISTING branch `transplant-15e-1412-subject` at
  312647db0 — far end + family 14 (merge 7688cb7a4) + family 12
  (merge ac119e4ed) + pick 1 (bb6a301cf) + pick 2 (7041e1bfb).
  VERIFIED by this arm before any judged sim (see §Subject
  verification). Do NOT rebuild the subject. NEVER committed to
  the arm branch. Branch LEFT in place, hash recorded in
  evidence, so the verdict is reproducible.
- Unit judged: 15E picks 1+2 ONLY, on top of the exonerated
  14+12 base (see §Base exoneration). Pick numbering in THIS arm:
  pick 1 = bb6a301cf "Deliver unfinished thread on resume-offer
  Yes" (= pick 2 of the 1412 arm); pick 2 = 7041e1bfb "OVE-33:
  refresh stale quick proofs and fix outside-Muse fails" (= pick 3
  of the 1412 arm). The 1412 arm's pick 4 (4a1c77cf1, OVE-57) is
  NOT in the subject and NOT judged here.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the PICKS-1+2
  UNIT as one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
  with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated
  as NOT-CARRIER for ordering but kept on the suspect list — per
  round-1355 metric review, a deterministic re-run is vacuous, so
  if the re-run is per-seed identical, record AMBIGUOUS and note
  the determinism; the honest resolver is a fresh seed band, not
  a third run of this band); ≥3/8 NOT-CARRIER. If the unit reads
  CARRIER, the next arm splits it commit-by-commit (same rule as
  2115 §3 (c) for families 4 and 13).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: not applicable to this arm's construction — no
  cherry-pick is performed (subject verified, not cut). If the
  subject verification had failed, the arm would have FAILED
  LOUDLY and stopped with no judged sim (see §Subject
  verification).
- STEP id: t15e-p12 (fresh — no prior STEP id exists for this
  picks-1+2 combination; the 1412 arm's STEP t15e-on1412 never
  ran).

## Base exoneration (why this subject measures picks 1+2)

- Family 14 alone is MEASURED NOT-CARRIER 4/8
  (evidence/2026-11-14/sim-transplant14.md, arm
  sim-transplant14-a, STEP t14-7688cb7a4): survived 4/8,
  per-seed days 86/144/150/43/150/87/150/150, BYTE-IDENTICAL to
  the far-end endpoint days.
- The 12+14 pair is MEASURED NOT-CARRIER 4/8, seed-for-seed
  identical to the far end
  (evidence/2026-11-14/sim-transplant12-14.md, arm
  sim-transplant12-14-a, STEP t12-14-combined, subject
  transplant-12-14-subject at c8655548f, tree e78fac42… — the
  same tree this arm's subject carries at its pick-1 commit
  588f054d1): survived 4/8, per-seed days
  86/144/150/43/150/87/150/150, IDENTICAL to the far-end
  baseline on all 8 seeds.
- Any collapse in this subject is therefore attributable to 15E
  picks 1+2 (the only content the subject adds on top of the
  exonerated 12+14 base). The far-end baseline for comparison is
  4/8 (GOOD), per-seed days 86/144/150/43/150/87/150/150.

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat (a teaser/invitation is not
quotable as the thread's content-memory); resume openers are
structural grammar; a resume opener that asks whether to hear /
pick up the unfinished thread must deliver that thread; resume
openers must quote real spoken memory, never stage direction or
meta scaffolding. No standalone canon doc covers the OVE-33 pick
itself — the picks are coherence repairs inside the documented
conversation contract (resume-offer Yes delivers the thread;
stage-direction quotes stay out of resume openers), not new
systems. Nothing here invents canon.

## Family content (read before the picks)

- Pick 1, bb6a301cf "Deliver unfinished thread on resume-offer
  Yes": when a resume opener asks whether to hear / pick up the
  unfinished thread, Yes must deliver that thread — not a generic
  "I see." acknowledgment. Tags the opener's return
  (`resumeOffer: true`, thread id) so startConvo marks the hanging
  genericQ (`c.genericQ.resumeOffer = true`, `resumeTid`), and the
  gq:yn handler follows through to the thread instead of GQ_ACK.
  In plain words: saying Yes to "Want to hear where it left off?"
  now actually continues the old conversation instead of brushing
  it off.
- Pick 2, 7041e1bfb "OVE-33: refresh stale quick proofs and fix
  outside-Muse fails": mostly a proof refresh (phone-frame receipts,
  balance-proof refresh, godpath test fixes). Its ONE game-code
  hunk is in src/js/conversation.js (+4/-0): inside
  `convoSnippetIsStageDirection`, a quoted beat ("They go still.
  \"So it's not just me…\"") is real memory, not stage direction —
  only pure mood/silence narration counts as stage direction. How
  its js file is handled: the +4 hunk inserts after the
  `.replace(...)` quote-strip anchor line, a line that exists ONLY
  in the family-12-widened form of the function (see §Pick-2
  mechanism). Its test file scripts/test-snippet-stage-direction.js
  (+4) inserts OVE-33 assertions after the 'water haul' assertion,
  at a point where the base file carries family 12's OVE-29
  assertions immediately after. The pick's other files are evidence
  receipts (.json/.gz), tooling proof files
  (scripts/balance-proof.json 2/2, scripts/phone-frame-proof.json
  6/6), godpath test fixes, and sw.js +1.

## Family identity (verified at run start, before any sim)

- Pick 0 (family 14): 7688cb7a46367c88c7bb85e976502ddc0d5456f0
  "Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard".
  First parent 16cdd690062b3551ff6b4b0d3639770c8af84b5f. Second-parent
  side is 1 commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". Diff: 2 files —
  scripts/test-snippet-stage-direction.js +21/-0 (new),
  src/js/conversation.js +12/-0.
- Pick 1 (family 12): ac119e4ed27b2aa66131929795a4d3d0f381900b
  "Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726".
  First parent aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0. Second-parent
  side is 1 commit: 3015beec0aefd3a3db394b73c362c2af9f4c2f84 "Reject
  residual silence/meta resume memory quotes". Diff: 2 files, +73/-5 —
  scripts/test-snippet-stage-direction.js +55/-2 (edited),
  src/js/conversation.js +18/-3.
- Pick 1 (this arm's numbering; 1412 arm's pick 2):
  bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver unfinished
  thread on resume-offer Yes". First parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0 (family 14). Diff: 3 files —
  evidence/2026-11-08/story-offer-yes-followthrough.md +29/-0,
  scripts/test-story-offer-yes-20261108.js +73/-0 (new test),
  src/js/conversation.js +46/-4.
- Pick 2 (this arm's numbering; 1412 arm's pick 3):
  7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33: refresh
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
- NOT in the subject: pick 4a1c77cf1 "OVE-57: triage tip
  quick-check after bond dawn" (1412 arm's pick 4) — it stopped
  UNMEASURED-BY-CONFLICT (villager-objectives.js Phase 4
  dependency) and is NOT judged by this arm.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: 7688cb7a4 (family 14) → ac119e4ed
  (family 12) → bb6a301cf → 7041e1bfb (15E picks at first-parent
  positions 10 / 24 of 51; family 14 precedes family 12 precedes
  both 15E picks on the origin line).
- Sequence dependencies: family 14 IS an ancestor of family 12's
  first parent aa5d9ef92; family 14 IS an ancestor of pick 1's
  first parent (it IS pick 1's first parent) and of pick 2's first
  parent c32ff6fa8; family 12 IS an ancestor of pick 2's first
  parent; pick 1 IS an ancestor of pick 2's first parent.
  Family 14 and family 12 are NOT ancestors of the far end. The
  12+14 pair is MEASURED NOT-CARRIER (subject
  transplant-12-14-subject at c8655548f, tree e78fac42… — the same
  tree this arm's subject carries at its pick-1 commit 588f054d1).
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Subject verification (run at run start, before any sim — the subject EXISTS, it is verified, NOT rebuilt)

`git log --oneline --reverse 203a32775..transplant-15e-1412-subject`
(oldest first from the far end) shows exactly:

- abd8d5754 Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard (family 14)
- 588f054d1 Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726 (family 12)
- e0af0163a Deliver unfinished thread on resume-offer Yes (pick 1)
- 312647db0 OVE-33: refresh stale quick proofs and fix outside-Muse fails (pick 2)

Each directly on 203a32775 (4 commits on top of the far end, no
other commit). Trees, verified live by this arm (full hashes):

- abd8d5754 tree bc52919e73e6449e93ab2b64497eb25138d9ee90 — exactly
  the predicted pick-0-resolved tree (1412 prereg).
- 588f054d1 tree e78fac42d89e811f6bfce981b7274e5ee3c5c014 — exactly
  the predicted pick-1-resolved tree, and exactly the tree of the
  existing transplant-12-14-subject branch at c8655548f.
- e0af0163a tree 45f64b03acaf50e38af24df375793cba9c666ae6 — exactly
  the predicted pick-2-resolved tree.
- 312647db0 tree e6fab8999c9039e0cf987dccdefcab63a2f154b8 — exactly
  the predicted pick-3-resolved tree (pick 2 of this arm,
  tooling-resolved).

Subject diff vs far end: 12 files, conversation.js 77/4 by direct
far→subject numstat (family numstats sum to +80/-7; pick 1's -4
removes three lines families 14/12 added, so the direct diff
reads 77 insertions / 4 deletions), test-snippet-stage-direction.js
78/0, new test test-story-offer-yes-20261108.js +73, story-offer-yes-followthrough.md
+29, both OVE-33 phone-frame receipts, 3 godpath test fixes,
test-establishment +3, sw.js +1, .gz binary. No other src/js file
differs (villager-objectives.js byte-identical to the far end).

## Merge-tree pre-check (re-run during prereg preparation; the subject already exists — this re-verifies the predictions it was built from)

Each pick's prediction is built on the TRUE preceding tree:
pick 0 on the far end, pick 1 on the predicted pick-0-resolved
tree, pick 2 (this arm's pick 1) on the predicted pick-1-resolved
tree, pick 3 (this arm's pick 2) on the predicted pick-2-resolved
tree. `git merge-tree --write-tree
--merge-base=<pick first parent> <ours> <theirs>` with FULL 40-char
hashes. Re-run by this arm at run start (read-only, no worktree
touched):

- PICK 0 (base = pick's first parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f, ours = far end
  203a32775, theirs = 7688cb7a46367c88c7bb85e976502ddc0d5456f0):
  rc=0, CLEAN — no conflict. Merged tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the tree the
  12+14 prereg predicted, and EXACTLY the live abd8d5754 tree.
  Prediction commit d632a89b1369dc970b6b2fb2966b17d331eaa292
  (commit-tree of that tree, parent = far end).
- PICK 1 (base = pick's first parent
  aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0, ours = predicted
  pick-0 commit d632a89b1369dc970b6b2fb2966b17d331eaa292, theirs =
  ac119e4ed27b2aa66131929795a4d3d0f381900b): rc=0, CLEAN — no
  conflict. Merged tree e78fac42d89e811f6bfce981b7274e5ee3c5c014
  — EXACTLY the tree the 12+14 prereg predicted, EXACTLY the
  tree of the existing transplant-12-14-subject branch
  (c8655548f), and EXACTLY the live 588f054d1 tree. Prediction
  commit 4566f962837d83464c918c513206deb6b54349ad (commit-tree of
  that tree, parent = predicted pick-0 commit).
- PICK 2 = this arm's pick 1 (base = pick's first parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0, ours = predicted
  pick-1 commit 4566f962837d83464c918c513206deb6b54349ad, theirs =
  bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1): rc=0, CLEAN — no
  conflict. Merged tree 45f64b03acaf50e38af24df375793cba9c666ae6
  — EXACTLY the live e0af0163a tree. Prediction commit
  6f389c109888b13f72246271adb48b41f0b0d791 (commit-tree of that
  tree, parent = predicted pick-1 commit). Its diff vs the
  pick-1 tree is exactly pick 1 (3 files, +148/-4).
- PICK 3 = this arm's pick 2 (base = pick's first parent
  c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212, ours = predicted
  pick-2 commit 6f389c109888b13f72246271adb48b41f0b0d791, theirs =
  7041e1bfb7e8b69387bd3203a58eed00115ec8d7): rc=1, tree
  9f0ee83bbc349c07ca16811689236df66836f144, conflicted files
  EXACTLY TWO — scripts/balance-proof.json,
  scripts/phone-frame-proof.json — BOTH zero-src-reader tooling
  files. Tooling-only → resolve EACH with `git checkout --ours`
  and continue (the coordinator tooling-resolution rule; the
  prior arm did exactly this live). Conflict markers in the
  merged tree: balance-proof.json lines 3/6/9;
  phone-frame-proof.json lines 7/15/23 and 81/91/101.
  PICK-2-RESOLVED TREE (the conflicted tree with both tooling
  files set to their OURS blobs from the pick-1 tree —
  balance-proof d0c6a42ff2395a49672f235f0218a3f969619dee,
  phone-frame-proof b06910148b2bb567ca3941b2ac3245872f74f632):
  e6fab8999c9039e0cf987dccdefcab63a2f154b8 — EXACTLY the live
  312647db0 tree. Prediction commit
  a7180fc9a6482feec46d0bfae4a2b82b617dda9e (commit-tree of that
  tree, parent = predicted pick-2 commit). Its diff vs the
  pick-1 tree is exactly pick 2 MINUS the two tooling files
  (10 files: the .gz binary, both phone-frame receipts, 3
  godpath tests, test-snippet +4, conversation.js +4, sw.js +1).

## Pick-2 mechanism (why the OVE-33 conflict was tooling-only)

This arm's pick 2 (7041e1bfb) +4 hunk anchors on the
family-12-widened `.replace(...)` quote-strip line, which the
narrow family-14 form lacks. With family 12 applied, our side
carries the widened form: `const s =
String(sn).trim().replace(...)` (1 hit at the predicted pick-1
tree) and the widened return checks, and the test file carries
family 12's OVE-29 assertions (74 lines at pick 2's base, 74
lines on our side — the insertion context now matches). The
merge-tree confirms it: pick 2's game-code and test hunks merge
clean, and only the two proof-refresh tooling files conflict
(their contents drifted on both lines since pick 2's base — the
same cumulative-line drift class as the brief-base artifact, not
a family conflict). The tooling-resolution rule therefore let
the pick continue with both files kept at the far-end version.
The subject's conversation.js carries the OVE-33 quote check
(`if (/"/.test(s)) return false;`, 1 hit) and its test file
carries the OVE-33 assertions ("They go still.", 1 hit).

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: `grep -rl '190391'
  evidence/*/sim-*-prereg.md` — 75 preregs name the band (the
  15E prereg counted 64; the count has grown as more transplant
  arms ran — the band is named everywhere because it IS the
  program's matched band). Forbidden/contaminated lists: no
  forbidden or contaminated list names this band (per the 15E
  prereg's check of the goal hidden_files lists; the current
  run's claim
  hidden_files/lever-claims/fleshout-20261114T1736Z.json names
  it only as the program's matched band in the run claim). No
  fresh band is claimed; the reuse is the program design,
  recorded here so a later reader does not mistake the hits for
  contamination.

## Ordering note

The merge-tree pre-check re-ran during prereg preparation; the
subject branch already exists (built by the prior arm, verified
here) and no judged sim has run. This prereg is committed BEFORE
any judged sim runs. The proof script
scripts/test-transplant15e-p12-a.js is committed with it (stage 1:
family identity, subject verification, pre-check, mechanisms,
content, verdict mapping, prereg record, base state; stage 2
appended after the step).

## Resolutions recorded (file, pick, method)

None performed by this arm — no cherry-pick is performed here.
Recorded from the prior arm (sim-transplant15e-1412.md): pick 2
of this arm (7041e1bfb) — scripts/balance-proof.json,
`git checkout --ours` (far-end version kept byte-identical);
scripts/phone-frame-proof.json, `git checkout --ours`
(far-end version kept byte-identical). Both resolved tooling
files are byte-identical to the far end on the subject
(balance-proof blob d0c6a42f, phone-frame-proof blob b0691014,
on both the subject and the far end). Picks 0–1 (families 14/12)
and pick 1 (bb6a301cf) applied cleanly (no resolution needed —
none touches a tooling file).
