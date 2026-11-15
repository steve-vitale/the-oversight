# H1 transplant — brain-side ablation of PR #30 on master-tip substrate (arm sim-transplant7brain-a)

Run: fleshout-20261115T0810Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant7brain-a` (worktree `~/workspace/worktrees/sim-transplant7brain-a`,
base master tip 7251dcb4f — the playtest loop landed journey-establishment
r210 just before registration; read-only context, no overlap with this area).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap, step mechanics, far-end
baseline 4/8 on the matched band) + evidence/2026-11-15/sim-transplant7b.md
+ evidence/2026-11-15/sim-transplant7b-prereg.md (narrowed family 7b:
NOT-CARRIER, subject identical to the far-end baseline — the objectives-side
wiring is inert without the brain module; the brain-side half is the entire
remaining carrier question for family 7) + evidence/2026-11-13/sim-transplant7.md
(full family 7: UNMEASURED on cherry-pick conflict) + evidence/2026-11-14/sim-transplant8c.md
(narrowed-family + baseline-gate-STOP pattern).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §4 (one scoring pass —
"Every dawn decision logs its full consideration breakdown per villager") and
§5 (one arbiter, with commitment — "While a commitment is still valid ...
its candidate's score carries a commitment multiplier ... A villager's choice
does not flip-flop dawn to dawn") read — the family's area. The family is
canon-grounded: it makes the live objective honestly match the dawn
commitment §5 already requires. Nothing here invents canon. (No doc named
OVE-37 exists; OVE-37 is the port branch name for this dawn-brain work, and
the merge message + second parent carry it.)

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant7brain.js, stage 1, green at prereg stage).
The reverse-apply pre-check below is a READ-ONLY check (`git apply --check
-R`, no worktree modification) run during prereg preparation — the same
pattern as 7b's merge-tree pre-check, which was also run before the subject
was cut and recorded in its prereg. Its outcome is what the conflict-STOP
rule judges; no subject exists and no judged sim has run.

## The question

Does the brain-side half of PR #30 alone collapse survival? Full family 7
(merge `23245d5d6`, PR #30 dawn honesty, OVE-37 port, OVE-36 Candidate A)
is UNMEASURED: its cherry-pick onto the far end stopped on four unmerged
paths (ONTOLOGY.md UU, green-list.txt UU, villager-brain.js DU,
test-villager-brain-dawn.js DU — the family-6 missing-substrate wall, twice
over). The narrowed objectives-side half (7b) measured NOT-CARRIER — subject
identical to the far-end baseline 4/8 on every judged field, because
finishLottery calls vbrainAlignObjective only when loaded and the align
function does not exist on far-end substrate. The brain-side half (the align
function itself in villager-brain.js) is therefore the entire remaining
carrier question for family 7 — and it cannot be transplanted onto the far
end by any mechanical route (missing-substrate wall). So measure it the other
way round: ABLATION on master-tip substrate, which HAS the brain module.
This arm measures ONLY the ablation defined below. Nothing the full-family
arm already measured (nothing — it measured no survival number), nothing
else from the merge.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `23245d5d6` (full `23245d5d6d91b4b5284e2f503345dcfd1621ff0c`).
  First parent `7041e1bfb` ("OVE-33: refresh stale quick proofs and fix
  outside-Muse fails"); second parent `a038cf151` ("Align dawn materialize
  with commit after aimed override"). Second-parent side is 1 commit.
- `git diff --stat 23245d5d6^1 23245d5d6`: 6 files, +300/−13.
  `src/js`: 2 files — villager-brain.js 59 changed lines (numstat 56+/3−),
  villager-objectives.js 26 changed lines (numstat 19+/7−). Total src/js
  +75/−10. No scripts/policies file (pol=0). Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3 and the family-7 evidence.
- The other four files: docs/ONTOLOGY.md (2+/1−), scripts/green-list.txt
  (+1/−0), scripts/test-dawn-materialize-honesty.js (+214/−0, new file),
  scripts/test-villager-brain-dawn.js (8+/2−).
- `23245d5d6` is NOT an ancestor of the far end `203a32775` (verified by
  this arm — the family is origin-side, absent from the far end), and IS
  an ancestor of master tip `7251dcb4f` (verified by this arm — the family
  lives on master today).

## Ablation set definition (COORDINATOR-DEFINED via the task brief — do not redefine)

Reverse, onto master tip, the `src/js/villager-brain.js` hunks of the merge
diff — ALL 5 hunks, numstat 56+/3−:

1. `@@ -5,6 +5,7 @@` (+1/−0): the `vbrainAlignObjective` line in the
   `provides:` header list.
2. `@@ -15,6 +16,7 @@` (+1/−0): the `vbrain_materialize_matches_commit`
   rule comment ("when an aimed override wins, objPick aligns the live
   objective kind to the commitment after core chore/facing draws").
3. `@@ -281,6 +283,8 @@` (+2/−0): the commit record gains `vgoalLine` and
   `chore` (`chosen.vgoalLine || null`, `chosen.chore || null`) — the
   wiring the align function reads (`c.chore`, `c.vgoal`, `c.vgoalLine`).
4. `@@ -413,9 +417,10 @@` (+4/−3): the materialize comment rewrite —
   "Return the CORE pick so objPick still runs chore/facing draws on the
   legacy lottery kind (panel byte-stability). Commitment + log carry the
   aimed override; objPick calls vbrainAlignObjective afterward so the
   live objective kind matches the commit without extra Math.random."
5. `@@ -438,6 +443,54 @@` (+48/−0): the `vbrainAlignObjective` function
   itself — the OVE-36 / Candidate A rewrite of the live objective to the
   dawn commitment when an aimed override won (win-plan holds,
   EXPEDITION-with-purpose-chore hold, any-other-override fallthrough),
   plus its 3-line header comment. No Math.random here.

The objectives-side wiring (`villager-objectives.js`, measured inert by 7b)
STAYS — the ablation removes only the brain-side function and its wiring.
The test file `scripts/test-villager-brain-dawn.js` is a test, not game
code — do NOT include it in the ablation set; record what happens to it
(it references `vbrainAlignObjective` once; it may skip once the API is
gone). The subject diff must be exactly: one src/js file (−56/+3, the
reverse of the merge's brain hunks). No other file touched.

## Mechanism analysis (pre-registered, from source reads at master tip — not a verdict)

What the ablation CAN do on master-tip substrate:

- (a) With the align function gone, `finishLottery` (villager-objectives.js
  :682-683) calls `vbrainAlignObjective` only when loaded (`typeof ... ===
  'function'`) — the typeof guard returns the objective unchanged, exactly
  as on far-end substrate in 7b. The live objective then keeps the CORE
  lottery kind instead of being rewritten to the dawn commitment: aimed
  overrides (EXPEDITION hash, win-plan holds) are recorded on the
  commitment + log but no longer materialize in the villager's actual
  errand. The villager's day is decided by the core lottery, not the dawn
  pick — the exact behavior the merge changed.
- (b) The commit record loses `vgoalLine`/`chore`, so even the log's
  narration fields for the commit chore are gone; the honesty test's
  "narration fields read the commit chore" claim has nothing to read.
- (c) The brain module itself stays loaded (`vbrainOwnsDawn()` true,
  `vbrainScorePick` present) — only the align step is removed. Agency
  still honors the commitment at `vbrainExecuteDepart`; only the
  objective materialization is ablated. The ablation is therefore narrow:
  it isolates the align step from the rest of the brain, including the
  Phase 6 DUTY/ASSIGN handling that later commits added INSIDE the align
  function (see §Reverse-apply pre-check — that later growth is why the
  mechanical reverse fails).
- Consequence, stated up front: if the ablation collapses survival toward
  the merge's 1/8 from a collapsed master-tip baseline, the brain-side
  align step is a carrier; if survival is unchanged, it is not — on THIS
  substrate, where the brain module exists. The verdict is about the align
  step, not about the whole family (the objectives-side half was already
  judged NOT-CARRIER by 7b).

## Reverse-apply pre-check (READ-ONLY, run during prereg preparation)

`git diff 23245d5d6^1 23245d5d6 -- src/js/villager-brain.js` (98 lines, 5
hunks) reverse-applied against master tip `7251dcb4f` with `git apply
--check -R` — the authority for the conflict-STOP rule. Whole-patch
result: FAIL (`error: patch failed: src/js/villager-brain.js:5`).
Per-hunk verdicts (each hunk checked alone, same command):

- Hunk 1 `@@ -5,6 +5,7 @@` (provides line): FAIL. The tip header carries
  4 extra `provides:` entries after the align line (vbrainMarkPerception,
  vbrainShouldRefresh, dutyFeedCands, assignFeedCand — Phase 6) and extra
  rule lines; the added line's context no longer matches. (`patch`(1)
  with fuzz 2 finds it — fuzz is NOT the program's mechanical standard;
  under `git apply` it fails.)
- Hunk 2 `@@ -15,6 +16,7 @@` (rule comment): FAIL. The
  `vbrain_feeders_not_deciders` context line was rewritten (now mentions
  bond/link social ads and duty ads) and 5 new rule lines
  (vbrain_bond_candidates, vbrain_duty_candidates, vbrain_duty_pick,
  vbrain_duty_respects_garden_keeper, vbrain_duty_combat_social,
  vbrain_assign_standing, vbrain_midday_event_only) sit between it and
  `vbrain_commitment`.
- Hunk 3 `@@ -281,6 +283,8 @@` (vgoalLine/chore fields): FAIL. The tip
  commit record carries 2 NEW fields (`dutyTask`, `assignTask` — Phase 6)
  inserted between `chore` and `vbrainSrc`, so the added lines' following
  context differs.
- Hunk 4 `@@ -413,9 +417,10 @@` (materialize comment): CLEAN — the only
  clean hunk. Context lines verbatim at tip (line ~860, offset +443).
- Hunk 5 `@@ -438,6 +443,54 @@` (the align function itself): FAIL.
  The tip's align function is 114 lines, not the merge's 44: Phase 6
  inserted a DUTY/ASSIGN branch (duty_top_score / assign_standing, with
  `dawnHashRoll` facing) between the EXPEDITION branch and the
  any-other-override fallthrough, so the merge's contiguous 48-line block
  does not exist verbatim at tip (verified: merge align text is NOT a
  substring of the tip align text). The win-plan-hold and EXPEDITION
  branches are still verbatim, but the function's tail is not.

4 of 5 hunks fail, INCLUDING the align function itself — the entire carrier
question. The ablation set is NOT mechanically reversible onto master tip.
The conflict-STOP rule below therefore fires BEFORE any subject is cut:
no subject branch, no baseline leg, no corpus, no hand-editing the ablation
into shape. The 12 commits touching villager-brain.js between the merge
and master tip (OVE-51/54/60/74/76/78/81, Phase 6 duty/assign, garden
keeper, companionScore unification, mid-day idle demotion) are the drift
that broke the reverse — recorded here, not re-litigated.

## Conflict-STOP rule (binding on this arm)

Build the subject by MECHANICAL reverse-application only:
`git diff 23245d5d6^1 23245d5d6 -- src/js/villager-brain.js`, `git apply -R`
onto master tip on scratch branch `transplant-7brain-subject`. On ANY apply
conflict: STOP, report the exact conflict list (which hunks, which lines,
why the context drifted), do NOT hand-resolve game code, do NOT silently
drop a conflicting hunk and proceed (dropping would redefine the family
mid-run), report UNMEASURED with the exact conflict list. The live
`git apply --check -R` is the authority — if it conflicts, the
conflict-STOP rule fires. The pre-check above IS that live check, run
during prereg preparation: it conflicts on 4 of 5 hunks, so the STOP fires
here, before any subject branch exists.

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190391–190398** (8 seeds), the matched band — NOT RUN on this
  arm (conflict-STOP fires before any leg); recorded for the verdict
  mapping and for the coordinator's re-run, if any.
- BAND NOTE (coordinator decision, recorded here): the matched band
  190391–190398 is REUSED BY DESIGN — it is the program's defining
  baseline band where the far end reads 4/8 (reproduced twice:
  masterregress, then 8b with identical per-seed days 86/144/150/43/
  150/87/150/150, then 7b a third time), NOT claimed fresh.
- Freshness search (per local_seed_band_freshness skill), scope: word
  grep for `190391` across the whole `evidence/` tree (every dated prereg
  + evidence file + per-seed corpora) AND the prereg-only count. Result:
  the band appears in **497 files** under `evidence/` and in **88**
  `sim-*-prereg.md` files — it is the program's shared baseline band,
  heavily reused, NOT fresh. No forbidden/contaminated band list exists
  carrying a 190391–190398 reservation. Reuse rationale: the transplant
  question is defined AGAINST the far end's settled 4/8 on exactly this
  band; a fresh band would break comparability with every prior transplant
  verdict (and the 8c precedent shows a fresh band can fail the baseline
  gate for band-health reasons unrelated to the family). The reuse is
  explicit, recorded, and coordinator-directed — not silent.

## Measurement plan (NOT REACHED — recorded for the verdict mapping and the coordinator)

- Subject branch `transplant-7brain-subject` left in place; subject commit
  hash recorded in evidence. Measured diff verified byte-identical to the
  family's brain hunks reversed: the subject diff's added/removed lines
  (modulo hunk-header line numbers) must equal the reverse of the family
  diff's brain-hunk added/removed lines exactly (−56/+3 one file);
  objectives-side untouched (finishLottery guard still calls
  `vbrainAlignObjective` when loaded); subject policy == master-tip
  policy; subject native standing == master-tip standing.
- BASELINE LEG FIRST: STEP `ep-tip-7brain` on master tip `7251dcb4f`, via
  `scripts/culpritbisect-step.sh` (matched band, REPO passed in, fix
  standing swapped in). Corpus directory names distinct from the sibling
  arm's (sim-transplant6b3way-a works the same band in its own tree at the
  same time): e.g. `perseed-culpritbisect-a-t7brain-23245d5d6`, summary
  `culpritbisect-a-t7brain-23245d5d6-summary.json`.
  Gate (pre-registered): the carrier question is live on this substrate
  ONLY if the master-tip baseline reads ≤2/8 survived (the collapsed
  regime — the full merge read 1/8 vs the far end's 4/8). If the baseline
  reads ≥3/8, the collapse regime is gone on current master: STOP, report
  UNMEASURED-substrate (question moot here, do NOT re-judge family 7, do
  NOT cut a subject leg). Master tip is many merges past the merge, so
  the baseline could read anything — that is why the gate comes first.
- SUBJECT LEG: STEP id `t7brain-23245d5d6`, via the same step script.
  Seeds 190391–190398, 150d death-aware, competent verbatim own-policy,
  fix standing swapped in every step, native restored byte-identical
  afterwards, sha-verified.
- Primary metric: survived/8 on the subject leg MINUS the baseline leg.
  Subject − baseline ≥ +2 survivors = CARRIER (the brain side collapses
  survival); within ±1 = NOT-CARRIER; subject worse by ≥2 = INVERTED
  (report it, do not re-judge). Secondary (diagnostic only): wave-5
  unlocks, median days, death-cause shares, standing distribution. No
  cost guard — measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline. (Not reached: no
  corpus exists on the conflict-STOP path.)
- Sense-testing: read vetSays narration from both corpora and judge
  meaning/coherence — census the lines, quote what villagers actually
  do/say, flag anything robotic or repeated. (Not reached: no corpus
  exists on the conflict-STOP path.)

## Family-test leg (honesty test — pre-registered; DIAGNOSTIC ONLY on the STOP path)

The honesty test `scripts/test-dawn-materialize-honesty.js` on master-tip
substrate: its setup gate requires `Game.vbrainScorePick` /
`Game.vbrainAlignObjective` / `Game.vbrainOwnsDawn()` — all present at
master tip, so expect it to run whole (exit 0 or 1, NOT the exit-2 setup
skip the 7b arm recorded on far-end substrate). Run it against the
worktree (master tip) as a DIAGNOSTIC after the prereg commit — it proves
the test runs whole on the substrate a redefined ablation would use, and
records what actually happens; a skip here would be a finding, not a
shrug. It is NOT a judged leg (no subject exists to run it against), and
its result does not touch the UNMEASURED-conflict verdict. The
test-villager-brain-dawn.js file is NOT in the ablation set: on the STOP
path nothing is removed, so it stays as-is; had the ablation applied, its
single `vbrainAlignObjective` reference would have needed a skip-or-fail
record — note that for the coordinator, do not act on it here.

## Proof

`scripts/test-transplant7brain.js` (stage 1, before the subject):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master tip), ablation-set hunk inventory (the brain diff has
exactly 5 hunks with the exact headers and per-hunk +/− counts 1/0, 1/0,
2/0, 4/3, 48/0 = 56/3; the excluded objectives/ONTOLOGY/green-list/
test-dawn changes are named exactly), reverse-apply pre-check (whole-patch
`git apply --check -R` FAILS; per-hunk verdicts FAIL/FAIL/FAIL/CLEAN/FAIL
re-run live by the proof; the merge align text is NOT a verbatim substring
of the tip align text; the tip align function is 114 lines vs the merge's
44), conflict-STOP verdict mapping, baseline-gate verdict mapping,
subject-vs-baseline verdict mapping, base state (branch-identity legs
worktree-aware — they assert the arm branch in the worktree and the merged
tip on master, so the proof stays green on master), seed-band identity
(matched band 190391–190398, step ids t7brain-23245d5d6 /
ep-tip-7brain, subject branch transplant-7brain-subject, reuse-by-design
recorded). Sections for live subject state and step corpora take the
conflict-STOP branch (no subject branch exists; no corpus exists) instead
of the measured-legs branch, and on the GATE-STOP path the step-corpus
section takes the gate-stop branch.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check.
The honesty test is run as a diagnostic on the worktree after the prereg
commit (see §Family-test leg); its outcome is recorded in the evidence
file, not in the proof.

## Canon

docs/CANON.md read first, plus docs/VILLAGER-BRAIN.md §4/§5 (the family's
area). No canon doc covers survival-collapse attribution; nothing here
invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game, no before/after
pair to compare on one base. The before/after comparison IS the
boundary pair (master tip vs subject) on identical seeds, judged by the
analyzer's decision rule — not reached on the conflict-STOP path. Same
standing as masterregress §7, survivalcontrol-b §7, anchor-a §7, and the
r5–r10 cut arms §7.

## Guards (reported, never verdict-flipping post-hoc)

- If the conflict-STOP fires (it does — see §Reverse-apply pre-check),
  NO subject branch is cut, NO baseline leg runs, NO corpus is written.
  The verdict is UNMEASURED-conflict, not a carrier verdict, and family 7
  stays UNMEASURED. This arm does NOT re-judge any prior verdict (family
  7 UNMEASURED, 7b NOT-CARRIER, 8b NOT-CARRIER, 8c UNMEASURED-on-gate,
  masterregress CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and the rest
  of the bisect record) — it measures only the brain-side ablation
  defined above, and the ablation proved unbuildable by mechanical means.
- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only. (Not
  reached.)
- If instrument errors > 0 on any seed, record them; the verdict stands
  only if the errors cannot touch the survival read (the survival read
  comes from the harness end state, not the instrument). (Not reached.)
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  `standing.js` is restored byte-identical (sha-verified) before the next
  step or any evidence commit. If a restore fails, FAIL LOUDLY and do not
  commit evidence. After each leg, check the arm branch back out (the step
  script leaves HEAD detached at the step commit). (Not reached.)
- This arm does NOT re-judge any prior verdict (see above).
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test runs. (The honesty-test diagnostic
  runs in the worktree itself — no extract needed.)
- No game-code change is committed by this arm on the arm branch (no
  subject exists — it would live on its own branch
  `transplant-7brain-subject`, left in place, had the STOP not fired);
  no `[needs-eyes]` applies. The arm branch commits only: prereg, proof
  script, evidence file. No step corpora exist.
- Telemetry deviation check (Loop A body step 10): N/A on the STOP path
  — no corpus exists to check. Not attempted, not waived; there is
  nothing to refuse or roll.
- Flap note: a host write flap hit this run — flap-watch log ALL-OK at
  08:48–08:51Z, FLAP? entry 08:52:28Z, probe `git update-ref
  refs/heads/probe HEAD` failing EPERM from 08:52:39Z; the arm STOPPED
  writing and probed once a minute (rounds of 10/15/15/15/15 attempts);
  probe OK again 09:48:45Z (round 5, attempt 5) — window ~56 min. The
  heartbeat call made during the window failed the same way
  (PermissionError writing REGISTRY.json); heartbeat re-run after the
  clear landed. Prereg + proof are written and committed only after the
  probe succeeds. If the flap returns mid-run, wait for it to clear
  rather than bypassing safe-commit; never route around a denial.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the run: did the metric set hold, or does a metric
  need revision for the NEXT run?)
