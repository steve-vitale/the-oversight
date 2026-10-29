# sim-lottery-a — LOTTERY-COMPETITION URGENCY LEVER: NO-GO (pilot, departures leg fails)

Run: flesh-out loop, run fleshout-20261029T0715Z (adoption run).
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-lottery-a (adopted from the dead run fleshout-20261029T0415Z).
Assignment: LOTTERY-COMPETITION lever, ranked next step #1 from
sim-funnel-a. One lever, judged on the funnel band, pilot seeds
75101-75108, 180d death-aware, tableseat-nowait substrate.
Preregistration (binding, committed BEFORE any judged row existed
on the 0415Z run): evidence/2026-10-29/sim-lottery-a-prereg.md
(commit 5e866d7c1 on branch sim-lottery-a; landed verbatim with
this evidence). This evidence file judges the lever against that
prereg. No metric was changed mid-run.

VERDICT: NO-GO — the pilot fails its departures leg, so no confirm
is run and the lever is KILLED. No game-code change lands from
this arm. What lands is measurement only: this evidence, the
prereg, the analyzer (scripts/test-lottery-a.js, pure reads), and
both pilot corpora. The lever commit (056fbc59e, src/js +
fixtures) is NOT merged; its branch is deleted. The fixtures
script (which asserts lever behavior) is NOT landed with it.

## Plain words first

Nineteen villagers survived a wave-4 fight in the funnel band and
then never went back, because dinner and thirst beat the hunt
offer almost every time. This arm tried the narrowest honest fix:
make the hunt shout louder as the memory ages, and on the last
fresh day, let the villager go back for the beast instead of
eating first. The pick-level trick works — the one villager who
got the offer on the armed band took the hunt twice, once on the
weight curve and once on the last-day direct take. But the hunt
never left the village. He picked it, picked it again, and then
water errands took over; the beast was never re-met. And the
bigger story is that the armed villages barely produced any
wave-4 survivor stories at all: the lever touches every fight
memory, not just wave-4 ones, so it reroutes whole villages from
the first animal fight onward, and the funnel band's ten survivor
triples collapse to three. A lever that changes who even gets to
wave 4 cannot be judged by a take rate on the triples that
survive it. The binding break has moved: it is no longer the
lottery pick, it is pick-to-departure — a picked hunt that never
departs. That is the next blank, not a stronger lottery weight.

## Header (pre-registered) vs result

Pilot seeds 75101-75108, tableseat-nowait, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1, FUNNEL=1, 180d
death-aware. Judged baseline = fresh base-code sweep on identical
seeds (worktree sim-lottery-base, prereg-era game code — see
"Clean baseline" below). Arm = lever code (branch sim-lottery-a).

- GO LEG 1 — take rate >= 25% on the pilot band: RESULT arm
  2/3 = 66.7% vs baseline 2/26 = 7.7% -> PASS ON THE NUMBER,
  NOT COMPARABLE (see denominator note below). The pass is
  reported, not celebrated: the denominator collapsed from 26
  offered picks to 3, on a different triple set.
- GO LEG 2 — triple-window wave-4 HUNT departures >= 3 on the
  pilot band (baseline 1): RESULT arm 0 -> FAIL.
- GO LEG 3 — determinism: the base-code pilot sweep reproduces
  the predecessor pilot rows' judged channels exactly:
  RESULT PASS (analyzer: DETERMINISM vs reference: PASS,
  detDiffs empty; fieldparty/returns channels deep-equal per
  seed, judgedA 24, wall fields as below).
- OVERALL: GO requires ALL legs -> NO-GO. No confirm (seeds
  75101-75116) is run. A miss is NO-GO per MEASUREMENT.md §14;
  nothing is re-scored against a friendlier metric.

## Before / after (pilot band, identical seeds)

| metric | baseline (base code) | arm (lever) |
|---|---|---|
| survivor triples | 10 | 3 |
| judgedA meetings | 24 | 5 |
| offered picks (triple-window) | 26 | 3 |
| HUNT takes (triple-window) | 2 | 2 |
| take rate | 7.7% | 66.7% |
| triple-window W4 HUNT departures | 1 (pick-linked 1) | 0 (pick-linked 0) |
| corpus-wide W4 HUNT departures | 1 | 0 |
| corpus-wide W4 HUNT true drops | 1 | 0 |
| funnel picks recorded (corpus) | 92 | 20 |
| wins (full seat) | 3 (0) | 5 (0) |
| national ever / final | 7 / 6 | 7 / 7 |
| table / entered | 4 / 3 | 5 / 5 |
| wave-4 reach / wave-5 reach | 6 / 0 | 5 / 0 |
| median survival days | 146 | 119 |
| starvation deaths | 1 | 1 |
| death total | 286 | 248 |

