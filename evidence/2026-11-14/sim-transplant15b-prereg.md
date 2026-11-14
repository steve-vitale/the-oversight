# sim-transplant15b-prereg — family 15B (companionScore / objectives) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15b-a, branch `sim-transplant15b-a`,
worktree `~/workspace/worktrees/sim-transplant15b-a`.

## Authority — binding preregs

- evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
  program definition + thresholds).
- evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
  roster-check standing-fix swap f8fda4295a99, step mechanics).
- evidence/2026-11-14/sim-transplant12-14-prereg.md +
  evidence/2026-11-14/sim-transplant12-14.md (method + proof template:
  first-parent merge-tree bases, live picks are ground truth, proof
  branch-identity worktree-only legs, prereg ancestry by message).
- hidden_files/family15-grouping-prereg-2026-11-14.md §15B (grouping:
  15B = 1e03b3d69 → 8bb704423 → 134a3d0ab, STEP id suggestion
  t15b-companion).

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15B diff, built on scratch branch
  `transplant-15b-subject` (far end + `git cherry-pick 1e03b3d69`
  FIRST, then `git cherry-pick 8bb704423`, then `git cherry-pick
  134a3d0ab` on top). NEVER committed to the arm branch. Branch
  LEFT in place, hash recorded in evidence, so the verdict is
  reproducible.
- Picks, origin order (oldest first):
  - PICK 1: 1e03b3d69 "Stop objAskCompanion cross-person objective
    overwrite" — first parent 03436c1bcacbbf0c3d0b868503cf32da162d573b
    ("Believed pantry/cistern for food-security and favors", family
    15D's first commit). 7 files, +389/-20: docs/ONTOLOGY.md +4/-3,
    scripts/green-list.txt +1, scripts/test-companion-objective-
    overwrite.js +294 (new test), scripts/test-motivation-wire.js
    +10/-2, scripts/test-raid-danger-heard.js +8,
    scripts/test-sick-stayhome-gates-20261022.js +2/-1,
    src/js/villager-objectives.js +70/-14. js=1.
  - PICK 2: 8bb704423 "OVE-54: unify companionScore across door,
    party, favor-company" — first parent a1567198c125a3649b8a8bd5de8bf160c8a51c6b
    ("OVE-55: Phase 4 social rates screen on tip 748cce3b8"). 14
    files, +5757/-28: docs/ONTOLOGY.md +18/-3,
    evidence/2026-11-08/companion-score-unify.md +66,
    evidence/2026-11-08/phone-companion-frame-736-r1.json +2556,
    evidence/2026-11-08/phone-companion-frame-844-r1.json +2689,
    evidence/2026-11-08/phone-companion-frame-r1.md +9,
    index.html +1, scripts/godpath/test-companion-score-unify.js
    +235 (new test), scripts/green-list.txt +1,
    scripts/phone-frame-proof.json +10/-9,
    src/js/companion-score.js +103 (new file),
    src/js/favor-company.js +26/-2, src/js/villager-brain.js +12/-1,
    src/js/villager-objectives.js +19/-12, src/js/win-plan.js +12/-1.
    js=5. The +5757-line payload is 5,245 lines of evidence JSON
    (phone-frame receipts); the js footprint (5 files) is what the
    carrier question turns on.
  - PICK 3: 134a3d0ab "OVE-54: record PR URL in companionScore
    evidence" — first parent 8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9
    (PICK 2 itself). 1 file, +2/-1:
    evidence/2026-11-08/companion-score-unify.md. js=0 (evidence
    only, rides with 54).
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15B GROUP
  as one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a
  fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER. If the group reads CARRIER, the next arm splits it
  commit-by-commit (same rule as 2115 §3 (c)).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STEP id: t15b-companion (fresh).
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks, marker line
  numbers), do NOT hand-resolve game code, do NOT decide a narrowed
  re-run (narrowed families are a coordinator decision only). If
  conflicts are confined ENTIRELY to zero-src-reader tooling files
  (scripts/balance-proof.json / scripts/green-list.txt), record
  them and STOP too.
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's `worktreeOnly`
  helper passes them vacuously when HEAD is 'master', so the proof
  stays green on master. Prereg-commit ancestry legs resolve by
  message/subject, not by hash (0608Z lesson: an adoption rebase
  rewrites hashes).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers companion /
favor-company (company-favor release, joint outings, water-run
milestone, favor requests) — the area this family touches. No
standalone canon doc covers the companionScore unification itself
or the objAskCompanion cross-person-overwrite repair — both are
coherence repairs inside the documented companion/favor contracts
(one shared ranking for who walks/sits with whom; a companion
decides a GUARD offer instead of having their objective
overwritten), not new systems. Nothing here invents canon.

