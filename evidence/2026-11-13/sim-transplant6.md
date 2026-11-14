# H1 transplant — family 6: PR #33 dawn-midday-repick-3e68 (arm sim-transplant6-a)

Run: fleshout-20261114T0015Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 6 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant6-a` (worktree `~/workspace/worktrees/sim-transplant6-a`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 6: merge `f843fab1c` "Merge pull request #33 from
steve-vitale/cursor/dawn-midday-repick-3e68" — the dawn/mid-day
re-pick demotion (OVE-38 Candidate B, VILLAGER-BRAIN seam 9): mid-day
idle/done re-picks run only on a perception-changing event, not on
every idle/done moment.

## Canon

docs/CANON.md read first. The canon doc for this area is
docs/VILLAGER-BRAIN.md, and it covers the target directly: §5
("Re-scoring inside the day happens only on a perception-changing
event — a threat sensed, an injury, a grievance earned, a fight
survived — evaluated at the next day-part boundary") and Seam 9
("every subsystem keeps its own clock... Replaced by: one decision
clock (dawn + event-triggered re-score, §5)"). The family is
canon-grounded: it demotes the mid-day idle/done re-pick to exactly
that event-triggered re-score. Nothing here invents canon.

## Family identity (verified at run start, before any sim)

- First parent `230dba219` (merge origin/master #31 one_person_army
  attainment into OVE-37 port); second parent `713c96f12` ("Demote
  mid-day idle objPick without perception"). Second-parent side is
  1 commit.
- `git diff --stat f843fab1c^1 f843fab1c`: 5 files, +347/−12.
  `src/js`: 2 files — villager-brain.js 48 changed lines
  (numstat 47+/1−), villager-objectives.js 71 changed lines
  (numstat 63+/8−). No scripts/policies file (pol=0). Table reading
  (js=2, pol=0) CONFIRMED — matches round-2115 §3 and the task brief
  exactly (villager-brain.js +48, villager-objectives.js +71).
- The other three files: docs/ONTOLOGY.md (5+/3−), scripts/green-list.txt
  (+1/−0), scripts/test-dawn-midday-repick.js (+231/−0, new file).
- Content (from the diff, not assumed): OVE-38 Candidate B
  (VILLAGER-BRAIN seam 9) — `vbrainShouldRefresh(vid, opts)` /
  `vbrainMarkPerception(vid, reason)` in villager-brain.js (a
  same-day commitment is stale only when its day/part metadata is
  missing or the recorded day no longer matches; advancing day-part
  alone does NOT stale the lead — "that was the mid-day rewrite
  bug"); `objRefreshPick(vid, hx, hy, opts)` /
  `objNeedsEmergencyPick(vid)` in villager-objectives.js (mid-day
  idle/done may call objPick only when the dawn commitment's
  day/part is stale, a perception flag fired, or an emergency body
  gate must interrupt: escape goal, energy < 35, hunger > 55 with
  pantry > 500 kcal); monster-sighting memories mark perception
  (`monster_sighting`); the three mid-day call sites switch from
  direct `objPick` to `objRefreshPick` (one with `{ dawn: true }`).
- `standing.js` NOT in the family diff: the subject's native standing.js
  would be the far-end one (sha256 `75762cb2…`, per the bisect prereg),
  so the standing-fix swap mechanics are exactly as in the bisect prereg.
- Subject's policy would be the far-end competent.js (family touches no
  policy file); own-policy per step, same as the bisect.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t6-f843fab1c`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-6-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 f843fab1c`. On ANY conflict: STOP, report the
  conflict, do NOT hand-resolve game code. ONE exception (coordinator
  decision, family-2b precedent): a conflict in ONLY
  scripts/green-list.txt may be resolved by union — but ONLY after
  verifying that only scripts/check.js reads green-list.txt and zero
  src/js files do. Any other conflicted file: STOP, and the
  deliverable is the conflict report + UNMEASURED verdict.
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
- Proof: `scripts/test-transplant6.js` (family identity incl. the
  merge-tree prediction, live-conflict record, base restored, verdict
  mapping) plus re-run the reused `scripts/test-culpritbisect-a.js`
  (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 230dba219 203a32775 f843fab1c` (base = first parent,
per the 2215Z method correction — `cherry-pick -m 1` uses the first
parent as its base). Prediction: TWO content-conflicted files, THREE
marker blocks total (transplant118/2b counting method: `+<<<<<<<`,
`+=======`, `+>>>>>>>`):