Guards (reported, not re-scored into GO; a guard miss on
starvation or survival blocks landing even on a pass):
- STARVATION: arm 1 <= baseline 1 -> holds.
- MEDIAN SURVIVAL: arm 119 >= baseline 146 - 30 = 116 -> holds,
  barely (-27 days).
- DEATH TOTAL: arm 248 vs baseline 286, no concentration in
  villager monster/combat deaths attributable to the lever
  (villager combat 110 -> 91, villager monster 14 -> 11).
- SENSE BAR: >= 1 full triple trace quoted verbatim from the
  ARM corpus -> PASS (nikos trace below), with a sense judgment
  that cuts against the lever (see "Sense review").
- NEUTRALITY OF THE BASE SWEEP: base corpus returns channels
  equal the predecessor pilot rows exactly (GO leg 3). The arm
  corpus is EXPECTED to differ; only the base corpus must
  reproduce.

Baseline triples (10): 6 LOTTERY-LOST, 1 PICKED-NEVER-DEPARTED,
1 DEPARTED-EMPTY-TILE, 1 GATE-BLOCKED-AT-PICK, 1 DIED-BEFORE-
PICK. The two baseline takes are both age-3 picks on seed
75106 (visjoin_113, visjoin_115, both d135, huntDay 132) — one
superseded by an EAT pick the same day, one departed d137 and
dropped on an empty tile. The baseline reproduces the prereg
calibration exactly (2/26, departures 1).
Arm triples (3): 2 GATE-BLOCKED-AT-PICK (both seed 75101,
OUT-OF-RANGE, candidate null — the fight tile lay outside the
villager's roaming range, so no hunt could ever be offered),
1 PICKED-NEVER-DEPARTED (nikos, seed 75104, below). No arm
triple ever departed, on any seed.

## Sense review (arm corpus, verbatim trace)

Analyzer --sense, triple s75104 nikos_papadopoulos / eulogy,
anchor d170 (wave-4, field, vFlee):

```
  PICK d171 part=681 chosen=HAVEN_CHORE candidate=eulogy@(3,4)/day170 pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d172 part=685 chosen=HUNT/eulogy candidate=eulogy@(3,4)/day170 pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d173 part=690 chosen=HUNT/eulogy candidate=eulogy@(3,4)/day170 pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d174 part=692 chosen=SEEK candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d174 part=694 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d175 part=696 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d175 part=699 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d176 part=702 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3],["callback",4,3,176,2]] gates={"armed":true,"sheltered":false,"postFleeResting":true,"maxD":1}
  PICK d177 part=706 chosen=HUNT/callback candidate=callback@(4,3)/day176 pre=[["eulogy",3,4,170,3],["callback",4,3,176,2]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d179 part=713 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d180 part=718 chosen=EAT candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d180 part=719 chosen=EAT candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  DEP d174 part=694 WATER  -> (4,5)
  DEP d175 part=697 WATER  -> (3,4)
  DEP d176 part=700 WATER  -> (4,3)
  DEP d177 part=704 WATER  -> (4,5)
  DEP d178 part=708 HUNT callback huntDay=176 -> (4,3)
  DROP d178 part=709 callback dropped=true
  DROP d178 part=710 callback dropped=false
  DROP d178 part=711 callback dropped=false
  DROP d179 part=712 callback dropped=false
```

Judgment: the pick-level mechanism does exactly what the prereg
designed — d172 is the age-2 weight-curve take (weight 8) and
d173 is the age-3 last-day direct take — and that is precisely
why the outcome is a sense failure for the lever's purpose. A
villager who twice decides "go back for the beast" and then
never leaves, while water errands depart four days running and
a different beast's hunt (callback, d178) departs and drops, is
not a villager returning to a fight; he is a villager whose
chosen errand keeps getting replaced before the departure gate
ever fires for it. The analyzer classifies this honestly as
PICKED-NEVER-DEPARTED, superseded by the d173 HUNT re-pick.
The trace also shows the d174+ candidate=null rows: after the
hunt picks, the eulogy candidate stops being offered at pick
time (the memory is still listed in `pre`, but the candidate
resolves null — the villager is no longer in a state where the
hunt is offered, and later picks go to water and food). Taking
the pick is not returning; departure is a separate gate and it
never opened for this hunt. Villagers otherwise read like
people in both corpora: needs win picks (EAT/WATER) for
understandable reasons, and the two arm gate-blocked triples
are range-realistic (a fight tile outside a villager's roaming
range is not a trip they can take).

## Denominator note (read before quoting the 66.7%)

The prereg's 25% bar assumed ~26-28 offered picks on a
comparable triple set (its calibration: direct-take ceiling 5
takes, needing ~2 weight-curve conversions to reach 7 takes).
The arm's 3 offered picks come from 3 triples on trajectories
that diverged from the baseline long before wave 4: the lever
raises HUNT weights for EVERY fight memory (wave-1 animals
included) and takes age-3 hunts directly for every memory, so
armed villages live different lives from day 8 onward and most
baseline survivor stories never form (judgedA meetings 24 -> 5,
funnel picks recorded 92 -> 20). The 66.7% is therefore a rate
over a different, much smaller population, not evidence that
the same villagers now take the hunt. The departures leg,
which counts an outcome rather than a share of a shifting
denominator, is the honest judge here — and it reads 0. This
evidence does NOT claim the lever "works at pick level but
fails at departure" as a general law; it claims the pilot, as
pre-registered, is NO-GO, and that the next measurement must
not reuse take rate over trajectory-dependent triples as its
primary metric (see Metric review).

## Clean baseline (how the judged baseline was rebuilt)

The dead 0415Z run's stranded "base" corpus was CONTAMINATED
and was NOT used for 75103-75106. Proof, in order:
- The lever commit landed 05:57Z in the middle of the dead
  run's base sweep (seed 75102 loaded pre-lever code, finished
  06:00; seeds 75103+ loaded lever code).
