# sim-transplant15e-prereg — family 15E (resume / conversation repair) (Loop A, fleshout-20261114T1215Z)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-a, branch `sim-transplant15e-a`, worktree
`~/workspace/worktrees/sim-transplant15e-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15E (family 15E = resume / conversation repair, 3 standalone
first-parent commits, pick order oldest first: bb6a301cf →
7041e1bfb → 4a1c77cf1). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant15a-narrowed-prereg.md (method +
proof template: merge-tree pre-check with each pick's FIRST PARENT
as base, branch-identity legs worktree-only, prereg ancestry by
message/subject not hash).

This arm is a FRESH arm in a reused tree: family 15E was registered
by the dead 0936Z run but never started — the tree was clean, branch
sim-transplant15e-a at b2b50c2cd (on master, stale), zero unique
commits, heartbeat fresh 12:20:16Z. At run start the branch was
verified clean (`git status --short` empty), zero commits ahead of
master (`git log --oneline master..HEAD` empty), b2b50c2cd an
ancestor of master, then fast-forwarded to current master 237fb445f
(`git fetch origin && git merge --ff-only master`, clean).

## COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's family-15 arms, decided 2026-11-14 ~10:00Z)

Pick in origin order. If a pick conflicts ONLY on zero-src-reader
tooling files (scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json), resolve EACH such file with
`git checkout --ours` (keep the far-end version byte-identical) and
continue the cherry-pick — do NOT hand-edit. If ANY other file
conflicts (any src/js, data, policy, docs, or test file), STOP
immediately, report the exact conflict list, do NOT hand-resolve,
do NOT decide a narrowed re-run. The proof MUST assert: (1) the
subject's game-code diff equals the picks' diff exactly, and (2)
each resolved tooling file is byte-identical to the far end. Record
every resolution (file, pick, method) in prereg + evidence.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15E diff, built on scratch branch
  `transplant-15e-subject` (far end + `git cherry-pick bb6a301cf`
  FIRST, then `git cherry-pick 7041e1bfb`, then
  `git cherry-pick 4a1c77cf1` on top — standalone commits, no
  `-m 1`). NEVER committed to the arm branch. Branch LEFT in place,
  hash recorded in evidence, so the verdict is reproducible.
- Family 15E: three standalone first-parent commits (see §Family
  identity). No merge, no second-parent side.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15E GROUP as
  one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
  STEP id (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering but kept on the suspect list); ≥3/8 NOT-CARRIER. If
  the group reads CARRIER, the next arm splits it commit-by-commit
  (same rule as 2115 §3 (c) for families 4 and 13).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: per the tooling-resolution rule above — a tooling-only
  conflict resolves with `git checkout --ours` and the pick
  continues; ANY other conflicted file (any src/js, data, policy,
  docs, or test file) STOPS the arm immediately, with the exact
  conflict list reported, no hand-resolution, no narrowed re-run
  decided by this arm. If the subject cannot be built, the outcome
  is UNMEASURED-BY-CONFLICT and no judged sim runs.
- STEP id: t15e-resume (fresh — family 15E was never started before
  this arm, so no prior STEP id exists to avoid reusing).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat (a teaser/invitation is not
quotable as the thread's content-memory); resume openers are
structural grammar; a resume opener that asks whether to hear /
pick up the unfinished thread must deliver that thread. No
standalone canon doc covers the OVE-33/57 picks themselves — the
three picks are coherence repairs inside the documented
conversation contract (resume-offer Yes delivers the thread;
stage-direction quotes stay out of resume openers; a trader intro
that survived Continue still surfaces), not new systems. Nothing
here invents canon.

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
  its js file is handled: the +4 hunk lives ENTIRELY inside the
  `convoSnippetIsStageDirection` function introduced by family 14
  (PR #10 snippet-stage-direction-guard, merge 7688cb7a4 — pick 1's
  first parent), which the far end does NOT have (see §Pick-2
  mechanism). Its test file scripts/test-snippet-stage-direction.js
  (+4) likewise does not exist at the far end. The pick's other
  files are evidence receipts (.json/.gz), tooling proof files
  (scripts/balance-proof.json 2/2, scripts/phone-frame-proof.json
  6/6), godpath test fixes, and sw.js +1.
- Pick 3, 4a1c77cf1 "OVE-57: triage tip quick-check after bond
  dawn": a trader introduction that survived Continue stays
  deferred (`c.tradeIntroDeferred = true` at close) and must still
  surface once the next opener has spoken (queueTraderIntro rework,
  conversation.js +21/-2); the rally-guard path skips the invite
  lottery so it draws no new RNG (villager-objectives.js +21/-2,
  `rally-volunteer` decision, commit via objCommitGuardOffer).
  In plain words: a trader who was about to introduce themselves
  before you saved doesn't lose their turn, and a villager
  volunteering as guard on a raid warning doesn't roll dice to
  decide it.

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
  (first-parent log lists them reverse-chronologically as
  4a1c77cf1, 7041e1bfb, bb6a301cf).
- Sequence dependencies: pick 1 IS an ancestor of pick 2's first
  parent c32ff6fa8; pick 2 IS an ancestor of pick 3's first parent
  134a3d0ab. Pick 1's first parent 7688cb7a4 is NOT an ancestor of
  the far end (family 14 is not on the far end).
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check (run during prereg preparation, subject NOT yet cut)

Each pick's prediction is built on the TRUE preceding tree (the
15A-narrowed lesson): pick 1 on the far end, pick 2 on the
predicted pick-1-resolved tree, pick 3 on the predicted
pick-2-resolved tree. `git merge-tree --write-tree
--merge-base=<pick first parent> <ours> <theirs>`.

- PICK 1 (base = pick's first parent 7688cb7a4, ours = far end
  203a32775, theirs = bb6a301cf): rc=0, CLEAN — no conflict.
  Merged tree f9e9b8b80156e7157793e7ee6a69306edcd5c738.
  Prediction commit 19e50e1e0e48b21094eccc9b139672900afaba21
  (commit-tree of that tree, parent = far end) is the predicted
  pick-1-resolved tree. PREDICTION: cherry-pick applies cleanly.
- PICK 2 (base = pick's first parent c32ff6fa8, ours = predicted
  pick-1 commit 19e50e1e0, theirs = 7041e1bfb): rc=1, tree
  8e3ce24f9ddb300116ef2cedd310e8ebcf44128e, conflicted files
  EXACTLY FOUR — scripts/balance-proof.json,
  scripts/phone-frame-proof.json,
  scripts/test-snippet-stage-direction.js,
  src/js/conversation.js. PREDICTION: CONFLICT, game-code included
  → STOP at pick 2 (tooling-resolution rule maps the set to
  UNMEASURED). The two tooling files alone would resolve --ours,
  but src/js/conversation.js and the test file stop the arm.
  NOTE on the tree OID: merge-tree conflict-marker labels use the
  refs AS SPELLED — short `7041e1bfb` gives tree 1c2a7ff1…,
  the full 40-char hash gives 8e3ce24f…; the proof invokes it
  with full hashes, so 8e3ce24f is the recorded prediction.
- PICK 3: prediction NOT runnable (needs the pick-2-applied tree,
  which cannot exist if pick 2 stops). No pick-3 conflict status
  is claimed either way.

## Pick-2 mechanism (why the conflict is a genuine dependency)

Pick 2's only game-code hunk inserts 4 lines (a comment + the
quote check `if (/"/.test(s)) return false;`) inside
`convoSnippetIsStageDirection` at its base's line ~1828. That
function does NOT exist at the far end: `git grep -c
convoSnippetIsStageDirection 203a32775` = 0 (the far end has only
convoSnippetIsHook ×3 and convoSnippetIsRealBeat ×5). The function
was introduced by family 14, PR #10 snippet-stage-direction-guard
(merge 7688cb7a4 — pick 1's first parent), which is an ancestor of
pick 2's first parent but NOT an ancestor of the far end. In the
merged tree the conflict markers sit at conversation.js lines
1730 (`<<<<<<< 19e50e1e0…`), 1731 (`=======`), 1754
(`>>>>>>> 7041e1bfb`): the OURS side is EMPTY and the THEIRS side
is the whole function with the OVE-33 quote check — the entire
function is new content relative to the far end, so git cannot
place a 4-line edit inside a function that is absent on our side.
The test file conflict is the same class: modify/delete —
scripts/test-snippet-stage-direction.js is deleted in the pick-1
tree (absent at the far end) and modified in 7041e1bfb; the merged
tree leaves version 7041e1bfb in place. Four origin-side commits
between pick 1 and pick 2's first parent touch conversation.js
(2c01bb277 recap hammer, 5b7d83426 voiceLine stacking, 3015beec0
residual silence/meta quotes, 10724c18d live unfinished
Help/engage) — origin-side evolution, not the cause: the
divergence is the missing family-14 base, not pick-1 fallout.
In short: family 15E's second commit depends on family 14's code,
and the far end never had it.

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: `grep -rl '190391'
  evidence/*/sim-*-prereg.md` — 64 preregs name the band
  (vetphantom, firstparent, merge, reconciled, anchor, survival
  control, mcconfirm, bisect rounds r5–r10, cut confirms, stallcut,
  optb, pairarming, scholarschurn, collapseband3, mergebase,
  origin, and others across 2026-11-11/12). The band is named
  everywhere because it IS the program's matched band.
- Forbidden/contaminated lists: `grep -rl '190391'
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`
  — 9 files name the band (8 dead lever-claim JSONs, one census
  JSON, convergence-tracker.md), all as the program's matched band
  in run claims / the tracker — NONE as a forbidden or contaminated
  band. No forbidden/contaminated list names it.
- Searched scope: every dated prereg under evidence/ (the 64
  hits above) + the goal hidden_files lists. No fresh band is
  claimed; the reuse is the program design, recorded here so a
  later reader does not mistake the 64 hits for contamination.

## Ordering note

The merge-tree pre-check ran during prereg preparation; the
subject branch does NOT exist yet and no judged sim has run. This
prereg is committed BEFORE the subject is cut or any judged sim
runs. The proof script scripts/test-transplant15e.js is committed
with it (stage 1: 129 legs — family identity, pre-check,
mechanism, content, verdict mapping, prereg record, base state;
stage 2 appended after the live picks).

## Resolutions recorded (file, pick, method)

None yet — no pick has been applied live. (Predicted: pick 1
clean, no resolution; pick 2 STOP, no resolution.)
