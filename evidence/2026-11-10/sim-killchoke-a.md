# sim-killchoke-a — kill choke-point trace (REPLICATION of choketrace-b, DIAG ONLY, zero src/js changes)

- Arm: sim-killchoke-a (Loop A run fleshout-20261110T1915Z, axis scale-onramp / winnability chain)
- Branch: sim-killchoke-a; base anchor `70e3af870` (worktree `~/workspace/worktrees/sim-killchoke-a`)
- Prereg: evidence/2026-11-10/sim-killchoke-a-prereg.md (written before any scored seed)
- Instrument: scripts/killchoke-a-driver.js + scripts/killchoke-a-analyze.js (new; independent implementation — raw stack frames stored in the corpus, paths classified OFFLINE in the analyzer; settlement-invocation counting added) + scripts/test-killchoke-a.js (26/26 legs: classify 12, live synthetic-burst 5, synthetic shapes 6, determinism + invocation-counting + neutrality 3).
- Corpus: evidence/2026-11-10/perseed-killchoke-a/killchoke-a-s14020{1..8}.json (8 seeds, 150d death-aware, competent policy, 0 recorder errors, 0 unattributed calls)
- Analysis: evidence/2026-11-10/killchoke-a-analysis.txt
- Canon: NO separate canon doc covers the kill choke point. The spec is the code itself — src/js/game.js `recordWaveKill` (the choke point, with the vetcount-reconcile one-body-one-count rule) and src/js/waveLedger.js `scoreLedgerKill` (per-type cap 2, breadth over farming) — plus docs/MONSTER-WAVES.md (wave law) for the belltoad-chorus pack behavior.
- Context (must-read): evidence/2026-11-10/sim-vetcount-reconcile-b.md § "The disagreement was bigger than wave 4", and evidence/2026-11-10/sim-choketrace-b.md.

## Sibling-work disclosure

Loop B arm **sim-choketrace-b already answered this exact question on this exact band** — commit `74eccccd2` (2026-11-10 16:18Z), already on local master. Its verdict was DIAG-GO: 16/16 bursts attributed, 0 UNATTRIBUTED; the headline finding overturns the premise — **there is no re-fire**: all 32 "duplicate" calls are genuine second/third/fourth bodies that the (day, mid, by, via, trick) dedupe key collapses. This arm runs as an **independent replication / confirmation** with a genuinely independent implementation (offline stack classification, not live classification) plus one coverage extension the sibling left open (settlement-invocation counting). The coordinator's 1915Z claim listed the kill-choke trace as tracker blank #9, apparently unaware choketrace-b had already landed; this arm does not pretend otherwise.

## Verdict: PRIMARY DIAG-GO (trace completeness, judged strictly)

- **Primary metric: attribution coverage of re-fire bursts. DIAG-GO: 19/19 bursts attributed to a named caller path, 0 UNATTRIBUTED, 0 UNRESOLVED, 0 instrument errors.**
- **The replication confirms the sibling's premise-overturning finding on current master: there is still no re-fire.** All 29 "duplicate" calls are genuine second/third/fourth bodies that the dedupe key collapses. The choke point fires exactly once per body on this band. No caller path re-fires; no settlement runs twice for one kill; no cross-path double-report exists.
- **Secondary metric (replication agreement): 2/8 exact — NO-GO as written, INVESTIGATED.** Per-seed call/dup totals agree exactly with the choketrace-b corpus on 2/8 seeds (140203, 140207) and differ on 6/8. The cause is **base drift, not instrument error** — see Metric review. The instrument is exonerated: on the two seeds where the game plays identically, counts agree exactly (140203: 58 calls / 2 dup / 1 pyrrhic / 117d; 140207: 83 / 0 / 0 / 75d), and nine of the sibling's sixteen bursts reproduce identically (same day, monster, killer, ordinals) where trajectories coincide. The overall verdict stands as DIAG-GO on the question asked; the secondary miss is a metric-review item, and the analyzer's verdict block now reports the two verdicts separately (reporting split only — no number changed).

