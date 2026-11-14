# H1 transplant — family 2: PR #6 raid-danger-heard-c0a3 (arm sim-transplant2-a)

Run: fleshout-20261113T2215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 2 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant2-a` (worktree `~/workspace/worktrees/sim-transplant2-a`).
Prereg written and committed BEFORE any judged sim.

## The question

The inside-the-merge bisect is CLOSED with DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(round 13: s05 + s06 both BAD 1/8, no good→bad transition; far end
203a32775 GOOD 4/8, merge e4dbe581b BAD 1/8). This arm lands ONE origin
family onto the far end and measures whether it alone collapses it.

Family 2: merge `7ddcdfff9` "Merge pull request #6 from
steve-vitale/cursor/raid-danger-heard-c0a3" — the raid-danger heard-filter
family (unify raid danger to one heard-filtered belief read).

## Family identity (verified at run start, before any sim)

- First parent `21ae2d6968` (PR #5 merge, forager-ascension-deed);
  second parent `dff2cd523` ("Merge origin/master into raid-danger-heard
  branch"). Second-parent side is 2 commits: `dff2cd523` itself +
  `763456007` "Unify raid danger to one heard-filtered belief read".
- `git diff --stat 7ddcdfff9^1 7ddcdfff9`: 14 files, +379/−97.
  `src/js`: 4 files, +71/−62 — game.js +7/−1, npc-triggers.js +3/−1,
  villager-goals.js +4/−11, villager-objectives.js +57/−49. No
  scripts/policies file (pol=0). Table reading (js=4, pol=0)
  CONFIRMED — matches round-2115 §3.
- Content (from the diff, not assumed): VILLAGER-BRAIN seam 4 —
  door, rally and safety read danger through one heard-filtered
  belief (`objDangerBelief`); gossip counts only if this villager is
  in its heard list; the raid seed arms only villagers at the fire
  (`npcIds().slice(0, 4)`); `dangerHeard` in villager-goals.js becomes
  a thin read over `objDangerBelief`. Perception-first: a raid nobody
  heard arms nothing.
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
  + analyzer, same as the bisect steps); STEP id `t2-7ddcdfff9`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-2-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below) so the verdict is
  reproducible. Never committed to the arm branch. Applied via
  `git cherry-pick -m 1 7ddcdfff9`. On ANY conflict: STOP, report the
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
- Proof: `scripts/test-transplant2.js` (family diff applied completely,
  subject commit recorded, base restored) + the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Subject (filled after the cherry-pick)

- Subject branch: `transplant-2-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §Cherry-pick conflict (STOP) below.

## Cherry-pick conflict — STOP (no judged sim run)

