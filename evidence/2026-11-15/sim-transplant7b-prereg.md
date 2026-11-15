# H1 transplant — narrowed family 7b prereg: the objectives-side half of PR #30 alone (arm sim-transplant7b-a)

Run: fleshout-20261115T0115Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant7b-a` (worktree `~/workspace/worktrees/sim-transplant7b-a`,
base master at run start — HEAD 96c139d75).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap, step mechanics, far-end
baseline 4/8 on the matched band) + evidence/2026-11-13/sim-transplant7.md
(full family 7: UNMEASURED on cherry-pick conflict — the narrowed 7b
definition below is the coordinator's follow-up) + evidence/2026-11-14/sim-transplant8c.md
(narrowed-family + baseline-gate-STOP pattern) + evidence/2026-11-13/sim-scale-onramp-round-2115.md §3.
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
(proof scripts/test-transplant7b.js, stage 1, green at prereg stage;
targeted finishLottery-inertness script scripts/test-transplant7b-finishlottery.js).

## The question

Does the objectives-side half of PR #30 alone collapse the far end toward
the merge's 1/8? Full family 7 (merge `23245d5d6`, PR #30 dawn honesty,
OVE-37 port, OVE-36 Candidate A) is UNMEASURED: its cherry-pick stopped on
four unmerged paths (ONTOLOGY.md UU, green-list.txt UU, villager-brain.js DU,
test-villager-brain-dawn.js DU — the family-6 missing-substrate wall, twice
over). This arm measures ONLY the narrowed family 7b defined below. Nothing
the full-family arm already measured (nothing — it measured no survival
number), nothing else from the merge.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `23245d5d6` (full `23245d5d6...` — see proof for the full sha).
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
- `standing.js` NOT in the family diff; the subject's native standing.js is
  the far-end one (sha256 `75762cb2…`), so the standing-fix swap mechanics
  are exactly as in the bisect prereg. Merge policy sha == far-end policy
  sha `a7ff5c51…` (no policy drift — the family touches no policy).
- `23245d5d6` is NOT an ancestor of the far end `203a32775` (verified by
  this arm — the family is origin-side, absent from the far end), and IS an
  ancestor of master HEAD (the origin line was merged to master after the
  far end; the family lives on master today).

## Narrowed 7b definition (COORDINATOR-DEFINED via the task brief — do not redefine)

Include ONLY:

1. The `src/js/villager-objectives.js` hunks from the merge diff — all 5,
   numstat 19+/7−:
   - `@@ -543,6 +543,16 @@` (+10/−0): the `finishLottery(o)` definition —
     calls `this.vbrainAlignObjective(vid, obj, hx, hy)` ONLY when loaded
     (`typeof ... === 'function'`), guarded by try/catch, returns `obj`
     unchanged otherwise.
   - `@@ -569,17 +579,17 @@` (+3/−3): VISIT, HUNT, HAUL early returns wrapped
     in `finishLottery(o)`.
   - `@@ -590,7 +600,7 @@` (+1/−1): SEEK early return wrapped in
     `finishLottery(o)`.
   - `@@ -611,14 +621,14 @@` (+2/−2): HAVEN_CHORE early return wrapped in
     `finishLottery(o)` (2/2 — the hunk also carries a second return line
     in range; counted live by the proof, not by hand).
   - `@@ -1466,7 +1476,9 @@` (+3/−1): the EXPEDITION-with-purpose-chore dawn
     hold is narrated as its hold chore instead of falling through to the
     chore branch (`o.kind === 'HAVEN_CHORE' || (o.kind === 'EXPEDITION' &&
     o.purpose === 'chore')` + 2 comment lines).
2. The new test file `scripts/test-dawn-materialize-honesty.js` (+214 lines,
   blob `77f50489…` at the merge) — staged cleanly in the full-family
   attempt; absent at the far end AND at the first parent, present at the
   merge: a clean addition, not missing substrate.
3. The green-list union line for that test ONLY:
   `scripts/test-dawn-materialize-honesty.js quick` — the merge diff's
   green-list change adds exactly this one line (after the
   `test-villager-brain-dawn.js quick` line, which already exists at the
   first parent and at the far end). Resolved by UNION only, and only
   after verifying that only scripts/check.js reads green-list.txt and
   zero src/js files do (verified by this arm — see §Green-list readers).

EXCLUDED: villager-brain.js (56+/3− — the align function itself),
docs/ONTOLOGY.md (the brain section + rule), the
test-villager-brain-dawn.js changes (8+/2−), everything else. The subject
diff must be exactly: one src/js file (+19/−7, 5 hunks), one new test file
(+214), one green-list line (+1). No other file touched.

## Mechanism analysis (pre-registered, from source reads at the far end — not a verdict)

What the 7b hunks CAN do alone on far-end substrate:

- (a) `finishLottery` — INERT BY DESIGN on far-end substrate:
  `villager-brain.js` does not exist at the far end (`git ls-tree
  203a32775 -- src/js/villager-brain.js` = empty), so
  `this.vbrainAlignObjective` is not a function and the try/catch guard
  returns `obj` unchanged on every early return. The objectives-side
  change is the survival-relevant half (it is the code that rewrites live
  objectives to the dawn commitment); the brain-side change is the align
  function itself. With the align function absent, the wiring carries no
  rewrite. The narrowed family therefore measures the objectives-side
  wiring alone, exactly as defined.
- (b) EXPEDITION-hold narration — fires ONLY if an EXPEDITION objective
  already carries `purpose === 'chore'` at the far end. At the far end no
  code sets purpose=chore on an EXPEDITION objective (that assignment is
  the missing align function's work), so the branch is expected inert too
  — the proof checks whether far-end objPick can ever produce
  kind=EXPEDITION with purpose=chore, and records the answer either way.
- Consequence, stated up front: the 7b subject is EXPECTED to be
  behaviorally identical to the far end (subject == baseline, count AND
  per-seed days identical) — the expected NOT-CARRIER form is identity,
  not merely ≥3/8. A subject that differs from baseline on any seed is
  still judged by the count thresholds below, with the divergence reported,
  never re-scored. If the subject reads identical to the baseline, that is
  the mechanism prediction confirmed, not a null result to be explained
  away.

## Green-list readers (verified by this arm at run start)

- `scripts/check.js` reads `scripts/green-list.txt` via `readList` — the
  only code reader. It is the check runner, not game code.
- ZERO readers in `src/` — no `src/js` file references green-list.txt at
  all. (Same verification the full-family arm recorded; re-run live by
  this arm.) The green-list union carve-out (family-2b precedent) therefore
  applies: the single added line is tooling-only.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 7041e1bfb 203a32775 23245d5d6` (base = first parent, per the
2215Z method correction). The full-family arm already recorded the live
prediction and the live pick reproduced it; this arm re-runs it live in
the proof and records the 7b-relevant slice:

