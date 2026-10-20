# duty_fish scale-up — run fleshout-loop-b-20261020T1234Z (loop B, second axis)

Date: 2026-10-20 · Axis: food-economy (scale-wall lens) · Arm: sim-dutyfish-b
Worker tree: ~/workspace/worktrees/sim-dutyfish-b2 · Base: 8de1b508b
Policy layer: scripts/policies/dutyfish-b.js (default OFF, zero src/js, requires
FEASTSCALE_R13=1; loud DUTYFISH STOP otherwise — by design, not a bug).

Canon: docs/CANON.md + docs/PRESERVATION.md read. There is no fishing canon
doc — fishing is a tool-action like any duty, and this lever plays with
ASSIGNMENT breadth (who goes to the nets on lean days), not the fishing
mechanic, so no canon is invented. (The same note lives in the layer header.)

Mechanic: evening posture in policy.daily — when Game.pantryFreshDays() <= 4
(the PRODTHROTTLE disengage threshold), top up 'fish' assignments to
WANT_FISHERS=5 from FREE villagers only (never pulls anyone off an existing
assignment — additive labor). Occupation-preferred, deterministic roster
order, one deduped voice line per lean staff-day (no silent actions).

Provenance: run 0930Z died mid-det-gate; main-agent timeout closeout + this
run's 1206Z recovery raced (see evidence/2026-10-20/sim-loopb-1206Z-collision-correction.md).
TRUE state at handoff: proof 15/15 GREEN (re-verified twice, FEASTSCALE_R13=1),
det-gate 2/64 valid (leaddutyfish s5601 + s5605, 4/4 repeat-pairs bit-identical;
their journaled hashes were in the dead worker's handoff — NOT found in
sim-loopb-0930Z-recovery.md or goal hidden_files, so this run re-runs all
64 reps from a fresh journal ~/workspace/detgate-dutyfish-b2-progress.jsonl),
pilot unrun, sense PASS (60d read). The run's job: re-confirm proof, complete
det-gate (64 reps = 16 configs × 2 sides × 2 reps = 32 repeat-pairs), pilot,
sense, verdict.

## Pre-registration (binding per docs/MEASUREMENT.md §14 — a miss is NO-GO,
## never re-scored mid-run; doubts go under "metric review")

- PRIMARY: lean-day duty_fish inflow, armed/control, pooled leaddutyfish +
  belongdutyfish on identical seeds. GO threshold: >= 1.3x.
- CO-PRIMARY: per-villager capture = lean-day total inflow / sum(lean-day
  roster); armed/control >= 1.0x (the widening must ADD production, not
  dilute it across a collapsing roster).
- GUARDRAILS (hard): starvation deaths <= control; median survival >=
  control - 10d; national >= control - 2; fast-rot pooled per 100d <= 1.15x
  control; laundering 0; no new death mechanism.
- DET-GATE: 32/32 bit-identical repeat-pairs (control reps match, armed reps
  match; control vs armed are NOT expected to match). A fail is FAIL LOUD
  and stops the run before pilot.
- PROOF: 15/15 with FEASTSCALE_R13=1, SEATDRIVE=0 (envless G3/G6 fail by
  design — substrate gate loud STOP).
- Horizon: 180d, death-aware (baseline regime; median survival ~180d on this
  substrate — village stops simulating on death, no fixed-200d).
