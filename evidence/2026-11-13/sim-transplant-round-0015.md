# H1 transplant round — families 4, 5, 6 (run fleshout-20261114T0015Z, Loop A)

Run: fleshout-20261114T0015Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, families 4 + 5 + 6 (follow-up to the
DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE call, evidence/2026-11-13/
sim-scale-onramp-round-2115.md §3, and the 2215Z round's next blank 1).
Loop B live throughout on winnability chain (proofrefresh-b13,
transplant-raid-b, rageloop-b, retribution-b — NOT touched). All three
arms LANDED, merged locally pending ship. No pushes, no version bumps,
no live verification (ship loop owns deploys).

## Prereg (binding, from round-2115 §3 — same for all three arms)

- Base: far end 203a32775 (GOOD 4/8 on the bisect band), roster-check
  standing fix swapped in for every step (fix f8fda4295a99; native
  restored byte-identical, sha-verified). Base is the far end, never
  current master.
- Seeds: 190391–190398. Horizon: 150d death-aware. Policy: competent
  verbatim own-policy per step. Driver mechanics reused
  (scripts/culpritbisect-step.sh + culpritbisect-driver-20261113.js +
  analyzer). Subject on a scratch branch, LEFT in place, never
  committed to the arm branch. Cherry-pick `-m 1 <merge>`; on ANY
  conflict STOP, no hand-resolve of game code. Merge-tree pre-check
  uses the merge's FIRST PARENT as base (2215Z correction).
- Coordinator decision carried into all three briefs (2b precedent):
  a conflict in ONLY scripts/green-list.txt may be resolved by union
  (keep both sides' added test-list lines, no deletions) — but ONLY
  after verifying that only scripts/check.js reads green-list.txt and
  zero src/js files do.
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id, 2/8 again → AMBIGUOUS (NOT-CARRIER for
  ordering, kept on suspect list); ≥3/8 NOT-CARRIER.
- Telemetry: recorder-corpus class — deviation-check refusal recorded,
  baseline never rolled (see §Telemetry).

## Arm 1 — family 4: UNMEASURED (conflict-STOP)

Branch sim-transplant4-a, LANDED 0c223e4ac (worker tip e20194789,
rebased onto ae515c0ff; proof re-run green on rebased branch).
Evidence: evidence/2026-11-13/sim-transplant4.md.
Proof: scripts/test-transplant4.js 70/70 + test-culpritbisect-a.js
116/116.

Merge c0a85b17e (forager-deed merge, js=3 pol=0 — table reading
CONFIRMED by the worker: person-trust.js +233 new module, godpath.js
+24, bond-initiation.js +7/−6 comment-only; godpaths.json +6; 19
files +875/−10). First parent c15b8c56c, second parent fbb9c53ed
(PR #4 person-trust-map); second-parent side is 4 commits carrying
both sub-families (person-trust + brawler deed). No canon doc covers
person-trust standalone (noted in evidence).

Merge-tree pre-check (base = first parent) predicted exactly 3
conflicts; the live cherry-pick reproduced them exactly, same files,
same hunks, 3 markers each:
1. scripts/balance-proof.json (live lines 3–9): ours = r167 panel,
   theirs = person-trust panel.
2. scripts/godpath/validate.js (live lines 91–103): ours = 8-event
   single-line check; theirs = 10 events (+harvest_fed,
   outmatched_kill) + okDays check.
3. scripts/green-list.txt (live lines 916–921): ours = pellet-boost
   + pellet-q4; theirs = person-trust (1 line).
All other 16 family files staged cleanly, including all 3 src/js
files. The green-list union exception does not apply (not alone),
and the prereg does not authorize choosing which panel pointer or
event list the subject carries. Pick aborted. No subject, no sim, no
survival number. Subject branch transplant-4-subject left at the far
end (no subject commit).

Test lesson (in arm evidence, carried here): `git merge-tree`
emits two clean-merge section kinds (`changed in both` vs `merged`
with result/our lines only); a parser tracking only the first
silently drops `merged` files — this arm's stage-1 proof initially
missed bond-initiation.js that way and was fixed before commit. The
2b test's parser shares the blind spot (harmless there; future arms
reusing it should carry the fix). Filed in sim-findings.md.

## Arm 2 — family 5: UNMEASURED (conflict-STOP)

Branch sim-transplant5-a, LANDED e53616187 (worker tip 316bf1abb,
rebased onto 0c223e4ac; proof re-run green on rebased branch).
Evidence: evidence/2026-11-13/sim-transplant5.md.
Proof: scripts/test-transplant5.js 54/54 + test-culpritbisect-a.js
116/116.

Merge abb3c2db2 (PR #120 garden-measurement-0315, pol=3 js=0 —
table reading CONFIRMED). First parent da153118c, second parent
91cb6fa20 (single commit, "OVE-160: restore garden caretaker
appointment"). Each of competent.js, competent-nofallback.js,
competent-nofallback-socialD.js carries the SAME 11-line change in
workGarden: the garden-keeper appointment block moves BEFORE the
makePlot loop. Plus the OVE-160 panel corpus (.gz), balance-proof.json
(+2/−2 re-pointer), occupation-fixtures.json (+9/−1). No src/js file
touched. Far-end policy sha a7ff5c51 (same as 2b recorded); merge
policy sha 26a87e49; first-parent policy == far-end policy.

Policy-mechanics check CONFIRMED (driver source): the driver
requires competent.js REPO-relative from the checked-out tree, and
the step script restores only the 4 tooling scratch files (no policy
file) before running it — so on a subject checkout it loads the
SUBJECT's reordered policy, with policySha recorded per seed
(record-only guard). The on-subject half is void (no subject
exists). The two nofallback variants ride along unmeasured —
recorded explicitly, not claimed.

Merge-tree pre-check predicted exactly one conflict; the live
cherry-pick reproduced it exactly: UU scripts/balance-proof.json
only (one hunk, the panel/panelDigest pair: ours = far end's
neutral-r167-adopt panel, theirs = family's neutral-ove160 panel).
The other 5 files staged cleanly. The conflict is NOT in
green-list.txt, so the union exception does not apply. Pick aborted
per the binding prereg; no hand-resolve, no subject, no sim, no
survival number. balance-proof.json has ZERO src/ readers (proof
tooling only — verified by grep), so either resolution would leave
the measured policy diff byte-identical. A narrowed re-run is a
coordinator decision — see §Method decision. Subject branch
transplant-5-subject left at the far end (no subject commit).

## Arm 3 — family 6: UNMEASURED (conflict-STOP)

Branch sim-transplant6-a, LANDED 7e3bf8624 (worker tip d9c2c272e,
rebased onto e53616187; proof re-run green on rebased branch).
Evidence: evidence/2026-11-13/sim-transplant6.md.
Proof: scripts/test-transplant6.js 65/65 + test-culpritbisect-a.js
116/116.

Merge f843fab1c (PR #33 dawn-midday-repick-3e68, js=2 — table reading
CONFIRMED: villager-brain.js 48 changed lines, villager-objectives.js
71; plus ONTOLOGY.md, green-list.txt +1, new
scripts/test-dawn-midday-repick.js). First parent 230dba219,
second-parent side 1 commit (713c96f12). Canon read: docs/CANON.md +
docs/VILLAGER-BRAIN.md §5/Seam 9, which covers the target directly.

Cherry-pick reproduced the merge-tree pre-check plus one more
conflict than the prereg's first draft predicted — THREE unmerged
paths:
- UU docs/ONTOLOGY.md — 2 marker blocks (live lines 1977–1995,
  theirs inserts the whole `### villager-brain` section; 2040–2044,
  objectives `Provides:` line).
- UU scripts/green-list.txt — 1 marker block (live lines 803–808;
  ours side empty, theirs adds 3 test lines).
- DU src/js/villager-brain.js — stages 1+3 only; the file is ABSENT
  at the far end (`git ls-tree 203a32775` empty) and PRESENT at the
  first parent (blob 2f99c9e51…): the family-1 missing-substrate wall
  — the family modifies a whole brain module the far end never had.
  The other two files staged cleanly (A test file, M
  villager-objectives.js).

The green-list union exception does not apply (three conflicted
paths, one a game-code file). Per the binding rule: STOP, no
hand-resolution. Pick aborted, tree verified clean. No subject, no
sim, no survival number. Subject branch transplant-6-subject left at
the far end (no subject commit).

Correction owned in evidence: the prereg's first draft misread the
merge-tree output — the godpath `Provides:` hunk merges cleanly
(not a conflict), and `villager-brain.js` "removed in local" was the
DU signal, mislabeled "clean take-theirs". The pre-check contained
the signal; the test now proves it was there. Recommendation carried
forward: next arms must check `ls-tree` existence at the far end
plus zero `removed in local` DU entries for src/js files before
cutting a step.

Proposed, not decided: a narrowed family 6b (villager-objectives.js
hunks alone + green-list union) is mechanically possible and would
isolate the survival-relevant half — needs its own prereg and a
coordinator decision (see §Method decision).

## Wall (this run's judged corpora)

None. All three families UNMEASURED — no sim ran, no survived/8,
no secondaries. The collapse is still unlocated: 5 of 6 transplant
attempts are now unmeasurable as written (families 1, 2, 3, 5, 6);
only narrowed 2b ever measured (AMBIGUOUS 2/8 twice). The two
families whose conflicts sit entirely in scripts/ scaffolding
(4, 5) applied ALL of their game code cleanly — the wall is now
provably a measurement-route problem for those families, not a
game-code divergence problem.

## Metric review

Pre-registered metric (survived/8, thresholds above) judged all
three arms; no re-scoring — all three read UNMEASURED on the
conflict rule, exactly as the prereg defines. The AMBIGUOUS re-run
rule was not exercised (no measured 2/8). The 2215Z metric-review
note stands: a 2/8 re-run on a deterministic driver is a stability
check, not fresh evidence — the next measured arm's prereg should
say so explicitly.

## Method decision (coordinator — answers the 2215Z method question)

The 2215Z method question (sim-findings.md line 2317, now answered
there) asked for a narrowed-family or alternate-base variant as the
standard route if families 4+ also conflicted. They did — and the
pattern splits cleanly:

DECIDED — the NARROWED-TOOLING RULE is now the standard route for
tooling-only conflicts: a transplant family whose cherry-pick
conflicts are confined ENTIRELY to files with zero readers in src/
(verified by grep per file, recorded in the arm's prereg) may be
re-run as a narrowed family: scripts/green-list.txt by union (both
sides' added lines, no deletions, per the 2b precedent);
scripts/balance-proof.json by taking the far-end (ours) pointer —
the driver never reads it and the measured family diff is
byte-identical either way; validator/tooling files
(scripts/godpath/validate.js) by the side that matches the
transplanted code, with the choice justified in the prereg. The
narrowed definition is a NEW family definition, recorded as such,
never a re-judgment. Game-code conflicts (a DU on a src/js file,
a UU in src/js) still STOP — no hand-resolution, no sub-family
split under this rule.

Authorized under this rule as next-run arms (in table order):
narrowed 4b (balance-proof.json ours + validate.js theirs-justified
+ green-list union) and narrowed 5b (balance-proof.json ours).
NOT authorized under this rule: 6b — villager-objectives.js alone
is a sub-family split of game code, not a tooling resolution; it
needs its own prereg and a coordinator decision at that run
(proposed, not decided here).

## Telemetry

N/A — no judged corpora exist (all three arms UNMEASURED, no sims
ran), so there is no per-seed evidence glob to check. The
deviation-check step is recorded as not applicable for this round,
not waived. Baseline NOT rolled.

## Infrastructure

- Host write flap (EPERM errno=1) active at run start: killed
  family-4 registration attempts 1–2 (checkout file-write failures
  across the whole tree; `fatal: Could not reset index file to
  revision 'HEAD'`) before the flap cleared 01:24:58Z (probe A/B/G/H
  back OK) and attempt 3 registered clean. Registry-lock contention
  with the playtest loop's journey-deepening registration queued
  family 4 ~8 min (flock FIFO behind its `git worktree add`).
  Reaper skipped once on the held lock (cron reaper running);
  cron sweep owns dead-tree cleanup.
- Safe-commit index clobber struck worker commits on all three arms
  (staged-deleted / MM variants); repaired each time with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe, verified (status empty, diff HEAD empty,
  hash-object matches). No clobber on coordinator merges.
- Master moved 3 times under the run (102853490, ae515c0ff
  retribution-b adoption [needs-eyes], plus the three arm landings
  themselves); all three branches rebased clean onto the moving tip
  (4 onto ae515c0ff, 5 onto 0c223e4ac, 6 onto e53616187), proofs
  re-run green after every rebase (70/70 + 116/116, 54/54 + 116/116,
  65/65 + 116/116), ff-only merges clean in one call each (HEAD read
  + merge together). No rebase stop-at-pick quirk this run.
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on master from this run (all three arm branches add only
  evidence/*.md + scripts/test-transplant*.js).
- Family-4 worker: two worktree-heartbeat.sh attempts hung (>50s,
  one killed by timeout); registry heartbeat stayed ~25 min stale at
  its closeout — the tree was DONE, not dead. Heartbeats remain slow
  on this repo (restats 90–150s).
- No pushes, no version bumps, no live verification (ship loop owns
  deploys). Reaper NOT run separately at closeout (cron reaper
  sweeps; all three trees released by this run).

## Next blanks, in order

1. Narrowed 4b + 5b under the narrowed-tooling rule (this run's
   decision), then family 7 in table order (23245d5d6 dawn honesty,
   js=2), then families 8–16.
2. Family 6b (objectives-only sub-family) — proposed, needs its own
   prereg + coordinator decision; NOT covered by the narrowed-tooling
   rule.
3. Family 2b AMBIGUOUS stays on the suspect list (NOT-CARRIER for
   ordering). A 2/8 family is a partial contributor, not an
   exoneration — revisit if no full carrier emerges.
4. Proof refresh round 13 (Loop B's item).
5. Headcount-ceiling (Steve-call); Reunion mirror pack in the wild
   (Steve design call).

scale-onramp stays converging (NOT converged): five of six
transplant attempts are unmeasurable as written, no carrier is
identified, and national/table/wins remain 0 on the collapse band —
but the narrowed-tooling rule now gives families 4 and 5 a measured
route, and the wall is located in the measurement route, not in the
families' game code. food-economy stays converging (untouched;
parked). Rotation left at 4 (convergence work does not cycle it).
Claim fleshout-20261114T0015Z deleted at closeout; lock deleted.
