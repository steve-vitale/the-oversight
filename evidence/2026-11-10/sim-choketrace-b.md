# sim-choketrace-b — kill choke-point trace (DIAG ONLY, zero src/js changes)

- Arm: sim-choketrace-b (Loop B run fleshout-loop-b-20261110T1445Z, axis scale-onramp / winnability chain)
- Branch: sim-choketrace-b; base anchor `3838d86dc` (worktree `~/workspace/worktrees/sim-choketrace-b`)
- Prereg: evidence/2026-11-10/sim-choketrace-b-prereg.md (written before any scored seed)
- Instrument: scripts/choketrace-b-driver.js + scripts/choketrace-b-analyze.js (new; derived from scripts/vetcount-b-driver.js — same daily census, competent policy, 150d death-aware — PLUS per-call attribution: caller path from the call stack, settlement-invocation id, fight/monster-instance identity, dead-fighter census, per-call ledger scoring). Proof: scripts/test-choketrace-b.js (17/17 legs: classify, synthetic-burst, determinism, neutrality).
- Corpus: evidence/2026-11-10/perseed-choketrace-b/choketrace-b-s14020{1..8}.json (8 seeds, 150d death-aware, competent policy, 0 recorder errors, 0 unattributed calls)
- Canon: NO separate canon doc covers the kill choke point. The spec is the code itself — src/js/game.js `recordWaveKill` (the choke point, with the vetcount-reconcile one-body-one-count rule) and src/js/waveLedger.js `scoreLedgerKill` (per-type cap 2, breadth over farming) — plus docs/MONSTER-WAVES.md (wave law) for the belltoad-chorus pack behavior.
- Context (must-read): evidence/2026-11-10/sim-vetcount-reconcile-b.md § "The disagreement was bigger than wave 4". The kill-call accounting on seeds 140201–140208 showed 32 duplicate recordWaveKill calls (2–8 per seed; only 140207 had none), clustering as bursts — same day, same monster, same killer, same channel, up to 7 extra reports of one kill. The counter now follows the log, so the symptom was contained — but WHICH caller paths re-fire, and whether the ledger's per-type-capped double-score on re-fires matters, was unexamined. That is this arm's question.

## Verdict: DIAG-GO (primary metric, judged strictly)

- **Primary metric: attribution coverage of re-fire bursts. DIAG-GO: 16/16 bursts attributed to a named caller path, 0 UNATTRIBUTED.**
- **The headline finding overturns the question's premise: there is no re-fire.** All 32 "duplicate" calls are genuine second (third, fourth...) bodies that the (day, mid, by, via, trick) dedupe key collapsed into one log entry. The choke point fires exactly once per body on this band. No caller path re-fires; no settlement runs twice for one kill; no cross-path double-report exists.
- **Ledger verdict: the double-score is real in 4 of 32 cases and inert in all 4.** Four re-fire calls scored +1 each (per-type cap room existed); 28 were already capped (add = 0, no effect); zero crossed a wave bar, so no unlock timing moved on this band. And the framing dissolves on inspection: those 4 were genuine second bodies — the ledger scored two kills, the log kept one entry. The ledger is the tally closest to body-truth here, not the double-counter.

## The caller paths, named (grep census, confirmed live)

Nine recordWaveKill call sites, eight `via` channels. Five fired on this band; four never fired (0 calls — noted as a coverage limit, not a failure: they had no bursts to attribute, so they are unexercised here, not proven clean):

| path | call site | via | calls | dup calls |
|---|---|---|---|---|
| tb-end | game.js:46716, tbEnd | player / companion | 105 | 21 |
| wild | game.js:20756, resolveWildMonsterEncounter | wild | 279 | 2 |
| agency | villager-agency.js:465, expeditionMonster | agency | 168 | 0 |
| contest-blood | contestEngine.js:401, _cxBlood | contest | 25 | 9 |
| aid-crisis | comms.js:669, aidFight | aid-crisis | 7 | 0 |
| patrol | game.js:8073, resolvePatrol | patrol | 0 | 0 |
| sortie | havenGrowth.js:913, lingererSortie | sortie | 0 | 0 |
| contest-hide | contestEngine.js:633, _cxOther (hide) | contest | 0 | 0 |
| contest-beastmaster | contestEngine.js:661, _cxOther (beastmaster) | contest | 0 | 0 |