`git checkout transplant-2-subject` (from `203a32775`) +
`git cherry-pick -m 1 7ddcdfff9` CONFLICTED. Per the transplant prereg
("On ANY conflict: STOP, report the conflict, do not hand-resolve game
code") the run STOPPED here. No subject commit was created, no step
was run, no survival number exists for this family. The cherry-pick
was aborted (`git cherry-pick --abort`), the arm branch checked back
out, the tree verified clean. The conflict is reproducible from the
recorded SHAs alone.

Exactly ONE unmerged file (live `git status` at the conflict, verbatim):

- UU (both modified, content conflict) — `scripts/green-list.txt`
  (lines 916–924, a single conflict hunk):
  - ours (far end): `scripts/test-pellet-boost-20261108.js quick`,
    `scripts/test-pellet-q4-20261108.js quick`
  - theirs (family): `scripts/test-person-trust-20261108.js quick`,
    `scripts/test-raid-danger-heard.js quick`,
    `scripts/test-win-rallyguard.js quick`,
    `scripts/test-retarget-gossip.js quick`
  - Both lines appended different test-list entries at the same spot;
    the file is a test list, not game code.

Everything else applied cleanly (live status at the conflict):

- Staged M (clean): `docs/ONTOLOGY.md`, `docs/VILLAGER-BRAIN.md`,
  `scripts/test-arrival-a.js`, `scripts/test-motivation-wire.js`,
  `scripts/test-retarget-gossip.js`,
  `scripts/test-villager-objectives-20261008.js`,
  `scripts/test-win-rallyguard.js`, and all four src/js files —
  `src/js/game.js`, `src/js/npc-triggers.js`,
  `src/js/villager-goals.js`, `src/js/villager-objectives.js`.
- Staged A (clean additions — files absent at the far end):
  `evidence/2026-11-08/raid-danger-heard.md`,
  `scripts/test-raid-danger-heard.js`.
- NO missing-substrate wall: unlike family 1, no game-code file in
  the family diff is absent at the far end (substrate check before
  the pick: all four src/js files EXISTS; only the two added files
  above were MISSING, and they add cleanly).

Independent confirmation (no worktree touch): `git merge-tree
21ae2d6968 203a32775 7ddcdfff9` (base = first parent) reports exactly
one content-conflicted section — `scripts/green-list.txt`, 3 markers
(`+<<<<<<<`, `+=======`, `+>>>>>>>` by the transplant118 counting
method) — and shows `docs/ONTOLOGY.md`, `src/js/game.js`,
`src/js/villager-objectives.js` as "changed in both" with ZERO
markers, i.e. merging cleanly. The merge-tree dry run predicted the
live conflict exactly, including the file.

## What this means for the H1 transplant program

The transplant premise — "apply the family diff onto the far end" —
fails for family 2 at the mechanical step, but in the weakest possible
way: the wall is ONE conflict in a test-list file, not missing
substrate (family 1) and not overlapping game-code edits. All four
src/js files in the family merge cleanly onto the far end, and the
two files the far end lacks add cleanly. This is a property of the
transplant method under the binding "ANY conflict" rule, not a
verdict on the family: NO verdict (CARRIER / AMBIGUOUS / NOT-CARRIER)
can be read, because no subject was ever measured. Options for the
coordinator (no call made here):

1. Narrow the prereg: resolve ONLY `scripts/green-list.txt` by union
   (keep both sides' lines — the file is a test list with no game
   effect; the resolution is mechanical, no semantic choice) and
   re-run the transplant as family 2b under its own prereg. The
   game-code diff is already proven clean, so the re-run would
   measure exactly the family's js change.
2. Skip family 2 and run families 3–16 in table order; family 2's
   carrier question stays open. (Note: the family's content — the
   heard-filtered danger read that gates departures and the rally —
   is a live survival-relevant path; a filter that arms nothing when
   nobody heard could plausibly move survival either way, so the
   question is worth the 2b re-run rather than a silent skip.)
3. Treat the conflict as the family being unmeasurable under this
   method and move on — same as family 1, but the reason is weaker
   (one list file, not a missing brain module).

Prereg note for the next arm: the transplant118 metric-review
suggestion (substrate gate + merge-tree pre-check before cutting a
step) was run here and predicted the live conflict exactly. Carry
it forward as a mandatory pre-check. The "ANY conflict" rule as
written treats a test-list conflict the same as a game-code
conflict; a future prereg revision may want a carve-out for
non-game files (docs/evidence/scripts lists) resolved by union —
that is a coordinator call, not this arm's.

## Results (filled after the step)

NONE — the run stopped at the cherry-pick; no step ran, no corpus
exists, no survival number was measured. The transplant verdict for
family 2 is UNMEASURED (not CARRIER, not NOT-CARRIER).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its heard-filtered danger read
is described in the family-identity section from the diff only:
a raid nobody heard arms nothing; door/rally/safety share one
belief read.

## Metric review (§14)

- The primary metric (survived/8) was never measured: the run
  stopped before any sim. The metric itself held (nothing in the
  conflict impeaches it); the transplant METHOD failed at the
  mechanical step on a single non-game file. No re-score, no
  threshold change proposed.
- The merge-tree pre-check (transplant118's suggested substrate
  gate) is validated by this run: it predicted the one conflict,
  file and marker count, before the branch was cut. Recommend it
  as a mandatory pre-check in the next transplant prereg revision,
  alongside a coordinator decision on whether non-game-file
  conflicts resolved by union still count as a STOP.

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant2.js`: **40 passed, 0 failed** (run
  after the STOP; the merge-tree parser leg passed on the first run —
  the one content conflict + three clean 'changed in both' files
  matched the preregistered counts exactly).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Safe-commit index clobber struck once on the prereg commit
  (e9177cf90): the file showed staged-as-deleted after a correct
  commit; repaired with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree).
- Heartbeat: first attempt EPERM (host write flap, PermissionError
  writing REGISTRY.json); two later attempts succeeded
  ("heartbeat sim-transplant2-a", exit 0). Flap also slowed git
  operations (cherry-pick abort + checkout took ~47s).
- No telemetry deviation check run: no corpus exists to check, and
  the tool refuses recorder-corpus class anyway — recorded, baseline
  NOT rolled.
- Closeout: arm branch `sim-transplant2-a` tip (to be filled at commit
  time — see the commit below this line in the branch log); subject
  branch `transplant-2-subject` LEFT at the far end `203a32775`
  (no subject commit); worktree verified clean at closeout.
