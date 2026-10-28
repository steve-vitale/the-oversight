# sim-seatpath-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0416Z. Axis: scale-onramp
(the blocking axis). Worker: sim-seatpath-a, arm sim-seatpath-a
(scale-onramp, path diversity).
Worktree: `~/workspace/worktrees/sim-seatpath-a` (branch
sim-seatpath-a).
POLICY-SIDE ONLY — zero src/js changes, zero default flips, no
game lever, no game fix proposed. The deliverable is knowledge:
whether a non-Feared path is walked, won, or blocked on the
75101–75108 tableseat-nowait band.

## Base — stated explicitly

- Base commit at worktree creation: bcf137c40 ("sim-onceaday-b
  evidence: report, det-gate pair, balanced panels + compare (all
  deltas 0)"). This base PREDATES the sibling tableseat-nowait
  evidence files named in the task (evidence/2026-10-28/
  sim-tableseat-a.md and sim-tableseat-nowait-a.md do NOT exist
  in this tree); the task's baseline numbers (entered 3/8, wins
  3/8, all lesser/Feared) are therefore taken as the task's
  stated baseline and REPLICATED by this arm's own baseline
  config on identical seeds — this arm does NOT re-score any
  prior arm's verdict, and any replication gap is reported as a
  replication gap, not as a correction of a prior verdict.
- If master moves under this run, the coordinator owns landing;
  this worker does NOT rebase itself unless a proof needs it,
  and if it does, the proof is re-run after and the move is
  reported.

## Canon read first

- docs/CANON.md, then docs/TABLE.md (the seat: full/lesser/none;
  the seven paths; per-path minimum seat), then src/js/
  table-relay.js (the relay path definition — the code reading
  governs gates; where TABLE.md wording and code differ, the
  difference is reported, not smoothed over).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. If no doc covers a target, the evidence
  file says so instead of inventing.

## Context and the full-seat disclaimer (stated plainly)

- On this band, wave-4 kills are 0 and wave-5 is 0 (per the
  task's band description), so the full-seat bars (w4 >= 3,
  w5 >= 2, plus the full deed gate) are UNREACHABLE regardless
  of policy. The full seat is NOT this arm's target and no
  full-seat claim is made or implied. This arm tests the
  LESSER seat across paths only. Every seating is expected to
  be lesser; the corpus records pv.seat / tableState.seat so
  any full seating would show up, not be assumed away.
- The tableseat-nowait seat legs answer the FIRST table
  option at every phase. At a lesser seat the engine offers
  earned paths in registration order — feared first — so
  first-option answering walks Feared whenever Feared is
  earned. Path diversity on this band is therefore untested
  by the baseline: the question is whether another door is
  offered at all on these seeds, and whether walking it wins,
  loses, or fails differently from Feared.

## The one alternative path: RELAY (chosen, justified from docs)

RELAY is the single alternative path tested. Justification is
from the gate/path docs, not taste:

- CLOSEST GATE (TABLE.md, per-path minimum seat + Reachability):
  relay is lesser+ by deeds OR stage >= 3 regardless of
  scale — "the only path qualified by integration depth
  instead of territory" — and TABLE.md's Reachability section
  names it explicitly: "relay path's stage-3 qualification is
  the most reachable route by design (integration is earned
  through play, not territory)." No other lesser door has a
  scale-independent qualification; every other door's gate
  rides on territory, audience, or ledger counts the band may
  not produce.
- CODE GATE (src/js/table-relay.js, read before this prereg):
  earned iff integration stage >= 3, OR stage >= 2 with the
  relay office held. TABLE.md additionally names sysBond >= 2
  (curious); the code earns on stage/office and prices
  strength from sysBond. Both readings are recorded; the
  sweep's earned snapshot (tableEarnedPaths why strings)
  names the actual blocking reason if relay is never offered.
- MOST DISTINCT ANSWERS (TABLE.md, path 7 vs path 1): Feared
  plays terror calibration (three beats raising alien-terror
  vs villager-horror, tightrope meters). Relay plays the
  cockpit: probe / reroute / deepen / commune verbs with the
  System as relationship (not terrain), the merge meter, and
  the leaning gradient (tender / total / grey — the only
  three-band branch). A relay walk's story cannot be a
  re-voiced Feared walk: different instrument, different
  stakes (backfire / grounding-hollow quarantine vs
  terror/pity downgrade), different finals (champion vs
  voice, plus the grey both-hands / contract finals).
- NOT A DUPLICATE ARM: defiant and witness each already have
  a dedicated door arm (tablepaths-defiant.js,
  tablepaths-witness.js); the 2115Z rotation already walked
  defiant / assimilated / beloved / relay on the 73641 band.
  Relay on THIS band (75101–75108) is unmeasured, and relay
  is the doc-named most-reachable route — so it is the one
  pick, not a rotation. Indispensable is excluded by
  construction (FULL seat only — unreachable on this band).

## Substrate — VERBATIM from evidence/2026-10-28/sim-w4damage-a-prereg.md

- Seeds 75101–75108.
- Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1 (TABLEDEFIANT
  unset, TABLEWITNESS unset, TABLEPATHS unset — no other door
  override may interfere with the relay rule).
