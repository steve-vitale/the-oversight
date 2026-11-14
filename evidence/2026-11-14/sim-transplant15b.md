# sim-transplant15b — family 15B (companionScore / objectives) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15b-a, branch `sim-transplant15b-a`,
worktree `~/workspace/worktrees/sim-transplant15b-a`.
Prereg: evidence/2026-11-14/sim-transplant15b-prereg.md (committed
b46992963, BEFORE cutting the subject or running any judged sim).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + hidden_files/family15-grouping-prereg-2026-11-14.md §15B.

## Verdict

- VERDICT: UNMEASURED — the STOP clause fired on the FIRST live pick.
  No judged sim ran (STEP t15b-companion was never spent); no
  survival count, no per-seed table, no wave-5 read exists for this
  group. The family is NOT cleared and NOT a carrier — it is
  unmeasurable-by-conflict on the far end as cherry-picked, and the
  route forward is a coordinator decision only.
- Subject branch `transplant-15b-subject` LEFT in place at
  203a327750a223e0a1465dc51f5409787efdfaae — exactly the far end,
  0 picks applied (the pick was aborted, not resolved).
- The merge-tree prediction was exact: pick 1 predicted CONFLICT
  (rc=1, tree fc9266a7…, 4 files) and the live pick reproduced all
  four conflicts, same files, same kinds.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15b-prereg.md. Base: far end
203a32775 (GOOD 4/8) with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified). Seeds 190391–190398, 150d death-aware,
competent verbatim own-policy per step. Thresholds for the GROUP as
one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
STEP id; ≥3/8 NOT-CARRIER. STOP clause: on ANY cherry-pick
conflict, STOP, report the exact conflict list, do NOT hand-resolve
game code, do NOT decide a narrowed re-run.

## Family identity (verified at run start, before any sim)

- PICK 1: 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32 "Stop
  objAskCompanion cross-person objective overwrite". First parent
  03436c1bcacbbf0c3d0b868503cf32da162d573b. 7 files, +389/-20 (js=1:
  src/js/villager-objectives.js +70/-14; new test
  scripts/test-companion-objective-overwrite.js +294).
- PICK 2: 8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9 "OVE-54: unify
  companionScore across door, party, favor-company". First parent
  a1567198c125a3649b8a8bd5de8bf160c8a51c6b. 14 files, +5757/-28
  (js=5: companion-score.js +103 new, favor-company.js +26/-2,
  villager-brain.js +12/-1, villager-objectives.js +19/-12,
  win-plan.js +12/-1; evidence payload 5,245 lines of
  phone-frame JSON receipts).
- PICK 3: 134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc "OVE-54: record PR
  URL in companionScore evidence". First parent IS pick 2. 1 file,
  +2/-1 (evidence only). js=0.
- No pick touches scripts/policies (pol=0) or src/js/standing.js.
  Far-end native standing.js 75762cb2…, fix f8fda4295a99…,
  far-end policy a7ff5c51….
- Far-end file inventory: src/js/villager-brain.js ABSENT at
  203a32775 (added on the origin line by 1671d28b8);
  src/js/companion-score.js ABSENT (created by PICK 2);
  scripts/test-raid-danger-heard.js ABSENT (deleted on the local
  line); evidence/2026-11-08/companion-score-unify.md ABSENT
  (created by PICK 2).

## Merge-tree pre-check (run before cutting the subject)

First-parent bases (the base `git cherry-pick` itself uses):

- PICK 1 (1e03b3d69 onto the far end): rc=1, tree
  fc9266a7cc404ed7682b552e3d6474c47e7f8ad1, FOUR conflicted files:
  docs/ONTOLOGY.md (content), scripts/green-list.txt (content),
  scripts/test-raid-danger-heard.js (modify/delete),
  src/js/villager-objectives.js (content). PREDICTED CONFLICT.
- PICK 2 (onto the pick-1-applied tree): BLOCKED — no clean pick-1
  tree exists to predict against.
