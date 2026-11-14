# sim-transplant15a — family 15A (dawn scorer / convo wants) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-a, branch `sim-transplant15a-a`,
worktree `~/workspace/worktrees/sim-transplant15a-a`.
Prereg: evidence/2026-11-14/sim-transplant15a-prereg.md (committed
BEFORE the subject was cut or any judged sim ran — the pre-check
ran during prereg preparation; see the prereg's ordering note).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + hidden_files/family15-grouping-prereg-2026-11-14.md §15A.

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 1)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15A. No judged sim ran. Survived/8: unmeasured.
  Per-seed days: unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-15a-subject`: NEVER cut. No subject
  tip hash exists to record.
- STEP t15a-dawn: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15a-prereg.md. Base: far end
203a32775 (GOOD 4/8) with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified). Seeds 190391–190398, 150d death-aware,
competent verbatim own-policy per step. Thresholds for the GROUP as
one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
STEP id; ≥3/8 NOT-CARRIER. STOP clause: on ANY cherry-pick
conflict, STOP, report the exact conflict list, do NOT hand-resolve
game code, do NOT decide a narrowed re-run.

## Family identity (verified at run start, before any sim)

- Pick 1: c937de65f32d26e064d8935dd984490b2ee50a6c "OVE-48:
  convoSelectWant reads dawn commitment and top drive". First
  parent 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32. Diff: 4 files —
  docs/ONTOLOGY.md +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1.
- Pick 2: 4594de6b528e40872c356f1d465762581ce06cd1 "OVE-50: unify
  favor-need selection and liveness thresholds". First parent
  9bc88d85d7ee4c2f6d3c4c0715315f24b628e449. Diff: 4 files —
  docs/ONTOLOGY.md +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-favor-need-threshold-unify.js +171/-0 (new test),
  src/js/convo-wants.js +171/-43.
- Pick 3: 748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6 "OVE-51:
  bond/link raises as scored dawn candidates". First parent
  49341fd7824023543b13dca40831d704d49e4637. Diff: 5 files —
  docs/ONTOLOGY.md +6/-4, scripts/green-list.txt +1/-0,
  scripts/test-bond-dawn-candidates.js +264/-0 (new test),
  src/js/bond-initiation.js +298/-69, src/js/villager-brain.js
  +17/-4.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: c937de65f → 4594de6b5 → 748cce3b8.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check + live confirmation (the STOP)

- PICK 1 merge-tree prediction (base = pick's first parent
  1e03b3d69, ours = far end 203a32775, theirs = c937de65f):
  rc=1, tree 77512a52b7c7537d28d07e193c10cf0799c3b442, conflicted
  files: EXACTLY ONE — scripts/green-list.txt. No src/js conflict,
  no docs conflict. PREDICTION: CONFLICT, tooling-only.
- Live confirmation on throwaway scaffold branch tmp-15a-predict
  (cut at the far end, deleted afterwards — NOT the subject):
  `git cherry-pick c937de65f` rc=1. Output: "Auto-merging
  docs/ONTOLOGY.md", "Auto-merging scripts/green-list.txt",
  "CONFLICT (content): Merge conflict in scripts/green-list.txt",
  "Auto-merging src/js/convo-wants.js", "error: could not apply
  c937de65f... OVE-48: convoSelectWant reads dawn commitment and
  top drive". Status at conflict: M docs/ONTOLOGY.md, UU scripts/green-list.txt, A scripts/test-convo-dawn-priorities.js, M src/js/convo-wants.js. Conflict markers at
  scripts/green-list.txt lines 803–809 (one hunk): HEAD side empty,
  pick side adds four lines — `scripts/test-villager-brain-dawn.js
  quick`, `scripts/test-convo-dawn-priorities.js quick`,
  `scripts/test-dawn-materialize-honesty.js quick`,
  `scripts/test-dawn-midday-repick.js quick` — between
  `scripts/test-village-smoke-20261011.js` and
  `scripts/test-villager-gear-20261009.js`.
- Conflict mechanism (verified by grep): the pick's first parent
  1e03b3d69 lists test-villager-brain-dawn.js,
  test-dawn-materialize-honesty.js, and test-dawn-midday-repick.js
  in green-list.txt (1 hit each); the far end 203a32775 lists NONE
  of the four lines (0 hits each — the local line never carried
  those three dawn test entries at that position). The pick's own
  green-list diff is +1 line: it inserts
  test-convo-dawn-priorities.js between
  test-villager-brain-dawn.js and test-dawn-materialize-honesty.js
  (both lines the far end lacks), so the 3-way merge conflicts in
  that hunk. The pick's own green-list diff is +1 line; the other
  three lines are context the far end lacks, not lines the pick
  adds.
- PICKS 2 AND 3: predictions NOT run and no conflict status is
  claimed either way — the transplant sequence stops at pick 1;
  there is no pick-1-applied tree to build pick 2's prediction on,
  and a pick-2-onto-bare-far-end prediction would not be the
  transplant sequence.
- Recovery: cherry-pick aborted, scaffold branch deleted, HEAD back
  on sim-transplant15a-a at ef7430f2f, tracked tree clean, no
  CHERRY_PICK_HEAD, no subject branch. Nothing was hand-resolved.

## What this means (plain words)

Family 15A is the dawn-scorer / conversation-wants group: it makes
what villagers talk about follow what dawn already decided they are
doing, puts favor requests behind one shared gate instead of two
different ones, and lets bond and village-link raises compete as
scored dawn choices like any other morning decision. It changes no
food cost, no damage, no armor, no spawn, no wave or table number —
but unlike a pure dialogue-quote fix it does touch the weights
inside dawn decisions, so it was a livelier suspect than a quote
guard. Whether it carries any of the collapse is UNKNOWN: the very
first pick could not be placed on the far end, because the far end's
green-list.txt (the list of tests that must stay green) is missing
three dawn-test lines the origin line has, and the pick's one new
line lands right next to the missing ones. The conflict is in a
test-list file only — no game code conflicted — but the binding
rule says stop on any conflict and let the coordinator decide the
narrowed route. The group stays unmeasured and stays on the suspect
list until the coordinator picks that route.

## Coordinator decision owed

The narrowed route for family 15A. Candidate shapes (the arm
decides none of these): (a) resolve scripts/green-list.txt as a
tooling-only step and re-run the three picks; (b) split the group
(pick 1 alone, or picks 2–3 on a resolved base); (c) record the
group unmeasurable-by-conflict and move on. Note for the decision:
the conflicting hunk is one green-list adjacency — the game-code
hunks (convo-wants.js, ONTOLOGY.md) auto-merged cleanly on the live
pick, and the test file added cleanly. The same green-list
adjacency may recur in later 15-group arms whose picks touch
green-list.txt (15B–15F all add green-list lines; 15F's warning
already names this class).

## Infrastructure

- HOST WRITE FLAP: active during this run. The heartbeat failed
  with EPERM (errno=1, PermissionError on the registry atomic
  write) on attempts 1–5, then succeeded on attempt 6 at
  2026-11-14T09:51:53Z (bounded foreground retry loop, 10×25s,
  per the task brief). No work was lost; no write was bypassed.
  The prereg, proof, and evidence files were written after the
  window cleared. Flap window observed ~09:45–09:51Z.
- No runtime restart struck this arm. No safe-commit clobber (no
  commits before the final one). No reaper risk: heartbeat landed
  09:51:53Z.
- Telemetry deviation check: NOT RUN — no corpus exists to check
  (recorder-corpus class would refuse it anyway, same as all prior
  bisect/transplant arms). Baseline NOT rolled.

## Metric review

No metric proved wrong — no metric was exercised. The primary
(survived/8, group thresholds fresh per 2115 §3) never got a
reading because the subject could not be built. The conflict rule
itself worked as designed: the merge-tree prediction named the
exact conflicted file, the live pick reproduced it exactly, and
the arm stopped without hand-resolving anything. One process note
for future arms: the green-list adjacency conflict is
predictable from the first-parent counts alone (pick-parent lists
lines the far end lacks at the insertion point) — a pre-pick grep
of the insertion context would have flagged this before the
merge-tree run. Worth adding to the transplant template as a cheap
early signal, not as a substitute for the merge-tree check.

## Proof

- scripts/test-transplant15a.js — 8 sections: family identity
  (3 picks, first-parent order), merge-tree prediction (rc=1,
  exactly [scripts/green-list.txt]), conflict mechanism (context
  counts), family content (dawn/favor/bond markers; no lever
  numbers), verdict mapping, prereg recorded, base state (no
  subject branch, no STEP artifacts, no cherry-pick in progress),
  STOP outcome (evidence records UNMEASURED-BY-CONFLICT, no
  verdict claimed). Run before the commit; count in the commit
  message.
- scripts/test-culpritbisect-a.js — 116 legs (re-run after the
  pre-check; the step tooling was untouched, but the re-run
  confirms the shared harness still passes on this tree).
