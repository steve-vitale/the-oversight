# H1 transplant — family 5: PR #120 garden-measurement-0315, FIRST POLICY family (arm sim-transplant5-a)

Run: fleshout-20261114T0015Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 5 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant5-a` (worktree `~/workspace/worktrees/sim-transplant5-a`).
Prereg written and committed BEFORE any judged sim.
Canon: docs/CANON.md read first; the garden area is covered by docs/GARDENS.md
(read — see §Canon below). This arm measures a POLICY family; no game code
is touched by the family itself (js=0), so no canon invention is involved.

## The question

Family 5 is the FIRST POLICY family in the H1 transplant program: merge
`abb3c2db2` "Merge pull request #120 from steve-vitale/cursor/ove-160-garden-measurement-0315"
— the garden-keeper appointment reorder (appoint the standing caretaker
BEFORE making beds, while residents are still at Haven) in all three
competent-policy variants. Does this policy reorder alone collapse the far
end (GOOD 4/8) toward the merge's 1/8?

## Family identity (verified at run start, before any sim)

- First parent `da153118c` (PR #119 merge, phone-refresh); second parent
  `91cb6fa20` ("OVE-160: restore garden caretaker appointment; refresh
  measurement proofs"). Second-parent side is 1 commit.
- `git diff --stat abb3c2db2^1 abb3c2db2`: 6 files, +35/−12.
  `src/js`: 0 files — js=0. `scripts/policies`: 3 files — pol=3.
  Table reading (js=0, pol=3) CONFIRMED — matches round-2115 §3 and the
  brief.
- Policy diff (from the diff, not assumed): in each of the three files
  (`scripts/policies/competent.js`,
  `scripts/policies/competent-nofallback.js`,
  `scripts/policies/competent-nofallback-socialD.js`) the SAME 11-line
  change inside `workGarden` (+8/−3 per file): the garden-keeper
  appointment block moves BEFORE the `makePlot` loop (appoint while
  residents are still at Haven; previously plots first, then appoint).
  The moved block is byte-identical in all three files, including the
  4-line comment ("Appoint while residents are still at Haven. makePlot
  ticks move the rest of the roster off-tile; gardenKeeperReady then
  empties and the standing caretaker is never reserved. DUTY already
  honors an appointed gardenKeeper, so appointing first keeps them
  present through bed prep.").
- Other family files (non-policy, non-game): 
  - `evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz`
    (added, 103,076 bytes) — the OVE-160 measurement panel corpus.
  - `scripts/balance-proof.json` (+2/−2: `panel` + `panelDigest` lines
    re-pointed from the OVE-84 scout-duty panel to the OVE-160 panel).
  - `scripts/godpath/occupation-fixtures.json` (+9/−1, reformatted +
    seeds refreshed for OVE-160: absent 2008→3001, npc-only 4058→3004,
    alternateOccupation rail_conductor→arborist; played seed 3122 and
    roster hash unchanged).
- `standing.js` NOT in the family diff: the subject's native standing.js
  would be the far-end one (sha256 `75762cb2…`, same as the bisect
  prereg), so the standing-fix swap mechanics are exactly as in the
  bisect prereg.
- Far-end policy sha: `a7ff5c516440` (scripts/policies/competent.js at
  203a32775 — the same far-end policy sha the 2b arm recorded).
  Merge policy sha: `26a87e493578` (competent.js at abb3c2db2). The
  first parent's competent.js is also `a7ff5c516440`, so the family's
  policy change is cleanly the diff (no far-end-side policy drift).
  Nofallback shas: far `6919e8d36a9b` → merge `a27d7396f09a`;
  socialD far `01d931a76205` → merge `2ad0f2bce389`.

## Policy-mechanics check (required BEFORE any judged sim — first policy family)

Read `scripts/culpritbisect-driver-20261113.js` and
`scripts/culpritbisect-step.sh` before any sim. Result: CONFIRMED by
reading the driver source.

- The driver loads the policy from the CHECKED-OUT tree:
  `const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));`
  with `REPO = process.env.REPO || path.join(__dirname, '..')`.
  The step script checks out the subject commit detached, restores ONLY
  the four tooling scratch files from `master` (driver, analyzer,
  masterregress analyzer, vetfirst instrument — none of them a policy
  file), swaps in the fix standing.js, then runs the driver with REPO
  defaulting to the checked-out tree root. So when the step checks out
  the subject, the driver loads the SUBJECT's `competent.js` (with the
  reordered `workGarden`), not master's.
- The driver's leg guard is record-only for policy on LEG=bisect
  (`policySha: null` in the leg config → any policy accepted, its sha
  recorded per seed as `policySha` in every per-seed JSON). The guard
  reads `scripts/policies/competent.js` from REPO at require time.
- Second half of the check (on the built subject): the subject's
  `scripts/policies/competent.js` sha256 must differ from the far end's
  exactly by the family diff, and the per-seed `policySha` the driver
  records must match the subject's policy file. **NOT RUN — no subject
  exists** (see §Cherry-pick conflict below); the first half (driver
  mechanics, read from source) stands confirmed, the second half is
  void because the family was never built.
- The two nofallback variants ride along as part of the family even
  though the driver loads only `competent.js` — recorded explicitly;
  they were NOT measured and no claim is made about them. If a future
  narrowed re-run builds a subject, the same check must be re-run on
  that subject before judging it.

## Transplant prereg (binding; round-2115 §3 + family-5 additions)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t5-abb3c2db2`.
  The step script is run from a /tmp copy with REPO passed in (the
  script is absent at the far end, so running it from the worktree
  would unlink it mid-run at the detached checkout).