- `docs/ONTOLOGY.md` — 2 marker blocks (6 markers):
  - Block 1 (~line 1974 in merge-tree coords): theirs inserts the
    whole `### villager-brain` ONTOLOGY section (with the new
    `vbrain_midday_event_only` rule); ours has no villager-brain
    section at that anchor.
  - Block 2 (~line 2018 in merge-tree coords): the
    `### villager-objectives` `**Provides:**` line — ours the old
    line, theirs with objRefreshPick / objNeedsEmergencyPick /
    objDangerBelief / objRallyFreshRaid(vid) + the
    `midday_repick_event_only` rule.
  - The godpath `**Provides:**` hunk (~line 947, theirs adds
    `observeHarvestFeed(game)`) merges CLEANLY — it is a plain
    `-`/`+` pair outside any marker block, not a conflict.
- `scripts/green-list.txt` — 1 marker block (3 markers, ~line 800):
  ours side EMPTY at that anchor; theirs adds 3 lines:
  `scripts/test-villager-brain-dawn.js quick`,
  `scripts/test-dawn-materialize-honesty.js quick`,
  `scripts/test-dawn-midday-repick.js quick`.
- Clean: `src/js/villager-objectives.js` (changed in both, ZERO
  markers — auto-merges); `scripts/test-dawn-midday-repick.js`
  (added in remote — clean add).

CORRECTION (recorded after the live pick — the prereg's first draft
of this section misread two things, and the misread is corrected
here, not silently fixed): (a) the first draft listed the godpath
Provides hunk as a conflict — it is not; the two ONTOLOGY conflict
blocks are the villager-brain section insert and the objectives
Provides line, as above. (b) The first draft called
`src/js/villager-brain.js` a "clean take-theirs" — it is not. The
merge-tree output lists it under `removed in local` (base + their
blobs only, no `our` line): the file is ABSENT at the far end and
PRESENT at the first parent, i.e. a delete/modify (DU) conflict,
not a clean application. The pre-check DID contain the DU signal;
the arm misread it. The live pick confirms the corrected reading
exactly (§Cherry-pick conflict).

Consequence recorded BEFORE the pick: the union exception does NOT
apply even though green-list.txt is conflicted — the exception
covers a conflict in ONLY green-list.txt, and ONTOLOGY.md conflicts
too. If the live cherry-pick reproduces this prediction, the run
STOPS with UNMEASURED. (ONTOLOGY.md is a docs file, not game code,
but the exception as written is green-list-only; resolving a docs
conflict by hand would still be a hand-resolution of family content
outside the authorized carve-out, so the STOP stands.)

## Green-list.txt readers (verified by grep before the pick)

- `scripts/check.js` reads `scripts/green-list.txt` via `readList`
  — the only code reader. It is the check runner, not game code.
- ZERO readers in `src/` — no `src/js` file references green-list.txt
  at all. (Recorded for the union-exception analysis; the exception
  still does not apply — see above.)

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-6-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §Cherry-pick conflict (STOP) below.

## Cherry-pick conflict — STOP (no judged sim run)

