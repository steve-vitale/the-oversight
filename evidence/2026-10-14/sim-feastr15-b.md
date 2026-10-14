# SIM-FEASTR15 — loop B run summary (food-economy, sim-findings #187)

Date: 2026-10-14 · Run: fleshout-b-2026-10-14-1730 · Loop: oversight-flesh-out-loop-b
Axis: food-economy (second non-converged; loop A live on scale-onramp all run).
Workers: 2 (one per arm), both in adopted orphan trees.

## Stale-lock recovery (run start)
Dead run fleshout-b-2026-10-14-1530: lock 116m old, tree heartbeats 106m stale,
zero live agents (subagent.list empty). Lock + claim deleted. Trees
sim-allowancegate / sim-dutyalone adopted (registry run_id → this run,
heartbeated); uncommitted policy/proof/det-gate/sweep work inventoried, never
trusted — both workers independently re-ran proofs RED→GREEN before measuring.
Dead run's shared baseline hidden_files/evidence/2026-10-14/sim-feastbase-b.json
is INVALID as an r13 substrate (pristine fingerprint: policy=leadcourt/belongseek,
fdFeasts 0/16, feastSurgeUsed 0/16 — FEASTSCALE_R13 never set). Both arms measured
their own paired r13-only controls on identical seeds instead (the orphan worker
had already designed for this; judged against paired controls, never the file).

## Arms (both policy-side, zero src/js changes, pre-registered per §§9–12, 14)

ARM 1 — sim-allowancegate r15 → commit 5acbc4dc — **KILLED AT PILOT**.
<2-fresh-days pantry-state gate (ALLOWANCEGATE=1; allowance may not fire when
pantry fresh-days < 2; suppressed feasts postpone, never displace). Follows r14's
kill (d238cb92). Paired control reproduced r14's control exactly (21/48/107/7/4).
Pilot 16v16 identical seeds: PRIMARY starvation 21→21 (needed ≤16 — clean miss,
per-seed identical all 16) AND hungryDays 48→45 (≤67.6 pass) → KILL. Mechanism:
feasts 107→105; gate changed nothing on the leadcourt road; 757 holds mostly
theater (counted pre-gating). Conclusion: the <2d line guards empty rooms — the
harm is in the 2–4d band. #187 stays OPEN there. Layer deleted per kill protocol.
Evidence: evidence/2026-10-14/sim-allowancegate-r15.md.

ARM 2 — sim-dutyalone r15 → commit 0e82c14a — **KILLED AT PILOT**.
Surplus-only feast duty (DUTYALONE=1; fires ONLY on allowance-gate-no,
fresh-days > 4, own cadence, never marks shared _fsLastFeastDay — zero
displacement by construction; NAIVE RED proved the displacement mechanism real).
Pilot 16v16 identical seeds: PRIMARY deeds 13→11 (needed ≥13) AND table 4→1
(needed ≥3) → KILL. Guardrails all passed (starvation 21→11, hungryDays 54,
national 7→4, no new death mode). Mechanism of failure: the duty WORKED (58
feasts, 159,150 kcal would-be-rot eaten, 75 defers, floor never breached,
starvation improved) — but every feast bought plenty-Standing (180 vs 120) →
wave-5 unlocked 10/16 vs 4/16 → wave-5 combat shredded villages (combat deaths
116 vs 62, median 92→75d) → fewer consolidations (feastSurgeUsed 13→11;
sentimentTaught saturated 16/16 both sides — 58 extra feasts bought zero deeds).
The villages didn't starve; they got promoted into a war they couldn't fight.
New finding filed: "PLENTY ROAD TO WAVE 5 IS LETHAL" (sim-findings.md) —
Standing-gated wave unlocks don't check combat readiness. Layer deleted per kill
protocol. Evidence: evidence/2026-10-14/sim-dutyalone-r15.md.

## Wall numbers (this run)
national 7/16 (controls) · table 4/16 → 5/16 (gate) / 1/16 (duty) · wins 0 ·
wave-5 4/16 → 5/16 / 10/16 · median 92d → 79d / 75d · exiled 0.

## Telemetry
LOUD table 0→4/5 vs scale-wall.json on ag15-control/armed + dl-control —
EXPLAINED: stale zero-baseline predating the r13 feast era (r13 substrate
genuinely reaches table); dl-armed quiet. No baseline roll (policy-experiment
convention).

## Landing
Both rebased onto loop-A's 869ea2b7 (clean), merged --ff-only, proofs INFO-SKIP
exit-0 verified by coordinator, trees released/removed, branches deleted,
no push/bump (pending ship). Main tree: 1 untracked file
(evidence/2026-10-14/sim-scale-r33.md — loop A's live run, not this run's dirt).

## Metric review (§14)
Both kills honored as pre-registered, never re-scored. Arm 1's miss is a clean
mechanism miss (paired design + per-seed identical trajectories — robust, not
noise). Arm 2's kill is the more valuable result: mechanical success coupled to
an unanticipated Standing/combat-readiness interaction — now a filed open item.
food-economy stays `converging`.
