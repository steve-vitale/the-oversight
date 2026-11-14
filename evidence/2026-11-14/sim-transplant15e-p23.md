# sim-transplant15e-p23 — family 15E picks 2+3 TOGETHER on the 14+12 base, pick 3 narrowed conversation.js ONLY (Loop A, fleshout-20261114T2015Z)

Run: fleshout-20261114T2015Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p23-a, branch `sim-transplant15e-p23-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p23-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-p23-prereg.md
(committed 8d9911e2a, BEFORE the subject was cut or any judged sim
ran — the pre-check ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ evidence/2026-11-14/sim-transplant15e-prereg.md (pick identities,
first parents, tooling-resolution rule) +
evidence/2026-11-14/sim-transplant15e-1412.md (the 15E-on-14+12 arm:
proved LIVE that pick 2 applies on the 14+12 base with tooling-only
conflicts, and that pick 3's conversation.js hunk merges clean while
its villager-objectives.js hunk conflicts on a genuine Phase 4
dependency; its "Coordinator decision owed" candidate (c) is the
picks-2+3 route this arm executes, by coordinator decision) +
evidence/2026-11-14/sim-transplant15e-p3conv.md (the narrowing
precedent: objectives half dropped by coordinator decision,
balance-proof.json --ours, evidence receipt removed).

## Outcome

- OUTCOME: MEASURED — the narrowed unit was built and judged.
- VERDICT: NOT-CARRIER
- Survived: 4/8 — per-seed days: 86/144/150/43/150/87/150/150;
  survivors 190393, 190395, 190397, 190398.
- The per-seed days are EXACTLY the far-end days, seed-for-seed:
  the summary's own endpoints.far.days read
  86/144/150/43/150/87/150/150, and the subject reproduces them
  on all 8 seeds, with the same four survivors. The narrowed
  picks-2+3 unit moves NOTHING on the collapse band — not
  survival, not a single seed's trajectory.
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

See evidence/2026-11-14/sim-transplant15e-p23-prereg.md. Base:
the 14+12 base — branch transplant-12-14-subject at c8655548f
(far end 203a32775, GOOD 4/8, + family 14 + family 12; tree
e78fac42…) with the roster-check standing fix swapped in for
every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step. Thresholds
for the narrowed unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
with a fresh STEP id; ≥3/8 NOT-CARRIER. STOP clause per the
coordinator tooling-resolution rule, as narrowed by the
coordinator decision: pick 2 may conflict ONLY on the two
predicted tooling files; pick 3 may conflict ONLY on the two
predicted files (balance-proof.json, tooling, resolved --ours;
villager-objectives.js, game code, DROPPED by coordinator
decision and restored byte-identical to the pick-2 tree). A
conversation.js conflict on either pick, or any conflict on any
other file, STOPS the arm as UNMEASURED-BY-CONFLICT.

## The narrowed unit (what was measured, and what was not)

- Pick 2: 7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33:
  refresh stale quick proofs and fix outside-Muse fails". First
  parent c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212 (family 3).
  Diff: 12 files — evidence receipts, tooling proof files
  (balance-proof.json +2/-2, phone-frame-proof.json +6/-6),
  godpath test fixes, test-snippet-stage-direction.js +4,
  conversation.js +4 (the OVE-33 quote check), sw.js +1.
  MEASURED WHOLE.
- Pick 3: 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 "OVE-57:
  triage tip quick-check after bond dawn". First parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc (family 15B). Diff:
  4 files — evidence receipt (binary, new),
  scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2. MEASURED NARROWED to
  the conversation.js half only.
- MEASURED: pick 2 whole — a quoted beat ("They go still.
  \"So it's not just me…\"") is real memory, not stage direction
  (`if (/"/.test(s)) return false;` inside
  `convoSnippetIsStageDirection`) — PLUS pick 3's conversation.js
  hunk — a trader introduction that survived Continue stays
  deferred (`c.tradeIntroDeferred = true` at close) and must
  still surface once the next opener has spoken (queueTraderIntro
  rework: a deferred intro surfaces once the opener has spoken,
  stage >= 1, instead of waiting for a whole new engagement arc
  to reach stage 3). In plain words: a line somebody actually
  said in quotes no longer gets mistaken for silent mood
  narration when a conversation resumes, and a trader who was
  about to introduce themselves before you saved doesn't lose
  their turn. This is the interaction the prior arms never
  measured: pick 1 alone (NOT-CARRIER 4/8), picks 1+2 on 14+12
  (NOT-CARRIER 4/8, subject 312647db0), narrowed pick-3
  conversation alone on the bare far end (NOT-CARRIER 4/8,
  seed-for-seed identical, subject 740c9ab96).
