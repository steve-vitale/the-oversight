# sim-openersurv — reunion-opener cost/benefit on the unlock-capable substrate (flesh-out loop, 2026-10-18)

Axis: scale-onramp (the blocking axis). Run: fleshout-20261018T0515Z (arm sim-openersurv).
Named next from evidence/2026-10-16/sim-fightopen.md (round 2): the reunion opener's
round-1 strike cost flagged a median-survival breach (126.0d vs 144.0d, n=8 — noisy,
flagged honestly). sim-reunioncost (run fleshout-20261018T0415Z) tried to confirm it on
the pre-seat courtship stack and came back INCONCLUSIVE — pool empty (0 reunion
learnings, 0/32 wave-4 unlocks; national 18/32, table 26/32). This arm re-asks the
question where wave-4 unlocks actually happen: the fightopen round-1 named seed set
(975–982, 14/16 wave-4, 2026-10-16) composed with the landed VETREL=1
companion-veteran stack (vetrel, landed 6377a6dc — 18–0 companion w3 kills), on both
sides of the FIGHTOPEN arm. ZERO src/js: the opener code already landed; this arm is
pure composition/policy measurement.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep trajectory)

- SUBSTRATE: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 (explicit, pre-seat) NODEWITNESS=1 VETREL=1. Policies:
  vetrel-lead-court / vetrel-belong-court = withVetrel over tribfloor's
  leadfeast/belongfeast (the TRIBFLOOR floor stays active, VETREL wraps outside).
  ARM: FIGHTOPEN=1 (treatment) vs unset (control), toggled in-process, identical seeds.
- SEEDS: pilot 8 = the named set [975–982] (explicit, not fresh — the brief names them).
  Confirm (if answerable): 12 FRESH seeds, 0 per-seed filename hits across evidence/
  before use.
- PILOT ANSWERABILITY (pre-registered): pooled reunion post-learning field fights >= 6
  across both arms AND wave-4 reached on >= 4/32 runs. Miss -> no confirm, verdict
  INCONCLUSIVE (a confirm would burn 48 runs on an empty pool).