- Horizon: 180 loop-days, death-aware (dead villages stop
  simulating; the harness's own end reason governs, never a
  fixed-day force).
- Policy: scripts/policies/tableseat-nowait.js VERBATIM for
  the baseline config (never edited); scripts/policies/
  tablepaths-relay.js (new file, this arm only) wrapping the
  tableseat-nowait substrate for the armed config (never
  editing the existing tableseat policy in place, never
  editing src/js).
- The armed policy's ONLY behavioral delta vs baseline is
  the paths-phase door pick (see door rule below). Seat
  legs, courtship, beat/final/downgrade/conscript/
  demand-price answering (first option, exactly like the
  baseline), and branches (ledger-earned, never overridden)
  are identical by construction.

## Door rule (pre-registered, POLICY-SIDE, not canon)

At a paths-phase offer (every option id 'path:*'):
(1) If 'relay' is offered, take it (rule 'relay').
(2) Else take the first offered door that is NOT 'feared',
    in engine order (rule 'fallback-non-feared').
(3) Else (only feared offered) take feared (rule
    'fallback-feared'; that seating is flagged
    fallback-Feared and does NOT count toward the relay GO).
A door never offered is NEVER taken (the modalplay
precedent — forcing an unearned door would bypass the
engine's prereq). The armed policy records, per seating:
offered doors, picked door, rule, and the live
tableEarnedPaths snapshot (id / earned / why, truncated)
so a blocked relay names its blocking gate.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the lesser-seat path actually taken, by path, on
the 75101–75108 band — armed (relay rule) vs this arm's own
replicated tableseat-nowait baseline on identical seeds.

GO RULE (judged ONLY against this prereg):
  GO = ALL of: (a) detgate PASS on 75101 (see below);
  (b) substrate-activation gate PASS (see below);
  (c) relay entered on >= 1 seating (fallback-Feared
  seatings excluded by construction — the count used is
  enteredPath === 'relay'); (d) G2 leak gate PASS (see
  below); (e) deciding cost bar PASS (armed starvation
  total <= baseline total + 2 AND arm-only starvation <= 2
  AND armed median days >= 0.8 x baseline median days).
  Relay wins are reported by path but are NOT required for
  GO — a relay walk that loses honestly is still a GO for
  path diversity (the loss mode is the finding); a relay
  walk that wins is reported as relay-won, not folded into
  a generic win count.
  NO-GO = seatings happen (>= 1 armed seating) but relay is
  never entered (enteredPath === 'relay' count 0), WITH the
  blocking gate named from the earned snapshots (e.g.
  stage < 3 without the relay office, or relay offered but
  never picked — each stated, never conflated). A NO-GO on
  a blocked gate is a measured finding, not a failed run.
  PILOT-INCONCLUSIVE (not a relay kill, not a GO) = 0 armed
  seatings on the band: there was no seat on which to test
  the door, so no door verdict is judged and no other band
  is silently substituted mid-run.
  No confirm band unless a relay walk needs one — then the
  confirm band is pre-registered BEFORE running it (seeds,
  horizon, GO threshold), never run first and justified
  after.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, LEANLINKRESCUE=1 + TABLESEATNOWAIT=1) vs
armed policy with its switch UNSET (TABLERELAY unset):
days, gameDays must be equal, with no rp counters. A
detgate FAIL stops the run before any judged sweep. Old
detgate numbers from other bands are NOT forced here:
same-base neutrality on this base's own numbers is the
gate, and the numbers are disclosed.

SUBSTRATE-ACTIVATION GATE (binding, same class as the
w4damage arm): band courtship combined > 0 AND >= 6/8
seeds with non-zero combined courtship (combined = the
sum of the leanlinkrescue court* counters captured in the
corpus rows' ctxExtra, baseline config). If the gate
FAILS, the sweep is INVALID (not NO-GO): no verdict is
judged, the failure is reported loudly, and the run stops
for an env fix.

G2 LEAK GATE (binding): for every pilot seed where NEITHER
arm entered the table, days and gameDays must be identical
— the relay rule changes NOTHING except the door answered,
so any divergence on a non-seated seed is a wrapper leak
and NO-GO. (Pre-national subset reported separately.)

G3 CORPUS INTEGRITY: every config produced a row, no
zero-day rows, counters object present on every row.

SENSE RULE (binding): one non-measured narration replay
of a relay seating if one exists (else of a blocked-path
offer, if that is the outcome — the earned snapshot plus
the offer list is the reading); replay text never enters
any count, and the replay trajectory shift is stated, not
hidden. The sense note is short and bears on the question:
does the relay walk's story read as the Relay (cockpit
verbs, merge, System-as-relationship) rather than as a
re-voiced Feared walk?

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
pilot. If its gates pass, it is the judged band. If a gate
fails, that is a diagnosis to report, not a reason to
re-sweep fresh seeds silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known scorecard TypeError failure
mode is documented in prior arms — if it fails the same
way, say so and use the paired sweep-compare tables (this
band's armed vs this band's replicated baseline, identical
seeds/policy/substrate) as the section-15 substitute. No
panel artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall
baseline, metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-seatpath-a/*.json), report LOUD
lines with verdict, do NOT roll the baseline on an
unexplained LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the
  run go here, and any revision applies to the NEXT run,
  never this one.)