- UNMEASURED: the villager-objectives.js half of OVE-57 — the
  rally-guard path skips the invite lottery so it draws no new RNG
  (`rally-volunteer` decision, commit via objCommitGuardOffer). It
  stays UNMEASURED because it is written against the origin-line
  Phase 4 form of villager-objectives.js (ranked candidates via
  companionRank, the npcInviteDecision lure lottery,
  objCommitGuardOffer — 5 hits at pick 3's base, 0 at the far end
  and 0 at the 14+12 base) that the far end never had. It was NOT
  hand-resolved and NOT smuggled in: the subject restores that
  file byte-identical to the 14+12 base. Whether the rally-guard
  lottery skip carries any of the collapse is still UNKNOWN, and
  it stays on the suspect list until the coordinator decides its
  route (it needs the Phase 4 objectives content landed first, or
  a re-implementation against the far end's form — a
  coordinator/Steve call, not this arm's).

## Merge-tree pre-check + live picks

- Pre-check pick 2 (base = pick's first parent c32ff6fa8, ours =
  transplant-12-14-subject c8655548f, theirs = 7041e1bfb, full
  40-char hashes): rc=1, merged tree
  4111ed85351a31a1ebc0da371da74c5b9d5315b0, conflicted files
  EXACTLY TWO — scripts/balance-proof.json and
  scripts/phone-frame-proof.json, BOTH zero-src-reader tooling
  files. src/js/conversation.js AUTO-MERGED CLEAN (merged blob
  carries the OVE-33 quote check at line 1751),
  scripts/test-snippet-stage-direction.js took theirs silently
  (base→ours is empty for that file: the 14+12 base already
  carries family 12's OVE-29 assertions, so no Auto-merging line
  — the merged file carries the OVE-33 "They go still."
  assertion at line 73), sw.js auto-merged. Conflict markers:
  balance-proof.json lines 3/6/9; phone-frame-proof.json lines
  7/15/23 and 81/91/101 — EXACTLY the files and marker lines the
  1412 arm's pick-3 prediction named (its merged tree 9f0ee83b…),
  reproduced here on the pick-2-direct base (without pick 1 in
  between). BOTH section kinds were read (the `changed in both`
  stage 1/2/3 entries AND the `Auto-merging` messages).
  Predicted pick-2-resolved tree (temp-index construction from
  the merge-tree output: merged tree with both tooling files set
  to their OURS blobs from the 14+12 base — balance-proof
  d0c6a42ff2395a49672f235f0218a3f969619dee, phone-frame-proof
  b06910148b2bb567ca3941b2ac3245872f74f632): 
  35857b15ff5a61750b9dccf9ab1f21bb8c3d705f; prediction commit
  2263a1c360ac49259c6d071db6d6d3ace19e2902 (parent = c8655548f).
  Its diff vs the 14+12 base is exactly pick 2 MINUS the two
  tooling files (10 files).
- Pre-check pick 3 (base = pick's first parent 134a3d0ab, ours =
  predicted pick-2-resolved commit 2263a1c3, theirs = 4a1c77cf1,
  full 40-char hashes): rc=1, merged tree
  3ba598f98f4594ff2be0a7d33afd8de5948829a3, conflicted files
  EXACTLY TWO — scripts/balance-proof.json (tooling) and
  src/js/villager-objectives.js (game code).
  src/js/conversation.js AUTO-MERGED CLEAN (merged blob
  c816f9a2904d1114a907465b8189143d1590ce6a). Conflict markers:
  balance-proof.json lines 3/6/9; villager-objectives.js lines
  23/25/29 and 957/972/1039 — EXACTLY the same files and marker
  lines the 1412 arm's pick-4 prediction named (its merged tree
  627f198e…) and the p3conv pre-check named (its merged tree
  7dd5d9c6…), reproduced here on the 14+12+pick-2 base.
  Predicted narrowed-subject tree (temp-index construction: the
  conflicted tree with both conflicted files set to their OURS
  blobs from the pick-2 tree — balance-proof d0c6a42f…,
  villager-objectives.js
  9afc522b0a4a2d57719cbcd4254f611c95f290a2 — and the new evidence
  receipt removed): 1c6c8954270cd5da11bb41f32a74fe0e4bd7ca8c;
  prediction commit c19aad22147d1fe40a71a2cae2f8d522901d50bd
  (parent = c8655548f). Its diff vs the 14+12 base is EXACTLY
  10 files (conversation.js +25/-2, test-snippet +4, the OVE-33
  receipts, 3 godpath test fixes, the establishment test fix,
  sw.js +1).
