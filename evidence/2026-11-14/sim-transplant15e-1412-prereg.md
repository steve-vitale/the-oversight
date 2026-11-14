# sim-transplant15e-1412-prereg — family 15E on far end + family 14 + family 12 (Loop A, fleshout-20261114T1452Z)

Run: fleshout-20261114T1452Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-1412-a, branch `sim-transplant15e-1412-a`,
worktree `~/workspace/worktrees/sim-transplant15e-1412-a`.

## Authority

Coordinator decision 2 in evidence/2026-11-14/sim-transplant-round-1355.md
(next blank #2, route (a2): land 14+12 first, then re-run 15E whole — the
12+14 pair is MEASURED NOT-CARRIER, its subject exists). The 15E-on-14 arm
(sim-transplant15e-on14-a) proved the round-1215 (a) route — land family 14
first — does NOT unblock 15E: pick 2 (7041e1bfb, OVE-33) conflicts because
its 4-line quote check anchors on `const s = String(sn).trim().replace(...)`
— the quote-strip family 12 added when widening the guard; family 14
supplies only the narrow original form. This arm builds the subject as far
end + family 14 + family 12, then the three 15E picks in origin order, and
measures the 15E group as one unit. Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
hidden_files/family15-grouping-prereg-2026-11-14.md §15E (group
definition: bb6a301cf → 7041e1bfb → 4a1c77cf1, oldest first), plus
evidence/2026-11-14/sim-transplant15e-on14.md +
evidence/2026-11-14/sim-transplant15e-on14-prereg.md (the 15E-on-14 arm —
template for this arm's prereg/proof/evidence shape; pick identities, first
parents, the pick-2 conflict anatomy, the tooling-resolution rule; its
"Merge-tree pre-check" and "BRIEF-BASE NOTE" conventions apply here
verbatim), plus evidence/2026-11-14/sim-transplant12-14-prereg.md (the
12+14 precedent — the family-14 recipe and the first-parent merge-tree
convention; the 12+14 subject branch transplant-12-14-subject at
c8655548f exists — consult it, but build this arm's subject fresh and
verify it).

## COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's family-15 arms, decided 2026-11-14 ~10:00Z)

Pick in origin order. If a pick conflicts ONLY on zero-src-reader tooling
files (scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json), resolve EACH such file with
`git checkout --ours` (keep the far-end version byte-identical) and
continue the cherry-pick — do NOT hand-edit. If ANY other file conflicts
(any src/js, data, policy, docs, or test file), STOP immediately, report
the exact conflict list, do NOT hand-resolve, do NOT decide a narrowed
re-run (the fallback pick-1-alone subject f541e4cd1 is a coordinator
decision for a later run, not yours to take). The proof MUST assert: (1)
the subject's game-code diff equals the picks' diff exactly, and (2) each
resolved tooling file is byte-identical to the far end. Record every
resolution (file, pick, method) in prereg + evidence.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 14 diff + family 12 diff + family 15E diff,
  built on scratch branch `transplant-15e-1412-subject` (far end +
  `git cherry-pick -m 1 7688cb7a4` FIRST, then
  `git cherry-pick -m 1 ac119e4ed` SECOND, then
  `git cherry-pick bb6a301cf`, then `git cherry-pick 7041e1bfb`,
  then `git cherry-pick 4a1c77cf1` on top — families 14 and 12 are
  merges, the 15E picks are standalone commits, no `-m 1` for those).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 14: merge 7688cb7a4 "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard" — first parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f, second-parent side 1
  commit e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". 2 files, +33:
  src/js/conversation.js +12, scripts/test-snippet-stage-direction.js
  +21 (new test). No policy file, no standing.js, no data, no docs.
