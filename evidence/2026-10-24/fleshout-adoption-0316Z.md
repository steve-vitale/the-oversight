# flesh-out adoption run 0316Z — axis scale-onramp (2026-10-24)

Run: flesh-out-2026-10-24-0316, loop oversight-flesh-out-loop.
Axis: scale-onramp (standing directive; tracker: converging, NOT converged).
Sibling loop B live-claimed food-economy (fleshout-loop-b-20261024T0129Z.json,
arms sim-bufferdepri-b + sim-homecoming-vol-b) — not touched.

## Stale-lock recovery + adoption
- Lock `flesh-out-2026-10-24-0215` (02:16:04Z) had no registry heartbeat
  match; arm trees' heartbeats 45min stale. Previous run DEAD per protocol.
  Lock deleted, noted here.
- Dead run's claim (fleshout-20261024T0215Z.json, arms sim-bloodrestraint +
  sim-wallseg, axis scale-onramp — correct assignment) retired to .DEAD.
- Both arm worktrees had LIVE orphan worker procs (sweeps running), so per
  the adoption precedent the arms were ADOPTED, not respawned: registry
  run_ids rewritten to this run, heartbeats refreshed, no duplicate workers.
- sim-findings #837 claim line updated to the adoption.
- Claim file: hidden_files/lever-claims/flesh-out-2026-10-24-0316.json
  (deleted at closeout).

## Arm 1 — sim-wallseg (DIAG, instrument-only, zero src/js): DIAG-GO, landed ac8cbe37b
Worker completed independently; coordinator verified, rebased onto master,
proof re-run 20/20 GREEN post-rebase, ff-merged, tree released/removed.
- 24-config census (12 fresh seeds x {leadfeast,belongfeast}, 180d
  death-aware) on the FULL landed substrate (FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1
  VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2).
- DIAG-GO: all 24 configs classified, 0 unexplained. End bindings:
  defer5 14 (veterans 14/14 never-met), unlocked 8, defer4 2, stand-raw 0
  (dip channel held: 22/24 formed, 0/24 dissolved — trustbuffer closed the
  dip leg), plenty-cap 0, w3rung 0.
- Wall: national 20/24, table 22/24, wins 0/24, wave4 22/24, wave5 8/24.
  wave5 8/24 is the highest wave-5 count on any recent scale corpus
  (defer5-rediag had 1/24) — the full substrate (trustbuffer+vetformation)
  moves the door, veterans remain the binding leg.
- Named next: VETCONTACT=1 lever spec for the defer5-veterans bind
  (evidence/2026-10-24/sim-wallseg.md).

## Arm 2 — sim-bloodrestraint (LEVER, game-side): NO-GO pilot, instrument landed db7c5f211
Backlog #837 named next #1 (vetretention-restage): mantle-restraint for
blooded vids — succession skips vids with a wave-4+ kill in the last 14d
(BLOODRESTRAINT=1, default OFF), voiced only when the pick changes.
- 32-config pilot (seeds 65511–65518 x {leadfeast,belongfeast} x
  {control,armed}, 180d death-aware, pinned substrate + VETFORMATION=1).
- PRIMARY (binding): window-mantle-deaths control 1 vs armed 0; bar
  armed <= control-2 -> NO-GO. The bar was unreachable by construction:
  control produced exactly 1 event in 16 configs (the pinned substrate
  formed 11 wave-4 kills vs 13/18 mantle-deaths on the re-stage band).
- Mechanism PROVEN: restraint fired 2x (armed belongfeast-s65513); the one
  control window-mantle-death (elif_demir, d148) became a post-window
  death (d161) where the restraint fired — recorded, not scored (§14).
  Armed-lead byte-identical to control-lead on 8/8 seeds (0 firings ->
  identical trajectories). Guardrails all PASS.
- Sense PASS: "The village looks to Caitlin — but Caitlin is still
  blood-warm from the kill. 'Not the office,' somebody says. 'Not yet.
  Let them come home first.' Jose takes the journal instead." Proof
  27/27 GREEN (E0–E7 incl. OFF-vs-pristine byte check and voicing gates).
