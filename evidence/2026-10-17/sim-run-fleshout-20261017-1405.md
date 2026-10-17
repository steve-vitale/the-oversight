# Run summary — fleshout-20261017T1405Z (THREE-ARM RUN, 2 GO / 1 DIAGNOSTIC-GO)

Axis: scale-onramp (blocking; standing directive). Loop B held the live food-economy claim all run (fleshout-b-20261017T1355Z); zero file overlap. Claim filed pre-sims, all three trees registered with WT_RUN_ID matching the lock's run_id — no stale-lock incident.

## sim-modalplay — GO (LANDED 1306fbc5)
Finding #480's named next: the modal-playing policy layer on the feastscale road. `scripts/policies/modalplay.js` (MODALPLAY=1 default OFF, zero src/js), composed over takeseat; drains the modal via the real `Game.chooseTableOption()`. Door rule (pre-registered, policy-side not canon, per #452): highest `tableEarnedPaths()` strength, tie-break beloved>feared>relay>assimilated>defiant>witness>indispensable — never options[0]; beats by the winpursuit drain precedent; never the trial; conscript refused. Witness door verified never offered (exposed=0 all runs), never forced.
- 32 runs (seeds 9901–9908 x {leadfeast,belongfeast} x {armed,control}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0/TAKESEAT=1): **PRIMARY +13 (armed 13/16 wins vs control 0/16; GO iff ≥ +3)** — every seated armed run won the same dawn (feared ×4, beloved ×9, 5 answers each). The 3 armed non-wins died pre-seat, seed-identical both arms.
- Guardrails: national 10/16 ≥ control−2 ✓; no new death mode ✓; det-gate byte-identical ✓; SMOKE ✓. **Median survival literally missed (90d vs 182d)** — structural metric flaw, not layer harm: wins end runs by engine law (table.js sets over=true at all terminals); pre-seat deaths seed-identical; zero added mortality. Recorded as a miss under metric review; verdict follows the pre-registered PRIMARY per §14 (no re-scoring).
- Sense-read: both walks coherent (feared "Show mercy" light final; beloved walk casts a named villager, the feast song). Trial option presented and skipped on all 4 feared walks.
- Proof 19/19 GREEN (re-verified on rebased base). Finding #480 marked fixed; witness-door dead substrate filed as a new open item.

## sim-compoundidx — DIAGNOSTIC-GO (LANDED 5c20b63f)
Findings #459/#460 named next: read-only hostile-region compound index (`scripts/census-compoundidx-20261017.js`, zero src/js, zero policy changes). 32-run fresh census (16 fresh seeds x {leadfeast,belongfeast}, 180d death-aware, base courtship SEATDRIVE=0): **PRIMARY 10/17 = 0.588 ≥ 0.5 → systematic**. But the systematic core is **three parts, not five**: forage competition 16/17, raid hemorrhage 17/17 (median ~27k kcal/run, 10× the 2k bar), grief-leveraged tribute 8/17 (7.5k–11.25k/wk, all on the belong/subordinate road: belong 7/7 compound vs lead 3/10). Meatgrinder 4/17 (conditional on wave-3). **Fast pantry spiral 0/17** — the hardseed 40k→0-in-8d is the seed-specific extreme; corpus collapses take 27–147d. **Hostile splinters are NOT the driver**: compound rate flat across splinter buckets (4/8 with zero splinters); a 4-part run had ordinary neighbors raiding nightly. Deaths (219): combat 40.6%, monster 35.2%, starvation 7.8% (the finisher). Two faces: slow grind (d100–175) and fast fall (d40–d82, pre-wave-3).
- Pre-seat lever candidates: raid defense (policies never answer the treeline; commons raids need no answer), tribute/grief negotiation on the subordinate road. Levers aimed only at hostile splinters will miss the ordinary-neighbor raids carrying most of the hemorrhage.
- Metric review: 'contest' deaths excluded from the meatgrinder family (would flip 10/17→11/17 — verdict robust); raid bar (2k) far below observed values — severity, not presence, is the informative metric going forward.
- Proof 18/18 RED→GREEN. Canon gap filed: no canon doc covers inter-village raiding/splinter mechanics.