- Family 12: merge ac119e4ed "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726" — first parent
  aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0, second-parent side 1
  commit 3015beec0aefd3a3db394b73c362c2af9f4c2f84 "Reject residual
  silence/meta resume memory quotes". 2 files, +73/-5 by numstat:
  src/js/conversation.js +18/-3, scripts/test-snippet-stage-direction.js
  +55/-2 (edited test). No policy file, no standing.js, no data, no
  docs.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15E-ON-1412
  GROUP as one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
  with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering but kept on the suspect list — per
  round-1355 metric review, a deterministic re-run is vacuous, so
  if the re-run is per-seed identical, record AMBIGUOUS and note
  the determinism; the honest resolver is a fresh seed band, not a
  third run of this band); ≥3/8 NOT-CARRIER. If the group reads
  CARRIER, the next arm splits it commit-by-commit (same rule as
  2115 §3 (c) for families 4 and 13).
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
- STEP id: t15e-on1412 (fresh — no prior STEP id exists for this
  15E-on-14+12 combination).

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
- Pick 1, family 12, 3015beec0 "Reject residual silence/meta resume
  memory quotes": widens the same guard — warm silence ("You say
  nothing…", "You don't answer…", "The silence…", "You show
  them…"), recap scaffolding ("Still on X", "Say it plain. Still on
  X"), wind-down filler ("Anyway. A small smile."), teach diegesis,
  plus quote-strip of leading/trailing quote marks
  (`const s = String(sn).trim().replace(/^[\"'“”]+|[\"'“”]+$/g, '');`).
  `convoSnippetIsRealBeat` gains a party-join assent guard ("had
  better be worth it" / "not carrying your stuff" / "watch your back.
  Might as well") so party-join stock cannot land on the wrong thread
  ledger and resume as the "memory" of a plant lesson. In plain
  words: resume openers stop quoting warm silence, recap scaffolding,
  or party-join assent as if it were something the player once said,
  while keeping the thread label. Both halves are dialogue-coherence
  only — no numbers, no gates.
- Pick 2, bb6a301cf "Deliver unfinished thread on resume-offer
  Yes": when a resume opener asks whether to hear / pick up the
  unfinished thread, Yes must deliver that thread — not a generic
  "I see." acknowledgment. Tags the opener's return
  (`resumeOffer: true`, thread id) so startConvo marks the hanging
  genericQ (`c.genericQ.resumeOffer = true`, `resumeTid`), and the
  gq:yn handler follows through to the thread instead of GQ_ACK.
  In plain words: saying Yes to "Want to hear where it left off?"
  now actually continues the old conversation instead of brushing
  it off.
- Pick 3, 7041e1bfb "OVE-33: refresh stale quick proofs and fix
  outside-Muse fails": mostly a proof refresh (phone-frame receipts,
  balance-proof refresh, godpath test fixes). Its ONE game-code
  hunk is in src/js/conversation.js (+4/-0): inside
  `convoSnippetIsStageDirection`, a quoted beat ("They go still.
  \"So it's not just me…\"") is real memory, not stage direction —
  only pure mood/silence narration counts as stage direction. How
  its js file is handled: the +4 hunk inserts after the
  `.replace(...)` quote-strip anchor line, a line that exists ONLY
  in the family-12-widened form of the function (see §Pick-3
  mechanism). Its test file scripts/test-snippet-stage-direction.js
  (+4) inserts OVE-33 assertions after the 'water haul' assertion,
  at a point where the base file carries family 12's OVE-29
  assertions immediately after. The pick's other files are evidence
  receipts (.json/.gz), tooling proof files
  (scripts/balance-proof.json 2/2, scripts/phone-frame-proof.json
  6/6), godpath test fixes, and sw.js +1.
- Pick 4, 4a1c77cf1 "OVE-57: triage tip quick-check after bond
  dawn": a trader introduction that survived Continue stays
  deferred (`c.tradeIntroDeferred = true` at close) and must still
  surface once the next opener has spoken (queueTraderIntro rework,
  conversation.js +21/-2); the rally-guard path skips the invite
  lottery so it draws no new RNG (villager-objectives.js +21/-2,
  `rally-volunteer` decision, commit via objCommitGuardOffer).
  In plain words: a trader who was about to introduce themselves
  before you saved doesn't lose their turn, and a villager
  volunteering as guard on a raid warning doesn't roll dice to
  decide it. Pick 4's villager-objectives.js hunks are written
  against the origin-line file at its first parent 134a3d0ab, which
  carries the VILLAGER-BRAIN Phase 4 form of objAskCompanion
  (companionRank, npcInviteDecision lure lottery,
  objCommitGuardOffer — 5 hits; see §Pick-4 mechanism).

## Family identity (verified at run start, before any sim)