Total: 584 calls (583 recordWaveKill + 1 recordPyrrhicKill), 551 log entries, 32 dup calls, 0 UNATTRIBUTED, 0 recorder errors. Reconciliation holds 8/8 (log == counter, fixed engine).

## The bursts, all sixteen (shape verdicts from the analyzer)

Every burst states its shape — same settlement invocation vs several, same vs several monster instances, dead-fighter census — from the recorded evidence, not from the key alone. Full per-call detail: evidence/2026-11-10/choketrace-b-analysis.txt.

**TB fights, one fight, several dead of the type (8 bursts, 21 re-fires) — the belltoad-chorus shape.** tbEnd loops once per dead monster fighter in the fight (snake-lineage deduped) and settles a fight object once (`f.over` guard), so several same-key calls inside one tbEnd invocation can only mean several dead fighters of that type. The dead-fighter census proves it in every case (dead count == burst size):

- 140201 d64 paparazzo x2, scholar gen_sm0tpyn, trick "move_windup" x6 — 1 fight, 2 dead paparazzo.
- 140202 d54 belltoad x4, scholar gen_gognxmz, trick "shout" x3 — 1 fight, 4 dead belltoad.
- 140202 d54 hummice x3, companion gen_h3r9ke8, trick "shout" — 1 fight, 4 dead hummice. The 4th body is accounted for: killed by a different companion (gen_9edpywb, seq 57), a different key, its own log entry. All 4 bodies present in the record.
- 140204 d75 belltoad x8, scholar Ella Johnson, trick "shout" x4 — 2 fights, 4 dead + 4 dead belltoad. The biggest burst on the band is two chorus fights, not one kill reported 8 times.
- 140205 d85 belltoad x4, scholar gen_lxst8oj, trick null — 1 fight, 4 dead belltoad.
- 140206 d26 bulldozer x2, scholar gen_9dl273w, trick "sidestep" x2 — 1 fight, 2 dead bulldozer.
- 140208 d90 belltoad x4, scholar gen_g5s5zoe, trick "shout" x3 — 1 fight, 4 dead belltoad.
- 140208 d135 congregation x2, companion Sam Wilson, trick null — 1 fight, 2 dead congregation. (See sense-test below.)

**Contest gauntlets, one contest, same beast type across waves (6 bursts, 9 re-fires).** _cxBlood loops waves 1..N; each wave's vKill is a fresh beast. Ordinals prove the waves (1,2,3 / 1,2 / 2,3):

- 140201 d116 nightlight_catfish x3, Ingrid Vik, ordinals 1,2,3.
- 140202 d54 giant_mosquito x3, Jesse Cortez, ordinals 1,2,3.
- 140203 d40 giant_mosquito x3, Ivy Wang, ordinals 1,2,3.
- 140204 d75 giant_mosquito x2, Sofia Chen, ordinals 1,2.
- 140206 d33 giant_mosquito x2, gen_cyv606n, ordinals 1,2.
- 140206 d39 mirrormoth x2, Hannah Kim, ordinals 2,3 (wave 1 killed a different type).

**Wild field fights, two settlements, two distinct world monsters (2 bursts, 2 re-fires).** The fieldFight monster-object ids differ — two beasts of the same type, killed in two separate fights the same day:

- 140205 d17 hushwolf x2, gen_zw4nq99, objects #7 and #8.
- 140205 d17 anaconda_empress x2, gen_sbkg87l, objects #10 and #11.

**Zero cross-path bursts. Zero same-instance re-fights. Zero single-settlement re-fires.** No burst spans two caller paths; no burst shows the same world-monster object fought twice; no burst shows one settlement reporting one body twice. The three re-fire shapes the prereg feared do not occur on this band.

## The ledger double-score, quantified

For each of the 32 re-fire calls, the ledger per-type before/after around the call:

- **Scored twice (add = 1): 4.** 140204 giant_mosquito (w2, points 16→17, perType 1→2); 140205 hushwolf (w1, 6→7, perType 1→2); 140205 belltoad (w1, 33→34, perType 1→2); 140208 congregation (w4, 5→6, perType 1→2). All four landed on waves whose bars were already full (bars 4, 5, 5, 3 — points already above the bar before the re-fire), so no unlock timing moved.
- **Already capped (add = 0): 28.** Per-type already at cap 2 (usually filled by earlier kills of the same type on earlier days). No effect of any kind.
- **Bar crossings caused by a re-fire: 0.**
- **Reframe:** the 4 "double-scores" are genuine second bodies scoring, as they should — the ledger counts kills, and two congregations died. The ledger's per-type cap is the only thing that ever suppresses a genuine kill's score (28 cases). The ledger is the tally closest to body-truth on this band; the log is the lossy one.

