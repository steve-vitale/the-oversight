# sim-transplant15e-on14-prereg — family 15E on far end + family 14 (Loop A, fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-on14-a, branch `sim-transplant15e-on14-a`,
worktree `~/workspace/worktrees/sim-transplant15e-on14-a`.

## Authority

Coordinator decision: evidence/2026-11-14/sim-transplant-round-1215.md
(next blank #2, the 12+14 precedent) — run 15E on far end + family 14's
guard, as a fresh arm with its own prereg. Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
hidden_files/family15-grouping-prereg-2026-11-14.md §15E (group
definition), plus evidence/2026-11-14/sim-transplant15e.md +
evidence/2026-11-14/sim-transplant15e-prereg.md (the 15E-alone arm —
template for this arm's prereg/proof/evidence shape; pick identities,
first parents, the pick-2 conflict anatomy, the tooling-resolution
rule), plus evidence/2026-11-14/sim-transplant12-14-prereg.md (the
12+14 precedent — the family-14 recipe and the first-parent
merge-tree convention; its "Merge-tree pre-check" and "BRIEF-BASE
NOTE" sections apply here verbatim).

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
- Subject: far end + family 14 diff + family 15E diff, built on
  scratch branch `transplant-15e-on14-subject` (far end +
  `git cherry-pick -m 1 7688cb7a4` FIRST, then
  `git cherry-pick bb6a301cf`, then `git cherry-pick 7041e1bfb`,
  then `git cherry-pick 4a1c77cf1` on top — family 14 is a merge,
  the 15E picks are standalone commits, no `-m 1`). NEVER committed
  to the arm branch. Branch LEFT in place, hash recorded in
  evidence, so the verdict is reproducible.
- Family 14: merge 7688cb7a4 "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard" — first parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f, second-parent side 1
  commit e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". 2 files, +33:
  src/js/conversation.js +12, scripts/test-snippet-stage-direction.js
  +21 (new test). No policy file, no standing.js, no data, no docs.
- Family 15E: three standalone first-parent commits (see §Family
  identity). No merge, no second-parent side.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15E-ON-14
  GROUP as one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
  with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER. If the group reads CARRIER, the next arm splits it
  commit-by-commit (same rule as 2115 §3 (c) for families 4 and 13).
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
- STEP id: t15e-on14 (fresh — no prior STEP id exists for this
  15E-on-14 combination).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat (a teaser/invitation is not
quotable as the thread's content-memory); resume openers are
structural grammar; a resume opener that asks whether to hear /
pick up the unfinished thread must deliver that thread; resume
openers must quote real spoken memory, never stage direction or
meta scaffolding. No standalone canon doc covers the OVE-33/57
picks themselves — the picks are coherence repairs inside the
documented conversation contract (resume-offer Yes delivers the
thread; stage-direction quotes stay out of resume openers; a trader
intro that survived Continue still surfaces), not new systems.
Nothing here invents canon.

## Family content (read before the picks)

- Pick 0, family 14, e4836747e "Reject stage-direction snippets as
  resume memory quotes": adds `convoSnippetIsStageDirection` to
  conversation.js (+12) — stage-direction snippets ("They glance at
  the fire…", "A comfortable quiet…", "Still on what they confided")
  are rejected as resume memory quotes — plus a 21-line new test
  file with the stage-direction assertions. In plain words: resume
  openers stop quoting mood narration as if it were something the
  player once said.
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

- Pick 0 (family 14): 7688cb7a46367c88c7bb85e976502ddc0d5456f0
  "Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard".
  First parent 16cdd690062b3551ff6b4b0d3639770c8af84b5f (Merge pull
  request #9, curious-stale-opener-fix). Second-parent side is 1
  commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". Diff: 2 files —
  scripts/test-snippet-stage-direction.js +21/-0 (new),
  src/js/conversation.js +12/-0.
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
  chain d229b58f5..a628aeaf3: 7688cb7a4 (family 14) → bb6a301cf →
  7041e1bfb → 4a1c77cf1 (first-parent positions: 15E picks 10 / 24 /
  42 of 51; family 14 precedes all three on the origin line).
- Sequence dependencies: family 14 IS an ancestor of pick 1's
  first parent (it IS pick 1's first parent) and of pick 2's first
  parent c32ff6fa8; pick 1 IS an ancestor of pick 2's first parent;
  pick 2 IS an ancestor of pick 3's first parent 134a3d0ab. Family
  14 is NOT an ancestor of the far end. Family 12 (merge ac119e4ed)
  IS an ancestor of pick 2's first parent c32ff6fa8 (see §Pick-2
  mechanism) — family 12 is NOT on the far end, and is NOT picked
  by this arm.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check (run during prereg preparation, subject NOT yet cut)

Each pick's prediction is built on the TRUE preceding tree (the
15A-narrowed lesson): pick 0 on the far end, pick 1 on the
predicted pick-0-resolved tree, pick 2 on the predicted
pick-1-resolved tree, pick 3 on the predicted pick-2-resolved
tree. `git merge-tree --write-tree
--merge-base=<pick first parent> <ours> <theirs>` with FULL 40-char
hashes (the 15E evidence records that short vs full spellings change
the tree OID).

- PICK 0 (base = pick's first parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f, ours = far end
  203a32775, theirs = 7688cb7a46367c88c7bb85e976502ddc0d5456f0):
  rc=0, CLEAN — no conflict. Merged tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the tree the
  12+14 prereg predicted for this pick. Prediction commit
  faa868ec01d43faa3592ada6055b490b0d037c05 (commit-tree of that
  tree, parent = far end) is the predicted pick-0-resolved tree.
  PREDICTION: cherry-pick -m 1 applies cleanly.
- PICK 1 (base = pick's first parent 7688cb7a4, ours = predicted
  pick-0 commit faa868ec01d43faa3592ada6055b490b0d037c05, theirs =
  bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1): rc=0, CLEAN — no
  conflict. Merged tree 96db10b05bc53edd44dcb614fd5d22696dc3e4e7.
  Prediction commit ea25872dd93e38f0dc27d7b6837f2aa1bc4ab9b7
  (commit-tree of that tree, parent = predicted pick-0 commit) is
  the predicted pick-1-resolved tree. Its diff vs the pick-0 tree
  is exactly pick 1 (3 files, +148/-4). PREDICTION: cherry-pick
  applies cleanly.
- PICK 2 (base = pick's first parent
  c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212, ours = predicted pick-1
  commit ea25872dd93e38f0dc27d7b6837f2aa1bc4ab9b7, theirs =
  7041e1bfb7e8b69387bd3203a58eed00115ec8d7): rc=1, tree
  6bff133d3ba77e5e8b1928d8892c816382e57a3b, conflicted files
  EXACTLY FOUR — scripts/balance-proof.json,
  scripts/phone-frame-proof.json,
  scripts/test-snippet-stage-direction.js,
  src/js/conversation.js. PREDICTION: CONFLICT, game-code included
  → STOP at pick 2 (tooling-resolution rule maps the set to
  UNMEASURED). The two tooling files alone would resolve --ours,
  but src/js/conversation.js and the test file stop the arm.
  Conflict markers in the merged tree: conversation.js lines 1738
  (`<<<<<<< ea25872d…`), 1742 (`=======`), 1756 (`>>>>>>>
  7041e1bfb…`); test-snippet-stage-direction.js lines 18/21/26;
  balance-proof.json lines 3/6/9; phone-frame-proof.json lines
  7/15/23 and 81/91/101. NOTE: same four files as the 15E-alone
  arm's pick-2 prediction, but a DIFFERENT mechanism (see §Pick-2
  mechanism) — the function now exists on our side.
- PICK 3: prediction NOT runnable (needs the pick-2-applied tree,
  which cannot exist if pick 2 stops). No pick-3 conflict status
  is claimed either way.

## Pick-2 mechanism (why the conflict persists WITH family 14 in place)

The 15E-alone arm stopped at pick 2 because the function
`convoSnippetIsStageDirection` did not exist at the far end. That
cause is GONE here — the pick-0 tree carries the function (3 hits
in conversation.js at the predicted pick-1 tree). The conflict
that remains is a SECOND dependency, on family 12:

- Pick 2's +4 hunk inserts after the anchor line
  `const s = String(sn).trim().replace(/^[\"'“”]+|[\"'“”]+$/g, '');`
  inside `convoSnippetIsStageDirection`. That anchor line exists
  ONLY in the family-12-widened form of the function: at pick 2's
  base c32ff6fa8 the function opens with the `.replace(...)`
  quote-strip (1 hit) and the widened `return true` checks
  (`Your silence|You say nothing|You don't answer|The silence |
  You show them`, `Still on`, `Say it plain`, `Anyway. A small
  smile`). Family 12 (merge ac119e4ed, second-parent commit
  3015beec0 "Reject residual silence/meta resume memory quotes")
  IS an ancestor of pick 2's first parent c32ff6fa8.
- Our side (far end + family 14, the predicted pick-1 tree) has
  the NARROW family-14 form: `const s = String(sn).trim();` (1
  hit, no `.replace` strip) and a 2-line
  `return /^(They |A comfortable |A warmth |A tired |Still on
  what they confided)/i.test(s) || /\\b(glance at the fire|
  comfortable quiet settles|tired smile)\\b/i.test(s);`. The
  insertion anchor does not exist on our side, and the whole
  function body differs — so git conflicts the hunk even though
  the function itself is present. In the merged tree the OURS
  side is the narrow body (lines 1739–1741) and the THEIRS side
  is the widened body plus the OVE-33 quote check (lines
  1743–1755).
- The test-file conflict is the same class: pick 2's +4 inserts
  OVE-33 assertions after the 'water haul went wrong after the
  storm.' assertion, at a point where the base file (74 lines)
  carries family 12's OVE-29 assertions immediately after the
  anchor and our file (21 lines, family 14 only) ends — the
  insertion context differs on both sides, so git conflicts the
  tail (merged-tree markers at test lines 18/21/26).
- In short: pick 2 depends on family 12's widening of the same
  guard, not only on family 14's guard. Landing family 14 first
  supplies the function but NOT the widened body pick 2 is written
  against. The (a) route decided in round-1215 therefore does NOT
  unblock 15E as a unit — a coordinator decision, not this arm's.
  Candidate follow-ups for the coordinator (decided by none of
  them here): (a2) land 14+12 first, then re-run 15E; (b) measure
  pick 1 alone — the subject branch will hold far end + 14 + pick
  1 at the STOP point (and the 15E-alone subject
  transplant-15e-subject at f541e4cd1 already holds pick 1 alone
  on the bare far end); (c) measure pick 1 + pick 3 (pick 3
  touches conversation.js regions that exist at the far end plus
  villager-objectives.js — untested, coordinator's call); (d)
  record the group unmeasurable-by-conflict as a unit.

## BRIEF-BASE NOTE (method artifact, from the 12+14 prereg)

The task brief's literal first command would use merge-base
d229b58f5 as the base. That run (for pick 0) reports rc=1 with
conflicts ONLY in scripts/balance-proof.json and
scripts/green-list.txt — because d229b58f5 predates the whole
origin line, so base→theirs carries ALL origin-line drift in
those files, while base→ours carries the local line's own edits
(tree 015568e3a827c624e12968dc896160b95397164c). Neither file is
in family 14's own diff (16cdd69006..7688cb7a4 = exactly the 2
files above), so those conflicts are cumulative-line drift, not a
family-14 conflict — a cherry-pick -m 1 never sees them (its base
is the first parent). The binding prediction is the first-parent
one (CLEAN, tree bc52919e…, above); the brief-base run is recorded
here as an artifact. The live picks are ground truth: if any live
pick conflicts, the STOP clause fires regardless of any prediction.

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: the band is named in 64 preregs under
  evidence/ (vetphantom, firstparent, merge, reconciled, anchor,
  survival control, mcconfirm, bisect rounds r5–r10, cut confirms,
  stallcut, optb, pairarming, scholarschurn, collapseband3,
  mergebase, origin, and others across 2026-11-11/12) — the band is
  named everywhere because it IS the program's matched band (the
  15E prereg counted exactly 64 hits; this arm reuses its count,
  not re-counted).
- Forbidden/contaminated lists: no forbidden or contaminated list
  names this band (per the 15E prereg's check of the goal
  hidden_files lists). No fresh band is claimed; the reuse is the
  program design, recorded here so a later reader does not mistake
  the hits for contamination.

## Ordering note

The merge-tree pre-check ran during prereg preparation; the
subject branch does NOT exist yet and no judged sim has run. This
prereg is committed BEFORE the subject is cut or any judged sim
runs. The proof script scripts/test-transplant15e-on14.js is
committed with it (stage 1: family identity, pre-check,
mechanism, content, verdict mapping, prereg record, base state;
stage 2 appended after the live picks).

## Resolutions recorded (file, pick, method)

None yet — no pick has been applied live. (Predicted: pick 0
clean, pick 1 clean, no resolution; pick 2 STOP, no resolution.)
