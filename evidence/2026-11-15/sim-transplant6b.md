# H1 transplant — narrowed family 6b: the objectives-side half of PR #33 (arm sim-transplant6b-a)

Run: fleshout-20261115T0615Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-15/sim-transplant6b-prereg.md (committed BEFORE
cutting the subject or running any judged sim).
Arm branch: `sim-transplant6b-a` (worktree
`~/workspace/worktrees/sim-transplant6b-a`, base master at run start —
HEAD 96c139d75, an ancestor of master 3904f2b8f).
Subject branch: `transplant-6b-subject` — LEFT at the far end
`203a32775` (no subject commit exists).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §5 / Seam 9 read
(the family's area). No canon invented or rewritten.

## Verdict: UNMEASURED (conflict-STOP) — the filtered objectives patch does not apply

The narrowed family 6b could not be built. Plain `git apply` of the
mechanically extracted `src/js/villager-objectives.js` hunks onto the
far end FAILS on the first two hunks (the header-comment hunks). Per the
committed prereg ("On ANY conflict in the objectives patch: STOP") the
run STOPPED here: no subject commit was created, no step was run, no
survival number exists for this family. The branch was cut at the far
end and left there; the tree was verified clean and the arm branch
checked back out. The conflict is reproducible from the recorded SHAs
alone.

No step ran, so the baseline gate never fired, the 6b survival question
is UNMEASURED (not CARRIER, not NOT-CARRIER), and the mechanism
analysis in the prereg (the objectives half is inert on far-end
substrate because the brain module is missing) stays an UNTESTED
prediction, not a finding.

## The question

Does the objectives-side half of PR #33 alone — narrowed family 6b,
the `src/js/villager-objectives.js` hunks of merge `f843fab1c`
(dawn-midday-repick, OVE-38 Candidate B, seam 9) — collapse the far
end `203a32775` (GOOD 4/8 on the matched band) toward the merge's 1/8?
The full family 6 could not be measured: its cherry-pick stopped on a
delete/modify conflict (`src/js/villager-brain.js` — the far end never
had the brain module) plus ONTOLOGY.md conflicts. This arm was the
mechanically possible narrowed follow-up the family-6 evidence proposed.
It stops one step earlier than expected: not on the brain module, but
on the far end's own edits to the same file's header comment.

## Family identity (verified at run start, before any sim)

- Merge `f843fab1c` ("Merge pull request #33 from
  steve-vitale/cursor/dawn-midday-repick-3e68"). First parent
  `230dba219`; second parent `713c96f12` ("Demote mid-day idle objPick
  without perception"). Second-parent side is 1 commit.
- `git diff --stat f843fab1c^1 f843fab1c`: 5 files, +347/−12.
  `src/js`: 2 files — villager-brain.js 47+/1− (EXCLUDED from 6b),
  villager-objectives.js 63+/8− (the 6b set). No scripts/policies
  file (pol=0). The other three files: docs/ONTOLOGY.md (5+/3−,
  EXCLUDED), scripts/green-list.txt (+1/−0, the union line),
  scripts/test-dawn-midday-repick.js (+231/−0, new file).
- The narrowed 6b set is exactly the SEVEN objectives hunks
  (`@@ -5,6 +5,8 @@`, `@@ -15,6 +17,7 @@`,
  `@@ -264,6 +267,44 @@`, `@@ -708,12 +749,24 @@`,
  `@@ -1141,12 +1194,13 @@`, `@@ -1435,7 +1489,9 @@`,
  `@@ -1449,10 +1505,9 @@`): objRefreshPick /
  objNeedsEmergencyPick (new methods), the three mid-day call sites
  switch from direct objPick to objRefreshPick (one with
  `{ dawn: true }`), monster-sighting memories mark perception
  (`monster_sighting`), header comment (method list +
  `midday_repick_event_only` rule line).
- `f843fab1c` is NOT an ancestor of the far end `203a32775` and IS an
  ancestor of master HEAD. `src/js/villager-brain.js` is ABSENT at the
  far end and PRESENT at the first parent (blob `2f99c9e51…`) — the
  full-family DU, reproduced in this arm's merge-tree pre-check.

## The conflict — STOP (no subject built, no judged sim run)

Method (per the prereg, verbatim): scratch branch
`transplant-6b-subject` cut at the far end `203a32775`; filtered patch
`git diff f843fab1c^1 f843fab1c -- src/js/villager-objectives.js`
(133 lines, 7 hunks); `git apply --check` on the subject branch.

Live result: `error: patch failed: src/js/villager-objectives.js:5` /
`error: src/js/villager-objectives.js: patch does not apply`. Nothing
was applied — `git status` clean on the subject branch, HEAD still the
far end `203a32775`.

Per-hunk table (each hunk checked individually against the far end):

| # | Hunk (first-parent numbering) | Plain `git apply` | Content |
|---|-------------------------------|-------------------|---------|
| 0 | `@@ -5,6 +5,8 @@` | **FAIL — patch failed** | header method list: add `objRefreshPick` / `objNeedsEmergencyPick` lines after `objPick` |
| 1 | `@@ -15,6 +17,7 @@` | **FAIL — patch failed** | header rules: add `midday_repick_event_only` rule line |
| 2 | `@@ -264,6 +267,44 @@` | OK | `objNeedsEmergencyPick` + `objRefreshPick` definitions |
| 3 | `@@ -708,12 +749,24 @@` | OK | monster-sighting `vbrainMarkPerception` marks (2 sites) |
| 4 | `@@ -1141,12 +1194,13 @@` | OK | objMaybeDepart idle/done call-site switch |
| 5 | `@@ -1435,7 +1489,9 @@` | OK | haul-return call-site switch (`{ dawn: true }`) |
| 6 | `@@ -1449,10 +1505,9 @@` | OK | indoor-fallback call-site switch |

So: hunks 2–6 — all five CODE hunks, including the entire survival-
relevant mechanism (the new methods, the perception marks, all three
call-site switches) — apply cleanly. Only the two HEADER-COMMENT
hunks fail. The conflict is confined to inert comment text; no
game-code hunk conflicts. That does NOT save the run: the prereg
forbids silently dropping a conflicting hunk (dropping would redefine
the family mid-run), and the STOP rule fires on ANY conflict in the
objectives patch. The STOP stands.

### Root cause (verified by diff, not assumed)

The far end's copy of `src/js/villager-objectives.js` differs from the
first parent's by 81+/97− (`git diff 230dba219 203a32775 -- <file>`).
The local line STRIPPED the villager-brain phase-1 hooks from this
file: `vbrainLogGate` call sites (LEAVE/REST/EAT/HAUL/SEEK picks),
`vbrainFeedExtras` / `vbrainScorePick` (the one-scoring-entry block),
and — critically for hunks 0–1 — the brain-module references in the
header comment:

- hunk 0's context lists `//   - objDangerBelief(vid)` — REMOVED at
  the far end (the method does not exist there), and
  `//   - objRallyFreshRaid(vid)` — the far end has
  `//   - objRallyFreshRaid()` (no argument). The family's added
  lines sit between `objPick` and `objDanger` in a context the far
  end no longer matches.
- hunk 1's context includes the `danger_heard_filtered` rule line
  (door/rally/safety read danger through objDangerBelief, seam 4) —
  REMOVED at the far end, because the belief it names does not exist
  there.

In short: the far end removed from the comment block exactly the
brain-module names the family's header hunks are anchored on. The
family's comment edits and the local line's comment edits overlap.

### Why the merge-tree prediction was wrong

The prereg predicted MEASURABLE on the merge-tree pre-check: the
objectives section auto-merges with ZERO markers. That prediction was
WRONG as a prediction about `git apply`, and the error is worth
recording so no run re-learns it: a marker-free 3-way merge does NOT
imply a clean 2-way patch application. The 3-way merge uses the first
parent as its base and reconciles the far end's context edits
automatically; plain `git apply` demands exact context match against
the far end's text. When the local line has edited the hunk's context
region (here, the header comment), the merge succeeds and the patch
fails. The merge-tree pre-check answers "does the 3-way merge
conflict?" — it does NOT answer "does the filtered patch apply?"
Future narrowed arms should run `git apply --check` of the filtered
patch against a scratch far-end checkout BEFORE committing the
prereg's MEASURABLE prediction (cheap, decisive), and treat the
merge-tree as the conflict-shape forecast only.

### The --3way diagnostic (NOT used — recorded for the coordinator)

Diagnostic only, run as a read-only check after the STOP:
`git apply --3way --check /tmp/obj-6b.patch` → OK ("Applied patch
to 'src/js/villager-objectives.js' cleanly."). The 3-way fallback
resolves both failing hunks using the patch's base blob
(`e8d972b04`, the first-parent copy) — i.e. the same reconciliation
the merge-tree performed. The subject was NOT built from this: the
binding prereg names plain `git apply` as the authority, and
substituting a different application method after the specified one
failed would be mid-run method shopping. A follow-up arm CAN measure
this family if the coordinator authorizes the 3-way method
(`git apply --3way`, or an equivalent mechanical 3-way application)
in a FRESH prereg — the diagnostic says the resulting subject would
be well-defined, and the byte-identity check (added/removed lines
equal to the family's hunks) would still be the gate. That is the
coordinator's call, not this arm's. The test file (+231, clean add)
and the green-list union (+1 line) were never applied either — the
STOP came first, so there is no partial subject to reconcile.

## Subject (filled after the attempted application)

- Subject branch: `transplant-6b-subject` — LEFT at the far end
  `203a32775` (no subject commit exists).
- Subject commit: NONE — see §The conflict (STOP) above.
- The branch is left in place at the far end (family-6 precedent),
  so a coordinator-authorized follow-up can cut from the same point.

## Results (filled after the step)

NONE — the run stopped at the patch application; no step ran, no
corpus exists, no survival number was measured. The transplant
verdict for narrowed family 6b is UNMEASURED (not CARRIER, not
NOT-CARRIER). The baseline gate never fired (no baseline leg ran);
the 8c gate-STOP pattern does not apply here — this is the earlier
conflict-STOP, one step before any sim.

## The family's own test — far-end control only

`scripts/test-transplant6b-refresh.js` (the dedicated refresh script)
run BEFORE the subject attempt, from a pathspec extract of the far
end (`/tmp/far-6b`, src+scripts+index.html+manifest.json+sw.js+
build-source.json, 199M):

- Mode `pick` (far end): exit 0 —
  `{"pass":true,"mode":"pick","seed":1,"objective":{"kind":"VISIT",
  "state":"indoor","indoor":true,"purpose":"visit","chore":null,
  "tx":4,"ty":4,"targetVid":"gen_nmkdj3g","companion":null,
  "partsLeft":2},"rngNext":0.8845642388332635,"substrate":
  {"vbrainOwnsDawn":"undefined","vbrainShouldRefresh":"undefined",
  "vbrainMarkPerception":"undefined","objRefreshPick":"undefined",
  "objNeedsEmergencyPick":"undefined","objPick":"function"}}`.
  The substrate fact is printed in the output itself: all three
  vbrain* methods undefined at the far end.
- Mode `refresh` (far end): exit 1 — `{"pass":false,"fail":
  "objRefreshPick missing (far-end control)", ...}` — the pre-fix
  control, exactly as pre-registered.
- No subject run exists (no subject tree) — the refresh-vs-pick
  byte-identity comparison is unmeasured along with everything else.

The merge's own proof `scripts/test-dawn-midday-repick.js`, run as a
diagnostic against the same far-end extract: exit 2,
`{"skip":"mid-day refresh API missing"}` — its own precondition
(lines 95–98) requires all four methods and three are absent. The
same skip would fire on the 6b subject (which adds only
`objRefreshPick`), so the family test is EXPECTED-SKIP on any 6b
subject, not a regression — same class as 8b's #14 finding and 8c's
#4 finding (missing-method substrate gaps).

## Sense-testing (SENSE-TESTING LAW)

NONE — no sim ran, so no transcripts exist to read. The family
content itself was not sense-tested; its OVE-38 seam-9 change is a
dawn/mid-day decision-coherence change (villagers keep their dawn
lead through the day unless something they perceived changes it),
described in the family-identity section from the diff and from
docs/VILLAGER-BRAIN.md §5 / Seam 9. The mechanism analysis in the
prereg (inert on far-end substrate) is untested and stays a
prediction.

## Metric review (§14)

- The primary metric (survived/8) was never measured: the run
  stopped before any sim. The metric itself held (nothing in the
  conflict impeaches it); the transplant METHOD failed at the
  mechanical step — and failed in a way the prereg's own prediction
  got wrong (see §Why the merge-tree prediction was wrong). No
  re-score, no threshold change proposed.
- Prereg gap worth carrying forward (extends the family-6 note):
  the merge-tree pre-check must be read as a CONFLICT-SHAPE
  forecast, not an apply-cleanliness proof. The NEXT narrowed arm
  should run `git apply --check` of its filtered patch against a
  scratch far-end checkout BEFORE writing the prereg's MEASURABLE
  prediction — seconds of work, and it would have caught this stop
  before the branch was cut. A second gap: the prereg should name
  the application method's fallback explicitly (plain apply only,
  or --3way authorized) instead of leaving it to the live run to
  discover — this arm's STOP was correct under its prereg, but the
  coordinator should decide the --3way question in the open, in the
  next prereg, not mid-run.
- The baseline gate (≥3/8 or STOP) never got exercised; the gate
  itself is untouched by this outcome.

## Wall numbers

NONE — no judged corpus. Reference points carried from the bisect
prereg: far end 203a32775 4/8, merge e4dbe581b 1/8, on seeds
190391–190398, 150d, competent verbatim own-policy, fix swapped in.

## Reachability

Unmeasured — no corpus. Waves 1–5, regional → national, the table,
the win flag: nothing was reached or not-reached in this run.

## Blanks filled / documented

- FILLED (measured): narrowed family 6b is UNMEASURED for survival —
  the filtered objectives patch fails plain `git apply` on the two
  header-comment hunks, so no subject was built and no step ran.
  The question is open, not answered.
- FILLED (measured): the failure is CONFINED to the two comment
  hunks — all five code hunks apply cleanly. The survival-relevant
  mechanism is mechanically portable; the header comment is not.
- FILLED (measured): the far end stripped the brain-module
  references from the objectives header comment (objDangerBelief
  line removed, objRallyFreshRaid(vid) → (), danger_heard_filtered
  rule removed) — the local line's divergence from the origin line
  in this file is 81+/97−, concentrated in removed brain hooks.
- FILLED (measured): the merge-tree marker-free reading does NOT
  imply patch-apply cleanliness — a prereg-method gap, now
  documented with the fix (pre-check `git apply --check` before
  the MEASURABLE prediction).
- FILLED (measured): the `--3way` diagnostic is clean — a
  coordinator-authorized follow-up with a fresh prereg could measure
  this family mechanically. The authorization is the coordinator's
  call.
- FILLED (measured): the refresh script's far-end control —
  pick exit 0 (VISIT/indoor objective, rngNext
  0.8845642388332635), refresh exit 1 (method missing); the family
  test exits 2 (skip, API missing) on far-end substrate.
- DOCUMENTED: safe-commit.sh index clobber struck once on the
  prereg commit (files showed staged-as-deleted after a correct
  commit) — repaired with the documented `ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree).
- DOCUMENTED: the flap-watch log read ALL-OK throughout the run
  (2026-11-15 07:30–07:34Z); disk 40%.

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the t6b per-seed corpus, metrics
national,table,wins,exiled): NO CORPUS EXISTS — the tool throws
ENOENT (`scandir 'evidence/2026-11-13/perseed-culpritbisect-a-t6b-f843fab1c'`
— no such directory). Recorded, not waived; baseline NOT rolled.
Same refusal class as all prior bisect / transplant arms (no corpus
to check, and the tool refuses recorder-corpus class anyway).

## Proof results

- `node scripts/test-transplant6b.js`: **137 passed, 0 failed** (stage 1
  was 129/129; the conflict-STOP legs in §9/§10 — branch at the far
  end, empty diff, evidence records the conflict + UNMEASURED — were
  added after the STOP and pass).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on the arm branch after the STOP).
- `node scripts/test-transplant6b-refresh.js --mode=pick` on the
  far-end extract: exit 0 (objective JSON above).
  `--mode=refresh` on the far-end extract: exit 1 (control).
- `node scripts/test-dawn-midday-repick.js` (the merge's own proof)
  on the far-end extract: exit 2, `{"skip":"mid-day refresh API
  missing"}` (diagnostic, not a judged leg).
- No telemetry deviation check run: no corpus exists (see above) —
  recorded, baseline NOT rolled.
- Closeout: arm branch `sim-transplant6b-a`, proof-verified tip
  553c44b8b (rebased onto master 8b77f0f40 at closeout; pre-rebase
  tip 8583cc456, stage-1 tip 931300dd0 — same trees, proofs re-run
  after the rebase); subject branch `transplant-6b-subject` LEFT at
  the far end `203a32775` (no subject commit); worktree verified
  clean at closeout (tracked tree empty, standing.js == HEAD, no swap
  residue — no swap ever ran). This line is the record-only commit
  that follows the proof-verified tip.

## Infrastructure

- Host write flap: no EPERM failure struck this arm's git or file
  writes; flap-watch log ALL-OK throughout (2026-11-15 07:30–07:34Z).
  Git operations ran slow during the first exec calls (the opening
  `git log` + `git status` took ~29s, dominated by the full-tree
  restat) — the same flap-era slowness prior arms recorded — then
  ran at normal speed.
- Safe-commit index clobber: struck on the prereg commit (see
  §Blanks); repaired with the documented pipe; the commit verified
  byte-identical (worktree hash == HEAD blob) before continuing.
- Heartbeats succeeded throughout (run start, pre-subject,
  post-STOP).
