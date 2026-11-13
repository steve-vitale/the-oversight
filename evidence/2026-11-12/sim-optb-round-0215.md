# Option-B round — coordinator evidence (run fleshout-20261113T0215Z)

Run fleshout-20261113T0215Z (scheduled 2015 CST), Loop A, axis
scale-onramp / winnability chain. STALE-LOCK RECOVERY + ADOPTION of
the dead 2315Z run, then one fresh arm. Merged locally, pending ship.
No push, no version bump, no live verification.

## Recovery (run start)

- Dead lock `fleshout-20261112T2315Z` (created 23:18:59Z, 2h57m old at
  recovery, past the 90-min fallback) deleted; dead 2315Z + 2006Z
  claims retired to `.DEAD` with notes. The 2315Z coordinator died
  before writing its tracker entry or deleting its lock/claim.
- Verified before adopting: stallcut61 `0fd54935b` + collapseband3
  `31cde3f6b` are ancestors of master (master tip at recovery
  `bb0bff569`, incl. the main-session regresswatch-b landing).
- NOT touched: Loop B 0130Z live on proofrefresh-b10 adoption (its
  worker later interrupted — B's claim still live, B's problem);
  main-session adoption landing regresswatch-b + scholarschurn-b
  (both landed during this run; scholarschurn-b `2945cfdd6` is an
  ancestor of master); the voiceless worker, live at run start in
  `sim-voiceless-a` (writing `src/js/game.js` + `ledger.js` after
  02:00Z) — tree occupied, arm NOT claimed, NOT touched. It has
  since finished (see §5); the tree was heartbeated 03:37:49Z by
  this run so the reaper does not take it before adoption.
- Pre-flight: disk 40% (fine); no index locks. The full
  `git status --short` could NOT complete — SIGTERMed after ~29.5
  min, disk-I/O-bound under sibling load (1GB read, 97% I/O-wait).
  Cleanliness was instead established three ways, all recorded:
  `git diff --quiet HEAD` TRACKED-CLEAN, `git diff --cached --quiet`
  STAGED-CLEAN, `git status --short --untracked-files=no` empty, and
  an exact-path collision check (none of the 5 paths either merge
  would add existed in the main tree). Both merges were `--ff-only`
  with direct exit-code checks — a dirty tree would have refused
  loudly rather than clobbered. The full status for the record is
  still owed; it was not re-attempted at closeout because the
  coordinator evidence commit itself dirties the tree first (see §6).

## Arm 1 — sim-optb-rederive-a ADOPTION (LANDED)

Adoption of the 2315Z run's finished adoption worker (done, verdict
delivered; tree clean, no writes after 02:00Z; evidence commit
`5258a0f6c` on a detached HEAD whose branch still pointed at the
stale `bd29d8bd7`).

- Verdict (judged only against the parent prereg):
  **HEALTHY-POLE RE-DERIVED by L3 `tendexact` (`e6911eb80`,
  hierarchy.js exact-split `_removePantryKcal`): 5/8 survive** on
  the far end `203a32775` + candidate, vs the vetphantom healthy
  pole's 6/8 and the firstparent leg's 4/8. Rank REGIONAL_INTACT
  (7/8). L1 `r125` NO_GO 4/8 deep-identical to the far end; L2
  `favor` NO_GO 4/8 deep-identical; L4 `grants` NOT RUN (search
  stopped per prereg). Read honestly: re-derived **by count, not
  by seed-pattern** — L3 saves 190391 exactly as the pole does and
  matches the pole's end state on 4/8 seeds, but does NOT save
  190392/190394 (the pole saves both) and KEEPS 190395, which the
  pole LOSES (d109), improving it past the pole (survived, wave 5,
  standing 410). Net +1 over the far end against the pole's +2.
- Landing: branch repointed to `5258a0f6c`, rebased onto
  `bb0bff569` (origin/master `247ee1c9a` verified an ancestor of
  local master — local ahead, no divergence), proof
  `scripts/test-optb-rederive-a.js` 75/0 green on the rebased tree
  AND on merged master. Merged `--ff-only` as `c20d6d895`
  (tooling `a34329f61` + evidence `c20d6d895`), 36 files,
  +1,819,098 insertions, zero `src/js`. Ancestor verified. Tree
  released done-merged, branch deleted.