- Pick 0 (family 14): 7688cb7a46367c88c7bb85e976502ddc0d5456f0
  "Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard".
  First parent 16cdd690062b3551ff6b4b0d3639770c8af84b5f (Merge pull
  request #9, curious-stale-opener-fix). Second-parent side is 1
  commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". Diff: 2 files —
  scripts/test-snippet-stage-direction.js +21/-0 (new),
  src/js/conversation.js +12/-0.
- Pick 1 (family 12): ac119e4ed27b2aa66131929795a4d3d0f381900b
  "Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726".
  First parent aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0 (dialog
  residual sampler base). Second-parent side is 1 commit:
  3015beec0aefd3a3db394b73c362c2af9f4c2f84 "Reject residual
  silence/meta resume memory quotes". Diff: 2 files, +73/-5 —
  scripts/test-snippet-stage-direction.js +55/-2 (edited),
  src/js/conversation.js +18/-3.
- Pick 2: bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver
  unfinished thread on resume-offer Yes". First parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0 (Merge pull request #10,
  snippet-stage-direction-guard — family 14). Diff: 3 files —
  evidence/2026-11-08/story-offer-yes-followthrough.md +29/-0,
  scripts/test-story-offer-yes-20261108.js +73/-0 (new test),
  src/js/conversation.js +46/-4.
- Pick 3: 7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33: refresh
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
- Pick 4: 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 "OVE-57: triage
  tip quick-check after bond dawn". First parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc (OVE-54: record PR URL in
  companionScore evidence — family 15B). Diff: 4 files —
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz (binary),
  scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: 7688cb7a4 (family 14) → ac119e4ed
  (family 12) → bb6a301cf → 7041e1bfb → 4a1c77cf1 (15E picks at
  first-parent positions 10 / 24 / 42 of 51; family 14 precedes
  family 12 precedes all three 15E picks on the origin line).
- Sequence dependencies: family 14 IS an ancestor of family 12's
  first parent aa5d9ef92; family 14 IS an ancestor of pick 2's
  first parent (it IS pick 2's first parent) and of pick 3's first
  parent c32ff6fa8; family 12 IS an ancestor of pick 3's first
  parent; pick 2 IS an ancestor of pick 3's first parent; pick 3
  IS an ancestor of pick 4's first parent 134a3d0ab. Family 14 and
  family 12 are NOT ancestors of the far end. The 12+14 pair is
  MEASURED NOT-CARRIER (subject transplant-12-14-subject at
  c8655548f, tree e78fac42… — the same tree this arm's pick-1
  prediction produces).
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check (run during prereg preparation, subject NOT yet cut)

Each pick's prediction is built on the TRUE preceding tree (the
15A-narrowed lesson): pick 0 on the far end, pick 1 on the
predicted pick-0-resolved tree, pick 2 on the predicted
pick-1-resolved tree, pick 3 on the predicted pick-2-resolved
tree, pick 4 on the predicted pick-3-resolved tree.
`git merge-tree --write-tree
--merge-base=<pick first parent> <ours> <theirs>` with FULL 40-char
hashes (the 15E evidence records that short vs full spellings change
the tree OID — via the conflict-marker ref labels).

- PICK 0 (base = pick's first parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f, ours = far end
  203a32775, theirs = 7688cb7a46367c88c7bb85e976502ddc0d5456f0):
  rc=0, CLEAN — no conflict. Merged tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the tree the
  12+14 prereg predicted for this pick. Prediction commit
  d632a89b1369dc970b6b2fb2966b17d331eaa292 (commit-tree of that
  tree, parent = far end) is the predicted pick-0-resolved tree.
  PREDICTION: cherry-pick -m 1 applies cleanly.
- PICK 1 (base = pick's first parent
  aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0, ours = predicted
  pick-0 commit d632a89b1369dc970b6b2fb2966b17d331eaa292, theirs =
  ac119e4ed27b2aa66131929795a4d3d0f381900b): rc=0, CLEAN — no
  conflict. Merged tree e78fac42d89e811f6bfce981b7274e5ee3c5c014
  — EXACTLY the tree the 12+14 prereg predicted, and EXACTLY the
  tree of the existing transplant-12-14-subject branch
  (c8655548f). Prediction commit
  4566f962837d83464c918c513206deb6b54349ad (commit-tree of that
  tree, parent = predicted pick-0 commit) is the predicted
  pick-1-resolved tree. Its diff vs the pick-0 tree is exactly
  family 12 (2 files, +73/-5). PREDICTION: cherry-pick -m 1
  applies cleanly.
