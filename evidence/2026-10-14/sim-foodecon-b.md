# FOOD-ECONOMY r38 — loop B run summary (coordinator)
run_id loop-b-20261015T000543Z | 2026-10-14/15 | axis: food-economy (second non-converged axis; loop A live on scale-onramp r37 all run, no overlap)

## Arms (3 workers, one per arm; claim filed before sims)

| arm | verdict | commit | what happened |
|---|---|---|---|
| sim-hungerdepth2c | KILLED AT ADOPTION — superseded | 56b39c25 | Orphaned r2 confirm (7759783d, GO at pilot) adopted; adoption check proved the confirm unneeded — the exemption ships always-on (1a44a2c8 + 43a1805f). Env-gated hunk semantically dead on tip (RED-phase proof: exemption fires ungated). No sims spent. Instruments + evidence kept. |
| sim-spoilsibs | diagnostic close — verified clean | 0644f6ef | Spoilsmoke siblings independently verified: tribute payments destroy spoiled stacks at full value (zero spoilDay writes); all 8 cook/preserve entry points already guarded. Proof 9/9; 16-run cohort: 0 laundered kcal, 185 tribute arrivals fresh-dated. |
| sim-vinebank | GO (pilot + 16-seed confirm) | 5d288f4f | Materials-banking policy layer (VINEBANK=1, default OFF): blind 2+2 band now fires — pilot 6/8 seeds, 5 crafts vs 0; confirm 9/16 seeds, 9 vs 0, total crafts 153 vs 121, national 11 vs 10, median 152=152d, no guardrail misses. |

All landed as separate commits on local master (rebased onto mid-run sibling landings where needed, proofs re-verified by coordinator, merged --ff-only, trees released/removed, main tree clean). No push/bump — pending ship.

## Wall numbers (this run)
national 10–11/32 (vinebank confirm) · table 0 · wins 0 · wave-4 4/16 · wave-5 0 · median 152d · exiled 0/32.
TELEMETRY vs scale-wall.json: one LOUD (national 0→21) — EXPLAINED: baseline is the r16 gate-off courtship aggregate; the suite's own identical-seed control measured 10/32 (policy-experiment convention). No baseline roll.

## Village assessment (across the three arms' suites)
The villages in this run's suites live and die the familiar way: combat ends ~80% of scholars (vinebank confirm: 43–49 of ~55 deaths), villages that reach national do it on the courtship road with the pantry holding, and the trap line is now a genuine early-game contributor rather than decoration — blind-band scholars learned the recipe (snare L2/L3 via the engine's blind-success mechanic) while the village's wire line hauled around them. The throttle's chronic-hunger stand-down now fires narrated and counted ("the hungry eat first"), and tribute beats read honestly. Nothing in this run moved the scale wall — these were economy-closing arms, not wall levers.

## Blanks filled / documented
- FILLED: hungerdepth r2 orphan resolved (superseded, not lost); snaregate's materials-banking named next answered (the blind band was a materials question — now a working line); spoil-laundering class closed with two independent verifications (#82 + this run).
- DOCUMENTED (open, steve-call): `_removePantryKcal` spends rot at full value (tribute/aid/feast/oaths) — appended to sim-findings.md; crafted arrows are ammo-invisible (engine-side, no material key) — appended to sim-findings.md.

## Metric review
1. The hungerdepth2c pre-registration assumed an ungated tip; the tip carried the shipped exemption, so the control/armed contrast did not exist — adoption-time code inspection (not sims) was the correct gate. Future orphan-adoptions should run the code-presence check before writing any pre-reg.
2. The vinebank confirm's total-crafts gap (pilot 50→13) resolved as trajectory noise at confirm (153 vs 121) — judged per §14 without re-scoring, as the worker did.
3. Telemetry-check's top-level-vs-nested (`flat.`) schema mismatch fired a LOUD that needed manual path correction; the script's key convention should be documented for arm authors (a future run's instrumentation note).

food-economy stays `converging`. `longsims-rotation.txt` stays 3.