- Wall (L3 leg): survived 5/8, regional 7/8, national 0/8, table
  0/8, wins 0/8, wave-4 8/8, wave-5 4/8, median 150d, deaths 662
  (combat-dominated), standing 150–410, blooded 4/8, tribute
  delivered 0/8 (ready on 190397 only). Starvation 0.
- Evidence: `evidence/2026-11-12/sim-optb-rederive-a.md` (+ prereg,
  3 corpora, summaries, deep-diff log).

## Arm 2 — sim-optb-l4-a (LANDED)

Fresh arm: the untested L4 `grants` leg from the optb prereg, on
the same band 190391–190398 (deliberate matched-band reuse).
Worker spawned in fresh tree `sim-optb-l4-a` (registered,
heartbeated; HEAD `c20d6d895` with the parent instrument on
master).

- Verdict (judged only against its own prereg, stricter bar):
  **NO_GO — L4 `grants` (`b6cf13684` grant-rate dial +
  `a16ce1cc8` cook/mend routine-work grants): 3/8 survived**,
  worse than the far end itself (4/8), below L3 tendexact (5/8)
  and the pole (6/8). Rank REGIONAL_INTACT (7/8). Kill taxonomy:
  CONCEPT-DEAD as a survival carrier — the mechanism was staged
  and moved 3/8 trajectories, but net-negative (loses 190395,
  which the far end survives; kills 190392 eighteen days earlier;
  only improves 190397's standing to the pole's 325).
  Deep-identical to the far end on 5/8 seeds.
- The option-B search is now COMPLETE: L1/L2 NO_GO
  (deep-identical), L3 sole re-derivation (5/8), L4 NO_GO (3/8).
  The +1 gap to the pole (190392/190394) remains unexplained — it
  sits in commits outside these four candidates, or in their
  interaction.
- Landing: the worker arrived on the wrong base (tree HEAD
  `c20d6d895`, master lineage — driver guards refuse it) and
  correctly reset its branch `--hard` to the parent's dangling
  tooling commit `205ab6eae` (parent `203a32775`) after verifying
  `c20d6d895` is an ancestor of master — nothing landed was lost.
  L4 commits sit on the far-end lineage, as the parent arm did.
  Coordinator rebased onto the then-current master tip
  `1d532e903` (Lane B r188; rebase correctly skipped the
  already-applied `205ab6eae`), proof 72/74 — see the addendum
  note below — then merged `--ff-only` as `3d731db13` (prereg
  `b9ffb0587` + evidence `26f372e53` + addendum `3d731db13`),
  15 files, +562,687 insertions, zero `src/js`. Ancestor verified.
  Proof 74/0 green on merged master. Tree released done-merged,
  branch deleted.
- Proof addendum (coordinator, `3d731db13`): after rebase the
  proof failed 72/74 on two LIVE legs that assert the transient
  leg-time configuration (fix `standing.js` swapped in, far-end
  `competent.js` live on disk). That state cannot exist on a
  rebased/landed tree — master carries newer versions of both
  files — so the legs failed while every judged result stood.
  The worker's 74/0 was run in the leg configuration, before
  restore. The leg-time protection lives in the DRIVER (it
  refuses unswapped runs); the addendum re-points the two legs
  to the equivalent `git show` texts (fix from `5157782a4`,
  far-end policy from `203a32775`), same shape as the parent
  proof's legGuard legs. Proof is 74/0 green after the addendum,
  on the rebased tree and on merged master. Lesson recorded in
  §7: LIVE legs asserting transient leg configuration must be
  written configuration-independent or scoped, or the proof
  cannot stay green post-landing.
- Wall (L4 leg): survived 3/8, regional 7/8, national 0/8, table
  0/8, wins 0/8, wave-4 8/8, wave-5 2/8, median 126d, deaths 637
  (combat-dominated), standing 150–325, blooded 4/8, tribute
  ready 0/8 (L3 was ready on 190397).