- LIVE PICK 2 (subject branch `transplant-15e-p23-subject`, cut
  at transplant-12-14-subject): `git cherry-pick 7041e1bfb`
  rc=1, tooling-only conflict on scripts/balance-proof.json and
  scripts/phone-frame-proof.json. Each file resolved with
  `git checkout --ours` (14+12-base version kept byte-identical)
  and the cherry-pick continued. Result: commit c6e64d524
  "OVE-33: refresh stale quick proofs and fix outside-Muse
  fails", tree 35857b15ff5a61750b9dccf9ab1f21bb8c3d705f —
  EXACTLY the predicted pick-2-resolved tree. Its diff vs the
  14+12 base is exactly pick 2 MINUS the two tooling files (10
  files). Both resolved tooling files are byte-identical to the
  base (balance-proof blob d0c6a42f, phone-frame-proof blob
  b0691014).
- LIVE PICK 3: `git cherry-pick 4a1c77cf1` rc=1. Output:
  "CONFLICT (content): Merge conflict in
  scripts/balance-proof.json" and "CONFLICT (content): Merge
  conflict in src/js/villager-objectives.js". Status at
  conflict: A evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz,
  UU scripts/balance-proof.json,
  M src/js/conversation.js,
  UU src/js/villager-objectives.js. The live pick reproduces the
  merge-tree prediction EXACTLY (same two files; conversation.js
  merged, not conflicted). Per the prereg method: both conflicted
  files resolved with `git checkout --ours` (pick-2-tree versions
  kept byte-identical), the evidence receipt removed (`git rm -f`
  — it is a NEW file in the pick, ABSENT at the base, so
  "byte-identical to the base" means absent), then
  `git cherry-pick --continue`. Result: commit 1efa1c1ab
  "OVE-57: triage tip quick-check after bond dawn", tree
  1c6c8954270cd5da11bb41f32a74fe0e4bd7ca8c — EXACTLY the predicted
  narrowed-subject tree. Its diff vs the 14+12 base is exactly
  the predicted 10 files (conversation.js +25/-2); the pick-3
  commit alone is exactly conversation.js +21/-2;
  villager-objectives.js, balance-proof.json and
  phone-frame-proof.json are byte-identical to the base; the
  evidence receipt is absent. Subject branch LEFT in place at
  1efa1c1ab5026a796db0e73afca368ca9b0b2140 (14+12 base + pick 2 +
  narrowed pick 3) for reproducibility. The arm branch was then
  checked back out (sim-transplant15e-p23-a at 8d9911e2a, clean).
- Resolutions recorded (file, pick, method): pick 2 —
  scripts/balance-proof.json, `git checkout --ours` (14+12-base
  version kept byte-identical); pick 2 —
  scripts/phone-frame-proof.json, `git checkout --ours`
  (14+12-base version kept byte-identical); pick 3 —
  scripts/balance-proof.json, `git checkout --ours` (pick-2-tree
  version kept byte-identical); pick 3 —
  src/js/villager-objectives.js, `git checkout --ours`
  (pick-2-tree version kept byte-identical — the hunk is DROPPED
  by coordinator decision, not hand-resolved); pick 3 — evidence
  receipt, REMOVED from the subject (absent at the base).
- One resolution wrinkle, recorded honestly: the first
  `git checkout --ours` on each pick wrote the correct base
  content into the worktree files (0 conflict markers afterwards;
  hashes d0c6a42f / b0691014 / 9afc522b, the base blobs) but did
  NOT collapse the index stages — `git ls-files -u` still showed
  stages 1/2/3 for both files. The resolution was completed with
  `git add` on the already-correct files (conflict-resolution
  marking, not staging for a commit — the standard cherry-pick
  completion flow), after which `git ls-files -u` was empty and
  the continue succeeded. No file was hand-edited at any point;
  the resolved content is the base's, byte-identical. (Same
  wrinkle the p3conv arm recorded for its pick.)

## Step

- STEP id: t15e-p23, ran ~7 min on the re-run (STEP-EXIT 0), fix
  swapped in (f8fda4295a99), native restored sha-verified
  (75762cb2259d), policy a7ff5c516440 (14+12-base own policy).
