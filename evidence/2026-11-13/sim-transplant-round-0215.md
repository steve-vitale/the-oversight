# sim-transplant-round-0215 — narrowed 4b + 5b MEASURED, family 7 UNMEASURED (Loop A, fleshout-20261114T0215Z)

Run: fleshout-20261114T0215Z, axis scale-onramp (converging), H1 transplant
program. Loop B live on winnability chain throughout (0130Z run: retribution
adoption, proofrefresh-b13, rageloop-b completion — NOT touched; B landed its
coordinator evidence 0a3bf0494 mid-run). Master start 62c19318e, end 8ab7a81c8.
This run took the 0015Z run's named next blank (1): narrowed 4b + 5b under
the narrowed-tooling rule, then family 7 in table order. All three arms
landed, merged locally pending ship.

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (far
end 203a32775 + roster-check standing-fix swap f8fda4295a99; seeds
190391–190398, 150d death-aware, competent verbatim own-policy;
≤1/8 CARRIER, 2/8 AMBIGUOUS re-run once, ≥3/8 NOT-CARRIER; subject branch
kept; conflict-STOP on any game-code conflict; telemetry recorder-corpus
refusal). Narrowed-tooling rule: 0015Z coordinator decision (conflicts
confined entirely to zero-src-reader files may be re-run as narrowed
families).

## Arm 1 — narrowed 4b: NOT-CARRIER (measured)

Branch sim-transplant4b-a, LANDED 3186e09ca (worker tip 35a3f07d5, rebased
onto 0a3bf0494; proof re-run green after rebase). Evidence:
evidence/2026-11-13/sim-transplant4b.md. Proof: scripts/test-transplant4b.js
129/129 + test-culpritbisect-a.js 116/116 in the worktree.

Merge c0a85b17e (forager-deed, js=3 pol=0). Live pick reproduced the
merge-tree pre-check exactly (3 tooling conflicts, same hunks; all 3 src/js
files clean, no DU). Narrowed resolutions per the authorized definition:
balance-proof.json OURS, validate.js THEIRS, green-list UNION. Verified:
measured diff (src/js + policies) content-identical to the family diff;
balance-proof subject sha == far-end sha; validate subject sha == merge
sha; green-list == far-end + exactly the person-trust line.
Validate.js justification, grep-verified in the prereg before resolving:
the merge's godpath.js references both events, but the transplanted
godpath.js references outmatched_kill only — harvest_fed enters the merge
via the first parent (x5 there, x0 outmatched_kill; far end has neither).
Theirs is still the matching side: the subject emits outmatched_kill,
which ours rejects, and theirs is a strict superset of ours.

Step t4b-c0a85b17e (10m41s, STEP-EXIT 0): fix swapped in, native restored
sha-verified (75762cb2259d), policy a7ff5c516440. Survived 3/8 (GOOD,
REGIONAL_INTACT, median 132d, errors 0). Per-seed days:
132/120/130/102/150/150/150/93; survivors 190395, 190396, 190397.
Wave-5 5/8 (far end 2/8), wave-4 8/8, regional 8/8, national 0, table 0,
wins 0, deaths 708 (villager combat 271, expedition 179, combat 139, the
wild 80; 83% combat/expedition), standing 199–470, blooded 3/8,
tribute-ready 1/8 (190396 only). Lost villages still had food (190391:
17,225 kcal at 132d) — villages reach further and die fighting.

Sense-testing: narration coherent, named, consequential (veteran kills
called on camera, Blooded voiced). Two diagnostic caveats: scholar
partyMembers empty on both sampled seeds, and the recorder corpus carries
no trust/bond telemetry rows, so the module's bond mechanism is
uncheckable from this measurement — filed in sim-findings.md (survival
verdict unaffected). Subject branch transplant-4b-subject kept at
c054bef81b808c5ecfae8d0c31c96c1bfefb74fa.

## Arm 2 — narrowed 5b: NOT-CARRIER (measured)

Branch sim-transplant5b-a, LANDED 8ab7a81c8 (worker tip ebec3b4b0, rebased
onto 3186e09ca; proof re-run green after rebase). Evidence:
evidence/2026-11-13/sim-transplant5b.md + sim-transplant5b-prereg.md.
Proof: scripts/test-transplant5b.js 89/89 + test-culpritbisect-a.js
116/116 in the worktree.