- PICK 3 (onto the pick-2-applied tree): BLOCKED for the same reason.
- SUPPLEMENTARY (not sequence predictions — for the coordinator
  only): PICK 2 directly against the far end → rc=1, SIX conflicted
  files (docs/ONTOLOGY.md, index.html, scripts/green-list.txt,
  scripts/phone-frame-proof.json, src/js/villager-brain.js
  modify/delete — file absent at the far end,
  src/js/villager-objectives.js); companion-score.js itself is a
  clean add, favor-company.js and win-plan.js merge clean. PICK 3
  directly against the far end → rc=1, ONE conflicted file
  (evidence/2026-11-08/companion-score-unify.md modify/delete —
  file absent at the far end).

## Live pick 1 — STOP (ground truth, prediction reproduced exactly)

- Subject branch `transplant-15b-subject` cut at the far end
  203a32775; `git cherry-pick 1e03b3d69` rc=1.
- Exact conflict list (from `git status --porcelain` at the stop):
  - UU docs/ONTOLOGY.md
  - UU scripts/green-list.txt
  - DU scripts/test-raid-danger-heard.js
  - UU src/js/villager-objectives.js
- Cleanly staged by the pick (not conflicted): A
  scripts/test-companion-objective-overwrite.js, M
  scripts/test-motivation-wire.js, M
  scripts/test-sick-stayhome-gates-20261022.js.
- Conflict hunks (marker line numbers, worktree file at the stop):
  - src/js/villager-objectives.js — ONE hunk, lines 12–17:
    HEAD has `//   - objRallyFreshRaid()` (no args); the pick has
    `//   - objCommitGuardOffer(cid, offer)` +
    `//   - objRallyFreshRaid(vid)`. A header-comment "Provides"
    list adjacency: the far end dropped the `(vid)` arg in the
    comment while the pick added a line above it and kept `(vid)`.
    The substantive code — the objAskCompanion body rewrite and
    the new objCommitGuardOffer — AUTO-MERGED CLEANLY; the local
    line never touched that region. The game-code conflict is one
    comment hunk, but the STOP clause does not grade conflicts by
    size: no hand-resolution, even trivial, by this arm.
  - docs/ONTOLOGY.md — ONE hunk, lines 2021–2025: the same
    "Provides:" list for villager-objectives — HEAD's shorter list
    (no objCommitGuardOffer, objRallyFreshRaid() arg-less) vs the
    pick's longer list (objRefreshPick, objNeedsEmergencyPick,
    objDangerBelief, objResourceBelief, objResourceSee,
    objCommitGuardOffer, objRallyFreshRaid(vid)).
  - scripts/green-list.txt — ONE hunk, lines 916–926: HEAD lists
    test-pellet-boost / test-pellet-q4 lines; the pick lists
    test-person-trust-20261108, test-raid-danger-heard,
    test-believed-pantry-perception, test-companion-objective-
    overwrite, test-win-rallyguard, test-retarget-gossip lines.
  - scripts/test-raid-danger-heard.js — DU (modify/delete):
    deleted in HEAD (the far end), modified in 1e03b3d69 (+8
    lines); the pick's version was left in the tree at the stop.
    Index stages at the stop: stage 1 blob 8977a728… (base),
    stage 3 blob 181e9a65… (pick); no stage 2 (ours deleted it).
- The pick was ABORTED (`git cherry-pick --abort`) immediately
  after recording the list — no file was hand-edited, no hunk
  resolved. The subject branch is back at exactly the far end.
  The arm branch was checked back out clean; no step ran; no
  standing.js swap ever happened (the swap is a step-time action
  and no step was cut).

## What this means (plain words)

Family 15B cannot be landed on the far end by cherry-pick as a
group: its very first commit already collides with the far end in
four places, one of them in the game's companion-objective code.
The collision itself is small — the one game-code hunk is a
comment listing function names, and the real code changes slid in
cleanly underneath it — but the rules say a worker never resolves
a conflict by hand, so the group stays unmeasured. The second
commit would hit a second wall anyway: it edits villager-brain.js,
a file that does not exist at the far end at all, and its evidence
file also does not exist there. The family was built on a later
codebase than the far end, and the far end predates two of its
files. Whether the group carries the collapse is still unknown;
what is known is that it cannot be tested this way without a
coordinator decision (e.g. a rebased family, a hand-ported
equivalent, or a narrowed route — none of which this arm decides).