- KILL DISCIPLINE: the lever is NOT killed — the miss is base-rate-limited
  (same class as the feastdisc paired confirm), the mechanism is
  deterministic. The worker's commit reverted the hook ("kill record");
  the coordinator RESTORED it (byte-identical, proof re-verified 27/27)
  so it lands as an env-gated instrument for the named-next arm, and
  stripped the two panel .json.gz case caches (never commit). Landing
  commit db7c5f211 carries [needs-eyes] (the voiced beat lands on master
  for the first time).
- The worker died before committing; the coordinator completed the
  evidence write-up from the analyzer output (no content invented —
  all numbers from bloodrestraint-analysis.json).
- Named next: re-run on the formation-rich VETRESTAGE band with a
  formation-conditional primary bar.

## Infrastructure incidents (all LOUD, all recovered)
1. PHANTOM UNMERGED INDEX (new class): two worktrees (sim-bloodrestraint,
   sim-br-verify) developed identical "both modified" unmerged entries on
   7 src/data/*.json files with `<<<<<<< Updated upstream` markers in the
   working files — twice resurrecting after repair (git checkout master
   --, then cat-file + update-index --cacheinfo). Rebase reported success
   both times; the phantom appeared after. Cleared durably via
   `git reset --mixed <tip>` + `git checkout -- src/data/`. NEVER touched:
   branch tips, the main tree, or any other lane's tree (all verified
   clean). Suspect: interaction between `git stash push -- <path>` (the
   proof's E2 gate) and the rebase's leftover AUTO_MERGE state — the
   phantom's stage blobs were byte-identical across both worktrees.
   Recorded for the next run that hits it.
2. SAFE-COMMIT INDEX CLOBBER (staged-deletion variant, 4th sighting):
   after the fix-up commit, the main index showed a bogus staged deletion
   of the 69 added lines (worktree byte-identical to HEAD). Repaired via
   `git update-index --cacheinfo "100644,<HEAD-blob>,<path>"`.
3. Monitor SIGTERM'd at 03:52Z (36min in); replaced with direct polling.
4. Master moved 3x under the arms (loop-B evidence, journey-deepening r39);
   all landings rebased clean in-worktree, proofs re-verified post-rebase.

## Telemetry deviation check
- wallseg corpus: LOUD national 12->20, wins 16->0.
- bloodrestraint corpus: LOUD table 16->26 (n=33 vs 16), wins 16->0.
- Verdict: all REGIME artifacts (WINSEAT full-stack baseline vs
  SEATDRIVE=0 pre-seat corpora; n-mismatches). The national 12->20 move is
  the landed substrate working as measured. Baseline NOT rolled.

## Metric review (§14)
Both arms judged against their pre-registered bars; no re-scoring.
bloodrestraint's bar was substrate-misspecified (assumed >=2 control
events; got 1) — recorded for the next run, not revised mid-run.

## Convergence
scale-onramp stays converging (NOT converged). This run: wallseg closes
the stale wall map (stand-raw leg closed by trustbuffer, veterans leg now
the entire wall with VETCONTACT=1 named); bloodrestraint proves the
restraint mechanism but leaves it unmeasured on a thin substrate. Wins 0
everywhere (structural on SEATDRIVE=0); wave5 8/24 on the full substrate
is the week's best door number.

## Village assessment
Thirty-two paired villages watched the chair: the restraint is a scalpel
that almost never cuts — 16 armed villages held a blooded scholar back
exactly twice. The chair eats veterans in later attritional combat
(post-window deaths 5-0 both arms), not in the 14-day window. The wallseg
census shows the dip leg healed (22/24 formed, 0 dissolved) while the
veterans leg binds 14/14 defer5 configs. The village that said "not yet"
to its blooded killer watched her live 13 days longer. Small mercies,
measured honestly.
