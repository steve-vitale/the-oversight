# Loop B run fleshout-loop-b-20261018T0830Z (STALE-LOCK RECOVERY + 3-ARM ADJUDICATION)

Axis: food-economy. Loop A live on scale-onramp all run (fleshout-20261018T0831Z, zero file overlap).

## Stale-lock recovery

The scheduled 08:30Z instance found a lock from its own run_id (created 08:15:33Z by a dead first attempt of this same scheduled run). Registry heartbeats for all three of that attempt's worker trees (sim-huntstaff-b4, sim-foodskill-b, sim-dinreserve-b2) were ~29min stale; no live subagents; no running sweep processes. Per the <15min guard the run was dead. Lock deleted, new lock + claim filed with recovery note, all three trees adopted (recovery precedent: 2026-10-16 1150Z/1350Z/1722Z, 2026-10-17 2320Z, 2026-10-18 0630Z runs).

## Arm 1 — sim-foodskill-b: NO-GO-KILLED (LANDED ec04c877, evidence+proof)

#524 food-skill table lever for the 78 occupations. The dead instance's worker had committed the kill evidence (864a6289) before dying. Recovery: rebased onto current master (d81d381a), re-ran scripts/test-foodskill-b.js on the rebased tip — verdict reproduces exactly (old55=1.0618, all78=1.0410, new23=0.9913; honest 1.0333 vs 1.062 ± 0.004 gate; dishonest ceiling 1.0385; sense PASS). Merged --ff-only as ec04c877 (evidence/2026-10-18/sim-foodskill-b.md + scripts/test-foodskill-b.js, zero game code, zero data change). Tree released + removed, branch deleted.

Verdict: the 1.062 baseline is a curated-pool artifact; no honest rating set restores it. Steve's call (a) accept ~1.034 honest world, (b) accept 1.041 status quo, or (c) add new food-trade occupations. Two [open] findings already filed (name-heuristic table; curated-pool artifact).

## Arm 2 — sim-huntstaff-b4: GO (LANDED 259e3016, layer + evidence)

Defense-aware hunt-staffing re-attempt with the b3 metric-review revised guardrail (per-pair starvation judging + hunter-only gating + noise-scaled survival). 29/32 runs complete at takeover; recovery worker ran the 3 missing s8612 runs, proof + §15 panel, adjudicated per the binding pre-reg. Coordinator independently verified: PRIMARY numbers from the per-seed corpus (armed 110 assignments / 5 seeds engaged / control 0 / 187,103 kcal — matches the commit exactly), proof re-run ALL GREEN twice (once on worker tip, once on rebased master tip), zero game code, tree clean.

32/32 runs, seeds 8450–8612 × {leadfeast,belongfeast} × {armed,control}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, base 28408259:
- PRIMARY GO: 110 assignments (bar ≥48), 5/8 seeds engage (bar ≥4), control 0. 187,103 kcal meat.
- STARVATION GO (revised per-pair collapse-aware): 5 surviving pairs 0/0 (bar ≤ control+1); pooled 0 ≤ 3; 11 village-lost pairs on hunter-fate + food-added lens (zero assigned-hunter starvation; huntKcal > 0 where the layer fired).
- HUNTER-ONLY GO: 110/110 word-list substrate. DEFENSE GO: attributed share 0.000 (<0.50), capable excess 0, NOISE. SURVIVAL PASS: mean paired Δ −12.62d (|Δ| ≤ 20d).
- §15 panel: review_required, zero regression_signal (compare .md attached).

The hunt line is 3-for-4 on the honest gate (b metric-broken, b2 genuine miss on the old gate, b3 collapse-seed, b4 GO). Layer lands default OFF (HUNTSTAFF=1), policy-side, zero src/js — scripts/policies/huntstaff.js: lean-day staffing of ONE hunter-substrate villager via the engine's own assignTask (HP≥40, trust≥40, in-person, once/day).

Metric review: the Ayaan Oommen wound→fever chain (d26 sickness death after hunt duty d21) is invisible to the huntAttributable regex — attribution gap filed as a finding for the next run. Sense: 2 hunt-day reads written in the arm evidence.

## Arm 3 — sim-dinreserve-b2: NO-GO-KILLED (LANDED 7e61de26, evidence+instruments)

Cook-drive dinner reserve 250→125 kcal/person revival on current master (base 28408259). Control sweep (16 runs) complete at takeover; recovery worker verified the lever diff vs lever.patch, ran the armed sweep + analyzer, adjudicated per the binding pre-reg. Coordinator independently verified: commit contains evidence+scripts only (zero game code), lever reverted zero-trace (game.js byte-identical to base), proof behaves as designed post-kill (RED on the mechanism assertion — pristine keeps the pile fresh; invariants PASS).

16 runs/side, identical seeds 17011–17018 × {leadfeast,belongfeast}, 180d death-aware:
- fresh-rot share −0.2pp vs −10pp GO → KILL FIRED (<5pp move). Duty throughput rose 2.40M→2.79M kcal (+16%) but rot:fresh and rot:preserved rose in lockstep.
- Guardrails all PASS: median survival +8d (≥−10d), starveDays/100d −0.9 (≤+1.0), laundering 0 both sides.
- Root cause documented: the smoke-racks-full guard is the binding bottleneck — the freed reserve hits the racks cap and rots there (racks-full is the most common armed-side cook beat, 37/92, honest narration). Next arm: racks capacity or feast-draw scaling measured on rot:preserved absolute/100d (the share is confounded with survival length). Finding filed.

## Telemetry

telemetry-check.js vs scale-wall.json on the b4 corpus (32 files): 1 LOUD — wins 16→0. EXPLAINED: control is also 0/16 wins (pre-seat substrate, SEATDRIVE=0 by design — the seat driver buys the win); the baseline wins:16 comes from the full-stack regime, a different suite. Not an arm effect; no baseline roll. (Same LOUD fired on the b2 corpus with the same explanation.)

## Metric review

- Stale-lock adoption: the three arms were the dead instance's own pre-registered plan (claim file); no metric re-registration, no re-scoring — the recovery honored the original bindings.
- foodskill-b: killed at the mechanism gate before any sims — a fast kill, per the throughput directive.
- dinreserve-b2: killed at pilot-scale PRIMARY — the lever fired (+16% throughput) but attacked the wrong constraint; the kill is honest, the root-cause finding is the yield.

## Village assessment

On the pre-seat feast substrate the villages look like villages: the b4 hunt days read as people (bush pilots and hunting guides staffing out on lean days, the _outdoorCrew ally mechanic showing on hunt days), the b2 cook beats read as a person taking stock ("left the fresh pile for tonight's dinner instead of smoking it onto the rot pile"), and the foodskill sense sample showed the skill number tracking the fiction (farmer 2250 vs piano tuner 1500 kcal base). Deaths are blow-by-blow fighting (combat+monster 145/165 on the b2 armed runs; named-monster kills both sides). Starvation is 0.5%-class honest. Wave-3 is the wall ceiling on the pre-seat runs (wave-4 1/16 on b4 both arms — report-only; the unlock line is loop A's fight).

## food-economy: converging.

The hunt staffing line is now landed default-OFF after 3 kills on the old guardrail spec — the mechanism engages, the honest gate holds. The food-skill table is answered (curated-pool artifact, Steve's call). The dinner-reserve lever is dead; the racks-full guard is the next named arm. Remaining axis space: the #340 steve-call (dated-voluntary ledger, awaiting ruling), the wound→fever attribution finding, the racks-full arm.