- Subject: the transplant commit = far end + family diff, built on a
  scratch branch named `transplant-5-subject` in this worktree and LEFT
  in place (branch kept, hash recorded below). Never committed to the
  arm branch. Apply via `git cherry-pick -m 1 abb3c2db2`. Merge-tree
  pre-check uses the merge's FIRST PARENT as its base (2215Z method
  correction). On ANY conflict: STOP, report the conflict, do NOT
  hand-resolve game code. ONE exception (coordinator decision,
  family-2b precedent): a conflict in ONLY `scripts/green-list.txt`
  may be resolved by union — but ONLY after verifying that only
  `scripts/check.js` reads green-list.txt and zero src/js files do.
  Any other conflicted file: STOP, and the deliverable is the conflict
  report + UNMEASURED verdict.
- Primary metric: survived/8 on the band. Verdict thresholds:
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list.
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is
    4/8, so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution. No cost guard — measurement arm;
  nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant5.js` (family identity incl. the
  policy-mechanics check, conflict reproduction, subject state,
  verdict mapping, base restored) plus re-run the reused
  `scripts/test-culpritbisect-a.js` (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree da153118c 203a32775 abb3c2db2` (base = first parent,
per the 2215Z method correction) predicts EXACTLY ONE content-conflicted
file — `scripts/balance-proof.json`, 3 markers (`+<<<<<<<`, `+=======`,
`+>>>>>>>` by the transplant118 counting method) — and the other
family files merge cleanly:

- `scripts/balance-proof.json` (changed in both, hunk `@@ -1,7 +1,12 @@`):
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
  - Both sides refreshed the SAME two lines from the same base: the far
    end re-pointed the proof at the r167-adopt panel, the family at the
    OVE-160 panel. A proof-pointer collision, not a game-code collision.
- `evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz`
  (added in remote) — clean add, no conflict.
- `scripts/godpath/occupation-fixtures.json` (merged) — clean.
- All three policy files — clean (no 'changed in both' section for any
  of them; the far end never touched them after the first parent).

## Cherry-pick conflict — STOP (filled after the live pick)

**VERDICT: UNMEASURED (conflict-STOP).**

Live `git cherry-pick -m 1 abb3c2db2` onto the far end (subject branch
`transplant-5-subject`, cut at 203a32775) conflicted in exactly ONE
file, as the merge-tree pre-check predicted:

- UU — `scripts/balance-proof.json`, one hunk (lines 4–5, the
  `panel`/`panelDigest` pair). No other file conflicted; the other 5
  family files staged cleanly (the 3 policy files, the .gz panel
  corpus, occupation-fixtures.json).
- The conflict is NOT in `scripts/green-list.txt`, so the coordinator's
  union exception does NOT apply. Per the binding prereg: STOP, do NOT
  hand-resolve. The pick was aborted (`git cherry-pick --abort`);
  no subject commit exists, no step ran, no survival number was
  measured.
