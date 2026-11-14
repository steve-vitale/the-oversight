# sim-transplant15a-prereg — family 15A (dawn scorer / convo wants) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-a, branch `sim-transplant15a-a`,
worktree `~/workspace/worktrees/sim-transplant15a-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15A (family 15A = dawn scorer / convo wants, 3 standalone
first-parent OVE commits, pick order oldest first: c937de65f →
4594de6b5 → 748cce3b8; STEP id suggestion t15a-dawn). Binding
prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant12-14-prereg.md (method + proof
template: merge-tree pre-check with each pick's FIRST PARENT as
base, branch-identity legs worktree-only, prereg ancestry by
message/subject not hash).

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15A diff, built on scratch branch
  `transplant-15a-subject` (far end + `git cherry-pick c937de65f`
  FIRST, then `git cherry-pick 4594de6b5`, then
  `git cherry-pick 748cce3b8` on top — standalone commits, no `-m 1`).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 15A: three standalone first-parent commits (see §Family
  identity). No merge, no second-parent side.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15A GROUP as
  one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
  STEP id (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering but kept on the suspect list); ≥3/8 NOT-CARRIER. If
  the group reads CARRIER, the next arm splits it commit-by-commit
  (same rule as 2115 §3 (c) for families 4 and 13).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks, marker line
  numbers), do NOT hand-resolve game code, do NOT decide a narrowed
  re-run (narrowed families are a coordinator decision only). If
  conflicts are confined ENTIRELY to zero-src-reader tooling files
  (scripts/balance-proof.json / scripts/green-list.txt), record
  them and STOP too.
- STEP id: t15a-dawn (fresh).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers dawn/convo
wants (conversation opens from wants; the dawn decision and the
conversation a villager opens are linked by design — see the
"Context-aware openings" and goal/thread sections). No standalone
canon doc covers OVE-48/50/51 themselves — the three picks are
coherence repairs inside the documented dawn-scorer +
conversation-wants contract (the opener should track the same
priorities dawn chose; favor-need selection and liveness should use
one gate; bond/link raises should be scored dawn candidates like
every other dawn choice), not new systems. Nothing here invents
canon.

## Family content (read before the picks)

- Pick 1, c937de65f "OVE-48: convoSelectWant reads dawn commitment
  and top drive": `convoDawnPriorities(vid)` reads today's
  vbrain commitment kind + top drive (vgoal) and biases the
  weighted want pick toward the wants that match (DAWN_KIND_WANTS
  / DAWN_DRIVE_WANTS, primary bias 2.0); unfinished-business
  pre-emptors (seeds, repay, pocketed) stay above. In plain words:
  what a villager talks about when you open a conversation now
  follows what dawn already decided they are doing today.
- Pick 2, 4594de6b5 "OVE-50: unify favor-need selection and
  liveness thresholds": one shared FAVOR_NEED_GATE vocabulary ends
  the selection-vs-liveness double standard for favor wants;
  personality (npcTemper) shifts the shared gate. The gate reads
  believed pantry kcal (`pantryKcal` / `pantryKcalLive`) as a
  threshold input — kcal appears in the diff as a READ of a believed
  number, not as a changed cost, yield, or conversion.
- Pick 3, 748cce3b8 "OVE-51: bond/link raises as scored dawn
  candidates": VISIT/pair/scholar/link entry points raise
  PROPOSE_BOND and RAISE_LINK candidates the initiator's dawn
  scorer weighs (bond-initiation.js +298/-69, villager-brain.js
  +17/-4). Warmth gate and npcInviteDecision stay. The scoring
  reads `build_standing` drive weights (1.2 + min(1.5, weight)) —
  a drive label and a scoring weight, not a standing number or a
  changed gate.

Mechanism expectation: the group changes WHICH want a conversation
opens with and WHICH dawn candidates a villager weighs — dawn
coherence and social prioritization. It changes no kcal cost, no
damage, no armor, no spawn, no food yield, no spoilage, no wave or
table gate number. A survival effect, if any, would have to come
through villagers choosing different dawn work or different
conversations — a second-order behavioral path, not a lever. Note
the difference from the 12+14 pair (dialogue-quote guards only):
15A touches dawn scoring weights, so it is a livelier suspect than
a quote guard — but the weights are biases inside existing
decisions, not new gates.

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each pick's FIRST PARENT as the base
(the base `git cherry-pick` itself uses; the transplant12-14 arm
used the same convention). Run with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: the 3-arg form dumps the whole merged tree; --write-tree
prints one tree OID + conflicted-file info + messages).

- PICK 1 (OVE-48 onto the far end):
  `git merge-tree --write-tree --merge-base=1e03b3d69480e2d57c08bd2629aeffdeee4e6f32 203a32775 c937de65f32d26e064d8935dd984490b2ee50a6c`
  → rc=1, tree 77512a52b7c7537d28d07e193c10cf0799c3b442, conflicted
  files: EXACTLY ONE — scripts/green-list.txt (stage lines 1/2/3).
  No src/js conflict, no docs conflict. PREDICTION: CONFLICT,
  tooling-only.
- Live confirmation (throwaway scaffold branch tmp-15a-predict,
  cut at the far end, deleted afterwards — NOT the subject):
  `git cherry-pick c937de65f` rc=1: "Auto-merging
  docs/ONTOLOGY.md", "Auto-merging scripts/green-list.txt",
  "CONFLICT (content): Merge conflict in scripts/green-list.txt",
  "Auto-merging src/js/convo-wants.js". Status: M
  docs/ONTOLOGY.md, UU scripts/green-list.txt, A
  scripts/test-convo-dawn-priorities.js, M src/js/convo-wants.js.
  Conflict markers at green-list.txt lines 803–809 (one hunk):
  HEAD side empty, pick side adds four lines —
  `scripts/test-villager-brain-dawn.js quick`,
  `scripts/test-convo-dawn-priorities.js quick`,
  `scripts/test-dawn-materialize-honesty.js quick`,
  `scripts/test-dawn-midday-repick.js quick` — between
  `scripts/test-village-smoke-20261011.js` and
  `scripts/test-villager-gear-20261009.js`.
- Conflict mechanism (verified by grep, not guessed): the pick's
  first parent 1e03b3d69 lists test-villager-brain-dawn.js,
  test-dawn-materialize-honesty.js, and test-dawn-midday-repick.js
  in green-list.txt (1 hit each); the far end 203a32775 lists NONE
  of the four lines (0 hits each — the local line never carried
  those three dawn test entries at that position). The pick's own
  green-list diff is +1 line: it inserts
  test-convo-dawn-priorities.js between
  test-villager-brain-dawn.js and test-dawn-materialize-honesty.js
  (both lines the far end lacks), so the 3-way merge conflicts in
  that hunk. The pick's own green-list diff is +1 line
  (test-convo-dawn-priorities.js); the other three lines are
  context the far end lacks, not lines the pick adds.
- PICKS 2 AND 3: predictions NOT run. The transplant sequence
  stops at pick 1 — there is no pick-1-applied tree to build pick
  2's prediction on, and a pick-2-onto-bare-far-end prediction
  would not be the transplant sequence. No pick-2/3 conflict
  status is claimed either way.
- STOP CLAUSE FIRED. The subject branch `transplant-15a-subject`
  was NEVER cut. No judged sim ran under STEP t15a-dawn. No
  per-seed corpus, no summary, no driver log exists for this arm.
  Outcome: UNMEASURED-BY-CONFLICT. The coordinator decides the
  narrowed route (e.g. whether the green-list line is resolved as
  a tooling-only step, the group is split, or the group is recorded
  unmeasurable-by-conflict). This arm decides none of it.

## Family identity (verified at run start, before any sim)

- Pick 1: c937de65f32d26e064d8935dd984490b2ee50a6c "OVE-48:
  convoSelectWant reads dawn commitment and top drive" (2026-11-08
  22:27 UTC). First parent 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32
  (single parent — standalone commit, no merge). Diff vs first
  parent, 4 files: docs/ONTOLOGY.md +3/-2,
  scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1. js=1, pol=0.
- Pick 2: 4594de6b528e40872c356f1d465762581ce06cd1 "OVE-50: unify
  favor-need selection and liveness thresholds" (2026-11-08 22:39
  UTC). First parent 9bc88d85d7ee4c2f6d3c4c0715315f24b628e449
  (single parent). Diff vs first parent, 4 files:
  docs/ONTOLOGY.md +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-favor-need-threshold-unify.js +171/-0 (new test),
  src/js/convo-wants.js +171/-43. js=1, pol=0.
- Pick 3: 748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6 "OVE-51:
  bond/link raises as scored dawn candidates" (2026-11-08 22:47
  UTC). First parent 49341fd7824023543b13dca40831d704d49e4637
  (single parent). Diff vs first parent, 5 files:
  docs/ONTOLOGY.md +6/-4, scripts/green-list.txt +1/-0,
  scripts/test-bond-dawn-candidates.js +264/-0 (new test),
  src/js/bond-initiation.js +298/-69, src/js/villager-brain.js
  +17/-4. js=2, pol=0.
- Pick order is origin order (oldest first), verified on the
  first-parent chain: `git log --first-parent --reverse
  d229b58f5..a628aeaf3` lists c937de65f → 4594de6b5 → 748cce3b8 in
  that order (a1567198c "OVE-55: Phase 4 social rates screen on
  tip 748cce3b8" comes later on the same chain, confirming 748cce3b8
  closes the group).
- No pick touches src/js/standing.js or scripts/policies (empty
  diff on both paths for all three picks).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Ordering note (recorded, not hidden)

The merge-tree pre-check and the live scaffold confirmation ran as
part of prereg preparation, before this file was committed — the
12-14 arm's prereg likewise records its pre-check results. The
binding requirement is met: this prereg is committed BEFORE the
subject is cut or any judged sim runs. No subject branch exists;
no STEP t15a-dawn corpus, summary, or driver log exists. The
scaffold branch tmp-15a-predict was a throwaway prediction check
(cut at the far end, cherry-pick aborted, branch deleted); it is
not the subject and holds no commits.