## The counter undercounts bodies (measured, not just known)

The vetcount fix made counter == log. This arm measures what the log itself loses: 583 genuine recordWaveKill calls (one per body — zero re-fires found) produced 551 log entries. **The log and the counter both undercount bodies by 32/583 (5.5%) on this band**, because the (day, mid, by, via, trick) key cannot tell bodies apart when one fight kills several of a type, one gauntlet repeats a type across waves, or one day holds two fights against the same type by the same killer. The "one body = one count" invariant holds only modulo the dedupe key. Consequences already visible in this corpus: Sam Wilson's killers-table row says kills=1 though he killed 2 congregations on d135 (the log kept 1 of 2); the wave-1 counter reads 35 on 140204 while 42 wave-1 bodies died; the wave-4 counter reads 5 on 140208 while 6 wave-4 bodies died. The fix direction is the one the vetcount evidence already filed in the backlog: the key needs a beast-instance id. This arm adds the measurement that makes it a counted loss (32 bodies, 5.5%) rather than a hypothetical, and the proof that no caller-side fix exists to make instead — the callers are correct.

## Sense-test: the kill that opened the tribute window (seed 140208, day 135)

The vetcount evidence told this story as "the very kill that opened the tribute window was double-counted: counter 6, log 5." The trace corrects it: it was not one kill counted twice. Lena Ruiz is the scholar that day. Sam Wilson fights beside her as a companion in a TB fight (fight #15) against a pair of Congregations — wave-4 beasts, the kind the village needs veterans of. Sam lands the killing blow on both of them. tbEnd settles the fight once and reports each dead fighter once: two recordWaveKill calls, same day, same monster, same killer, same channel (companion), same trick (none). The log's dedupe keeps the first and drops the second. The counter (fixed engine) says 5 wave-4 kills; the log says 5; the village actually killed 6 wave-4 bodies — the second congregation is the sixth. The tribute window (first ready d135, 3 ready days) is real either way: at the logged kill, living veterans read 2 (Sam + Pasquale Pascual, d122, still standing). Sam dies before the end of the run; his killers-table row says kills=1. The fiction is coherent — a companion killing two apex beasts in one fight is exactly the veteran-making deed the readiness bar wants — and the numbers now describe it honestly except for the one body the log could not keep. Nothing in the village was wrong. The counting was wrong in the other direction from what the vetcount evidence first feared: the village looked one kill weaker than it was, not stronger — and the counter fix, by following the log, inherited the log's loss instead of correcting it.

And the belltoad chorus (seed 140204, day 75): Ella Johnson, the scholar, fights two separate TB fights that day. Each is a belltoad chorus — the pack answers the call, four belltoads per fight — and Ella kills all four in each, shouting the counter-trick four times per fight (trick "shout,shout,shout,shout"). Eight belltoads die; one log entry is kept. The village's wave-1 counter reads 35; 42 wave-1 bodies died on that seed (the 7 lost are the belltoad burst; wave 2 lost 1 more, the gauntlet mosquito). The chorus is working as designed (Steve 2026-10-05: "even if you kill them all, more answer the call"); the accounting is the part that cannot see it.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 1/8 (140208 only)
- Median survival: 125.5 days (75, 78, 109, 117, 134, 138, 150, 150)
- Military tribute ever-ready: 2/8 (140201 d90, 140208 d135) | trade charter 0/8 | feast embassy 0/8
- Peak living veterans: [0,0,0,0,1,1,2,2]
- Deaths per seed: identical to the vetcount after-leg (trajectories match 8/8 — see neutrality below).

## Secondaries (expected unchanged — confirmed)

- Trajectories vs the vetcount after-leg corpus (evidence/2026-11-10/perseed-vetcount-reconcile-b/after/): 8/8 MATCH on days, endReason, maxWaveUnlocked, waveKills, kill-call counts, dup counts. The recorder is neutral on this band.
- Reconciliation: 8/8 agree, all waves 1–5 (the fixed engine, re-confirmed under the recorder).
- The one pyrrhic call (140203 d109 reunion, Lena Ruiz, via player) is the vetcount-documented one; the pyrrhic path fires only from tbEnd on lost fights, as designed.
- check.js --quick: COULD NOT COMPLETE on this run — the process ran 17 min with ~1s CPU time (host load average ~20 on a 1.5-CPU box, sibling loops contending) and was stopped by the worker; no result obtained. This arm changes no src/js (scripts + evidence only), so the green list cannot differ from base on this arm's account; the nearest baseline is the vetcount arm on the same base lineage (293 passed, 7 failed, all 7 pre-existing and unrelated). The arm's own proof (scripts/test-choketrace-b.js) passes 17/17 standalone. The ship loop's check run on merge remains the gate.

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-choketrace-b/choketrace-b-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0 — identical to the vetcount run.
- Investigation: NOT a game finding — the same regime artifact the vetcount run documented (the scale-wall baseline is the winseat full win-side stack; this census is a pre-seat readiness substrate; the per-seed files carry no `nationalEver`/`table` fields, so national/table read 0 by absence). The `wins` 0/8 is measured and is the expected value for this regime. No action.

## Metric review

- **The primary metric judged what it claimed to judge, and the verdict is DIAG-GO.** 16/16 bursts attributed, 0 UNATTRIBUTED, with per-burst shape verdicts backed by invocation ids, fight ids, monster-object ids, and dead-fighter censuses — not by the dedupe key alone. The attribution machinery proved itself on the synthetic burst corpus first (17/17 proof legs, including a forced multi-path re-fire attributed to all three paths) and then on the live band.
- **The question's premise was wrong, and the metric still caught it.** The prereg framed the 32 calls as "re-fires" to be attributed to caller paths. The attribution shows they are not re-fires at all — they are genuine bodies the key collapses. A metric that only asked "which path re-fired?" would have forced a false answer; the shape verdicts (same settlement + dead census) let the data say "no path re-fired." The DIAG-GO stands because every burst IS attributed — to the path that correctly reported several bodies.
- **Attribution limit, as preregistered, held where it mattered least.** The (day, mid, by, via, trick) key cannot distinguish a re-reported kill from a genuine second beast. This arm's deeper attribution (invocation + instance + census) resolved every burst on the band anyway: TB bursts by dead census, contest bursts by wave ordinal, wild bursts by monster-object id. The agency/sortie/contest-hide/contest-beastmaster paths never fired, so their instance-stamping was never exercised — the limit stands for those paths on a future band, not as a gap in this verdict.
- **Coverage limit (not a miss):** four of the nine paths fired 0 calls on this band (patrol, sortie, contest-hide, contest-beastmaster). The DIAG-GO covers the five firing paths and all 16 bursts; a band that exercises patrols, sorties, and hide/beastmaster contests would be needed to attribute bursts on those paths, if any ever occur there.
- **The ledger "double-score" is a non-problem on this band, and its framing needs the reframe above.** 4/32 scored twice, 0 bar crossings, and all 4 were genuine second bodies. If a future arm worries about ledger inflation, the lever is the per-type cap or the dedupe key — not the caller paths, which are correct.
- **What this arm does NOT change:** no src/js changes (DIAG ONLY, per the task). The counter/log agreement is untouched. The follow-up the coordinator should queue: the dedupe key needs a beast-instance id if the log/counter must count bodies (backlog item from the vetcount evidence, now measured at 32 bodies / 5.5% on this band). That is a counting change with its own re-measure, not a caller fix — there is no caller fix to make.

## Findings backlog

- No new backlog items. The vetcount backlog item (kill choke point re-fired up to 8x per kill) is ANSWERED by this arm: it did not re-fire — the 8x burst is 8 bodies. Recommend the coordinator mark it answered with a pointer here, and re-point the follow-up at the dedupe key's body-count loss (32 bodies, 5.5% on the band), which is the live item.

## Files

- Prereg: evidence/2026-11-10/sim-choketrace-b-prereg.md
- Evidence (this file): evidence/2026-11-10/sim-choketrace-b.md
- Analysis output: evidence/2026-11-10/choketrace-b-analysis.txt
- Corpus: evidence/2026-11-10/perseed-choketrace-b/choketrace-b-s14020{1..8}.json
- Driver: scripts/choketrace-b-driver.js (new)
- Analyzer: scripts/choketrace-b-analyze.js (new)
- Proof: scripts/test-choketrace-b.js (17/17)