## Step result (t15b-companion)

NO STEP RAN. The STOP fired at the live pick, before any step was
cut. There is no step corpus, no summary, no driver log, no
per-seed table, and no survived/8 read for this group. STEP id
t15b-companion is unspent. The verdict is UNMEASURED by conflict,
not by measurement.

## Sense-testing (SENSE-TESTING LAW)

No sim ran, so no transcripts exist for this arm. Nothing to
sense-test. The mechanism (villagers asked before being drafted
as guards; one shared companion ranking) is described from the
diff in the prereg; whether it moves survival is unmeasured.

## Reachability

No sim ran, so no reachability read exists for this arm. Wall
numbers carried in (collapse band): far end 4/8, wave-5 2/8;
merge 1/8, wave-5 0/8; national 0, table 0, wins 0.

## Metric review

- No metric proved wrong — no metric was exercised. The primary
  (survived/8, group thresholds) never got a reading because the
  STOP fired first; that is the designed behavior of the conflict
  rule, not a metric failure.
- The merge-tree pre-check earned its keep again: the prediction
  (rc=1, exactly the 4 files) reproduced exactly in the live pick,
  including the modify/delete kind on the test file. First-parent
  bases remain the correct prediction convention.
- Telemetry deviation check: NOT RUN — no judged corpus exists
  for this arm (no step ran), so there is no --current input to
  check. Baseline NOT rolled. (The recorder-corpus refusal that
  prior arms record applies to judged corpora; with no corpus
  there is nothing to refuse.)
- Method note for the next conflict arm: the live pick's
  auto-merge can be kinder than the merge-tree's file list
  suggests — merge-tree flags a file as conflicted for one hunk
  while the rest of the diff applies cleanly. The evidence should
  keep reporting the hunk count per file (here: 1 hunk each in
  the three UU files), so the coordinator can judge whether a
  narrowed route is a one-line comment port or a real rebase.

## Infrastructure

- HOST WRITE FLAP: active through this run. The prereg+proof
  commit hit EPERM on safe-commit attempts 1–3 (20s retries
  inside safe-commit.sh) and landed on attempt 4 as b46992963
  (09:51:41Z). No work lost; the commit is verified (git show
  --stat + sha checks).
- SAFE-COMMIT INDEX CLOBBER: struck on that same commit — after
  the commit, the index showed both committed files as
  staged-deleted (D) + untracked (??), worktree files
  byte-identical to HEAD. Repaired with the documented pipe
  (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); verified afterwards with `git status --short`
  empty + `git diff HEAD` empty + hash-object == HEAD blob for
  both files.
- HEARTBEAT BLOCKED, THEN LANDED: the first heartbeat attempt
  (~09:46Z) hung >60s on `flock -x REGISTRY.lock` — the lock was
  held by PIDs 17735, 18148, 18364, 18366 (the reaper, per the
  2026-11-12 AGENTS.md lesson: worktree-reap.sh holds
  REGISTRY.lock for its whole 9–14 min run). The attempt was
  SIGTERM'd after blocking. A retry with `timeout 90` landed at
  09:52:53Z (heartbeat_at 2026-11-14T09:52:53+00:00). The reaper
  staleness line is 4h; no removal risk at any point.
- No runtime restart hit this arm. No step was cut, so no
  partial corpus exists to discard.

## Proof

- scripts/test-transplant15b.js — stage 1: 103 passed, 0 failed
  (committed with the prereg, b46992963); stage 2: 124 passed, 0
  failed (live pick-1 conflict list, subject at the far end with
  0 picks, UNMEASURED verdict, base restored).
- scripts/test-culpritbisect-a.js — 116 passed, 0 failed (re-run
  after the stop, unchanged shared proof).
