# H1 transplant — narrowed family 5b: PR #120 garden-measurement-0315, FIRST POLICY family (arm sim-transplant5b-a)

Run: fleshout-20261114T0215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, narrowed family 5b (coordinator decision,
evidence/2026-11-13/sim-transplant-round-0015.md §Method decision).
Arm branch: `sim-transplant5b-a` (worktree `~/workspace/worktrees/sim-transplant5b-a`,
base master 62c19318e).
Prereg written and committed BEFORE cutting the subject or running any judged sim.
Canon: docs/CANON.md read first; docs/GARDENS.md read (see §Canon below).
This arm measures a POLICY family; no game code is touched by the family
itself (js=0), so no canon invention is involved.

## The question

Narrowed family 5b is a NEW family definition, never a re-judgment of
family 5 (which read UNMEASURED on a cherry-pick conflict confined to
`scripts/balance-proof.json`). Does the garden-keeper appointment
reorder alone — appoint the standing caretaker BEFORE making beds,
while residents are still at Haven — collapse the far end (GOOD 4/8)
toward the merge's 1/8?

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `abb3c2db2` "Merge pull request #120 from
  steve-vitale/cursor/ove-160-garden-measurement-0315". First parent
  `da153118c` (PR #119 merge, phone-refresh); second parent
  `91cb6fa20` ("OVE-160: restore garden caretaker appointment;
  refresh measurement proofs"). Second-parent side is 1 commit.
- `git diff --stat abb3c2db2^1 abb3c2db2`: 6 files, +35/−12.
  `src/js`: 0 files — js=0. `scripts/policies`: 3 files — pol=3.
  Table reading (js=0, pol=3) CONFIRMED by this arm — matches
  round-2115 §3, the family-5 arm, and the brief.
- Policy diff (read from the diff, not assumed): in each of the three
  files (`scripts/policies/competent.js`,
  `scripts/policies/competent-nofallback.js`,
  `scripts/policies/competent-nofallback-socialD.js`) the SAME
  11-line change inside `workGarden` (+8/−3 per file): the
  garden-keeper appointment block moves BEFORE the `makePlot` loop
  (appoint while residents are still at Haven; previously plots
  first, then appoint). The moved block is byte-identical in all
  three files, including the 4-line comment ("Appoint while
  residents are still at Haven. makePlot ticks move the rest of the
  roster off-tile; gardenKeeperReady then empties and the standing
  caretaker is never reserved. DUTY already honors an appointed
  gardenKeeper, so appointing first keeps them present through bed
  prep.").
- Other family files (non-policy, non-game):
  - `evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz`
    (added, 103,076 bytes) — the OVE-160 measurement panel corpus.
  - `scripts/balance-proof.json` (+2/−2: `panel` + `panelDigest`
    lines re-pointed from the OVE-84 scout-duty panel to the OVE-160
    panel).
  - `scripts/godpath/occupation-fixtures.json` (+9/−1, reformatted +
    seeds refreshed for OVE-160: absent 2008→3001, npc-only
    4058→3004, alternateOccupation rail_conductor→arborist; played
    seed 3122 and roster hash unchanged).
- `standing.js` NOT in the family diff: the subject's native
  standing.js will be the far-end one (sha256 `75762cb2…`, same as
  the bisect prereg and the family-5 arm), so the standing-fix swap
  mechanics are exactly as in the bisect prereg.
- Far-end policy sha: `a7ff5c516440` (scripts/policies/competent.js at
  203a32775 — the same far-end policy sha the 2b and 5 arms
  recorded). Merge policy sha: `26a87e493578` (competent.js at
  abb3c2db2). The first parent's competent.js is also
  `a7ff5c516440`, so the family's policy change is cleanly the diff
  (no far-end-side policy drift). Nofallback shas: far `6919e8d36a9b`
  → merge `a27d7396f09a`; socialD far `01d931a76205` → merge
  `2ad0f2bce389`.

## Narrowed 5b definition (authorized by the coordinator)

NARROWED-TOOLING RULE (decided in the 0015Z run, now the standard
route): conflicts confined ENTIRELY to files with zero readers in
src/ may be re-run as a narrowed family; scripts/balance-proof.json
by taking the far-end (ours) pointer — the driver never reads it
and the measured family diff is byte-identical either way.

NARROWED 5b DEFINITION: balance-proof.json ours (far-end pointer:
panel `evidence/2026-11-10/neutral-r167-adopt.json.gz`). Nothing
else is resolved by hand. If ANY conflict appears outside
balance-proof.json, or any src/js conflict/DU: STOP, write a
conflict-STOP record (same shape as the family-5 arm), commit it,
and report UNMEASURED. Do not hand-resolve game code.

Grep justification (re-verified by THIS arm, `git grep -l
balance-proof` on the HEAD tree): the file is named only by
measurement/proof tooling — `scripts/balance-proof-update.js`,
`scripts/godpath/test-measurement-*.js`,
`scripts/godpath/test-panel-contract-rulings.js`,
`scripts/test-proofrefresh-*.js`, `scripts/test-gateclassify-parse-20261112.js`,
evidence JSONs, and the transplant proof tests. ZERO readers in
`src/` (`git grep -l balance-proof -- src/` returns nothing). The
driver (`scripts/culpritbisect-driver-20261113.js`) never reads it.
Resolving the pointer either way changes NO game behavior and NO
policy behavior: the subject's measured game + policy diff is
byte-identical to the family's either way. After resolving, this
arm VERIFIES that: diff the subject vs far end for the three policy
files and compare against the family diff (recorded in the evidence
file, legs in scripts/test-transplant5b.js).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree da153118c 203a32775 abb3c2db2` (base = first parent,
per the 2215Z method correction) predicts EXACTLY ONE
content-conflicted file — `scripts/balance-proof.json`, 3 markers
(`+<<<<<<<`, `+=======`, `+>>>>>>>` by the transplant118 counting
method) — and the other family files merge cleanly:

- `scripts/balance-proof.json` (changed in both, hunk
  `@@ -1,7 +1,12 @@`):
  - ours (far end): `panel` =
    `evidence/2026-11-10/neutral-r167-adopt.json.gz`, digest
    `ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f`
  - theirs (family): `panel` =
    `evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz`,
    digest
    `100be3c3d7918855db9c4ee7ecffb48a96bb3bf67f38c096c346c86ab054e5bc`
  - base (first parent): `panel` =
    `evidence/2026-11-09/neutral-ove84-scout-duty-panel.json.gz`, digest
    `2f08f80f1e595457c9c13ad7e10b1bc1d2c3c6609223c4b29869b90d6fdc0fd8`
  - Both sides refreshed the SAME two lines from the same base: the
    far end re-pointed the proof at the r167-adopt panel, the family
    at the OVE-160 panel. A proof-pointer collision, not a game-code
    collision.
- `evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz`
  (added in remote) — clean add, no conflict.
- `scripts/godpath/occupation-fixtures.json` (merged) — clean,
  result == theirs.
- All three policy files — clean (merged sections, result ==
  theirs, 0 markers; the far end never touched them after the first
  parent).
- No DU entries, no src/js section anywhere in the merge-tree
  output. `ls-tree` at the far end: all five non-corpus family
  files present; the .gz corpus absent (clean addition).

## Policy-mechanics check (re-verified by THIS arm from driver source)

Read `scripts/culpritbisect-driver-20261113.js` and
`scripts/culpritbisect-step.sh` before any sim. Result: CONFIRMED
by reading the driver source (same as the family-5 arm; re-checked
in this tree, legs in scripts/test-transplant5b.js).

- The driver loads the policy from the CHECKED-OUT tree:
  `const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));`
  with `REPO = process.env.REPO || path.join(__dirname, '..')`.
  The step script checks out the subject commit detached, restores
  ONLY the four tooling scratch files from `master` (driver,
  analyzer, masterregress analyzer, vetfirst instrument — none of
  them a policy file), swaps in the fix standing.js, then runs the
  driver with REPO defaulting to the checked-out tree root. So when
  the step checks out the subject, the driver loads the SUBJECT's
  `competent.js` (with the reordered `workGarden`), not master's.
- The driver's leg guard is record-only for policy on LEG=bisect
  (`policySha: null` in the leg config → any policy accepted, its
  sha recorded per seed as `policySha` in every per-seed JSON). The
  guard reads `scripts/policies/competent.js` from REPO at require
  time.
- Second half of the check (on the built subject): the subject's
  `scripts/policies/competent.js` sha256 must differ from the far
  end's exactly by the family diff, and the per-seed `policySha`
  the driver records must match the subject's policy file. Run after
  the subject is built, before judging the step.
- The two nofallback variants ride along as part of the family even
  though the driver loads only `competent.js` — recorded explicitly;
  they were NOT measured and no claim is made about them.

## Transplant prereg (binding; round-2115 §3 + narrowed-5b additions)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as
  the bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end,
  never current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step. Driver mechanics
  reused (`scripts/culpritbisect-step.sh` +
  `scripts/culpritbisect-driver-20261113.js` + analyzer, same as
  the bisect steps); STEP id `t5b-abb3c2db2`. The step script is run
  from a /tmp copy with REPO passed in (the script is absent at the
  far end, so running it from the worktree would unlink it mid-run
  at the detached checkout).
- Subject: the transplant commit = far end + narrowed family diff,
  built on a scratch branch named `transplant-5b-subject` in this
  worktree and LEFT in place (branch kept, hash recorded in the
  evidence file). Never committed to the arm branch. Apply via
  `git cherry-pick -m 1 abb3c2db2`, then resolve ONLY
  `scripts/balance-proof.json` by taking ours (far-end pointer)
  and continue the pick. On ANY other conflict: STOP per the
  narrowed definition above.
- Primary metric: survived/8 on the band. Verdict thresholds:
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list. (A 2/8 re-run on a
    deterministic driver is a stability check, not fresh evidence
    — stated explicitly per the 0015Z coordinator note.)
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is
    4/8, so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant5b.js` (family identity incl. the
  narrowed-tooling grep justification, merge-tree pre-check,
  policy-mechanics check, narrowed subject state, step verdict,
  base restored) plus re-run the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Canon

docs/GARDENS.md covers the garden area and was read. It documents
the standing-caretaker duty, the four-bed policy target, and the
garden controller's harvest/store/eat loop. No canon doc was
invented or rewritten. The family's reorder (appoint before
makePlot) is a policy ordering change inside `scripts/policies/*`;
it touches no canon rule and no game code.
