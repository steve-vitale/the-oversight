# H1 transplant — family 1: PR #118 prove-out-land-all-534ac (arm sim-transplant118)

Run: fleshout-20261113T2115Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 1 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant118` (worktree `~/workspace/worktrees/sim-transplant118`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 1: merge `1ec04e167` "Merge pull request #118 from
steve-vitale/cursor/prove-out-land-all-534ac" — the largest game-code
family on the origin line (8 src/js files).

## Family identity (verified at run start, before any sim)

- First parent `3339c0195` (PR #50 merge); second parent `534ac4e9d`
  (OVE-154 tip). Merge-base of the parents IS the first parent, so the
  family diff is exactly the 73 commits `3339c0195..534ac4e9d`
  (OVE-129..OVE-154): the army-advance contest leans — Between
  chase/race, Ward army-advance, OPA breach, Unkillable last-standing,
  Apex scout-mark, All-Seeing war-council — each wired + STD16
  rematched + phone-frame proof refreshed.
- `git diff --stat 1ec04e167^1 1ec04e167 -- src/js`: 8 files,
  +1705/−84: comms.js +23, contestEngine.js +221, conversation.js +9,
  game.js +58, godverbs.js +587, titans.js +427, villager-brain.js +380,
  villager-objectives.js +84. No scripts/policies file (pol=0).
  Full merge diff: 1020 files, +188282/−147 (the rest is
  evidence/panels/scripts/proofs — no game effect).
- `standing.js` NOT in the family diff: the subject's native standing.js
  is the far-end one (sha256 `75762cb2…`, per the bisect prereg), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Subject's policy is the far-end competent.js (family touches no policy
  file); own-policy per step, same as the bisect.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t118-1ec04e167`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-118-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 1ec04e167`. On ANY conflict: STOP, report the
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
- Proof: `scripts/test-transplant118.js` (family diff applied
  completely, subject commit recorded, base restored) + the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-118-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §Cherry-pick conflict (STOP) below.

## Cherry-pick conflict — STOP (no judged sim run)

`git checkout transplant-118-subject` (from `203a32775`) +
`git cherry-pick -m 1 1ec04e167` CONFLICTED. Per the transplant prereg
("On ANY conflict: STOP, report the conflict, do not hand-resolve game
code") the run STOPPED here. No subject commit was created, no step
was run, no survival number exists for this family. The cherry-pick
was aborted (`git cherry-pick --abort`), the arm branch checked back
out, the tree verified clean. The conflict is reproducible from the
recorded SHAs alone.

14 unmerged files (live `git status` at the conflict, verbatim):

- UU (both modified, content conflict) — 8 files:
  - `docs/ONTOLOGY.md`, `docs/ROADMAP.md`
  - `scripts/balance-proof.json`, `scripts/green-list.txt`,
    `scripts/phone-frame-proof.json`
  - `src/js/conversation.js`, `src/js/game.js`,
    `src/js/villager-objectives.js`
- DU (deleted on the far end, modified by the family) — 6 files:
  - `evidence/2026-11-08/person-trust-prereg.md`
  - `scripts/probe-phase6-role-census-20261108.js`,
    `scripts/test-duty-dawn-candidates.js`,
    `scripts/test-person-trust-20261108.js`,
    `scripts/test-snippet-stage-direction.js`
  - `src/js/villager-brain.js`

Why it conflicts (verified, not assumed): the two lines diverged in
content, not just in commits. The far end `203a32775` is on the local
line; the family's merge base `3339c0195` is on the origin line, and
the origin line created files the local line never had — all six DU
files are ABSENT at the far end (`git ls-tree 203a32775` = 0) and
PRESENT at the base (`git ls-tree 3339c0195` = 1). The most
consequential is `src/js/villager-brain.js`: the family's game-code
delta touches a whole brain module that does not exist on the far
end, so the family cannot be a pure addition there — it presumes
origin-line substrate (the OVE-51/52 brain work and the phase-6
role-census probes). The three game-code UU files (game.js,
conversation.js, villager-objectives.js) changed on both lines since
the divergence in overlapping hunks.

Independent confirmation (no worktree touch): `git merge-tree
3339c0195 203a32775 1ec04e167` reproduces the same 8 content
conflicts (ONTOLOGY 6 markers, ROADMAP 3, balance-proof 3,
green-list 3, phone-frame-proof 15, conversation.js 3, game.js 6,
villager-objectives.js 3) and shows `src/data/godpaths.json` as
changed-in-both with ZERO markers — the one family file both lines
touched that merges cleanly.

## What this means for the H1 transplant program

The transplant premise — "apply the family diff onto the far end" —
fails for family 1 at the mechanical step: the family is not
transplantable by cherry-pick because the far end and the origin
line disagree about the tree itself (missing substrate + overlapping
game-code edits). This is a property of the transplant method, not a
verdict on the family: NO verdict (CARRIER / AMBIGUOUS / NOT-CARRIER)
can be read, because no subject was ever measured. Options for the
coordinator (no call made here):

1. Narrow the family: transplant only the 8 src/js files' hunks that
   apply (or only the lean wires in godverbs.js/titans.js/
   contestEngine.js), excluding the files that need missing
   substrate — but any such selection is a NEW family definition, not
   the prereg's family 1, and needs its own prereg.
2. Change the base: transplant onto a base that HAS the substrate
   (e.g. the merge base `d229b58f5` plus the brain files, or the
   origin tip `a628aeaf3` minus the other families) — also a new
   prereg, and it no longer isolates "the family alone on the far
   end".
3. Skip family 1 and run families 2–16 in table order; family 1's
   carrier question stays open. (Note: families 2, 3, 4, 13 sit on
   the SAME origin first-parent chain, so they may hit the same
   missing-substrate wall — the next arm should check `git ls-tree
   203a32775` for its family's files BEFORE cutting a step.)

## Results (filled after the step)

NONE — the run stopped at the cherry-pick; no step ran, no corpus
exists, no survival number was measured. The transplant verdict for
family 1 is UNMEASURED (not CARRIER, not NOT-CARRIER).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its OVE-129..154 leans are
contest/army-advance wires with STD16 rematches, described in the
family-identity section from their commit subjects only.

## Metric review (§14)

- The primary metric (survived/8) was never measured: the run
  stopped before any sim. The metric itself held (nothing in the
  conflict impeaches it); the transplant METHOD failed at the
  mechanical step. No re-score, no threshold change proposed.
- Prereg gap worth carrying forward: the transplant prereg assumes
  cherry-pickability. The NEXT transplant arm should pre-check, as a
  substrate gate before cutting a step: (a) every file in the family
  diff exists at the far end, (b) `git merge-tree` reports zero
  content conflicts. That check costs seconds and would have caught
  this stop before the branch was cut.

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant118.js`: **39 passed, 0 failed** (run
  after the STOP; the merge-tree parser leg was fixed first — the
  first run read 36/39 because a new 'changed in both' section
  overwrote the previous one before it was recorded; parser fixed,
  re-run 39/39).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Safe-commit index clobber struck once on the prereg commit
  (c08a53f4d): files showed staged-as-deleted after a correct
  commit; repaired with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree).
- No telemetry deviation check run: no corpus exists to check, and
  the tool refuses recorder-corpus class anyway — recorded, baseline
  NOT rolled.
- Closeout: arm branch rebased onto master 95dbf07f3 (current tip at
  closeout; the brief's 2de59ab7f had been superseded by the Loop B
  r195 landing), proofs re-run on the rebased tip. Proof-verified
  rebased tip: `302e8584a` (2 commits: prereg+test, conflict-STOP
  record); one record-only commit follows it on the branch (this
  file's tip-hash line itself).