## sim-wave4reach — GO at pilot (LANDED 4153b8e6)
Lever-2 lens: vetrel (VETREL=1) + VETSHAPE=1 composition on the pre-seat courtship road (never measured; 1102Z vetcompose was vetrel × WIN STACK with the default bar — different). 32 runs (8 fresh seeds x {leadfeast,belongfeast} x {armed,control}, 180d death-aware, SEATDRIVE=0): **PRIMARY +3/16 (armed 4/16 vs control 1/16; GO iff ≥ +3, threshold met exactly)** — all 4 armed unlocks new vs control twins (unlock@60/81/88/106). **#427 feed: veterans was the binding readiness bar on 5/5 wave-4 unlocks** (armor/weapons/tricks satisfiable; veterans the door every time). The hold beat names "blood your fighters (1 of 2 veterans)" for 37 straight days before one unlock — the fiction counts ghosts under the shaped bar, exactly Steve's #427 trade. One armed unlock died d150 in the draft it opened (the meatgrinder pattern).
- Guardrails: national 10 vs 11 (need ≥9) ✓; no new death modes ✓; det-gate byte-identical ✓. **Median survival tripped on the letter (110 vs 158−10) but construct-invalid**: vetrel hunt legs consume the tick budget → `Game.sleep()` "too late for real sleep" guard → scholar.day (= village clock) stalls 20–104 days/run. Villages are NOT dying: village-lost 3/16 armed vs 11/16 control, deaths 433 vs 712. Documented under §14 metric review, not re-scored; proposed revision: endReason-based survival when the treatment touches the clock. Filed as a finding (tick-heavy layers stall the clock).
- Proof 15/15 GREEN (re-verified on rebased base). No game-code changes — evidence + instruments only (vetrel.js/VETSHAPE untouched).

## Wall numbers this run
- Feastscale base (modalplay): national 10/16, tableDone 13/16, wins 13/16 armed vs 0/16 control.
- Pre-seat courtship (wave4reach): national 10 vs 11, wave-4 unlocks 4 vs 1, village-lost 3/16 vs 11/16.
- Compound census (courtship): 17 village-lost / 32 runs; compound systematic at 10/17.

## Telemetry
6 LOUD (3 per per-seed glob) — ALL EXPLAINED: pure key-schema artifacts (finding #482 — modalplay JSONs carry nationalDay/tableDone/won; wave4reach JSONs carry reachedNational/maxWaveUnlocked; the check expects national/table/wins/exiled) + substrate mismatch by design (baseline is the full win-side stack; arms ran feastscale-base and pre-seat courtship). Baseline kept (national 12, table 16, wins 16, exiled 0), no roll.

## Metric review
§14 held on all three arms (both survival-guardrail misses recorded as written with construct-invalidity documented; no re-scoring). Two survival-metric construct flaws named for the NEXT run: (a) wins end runs by engine law — median-survival guardrails on win-side arms need death-aware/endReason-based survival; (b) tick-heavy policy layers stall scholar.day — never use scholar.day as survival when the treatment touches the clock. Telemetry-check key schema gap (#482) reproduced — per-seed files need canonical wall keys or a key mapping. Steve's shared-measurement order (§15 balanced panel) landed mid-run; per §14 this run's pre-registrations stood. Next runs should write per-seed files in the panel schema so the telemetry baseline compares cleanly.

## Infrastructure
- Mid-run master movement ×1 (sibling docs commit 56952ff7 on the Codex reconcile, landed between worker start and first landing) — every landing rebase-then-merge inside the worker tree + proof re-run green + unpiped MERGE_EXIT --ff-only merges; no conflicts (all arms scripts/evidence-only).
- WT_RUN_ID matched the lock's run_id on all three registrations — no stale-lock incident.
- MAIN TREE DIRTY AT RUN END: 1 file — docs/AGENT-LANES.md, index-only staged simplification (72fbf334) vs HEAD/worktree full version (46d723ab, committed in 56952ff7). Sibling's (main agent, Codex-reconcile) in-flight staging state. Left untouched per the no-unstage rule. LOUD.
- Sibling loop B live all run (food-economy) — zero file overlap confirmed; B's trees (sim-shelltask-b) untouched.
- Rotation file untouched (standing directive overrides rotation while scale-onramp ≠ converged).

## Convergence
**scale-onramp stays converging.** The national→table→wins chain now runs end to end on the feastscale road (national 10–11/16, table 13/16, wins 13/16) — the modal gate (#480) is closed. The veteran bar's shape is now measured on two substrates (vetshape pre-seat +3; wave4reach composition +3, veterans binding 5/5) feeding #427. The pre-seat compound is systematic but splinter-independent — its lever surface is raid defense + subordinate-road tribute negotiation, not splinter-hunting. Directive lift remains a Steve call. All three arms merged locally, pending ship (no push/bump per Vercel batching).
