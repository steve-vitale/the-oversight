# sim-transplant15c — family 15C fight brains (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15c-a, branch `sim-transplant15c-a`,
worktree `~/workspace/worktrees/sim-transplant15c-a`.
Prereg: evidence/2026-11-14/sim-transplant15c-prereg.md (committed
BEFORE cutting the subject or running any judged sim).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + hidden_files/family15-grouping-prereg-2026-11-14.md §15C.

## Verdict

- VERDICT: UNMEASURED (conflict) — the arm STOPPED before the subject
  was cut. This is NOT a CARRIER / AMBIGUOUS / NOT-CARRIER read; the
  pair was never measured. Family 15C stays on the suspect list with
  its mechanism unjudged.
- Survived: — (no step ran). Per-seed days: —. Wave-5: —. Median: —.
  Deaths: —. No judged sim ran; no STEP run; no corpus exists.
- STEP: t15c-fightbrain (fresh, NEVER RUN). Subject branch
  `transplant-15c-subject` was NEVER CUT — it does not exist. No
  subject hash to record.
- The STOP fired at pick 1, exactly as the binding prereg orders:
  on ANY cherry-pick conflict, STOP, report the exact conflict list,
  do NOT hand-resolve game code, do NOT decide a narrowed re-run.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15c-prereg.md. Authority: the
2115 §3 transplant definition + the bisect prereg (standing-fix swap
f8fda4295a99) + the family-15 grouping prereg §15C (15C = OVE-49 +
OVE-52, pick order oldest first). Base: far end 203a32775 (GOOD 4/8)
with the roster-check standing fix swapped in for every step (fix
f8fda4295a99; native restored byte-identical afterwards,
sha-verified). Seeds 190391–190398, 150d death-aware, competent
verbatim own-policy per step. Thresholds for the PAIR as one unit:
≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id;
≥3/8 NOT-CARRIER.

## Family identity (verified at run start, before any sim)

- Pick 1: commit 9bc88d85d7ee4c2f6d3c4c0715315f24b628e449 "OVE-49:
  green-list Phase 5 fight-brain knowledge probe". First parent
  97a67d4f8eedbe44296f045d6e7ea0990dbb7d36 (OVE-47). Diff: 2 files,
  +353/-0: scripts/green-list.txt +1, scripts/test-fight-brain-
  knowledge-probe.js +352 (new test). js=0.
- Pick 2: commit 1c1b23482a11581047af8a82cca0040ef7b162a1 "OVE-52:
  wire shared fighterState into both fight brains". First parent
  748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6 (OVE-51). Diff: 6 files,
  +511/-158: src/js/engine/combat.js +26/-0, src/js/fieldFights.js
  +90/-23, src/js/game.js +59/-11, src/js/villager-agency.js
  +172/-0, scripts/test-fight-brain-knowledge-probe.js +163/-123,
  docs/ONTOLOGY.md +1/-1. js=4.
- standing.js NOT in either pick's diff. No scripts/policies file
  in either. No data in either pick's diff.
- Probe-test placement: scripts/test-fight-brain-knowledge-probe.js
  ABSENT at the far end 203a32775, PRESENT at 52's first parent
  748cce3b8 — pick 2 edits the file pick 1 creates, so 49 → 52 is
  load-bearing and origin order (49 older: first-parent chain
  positions 19 vs 15).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).

## Merge-tree pre-check (run before cutting the subject)