- Seeds: det-gate 5601–5608 × lead/belong; pilot 8 seeds (5601–5608, same set
  — the pilot's before/after is armed-vs-control on identical seeds, not
  seed novelty; the set is disjoint from the coordinator banned list — verified
  by the sweep script's banned check).
- Policies: leaddutyfish, belongdutyfish (both wrap feastscale; layer OFF on
  control).
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0, SURPLUSFEED unset (sweep script
  hard-exits on violation).

## Step 1 — proof re-confirmation

`FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-dutyfish-b.js`: **15/15 PASS**
(re-run 2026-10-20 12:41Z on this tree, base 8de1b508b, exit 0). RED phase 4/4
byte-identical with layer unset; GREEN G0–G6 all pass; additive-only staffing
confirmed. Sense voice sample prints in the proof output.

## Step 2 — det-gate (fresh journal; handoff hashes not found — see provenance)

Chunks (4 parallel inside this tree; node sims are not jest, main tree
untouched):
- chunk1 DETGATE_SEEDS=5601,5602 DETGATE_POLICIES=leaddutyfish
- chunk2 DETGATE_SEEDS=5603,5604 DETGATE_POLICIES=leaddutyfish
- chunk3 DETGATE_SEEDS=5605,5606 DETGATE_POLICIES=belongdutyfish
- chunk4 DETGATE_SEEDS=5607,5608 DETGATE_POLICIES=belongdutyfish
Journal: ~/workspace/detgate-dutyfish-b2-progress.jsonl (never /tmp —
service restarts wipe it).
Logs: ~/workspace/detgate-<policy>-<seed>.log

(pending → results below)

## Step 2 — det-gate: PASS, 32/32 bit-identical repeat-pairs

Full gate: 16 configs (seeds 5601–5608 × leaddutyfish/belongdutyfish) ×
{control, armed} × 2 reps = 64 reps, all journaled with unique keys at
~/workspace/detgate-dutyfish-b2-progress.jsonl. No FAIL in any chunk log;
every chunk exited 0 with "DET-GATE: control 2/2 armed 2/2 — PASS". Zero
configs silent (control != armed on all 16 — the lever fires everywhere;
a silent config would print a "lever silent" note, none appeared).

Wave-1 chunks (my error — I launched only half the config matrix:
leaddutyfish 5601–5604 + belongdutyfish 5605–5608) and wave-2 chunks
(leaddutyfish 5605–5608 + belongdutyfish 5601–5604) ran in parallel inside
this tree; keys are disjoint, journal 64 unique lines, resume-safe. Mid-run
service restart (during a wait-poll) killed no reps — resume logic held.

Note on handoff hashes: the 1206Z correction said the 2 valid dead-run reps'
journaled hashes lived in the worker's handoff. I searched
evidence/2026-10-20/sim-loopb-0930Z-recovery.md and goal hidden_files — the
hashes are not there. So "reproduce their hashes" was not executable; the
gate's substance (bit-identical repeat-pairs) is fully re-run from a fresh
journal and passes. This is recorded so the next run doesn't go hunting.

## Step 3 — pilot

`bash scripts/drive-dutyfish-b-sweep.sh` → 32 configs (8 seeds × lead/belong
× control/armed), 180d, FEASTSCALE_R13=1 / SEATDRIVE=0. Stale partial control
halves (seed 5601 only, suspect — main-tree closeout provenance, see the
1206Z collision correction) moved aside to
evidence/2026-10-20/perseed-dutyfish-b-suspect-0930Z/ before the drive; pilot
runs fresh. Driven in 2 parallel halves (leaddutyfish / belongdutyfish) in
this tree — the driver itself runs configs serially per half.

My launch mistake: the belong half's first invocation ran from /home/hatch
(no cd applied to the second background job) and died instantly with
"No such file or directory"; relaunched with an absolute script path ~8 min
after the lead half. No evidence contamination — the failed run never got
past bash's script lookup, so perseed-dutyfish-b was untouched when the real
belong half started (the script writes incrementally with resume, and the
files were empty).

## Step 4 — sense: PASS (fresh capture, deterministic with the dead run's read)

`FEASTSCALE_R13=1 SEATDRIVE=0 DUTYFISH_B=1 node scripts/sense-dutyfish-b.js`
60d leaddutyfish s5601 armed → evidence/2026-10-20/sense-dutyfish-b2-s5601.txt
(5486 say lines). The widening voiced on day 2 only in this 60d run:

  "[d2] 🎣 The pantry is thin (~2 days of fresh left). The creek crew doubles
  up — 3 more hands to the nets. What the water gives, the village keeps."

The line is parameterized on the actual staffed count (proof sample printed
"5 more hands"), the fresh-days figure is the decision-time reading (pre-
donation lean posture, per the layer's D2 note — honest by construction, no
silent actions), and the duty board shows the 🎣 Fish assignments alongside.
Village life around it is coherent: villagers water/haul/talk by the fire,
name-learning works, the longhouse raises, warnings fire honestly. Villagers
act like people, not robots.

Notable: only ONE staff day in 60d on this seed — the village rarely hit
the ≤4-day lean posture. If the pilot confirms low staffing frequency, the
1.3x primary may be unreachable by construction, not by failure — see
metric review.

Out-of-scope (prior run's, confirmed here): un-interpolated {kin} placeholder
in the dog-tags keepsake line — 8 occurrences this run. Already logged to
sim-findings.md; cosmetic, not this axis's work.

## Village assessment

8-seed pilot, 180d horizon, death-aware. Armed villages (duty_fish widened)
died more than controls: median survival 134.5d vs 148.5d, starvation deaths
13 vs 8. The extra fish staffing pulled hands off other inflow without
raising lean-day fish yield (PRIMARY 0.78x vs ≥1.3x bar) — the widening
honestly redirected effort (sense PASS, villagers act like people, widening
lines read true) but the pantry math didn't move. Fast-rot inflow ran hot
(1.54x vs ≤1.15x guardrail) while lean-day fish stayed flat: the layer
moved the wrong inflow. Armed villages reached national slightly more
(8/16 vs 5/16) but table held even (14/16 both) and wins stayed 0/16 both —
no win-path opened.

## Wall numbers (national / table / wins, wave 4-5 unlocks, median survival)

Control (16 seeds): national 5/16, table 14/16, wins 0/16, wave-4 16/16,
wave-5 0/16, median 148.5d.
Armed (16 seeds): national 8/16, table 14/16, wins 0/16, wave-4 15/16,
wave-5 0/16, median 134.5d.
The wall stands: national reachable, table reachable, wins 0/32, wave-5 0/32.

## Convergence state

killed-at-pilot. PRIMARY miss (0.78x vs ≥1.3x) + guardrail failures
(fast-rot 1.54x, starvation 13v8, median −14d). The duty_fish widening is a
production-side lever that cannot fix an inflow-collapse problem — same
structural lesson as the pantry-guard line (inflowguard-b, sharelean-b).
duty_fish stays what it was: the only lean-responsive channel, not a
scale-up target. Layer file untouched; killed arms leave no trace.

## Metric review

PRIMARY (lean-day duty_fish inflow ≥1.3x) missed at 0.78x — NO-GO, not
re-scored. CO-PRIMARY (1.07x) GO but irrelevant against the guardrail
failures. The metric was honest: the sense note (only ONE staff day in 60d
on the sense seed) already flagged that the 1.3x bar might be unreachable
by construction — villages rarely hit the ≤4-day lean posture that triggers
widened staffing. No revision proposed: the bar correctly killed a lever
that fires too rarely to matter. Next duty_fish work, if any, belongs to
the lean-posture trigger question, not the staffing width.

## Out-of-scope findings

None yet this run. (Prior run's: un-interpolated {kin} placeholder in the
dog-tags keepsake line — 8 occurrences — cosmetic, logged to sim-findings.md.)