- Seeds 75101/75102 in the stranded corpus reproduce the
  predecessor funnel corpus exactly (fieldparty + returns
  meetings deep-equal); seeds 75103-75106 diverge early
  (e.g. 75103: days 125 vs 132, meetings 176 vs 105).
- Between the funnel corpus and the lottery prereg, the only
  src/js change was a version bump, so a clean base sweep
  MUST reproduce the predecessor — and the rebuilt one does.
- The four contaminated rows were quarantined (moved out of
  the corpus dir, not judged, not reused) and the fresh armed
  sweep then reproduced all four BYTE-IDENTICALLY, confirming
  both the contamination diagnosis and arm determinism.
The rebuilt baseline was run in a separate worktree
(sim-lottery-base) pinned to prereg-era game code (src/js,
src/data, index.html checked out from the prereg commit;
sweep/analyzer/harness/policies verified unchanged between
prereg and master), never in the lever tree — the exact
mistake (committing a lever mid-sweep) is not repeated.
Stranded rows 75101/75102 were verified byte-identical to the
rebuilt rows and kept; rows 75103-75108 come from the rebuilt
sweep. The quarantined duplicates were discarded with the
dead branch (they are byte-identical to the armed corpus, so
nothing unique was lost).

## Stale-lock adoption (run mechanics)

This run began as stale-lock recovery: the 0415Z lock's
worktree heartbeat was 06:17Z, 58 minutes stale at the 07:15Z
guard check, so per the loop body the previous run was DEAD
and the lock was deleted. Its claim was retired to .DEAD and
this run's claim (fleshout-20261029T0715Z, axis scale-onramp,
arm sim-lottery-a-finish) was written before any sims. Loop B
was live on food-economy (0630Z claim) throughout and was NOT
touched. The stranded lever + prereg commits were adopted
(lever proof fixtures PASS on the adopted branch, 9/9
assertions), not rewritten. A VM/runtime restart at ~07:27Z
killed both fresh sweeps mid-band (arm 5/8, base 3/8); the
sweep script's resume logic (verified rows are never
re-simulated) recovered both bands without re-running a good
seed. Pre-flight: main tree clean, disk 21%, reap reported
10/16 active trees, none removed.

## Village assessment (what the village looked like)

On the baseline band, villages that reach the table do so
thin: 3 wins in 8, all lesser seats, no full seat, no wave-5
meeting, median survival 146 days, deaths dominated by combat
(190 of 286 villager/player combat-family deaths) with a
single starvation death. On the armed band the wall moves in
the other direction from the lever's intent — 5 wins, 5 table
entries, national final 7/8 — but wave-4 reach falls (6 -> 5)
and no wave-4 hunt ever departs, so the extra wins do not come
from the lever's mechanism; they come from rerouted
trajectories, and the evidence does not attribute them to the
hunt lever. What is missing, in both bands, is the same: a
villager who survives a wave-4 fight, chooses to go back, and
actually arrives. Knowledge and capability gaps are not the
binding story here — the funnel band's villagers are armed and
remember; the gaps are departure (a picked hunt that never
leaves) and arrival (the one baseline departure found an empty
tile). Blank filled by this run: the lottery pick is measured
and closed as the binding break for this band — it is not.
Blank documented, not filled: pick-to-departure and arrival
for deliberate returns (see Findings).