- `src/js/villager-objectives.js` — changed in both, ZERO markers across
  its 5 hunks (auto-merges). The 7b hunks are the merge-tree-clean part.
- `scripts/test-dawn-materialize-honesty.js` — added in remote, clean add.
- `docs/ONTOLOGY.md` — 1 marker block (excluded from 7b).
- `scripts/green-list.txt` — 1 marker block (excluded except the union
  line, resolved by union per the carve-out above, not by merge).
- `src/js/villager-brain.js` + `scripts/test-villager-brain-dawn.js` —
  `removed in local` / DU (excluded from 7b — the missing-substrate wall
  the full family stopped on).

PREDICTED OUTCOME — MEASURABLE: the mechanically extracted objectives
patch (5 hunks) applies cleanly to the far end with ZERO conflicts,
because the hunk context lines are byte-identical between the first
parent and the far end at the hunk sites (that is what "marker-free in
the merge-tree output" means for these hunks). The live `git apply` is
the authority — if it conflicts, the conflict-STOP rule below fires.

## Conflict-STOP rule (binding on this arm)

Build the subject by MECHANICAL extraction only:
`git diff 23245d5d6^1 23245d5d6 -- src/js/villager-objectives.js`, `git apply`
onto the far end on scratch branch `transplant-7b-subject`; add the test file
via `git show 23245d5d6:scripts/test-dawn-materialize-honesty.js`; add the
green-list union line. On ANY apply conflict: STOP, report the exact
conflict list (which paths, which hunks), do NOT hand-resolve game code,
do NOT silently drop a conflicting hunk and proceed (dropping would
redefine the family mid-run), report UNMEASURED with the exact conflict
list. Verify the resulting hunks are byte-identical to the merge's hunks
(added/removed lines equal, modulo hunk-header line numbers, which shift
with the far end).

## Seed band + freshness (verified by THIS arm at run start)

- Band: **190391–190398** (8 seeds), the matched band.
- BAND NOTE (coordinator decision, recorded here): the matched band
  190391–190398 is REUSED BY DESIGN — it is the program's defining
  baseline band where the far end reads 4/8 (reproduced twice:
  masterregress, then 8b with identical per-seed days 86/144/150/43/
  150/87/150/150), NOT claimed fresh.
- Freshness search (per local_seed_band_freshness skill), scope: word
  grep for `190391` across the whole `evidence/` tree (every dated prereg
  + evidence file + per-seed corpora). Result: the band appears in DOZENS
  of dated preregs and evidence files (bisect arms, transplant arms 2b/4b/
  5b/8b/8c-rerun, masterregress, collapseband3, stallcut rounds) — it is
  the program's shared baseline band, heavily reused, NOT fresh. No
  forbidden/contaminated band list exists carrying a 190391–190398
  reservation. Reuse rationale: the transplant question is defined
  AGAINST the far end's settled 4/8 on exactly this band; a fresh band
  would break comparability with every prior transplant verdict (and the
  8c precedent shows a fresh band can fail the baseline gate for
  band-health reasons unrelated to the family). The reuse is explicit,
  recorded, and coordinator-directed — not silent.

## Measurement plan

- Subject branch `transplant-7b-subject` left in place; subject commit hash
  recorded in evidence. Measured diff verified byte-identical to the
  family's 7b hunks: the subject diff's added/removed lines (modulo
  hunk-header line numbers) must equal the family diff's 7b-hunk
  added/removed lines exactly (+19/−7 one file; +214 test file; +1
  green-list line); no brain-module strings (`vbrainAlignObjective`
  DEFINITION — the objectives hunks reference the name behind a typeof
  guard, so the bare NAME is present in the subject; only the definition
  is excluded); subject policy == far-end policy `a7ff5c51…`; subject
  native standing == far-end standing `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-7b` on the far end `203a32775`, via
  `scripts/culpritbisect-step.sh` (matched band, REPO passed in, fix
  standing swapped in). Expect the far end to read 4/8 with per-seed
  days 86/144/150/43/150/87/150/150 (the settled matched-band read,
  reproduced twice).
  Gate: the baseline leg reads ≥3/8 — if it reads <3/8, STOP per this
  prereg (the 8c precedent) — no subject leg, verdict UNMEASURED, no
  re-judgment of the 1/8 as a carrier signal. The baseline already sitting
  at the merge's 1/8 would make a subject 1/8 uninterpretable.
- SUBJECT LEG: STEP id `t7b-23245d5d6`, via the same step script. Seeds
  190391–190398, 150d death-aware, competent verbatim own-policy (family
  touches no policy — subject policy IS the far-end policy `a7ff5c51…`),
  fix standing swapped in every step, native restored byte-identical
  afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER (with baseline ≥3/8);
  2/8 AMBIGUOUS → re-run once with a fresh STEP id (2/8 again →
  recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept on
  the suspect list; a 2/8 re-run on a deterministic driver is a stability
  check, not fresh evidence — say so explicitly if it happens);
  ≥3/8 NOT-CARRIER. The task's expected NOT-CARRIER form is subject
  identical to the baseline leg (count AND per-seed days identical); a
  ≥3/8 subject that differs from baseline is still NOT-CARRIER, with the
  divergence reported, never re-scored.
- Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution. No cost guard — measurement arm; nothing
  lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts. Precedent warning:
  the 15E p3conv arm found its dialogue paths unexercised on the
  survival band, arm 9 found its family's new lines never fire under the
  competent policy, and 8b/8c found 0 of their dialogue lines across both
  corpora. Census the 7b-relevant lines in the corpus (dawn-hold
  narration, finishLottery paths). A survival verdict proves
  survival-inertness, not objectives behavior.

## Family-test leg (objectives instrument — pre-registered)

The honesty test `scripts/test-dawn-materialize-honesty.js` cannot run
whole on the 7b subject: its setup gate requires
`Game.vbrainScorePick` / `Game.vbrainAlignObjective` functions and
`Game.vbrainOwnsDawn()` true — all of them live in the EXCLUDED brain
module. Attempt the test against the subject tree (pathspec extract to
/tmp — never a full-tree extract, /tmp tmpfs is 512M) and record the
outcome: the expected result is a SETUP SKIP (exit 2,
`villager-brain align API missing`) — a pre-existing far-end substrate
gap for the 7b-only subject, NOT a regression and NOT a pass, same class
as 8c's #4 finding (that proof's Dale setup fails on the missing 8b
method). Run the same test against the far end as the control: expected
exit 2 as well. Both runs are recorded in the evidence file.

