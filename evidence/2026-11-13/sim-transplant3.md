# H1 transplant — family 3: PR #28 dialog-recap-teach-35a9 (arm sim-transplant3-a)

Run: fleshout-20261113T2215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 3 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant3-a` (worktree `~/workspace/worktrees/sim-transplant3-a`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 3: merge `c32ff6fa8` "Merge pull request #28 from
steve-vitale/cursor/dialog-recap-teach-35a9" — dialog recap hammer +
Teach suppression on resume ownership (js=3, pol=0 per the round-2115
table).

## Family identity (verified at run start, before any sim)

- First parent `b41bd6300` (PR #27 merge, dawn-scoring-entry-7449);
  second parent `2c01bb277` (OVE tip: "Tighten recap hammer and
  suppress Teach on resume ownership"). Merge-base of the parents is
  `0f55a928c` (PR #26 merge — family 11), NOT the first parent, so
  unlike family 1 the second-parent side is a single commit on top of
  an older base: `0f55a928c..2c01bb277` = 1 commit. The operative
  family diff is still `c32ff6fa8^1..c32ff6fa8` (what `cherry-pick -m 1`
  applies).
- `git diff --stat c32ff6fa8^1 c32ff6fa8 -- src/js`: 3 files, +66/−24:
  conversation.js +54/−21, convo-beats.js +5/−2, villager-agency.js
  +7/−1. No scripts/policies file (pol=0). Full merge diff: 9 files,
  +407/−85 — the other 6 are scripts/test-*.js only (4 edited recap
  tests + 2 NEW test files: test-recap-hammer-20261108.js,
  test-resume-teach-ownership-20261108.js). No data, no docs, no
  evidence in the family diff.
- `standing.js` NOT in the family diff: the subject's native standing.js
  is the far-end one (sha256 `75762cb2…`, per the bisect prereg), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Subject's policy is the far-end competent.js (sha256 `a7ff5c51…`;
  family touches no policy file); own-policy per step, same as the
  bisect.
- What the family does (from its diff, not invented): conversation.js
  tightens the recap hammer (cap at 3 presses with an honest exit,
  dialog audit #6) and adds RESUME OWNERSHIP (dialog audit #7): a new
  `convoResumeOwnsSitting` method plus `_resumeOwnsTid` tracking, and
  Teach / skill-lesson / agency pivots stripped from the reply menus
  while an unfinished resume/debt/confide owns the sitting;
  villager-agency.js suppresses agency pivots under the same
  ownership. convo-beats.js carries a small related hunk. The
  `convoHasLiveUnfinished` method and the lessonOutcome/plantTeachOutcome
  split are NOT in the family diff — both already exist at the first
  parent `b41bd6300` (the split at lines 7132–7139 there); the family
  only ADDS the resume-ownership wiring around them. Dialogue/
  coherence work only — no survival, food, combat, or wave mechanics
  in the diff.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t3-c32ff6fa8`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-3-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 c32ff6fa8`. On ANY conflict: STOP, report the
  conflict, do not hand-resolve game code.
- Primary metric: survived/8 on the band. Verdict thresholds (fresh —
  the bisect's metric does not transfer):
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list.
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is 4/8,
    so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution. No cost guard — measurement arm;
  nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant3.js` (family diff applied completely,
  subject commit recorded, base restored) + the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Substrate pre-check (transplant118 lesson, run before cutting a step)

Per sim-transplant118.md's metric-review note, the arm pre-checked
substrate with a read-only `git merge-tree` before cutting the subject
branch:

- All 3 game-code files exist at the far end (conversation.js,
  convo-beats.js, villager-agency.js). The 2 files absent at the far
  end (test-recap-hammer-20261108.js,
  test-resume-teach-ownership-20261108.js) are ADDITIONS in the family
  diff (`--diff-filter=A`), so their absence is clean, not a DU
  conflict — the reverse of family 1's missing-substrate wall.
- `git merge-tree 0f55a928c 203a32775 c32ff6fa8` (parents' merge-base
  as base, as transplant118 did) predicts exactly ONE content conflict:
  src/js/conversation.js, 1 hunk (the teach-as-diegetic-act lines).
  villager-agency.js shows as changed-in-both with ZERO markers
  (merges cleanly); convo-beats.js does not appear (far end == base
  there). The balance-proof/green-list "conflicts" that a
  full-tree merge-tree shows are NOT in the family diff and cannot
  conflict under `cherry-pick -m 1`. A second dry run with base
  `d229b58f5` (merge-base of far end and merge) predicts the same
  single conversation.js conflict FILE, plus full-tree artifacts in
  files the family diff never touches — but, as the cherry-pick
  showed, NEITHER dry run used the cherry-pick's actual base (the
  first parent `b41bd6300`), and the d229b58f5 run named the WRONG
  HUNK. See the correction in §Cherry-pick conflict.
