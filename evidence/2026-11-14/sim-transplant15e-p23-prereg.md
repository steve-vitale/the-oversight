# sim-transplant15e-p23-prereg — family 15E picks 2+3 TOGETHER on the 14+12 base (Loop A, fleshout-20261114T2015Z)

Run: fleshout-20261114T2015Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p23-a, branch `sim-transplant15e-p23-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p23-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15E (family 15E = resume / conversation repair, 3 standalone
first-parent commits, pick order oldest first: bb6a301cf →
7041e1bfb → 4a1c77cf1). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant15e-prereg.md (pick identities,
first parents, tooling-resolution rule), plus
evidence/2026-11-14/sim-transplant15e-1412.md (the 15E-on-14+12 arm:
proved LIVE that pick 2 (7041e1bfb, OVE-33) applies on the 14+12
base with tooling-only conflicts, and that pick 3's (4a1c77cf1,
OVE-57) conversation.js hunk merges clean while its
villager-objectives.js hunk conflicts on a genuine Phase 4
dependency; its "Coordinator decision owed" candidate (c) is the
picks-2+3 route this arm executes, by coordinator decision), plus
evidence/2026-11-14/sim-transplant15e-p3conv.md (the narrowing
precedent: objectives half dropped by coordinator decision,
balance-proof.json --ours, evidence receipt removed).

## COORDINATOR-DECIDED NARROWING (binding for this arm)

This arm measures picks 2+3 TOGETHER — pick 2 (7041e1bfb, OVE-33)
whole, and pick 3 (4a1c77cf1, OVE-57) NARROWED to its
conversation.js half — on the 14+12 base
(transplant-12-14-subject c8655548f). Pick 3's
villager-objectives.js half is DROPPED by coordinator decision,
following the p3conv precedent: it is written against the
origin-line Phase 4 form of villager-objectives.js (ranked
candidates via companionRank, the npcInviteDecision lure lottery,
objCommitGuardOffer — 5 hits at pick 3's base, 0 at the far end)
that the far end never had. The objectives half stays UNMEASURED —
recorded plainly, not hand-resolved, not smuggled in. This narrowing
is a COORDINATOR-DECIDED exception to the STOP clause, recorded
here; the STOP clause still binds any conflict OUTSIDE the predicted
files. Precedent for the narrowed-family route when a conflict is
confined: narrowed families 4b/5b, narrowed 15A/15C/15F, narrowed
15E pick 3 (p3conv).

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: the 14+12 base — branch transplant-12-14-subject at
  c8655548f4be892c7722f2bbb46910c3c7262d5c (far end 203a32775,
  GOOD 4/8, + family 14 + family 12; tree
  e78fac42d89e811f6bfce981b7274e5ee3c5c014 — exactly the tree the
  12+14 arm's subject holds, and exactly the tree the 1412 arm's
  pick-1 prediction produced). The 12+14 pair is MEASURED
  NOT-CARRIER as a pair. The roster-check standing fix is swapped
  in for every step exactly as the bisect prereg specifies (fix
  file sha f8fda4295a99, from commit 5157782a4; native restored
  byte-identical afterwards, sha-verified).
- Subject: 14+12 base + pick 2 + narrowed pick 3, built on scratch
  branch `transplant-15e-p23-subject` by: `git cherry-pick
  7041e1bfb` onto transplant-12-14-subject (resolving the two
  predicted tooling files --ours), then `git cherry-pick
  4a1c77cf1` (resolving scripts/balance-proof.json --ours and
  src/js/villager-objectives.js --ours i.e. DROPPED, and removing
  the evidence receipt
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz — a NEW
  file in the pick, ABSENT at the base, so "byte-identical to the
  base" means absent), then continue the cherry-pick. NEVER
  committed to the arm branch. Branch LEFT in place, hash recorded
  in evidence, so the verdict is reproducible. Predicted
  narrowed-subject tree (constructed during prereg preparation
  via a temp index from the pick-3 merge-tree output):
  1c6c8954270cd5da11bb41f32a74fe0e4bd7ca8c; prediction commit
  c19aad22147d1fe40a71a2cae2f8d522901d50bd (commit-tree of that
  tree, parent = c8655548f). Its diff vs the 14+12 base is EXACTLY
  10 files: conversation.js +25/-2 (pick 2's +4 plus pick 3's
  +21/-2), test-snippet-stage-direction.js +4, the OVE-33
  evidence receipts, 3 godpath test fixes, the establishment test
  fix, sw.js +1 — and villager-objectives.js, balance-proof.json
  and phone-frame-proof.json byte-identical to the base, the
  evidence receipt absent.
- Family 15E picks 2 and 3: two standalone first-parent commits
  (see §Family identity). No merge, no second-parent side.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the narrowed
  picks-2+3 unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with
  a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: per the tooling-resolution rule, as narrowed by
  the coordinator decision above — pick 2 may conflict ONLY on
  the two predicted tooling files (scripts/balance-proof.json,
  scripts/phone-frame-proof.json, each resolved --ours); pick 3
  may conflict ONLY on the two predicted files
  (scripts/balance-proof.json, tooling, resolved --ours;
  src/js/villager-objectives.js, game code, DROPPED by
  coordinator decision and restored byte-identical to the
  pick-2 tree, NOT hand-resolved). If src/js/conversation.js
  does NOT merge clean on either pick, STOP as
  UNMEASURED-BY-CONFLICT: report the exact conflict list, commit
  the prereg + pre-check evidence, and finish — no
  hand-resolution, no narrowed re-run decided by this arm. Any
  conflict on any OTHER file (any src/js, data, policy, docs, or
  test file beyond the predicted files) likewise STOPS the arm
  immediately, with the exact conflict list reported, no
  hand-resolution, no narrowed re-run decided by this arm. If the
  subject cannot be built, the outcome is UNMEASURED-BY-CONFLICT
  and no judged sim runs.
- STEP id: t15e-p23 (fresh — no prior STEP id exists for this
  picks-2+3 combination).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat; resume openers are structural
grammar; a resume opener that asks whether to hear / pick up the
unfinished thread must deliver that thread. No standalone canon
doc covers the OVE-33/57 picks themselves — the two picks are
coherence repairs inside the documented conversation contract (a
quoted beat is real memory, not stage direction; a trader intro
that survived Continue still surfaces), not new systems. Nothing
here invents canon.

## Family content (read before the picks)

- Pick 2, 7041e1bfb "OVE-33: refresh stale quick proofs and fix
  outside-Muse fails": mostly a proof refresh (phone-frame
  receipts, balance-proof refresh, godpath test fixes). Its ONE
  game-code hunk is in src/js/conversation.js (+4/-0): inside
  `convoSnippetIsStageDirection`, a quoted beat ("They go still.
  \"So it's not just me…\"") is real memory, not stage direction —
  only pure mood/silence narration counts as stage direction. The
  +4 hunk inserts after the `.replace(...)` quote-strip anchor
  line, a line that exists ONLY in the family-12-widened form of
  the function — which the 14+12 base HAS (the 1412 arm proved
  this live: with family 12 in place, pick 2's game-code and test
  hunks merge clean). Its test file
  scripts/test-snippet-stage-direction.js (+4) inserts OVE-33
  assertions after the 'water haul' assertion. In plain words:
  a line somebody actually said in quotes no longer gets mistaken
  for silent mood narration when a conversation resumes.
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
- THIS ARM measures pick 2 whole plus ONLY the first half of pick
  3 (the deferred trader intro). The second half of pick 3
  (rally-guard lottery skip) is written against the origin-line
  Phase 4 form of villager-objectives.js (ranked candidates via
  companionRank, the npcInviteDecision lure lottery,
  objCommitGuardOffer — 5 hits at pick 3's base, 0 at the far end)
  and stays UNMEASURED. The 15E-on-14+12 arm proved the mechanism
  live: its pick-4 conflict regions are lines 23/25/29 and
  957/972/1039 — the header-comment hunk rewrites rally_guard /
  companion_no_cross_write lines the far end doesn't have, and
  the rally-guard code hunk inserts into the `offerBase` /
  ranked-candidate region that doesn't exist in the far end's
  direct-write guard form. Same marker lines on the 14+12 base
  in this arm's pre-check (see §Merge-tree pre-check).

## Family identity (verified at run start, before any sim)

- Pick 2: 7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33:
  refresh stale quick proofs and fix outside-Muse fails". First
  parent c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212 (Merge pull
  request #28, dialog-recap-teach-35a9 — family 3). Single parent
  (standalone, not a merge). Diff: 12 files —
  evidence/2026-11-08/neutral-ove33-master-quick.json.gz (binary,
  new), evidence/2026-11-08/phone-ove33-frame-736-r1.json +2585/-0,
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
  companionScore evidence — family 15B). Single parent
  (standalone, not a merge). Diff: 4 files —
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz (binary,
  new), scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2.
- Pick order: pick 2 then pick 3, origin order (oldest first) on
  the first-parent chain d229b58f5..a628aeaf3 (bb6a301cf →
  7041e1bfb → 4a1c77cf1). Pick 1 (bb6a301cf, resume-offer Yes) is
  NOT part of this arm's subject — it was already measured alone
  (sim-transplant15e-p1, subject f541e4cd1, NOT-CARRIER 4/8) and
  with pick 2 on the 14+12 base (sim-transplant15e-p12, subject
  312647db0, NOT-CARRIER 4/8). This arm isolates the pick-2 +
  pick-3 interaction the prior arms never measured.
- Sequence dependencies: pick 1 IS an ancestor of pick 2's first
  parent c32ff6fa8; pick 2 IS an ancestor of pick 3's first parent
  134a3d0ab. Pick 2's first parent c32ff6fa8 is NOT an ancestor of
  the far end (family 3 is not on the far end); pick 3's first
  parent 134a3d0ab is NOT an ancestor of the far end (family 15B
  is not on the far end). No pick touches src/js/standing.js or
  scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check (run during prereg preparation, subject NOT yet cut)

Each pick's prediction is built on the TRUE preceding tree (the
15A-narrowed lesson): pick 2 on the 14+12 base, pick 3 on the
predicted pick-2-resolved tree. `git merge-tree --write-tree
--merge-base=<pick first parent> <ours> <theirs>` with FULL 40-char
hashes (the 15E evidence records that short vs full spellings change
the tree OID — via the conflict-marker ref labels).

- PICK 2 (base = pick's first parent
  c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212, ours = transplant-12-14-subject
  c8655548f4be892c7722f2bbb46910c3c7262d5c, theirs =
  7041e1bfb7e8b69387bd3203a58eed00115ec8d7): rc=1, merged tree
  4111ed85351a31a1ebc0da371da74c5b9d5315b0, conflicted files
  EXACTLY TWO — scripts/balance-proof.json,
  scripts/phone-frame-proof.json — BOTH zero-src-reader tooling
  files. PREDICTION: CONFLICT, tooling-only → resolve EACH with
  `git checkout --ours` and continue the cherry-pick (the
  coordinator tooling-resolution rule). src/js/conversation.js
  AUTO-MERGED CLEAN (the merged blob carries the OVE-33 quote
  check `if (/"/.test(s)) return false;` at line 1751) and
  scripts/test-snippet-stage-direction.js auto-merged (carries the
  OVE-33 "They go still." assertion at line 73); sw.js
  auto-merged. Conflict markers in the merged tree:
  balance-proof.json lines 3/6/9; phone-frame-proof.json lines
  7/15/23 and 81/91/101 — EXACTLY the files and marker lines the
  1412 arm's pick-3 prediction named (its merged tree
  9f0ee83b…), reproduced here on the pick-2-direct base (without
  pick 1 in between — the tooling conflicts are proof-refresh
  drift, identical with or without the resume-offer pick).
  PICK-2-RESOLVED TREE (constructed during prereg preparation via
  a temp index: the conflicted tree with both tooling files set
  to their OURS blobs from the 14+12 base — balance-proof
  d0c6a42ff2395a49672f235f0218a3f969619dee, phone-frame-proof
  b06910148b2bb567ca3941b2ac3245872f74f632 — i.e. exactly what
  `git checkout --ours` on both files produces during the live
  cherry-pick): 35857b15ff5a61750b9dccf9ab1f21bb8c3d705f.
  Prediction commit 2263a1c360ac49259c6d071db6d6d3ace19e2902
  (commit-tree of that tree, parent = c8655548f) is the predicted
  pick-2-resolved tree. Its diff vs the 14+12 base is exactly
  pick 2 MINUS the two tooling files (10 files: the .gz binary,
  both phone-frame receipts, 3 godpath tests,
  test-snippet +4, conversation.js +4, sw.js +1).