## The caller paths, named (grep census re-verified in this worktree, confirmed live)

Nine recordWaveKill call sites, eight `via` channels. Six fired on this band (contest-hide is new vs the sibling's band — see below); three never fired (0 calls):

| path | call site | via | calls | dup calls | choketrace-b calls/dups |
|---|---|---|---|---|---|
| wild | game.js:20756, resolveWildMonsterEncounter | wild | 282 | 2 | 279 / 2 |
| agency | villager-agency.js:465, expeditionMonster | agency | 152 | 0 | 168 / 0 |
| tb-end | game.js:46716, tbEnd | player / companion | 102 | 10 | 105 / 21 |
| contest-blood | contestEngine.js:401, _cxBlood | contest | 40 | 17 | 25 / 9 |
| aid-crisis | comms.js:669, aidFight | aid-crisis | 8 | 0 | 7 / 0 |
| contest-hide | contestEngine.js:633, _cxOther (hide) | contest | 3 | 0 | 0 / 0 |
| patrol | game.js:8073, resolvePatrol | patrol | 0 | 0 | 0 / 0 |
| sortie | havenGrowth.js:913, lingererSortie | sortie | 0 | 0 | 0 / 0 |
| contest-beastmaster | contestEngine.js:661, _cxOther (beastmaster) | contest | 0 | 0 | 0 / 0 |

Total: 587 calls (585 recordWaveKill + 2 recordPyrrhicKill), 557 log entries, 29 dup calls, 0 UNATTRIBUTED, 0 recorder errors. Reconciliation holds 8/8 (log == counter, fixed engine). One recordWaveKill call is neither logged nor a dup: 140202 d99 `ad_sponsor` (the Ad Break sponsor-creature add, wave 0 — the engine reports it through the choke point but writes no log entry for a wave-less monster; ledger add 0). Not a burst, not a re-fire.

## The bursts, all nineteen (shape verdicts from the analyzer)

Every burst states its shape — same settlement invocation vs several, same vs several monster instances, dead-fighter census — from the recorded evidence, not from the key alone. Full per-call detail: evidence/2026-11-10/killchoke-a-analysis.txt.

**TB fights, one fight, several dead of the type (5 bursts, 10 re-fires) — the belltoad-chorus shape.** The dead-fighter census proves it in every case (dead count == burst size):

- 140201 d64 paparazzo x2, scholar gen_sm0tpyn, trick "move_windup" x6 — 1 fight, 2 dead paparazzo. (Identical to the sibling's burst.)
- 140202 d54 belltoad x4, scholar gen_gognxmz, trick "shout" x3 — 1 fight, 4 dead belltoad. (Identical.)
- 140202 d54 hummice x3, companion gen_h3r9ke8, trick "shout" — 1 fight, 4 dead hummice. (Identical; the 4th body is a different companion's kill, its own log entry.)
- 140206 d26 bulldozer x2, scholar gen_9dl273w, trick "sidestep" x2 — 1 fight, 2 dead bulldozer. (Identical.)
- 140208 d90 belltoad x4, scholar gen_g5s5zoe, trick "shout" x3 — 1 fight, 4 dead belltoad. (Identical.)

**Contest gauntlets, one contest, same beast type across waves (12 bursts, 17 re-fires).** _cxBlood loops waves 1..N; each wave's vKill is a fresh beast. Ordinals prove the waves (1,2,3 / 1,2 / 2,3 / 1,3):

- 140201 d125 nightlight_catfish x2, Elena Petrova, ordinals 1,3. (New on this band.)
- 140202 d54 giant_mosquito x3, Jesse Cortez, ordinals 1,2,3. (Identical.)
- 140202 d77 giant_mosquito x2, Meera Reddy, ordinals 1,3. (New.)
- 140202 d80 nightlight_catfish x3, Hannah Kim, ordinals 1,2,3. (New.)
- 140203 d40 giant_mosquito x3, Ivy Wang, ordinals 1,2,3. (Identical.)
- 140204 d79 hummice x3, Raj Patel, ordinals 1,2,3. (New.)
- 140205 d67 giant_mosquito x3, Mateo Alvarez, ordinals 1,2,3. (New.)
- 140205 d121 giant_mosquito x2, gen_ed2r9nh, ordinals 1,2. (New.)
- 140206 d33 giant_mosquito x2, gen_cyv606n, ordinals 1,2. (Identical.)
- 140206 d39 mirrormoth x2, Hannah Kim, ordinals 2,3. (Identical.)
- 140208 d107 mirrormoth x2, Petra Novak, ordinals 1,2. (New.)
- 140208 d136 giant_mosquito x2, David Kim, ordinals 1,2. (New.)

**Wild field fights, two settlements, two distinct world monsters (2 bursts, 2 re-fires).** The fieldFight monster-object ids differ — two beasts of the same type, killed in two separate fights the same day:

- 140205 d17 hushwolf x2, gen_zw4nq99, objects #7 and #8. (Identical.)
- 140205 d17 anaconda_empress x2, gen_sbkg87l, objects #10 and #11. (Identical.)

**Zero cross-path bursts. Zero same-instance re-fights. Zero single-settlement re-fires.** No burst spans two caller paths; no burst shows the same world-monster object fought twice; no burst shows one settlement reporting one body twice. The three re-fire shapes the prereg feared do not occur on this band either.

**Bursts present in the sibling's corpus but absent here (4):** 140201 d116 nightlight_catfish x3, 140204 d75 belltoad x8 (the famous 8x — the village now dies d84 and the chorus fights never happen), 140204 d75 giant_mosquito x2, 140208 d135 congregation x2 (the tribute-opening kill — on current master the tribute first reads ready d122 and the d135 fight never happens). All four absences are trajectory consequences of the base drift, not attribution gaps: the fights themselves never occurred on this engine.

## The ledger double-score, quantified

For each of the 29 re-fire calls, the ledger per-type before/after around the call:

- **Scored twice (add = 1): 3.** 140204 hummice (w1, points 29→30, perType 1→2); 140205 hushwolf (w1, 6→7, perType 1→2); 140208 giant_mosquito (w2, 12→13, perType 1→2). All three landed on waves whose bars were already full (bars 5, 5, 4 — points already above the bar before the re-fire), so no unlock timing moved.
- **Already capped (add = 0): 26.** Per-type already at cap 2 (usually filled by earlier kills of the same type on earlier days). No effect of any kind.
- **Bar crossings caused by a re-fire: 0.**
- **Reframe (same as the sibling's):** the 3 "double-scores" are genuine second bodies scoring, as they should — the ledger counts kills, and two hummice died. The ledger is the tally closest to body-truth here, not the double-counter.

## The counter undercounts bodies (measured again, on the new base)

The vetcount fix made counter == log. This arm re-measures what the log itself loses: 585 genuine recordWaveKill calls (one per body — zero re-fires found; the 586th call is the wave-0 sponsor add) produced 555 log entries. **The log and the counter both undercount bodies by 30/585 (5.1%) on this band** (sibling: 32/583, 5.5%), because the (day, mid, by, via, trick) key cannot tell bodies apart when one fight kills several of a type, one gauntlet repeats a type across waves, or one day holds two fights against the same type by the same killer. The "one body = one count" invariant holds only modulo the dedupe key. The fix direction stands as filed: the key needs a beast-instance id. This arm adds a second measurement of the loss (30 bodies, 5.1%) on a moved base, and the proof that no caller-side fix exists to make instead — the callers are correct.

## Coverage extension: settlement-invocation totals

The sibling left four paths unexercised (0 calls) without knowing whether the settlement functions ever ran. This arm counts invocations of each settlement function (1,316 total on the band):

| settlement function | invocations | kill calls | reading |
|---|---|---|---|
| resolveWildMonsterEncounter (wild) | 549 | 282 | exercised, kills often |
| expeditionMonster (agency) | 468 | 152 | exercised, kills often |
| tbEnd (tb-end) | 211 | 102 | exercised, kills often |
| aidFight (aid-crisis) | 35 | 8 | exercised, kills rarely |
| _cxOther (contest-other) | 27 | 3 | exercised, kills rarely |
| _cxBlood (contest-blood) | 26 | 40 | exercised (one invocation reports several wave kills) |
| resolvePatrol (patrol) | 0 | 0 | **never ran** — unexercised because patrols never happen under competent play on this band, not because patrols ran clean |
| lingererSortie (sortie) | 0 | 0 | **never ran** — same |

Two extensions beyond the sibling: (1) **contest-hide is now exercised**: 3 calls, all clean, 0 dups — 140205 d83 heckler x2 (Mateo Alvarez, Yara Haddad) and 140208 d110 heckler (Sam Wilson). The hide path reports kills correctly. (2) **patrol and sortie never run at all** on this band — a band that exercises patrols and sorties is still needed to attribute bursts on those paths, if any ever occur there; contest-beastmaster likewise still has 0 calls (no beastmaster contest occurred — contest ids seen on kill calls: siege, gauntlet, hide, pit).

## The second pyrrhic (new on this band)

Two recordPyrrhicKill calls: 140203 d109 reunion by Lena Ruiz via player (the vetcount-documented one) and **140208 d140 ducks_in_a_row by Petra Novak via player** (new — the village lost a fight the same day Petra killed a ducks_in_a_row; the kill scored nothing toward wave bars, as designed). The pyrrhic path fires only from tbEnd on lost fights, as designed.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 2/8 (140201, 140208 — sibling: 1/8; 140201 now reaches wave 5 under the scholar-count veteran read)
- Median survival: 121 days (75, 84, 111, 117, 125, 130, 148, 150) — sibling: 125.5
- Military tribute ever-ready: 2/8 (140201 d90, 140208 d122) | trade charter 0/8 | feast embassy 0/8
- Peak living veterans (scholar-inclusive read): [3,1,1,1,1,1,1,2] — identical to the scholarcount-a corpus on all 8 seeds
- Deaths per seed: trajectories differ from the sibling's on 6/8 seeds (base drift — see Metric review).

## Secondaries (expected unchanged — confirmed where the base did not move)

- Trajectories vs the choketrace-b corpus: 2/8 MATCH exactly (140203, 140207 — days, endReason, maxWave, call/dup/pyrrhic/burst counts all identical); 6/8 differ (see Metric review for the cause).
- Trajectories vs the scholarcount-a corpus (same band, scholar-count engine): peak living veterans match 8/8; days differ on 6/8 (the remaining drift is the tendexact + r125 changes — see Metric review).
- Reconciliation: 8/8 agree, all waves 1–5 (the fixed engine, re-confirmed under the recorder).
- Proof test scripts/test-killchoke-a.js: 26/26 legs pass, including determinism and neutrality at 30d on seed 140204 (recorder off = byte-identical trajectories vs recorder on).
- check.js --quick: NOT run to completion on this arm (scripts + evidence only, no src/js changes — the green list cannot differ from base on this arm's account; the sibling arm on the same base lineage recorded the same constraint and the same nearest baseline, vetcount 293 passed / 7 failed, all pre-existing). The ship loop's check run on merge remains the gate.

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-killchoke-a/killchoke-a-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0 — identical to the vetcount and choketrace-b runs.
- Investigation: NOT a game finding — the same regime artifact both prior arms documented (the scale-wall baseline is the winseat full win-side stack; this census is a pre-seat readiness substrate; the per-seed files carry no `nationalEver`/`table` fields, so national/table read 0 by absence). The `wins` 0/8 is measured and is the expected value for this regime. No action.

## Metric review

- **The primary metric judged what it claimed to judge, and the verdict is DIAG-GO.** 19/19 bursts attributed, 0 UNATTRIBUTED, 0 UNRESOLVED, with per-burst shape verdicts backed by invocation ids, fight ids, monster-object ids, and dead-fighter censuses — not by the dedupe key alone. The attribution machinery proved itself on the synthetic burst corpus first (26/26 proof legs, including forced RE-FIRE shapes classified correctly in both directions: genuine multi-body vs same-instance re-fire) and then on the live band. The structural verdict replicates the sibling's: no re-fire on either engine.
- **The secondary metric (exact per-seed agreement with a corpus from an older base) proved to be the wrong instrument — it confounds base drift with recorder fidelity, and it missed 6/8.** Investigation, before verdict: the game-code delta between the choketrace-b engine (3838d86dc) and this engine (70e3af870) is exactly three commits — `3995d21d6` scholarcount (scholar kills count in the veteran bar — changes the veteran read but NOT trajectories: the scholarcount-a corpus, recorded on the scholar-count engine, matches choketrace-b's days exactly on 8/8 seeds), `e6911eb80` tendexact (exact-split `_removePantryKcal` — real pantry-economy change, trajectory-moving), and `10fe7ee52` deepening r125 (secret-line variety via `convoPick` and `convoTeachPlantLine`, which draw `Math.random()` — narration changes that consume RNG shift all downstream randomness). The drift between the scholarcount-a corpus engine (anchor ecf1b7e1bda2, a rebased twin of 3995d21d6) and this engine is exactly the tendexact + r125 changes (verified by `git diff ecf1b7e1bda2..HEAD -- src/js`: conversation.js, hierarchy.js, villager-agency.js only). The instrument is exonerated by the two exact-match seeds and by nine identically-reproduced bursts. **Revision proposed for the next replication:** judge agreement against a corpus recorded on the SAME base (or, when the base has moved, at shape level — burst shapes and ledger verdicts — not at exact per-seed counts). A replication that demands exact counts across a moved base will always fail for the wrong reason.
- **Coverage limit (narrowed, not closed):** contest-hide is now exercised (3 calls, clean). Patrol and sortie never ran at all on this band, and no beastmaster contest occurred — those three paths remain unexercised, now with the sharper statement that the functions themselves never execute under competent play here, not merely that they report no kills.
- **What this arm does NOT change:** no src/js changes (DIAG ONLY, per the task). The counter/log agreement is untouched. The follow-up the coordinator should queue remains the one both trace arms filed: the dedupe key needs a beast-instance id if the log/counter must count bodies (now measured twice: 32 bodies / 5.5% on the old base, 30 bodies / 5.1% on the new base). That is a counting change with its own re-measure, not a caller fix — there is no caller fix to make.
- **Analyzer reporting fix (numbers unchanged):** the first analyzer run printed `military_tribute ever-ready: 8/8` — a truthiness bug (`if (s.everReady)` on the everReady object, always truthy). Fixed to read `s.everReady.military_tribute` (now 2/8, matching the per-seed summaries), and the verdict block was split into PRIMARY vs SECONDARY lines so the analysis file states the judged verdict instead of conjoining two different bars. Both fixes are reporting-only; every counted number is identical before and after.

## Findings backlog

- Updated the vetcount backlog item (kill choke point re-fired up to 8x per kill, sim-findings.md:2083) to **answered**: it did not re-fire — the 8x burst is 8 bodies — confirmed independently by this arm on a moved base (19/19 bursts GENUINE, 0 re-fires). The live follow-up is re-pointed at the dedupe key's body-count loss (30 bodies, 5.1% on this band), which is the item that survives.

## Files

- Prereg: evidence/2026-11-10/sim-killchoke-a-prereg.md
- Evidence (this file): evidence/2026-11-10/sim-killchoke-a.md
- Analysis output: evidence/2026-11-10/killchoke-a-analysis.txt
- Corpus: evidence/2026-11-10/perseed-killchoke-a/killchoke-a-s14020{1..8}.json
- Driver: scripts/killchoke-a-driver.js (new)
- Analyzer: scripts/killchoke-a-analyze.js (new)
- Proof: scripts/test-killchoke-a.js (26/26)