- The predicted conflict is semantic, not incidental: both lines
  refactored the same teach-outcome lines in conversation.js — the far
  end folds `choiceId === 'teach'` into `lessonOutcome`; the family
  splits it out as `plantTeachOutcome` (dialog audit #4). The
  cherry-pick below is the live confirmation, not the prediction.
  **CORRECTION (verified after the cherry-pick; see §Cherry-pick
  conflict): this prediction was WRONG about the hunk. The split is
  in the first parent, not the family diff, and the live conflict is
  the convoResumeOwnsSitting insertion whose anchor methods the far
  end never had. The pre-check used the wrong merge-tree base
  (d229b58f5 instead of the first parent b41bd6300). Left here as
  written so the miss stays visible; the corrected account is in the
  conflict section.**

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-3-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §Cherry-pick conflict (STOP) below.

## Cherry-pick conflict — STOP (no judged sim run)

`git checkout transplant-3-subject` (from `203a32775`) +
`git cherry-pick -m 1 c32ff6fa8` CONFLICTED. Per the transplant prereg
("On ANY conflict: STOP, report the conflict, do not hand-resolve game
code") the run STOPPED here. No subject commit was created, no step
was run, no survival number exists for this family. The cherry-pick
was aborted (`git cherry-pick --abort`), the arm branch checked back
out, the tree verified clean. The conflict is reproducible from the
recorded SHAs alone.

1 unmerged file (live `git status` at the conflict, verbatim):

- UU (both modified, content conflict) — 1 file:
  - `src/js/conversation.js` — exactly ONE hunk (1 `<<<<<<<`, 1
    `=======`, 1 `>>>>>>>` in the live conflicted file, lines
    1166–1231).

The other 8 family files applied cleanly and were staged at the
conflict (M: test-journey-crisis-r155-recap-prefix.js,
test-journey-social-r154-recap.js, test-social-r27-recap-repeat-20261019.js,
test-social-r31-recap-wrap-20261020.js, src/js/convo-beats.js,
src/js/villager-agency.js; A: test-recap-hammer-20261108.js,
test-resume-teach-ownership-20261108.js). Only conversation.js
blocked the pick.

What the hunk is (live file + correct-base merge-tree, agreeing):
the family's insertion of `convoResumeOwnsSitting` (dialog audit
#7) between two methods the origin line has and the far end does
NOT have — `convoHasLiveUnfinished` (#4) and
`convoUnfinishedEngageLine`. Verified by grep: at the first parent
`b41bd6300` the three methods sit at lines 1191/1217/1228 (merge
`c32ff6fa8`); at the far end `203a32775` NONE of the three exists —
the file goes straight from the `return false; },` that ends the
run-ledger method to the `// convoDryLine:` comment (line 1166).
The family's hunk expects the anchor context
`return false; },` + blank + `// convoUnfinishedEngageLine:`; the
far end has `// convoDryLine:` there instead, so the insertion
cannot be placed. The three-way merge shows the whole region as one
conflict: our side EMPTY, their side the three unfinished-work
methods (~63 lines, live file lines 1166–1231). This is family 1's
missing-substrate wall in miniature — methods, not a whole file:
the far end never had the dialog-audit #4 unfinished-work methods,
so the family's #7 insertion has no anchor there.
The lessonOutcome/plantTeachOutcome split the prereg's pre-check
predicted as the conflict is NOT in the family diff at all — it
rode in on the FIRST PARENT `b41bd6300` (lines 7132–7139 there),
while the far end independently folded `teach` into its own
`lessonOutcome` (line 7161). The d229b58f5-based dry run's
"conflict" there was a full-tree artifact (first-parent content vs
far-end content), never a family-vs-far-end conflict.

CORRECTION to the pre-check above (recorded, not silently fixed):
the pre-check predicted the right FILE but the WRONG HUNK. It ran
`git merge-tree` with base `d229b58f5` (merge-base of the far end and
the merge). But `git cherry-pick -m 1` uses the merge's FIRST PARENT
(`b41bd6300`) as its three-way base, not the merge-base of the two
trees — the same base transplant118 used, and the reason its dry run
matched live. Re-running merge-tree with the correct base
(`git merge-tree b41bd6300 203a32775 c32ff6fa8`) reproduces the live
conflict EXACTLY: conversation.js, one hunk, 3 marker lines, the
convoHasLiveUnfinished insertion; villager-agency.js changed-in-both
with 0 markers; the remaining hunks merge cleanly. Lesson for the
next transplant arm (extends transplant118's pre-check note): run
the merge-tree dry run with base = the merge's FIRST PARENT, never
with the tree merge-base — the d229b58f5 run is a different merge
that predicts a different hunk.

Independent confirmation (no worktree touch): the correct-base
merge-tree above, plus the live cherry-pick status quoted verbatim.

## What this means for the H1 transplant program

The transplant premise — "apply the family diff onto the far end" —
fails for family 3 at the mechanical step, the same way it failed
for family 1, but one rung narrower: family 1 hit 14 files (missing
substrate + overlapping edits); family 3 hits exactly ONE hunk — a
`convoResumeOwnsSitting` insertion whose two anchor methods
(`convoHasLiveUnfinished`, `convoUnfinishedEngageLine`) do not exist
on the far end at all. Missing substrate again, methods rather than
a whole file. This is a property of the transplant method, not
a verdict on the family: NO verdict (CARRIER / AMBIGUOUS /
NOT-CARRIER) can be read, because no subject was ever measured.
Family 3's carrier question stays open. Options for the coordinator
(no call made here):

1. Narrow the family: transplant the family MINUS the three-method
   insertion (convo-beats.js + villager-agency.js + the clean
   conversation.js hunks), excluding the one conflicting hunk — but
   any such selection is a NEW family definition, not the prereg's
   family 3, and needs its own prereg. Note the excluded methods ARE
   the family's dialog-audit core (the unfinished-work refusal), so
   the narrowed family would test the recap hammer's edges, not its
   center.
2. Change the base: transplant onto a base where the insertion anchor
   still exists (e.g. the first parent `b41bd6300` itself, or the
   merge base `d229b58f5`) — also a new prereg, and it no longer
   isolates "the family alone on the far end".
3. Skip family 3 and run families 2, 4–16 in table order; family 3's
   carrier question stays open. (Note: families 2, 4, 13 sit on the
   SAME origin first-parent chain, so they may hit the same wall —
   the next arm should run the merge-tree dry run with base = the
   merge's FIRST PARENT before cutting a step, per the correction
   above.)

## Results (filled after the step)

NONE — the run stopped at the cherry-pick; no step ran, no corpus
exists, no survival number was measured. The transplant verdict for
family 3 is UNMEASURED (not CARRIER, not NOT-CARRIER).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its dialog-audit methods are
described in the family-identity section from their diff only. The
conflicting insertion is dialogue-coherence work (refusing dry
train-of-thought while unfinished conversation work is live) — no
survival, food, combat, or wave mechanics in the family diff, so
nothing in it reads as a collapse carrier on its face; that is a
reading of the diff, not a measured verdict.

## Metric review (§14)

- The primary metric (survived/8) was never measured: the run
  stopped before any sim. The metric itself held (nothing in the
  conflict impeaches it); the transplant METHOD failed at the
  mechanical step. No re-score, no threshold change proposed.
- Prereg gap worth carrying forward (extends transplant118's note):
  the substrate pre-check must use base = the merge's FIRST PARENT
  for the merge-tree dry run. The d229b58f5-based dry run predicted
  the right file but the wrong hunk; the first-parent dry run
  reproduces the live conflict exactly. The NEXT transplant arm
  should run `git merge-tree <merge>^1 <far-end> <merge>` before
  cutting a step.
- No telemetry deviation check run: no corpus exists to check, and
  the tool refuses recorder-corpus class anyway — recorded, baseline
  NOT rolled.
- Infrastructure: the host write flap did NOT block this arm (no
  EPERM on any git or file write this run). The safe-commit index
  clobber struck once on the prereg commit (f64b6c70c): files showed
  staged-as-deleted after a correct commit; repaired with the
  documented `git ls-tree -r HEAD | git update-index --add
  --index-info` pipe and verified (status empty, diff HEAD empty,
  hash-object matches ls-tree). Cherry-pick/abort/checkout were slow
  (~2 min for the abort+checkout, vs seconds normally) but completed
  without error.

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant3.js`: **58 passed, 0 failed** (run
  after the STOP; the merge-tree section parser leg was fixed first
  — the first run read 56/58 because the hunk-content extraction
  split on the first filename mention, which sits inside a hunk
  body; parser fixed to anchor on the section's base line, re-run
  58/58).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Safe-commit index clobber struck once on the prereg commit
  (f64b6c70c): files showed staged-as-deleted after a correct
  commit; repaired with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree).
- No telemetry deviation check run: no corpus exists to check, and
  the tool refuses recorder-corpus class anyway — recorded, baseline
  NOT rolled.
- Closeout: arm branch `sim-transplant3-a` at the commit below;
  subject branch `transplant-3-subject` LEFT at the far end
  `203a32775` (no subject commit); worktree clean at closeout
  (verified: `git status --short` empty after this commit).