- PICK 3 (base = pick's first parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc, ours = predicted
  pick-2-resolved commit
  2263a1c360ac49259c6d071db6d6d3ace19e2902, theirs =
  4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24): rc=1, merged tree
  3ba598f98f4594ff2be0a7d33afd8de5948829a3, conflicted files
  EXACTLY TWO — scripts/balance-proof.json (tooling) and
  src/js/villager-objectives.js (GAME CODE). PREDICTION:
  CONFLICT — balance-proof resolves --ours (tooling), and
  villager-objectives.js resolves --ours (DROPPED by coordinator
  decision, the narrowing above). src/js/conversation.js
  AUTO-MERGED CLEAN (merged blob
  c816f9a2904d1114a907465b8189143d1590ce6a — the same blob the
  predicted narrowed-subject tree carries). Conflict markers in
  the merged tree: balance-proof.json lines 3/6/9;
  villager-objectives.js lines 23/25/29 and 957/972/1039 —
  EXACTLY the same files and marker lines the 1412 arm's pick-4
  prediction named (its merged tree 627f198e…) and the p3conv
  arm's pre-check named (its merged tree 7dd5d9c6…), reproduced
  here on the 14+12+pick-2 base. BOTH section kinds were read
  (the `changed in both` stage 1/2/3 entries AND the
  `Auto-merging` messages) — the merge-tree parser tracks both,
  per the sim-findings.md lesson.
  PREDICTED NARROWED-SUBJECT TREE (constructed during prereg
  preparation via a temp index: the conflicted tree with both
  conflicted files set to their OURS blobs from the pick-2 tree
  — balance-proof d0c6a42f…, villager-objectives.js
  9afc522b0a4a2d57719cbcd4254f611c95f290a2 — and the new evidence
  receipt removed): 1c6c8954270cd5da11bb41f32a74fe0e4bd7ca8c.
  Prediction commit c19aad22147d1fe40a71a2cae2f8d522901d50bd
  (commit-tree of that tree, parent = c8655548f) is the predicted
  narrowed-subject tree. Its diff vs the 14+12 base is EXACTLY
  10 files (conversation.js +25/-2, test-snippet +4, the OVE-33
  receipts, 3 godpath test fixes, the establishment test fix,
  sw.js +1); villager-objectives.js, balance-proof.json and
  phone-frame-proof.json are byte-identical to the base; the
  evidence receipt is absent. The receipt blob in the merged tree
  is 1fe734402ab123c153a72381a8635fbcd6be775d.