- PICK 2 (base = pick's first parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0, ours = predicted
  pick-1 commit 4566f962837d83464c918c513206deb6b54349ad, theirs =
  bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1): rc=0, CLEAN — no
  conflict. Merged tree 45f64b03acaf50e38af24df375793cba9c666ae6.
  Prediction commit 6f389c109888b13f72246271adb48b41f0b0d791
  (commit-tree of that tree, parent = predicted pick-1 commit)
  is the predicted pick-2-resolved tree. Its diff vs the pick-1
  tree is exactly pick 2 (3 files, +148/-4). PREDICTION:
  cherry-pick applies cleanly. NOTE: this is the first pick where
  family 12 matters for the 15E sequence — the 15E-on-14 arm's
  pick-1 tree (96db10b0…) and this arm's pick-2 tree differ by
  family 12's widening (+73/-5) on top of the same pick-2 content.
- PICK 3 (base = pick's first parent
  c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212, ours = predicted
  pick-2 commit 6f389c109888b13f72246271adb48b41f0b0d791, theirs =
  7041e1bfb7e8b69387bd3203a58eed00115ec8d7): rc=1, tree
  9f0ee83bbc349c07ca16811689236df66836f144, conflicted files
  EXACTLY TWO — scripts/balance-proof.json,
  scripts/phone-frame-proof.json — BOTH zero-src-reader tooling
  files. PREDICTION: CONFLICT, tooling-only → resolve EACH with
  `git checkout --ours` and continue the cherry-pick (the
  coordinator tooling-resolution rule). The src/js conflict is
  GONE: with family 12 in place, pick 3's +4 conversation.js
  hunk and +4 test hunk merge clean — the conflicted tree's
  conversation.js already carries the OVE-33 quote check
  (`if (/"/.test(s)) return false;`, 1 hit) and the widened
  anchor (1 hit), and its test file carries the OVE-33
  assertions ("They go still.", 1 hit). Conflict markers in the
  merged tree: balance-proof.json lines 3/6/9;
  phone-frame-proof.json lines 7/15/23 and 81/91/101.
  PICK-3-RESOLVED TREE (constructed during prereg preparation
  via a temp index: the conflicted tree with both tooling files
  set to their OURS blobs from the pick-2 tree — balance-proof
  d0c6a42ff2395a49672f235f0218a3f969619dee, phone-frame-proof
  b06910148b2bb567ca3941b2ac3245872f74f632 — i.e. exactly what
  `git checkout --ours` on both files produces during the live
  cherry-pick): e6fab8999c9039e0cf987dccdefcab63a2f154b8.
  Prediction commit a7180fc9a6482feec46d0bfae4a2b82b617dda9e
  (commit-tree of that tree, parent = predicted pick-2 commit)
  is the predicted pick-3-resolved tree. Its diff vs the pick-2
  tree is exactly pick 3 MINUS the two tooling files (10 files:
  the .gz binary, both phone-frame receipts, 3 godpath tests,
  test-snippet +4, conversation.js +4, sw.js +1).
- PICK 4 (base = pick's first parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc, ours = predicted
  pick-3-resolved commit a7180fc9a6482feec46d0bfae4a2b82b617dda9e,
  theirs = 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24): rc=1, tree
  627f198ea6376f82ea7042ef4081e298b8c9a4b3, conflicted files
  EXACTLY TWO — scripts/balance-proof.json (tooling) and
  src/js/villager-objectives.js (GAME CODE). PREDICTION:
  CONFLICT, game-code included → STOP at pick 4 (the last pick).
  The tooling file alone would resolve --ours, but
  villager-objectives.js stops the arm under the rule.
  src/js/conversation.js merges CLEAN on this pick (pick 4's
  conversation.js hunk applies fine on the 12+14+15E-picks
  tree). Conflict markers in the merged tree:
  balance-proof.json lines 3/6/9; villager-objectives.js lines
  23/25/29 and 957/972/1039. See §Pick-4 mechanism for why the
  villager-objectives.js hunk cannot land.

## Pick-3 mechanism (why the OVE-33 conflict is tooling-only now)

The 15E-on-14 arm stopped at pick 3 (its pick 2) because pick 3's
+4 hunk anchors on the family-12-widened `.replace(...)`
quote-strip line, which the narrow family-14 form lacks. With
family 12 applied second, our side carries the widened form:
`const s = String(sn).trim().replace(...)` (1 hit at the predicted
pick-2 tree) and the widened return checks, and the test file
carries family 12's OVE-29 assertions (74 lines at pick 3's base,
74 lines on our side — the insertion context now matches). The
merge-tree confirms it: pick 3's game-code and test hunks merge
clean, and only the two proof-refresh tooling files conflict
(their contents drifted on both lines since pick 3's base — the
same cumulative-line drift class as the brief-base artifact, not a
family conflict). The tooling-resolution rule therefore lets the
pick continue with both files kept at the far-end version.

