# sim-scale-onramp-round-1315 — coordinator evidence (run fleshout-20261027T1315Z, axis scale-onramp)

Loop B live at closeout on food-economy (trees sim-9954perstack-b +
sim-raidday100-judge-b, NOT touched) -> this run worked scale-onramp
(topmost non-converged axis, not named in any live claim), taking the
1215Z next blank (1): a next seat arm after re-baseline — path diversity
(#917) plus Steve's 2026-10-27 ruling (3) on the full-seat scale gate.
No lock/claim collision at run start (no lock file, no live claims).
Sibling journey social r60 landed mid-run (evidence-only, zero overlap).

## Adoption closeout (no new arm, verified already landed)

The dead 0840Z A run's sim-arrivalsurge-a arm (commit 7e1467c70) was
verified already on master as 91083687f: the evidence file, prereg
file, and proof script are byte-identical between the two commits
(empty diff on all three paths), and 91083687f is an ancestor of
master. No merge was needed and none was made. Its tree was released
as done-merged and its duplicate branch deleted; main tree clean.
The 0840Z run's other arm (sim-w4melt-a, 3e2f8beef) was already an
ancestor of master before this run.

## Arm 1 — sim-defiantdoor-a: the defiant-door walk (GO, pilot + confirm)

Policy-only arm (scripts/policies/tablepaths-defiant.js, modeled on
tablepaths-witness.js, env-gated default OFF, det-gate proves off ==
tableseat-nowait exactly). Door rule: take defiant when offered; else
first non-feared in engine order; else feared flagged fallback-Feared
(excluded from GO). A door never offered is never taken. Beats take
the first option, like tableseat-nowait. Zero src/js. Commit
64554bac6 [needs-eyes] (rebased once onto the scalegate merge; unit
proof ALL PASS post-rebase and on merged master).

Why this arm: doors walked at the lesser seat before this run were
feared, assimilated, relay, witness, beloved. Defiant was the one
remaining lesser door never walked (indispensable needs the full
seat). The 2115Z rotation ASSIGNED defiant but only assimilated/relay
seatings actually happened on that band — assignment is not a walk.

Pre-registration: evidence/2026-10-27/sim-defiantdoor-a-prereg.md.
Primary: defiant entered >= 1 seating AND the scalemetric deciding
cost bar (starvation armed total <= baseline + 2, arm-only <= 2,
median >= 0.8x baseline median). Substrate tableseat-nowait, 180d
death-aware, shared baseline on identical seeds. Pilot 8 seeds,
confirm 12 seeds, reported separately, never blended.

Pilot (seeds 74101-74108): baseline feared 3 entered / 3 won;
armed defiant 2 + beloved 1 (fallback-non-feared) / 3 won. Primary
(a) 2 >= 1 PASS; cost bar PASS (starvation 3 = 3, arm-only 0,
median 121 = 121). G1 det-gate PASS, G2 leak gate PASS (5 comparable
seeds), G3 corpus 16/16 PASS. Death totals identical both arms
(239, identical per-cause map). National ever 6/8, final 5/8 both
arms; wave 4 5/8, wave 5 0/8 both arms. GO (pilot).

Confirm (seeds 74111-74122): baseline feared 7 entered / 7 won;
armed defiant 7 entered / 7 won, no fallback needed (defiant offered
on every seating). Primary (a) 7 >= 1 PASS; cost bar PASS
(starvation 1 = 1, arm-only 0, median 125 = 125). G2/G3 PASS.
Death totals identical both arms (356). National ever 11/12,
final 9/12 both arms; wave 4 5/12, wave 5 0/12 both arms.
GO (confirm).

Per-seed detail: pilot defiant walks 74104 (seat day 96, defiance 9)
and 74107 (seat day 108, defiance 6), both lesser, both light.
Fallback exercised honestly on 74106 (defiance 3, one short — the
rule fell back to beloved and won light, not a forced door).
Confirm defiant walks 74115/74116/74117/74118/74120/74121/74122
(defiance 7-13), all lesser, all light. Paired rows are IDENTICAL
on every seed except the door walked — the door rule moves WHICH
ending the seat converts to, not scale, not survival.

Prices paid (secondary): every defiant walk, pilot + confirm,
census meters dignity 3 / paid 9 — the maximum-paid light walk
(first-option answers: full-harvest tribute 20,000 kcal, naming
the most-trusted villager for the relay, paying the
de-integration price). Pilot sense seed 74104 names Guadalupe for
the relay. No name is claimed for any other walk (census rows do
not carry the relay-taken name).

Sense read (pilot sense seed 74104, in the arm evidence): the walk
reads as a real refusal with real prices — the village that sits
down can now walk out — not menu-clicking. One open sense note
carried from the arm: fallback-feared was never exercised on a
live seating (0 seatings offered only Feared); that rule arm is
still unit-proof-only.

Verdict: GO. All six lesser doors have now been walked
(feared, beloved, witness, assimilated, defiant, relay).
Indispensable still requires the full seat, which is still 0
everywhere — path diversity at the lesser seat is closed;
path diversity at the full seat is not.

## Arm 2 — sim-scalegate-a: full-seat scale enforcement (GO)

Game-code arm implementing Steve's 2026-10-27 ruling (3) in plain
words: national standing IS required for the full seat —
deedGateReady must enforce scale in ok (previously reported but
not enforced). The change is one term: progression.js
deedGateReady() ok is now `waves && contests && crises &&
stageOk && foodDeeds && scale`, nothing else. Two stale comments
updated minimally to state the ruling (progression.js +
table.js). Lesser seat, wave bars, contests, crises, stage bar,
foodDeeds untouched. The TABLE.md stage >= 3 vs code stage >= 2
discrepancy was NOT touched — recorded as a finding only, never
bundled with this ruling. Commit 234d3a825 [needs-eyes] (prereg
385959835).

Consumer audit (done BEFORE the change, in the arm evidence, no
breaker): tableSeat() falls through to lesser on ok=false
(regional full-bar villages downgrade to lesser — the ruling
itself); checkArc() fires Arc IV on full OR lesser; ledger
tableScene re-check withdraws a stale seat aloud via
tableWithdrawLine, which for a scale-only loss names exactly
"standing too low"; tableEarnedPaths loses only the
indispensable door on downgrade; tablePreview/tableTakeSeat
refuse a none seat; fullseat-diag/indispensable-diag are
read-only reporters that now correctly report ok=false. One
non-production trap flagged, left untouched: the fullseat-diag
TEST's mock fixture still computes old-ok without scale.

Unit proof — GREEN 22/22 (scripts/test-scalegate-a.js, real
loaded Game, rank driven through real scaleRank() flags, no gate
stubbed): village -> ok false / seat none; regional -> ok false /
seat lesser (the downgrade); national -> ok true / seat full;
global -> ok true / seat full. Breakdown reports scale honestly
in all cases; bars-only recomputation stays true in the
village/regional cases, proving the flip is exactly the scale
term. Re-run green by the coordinator on merged master.

Sim no-regression band (seeds 74101-74108, tableseat-nowait
substrate, 180d death-aware, BEFORE leg on unmodified code,
AFTER leg on changed code): 0 differing fields across all 16
per-seed rows. Aggregates identical both sides: won 3/8, lesser
seats 4/8, full seats 0/8, entered 3/8, table ever 4/8, national
ever 6/8, wave-4 5/8, wave-5 0/8, max arc 4, median days 121,
starvation deaths 3. No full seat disappeared (there was none
to lose — wave 5 blocks it everywhere); no lesser-seat or win
regression on any seed. GO per the pre-registered shape
(enforcement proven + zero sim regression).

Required fixture update (loud, in the same commit):
scripts/test-fullseat-superset-20261014.js asserted full at
village rank — it failed 7/8 on the intended assertion before
its fixture fix, now passes 9/9 after setting nationalLive in
the fixture (per repo green-list rule for intentional design
changes). Re-run green by the coordinator on merged master.

Sense read (non-measured replay, seed 74104): audit line
"A lesser seat — global standing, waves 1–3 faced (14/9/4),
10 contests survived, 2 crises weathered. The table does not
rise. It prices." No village told it holds a full seat it no
longer holds; no silent withdrawal fired.

Verdict: GO. The full seat now enforces what TABLE.md already
said it required. Its sim effect is nil today (wave 5 blocks the
full seat everywhere), so this arm's claim is the unit proof +
zero regression, not more full seats.

## Wall (this run's judged corpora)

Pooled armed legs: defiantdoor pilot 8 + confirm 12 +
scalegate 8 = 28 seeds. National ever: pilot 6/8, confirm 11/12,
scalegate 6/8. Entered FULL: 0/28. Wins: pilot 3/8, confirm 7/12,
scalegate 3/8 — all lesser seats, all through default-OFF
courtship + seat instruments. Wave 5: 0/28. Median days:
pilot 121, confirm 125, scalegate 121. The wall moved on path
diversity (all lesser doors walked) and on gate honesty (full
seat enforces scale), but NOT on the full seat itself, NOT on
wave 5, NOT on wins without instruments. scale-onramp stays
converging (NOT converged).

## Telemetry deviation check (all three corpora)

2 LOUD lines each (national 12->0, wins 16->0), the KNOWN
regime + field-shape artifact class: per-seed rows carry
nationalEver/entered/won, not top-level national/wins paths
(actuals above); the WINSEAT baseline's own note forbids this
comparison. No exiled LOUD line. Baseline NOT rolled.

## Balanced panel (§15)

scripts/balance-panel.js has no corpus-ingest mode for these
paired per-seed corpora (confirmed from prior rounds' evidence).
No panel artifact was faked. The judged evidence is the paired
per-seed tables against the pre-registered thresholds; the
threshold is the judge.

## Metric review (mandatory)

- Parallel-band coincidence, disclosed: both arms
  independently picked seeds 74101-74108 as their fresh band
  (chosen concurrently; neither arm consumed the other's
  outputs). No contamination: each arm's baseline is its own
  tableseat-nowait run on identical seeds. Payoff: the two
  baselines replicate EXACTLY (scalegate band = defiantdoor
  pilot baseline on every headline: won 3/8, national ever 6/8,
  entered 3/8, wave-4 5/8, wave-5 0/8, median 121).
- 1955Z numbers were NOT used for judging anywhere this run
  (1215Z staleness finding honored; both arms re-baselined).
- Defiantdoor fallback-feared rule arm remains live-untested
  (unit proof only) — a future seat band where only Feared is
  offered would close it.
- Scalegate fullseat-diag TEST mock fixture still computes
  old-ok without scale (flagged in arm evidence, untouched) —
  a future-reader trap, not a production issue.
- TABLE.md stage >= 3 vs code stage >= 2 for the full seat
  remains an open discrepancy (finding appended to the backlog
  by this run, not changed here).

## Infrastructure

- Safe-commit index clobber hit both workers' commits
  (repaired via HEAD-blob cacheinfo each time, commits
  verified correct); no clobber on the coordinator merges.
  Coordinator re-verified both branch tips + merged master:
  test-scalegate-a 22/22, test-tablepaths-defiant ALL PASS,
  test-fullseat-superset-20261014 9/9, node --check on changed
  files. Merges ff-only in order scalegate -> defiantdoor
  (defiantdoor rebased once cleanly in its own worktree after
  the scalegate merge; no force, no merge commits).
- No EPERM flap blocked this run's writes.
- check.js --quick on merged master: 277 passed / 10 failed in 1074s
  (first run, tail-only capture) and 277 passed / 10 failed in 683s
  (full-capture re-run — same headline, stable, not a flake).
  Failure attribution, each file read, none hidden:
  * ATTRIBUTED TO THIS RUN, FIXED IN THE SAME LANDING: the
    table-sheet-handoff test asserted a full seat from deeds/food/
    integration alone with no national standing — the same missed
    fixture class as the superset test. Coordinator addendum
    588eb4f9 sets nationalLive in that fixture (same class as the
    arm's superset fix); the test now passes 5/5 on merged master.
    A grep for other full-seat assertions (table-core, winpath
    lesser-invite, tablerecon, table-invite) shows all of them
    already pass — they set scale or do not depend on it.
  * OBSERVER-PROOF STALENESS, panel-contract lane's territory (not
    a game regression): measurement-comparison, measurement-proof-
    update, measurement-workflow — all fail on "proof source inputs
    are not current" / retained-neutrality-proof currency. These
    assert proof freshness, not game behavior; any src change
    (including siblings' landings since the last refresh)
    invalidates them. Refreshing them is the panel-contract
    lane's job, not silently done here (contract changes are
    Steve's call). Game-behavior proofs stay green (scalegate
    22/22, superset 9/9, handoff 5/5, defiant ALL PASS).
  * NO PLAUSIBLE LINK TO THE CHANGED LINES (no shared code paths
    with deedGateReady/tableSeat): hide-discovery (counter
    butchering), mobile-combat-cadence (Continue round wrap),
    occupation-panels (CLI workflow), phone-frame-proof (stale
    browser receipts), establishment-r20 racks-full voice gate.
    The parity-gear failure is the documented pre-existing one
    from the 2115Z/2215Z/2315Z runs. The 280/7 standing profile
    dates from 2026-10-24 bases and is stale after days of
    sibling landings, so the 277/10 headline is reported, not
    judged against it. The one failure this run owned is fixed
    above; the rest are carried as pre-existing / lane-owned,
    not claimed green.
- Sibling B live at closeout (food-economy trees, untouched);
  sibling journey social r60 landed mid-run (evidence-only,
  zero overlap). Rotation left at 3 (convergence work does not
  cycle it).

scale-onramp stays converging (NOT converged): path diversity
at the lesser seat is now complete and the full-seat scale gate
is enforced, but wins still come only through default-OFF
instruments and the lesser seat, the full seat is still
unreached, and wave 5 is still 0. food-economy stays converging
(untouched; sibling loop B). Claim deleted; lock deleted.
Evidence: evidence/2026-10-27/sim-scale-onramp-round-1315.md
(coordinator) + sim-defiantdoor-a.md + prereg + corpora +
sim-scalegate-a.md + prereg + corpus. Merged locally, pending
ship. Do NOT push, do NOT bump — the ship loop owns deploys.