- NOTE on the evidence receipt: the pick adds
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz as a NEW
  file; it does not exist at the 14+12 base, so the narrowed
  subject omits it (see §Prereg).

## Pick-2 mechanism (why the OVE-33 conflict is tooling-only on this base)

The 15E-alone arm stopped at pick 2 because pick 2's +4 hunk
anchors on the family-12-widened `.replace(...)` quote-strip line,
which the narrow family-14 form lacks. The 14+12 base carries the
widened form (family 12's widening is in the base: `const s =
String(sn).trim().replace(...)` and the widened return checks, and
the test file carries family 12's OVE-29 assertions). The
merge-tree confirms it: pick 2's game-code and test hunks merge
clean on this base, and only the two proof-refresh tooling files
conflict (their contents drifted on both lines since pick 2's
base — the same cumulative-line drift class as the brief-base
artifact, not a family conflict). The tooling-resolution rule
therefore lets the pick continue with both files kept at the
14+12-base version. This arm differs from the 1412 arm's pick-3
only in the preceding tree (no pick 1 in between): the live 1412
pick-3 tree e6fab899… and this arm's pick-2-resolved tree
35857b15… differ exactly by pick 1's content (3 files, +148/-4),
which is the resume-offer repair — the interaction this arm
measures is pick 2 + pick 3 WITHOUT the resume-offer repair in
the tree.

## Pick-3 mechanism (why villager-objectives.js cannot land)

Pick 3's villager-objectives.js hunks (+21/-2) are written against
the origin-line file at its first parent 134a3d0ab, which carries
the VILLAGER-BRAIN Phase 4 form of `objAskCompanion`: ranked
candidates via companionRank, the npcInviteDecision lure lottery,
and objCommitGuardOffer (5 hits). The far end's file — and the
14+12 base's file, which no pick in this arm touches — is a
different, older form: 0 hits for objCommitGuardOffer, and its
guard path directly writes the companion's objective
(`co2.kind = 'GUARD'; co2.purpose = 'guard'; …` — the direct-write
form Phase 4's no-cross-write replaced). Base→ours on this file is
26 hunks across the whole file (header API list, objRefreshPick /
objDangerBelief / objResourceBelief / objRallyFreshRaid seams, the
whole objAskCompanion region). Pick 3's two hunks both fail against
our side: the header-comment hunk rewrites rally_guard /
companion_no_cross_write lines our side doesn't have (ours carries
the older "no new RNG draws, so games without a fresh raid are
bit-identical to base" rally_guard line and no
companion_no_cross_write line), and the rally-guard code hunk
inserts into the `offerBase` / ranked-candidate region that
doesn't exist in our form (merged-tree conflict region 2 spans
lines 957–1039: ours side is the direct-write guard block, theirs
side is the companionRank + offerBase + lure-lottery block). In
short: pick 3 depends on origin-line Phase 4
villager-objectives.js content the far end never had — a genuine
code dependency, not a tooling adjacency. No resolution of
balance-proof.json would help. The conversation.js half is
unaffected: it merges clean on this base (merged blob c816f9a2…),
which is why the coordinator-decided narrowing measures exactly
that half.

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: `grep -rl '190391'
  evidence/*/sim-*-prereg.md` — 78 preregs name the band (up from
  75 at the p3conv arm: more arms since). The band is named
  everywhere because it IS the program's matched band.
- Forbidden/contaminated lists: the goal hidden_files directory
  holds NO file matching forbidden/contaminated/banned; the
  convergence tracker names the band as the program's matched
  band. (The 15E prereg's full crawl found 9 files, all naming the
  band as the program's matched band in run claims / the tracker,
  NONE as a forbidden or contaminated band. No forbidden/contaminated
  list names it.)
- Searched scope: every dated prereg under evidence/ (the 78
  hits above) + the goal hidden_files tracker + the
  forbidden/contaminated file-name search. No fresh band is
  claimed; the reuse is the program design, recorded here so a
  later reader does not mistake the 78 hits for contamination.

## Ordering note

The merge-tree pre-check ran during prereg preparation; the
subject branch does NOT exist yet and no judged sim has run. This
prereg is committed BEFORE the subject is cut or any judged sim
runs. The proof script scripts/test-transplant15e-p23-a.js is
committed with it (stage 1: pick identity, pre-check, mechanisms,
content, verdict mapping, narrowing rule, prereg record, base
state; stage 2 appended after the live picks + judged step).

## Resolutions recorded (file, pick, method)

None yet — no pick has been applied live. (Predicted: pick 2 —
scripts/balance-proof.json, `git checkout --ours` (14+12-base
version kept byte-identical); pick 2 —
scripts/phone-frame-proof.json, `git checkout --ours` (14+12-base
version kept byte-identical); pick 3 —
scripts/balance-proof.json, `git checkout --ours` (pick-2-tree
version kept byte-identical, which is the 14+12-base version);
pick 3 — src/js/villager-objectives.js, `git checkout --ours`
(pick-2-tree version kept byte-identical — the hunk is DROPPED by
coordinator decision, not hand-resolved); pick 3 — evidence
receipt, REMOVED from the subject (absent at the 14+12 base).)