- Subject branch `transplant-5-subject` LEFT at the far end
  (`203a327750a223e0a1465dc51f5409787efdfaae`, no subject commit).
- Subject commit: NONE.

Readers of `scripts/balance-proof.json` (verified by grep, for the
coordinator's narrowing decision — recorded, NOT acted on): the file
is read/written only by measurement/proof tooling —
`scripts/balance-proof-update.js` (writes it),
`scripts/godpath/test-measurement-comparison.js`,
`scripts/godpath/test-measurement-proof-update.js`,
`scripts/godpath/test-measurement-workflow.js`,
`scripts/godpath/test-panel-contract-rulings.js`,
`scripts/test-proofrefresh-b*.js`. ZERO readers in `src/` — no game
code reads it at runtime. Resolving the conflict either way (ours =
keep the far end's r167-adopt pointer; theirs = take the family's
OVE-160 pointer) would change NO game behavior and NO policy behavior:
the subject's measured game + policy diff would be byte-identical to
the family's either way. Whether that justifies a narrowed re-run
(analogous to the family-2b green-list union) is a COORDINATOR
decision — this arm does not make it, and does not hand-resolve.

## Results (filled after the step)

No step ran. No survival number. Verdict: **UNMEASURED**.

## What this means for the H1 transplant program

Family 5 is the fourth transplant attempt in this program to stop on
divergence (families 1, 2, 3 before it; 2b measured only via the
narrowed union). The pattern is now 4 of 5 families unmeasurable as
written — and family 5's blocker is the lightest yet: a two-line
proof-pointer file with zero game readers, where either resolution
leaves the measured (policy) diff byte-identical. The garden-keeper
reorder itself is a pure policy change with a plausible survival
direction (a standing caretaker actually reserved means real garden
tending through the day instead of an empty appointment) — but the
program still has no number for it. If the coordinator narrows this
family the way 2b was narrowed (take the family's OVE-160 pointer,
or keep the far end's r167 pointer — the choice is a proof-bookkeeping
call, not a game call), the subject builds cleanly and the 8-seed band
can measure it. Until then family 5 stays UNMEASURED, not a carrier
and not exonerated.

## Sense-testing (SENSE-TESTING LAW)

No sim ran, so there is no transcript to sense-test. The family
content itself reads sensibly against docs/GARDENS.md: the caretaker
appointment is a real standing duty ("A standing caretaker consumes
one real daily garden assignment while a living, healthy resident is
available at Haven"), and appointing before bed-prep ticks move the
roster off-tile is the coherent order — the old order (plots first)
could strand the appointment with nobody left at Haven to appoint.
That coherence is a design reading, not a measurement.

## Metric review (§14)

The primary metric (survived/8) was never measured — the run stopped
before any sim, per the binding prereg. No re-score, no threshold
change proposed. The merge-tree pre-check (base = first parent, per
the 2215Z method correction) predicted the live conflict exactly
again — file, hunk, both sides' lines — the third consecutive exact
prediction in this program (families 2, 2b, 5). The policy-mechanics
check is new with this arm (first policy family): the driver-source
half is confirmed; the on-subject half is void without a subject, and
must be re-run before any narrowed re-run is judged.

## Wall numbers

This run's judged corpus: NONE (UNMEASURED — conflict-STOP before any
sim). Reference: far end 203a32775 4/8 (median 150d, wave-5 2/8),
merge e4dbe581b 1/8, on the same seeds 190391–190398, 150d,
competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant5.js`: **(count filled after run)**
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Host write flap: (filled at closeout).
- No telemetry deviation check run: no corpus exists to check — the
  recorder-corpus refusal is N/A (nothing to refuse); baseline NOT
  rolled.
- Closeout: arm branch `sim-transplant5-a` tip (filled at closeout);
  subject branch `transplant-5-subject` LEFT at the far end
  `203a327750a223e0a1465dc51f5409787efdfaae` (no subject commit);
  worktree verified clean at closeout (tracked tree empty, standing.js
  == HEAD, no swap residue — no swap ever ran).

## Canon

docs/GARDENS.md covers the garden area and was read. It documents the
standing-caretaker duty, the four-bed policy target, and the garden
controller's harvest/store/eat loop. No canon doc was invented or
rewritten. The family's reorder (appoint before makePlot) is a policy
ordering change inside `scripts/policies/*`; it touches no canon rule
and no game code.
