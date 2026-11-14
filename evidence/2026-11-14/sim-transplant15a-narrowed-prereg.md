# sim-transplant15a-narrowed-prereg — family 15A NARROWED (dawn scorer / convo wants) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-narrowed-a, branch
`sim-transplant15a-narrowed-a`, worktree
`~/workspace/worktrees/sim-transplant15a-narrowed-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15A (family 15A = dawn scorer / convo wants, 3 standalone
first-parent OVE commits, pick order oldest first: c937de65f →
4594de6b5 → 748cce3b8). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant12-14-prereg.md (method + proof
template: merge-tree pre-check with each pick's FIRST PARENT as
base, branch-identity legs worktree-only, prereg ancestry by
message/subject not hash).

This arm is the NARROWED re-run of family 15A after the first arm
(sim-transplant15a-a) STOPPED on a tooling-only conflict. The first
arm's STOP evidence is on master:
evidence/2026-11-14/sim-transplant15a.md, commit ae737133a — pick 1
c937de65f conflicted ONLY on scripts/green-list.txt, lines 803–809;
picks 2/3 never attempted. No judged sim ran under STEP t15a-dawn;
that STEP id belongs to the STOPped arm and is NOT reused here.

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
- Subject: far end + family 15A diff, built on scratch branch
  `transplant-15a-narrowed-subject` (far end + `git cherry-pick
  c937de65f` FIRST, then `git cherry-pick 4594de6b5`, then
  `git cherry-pick 748cce3b8` on top — standalone commits, no
  `-m 1`). NEVER committed to the arm branch. Branch LEFT in place,
  hash recorded in evidence, so the verdict is reproducible.
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
- STOP clause: per the tooling-resolution rule above — a tooling-only
  conflict resolves with `git checkout --ours` and the pick
  continues; ANY other conflicted file (any src/js, data, policy,
  docs, or test file) STOPS the arm immediately, with the exact
  conflict list reported, no hand-resolution, no narrowed re-run
  decided by this arm. If the subject cannot be built, the outcome
  is UNMEASURED-BY-CONFLICT and no judged sim runs.
- STEP id: t15a-narrowed (fresh — do NOT reuse t15a-dawn, which
  belongs to the STOPped arm).

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
  files: EXACTLY ONE — scripts/green-list.txt. No src/js conflict,
  no docs conflict. PREDICTION: CONFLICT, tooling-only → resolve
  with `git checkout --ours`, continue. This reproduces the first
  arm's prediction exactly (same tree OID).
- PICK-1-RESOLVED TREE (predicted, temp-index build): `git
  read-tree 203a32775` + apply the pick-1 diff minus
  scripts/green-list.txt + `git write-tree` →
  6d6216e3e414518d2c335829e130e65ec849941b. Diff vs the far end is
  exactly the pick-1 diff minus the green-list line: 3 files,
  +320/-3 (docs/ONTOLOGY.md +3/-2, test-convo-dawn-priorities.js
  +206/-0, convo-wants.js +111/-1). The live pick-1 commit's tree
  MUST equal 6d6216e3… after the --ours resolution (proof §7
  asserts this); if it does not, the pick-2 prediction below is
  suspect and is re-run against the true tree.
- PICK 2 (OVE-50 onto the pick-1-resolved tree):
  `git merge-tree --write-tree --merge-base=9bc88d85d7ee4c2f6d3c4c0715315f24b628e449 <pred1-commit 2a66d8023650403002cfd14671f4a10898ac2b95 (tree 6d6216e3…, parent 203a32775)> 4594de6b528e40872c356f1d465762581ce06cd1`
  → rc=1, tree ff493cec33720c28342cb3711e7fba3e9869a583, conflicted
  files: EXACTLY TWO — scripts/green-list.txt AND
  src/js/convo-wants.js. PREDICTION: CONFLICT, game-code included
  → per the tooling-resolution rule the live pick 2 is expected to
  STOP the arm. Live picks are ground truth: if the live pick 2
  conflicts on any src/js file, STOP, no hand-resolution.
- PICK 2 conflict mechanism (verified, not guessed):
  - Green-list.txt: pick 2 inserts
    `scripts/test-favor-need-threshold-unify.js quick` between
    `scripts/test-convo-dawn-priorities.js quick` (added by pick 1)
    and `scripts/test-dawn-materialize-honesty.js quick` (a line
    the far end lacks) — the same adjacency class as pick 1.
  - src/js/convo-wants.js: one hunk, merged-tree lines 1868–1885
    (the village-resource favor scan in the favor-need selection
    block). OURS side (far end + pick 1) keeps the LOCAL line's
    older direct-read scan (`const water = (v.water ||
    {}).clean || 0; … pantryKcalLive … rosterN * 4000`). THEIRS
    side (pick 2) rewrites it into the believed-pantry scan
    ("Village-resource favor scan — believed pantry/cistern for
    THIS speaker (VILLAGER-BRAIN seam 4)… Presence uses the same
    shared gates as liveness."). Pick 2's OVE-50 unification is
    written on top of the believed-pantry code from 03436c1bc
    (family 15D, "Believed pantry/cistern for food-security and
    favors"): 03436c1bc IS an ancestor of pick 1's first parent,
    of pick 2's first parent, and of pick 1 itself — but is NOT an
    ancestor of the far end. Marker counts: "VILLAGER-BRAIN seam
    4" 0 hits at the far end, 1 hit at pick 2's first parent
    9bc88d85d and 1 hit at pick 1. The far end's favor scan never
    got the believed-pantry rewrite, so pick 2's diff has no clean
    context to land on. No intervening first-parent commit between
    pick 1 and pick 2's first parent touches convo-wants.js (only
    97a67d4f8 OVE-47 proof refresh and 9bc88d85d OVE-49 green-list
    probe) — the divergence is the local line's own r166
    ALL-BLOCKED rewrite of the favor-why block vs the origin
    line's deferredAfterResume version, plus the missing 15D base.
  - Consequence recorded honestly: the task brief's expectation
    ("pick 1 conflicts on green-list.txt only → resolve with
    checkout --ours, continue") is confirmed for pick 1 only. The
    pick-2 prediction is NEW information from this arm's pre-check
    (the first arm never ran a pick-2 prediction — its sequence
    stopped at pick 1). If the live pick 2 reproduces the
    src/js conflict, family 15A as a group is UNMEASURED-BY-CONFLICT
    at pick 2, and the coordinator's next decision is whether
    15D (believed pantry) must land first / the group must be
    re-ordered — this arm decides none of that.
- PICK 3: prediction NOT runnable. It needs the pick-2-applied
  tree, which cannot exist if pick 2 stops at a src/js conflict.
  No pick-3 conflict status is claimed either way (same rule as
  the first arm's picks-2/3 note). Pick 3's first parent
  49341fd78 (OVE-53 phone-frame refresh after favor thresholds)
  IS a descendant of pick 2, confirming the sequence dependency.

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

The merge-tree pre-check and the pick-2 mechanism verification ran
as part of prereg preparation, before this file was committed — the
12-14 arm's prereg likewise records its pre-check results. The
binding requirement is met: this prereg is committed BEFORE the
subject is cut or any judged sim runs. No subject branch exists
yet; no STEP t15a-narrowed corpus, summary, or driver log exists.
The temp-index predicted trees (6d6216e3…, pred commit 2a66d802)
are unreferenced prediction objects, not branches and not the
subject.
