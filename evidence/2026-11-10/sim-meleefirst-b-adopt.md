# sim-meleefirst-b adoption — Loop B 0930Z closeout (stale-lock recovery)

- Run: fleshout-loop-b-20261110T0930Z (Loop B, axis scale-onramp / winnability chain)
- Arm adopted: sim-meleefirst-b, from the dead 0626Z run (lock 06:26Z, ~3h old;
  meleefirst-b tree heartbeat 08:23:57Z, 65 min stale at run start; zero live
  meleefirst processes). Roundcap-b, the 0626Z run's other arm, had already
  landed on master (a6ed956f5). The 0626Z claim was retired to .DEAD.
- Loop A live claim fleshout-20261110T0827Z (wave5kill-a, answermail-a) — NOT
  touched. Orphan trees sim-wideduty-a + sim-sametick-a (food-economy) stay
  deferred — NOT touched. sim-ctraj-b locked + dirty — NOT touched.
- Pre-flight: main tree clean, disk 34%, worktree-reap ran (10/16 active, no
  removals).

## What the dead run left

- Branch sim-meleefirst-b, 2 commits ahead of its base a5d615880: prereg
  86358a49 + fix 36f98c32 (src/js/equipment.js only, 67 lines, +61/−6).
- Uncommitted in the worktree: evidence/2026-11-10/sim-meleefirst-b.md
  (complete except check.js --quick, marked TO FILL) + 32 per-seed JSONs
  in evidence/2026-11-10/perseed-meleefirst-b/ (8 pilot before/after on
  99561–99568, 8 confirm before/after on 99581–99588 — all 32 verified
  present and parseable by this adoption run, 16 before + 16 after).
- Verdict as written by the dead run: GO per its prereg (constructed E1
  volley 30/30 both beasts, E4 damage preserved, wild guard wave-4 kills
  12 = 12 pilot / 26 → 27 pooled, cost bar passes both bands). This
  adoption run judged nothing new: it re-ran the proof, filled the one
  open check, committed the measurement, and landed the branch.

## Adoption steps (this run)

1. Rebased the branch onto explicit current master SHA
   4b284599b8da9685874e3aaf929a784510d2dc67 (journey-scale r126 tip) —
   clean, zero file overlap (master's moves since the base were
   evidence/scripts/sim-harness.js/src/js/alienPlayers.js; the branch
   touches only equipment.js, test-meleefirst-b.js, and its prereg).
   New tips: prereg f94578ee0, fix 2b0296ace.
2. Proof test re-run post-rebase: `node scripts/test-meleefirst-b.js` —
   **64/64 FIXED mode**, all numbers reproduce the dead run exactly
   (E1 volley 30/30, median volley dmg 14 / 26.5; E4 277.5 / 190.5;
   E5 255 / 167).