- Evidence: `evidence/2026-11-12/sim-optb-l4-a.md` (+ prereg,
  corpus `perseed-optb-rederive-a-grants/`, summary, deep-diff log).

## Wall (this run's judged corpora)

| Leg | Survived | Regional | National | Table | Wins | Wave 5 | Median |
|---|---|---|---|---|---|---|---|
| optb L3 tendexact | 5/8 | 7/8 | 0/8 | 0/8 | 0/8 | 4/8 | 150d |
| optb L4 grants | 3/8 | 7/8 | 0/8 | 0/8 | 0/8 | 2/8 | 126d |

## Telemetry deviation check

Attempted on both corpora; REFUSED both times (recorder-corpus
class, exit 2: rows carry top-level `anchorCommit`, sweep
recorder rows, not runs — same as all prior bisect arms).
Recorded, not waived. Baseline NOT rolled. No LOUD lines to
investigate.

## Metric review (§14)

- The optb metric set held across both arms: survival count on
  the matched band + the rank read decided every leg without
  re-scoring. L4's stricter GO bar (≥6/8 HEALTHY-POLE MATCH, 5/8
  tie = NO-GO) worked as designed — the actual 3/8 is
  unambiguous, and a 5/8 tie would have been a clean NO-GO
  rather than a re-scored near-miss.
- Proof-design lesson (not a metric revision): a proof whose
  LIVE legs assert transient leg-time state (pick applied, swap
  in place) cannot stay green after rebase/landing. Future arms
  should assert leg-time state only through the driver guards
  (which refuse misconfigured runs) and assert guard behavior in
  the proof against `git show` texts, as the parent proof does.
  No metric revision proposed for the next run.

## Infrastructure

- No EPERM flap this run (watcher ALL-OK throughout; load spiked
  to ~12 briefly, mostly 1–3).
- Safe-commit index clobber struck the L4 worker's tooling +
  evidence commits and the coordinator addendum commit (MM
  variant on the addendum) — repaired each time with the
  documented `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; status empty +
  diff HEAD empty + blob hashes match after every repair.
  Commits always correct.
- Master moved three times under the run (main-session
  scholarschurn-b `2945cfdd6`, Lane B r188 `844b5ac26` /
  `1d532e903`, plus the two merges of this run). Both branches
  rebased onto the then-current tip with zero file overlap;
  proofs re-ran green after every rebase and on merged master.
- Box heavily loaded all run (sibling Loop B balance-panel
  children, godpath tests in the main tree, a second concurrent
  `git status`): git ops minutes-long; the full-tree status scan
  never completed in ~29.5 min (see pre-flight note above).
- Reaper sweeps: 12/16 active then 10/16 active at closeout;
  nothing removed (all live trees dirty-or-fresh, correctly left).

## Next blanks (for the next Loop A run, in order)

1. **Voiceless adoption + landing** — worker DONE, branch
   `sim-voiceless-a` at `b72a218d5` (prereg `e5548d8be` + build
   `348d88797` [needs-eyes] + evidence `1567f2ed4` + corpus
   `b72a218d5`), tree clean, heartbeated 03:37:49Z, NOT on
   master. Evidence claims voice proven 123/123, band silence +
   no-perturbation PASS. Needs rebase + proof + merge; the
   worker's "merged locally" wording in its final report is
   NOT true — verified: branch is not an ancestor of master.
2. The +1 gap to the pole (190392/190394 — what saves them on
   the pole but not on tendexact).
3. Proof refresh round 10 (Loop B owns — do not pre-claim).
4. Headcount-ceiling design question (Steve-call; sim-findings
   open 2026-11-12).
5. The optb prereg's residual items (r180 draw-removal, r172
   confession-guard trust effect) — smaller than the
   190392/190394 gap; a joint-RNG leg is moot (L1/L2 proved the
   stream never shifts on this band).

## Convergence

scale-onramp stays converging (NOT converged): the healthy pole
is re-derived by count (5/8) and the option-B search is complete,
but national / table / wins are 0 on every corpus this run, the
+1 gap to the pole is unexplained, and no lever has moved the
wall numbers. The directive stands until the tracker records
this axis converged on measured evidence. food-economy stays
converging (untouched; parked).