## Metric review (for the NEXT run — never a mid-run re-score)

- (a) Take rate over trajectory-dependent triples is not a
  stable primary metric when the lever changes all-wave hunt
  behavior: the denominator is a consequence of the lever, not
  a fixed population. Next run: judge departures and meetings
  (outcomes) as primary, or judge takes on MATCHED triples
  (same anchor stories), or restrict the lever's scope so
  trajectories stay comparable — and pre-register which.
- (b) The prereg's note (a) stands: "offered" mixes pre-lottery
  EAT bypasses with lottery losses (candidate recomputed after
  the pick). The evidence reports the EAT-chosen share
  alongside the headline rate in the base triples (baseline
  offered picks chosen: EAT 8 of the funnel band's 22 in the
  predecessor analysis; pilot subset offered chosen kinds are
  in the analyzer JSON). A split metric (lottery-only offered
  vs pre-gate bypasses) is still owed.
- (c) The prereg's note (b) stands: triple-window departures
  join by part >= anchor part, not by pick linkage. Pick-linked
  departures are reported alongside (base 1, arm 0); on this
  band they agree with the headline count.
- (d) The prereg's note (c) stands: the age-3 direct take fires
  on the first age-3 pick of the day, which may be an idle
  re-pick rather than the dawn pick. The nikos trace shows
  the d173 re-pick superseding d172 — re-pick supersession is
  now a first-class mechanism to model, not a footnote.
- (e) Lever scope: the lever as built applies to every fight
  memory. A wave-4-only variant would need a wave lookup from
  the memory's monster id (data, not a roster) — a design
  question for the next prereg, not a change made here.

## Findings appended (sim-findings.md)

- Pick-to-departure gap for deliberate returns (this run):
  the only armed wave-4 HUNT takes never departed; departure
  gates / re-pick supersession, not the lottery, now block
  deliberate returns on the funnel band.
- Contamination class (this run): committing a lever mid-sweep
  silently arms later seeds of a "base" corpus; the guard is
  the analyzer's determinism leg, which caught it here only
  because the predecessor corpus existed. Future base sweeps
  must run in a lever-free tree, never the lever tree.

## Reproducibility

- Analyzer: scripts/test-lottery-a.js (landed with this
  evidence; pure reads). Base: EVID=<perseed-lottery-base>
  REF_EVID=<perseed-funnel-a> SEEDS=75101..75108 ->
  DETERMINISM PASS, 2/26, departures 1. Arm:
  EVID=<perseed-lottery-arm> SEEDS=75101..75108 -> 2/3,
  departures 0. Analyzer JSON outputs landed as
  lottery-a-base-analysis.json / lottery-a-arm-analysis.json.
- Corpora landed: evidence/2026-10-29/perseed-lottery-base/
  (8 rows + summary.json) and perseed-lottery-arm/ (8 rows +
  summary.json). Sweep script reused verbatim:
  scripts/test-funnel-a-sweep.js with SEEDS + EVID overrides.
- Lever proof (adopted branch, before the kill decision):
  node scripts/test-lottery-a-fixtures.js -> PASS (9/9:
  weights 2/5/8, age-3 direct under hunger+thirst, age-0
  lottery not forced, homebody exclusion preserved). The
  fixtures script is NOT landed: it asserts lever behavior
  that is reverted, so landing it would leave a failing proof
  on master. The lever code itself is NOT landed.
- No confirm sweep was run (pilot NO-GO). No panel compare
  is attached: the balanced panel compares before/after on
  identical seeds, and the arm's triple population is not
  comparable (see Denominator note); attaching a panel
  verdict on the collapsed denominator would over-claim.
  The telemetry deviation check is run by the coordinator
  closeout (see below); the WINSEAT baseline regime note
  forbids comparing this pre-seat substrate against it, so
  LOUD lines there are expected regime artifacts.

## Landing (coordinator closeout)

Evidence-only landing: branch sim-lottery-evidence from
current master, containing ONLY this evidence, the prereg,
the analyzer, and both corpora. Zero src/js changes in the
landing commit (verified by diff stat before merge). Merged
--ff-only to local master, pending ship (the ship loop owns
bumps, pushes, live verification). Lever branch sim-lottery-a
and base worktree sim-lottery-base are deleted, not merged.
Main tree verified clean at closeout; lock + claim deleted.
Telemetry deviation check: run against the scale-wall WINSEAT
baseline; LOUD lines, if any, are regime artifacts per the
baseline's own _regime note (pre-seat substrate vs winseat
baseline) and the baseline is NOT rolled.