Cherry-pick predictions use each commit's FIRST PARENT as the base
(the base `git cherry-pick` itself uses), with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`.

- PICK 1 (49 onto the far end): rc=1, conflicted tree
  a9dfc7b82167b80927abda7aecf8e14696532ffa, conflicted files EXACTLY
  ONE: scripts/green-list.txt. NOT CLEAN. Live-confirmed on a
  throwaway scaffold branch (tmp-15c-predict, deleted afterwards):
  `git cherry-pick 9bc88d85d` rc=1 ("Auto-merging
  scripts/green-list.txt", "CONFLICT (content): Merge conflict in
  scripts/green-list.txt"), `git status` UU scripts/green-list.txt,
  A scripts/test-fight-brain-knowledge-probe.js (the test file
  applies cleanly; only green-list conflicts). Conflict markers at
  lines 916 (`<<<<<<< HEAD`), 919 (`=======`), 927 (`>>>>>>>
  9bc88d85d (OVE-49: green-list Phase 5 fight-brain knowledge
  probe)`).
- PICK 2 (52 onto the 49-applied tree): NOT RUN — there is no clean
  pick-1 tree to predict from. Any pick-2 prediction would require
  resolving the green-list conflict first, which only the
  coordinator may authorize (STOP clause). The live pick 2 was
  never attempted; the subject branch was never cut.
- CONFLICT ANATOMY: theirs (49) appends one line at the END of
  green-list.txt after `scripts/test-retarget-gossip.js quick`:
  `scripts/test-fight-brain-knowledge-probe.js quick`. Ours (the
  far end, 97a67d4f8..203a32775) DELETED the last six lines of the
  base file in the same tail region —
  `scripts/test-person-trust-20261108.js quick`,
  `scripts/test-raid-danger-heard.js quick`,
  `scripts/test-believed-pantry-perception.js quick`,
  `scripts/test-companion-objective-overwrite.js quick`,
  `scripts/test-win-rallyguard.js quick`,
  `scripts/test-retarget-gossip.js quick` — and appended
  `scripts/test-pellet-boost-20261108.js quick` +
  `scripts/test-pellet-q4-20261108.js quick` instead. Both sides
  rewrite the file's tail, so the three-way merge cannot place 49's
  appended line. The conflict is confined ENTIRELY to
  scripts/green-list.txt, a zero-src-reader tooling file — and per
  the binding STOP clause the arm records it and STOPS anyway. The
  15F warning in the grouping prereg anticipated exactly this class
  (green-list.txt regenerated per tip; cherry-picks may conflict in
  tooling-only files).
- Prediction: PICK 1 CONFLICTS (tooling-only, green-list.txt). The
  STOP clause fired BEFORE the subject was cut. No subject branch,
  no judged sim, no STEP run, no verdict on the pair.

## Live picks (STOP — pick 1 conflicted, pick 2 never attempted)

- Scaffold branch `tmp-15c-predict` cut at the far end 203a32775;
  `git cherry-pick 9bc88d85d` rc=1 as above. `git cherry-pick
  --abort` run; scaffold branch deleted; HEAD back on
  sim-transplant15c-a; tracked tree verified clean.
- No subject commit was made to the arm branch; the subject branch
  does not exist.

## Step result (t15c-fightbrain — NEVER RUN)

No judged sim ran. No corpus, no summary, no driver log exists under
evidence/2026-11-13/ for STEP t15c-fightbrain. The standing-fix swap
never happened (no step to swap for); native standing.js was never
touched — on-disk standing.js is byte-identical to HEAD.

## Mechanism (what the unmeasured family would have tested)

In plain words: before this family, a villager who had already fought
a species behaved exactly like one who had never met it, and the two
fight brains made their run-or-fight calls from different numbers.
OVE-52 wires one shared read — `fighterState(vid)` — into both
brains: how hurt you are, how scared you are from what happened
before, whether you have fought THIS kind of monster before, and how
brave your character is. Villagers who know the beast open
differently and hold longer; villagers who don't know it run sooner.
OVE-49 is the measure-only probe that showed the gap (neither brain
read fought-species knowledge) and changes no game code itself.
This is the most plausible carrier mechanism in family 15 on first
reading — fight decisions are the combat-heavy death profile's front
door (the far-end band dies fighting; starvation killed 1 villager
across the 12-14 arm's 8 seeds) — but plausibility is not a verdict:
the family is UNMEASURED, and the collapse could still live
elsewhere. If the coordinator authorizes a narrowed route, the
natural split is 52-on-49 with the green-list line dropped (49's
test file applies cleanly; 52's game-code diff never touches
green-list.txt) — but that is the coordinator's call, not this arm's.
The coordinator decides the narrowed route; this arm re-attempts
nothing without that decision.

## Sense-testing (SENSE-TESTING LAW)

No sim ran, so no transcripts exist to read for this arm. Nothing to
judge; nothing judged. The mechanism note above is read from the
commits' own messages and diffs, not from villager behavior.

## Reachability

Unmeasured. No wave, rank, standing, or table read exists for this
family. Wall numbers carried in (collapse band): far end 4/8,
wave-5 2/8; merge 1/8, wave-5 0/8; national 0, table 0, wins 0.

## Metric review

- No metric proved wrong — no metric was exercised. The primary
  (survived/8, pair thresholds fresh per 2115 §3) never got a
  reading because the STOP clause fired first. That is the clause
  working as designed, not a metric failure.
- The merge-tree pre-check earned its keep again: it predicted the
  conflict before any branch was cut, and the live scaffold pick
  reproduced it exactly (same single file, same markers). The
  first-parent base convention (not the brief's merge-base) is the
  right predictor — the 12-14 arm's lesson holds.
- A process note for the next run: the grouping prereg's 15F
  warning named green-list.txt conflicts as a known risk for 15F
  commits, but 15C's pick 1 carries the same green-list line
  (OVE-49 green-lists its own probe test). Any family whose pick
  appends to green-list.txt can hit the same tail collision
  against the far end — the far end deleted the six tail lines
  that the origin line still carries. Future transplant arms
  should run the merge-tree pre-check FIRST (this arm did) and
  treat a tooling-only conflict as a STOP, not as a free pass to
  hand-resolve.

## Infrastructure — flap (recorded, not hidden)

- HOST WRITE FLAP: active at run start. The first heartbeat
  (worktree-heartbeat.sh sim-transplant15c-a, started ~09:46Z) ran
  ~173s and ended with `PermissionError: [Errno 1] Operation not
  permitted` writing the registry JSON — the heartbeat did NOT
  land. A `git status` at run start also failed with an EPERM
  index.lock write error, and a `/tmp` redirect failed mid-run
  ("fatal: unknown write failure on standard output"). Writes
  cleared intermittently afterwards (the prereg, proof, and this
  evidence file all wrote on first attempt). The flap cost no work
  — no step was running and no commit was in flight during the
  refused writes — but the tree's heartbeat is stale from run
  start, so the reaper risk note stands: if this arm's tree reads
  stale, it is flap, not death; the work is committed on the arm
  branch, not in flight.
- Telemetry deviation check: N/A — no corpus exists (no step ran),
  so there is nothing to refuse and nothing to roll. Baseline NOT
  rolled.

## Proof

- scripts/test-transplant15c.js — stage 1 + STOP outcome: 107
  passed, 0 failed (committed with the prereg and this evidence
  file). Covers family identity, merge-tree predictions (pick 1
  conflicts exactly green-list.txt, tree a9dfc7b8…; pick 2 not
  run), live-scaffold confirmation, family content, verdict
  mapping, prereg record, base state, STOP outcome.
- scripts/test-culpritbisect-a.js — NOT re-run: it judges bisect
  steps, and no step ran in this arm (116/116 stands from the
  12-14 arm's post-step re-run on the same master tooling).