## Family content (read before the picks)

PICK 1 (1e03b3d69, OVE-45, VILLAGER-BRAIN Phase 4 slice): stops
objAskCompanion writing another villager's objective. The GUARD
offer is advertised to the companion with terms; npcInviteDecision
(kind 'lure', in betrayal.js) accepts or refuses; only on accept
does the new objCommitGuardOffer write the companion's OWN
objective. On refuse the next candidate is tried and nobody's
objective is touched. The old code took the top-ranked candidate
and overwrote their objective unconditionally (kind GUARD,
purpose guard, same target/clock). Test:
scripts/test-companion-objective-overwrite.js (294 lines: refuse →
overwrite count 0, objective unchanged, ask returns null; accept
roll 0 → companion self-commits GUARD with advertised terms;
failing control restores the pre-Phase-4 overwrite and the probe
counts it).

PICK 2 (8bb704423, OVE-54): one shared companionScore for who to
spend time with — door ask (objAskCompanion), party launch pick
(findCompanion), and favor-company partner preference all rank
through companionScore (new src/js/companion-score.js, +103, pure
read — no Math.random, no writes; prefers personTrustOf and
pairAffinity when present). Call sites keep their eligibility
filters (trip distance, sick, alone, rally-only, ranger profile,
engaged/away gates). index.html loads the new module. Test:
scripts/godpath/test-companion-score-unify.js (235 lines: door,
party, and company rankings identical — same ids, same order,
same s; failing control with a private parallel formula
disagrees; overwrite count stays 0 on refuse).

PICK 3 (134a3d0ab): records the PR URL in the companionScore
evidence note only. No code.

In plain words: villagers stop having their plans overwritten
when someone asks them to walk along as a guard — they get asked
and can say no — and the three places that pick "who goes with
whom" now use one shared ranking instead of three private
formulas. No cost, no reward, no schedule, no survival lever
changes on the face of it: added js lines carry zero kcal /
damage / armor / spawn / spoilage / standing / table / wave /
deedGate identifiers (the two substring hits are false
positives — "bark_armor_teach" context in a header comment and
"Stable" containing "table"). A survival effect, if any, would
have to come through villagers keeping their own errands instead
of being drafted as guards, or through different companion
choices — a second-order path, not a lever.

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each pick's FIRST PARENT as the base
(the base `git cherry-pick` itself uses), with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: the 3-arg form dumps the whole merged tree; --write-tree
prints one tree OID + conflicted-file info + messages).

- PICK 1 (1e03b3d69 onto the far end):
  `git merge-tree --write-tree --merge-base=03436c1bcacbbf0c3d0b868503cf32da162d573b 203a32775 1e03b3d69`
  → rc=1, tree fc9266a7cc404ed7682b552e3d6474c47e7f8ad1,
  FOUR conflicted files:
  - docs/ONTOLOGY.md — CONFLICT (content)
  - scripts/green-list.txt — CONFLICT (content)
  - scripts/test-raid-danger-heard.js — CONFLICT (modify/delete):
    deleted in 203a32775, modified in 1e03b3d69
  - src/js/villager-objectives.js — CONFLICT (content) — GAME CODE
  PREDICTED CONFLICT. The pick rewrites objAskCompanion's GUARD
  write and adds objCommitGuardOffer in the same region where the
  far end's villager-objectives.js diverged (win-drives 2026-11-03
  rally_guard comment + objAskCompanion body both changed on the
  local line after the first parent). The test file
  test-raid-danger-heard.js does not exist at the far end (deleted
  on the local line; the pick edits it on the origin line).
- PICK 2 (8bb704423 onto the pick-1-applied tree): prediction
  BLOCKED — no clean pick-1 tree exists to predict against (pick 1
  conflicts). Cannot be computed in sequence.
- PICK 3 (134a3d0ab onto the pick-2-applied tree): prediction
  BLOCKED for the same reason.
- SUPPLEMENTARY (not sequence predictions — recorded for the
  coordinator only, in case a narrowed route is ever decided):
  - PICK 2 directly against the far end
    (`--merge-base=a1567198c125a3649b8a8bd5de8bf160c8a51c6b
    203a32775 8bb704423`) → rc=1, SIX conflicted files:
    docs/ONTOLOGY.md, index.html, scripts/green-list.txt,
    scripts/phone-frame-proof.json (all content),
    src/js/villager-brain.js (modify/delete: the file does NOT
    exist at the far end — added on the origin line after the far
    end by 1671d28b8 — and is modified in 8bb704423),
    src/js/villager-objectives.js (content). src/js/companion-score.js
    itself is a clean add (new file); favor-company.js and
    win-plan.js merge clean against the far end.
  - PICK 3 directly against the far end
    (`--merge-base=8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9
    203a32775 134a3d0ab`) → rc=1, ONE conflicted file:
    evidence/2026-11-08/companion-score-unify.md (modify/delete:
    the file does not exist at the far end — created by PICK 2 —
    and is modified in 134a3d0ab).

