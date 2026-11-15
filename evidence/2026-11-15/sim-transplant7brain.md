# H1 transplant — brain-side ablation of PR #30 on master-tip substrate (arm sim-transplant7brain-a)

Run: fleshout-20261115T0810Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-15/sim-transplant7brain-prereg.md (committed BEFORE
cutting the subject or running any judged sim; the reverse-apply pre-check
recorded in it is a READ-ONLY check run during prereg preparation, the same
pattern as 7b's merge-tree pre-check).
Arm branch: `sim-transplant7brain-a` (worktree `~/workspace/worktrees/sim-transplant7brain-a`),
base master tip 7251dcb4f. Prereg + proof commit 694a094ea7fc80011b7a3fe0f43f2f556c029b33.
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §4/§5 read (the
family's area). No canon invented or rewritten.

## Verdict: UNMEASURED-conflict — the ablation does not reverse-apply onto master tip

The brain-side ablation of PR #30 — the `villager-brain.js` hunks of merge
`23245d5d6` reversed onto master tip — is UNBUILDABLE by mechanical means:
4 of the 5 hunks fail `git apply --check -R`, INCLUDING the
`vbrainAlignObjective` function itself (hunk 5). Only the materialize
comment (hunk 4) reverses cleanly. Per the binding conflict-STOP rule, no
subject branch was cut, no baseline leg ran, and no corpus exists. No
survival number was measured on this arm, and none is claimed: family 7
stays UNMEASURED, and this arm does NOT re-judge family 7, 7b
(NOT-CARRIER), 8b (NOT-CARRIER), 8c (UNMEASURED-on-gate), masterregress, or
any prior verdict.

## The question

Does the brain-side half of PR #30 alone collapse survival? Full family 7
(merge `23245d5d6`, PR #30 dawn honesty, OVE-37 port, OVE-36 Candidate A)
is UNMEASURED: its cherry-pick onto the far end stopped on four unmerged
paths. The narrowed objectives-side half (7b) measured NOT-CARRIER —
subject identical to the far-end baseline 4/8 on every judged field,
because finishLottery calls vbrainAlignObjective only when loaded and the
align function does not exist on far-end substrate. The brain-side half
(the align function itself) is therefore the entire remaining carrier
question for family 7 — and it cannot be transplanted onto the far end by
any mechanical route (missing-substrate wall). So this arm was to measure
it the other way round: ABLATION on master-tip substrate, which HAS the
brain module. The ablation proved unbuildable instead — the question is
still open, and the reason is drift, not a verdict.

## The conflict list (exact — the whole finding)

`git diff 23245d5d6^1 23245d5d6 -- src/js/villager-brain.js` (98 lines, 5
hunks, numstat 56+/3−) reverse-applied against master tip `7251dcb4f`.
Whole-patch `git apply --check -R`: FAIL (`error: patch failed:
src/js/villager-brain.js:5`). Per-hunk verdicts (each hunk checked alone,
same command, re-run live by the proof):

- Hunk 1 `@@ -5,6 +5,7 @@` (+1/−0, `provides:` line): FAIL. The tip
  header carries 4 extra `provides:` entries after the align line
  (vbrainMarkPerception, vbrainShouldRefresh, dutyFeedCands,
  assignFeedCand — Phase 6) and extra rule lines; the added line's
  context no longer matches. (`patch`(1) with fuzz 2 finds it — fuzz is
  NOT the program's mechanical standard; under `git apply` it fails.)
- Hunk 2 `@@ -15,6 +16,7 @@` (+1/−0, `vbrain_materialize_matches_commit`
  rule comment): FAIL. The `vbrain_feeders_not_deciders` context line was
  rewritten (now mentions bond/link social ads and duty ads) and 5+ new
  rule lines sit between it and `vbrain_commitment`.
- Hunk 3 `@@ -281,6 +283,8 @@` (+2/−0, `vgoalLine`/`chore` commit-record
  fields): FAIL. The tip commit record carries 2 NEW fields (`dutyTask`,
  `assignTask` — Phase 6) inserted between `chore` and `vbrainSrc`.
- Hunk 4 `@@ -413,9 +417,10 @@` (+4/−3, materialize comment): CLEAN —
  the only clean hunk. Context lines verbatim at tip (line ~860).
- Hunk 5 `@@ -438,6 +443,54 @@` (+48/−0, the `vbrainAlignObjective`
  function itself): FAIL. The tip's align function is 114 lines, not the
  merge's 44: Phase 6 inserted a DUTY/ASSIGN branch (with `dawnHashRoll`
  facing) between the EXPEDITION branch and the any-other-override
  fallthrough, so the merge's contiguous 48-line block does not exist
  verbatim at tip (verified: merge align text is NOT a substring of the
  tip align text). The win-plan-hold and EXPEDITION branches are still
  verbatim, but the function's tail is not.

The drift is 12 commits touching villager-brain.js between the merge and
master tip (OVE-51/54/60/74/76/78/81, Phase 6 duty/assign, garden keeper,
companionScore unification, mid-day idle demotion). No hand-editing was
attempted: dropping the 4 failing hunks would redefine the family
mid-run (the align function itself would be gone from the ablation), and
hand-shaping the reverse would measure a different change than the merge's.
The STOP fired before any subject branch existed — there is no
`transplant-7brain-subject` branch and no subject commit to leave behind.

## What it means

The transplant program's mechanical route to family 7 is now closed on
BOTH sides: the far end cannot receive the family (missing-substrate wall
— the brain module never existed there), and master tip cannot give it up
(the align function has grown past its merge shape — the reverse no longer
applies). The brain-side carrier question for family 7 can only be answered
by a REDEFINED ablation — e.g. removing the align step from the CURRENT
align function (114 lines, DUTY/ASSIGN branches included) rather than
reversing the merge's 48-line version — and that redefinition is a
coordinator call, not this arm's: it would measure a different change than
the merge's hunks, and its prereg would have to define the new ablation
set from the current code, not from the merge diff. Two facts for that
call, both measured here:

- The objectives-side wiring is intact at master tip (finishLottery still
  calls `vbrainAlignObjective` behind its typeof guard), so a redefined
  ablation that removes the function would still exercise the same guard
  path 7b proved inert on the far end.
- The merge's own honesty test RUNS WHOLE on master-tip substrate (see
  §The family's own test), so a redefined ablation has a working
  instrument waiting — unlike on the far end, where the test skips.

## The family's own test on master-tip substrate (diagnostic, not a judged leg)

`scripts/test-dawn-materialize-honesty.js` run against the worktree
(master tip 7251dcb4f), after the prereg commit:

- Exit 0, `{"pass":true,"seed":20261108,"materializeNeqCommit":0,
  "honest":{"materialize":"HAVEN_CHORE","commit":"HAVEN_CHORE",
  "override":"win_plan:gear_hold","corePick":"HAVEN_CHORE",
  "purpose":"chore","chore":"repair","indoor":true},
  "controlMismatch":true,"depart":"hold"}`.
- The test runs whole on master-tip substrate — the setup gate's brain API
  (`vbrainScorePick` / `vbrainAlignObjective` / `vbrainOwnsDawn()`) is
  present, the aimed override (win-plan gear_hold) materializes honestly
  (materialize == commit), and the failing control (align stripped)
  restores materialize≠commit. This is the opposite polarity from 7b,
  where the same test skipped (exit 2, `villager-brain align API missing`)
  on both the far end and the 7b subject. A skip here would have been a
  finding; the pass is the pre-registered expectation, recorded as a
  diagnostic — it proves the instrument works on the substrate a redefined
  ablation would use, and it does NOT touch the UNMEASURED-conflict
  verdict (no subject exists to run it against).
- The `test-villager-brain-dawn.js` file was NOT in the ablation set: on
  the STOP path nothing was removed, so it stays as-is. Had the ablation
  applied, its single `vbrainAlignObjective` reference would have needed
  a skip-or-fail record — noted for the coordinator, not acted on here.

## Sense-testing (SENSE-TESTING LAW)

No corpus exists on this run — no baseline leg and no subject leg ran, so
there is no vetSays narration to census and no villager behavior to judge.
Nothing is quoted, because nothing was simulated. That is the honest
sense-testing record for a conflict-STOP arm: the narration instrument
(the honesty test) runs whole on this substrate, but no village was ever
played, so no claim about villagers acting like people is made here.

## Village assessment (plain words)

No village was assessed: no sims ran. The far end's settled read (4/8 on
the matched band, regional 7/8, national 0, table 0, wins 0) and the
merge's 1/8 both still stand exactly as the prior arms left them, and this
arm adds no survival number to either. What this arm establishes is a
tooling fact, not a village fact: the brain-side half of PR #30 cannot be
isolated by mechanical transplant or ablation anymore, on either
substrate. The scale wall stands where the program left it; the next move
on family 7 belongs to the coordinator (redefined ablation, or the family
stays UNMEASURED).

## Reachability

Unmeasured on this arm: no legs ran, so waves 1–5, regional→national,
the table, and the win flag have no new read. The last measured reads
stand: far end 4/8 (wave 4 8/8, wave 5 2/8, regional 7/8, national 0,
table 0, wins 0) and merge 1/8.

## Blanks filled / documented

- FILLED (measured): the brain-side ablation of PR #30 is UNBUILDABLE by
  mechanical reverse onto master tip — 4 of 5 hunks fail, including the
  align function itself. Verdict UNMEASURED-conflict.
- FILLED (measured): the exact conflict list per hunk, with the drift
  cause per hunk (Phase 6 provides/rules/commit-record growth; the
  DUTY/ASSIGN branch inside the align function) and the 12-commit drift
  count.
- FILLED (measured): the merge's align text is NOT a verbatim substring
  of the tip align text; tip align is 114 lines vs the merge's 44.
- FILLED (measured): the honesty test RUNS WHOLE on master-tip substrate
  (exit 0, pass:true, materialize==commit, controlMismatch true) — the
  instrument a redefined ablation would use is working.
- FILLED (measured): the test file is NOT in the ablation set and stays
  as-is; it references `vbrainAlignObjective` exactly once at the tip.
- DOCUMENTED: the transplant program's mechanical route to family 7 is
  closed on BOTH sides now (far-end missing-substrate wall + master-tip
  reverse conflict). A redefined ablation against the CURRENT align
  function is the only remaining measurement route, and it needs a
  coordinator call + a fresh prereg defining the new ablation set.
- DOCUMENTED: the proof's first run was 55/56 — the per-hunk leg failed
  because the proof's reconstructed single-hunk patches lacked a trailing
  newline (`corrupt patch at line 18`); the manual patches (which carried
  the newline) had read hunk 4 CLEAN. Fixed by terminating the patch
  (append '\n'); re-run 56/56. The failure was in the proof's patch
  construction, not in the verdicts.
- DOCUMENTED: safe-commit.sh index clobber struck 1× this run (prereg +
  proof commit 694a094ea) — both files showed staged-as-deleted after a
  correct commit; repaired with the documented `ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe; both worktree
  hashes verified == HEAD blobs before continuing.
- DOCUMENTED: a host write flap blocked all writes for ~56 min mid-run
  (see §Infrastructure).

## Telemetry deviation check

N/A on the STOP path — no corpus exists to check. Not attempted, not
waived; there is nothing to refuse or roll. (The recorder-corpus refusal
the prior arms recorded would apply to any future t7brain corpus.)

## Proof

- `scripts/test-transplant7brain.js` — stage 1 green at prereg (56/56
  after the trailing-newline fix; first run 55/56, per-hunk leg only —
  see §Blanks). §§7–8 take the conflict-STOP branch (no subject branch,
  no corpus). Final re-run after the evidence file was written: **57
  passed, 0 failed** (the +1 is the split §5 base-state leg: the
  "HEAD is master tip" leg was replaced by worktree-aware legs — tip is
  an ancestor of HEAD + every commit above the tip is this arm's own
  work — because HEAD necessarily moves past the tip once the prereg is
  committed; and the porcelain-parsing leg was fixed to read raw status
  output after `git()`'s trim shifted the first line's columns).
- `scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
  as the reused-tooling check: 116 passed, 0 failed.
- `scripts/test-dawn-materialize-honesty.js` — diagnostic on the worktree
  (master tip): exit 0, pass:true (see §The family's own test).
- No game-code change is committed by this arm on the arm branch (no
  subject exists); no `[needs-eyes]` applies. Committed on the arm
  branch: prereg + proof (694a094ea), this evidence file. No step
  corpora exist. The /tmp per-hunk patches (t7brain-check) were scratch
  only, never committed.

## Metric review (§14 — filled after the run, never re-scored)

- The conflict-STOP rule held cleanly: the pre-registered mechanical
  standard (`git apply --check -R`, no fuzz, no hand-editing) judged the
  ablation unbuildable, and the verdict is UNMEASURED-conflict — not a
  carrier verdict, not a re-score. No survival metric was judged, because
  no leg ran; the baseline gate and the subject-delta mapping were never
  reached, and their pre-registered definitions stand untested for a
  future redefined ablation. No re-scoring happened anywhere on this arm.
- One metric note for the NEXT run (not a revision of this run's
  verdict): the baseline gate as pre-registered here has the OPPOSITE
  polarity from 7b's (here ≤2/8 PROCEED / ≥3/8 STOP-UNMEASURED, because
  the question is live only in the collapsed regime; there ≥3/8 PROCEED,
  because the far end was the healthy baseline). A future arm reusing
  either gate must state its polarity up front — the two gates look alike
  and judge oppositely. The proof's gateStopVerdict legs pin this arm's
  polarity in code.
- The family-test metric (honesty test runs whole on master-tip substrate)
  held as the pre-registered diagnostic expectation (exit 0, pass:true).
  No metric revision proposed for the next run beyond the polarity note
  above.

## Infrastructure

- WRITE FLAP: a host write flap hit this run — flap-watch log ALL-OK at
  08:48–08:51Z, FLAP? entry 08:52:28Z (A/E/G/H/I failing, EPERM on
  fresh-file writes and git ref writes); probe `git update-ref
  refs/heads/probe HEAD` failing EPERM from 08:52:39Z. The arm STOPPED
  writing and probed once a minute in rounds of 10/15/15/15/15 attempts
  (all EPERM); probe OK again 09:48:45Z (round 5, attempt 5) — window
  ~56 min, the longest this arm has waited. The heartbeat call made
  during the window failed the same way (PermissionError writing
  REGISTRY.json); heartbeat re-run after the clear landed. Prereg +
  proof were written and committed only after the probe succeeded. No
  denial was routed around; no copied binaries, no manual ref edits.
  Note the earlier flap the task brief mentioned (~08:18–08:21Z, ~3 min)
  is a SEPARATE, earlier window from this one — two flap windows hit
  this run's morning.
- SAFE-COMMIT CLOBBER: struck 1× (prereg + proof commit) — repaired with
  the documented pipe, hashes verified (see §Blanks).
- No other infrastructure issues. Worktree clean at end of run except
  this evidence file pre-commit (verified by the proof's §5 legs).