The 7b wiring is proven instead by the dedicated script
`scripts/test-transplant7b-finishlottery.js`, run BEFORE/AFTER (far end
vs subject, same staging, same seed):

- Stage a living villager at the haven with a forced dawn state, call
  `Game.objPick(vid, hx, hy)`, and assert: (a) `typeof
  Game.vbrainAlignObjective === 'undefined'` on BOTH trees (the align
  function is absent — the wiring's guarded call is inert); (b) objPick
  returns an objective without throwing (the try/catch guard holds);
  (c) the objective kind/purpose are identical between the two trees on
  the same seed (the wiring changes nothing observable without the brain
  module).
- The script exits 0 iff all three hold on a tree. It is EXPECTED to
  exit 0 on BOTH the far end and the subject (identity, not a
  before/after flip) — the opposite polarity from 8c's dlgmore script,
  because the 7b mechanism predicts inertness. Green/not-green is
  reported SEPARATELY from the survival verdict, per the task brief.

## Proof

`scripts/test-transplant7b.js` (stage 1, before the subject):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master), narrowed-definition hunk inventory (the objectives
diff has exactly 5 hunks with the exact headers and per-hunk +/− counts
10/0, 3/3, 1/1, 2/2, 3/1; the honesty test is +214 lines, blob
77f50489…; the green-list diff adds exactly the one honesty line;
the excluded brain/ONTOLOGY/test-dawn changes are named exactly),
merge-tree prediction (objectives 0 markers, honesty test clean add,
ONTOLOGY + green-list marker blocks confined to excluded files, brain +
test-dawn DU sections), mechanism analysis (finishLottery guard strings
present in the merge diff; `vbrainAlignObjective` DEFINITION absent at
the far end; far-end objPick EXPEDITION+chore reachability recorded),
green-list readers (only scripts/check.js; zero src/js readers),
verdict mapping, base state (branch-identity legs worktree-aware —
they assert the arm branch in the worktree and the merged tip on
master, so the proof stays green on master), seed-band identity
(matched band 190391–190398, step ids t7b-23245d5d6 / ep-far-7b,
subject branch transplant-7b-subject, reuse-by-design recorded).
Sections for live subject state and step corpora are added after the
subject is cut and the steps run; on the conflict-STOP path they
become the live conflict record / no-corpus sections instead, and on
the GATE-STOP path the step-corpus section takes the gate-stop branch.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check.
`scripts/test-transplant7b-finishlottery.js` — the targeted before/after
script for the family-test leg (see above); stage 1 control run on the
far end must show the inert behavior (exit 0), stage 2 run on the subject
must show the same (exit 0).