- Prediction: PICK 1 CONFLICTS (game code included). Live picks are
  ground truth: the arm cuts the subject and attempts pick 1 live;
  if the live pick conflicts, the STOP clause fires and the group
  reads UNMEASURED (no judged sim, no narrowed re-run by this arm).

## Family identity (verified at run start, before any sim)

- PICK 1: commit 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32 exists;
  subject "Stop objAskCompanion cross-person objective overwrite".
  First parent 03436c1bcacbbf0c3d0b868503cf32da162d573b "Believed
  pantry/cistern for food-security and favors". `git diff --stat
  1e03b3d69^ 1e03b3d69`: 7 files, +389/-20 (js=1:
  src/js/villager-objectives.js +70/-14). Table reading js=1, pol=0
  CONFIRMED.
- PICK 2: commit 8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9 exists;
  subject "OVE-54: unify companionScore across door, party,
  favor-company". First parent a1567198c125a3649b8a8bd5de8bf160c8a51c6b
  "OVE-55: Phase 4 social rates screen on tip 748cce3b8". `git diff
  --numstat 8bb704423^ 8bb704423`: 14 files, +5757/-28 (js=5:
  src/js/companion-score.js +103 new, src/js/favor-company.js
  +26/-2, src/js/villager-brain.js +12/-1,
  src/js/villager-objectives.js +19/-12, src/js/win-plan.js
  +12/-1). Table reading js=5, pol=0 CONFIRMED. Evidence payload
  5,245 lines (phone-companion-frame JSON receipts) recorded, not
  hidden.
- PICK 3: commit 134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc exists;
  subject "OVE-54: record PR URL in companionScore evidence".
  First parent is PICK 2 itself (8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9).
  `git diff --numstat 134a3d0ab^ 134a3d0ab`: 1 file, +2/-1
  (evidence only). Table reading js=0, pol=0 CONFIRMED.
- Pick order verified in the origin first-parent chain
  d229b58f5..a628aeaf3: 1e03b3d69 (position 22), 8bb704423 (12),
  134a3d0ab (11) in reverse-chronological listing — oldest first is
  1e03b3d69 → 8bb704423 → 134a3d0ab, matching the grouping prereg.
- No pick touches scripts/policies (pol=0 for all three) or
  src/js/standing.js. Far-end native standing.js sha256 is
  75762cb2…; fix standing.js (5157782a4) sha256 is f8fda4295a99…;
  far-end policy sha256 is a7ff5c51… (same substrate as the bisect
  prereg).
- Far-end file inventory (matters for the conflicts):
  src/js/villager-brain.js ABSENT at 203a32775 (added on the origin
  line by 1671d28b8); src/js/companion-score.js ABSENT (created by
  PICK 2); scripts/test-raid-danger-heard.js ABSENT (deleted on the
  local line); evidence/2026-11-08/companion-score-unify.md ABSENT
  (created by PICK 2). objAskCompanion present at the far end (6
  hits in villager-objectives.js), at PICK 1's first parent (7
  hits), and at PICK 1 (8 hits).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Infrastructure (run start)

- HOST WRITE FLAP: active per the task brief (EPERM errno=1 on
  file/git writes, flickering, episodes 30min–2h). Bounded
  FOREGROUND retries only (up to 10×25s); never bypass safe-commit;
  never --force-delete. Every commit verified (git show --stat +
  sha checks); if the index clobbers, repair via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`.
- HEARTBEAT BLOCKED AT RUN START: the first heartbeat attempt
  (09:4xZ) hung >60s on `flock -x REGISTRY.lock` — the lock is
  held by PIDs 17735, 18148, 18364, 18366 (reaper, per the
  2026-11-12 AGENTS.md lesson: worktree-reap.sh holds REGISTRY.lock
  for its whole 9–14 min run). The heartbeat process was SIGTERM'd
  after blocking; registry heartbeat_at for sim-transplant15b-a
  remains the creation stamp 2026-11-14T09:38:51+00:00. Reaper
  staleness line is 4h, so no removal risk; heartbeat retried with
  a timeout as the run proceeds.
