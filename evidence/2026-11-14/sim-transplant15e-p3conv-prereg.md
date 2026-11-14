# sim-transplant15e-p3conv-prereg — narrowed family 15E pick 3, conversation.js ONLY (Loop A, fleshout-20261114T1736Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p3conv-a, branch
`sim-transplant15e-p3conv-a`, worktree
`~/workspace/worktrees/sim-transplant15e-p3conv-a`.

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
proved LIVE that pick 4's conversation.js hunk merges clean while
its villager-objectives.js hunk conflicts on a genuine Phase 4
dependency — same two files, same marker lines as this arm's
pre-check; its "Coordinator decision owed" candidate (e) is the
narrowed pick-4 conversation.js-only route, "untested,
coordinator's call").

## COORDINATOR-DECIDED NARROWING (binding for this arm)

This arm measures ONLY the conversation.js half of pick 3
(4a1c77cf1, OVE-57), on the bare far end. The pick as a unit is
UNMEASURED-BY-CONFLICT — its villager-objectives.js hunk depends
on Phase 4 villager-objectives.js content the far end never had
(proven live by the 15E-on-14+12 arm,
evidence/2026-11-14/sim-transplant15e-1412.md: conflict on exactly
balance-proof.json + villager-objectives.js; its conversation.js
half merges clean). The objectives half stays UNMEASURED — recorded
plainly, not hand-resolved, not smuggled in. This narrowing is a
COORDINATOR-DECIDED exception to the STOP clause, recorded here;
the STOP clause still binds any conflict OUTSIDE the predicted two
files. Precedent for the narrowed-family route when a conflict is
confined: narrowed families 4b/5b, narrowed 15A/15C/15F.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + ONLY the conversation.js hunk of 4a1c77cf1,
  built on scratch branch `transplant-15e-p3conv-subject` by:
  `git cherry-pick 4a1c77cf1` onto the far end, then restore
  src/js/villager-objectives.js and scripts/balance-proof.json
  with `git checkout --ours` (the far-end versions, byte-identical)
  and remove the evidence receipt
  (evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz — a NEW
  file in the pick, ABSENT at the far end, so "byte-identical to
  the far end" means absent), then continue the cherry-pick.
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
  Predicted narrowed-subject tree (constructed during prereg
  preparation via a temp index from the merge-tree output):
  6ab07a5d4aa69dc66493e29cf6805e43849881a5; prediction commit
  dcbc30fba002d2c8a2772e36a45b0050b4b5eb09 (commit-tree of that
  tree, parent = far end). Its diff vs the far end is EXACTLY
  src/js/conversation.js +21/-2, and its conversation.js blob
  8a20a5ec8e62fea3d159df66710b554f1d2c646a is the merge-tree's
  merged conversation.js blob.
- Family 15E pick 3: one standalone first-parent commit (see
  §Family identity). No merge, no second-parent side.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the narrowed
  pick-3-conversation unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id (2/8 again → recorded AMBIGUOUS,
  treated as NOT-CARRIER for ordering but kept on the suspect
  list); ≥3/8 NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: per the tooling-resolution rule, as narrowed by
  the coordinator decision above — the pick may conflict ONLY on
  the two predicted files (scripts/balance-proof.json, tooling,
  resolved --ours; src/js/villager-objectives.js, game code,
  DROPPED by coordinator decision and restored byte-identical to
  the far end, NOT hand-resolved). If src/js/conversation.js does
  NOT merge clean onto the bare far end, STOP as
  UNMEASURED-BY-CONFLICT: report the exact conflict list, commit
  the prereg + pre-check evidence, and finish — no
  hand-resolution, no narrowed re-run decided by this arm. Any
  conflict on any OTHER file (any src/js, data, policy, docs, or
  test file beyond the predicted two) likewise STOPS the arm
  immediately, with the exact conflict list reported, no
  hand-resolution, no narrowed re-run decided by this arm. If the
  subject cannot be built, the outcome is UNMEASURED-BY-CONFLICT
  and no judged sim runs.
- STEP id: t15e-p3conv (fresh — no prior STEP id exists for this
  narrowed unit).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat; resume openers are structural
grammar. No standalone canon doc covers the OVE-57 pick itself —
the conversation.js half is a coherence repair inside the
documented conversation contract (a trader introduction that
survived Continue stays deferred and must still surface once the
next opener has spoken), not a new system. Nothing here invents
canon.

## Family content (read before the pick)

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
- THIS ARM measures ONLY the first half (the deferred trader
  intro). The second half (rally-guard lottery skip) is written
  against the origin-line Phase 4 form of villager-objectives.js
  (ranked candidates via companionRank, the npcInviteDecision lure
  lottery, objCommitGuardOffer — 5 hits at pick 3's base, 0 at the
  far end) and stays UNMEASURED. The 15E-on-14+12 arm proved the
  mechanism live: its pick-4 conflict regions are lines 23/25/29
  and 957/972/1039 — the header-comment hunk rewrites rally_guard
  / companion_no_cross_write lines the far end doesn't have, and
  the rally-guard code hunk inserts into the `offerBase` /
  ranked-candidate region that doesn't exist in the far end's
  direct-write guard form. Same marker lines on the bare far end
  in this arm's pre-check (see §Merge-tree pre-check).

## Family identity (verified at run start, before any sim)

- Pick 3: 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 "OVE-57: triage
  tip quick-check after bond dawn". First parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc (OVE-54: record PR URL in
  companionScore evidence — family 15B). Single parent
  (standalone, not a merge). Diff: 4 files —
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz (binary,
  new), scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2.