- PRIMARY GATES (GO = the reunion opener's cost/benefit survives on the unlock substrate):
  A. performer-death delta (armed − control) <= +3 — performer death = reunion
     post-learning field fight with outcome 'vDie'.
  B. reunion trick-attributed kills (armed − control) >= +4 — funnel fight cls 'kill'
     (outcome vKill with the trick fired; the fightopen metric-review definition).
  C. conditions-met >= 50% on armed reunion fights — (fires>0)/n.
  MISS on any gate -> KILL per protocol (nothing to delete; evidence+instruments landed).
- SECONDARY (measured, not binding): wave-4/wave-5 reach, national/table, median
  survival, treatment-only death causes, waveKillLog trick-attributed cross-check.
- HORIZON: 180d death-aware (dead villages stop simulating, +10d tail max).
- INSTRUMENT: the execensus capture + classifyLearning, reused wholesale via
  scripts/sweep-openersurv-20261018.js (adapted from sweep-reunioncost-20261018.js;
  only ARM tag + evidence dirs + the vetrel-court policy composition changed).
  Judge: scripts/analyze-openersurv-20261018.js (verdict JSON:
  evidence/2026-10-18/perseed-openersurv/_verdict.json). NOTE: the judge initially
  keyed arms on raw armId ('treatment'/'control') while grouping on 'armed'/'control'
  — caught before any verdict was read; fixed (normalizes treatment->armed). The
  sibling reunioncost judge carries the same latent bug (its INCONCLUSIVE stands on
  the merits — 0 learnings genuinely — but its enrollment loop could never have
  matched; flagged to the coordinator).

## Canon read
- docs/CANON.md: read. "Monster encounters are fought, not rolled" (untouched —
  the opener returns the same action the gate would have returned, same cost parity).
  Human skills ≠ alien abilities (untouched). No silent actions (every opener is
  narrated in the fight record). "If you don't know, it doesn't show" (untouched —
  opener only fires on knownSig).
- docs/MONSTER-WAVES.md: read. The Reunion (wave 4, The Mirror Draft): "the village
  you failed, given teeth — knows every tactic you've used; novelty is the weapon."
  The opener (round-1 wait:reunion-novel) is the engine's honest form of that canon.

## Results

COMPLETION: 32/32 pilot runs complete (8 seeds x {vetrel-lead-court, vetrel-belong-court}
x {treatment, control}); 0 instrument errors. Sweep: scripts/sweep-openersurv-20261018.js;
judge: scripts/analyze-openersurv-20261018.js.

| metric | armed (FIGHTOPEN=1) | control (flag unset) |
|---|---|---|
| runs | 16 | 16 |
| reunion witness-learnings | 0 | 0 |
| pooled reunion post-learning field fights | 0 | 0 |
| wave-4 / wave-5 reached | 3/16 | 3/16 |
| national / table / won | 11/16 / 10/16 / 0 | 11/16 / 10/16 / 0 |
| median / max survival | 180.0d / 180d | 180.0d / 180d |
| treatment-only death causes | none | — |

**PRIMARY: INCONCLUSIVE (answerability gate not met).** Pooled reunion fights 0 < 6;
wave-4 runs 6 >= 4 (the unlock half of the gate passed — s976-belong, s978-belong,
s982-lead, both arms each). Per §14 this is reported as measured, never re-scored —
the survival-cost question stands open, not answered. No confirm was run (pre-registered).

**The substrate moved under the question — twice.**

1. THE NAMED SET DRIFTED. The brief's premise was "the fightopen round-1 seed set
   (975–982, 14/16 wave-4, 2026-10-16)". On current master the PURE round-1 substrate
   (tribfloor leadfeast/belongfeast, FIGHTOPEN=1, no VETREL) gives 0/5 wave-4 on the
   named seeds: s975 d100/wave-3 (round-1: d180/wave-5), s976 d180/wave-3 x2 policies,
   s977 d180/wave-3 x2 policies — 0 learnings, 0 reunion fights. Diagnostic runs in
   /tmp/openersurv-diag{,2}/ (reunioncost sweep script, exact round-1 env). The unlock
   collapse is master drift between 2026-10-16 and 2026-10-18, not seed luck and not
   the vetrel composition. Filed to sim-findings (above); corroborates the 2026-10-18
   reunioncost finding (0/32 on fresh seeds 987–990).
2. VETREL PARTIALLY RESTORES UNLOCKS but not the channel. The vetrel composition got
   6/32 wave-4 (vs 0/5 pure-substrate diagnostics and 0/32 reunioncost) — the
   companion-veteran stack does move the readiness bar, both arms equally. But the
   witness-learning channel stayed dead: 4 node-witness reports total across 32 runs
   (reunion x2, buffering x2), 0 learnings, 0 trickTally reunion entries, 0 reunion
   beats. The opener never fired anywhere — not because the gate is broken (fightopen
   round-2 proved it fires 7/7 when the trick is known) but because the trick is never
   learned. The funnel is not half-open; it is empty.

**GUARDRAILS:** vacuously satisfied on the gates (no pool); no treatment-only death
causes; national/table identical across arms (11/11, 10/10 — FIGHTOPEN is
post-learning, trajectories byte-identical per seed as designed).

**Telemetry deviation check:** 3 LOUD, all EXPLAINED — (1) national 12→44 is the
recurring n-mismatch rate artifact (22/32 = 68.8% vs baseline 12/16 = 75%,
rate-comparable); (2) table 16→40: 20/32 = 62.5% vs baseline 100% win-side and
26/32 = 81% reunioncost pre-seat — the composition gap is the VETREL hunt legs
diverting courtship days (explained by composition, not a bug); (3) wins 16→0 is
the recurring pre-seat substrate-mismatch class (SEATDRIVE=0 explicit, no take-seat
verb). Baseline kept, no roll.

**Sense-test: IMPOSSIBLE — reported honestly.** The brief required reading a reunion
opener fight transcript. Zero reunion post-learning fights exist on any run (0
learnings → the opener's knownSig gate never opens). There is nothing to read. The
SENSE-TESTING LAW had no material; this is itself the finding — the trick-execution
game cannot be sense-tested on a substrate where the trick is never learned.

## Village assessment

The villages on the vetrel composition look like courtship-road villages with a war
hobby: they court (national 22/32), they wait on the table (20/32), and on 6/32 runs
they blood enough veterans to crack wave 4 — then never learn a single wave-4 trick.
The witness channel is the bottleneck, not the fighting: s976-belong reached wave 4
on both arms with 235 field fights and produced exactly ONE node-witnessed reunion
observation — not enough for a learning (needs 2+). Who thrived: the national
villages on 6/8 seeds. Who died: s975's whole cast at d57/d38 (both arms — the
composition's early game is harsher than round-1's; the vet hunts divert the scholar
from the food/courtship economy before wave-3 even unlocks) and s979/s980-lead at
d53–68. What was missing: not the opener, not the gate — the learning. The blank
filled: the composition instrument (vetrel-court policies + sweep + judge, all
landed). The blank documented: the reunion opener's cost/benefit is STILL unmeasured
after two arms (reunioncost + openersurv) — the question needs a substrate where
wave-4 tricks are actually learned, or the learning channel itself needs work.

## Metric review (§14)

- The ANSWERABILITY gate bound the run: INCONCLUSIVE per the pre-registered pool bar
  (0 < 6). Not re-scored as a NO-GO against a friendlier metric — with zero reunion
  fights, gates A/B/C are vacuous (0/0), and calling that a KILL would be dishonest.
  The question ("does the reunion opener cost survival where unlocks happen?") is
  genuinely unanswered on this sample.
- Proposed revision for the NEXT run: the question needs a learning-capable substrate,
  not just an unlock-capable one. Wave-4 unlocks (6/32) are necessary but not
  sufficient — the witness channel must produce learnings. Options: (a) seed the
  reunion trick as known (a debug/learned-trick composition measuring the opener's
  cost/benefit directly, bypassing the learning channel); (b) fix the witness channel
  rate first; (c) root-cause the 10-16→10-18 unlock drift, which may restore both.
  This revision applies to the next run only.
- The enrollment design from reunioncost is validated again: FIGHTOPEN-independent
  trajectories (16/16 pairs metric-identical across arms) make post-hoc pooling
  honest. The judge's armId key bug (treatment/control vs armed/control) was caught
  and fixed before any verdict; the sibling reunioncost judge carries the same latent
  bug — its verdict stands on the merits but the coordinator should patch it.
- No re-scoring: the pilot stands INCONCLUSIVE; no confirm was spent.

## Convergence state

scale-onramp: **blocked on the learning channel, not the gate.** The execution
funnel (fightopen round-2: 0% conditions-never-met when the trick is known) is proven;
the survival-cost question (round-2's named next) has now survived two arms
unanswered because the trick is never learned on pre-seat courtship. The deeper
finding is the drift: the 2026-10-16 unlock-capable substrate no longer unlocks on
2026-10-18 (0/5 on the named set, pure substrate). Until the unlock/learning bars
move, the entire w4/5 trick-execution measurement line is parked.

## Per-seed JSONs

evidence/2026-10-18/perseed-openersurv/ (32 runs: 8 seeds x {vetrel-lead-court,
vetrel-belong-court} x {treatment, control}; numeric wall-metric keys
national/table/won/wins/exiled kept exact for telemetry-check; _verdict.json
carries the judged verdict) · beats: evidence/2026-10-18/openersurv-beats/

## Proof artifacts

- scripts/sweep-openersurv-20261018.js — the sweep (execensus instrument reused;
  vetrel-court policy composition; FIGHTOPEN toggled per arm in-process)
- scripts/analyze-openersurv-20261018.js — the judge (pre-registered gates A/B/C,
  answerability bar, _verdict.json)
- Diagnostics (not committed — /tmp only): /tmp/openersurv-diag{,2}/ — pure round-1
  substrate on s975/s976/s977 (the drift evidence); /tmp/openersurv-smoke/ (instrument
  smoke test)

## Blank-fill record

- FILLED (measurement): vetrel-court composition instrument + sweep + judge, all
  landed; 32-run pilot on the named set; drift diagnostics on the pure substrate
- FILLED (finding): the named unlock set drifted (0/5 pure-substrate wave-4 on
  975/976/977 vs 14/16 on 2026-10-16) — filed to sim-findings.md
- FILLED (tooling): judge armId key bug caught+fixed; sibling reunioncost judge
  flagged with the same latent bug
- DOCUMENTED (not fixed): the reunion opener's cost/benefit — still unmeasured after
  two arms; needs a learning-capable substrate or a known-trick composition
- DOCUMENTED (not fixed): witness channel rate (4 reports / 32 runs) — the binding
  constraint on all trick-execution measurement, below the unlock gate itself