3. `node scripts/check.js --quick` on the rebased branch: run 1 — 291
   passed, 9 failed in 925s; run 2 (full output captured to
   /tmp/meleefirst-checkquick-2.log) — 292 passed, 8 failed in 864s.
   Attribution (each failure re-run individually against base
   equipment.js): 6 fail identically on the base — measurement-proof
   -update + measurement-workflow (stale neutrality proof, documented
   2026-10-29), mobile-combat-cadence, occupation-panels,
   phone-frame-proof (stale receipts), establishment-r20-fixes
   (racks-full voice gate) — all pre-existing; trust-observer
   -neutrality timed out at 120.1s under three concurrent check.js
   runs and passes solo in 19s on base AND on the fixed code
   (contention artifact); ONE failure was arm-attributable —
   test-foodpower-20261014.js failed on the fixed code (its ontology
   step: the three new helpers lacked (code:) citations) and passed
   on base code. Fixed in adoption commits 69184875c + ee30f22a (see
   below): after the fix, validate-ontology.js passes ("All 135
   systems validated"), foodpower 30/30, proof 64/64, trust 6/6,
   spearxbow still 25/27.
4. Measurement commit (evidence + 32 corpus files) via safe-commit.sh
   in the worktree: `7e73d873d`. The safe-commit index clobber hit
   this commit too (all 33 files staged-as-deleted while
   byte-identical to HEAD); all 33 blobs verified matching HEAD
   before the repair (`git ls-tree HEAD -r ... | git update-index
   --add --index-info`), status clean after.
5. Merge --ff-only into master, ancestor verified: master
   4b284599b → 7e73d873d, 37 files, exit 0. Master had NOT moved
   between the rebase and the merge. Branch released as
   done-merged, worktree removed, branch deleted.
6. Telemetry deviation check: `node scripts/telemetry-check.js
   --baseline .../telemetry-baselines/scale-wall.json --current
   'evidence/2026-11-10/perseed-meleefirst-b/*.json' --metrics
   national,table,wins,exiled` REFUSED — "refusing recorder-corpus
   input: all 32 --current rows carry top-level anchorCommit". Same
   result as the arm evidence records, same as spearvolley-b /
   volleysoft-b. The baseline was NOT reseeded; no investigation item.
7. Balance panel (§15): not run — the panel runs its own full panel and
   takes no corpus input (same precedent as grind-a, finishersize-a,
   adopt-a, vetfinish-b, spearvolley-b, volleysoft-b); the pre-registered
   comparison is the identical-seed corpora + the constructed rates.
   No compare .md fabricated.

## Wall numbers (from the arm evidence, pooled 16 seeds, before → after)

Won 0 → 0, national 0 → 0, table sittings 0 → 0, wave-4 unlock 16/16 →
16/16, wave-5 unlock 3/16 → 4/16, wave-4 kills 26 → 27, wave-5 kills
3 → 3, field wave-4 kills 4 → 4, scholar deaths 154 → 149, median
survival 90d → 88d (pilot 88 → 88, confirm 103 → 94). No win movement
either way; the kill movement is +1 pooled with the mechanism shown
(99583's Herald kill); the survival movement is chaotic divergence
(99583 +23d, 99588 −38d), not a lever effect on the aggregates.

## Village assessment (plain words, from the arm evidence)

Sixteen villages, same seeds, one slot rule changed. Fourteen of them
are unchanged down to the last fight-log line. The rule only bites
where a fighter carries both a spear and a bow, and that shape showed
up clearly in two villages out of sixteen. In one, a fighter's ally
hit hard enough to turn a flee from a Herald into a kill, and that
village lived out the full 150 days instead of dying on day 127. In
the other, a fighter hit harder on day 11, the fight ran two rounds
longer without help, and the village's whole story re-rolled — it died
sooner, but with one more big-beast kill and fewer scholar deaths. The
villages killed one more wave-4 beast between them than before (26 to
27), lost five fewer scholars (154 to 149), and nobody reached national
rank, nobody sat at the table, nobody won — same as before, on both
bands. The chain still binds at wave-4 kills and the climb past
regional. What this run filled in is narrower and exact: the bow's
opening shot now fires for the fighters who carry a bow and a spear,
the spear no longer quietly adds half its strength to every close-in
blow for the fighters who don't, and the damage the common
machete-and-spear fighter deals is untouched.

## Findings backlog

- SPEAR-IN-RANGED-SLOT: CLOSED as fixed by this landing (fallback built,
  proven, measured GO; the one-line fix stays reverted). Backlog line
  updated in hidden_files/sim-findings.md.
- MANUAL-SPEAR-EQUIP (new open, 2026-11-10, from the arm evidence):
  game.js:13510 equips through context-free `slotForItem`, so a player
  manually equipping a spear still gets the ranged slot while auto-equip
  gives melee-when-a-bow-is-carried. Separate arm if Steve wants it.
  (Already filed by the arm evidence; not re-filed here.)
- SPEARXBOW-CORPUS-STALE (carried): test-spearxbow-20261031.js still
  25/27 on this branch (same 2 pre-existing stale-anchor failures as
  the base). This arm does not move it.

## Convergence state

- scale-onramp stays converging (NOT converged): the fallback lands the
  tracker's next blank #1 (melee-first/ranged-fallback slot rule), but
  wins are still 0 everywhere, national still 0 on this corpus, and the
  chain still binds at wave-4 kills / wave-5 kills / the climb past
  regional. food-economy stays converging (untouched).
- Next blanks, in order (from the 0429Z review, unchanged): (1)
  volley-softened finish at W=8 (different lever, own prereg) — gated
  on the two Steve-calls (wound-mill coverage + tail width W); (2)
  flee-repair build (Loop B queue item 2, Steve call — still held,
  branch sim-fleerepair-a); (3) sit-becomes-win (Steve-call); (4)
  sweep table contract question (Steve-call); (5) capstone readiness;
  (6) trial-by-combat staging (Steve-call); (7) Binding-never-fires
  follow-up; (8) gating leg-4 recalibration (decision owed).
- The 0626Z run's roundcap-b arm already landed (a6ed956f5): round-cap
  walk-away is a census, not a build — wild 0 near-dead caps in 1050
  fights; DO NOT BUILD a cap extension.

## Infrastructure notes

- Safe-commit index clobber hit THREE of the four adoption commits
  (citation fix 69184875c: equipment.js MM phantom; ONTOLOGY sync
  ee30f22a: ONTOLOGY.md MM phantom; measurement 7e73d873d: all 33 files
  staged-as-deleted while byte-identical to HEAD). Every commit was
  verified correct before repair (blob hashes match HEAD, worktree
  diff empty); all repaired via the HEAD-blob pipe, status clean
  after each. The dead run's two commits hit the same clobber (recorded
  in the arm evidence).
- Master moved during this adoption (journey-scale r126 landed between
  the first master read at b5f3540d0 and the rebase); the rebase used
  the explicit SHA read immediately before rebasing, per the
  stale-ref-rebase lesson. Master did NOT move between the rebase and
  the merge.
- check.js --quick ran twice under three-way concurrent-check
  contention (Loop A wave5kill-a + journey2-succession checks running
  alongside): 925s and 864s. The trust-observer-neutrality 120s
  timeout in run 2 was contention, not a failure (passes solo in 19s).
- No EPERM flap this run.
- The citation fix (69184875c) was the run's one real catch: the dead
  run's arm failed test-foodpower-20261014.js through its ontology
  step because the three new helpers' rule lines lacked (code:)
  citations. The validator (scripts/validate-ontology.js) also
  rewrote docs/ONTOLOGY.md from the code rules on its run — that sync
  (ee30f22a) is the validator's own output, not a hand edit, and is
  committed with the fix. Lesson for the next arm: any new src/js
  function needs its (code:) citation in the file header's rules
  block, or the ontology validator blocks the release; run
  validate-ontology.js before the measurement commit, not after.