- Pick order context: pick 3 is the third of family 15E's three
  picks on the first-parent chain d229b58f5..a628aeaf3
  (bb6a301cf → 7041e1bfb → 4a1c77cf1). Picks 1 and 2 are NOT part
  of this arm's subject — this arm isolates pick 3's
  conversation.js hunk alone on the bare far end.
- Sequence dependencies: pick 3's first parent 134a3d0ab is NOT
  an ancestor of the far end (family 15B is not on the far end).
  No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check (run during prereg preparation, subject NOT yet cut)

`git merge-tree --write-tree --merge-base=134a3d0ab <far-end
203a32775> <4a1c77cf1>` (base = pick's first parent, full 40-char
hashes throughout — the merge-tree OID depends on the refs AS
SPELLED).

- rc=1, merged tree 7dd5d9c62060d6b319ca7732a0baa10af3f1d400.
- Conflicted files EXACTLY TWO — scripts/balance-proof.json
  (tooling) and src/js/villager-objectives.js (game code).
  src/js/conversation.js AUTO-MERGED CLEAN (no CONFLICT line for
  it; merged blob 8a20a5ec8e62fea3d159df66710b554f1d2c646a).
- Conflict markers in the merged tree: balance-proof.json lines
  3/6/9; villager-objectives.js lines 23/25/29 and 957/972/1039 —
  EXACTLY the same files and marker lines the 15E-on-14+12 arm's
  pick-4 prediction named (its merged tree 627f198e…), reproduced
  here on the bare far end. The 1412 arm's live pick reproduced
  the prediction exactly; this pre-check reproduces it again on
  a different base tree.
- BOTH section kinds read: the `changed in both` entries (the
  two conflicted files, stages 1/2/3) AND the `Auto-merging`
  messages (all three files listed; conversation.js with no
  conflict) — the merge-tree parser tracks both, per the
  sim-findings.md lesson.
- PREDICTION: the cherry-pick will conflict on exactly the two
  predicted files; conversation.js applies cleanly. The narrowed
  subject is buildable by the method in §Prereg, with predicted
  tree 6ab07a5d… (diff vs far end exactly conversation.js
  +21/-2).
- NOTE on the evidence receipt: the pick adds
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz as a NEW
  file (blob 1fe73440… in the merged tree); it does not exist at
  the far end, so the narrowed subject omits it (see §Prereg).

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: `grep -rl '190391'
  evidence/*/sim-*-prereg.md` — 75 preregs name the band (up from
  64 at the 15E prereg: more arms since). The band is named
  everywhere because it IS the program's matched band.
- Forbidden/contaminated lists: the goal hidden_files directory
  holds NO file matching forbidden/contaminated/banned; the
  convergence tracker names the band 15× as the program's matched
  band. (A full-directory `grep -rl '190391'` over hidden_files
  was started and killed after ~5 min — the directory is too large
  to crawl in this run; the 15E prereg's earlier full crawl found
  9 files, all naming the band as the program's matched band in
  run claims / the tracker, NONE as a forbidden or contaminated
  band. No forbidden/contaminated list names it.)
- Searched scope: every dated prereg under evidence/ (the 75
  hits above) + the goal hidden_files tracker + the
  forbidden/contaminated file-name search. No fresh band is
  claimed; the reuse is the program design, recorded here so a
  later reader does not mistake the 75 hits for contamination.

## Ordering note

The merge-tree pre-check ran during prereg preparation; the
subject branch does NOT exist yet and no judged sim has run. This
prereg is committed BEFORE the subject is cut or any judged sim
runs. The proof script scripts/test-transplant15e-p3conv-a.js is
committed with it (stage 1: pick identity, pre-check, mechanism,
content, verdict mapping, narrowing rule, prereg record, base
state; stage 2 appended after the live pick + judged step).

## Resolutions recorded (file, pick, method)

None yet — no pick has been applied live. (Predicted: pick 3 —
scripts/balance-proof.json, `git checkout --ours` (far-end
version kept byte-identical); pick 3 —
src/js/villager-objectives.js, `git checkout --ours` (far-end
version kept byte-identical — the hunk is DROPPED by coordinator
decision, not hand-resolved); pick 3 — evidence receipt,
REMOVED from the subject (absent at the far end).)