## Canon

docs/CANON.md read first, plus docs/VILLAGER-BRAIN.md §4/§5 (the family's
area). No canon doc covers survival-collapse attribution; nothing here
invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game, no before/after
pair to compare on one base. The before/after comparison IS the
boundary pair (far end vs subject) on identical seeds, judged by the
analyzer's decision rule. Same standing as masterregress §7,
survivalcontrol-b §7, anchor-a §7, and the r5–r10 cut arms §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict stands
  only if the errors cannot touch the survival read (the survival read
  comes from the harness end state, not the instrument).
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  `standing.js` is restored byte-identical (sha-verified:
  `75762cb2…` on the far end / subject) before the next step or any
  evidence commit. If a restore fails, FAIL LOUDLY and do not commit
  evidence. After each leg, check the arm branch back out (the step
  script leaves HEAD detached at the step commit).
- This arm does NOT re-judge any prior verdict (family 7 UNMEASURED,
  8b NOT-CARRIER, 8c UNMEASURED-on-gate, masterregress
  CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and the rest of the
  bisect record) — it measures only the narrowed 7b objectives-side
  hunks.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test and finishlottery runs.
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `transplant-7b-subject`, left in
  place); no `[needs-eyes]` applies. The arm branch commits only:
  prereg, proof scripts, evidence file, step corpora + summaries +
  driver logs.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect / transplant arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT rolled.
- Flap note: the flap-watch log was read at run start (ALL-OK at
  07:23–07:27Z); prereg + tooling are written and committed only after
  a probe succeeds. If the flap returns mid-run, wait for it to clear
  rather than bypassing safe-commit; never route around a denial.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