`git checkout transplant-6-subject` (from `203a32775`) +
`git cherry-pick -m 1 f843fab1c` CONFLICTED. Per the transplant prereg
("On ANY conflict: STOP, report the conflict, do not hand-resolve game
code") the run STOPPED here. No subject commit was created, no step
was run, no survival number exists for this family. The cherry-pick
was aborted (`git cherry-pick --abort`), the arm branch checked back
out, the tree verified clean. The conflict is reproducible from the
recorded SHAs alone.

THREE unmerged paths (live `git status` at the conflict, verbatim):

- UU (both modified, content conflict) — 2 files:
  - `docs/ONTOLOGY.md` — 2 marker blocks, live lines 1977–1995
    (theirs inserts the whole `### villager-brain` section; ours
    has nothing at that anchor) and 2040–2044 (the
    `### villager-objectives` `**Provides:**` line, ours old /
    theirs with objRefreshPick / objNeedsEmergencyPick /
    objDangerBelief / objRallyFreshRaid(vid)). The godpath
    Provides hunk merged cleanly (no markers).
  - `scripts/green-list.txt` — 1 marker block, live lines 803–808.
    Ours side EMPTY; theirs adds the 3 test lines
    (`test-villager-brain-dawn.js`, `test-dawn-materialize-honesty.js`,
    `test-dawn-midday-repick.js`). No other line touched.
- DU (deleted by us, modified by them) — 1 file:
  - `src/js/villager-brain.js` — unmerged stages 1 (base blob
    `2f99c9e51…`) + 3 (theirs blob `737093b44…`) only, no stage 2.
    The file is ABSENT at the far end (`git ls-tree 203a32775 --
    src/js/villager-brain.js` = empty) and PRESENT at the first
    parent (`230dba219`, blob `2f99c9e51…`). The family modifies a
    whole brain module the far end never had — the family-1
    missing-substrate wall in miniature (methods, not a whole file,
    in family 3's case; here a whole module, as in family 1).

The other two family files staged cleanly (A:
`scripts/test-dawn-midday-repick.js`; M:
`src/js/villager-objectives.js`).

Why the union exception does not apply: the exception covers a
conflict in ONLY `scripts/green-list.txt`. This pick conflicts in
THREE paths, two of them outside green-list.txt — and one of them
(`villager-brain.js`) is a game-code file the far end lacks
entirely. Resolving any of the three by hand would be a
hand-resolution of family content outside the authorized carve-out.
The STOP stands; the deliverable is this conflict report +
UNMEASURED verdict.

What this means for the H1 transplant program: family 6 is the
fourth cherry-pick in the program to stop on divergence (families 1,
2, 3 before it; 2b measured only through the narrowed union route).
The pattern is now the program's dominant outcome, not the
exception: the origin line's brain-module work (villager-brain.js
did not exist on the local line at the far end) cannot be
transplanted onto the far end by cherry-pick at all. A narrowed
family 6b — the villager-objectives.js hunks alone (which staged
cleanly) plus the green-list union — is mechanically possible and
would isolate the mid-day re-pick demotion itself from the missing
brain module, but that is a NEW family definition needing its own
prereg and a coordinator decision, not this arm's call. The
objectives-side change is the survival-relevant half (it is the code
that stops mid-day re-picks); the brain-side change is the
gate-keeping around it.

## Results (filled after the step)

NONE — the run stopped at the cherry-pick; no step ran, no corpus
exists, no survival number was measured. The transplant verdict for
family 6 is UNMEASURED (not CARRIER, not NOT-CARRIER).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its OVE-38 seam-9 change is a
dawn/mid-day decision-coherence change (villagers keep their dawn
lead through the day unless something they perceived changes it),
described in the family-identity section from the diff and from
docs/VILLAGER-BRAIN.md §5 / Seam 9.

## Metric review (§14)

- The primary metric (survived/8) was never measured: the run
  stopped before any sim. The metric itself held (nothing in the
  conflict impeaches it); the transplant METHOD failed at the
  mechanical step. No re-score, no threshold change proposed.
- Prereg gap worth carrying forward (extends the 118 arm's note):
  the merge-tree pre-check must be read as a SUBSTRATE gate, not
  just a conflict count — a `removed in local` / `added in remote`
  section for a src/js file is a missing-substrate signal, not a
  clean application. This arm misread exactly that signal in its
  first prereg draft and corrected it only after the live pick;
  the NEXT transplant arm should check, before cutting a step:
  (a) every file in the family diff exists at the far end
  (`git ls-tree 203a32775`), (b) `git merge-tree` reports zero
  content conflicts AND zero `removed in local` / DU entries for
  src/js files. That check costs seconds and would have caught
  this stop before the branch was cut.

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant6.js`: **65 passed, 0 failed** (run
  after the STOP; the merge-tree DU leg + live-conflict legs were
  added after the pick — the pre-pick run was 48/48).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch after the pick).
- Safe-commit index clobber struck once on the prereg commit
  (4606b3e93): the files showed staged-as-deleted after a correct
  commit; repaired with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree).
- No telemetry deviation check run: no corpus exists to check, and
  the tool refuses recorder-corpus class anyway — recorded, baseline
  NOT rolled.
- Closeout: arm branch `sim-transplant6-a`, tip (to fill: second
  commit hash — this file's tip-hash line itself is record-only);
  subject branch `transplant-6-subject` LEFT at the far end
  `203a32775` (no subject commit); worktree verified clean at
  closeout (tracked tree empty, standing.js == HEAD, no swap
  residue — no swap ever ran).

## Infrastructure

- Host write flap: no EPERM failure struck this arm's git or file
  writes directly, but git operations ran markedly slow during the
  closeout of the cherry-pick (the `git checkout` + `git status` +
  `git diff` verification took ~94s, dominated by the full-tree
  restat) — the same flap-era slowness the 2b arm recorded on its
  index-clobber repair. Heartbeats succeeded throughout.
- Safe-commit index clobber: struck on the prereg commit (see §Proof
  results); repaired with the documented pipe.
- (to fill at closeout: final heartbeat, tree state)
- Heartbeats succeeded throughout (run start, pre-pick, post-pick).
  Final tree state verified clean before the closeout commit (see
  §Proof results).
