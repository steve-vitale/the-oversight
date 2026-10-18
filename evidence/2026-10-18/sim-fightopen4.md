# sim-fightopen4 — FIGHTOPEN confirm on real wave-4 trick fights (flesh-out loop ARM, 2026-10-18)

**Run:** flesh-out loop ARM sim-fightopen4, axis scale-onramp (blocking). The sim-condbreak named next (evidence/2026-10-17/sim-condbreak.md, landed 45e354df).
**Type:** COMPOSITION ONLY — zero src/js changes, zero scripts/policies changes. Uses the landed FIGHTOPEN game code (src/js/fieldFights.js, default OFF, env flag) + the existing scripts/policies/vetrel.js driver (VETREL=1). Instruments + evidence only.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (wave-4 gate: village standing >= 100 via blood/bonds/bread, never pure calendar; the wave-4 combat-readiness gate — design call #4, four bars ARMORED/ARMED/TRICKS/VETERANS — holds standing at t4-1 while any bar is short). FIGHTOPEN's round-1 opener fiction is landed code, not invented here.
**Substrate:** the defercensus2b readiness composition — VETREL=1 + REPOSITION=1 + NODEWITNESS=1, policy `withVetrel(withReposition(tribfloor leadfeast/belongfeast))`, SEATDRIVE=0 explicit (pre-seat), FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 (+ WINPURSUIT=1 WINDEFER=1 set in-process, inert — the windefer wrapper is not composed, exactly as defercensus2b readiness). REPOSITION/NODEWITNESS are shared by both arms — only FIGHTOPEN differs. Composition choice documented for overrule: the task's premise ("the vetrel readiness substrate does produce unlocks") names the defercensus2b readiness substrate, so this sweep runs that exact composition.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** on the readiness substrate that produces real wave-4 unlocks (defercensus2b: gate clears 2-3/16 per substrate), does the landed FIGHTOPEN opener change the conditions-never-met share on wave-4 trick fights — the fightopen round-2 SECONDARY that measured 0/0?

**Pool:** post-learning FIELD fights vs opener-eligible species (congregation, reunion, editor, cancellation, audit — the five species the landed FIGHTOPEN branch actuates) at wave >= 4, classified by the execensus instrument (attachExecensusCapture + classifyLearning, witness-sourced learnings only, same as sim-fightopen).

**PRIMARY (binding):** GO iff conditions-never-met share armed <= 20% AND control >= 80% on the pool. Calibration: fightopen round-2 measured 0.0% vs 95.2% on the same pool shape; the wave-4 bar here is the confirm.
**POOL GATE (pre-registered, reunioncost precedent):** >= 12 wave-4 trick fights per side, else INCONCLUSIVE — not re-scored against a friendlier pool.
**SECONDARY:** resolutions movement > 0 on the same pool (counterwire definition: trick-attributed kill OR mFlee/vFlee with >= 2 trick actions in trickLog).
**Guardrails:** median survival >= control − 10d · wave-4 unlock share >= control − 2 · no new death mode (no armed-only death causes).
**Horizon:** 180d death-aware (the trick game lives late: defercensus2b firstW4Day 62–121; sim-fightopen learnings landed d65–d148).
**Seeds:** 8 FRESH [52001–52008] — verified 0 `-s<seed>-` filename hits across evidence/ before the run.
**Policies:** leadfeast / belongfeast (the vetrel-wrapped tribfloor stack, reposition-composed — the defercensus2b readiness composition).
**Arms:** armed = VETREL=1 + REPOSITION=1 + NODEWITNESS=1 + FIGHTOPEN=1; control = same minus FIGHTOPEN (flag unset; the sim-fightopen proof's det-gate pins zero trace when off). Identical seeds both arms.
**Confirm rule:** if PRIMARY GO on an honest pool, confirm at 12–16 seeds.
**Det-gate:** byte-identical trajectories on the control side (proof scripts/test-fightopen4-20261018.js: re-runs byte-identical).

**A miss is NO-GO, never re-scored.** Judge the run against this header; if the metric proves wrong, it goes under "metric review" for the next run.

## Results

### The sweep: 8 fresh seeds [52001–52008] × {leadfeast, belongfeast} × {armed, control}, 180d death-aware — 32/32 runs, 1 infra incident (recovered)

Per-seed JSONs: evidence/2026-10-18/perseed-fightopen4/ · judge: scripts/analyze-fightopen4.js.

**Infrastructure note (loud):** the first control pass crashed 22 runs in with `EPERM: operation not permitted, write` on `fs.writeFileSync` (the 23rd per-seed JSON write). The EPERM was transient and load-correlated (cleared within ~2 min idle; a service restart during the incident window also cleared it). The sweep script was hardened with tmp-file + rename + 10-attempt/30s-backoff writes (scripts/sweep-fightopen4.js); the remaining 10 control runs then completed cleanly. No run data was lost — every completed run's per-seed JSON was verified parseable; the one 0-byte file from the crashed write was overwritten by its re-run. Lesson for the loops: this VM intermittently EPERMs node file writes after ~100s of sustained sim CPU — retry-with-backoff on per-seed writes, not just hope.

| metric | armed (FIGHTOPEN=1) | control (flag unset) |
|---|---|---|
| runs | 16 | 16 |
| wave-4 opener-eligible post-learning field fights (the pool) | 0 | 0 |
| conditions-never-met | n/a (0/0) | n/a (0/0) |
| fights with any trick fire (pool) | 0 | 0 |
| opener-first fights | 0 | 0 |
| resolutions | 0 | 0 |
| wave-4 unlocks | 2/16 | 2/16 |
| wave-5 unlocks | 0/16 | 0/16 |
| national / table / won | 10/16 / 14/16 / 0/16 | 10/16 / 14/16 / 0/16 |
| median / max survival | 180d / 180d | 180d / 180d |

**POOL GATE: FAIL → INCONCLUSIVE (0 < 12 per side).** The phenomenon the PRIMARY measures (post-learning wave-4 field fights vs opener-eligible species) had n=0 opportunities on both arms. Per §14 this is INCONCLUSIVE, not GO and not NO-GO — never re-scored against a friendlier pool.

**Why the pool is empty (the chain, measured):**
1. Wave-4 unlocks: 2/16 per side (4/32 total) — the defercensus2b premise HELD (gate clears 2-3/16 per substrate). The unlocks are seed-determined and arm-invariant (same seeds unlock on both arms: s52005 leadfeast, s52007 belongfeast).
2. Witness learnings: only 1 of the 4 unlocked runs produced any (leadfeast-s52005: influencer d105 + reunion d119, both arms identically). The node-witness channel needs witnessed field-fight deaths (vDie with node-mates on the tile) — rare by construction, and wave-4 exposure is the bottleneck (the round-1 corpus's 32 observations were overwhelmingly wave-4/5-sourced).
3. Post-learning fights: the influencer learning is not opener-eligible (dishonest as opener — landed documentation) and its 2 post-learning fights were TB, not field. The reunion learning (opener-eligible) had verdict `no-opportunity` — zero post-learning fights of any kind. belongfeast-s52007 unlocked wave 4 with 0 learnings at all.

**The layer never fired — proven, not assumed:** all 16 armed/control seed-pairs are trajectory-identical once arm-identity fields (`fightopen`, `armId`, substrate string) are normalized. The FIGHTOPEN branch's preconditions (knownSig for an opener-eligible species + round 1 + wave>=4) never co-occurred in 32 runs, so the opener could not fire — and the identical trajectories prove it didn't, anywhere, including the TB path. This is the det-gate's complement: the layer is provably inert in this corpus, and the corpus contains 0 opener-eligible post-learning wave-4 field fights. The round-2 confirm (0.0% vs 95.2% cnm) stands as the only opener measurement; the wave-4 confirm remains unmeasured.

**Guardrails:** all OK — no armed-only death causes; wave-4 unlocks 2 ≥ 0 (control−2); median survival 180 ≥ 170 (control−10d).

### Wall numbers (per side, n=16)

national 10/16 · table 14/16 · wins 0/16 (pre-seat by design) · wave-4 2/16 · wave-5 0/16 · median survival 180d. The readiness substrate holds the wall steady vs defercensus2b readiness (national 12/16, table 11/16, wave-4 3/16 there — same band, seed variance).

## Metric review (§14 — binding, never re-scored)

1. **The POOL GATE is the verdict and it is met as written (0 < 12 per side → INCONCLUSIVE).** The gate did its job: it prevented a vacuous "0.0% vs n/a" from being read as a GO. The PRIMARY's phenomenon had n=0 opportunities on both arms — the only honest verdict is INCONCLUSIVE, exactly as round 1 of sim-fightopen was.
2. **No re-scoring.** The pool was defined before the sweep (opener-eligible species, wave≥4, post-learning, field path — the round-2 pool shape). The eulogy 'contradict' trick DID fire in the wild (trickTally on s52005) via a non-witness channel, and the influencer learning produced 2 post-learning TB fights — neither enters the pool, and neither is promoted into it after the fact. Reported, not counted.
3. **The metric did not prove wrong.** The chain it measures (unlock → witnessed learning → post-learning fight) is the real funnel; the run shows the funnel is empty at the second link on this substrate/seed-set, not that the metric mismeasures. Proposed revision for the NEXT run: none to the metric — the follow-on is enrollment, not redefinition (round-2's adaptive enrollment precedent: enroll seeds until the pooled opener-eligible post-learning fight count reaches the gate, or cap the spend).
4. **Det-gate + trajectory identity:** proof 26/26 GREEN (source grounding 8, det-gate+smoke 15, composition 3); control re-runs byte-identical; all 16 armed/control pairs trajectory-identical after arm-identity normalization — the layer is provably inert in this corpus. The sweep's write-path hardening (tmp+rename, 10×30s backoff) does not affect content bytes — the det-gate payload is identical by construction (same JSON.stringify).
5. **Capture neutrality:** a dedicated probe (scripts/probe-capture-neutral-20261018.js, one-off) ran s52005 ± the execensus capture for 130d: identical digests (days 130, survived, same 3-person roster, wave 4). The instrument is read-only; the sweep's numbers are not a capture artifact.

## Village assessment (read from the runs + transcript, SENSE-TESTING LAW)

The modal village on this substrate never meets wave 4: it survives to 180d (median 180), reaches national 10/16, learns nothing of wave-4 tricks, and the FIGHTOPEN layer sleeps through the whole run — 16/16 trajectory-identical pairs. The two villages that unlocked wave 4 tell the real story.

leadfeast-s52005 (both arms, identical): the village opens the Standing door, and the overtime starts grinding (×2 reruns d104, ×3 d111, ×4 d118). The Reunion comes to the treeline at d79 and the village musters honestly — "scouts report The Reunion hunting near Haven, and it is beyond us. Everyone inside. No one walks the treeline alone." Farid dies to the Influencer and Noluthando watches it happen; the fire pieces it together (d105: "Kill the followers first... the village pieced it together from the death"). The Reunion's trick is learned d119. The village feasts through grief (d103: "somebody's seat is empty, and everybody sees it"). Then the overtime ×4 reruns kill them by d151 — the last transcript lines are Jorge in a lost fight: "There's two of them. We can't do this scattered — we need a real team. A named one. People fight harder for a name." A person acting with knowledge, correctly, and dying anyway — the funnel's honest endpoint, one link earlier than round-2's.

Who thrived: nobody in particular — the wave-4 villages die to the overtime meatgrinder; the wave-3 villages survive to 180d without ever seeing the content. Who died and why: Farid (witnessed death → the village's only influencer learning), the d118 fighters, the s52005 village to rerun overtime. What was missing: not knowledge (the village learned both tricks it was offered), not the opening (the opener never got its preconditions) — opportunity. The reunion learning landed d119 with zero post-learning fights: the village knew the trick and never met the monster again.

## Convergence state

scale-onramp: **converging** (composition-only confirm arm — the named lever is landed code, the confirm is unmeasured, not refuted). The wave-4 confirm of the FIGHTOPEN opener remains unmeasured: 0 opener-eligible post-learning wave-4 field fights in 32 runs on the readiness substrate (pool gate 0 < 12/side → INCONCLUSIVE). What this run established instead: (a) the defercensus2b unlock premise replicates (2/16 per side vs 2-3/16 there); (b) the layer is provably inert without learnings (16/16 trajectory-identical pairs); (c) the bottleneck is the learning→opportunity chain, not the gate — the one reunion learning in the corpus had no post-learning fights. The next arm on this axis needs adaptive enrollment (enroll until the pool fills) or a substrate with denser wave-4 exposure — a coordinator call, not a gate redesign. The round-2 result (0.0% vs 95.2% cnm on opener-eligible fights) stands unrefuted.

## Telemetry deviation check (Steve 2026-10-13)

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-18/perseed-fightopen4/*.json' --metrics national,table,wins,exiled`:

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-18/perseed-fightopen4/*.json' --metrics national,table,wins,exiled` fired 3 LOUD lines — ALL EXPLAINED, no baseline roll:

1. `LOUD: wins disappeared: baseline 16 -> current 0` — EXPLAINED: baseline seeded on the win-side stack; this sweep runs pre-seat (SEATDRIVE=0 explicit) where wins are 0 by design. Same substrate-mismatch class as sim-fightopen.
2. `LOUD: national swung 67%: baseline 12 -> current 20 (n=32 files)` — EXPLAINED: raw counts over 32 files (both arms) vs the baseline's 16; the rate is 20/32 = 62.5% on pre-seat readiness vs 12/16 = 75% win-side. Substrate mismatch, not drift.
3. `LOUD: table swung 75%: baseline 16 -> current 28 (n=32 files)` — EXPLAINED: same class; 28/32 = 87.5% on pre-seat vs 16/16 win-side.

## Proof artifacts

- scripts/sweep-fightopen4.js — the pilot sweep (readiness composition: withVetrel(withReposition(tribfloor leadfeast/belongfeast)); FIGHTOPEN toggled per arm in-process; EPERM-hardened per-seed writes)
- scripts/analyze-fightopen4.js — the judge (POOL GATE + PRIMARY + SECONDARY + guardrails)
- scripts/test-fightopen4-20261018.js — proof: 26/26 GREEN (source grounding, DET-GATE byte-identical re-runs both arms incl. control side, SMOKE, composition)
- scripts/probe-capture-neutral-20261018.js — one-off: capture ±130d identical digests (instrument read-only)
- scripts/transcript-fightopen4-20261018.js — SAY-line transcript side-run (sense-testing)
- evidence/2026-10-18/perseed-fightopen4/ — 32 per-seed JSONs (8 seeds × 2 policies × 2 arms; numeric wall-metric keys national/table/won/wins/exiled kept exact for telemetry-check)
- evidence/2026-10-18/fightopen4-transcripts/ — 1 SAY-line transcript (readiness/leadfeast-s52005, the wave-4 unlock seed)
- evidence/2026-10-18/sim-fightopen4.md — this file (pre-registration header written before the sweep)
- ZERO src/js changes, ZERO scripts/policies changes (composition + instruments + evidence only)

## Blank-fill record

- FILLED (instrument): EPERM-hardened per-seed write path in the sweep script (tmp+rename, 10×30s backoff) — the VM intermittently EPERMs node file writes after ~100s of sustained sim CPU; recovered the run, no data lost.
- FILLED (instrument): capture-neutrality probe — attachExecensusCapture proven trajectory-neutral on this composition (±capture 130d identical digests).
- DOCUMENTED (not fixed — needs a coordinator/next-run call): the wave-4 opener confirm is still unmeasured — the learning→opportunity chain is the bottleneck (1 reunion learning, 0 post-learning fights). Next: adaptive enrollment until the pool fills, or a denser-exposure substrate.
- DOCUMENTED (design observation): the eulogy 'contradict' trick fires in the wild via non-witness channels (beasttricks) — the witness-only funnel undercounts real trick execution; the pool definition is honest for the opener question but not a census of trick use.
