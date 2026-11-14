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
  tightens the recap hammer (convoHasLiveUnfinished — refuse dry
  train-of-thought while unfinished work is live; plant-teach as a
  diegetic act so a ledger-blocked react does not dry after the lesson
  landed) and villager-agency.js suppresses agency pivots while an
  unfinished resume/debt/confide owns the sitting (RESUME OWNERSHIP,
  dialog audit #7). convo-beats.js carries a small related hunk.
  Dialogue/coherence work only — no survival, food, combat, or wave
  mechanics in the diff.

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
  conflict under `cherry-pick -m 1` (verified: the true cherry-pick
  base is `d229b58f5`, merge-base of far end and merge; re-running
  merge-tree with that base predicts the same single conversation.js
  hunk, plus full-tree artifacts in files the family diff never
  touches).
- The predicted conflict is semantic, not incidental: both lines
  refactored the same teach-outcome lines in conversation.js — the far
  end folds `choiceId === 'teach'` into `lessonOutcome`; the family
  splits it out as `plantTeachOutcome` (dialog audit #4). The
  cherry-pick below is the live confirmation, not the prediction.

## Subject (filled after the cherry-pick)

TBD — filled after the cherry-pick attempt below.

## Cherry-pick conflict (filled after the cherry-pick attempt)

TBD — filled after the cherry-pick attempt below.

## What this means for the H1 transplant program

TBD — filled after the cherry-pick attempt below.

## Results (filled after the step)

TBD — no step has run yet.

## Sense-testing (SENSE-TESTING LAW)

TBD — no sim has run yet.

## Metric review (§14)

TBD — filled at closeout.

## Wall numbers

TBD — no judged corpus yet. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant3.js`: TBD (stage-1 legs pass at prereg
  commit; conflict legs added after the cherry-pick attempt).
- `node scripts/test-culpritbisect-a.js`: TBD (re-run at closeout).