## Pick-4 mechanism (why villager-objectives.js cannot land)

Pick 4's villager-objectives.js hunks (+21/-2) are written against
the origin-line file at its first parent 134a3d0ab, which carries
the VILLAGER-BRAIN Phase 4 form of `objAskCompanion`: ranked
candidates via companionRank, the npcInviteDecision lure lottery,
and objCommitGuardOffer (5 hits). The far end's file is a
different, older form: 0 hits for objCommitGuardOffer, and its
guard path directly writes the companion's objective
(`co2.kind = 'GUARD'; co2.purpose = 'guard'; …` — the direct-write
form Phase 4's no-cross-write replaced). Base→ours on this file is
26 hunks across the whole file (header API list, objRefreshPick /
objDangerBelief / objResourceBelief / objRallyFreshRaid seams,
the whole objAskCompanion region). Pick 4's two hunks both fail
against our side: the header-comment hunk rewrites
rally_guard / companion_no_cross_write lines our side doesn't
have (ours carries the older "no new RNG draws, so games without
a fresh raid are bit-identical to base" rally_guard line and no
companion_no_cross_write line), and the rally-guard code hunk
inserts into the `offerBase` / ranked-candidate region that
doesn't exist in our form (merged-tree conflict region 2 spans
lines 957–1039: ours side is the direct-write guard block,
theirs side is the companionRank + offerBase + lure-lottery
block). In short: pick 4 depends on origin-line Phase 4
villager-objectives.js content the far end never had — a genuine
code dependency, not a tooling adjacency. No resolution of
balance-proof.json would help. The (a2) route decided in
round-1355 therefore does NOT unblock 15E as a unit either — a
coordinator decision, not this arm's. Candidate follow-ups for
the coordinator (decided by none of them here): (b) measure pick
2 alone — the subject branch will hold far end + 14 + 12 + pick
2 at the STOP point (and the 15E-alone subject
transplant-15e-subject at f541e4cd1 already holds pick 2 alone
on the bare far end); (c) measure picks 2+3 (both apply cleanly
on 14+12 — the subject at the STOP point holds exactly that,
plus the tooling-resolved pick 3); (d) record the group
unmeasurable-by-conflict as a unit; (e) a narrowed pick-4
conversation.js-only route (its conversation.js hunk merges
clean — untested, coordinator's call).

## BRIEF-BASE NOTE (method artifact, from the 12+14 prereg)

The task brief's literal first command would use merge-base
d229b58f5 as the base. That run (for pick 0) reports rc=1 with
conflicts ONLY in scripts/balance-proof.json and
scripts/green-list.txt — because d229b58f5 predates the whole
origin line, so base→theirs carries ALL origin-line drift in
those files, while base→ours carries the local line's own edits.
Neither file is in family 14's own diff (16cdd69006..7688cb7a4 =
exactly the 2 files above), so those conflicts are cumulative-line
drift, not a family-14 conflict — a cherry-pick -m 1 never sees
them (its base is the first parent). The binding prediction is the
first-parent one (CLEAN, tree bc52919e…, above); the brief-base run
is recorded here as an artifact. The live picks are ground truth:
if any live pick conflicts, the STOP clause fires regardless of
any prediction. SPELLING NOTE: this arm's brief-base run used FULL
40-char hashes and gives tree 8cfc9608fcffb68ca65bb08f304bfac82380ddd7;
the prior arms' short-spelling runs give 015568e3a827c624e12968dc896160b95397164c
— same conflicted file set, different tree OID, because the
conflict-marker ref labels spell the refs as invoked (see the 15E
prereg metric review). All binding predictions in this prereg use
full hashes.

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
runs. The proof script scripts/test-transplant15e-1412.js is
committed with it (stage 1: family identity, pre-check,
mechanisms, content, verdict mapping, prereg record, base state;
stage 2 appended after the live picks).

## Resolutions recorded (file, pick, method)

None yet — no pick has been applied live. (Predicted: picks 0–2
clean, no resolution; pick 3 resolves scripts/balance-proof.json
and scripts/phone-frame-proof.json EACH with `git checkout
--ours` (keep the far-end version byte-identical) and continues;
pick 4 STOP, no resolution — the tooling file is NOT resolved
--ours, because the pick also conflicts on
src/js/villager-objectives.js and the rule stops the arm on any
non-tooling conflicted file.)