Merge abb3c2db2 (PR #120 garden-measurement-0315, pol=3 js=0 — first
POLICY family measured). Family identity re-verified by the arm: 6 files
+35/−12, each policy file +8/−3; far-end policy sha a7ff5c516440, merge
policy sha 26a87e493578, first-parent policy == far-end policy. Live
cherry-pick reproduced the merge-tree prediction exactly: only
scripts/balance-proof.json conflicted (one hunk, panel/panelDigest pair);
other 5 files clean, no src/js conflict, no DU. Resolved per the narrowed
definition (ours — far-end r167-adopt pointer). Subject policy diff vs far
end byte-identical to the family diff (cmp clean); subject competent.js
sha == merge policy sha; balance-proof blob == far-end blob; fixtures +
panel corpus blobs == merge blobs; standing.js == far-end native.
Policy-mechanics re-verified: every per-seed JSON records policySha
26a87e493578 (subject policy) with the fix standing swapped in — the
driver demonstrably measured the subject policy.

Step t5b-abb3c2db2: GOOD, survived 4/8, rank REGIONAL_INTACT, median
150d, errors 0. Wave-5 2/8, wave-4 8/8, wins 0, national 0, table 0,
regional 7/8, village 1/8, deaths 647 (villager combat 39%, expedition
24%, combat 19%, the wild 13%), standing 150–525, blooded 2/8, tribute
veterans-short on all 8 seeds (wave-4 veterans 0/8). The count matches
the far end but 3 seeds moved (190392 144d lost→150d survived; 190396
87→82d; 190397 150d survived→123d lost) — the reorder shuffles
individual fates both ways, netting to zero.

Sense-testing: seed 190393 (wave-5 survivor) coherent — scholar
succession (Marco→Jesse→Aroha), named veteran killers, Arc IV at day 56.
Limitation recorded honestly: the bisect corpus does not instrument the
caretaker mechanism (gardenKeeper/caretaker 0 mentions in all 8 files) —
the verdict rests on the survival count alone. Subject branch
transplant-5b-subject kept at c3e2970e85d51d117c94cf97bd0d14933c2b650f.

## Arm 3 — family 7: UNMEASURED (conflict-STOP)

Branch sim-transplant7-a, LANDED 486405e05 (worker tip 9e30a500a, rebased
twice onto bb9e63e7b then ce3e68c0a; proof re-run green after each rebase).
Evidence: evidence/2026-11-13/sim-transplant7.md. Proof:
scripts/test-transplant7.js 72/72 + test-culpritbisect-a.js 116/116 in
the worktree.

Merge 23245d5d6 (PR #30 dawn honesty, OVE-37 port, js=2 pol=0 — table
reading CONFIRMED: villager-brain.js 56+/3−, villager-objectives.js
19+/7−; canon-grounded in docs/VILLAGER-BRAIN.md §4/§5). Merge-tree
pre-check predicted the stop; live pick reproduced it exactly — FOUR
unmerged paths: UU docs/ONTOLOGY.md (1 hunk, theirs inserts the whole
villager-brain section), UU scripts/green-list.txt (1 hunk, theirs adds 2
test lines), DU src/js/villager-brain.js (absent at the far end, present
at the first parent — the missing-substrate wall), DU
scripts/test-villager-brain-dawn.js (same wall, test file). Cleanly
staged: A scripts/test-dawn-materialize-honesty.js, M
src/js/villager-objectives.js (all 5 hunks, 0 markers). Fifth family to
stop on divergence (1, 2, 3, 6 before it); the missing-substrate wall now
extends to the brain module's test file too.

Narrowed 7b: the objectives.js hunks alone auto-merge, so a narrowed 7b
isolating the objPick-side alignment is mechanically possible — but it is
a NEW family definition needing its own prereg and a coordinator
decision, NOT this arm's call. Recorded in evidence. The conflicts are
NOT tooling-only (game-code DU + docs), and the narrowed-tooling rule did
not apply to this arm in any case. Subject branch transplant-7-subject
left at far end 203a32775 (no subject commit).

## Wall (this run's judged corpora)

4b: survived 3/8, wave-5 5/8, median 132d. 5b: survived 4/8, wave-5 2/8,
median 150d. Far end 4/8, wave-5 2/8; merge 1/8. National 0, table 0,
wins 0 on both measured corpora; regional intact on both. The narrowed
families do NOT collapse the far end: 4b lands one step below it (3/8),
5b matches it exactly (4/8). Two of the seven attempted families are now
measured NOT-CARRIER (4b, 5b); one measured AMBIGUOUS (2b, 2/8 twice);
five UNMEASURED (1, 2, 3, 6, 7).

## Metric review