- Driver log: evidence/2026-11-13/culpritbisect-a-t15e-p23-driver.log
- Summary: evidence/2026-11-13/culpritbisect-a-t15e-p23-summary.json
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t15e-p23/
  (8 per-seed JSONs).
- First-run records (write-flap casualty, see §Infrastructure):
  evidence/2026-11-13/culpritbisect-a-t15e-p23-driver-flap1.log
  (the first run's driver log, all 8 seeds ran) and
  evidence/2026-11-13/perseed-culpritbisect-a-t15e-p23-flap1/
  (the 4 per-seed JSONs the first run managed to write).
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
  measured hunks gate dialogue beats on quote/stage conditions and
  draw no new RNG — neither hunk can change the RNG stream, so a
  deterministic harness reproduces the far end's trajectories
  exactly when the triggers never fire. The triggers never fired
  on this band (see SENSE-TESTING below): no trader was met, so
  no intro was ever pending, and no resume opener quoted a
  stage-direction beat. The verdict is therefore a clean
  NOT-CARRIER on the survival metric, and the identity itself is
  the mechanism check that the hunks are inert here. The same
  identity held for the p3conv arm (pick-3 conversation alone)
  and the p12 arm (picks 1+2) — three independent subjects, same
  four survivors on the same days.

## What this means (plain words)

Family 15E is the resume / conversation-repair group. This arm
put its last two commits together — the quoted-speech fix and
the trader-intro fix — on the village that already had the two
earlier dialogue-guard repairs (families 14 and 12), and asked
whether the two together change whether villages live or die.
The far end survived 4 of 8 villages, and with both repairs in
place it still survived exactly the same 4, on exactly the same
days, with the same two villages reaching wave 5. The repairs
change nothing about survival: together, as apart, they are not
the collapse, and not part of it. The other half of the last
commit — a villager volunteering as guard without rolling dice —
could not even be placed on this far end, because it is written
for a newer version of the guard-volunteer code the far end never
had; whether THAT half carries any of the collapse is still
unknown, and it stays on the suspect list. The wall numbers do
not move: national 0, table 0, wins 0 on the collapse band. With
this arm, every measurable 15E combination is now measured and
NOT-CARRIER: pick 1 alone, picks 1+2, pick-3 conversation alone,
and picks 2+3 narrowed — the only unmeasured piece left in the
family is the pick-3 objectives half, which needs Phase 4
objectives content first.

## SENSE-TESTING NOTE (read the transcripts, not just the counts)

- The sampled vetSays lines read as the game's established
  System voice, coherent throughout: door-defense reports name
  the defenders and who is hurt ("Lauren, Bessie, Pilar and
  Aroha met them at the door — 4 put down. Lauren, Bessie,
  Pilar, Aroha are hurt."); veteran-kill callouts name the killer
  and the beast on camera ("Bessie just put down Spool... on
  CAMERA. That's a veteran kill, folks. REMEMBER the name.");
  Arc IV arrives on the surviving seed ("Blooded — the village
  knows where the Producers bleed."). The lost seed (190391,
  dead day 86) fights at the door to the end, with repeated
  veteran kills (Elder Sunbasker, Pack-leader Big Loud) —
  villagers act like people defending a home, not numbers
  draining.
- The honest limit: BOTH measured dialogue paths went
  UNEXERCISED — 0 trader mentions across the whole 8-seed corpus
  (225 vetSays lines), no `tradeIntroDeferred` state appears in
  any per-seed snapshot, and no resume opener quoted a
  stage-direction beat. The competent bot policy never meets a
  trader on this band, so no intro is ever pending, deferred, or
  re-surfaced, and the OVE-33 quote check never fires. This arm
  therefore proves the hunks are survival-inert (4/8,
  seed-for-seed identical), NOT that the deferred intro surfaces
  correctly or the quote check classifies correctly when they do
  fire — that behavior is proven only by the picks' own unit
  tests on the origin line, not by these sims. If either path
  ever needs sim-level proof, it needs a scenario that actually
  puts a trader in front of the player before Continue (for
  OVE-57) or a resume opener over a quoted beat (for OVE-33),
  not a survival band.

## Findings for the backlog

- None new from this arm's sims beyond the unmeasured-objectives
  half, which is already the standing coordinator decision owed
  from the 1412 arm. No new sim-findings.md entry — the open item
  is the 1412 arm's, not a new observation. One process note for
  the backlog (filed here, not in sim-findings.md): the step
  driver refuses to overwrite existing per-seed files, so a
  re-run after a partial run must move the old corpus aside
  first — worth a line in the step script's usage note.

## Infrastructure

- HOST WRITE FLAP: a flap window opened ~21:10 UTC during the
  first step run and ran to ~21:40 UTC (flap-watch log: probe A
  FAIL@write EPERM every minute 21:20–21:35, A=OK again
  21:40:31). It struck this arm's first run directly: seeds
  190391–190394 wrote fine (20:57–21:02), then seeds 190395–
  190398 each left a 0-byte `.tmp-26485` file (21:10, 21:16,
  21:23, 21:29) — the driver writes per-seed output to a .tmp
  file then renames, and the write step was refused — so the
  analyzer reported INCOMPLETE corpus and wrote no summary, and
  the step's restore of standing.js failed the same way, leaving
  standing.js 0 bytes (empty-file sha e3b0c44…). Recovery:
  standing.js restored from the subject commit via a fresh temp
  file + rename (the write refused 8 times, succeeded on the
  9th attempt once the window flickered; rename itself always
  works), sha-verified 75762cb2259d; the first run's driver log
  preserved as culpritbisect-a-t15e-p23-driver-flap1.log and its
  4 per-seed JSONs preserved under perseed-culpritbisect-a-t15e-p23-flap1/;
  the 0-byte .tmp files removed. The re-run's driver initially
  refused to overwrite the 4 surviving per-seed files
  ("CULPRITBISECT STOP: refusing to overwrite …"), so they were
  moved to the flap1 backup dir first; the re-run then completed
  clean in ~7 min, and its 4 re-written per-seed JSONs are
  byte-identical to the first run's (sha-verified) — the harness
  is deterministic across the flap, and the re-run reproduces
  the first run's 8 driver-log result lines exactly. No data
  lost: every number in this evidence file is confirmed by two
  independent runs (the flap1 driver log + the clean re-run
  summary).
- SAFE-COMMIT INDEX CLOBBER: struck on the stage-1 commit
  (8d9911e2a) — `git status` showed both committed files as
  staged-deleted + untracked although the commit was correct.
  Repaired with the documented pipe (`git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info`); verified
  `git status --short` empty + `git diff HEAD` empty +
  hash-object == HEAD blob per file afterwards (index blobs
  compared against HEAD explicitly, per the p3conv lesson — an
  empty status alone can be a failed read). No work lost.
- REGISTRY LOCK CONTENTION: the arm-start heartbeat queued ~8
  min behind a sibling's worktree-register (sim-answercourt-
  confirm-b, slow `git worktree add`) holding REGISTRY.lock; it
  landed 20:45:22Z once the lock freed. The registration
  heartbeat (20:30:47Z) stayed within the 15-minute freshness
  window throughout, so the tree was never at reaper risk. A
  second heartbeat landed 21:41:08Z after the flap recovery.
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
two hunks that draw no RNG and whose triggers never fire cannot
move survival, and the identical days on all 8 seeds — confirmed
by TWO runs (the flap-hit first run's driver log and the clean
re-run's summary, with byte-identical per-seed files for the four
overlapping seeds) — confirm the mechanism (dialogue gating, no
RNG) rather than merely the count. One process note for future
arms: a re-run after a partial run must move the old corpus aside
first (the driver refuses to overwrite), and a flap window can
empty standing.js during the step's restore — recover it from the
subject commit via temp-file + rename and sha-verify before doing
anything else; do NOT check out another branch while writes are
refused (an attempted checkout aborted cleanly, no damage, but a
successful one mid-flap could truncate arm-branch files). Wall
numbers: unmoved — survived 4/8, regional 7/8, national 0, table
0, wins 0, wave-5 2/8, wave-4 8/8, median 150d.

## Proof

- scripts/test-transplant15e-p23-a.js — stage 1: 155 passed, 0
  failed (committed with the prereg, 8d9911e2a); stage 2 §11 +
  §12: 224 passed, 0 failed total (live picks c6e64d524 +
  1efa1c1ab, trees 35857b15… / 1c6c8954… = predicted, diff exactly
  the predicted 10 files, all three resolved files byte-identical
  to the base; step verdict 4/8 NOT-CARRIER, seed-for-seed
  far-end identity, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs (not re-run by this
  arm; the step tooling was untouched and the step ran through
  the same script — the step script is named, not executed, by
  this arm's proof).