Pre-registered metric (survived/8, thresholds above) judged all three
arms; no re-scoring — 4b and 5b read NOT-CARRIER outright, 7 reads
UNMEASURED on the conflict rule. The 2/8 re-run rule was not exercised.
The 2215Z note stands: a 2/8 re-run on a deterministic driver is a
stability check, not fresh evidence.

Proof-on-master note (new, filed in sim-findings.md): on merged master
the arm proofs read 127/129 (4b), 87/89 (5b), 71/72 (7) — every failing
leg is a branch-identity assertion ("HEAD is on the arm branch"), true
only in the worker tree (129/129, 89/89, 72/72 there) and false on
master by design once the branch is merged and deleted. All measurement
legs pass on master; test-culpritbisect-a.js 116/116 on master. No
verdict depends on those legs. Future arms should mark branch-identity
legs worktree-only (or assert the merged tip instead) so the proof stays
green on master.

## Telemetry

Deviation check REFUSED by the tool itself (recorder-corpus class):
"refusing recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs." Recorded as
the prereg directs; baseline NOT rolled.

## Infrastructure

- Registrations slow: ~41 min for the three trees (4b 02:12:22Z, 5b
  02:26:43Z, 7-a 02:40:36Z). Root cause observed: `git reset --hard`
  inside `git worktree add` churned ~12GB of writes checking out the
  96k-file tree while sibling panels (proofrefresh-b13 balance panel,
  journey panels, rageloop tests) loaded the box — the reset got ~1 min
  of CPU in 10 min elapsed. The trees were progressing, not stuck;
  diagnosed via /proc io counters, not killed. Reaper skipped once on
  the held registry lock (cron reaper running); cron sweep owns dead-tree
  cleanup. No registration was retried; all three registered clean.
- Host write flap window ~02:28–02:30Z per Loop B's run (proofrefresh
  proof run killed; ONTOLOGY.md truncated, restored hash-identical) —
  overlaps this run's registration 2/3 window; no EPERM hit on this
  run's arm writes.
- Safe-commit index clobber struck every worker commit (all three arms)
  — repaired with the documented `git ls-tree -r HEAD | git
  update-index --add --index-info` pipe each time, verified
  (status/diff empty, blobs match). No clobber on coordinator merges.
  First `git cherry-pick --abort` on arm 7 failed ("Entry
  'src/js/villager-objectives.js' not uptodate") — racy index stat;
  `git update-index --refresh` + retry succeeded.
- Master moved 3 times under the run from sibling lanes
  (journey-succession r197 adoption bb9e63e7b + addendum ce3e68c0a, Loop
  B coordinator evidence 0a3bf0494) plus the three arm landings; all
  branches rebased clean (7 twice, 4b once, 5b once), proofs re-run green
  after every rebase; ff-only correctly refused the 7 merge once after a
  master move (exit path, tree stayed clean), then merged clean.
  Rebase stop-at-pick quirk did NOT strike this run.
- check.js --quick NOT re-run: zero src/js, zero green-list files; all
  arm proofs ran green on their merged tips (modulo the branch-identity
  legs above, worktree-only by design).
- No pushes, no version bumps, no live verification (ship loop owns
  deploys). Reaper NOT run separately at closeout (cron reaper sweeps;
  all three trees released by this run).

## Next blanks, in order

1. Family 8 (713eb7545 live-thread-dry-engage, js=2) in table order,
   then families 9–16. (Correction to the 5b worker's note: family 7
   already ran this run — it is UNMEASURED, not next.)
2. Family 6b (objectives-only sub-family) + narrowed 7b
   (objectives-only sub-family) — both proposed, each needs its own
   prereg + coordinator decision; NOT covered by the narrowed-tooling
   rule.
3. Family 2b AMBIGUOUS stays on the suspect list (NOT-CARRIER for
   ordering). A 2/8 family is a partial contributor, not an
   exoneration — revisit if no full carrier emerges.
4. Proof refresh round 14 (Loop B's item, owed on the retribution
   fix's stale key).
5. Headcount-ceiling (Steve-call); Reunion mirror pack in the wild
   (Steve design call).

scale-onramp stays converging (NOT converged): the narrowed-tooling rule
is now validated by measurement — both narrowed families measured
(NOT-CARRIER 3/8 and 4/8) — but no carrier is identified, national /
table / wins remain 0 on the collapse band, and five of seven attempted
families are still unmeasurable as written. food-economy stays converging
(untouched; parked). Rotation left at 4 (convergence work does not cycle
it). Claim fleshout-20261114T0215Z deleted at closeout; lock deleted.
