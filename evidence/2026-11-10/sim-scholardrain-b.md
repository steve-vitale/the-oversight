# sim-scholardrain-b — quantify the scholar drain on veteran-days (DIAG ONLY, zero src/js)

- Arm: sim-scholardrain-b (Loop B, run fleshout-loop-b-20261110T1248Z, axis scale-onramp / winnability chain)
- Branch: sim-scholardrain-b; base anchor `7c2591d1f` (worktree `~/workspace/worktrees/sim-scholardrain-b`)
- Base verification: `git merge-base --is-ancestor 203a32775 HEAD` PASSES (Loop A wave5kill-a); `git merge-base --is-ancestor 5db4f6fef HEAD` PASSES (Loop A answermail-a); `git merge-base --is-ancestor 75f376185 HEAD` PASSES (capstoneready-b driver revision: scholarId rows + kill-time sampling). All three landings are in this base.
- Prereg: evidence/2026-11-10/sim-scholardrain-b-prereg.md (written before any scored seed; committed as `9bf99e61a`)
- Instrument: scripts/scholardrain-b-driver.js + scripts/scholardrain-b-analyze.js (new), reusing scripts/capstoneready-b-driver.js (`snapshotLadder`, `wrapKillRecorder` — imported, not copied). Additions, all pure reads: per-day `killerFates` for every distinct wave-4+ killer in the kill log (scholar kills INCLUDED), and `scholarChanges` (scholarId transitions between daily rows, with the outgoing scholar's alive state observed at the change). Proof: scripts/test-scholardrain-b.js (all legs pass at 30d AND at the full 150d horizon — classification, determinism, neutrality vs the capstoneready recorder, succession attribution, log-not-counter). Ontology: untouched (zero src/js).
- Corpus: evidence/2026-11-10/perseed-scholardrain-b/scholardrain-b-s14021{7..24}.json (8 seeds, 1,008 daily rows total, 0 recorder errors)
- Seeds: 140217–140224, fresh band (0 hits per seed in evidence `*.md`, evidence filenames, scripts/, and `~/memory/`)
- Policy: plain competent (`scripts/policies/competent.js`, no env arms). Horizon: 150d, death-aware (5 villages died before d150; 3 survived the full horizon).
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it"). The rule being measured: `_ladderLivingVeterans(4)` counts living roster members with a wave-4+ kill in `state.waveKillLog`, and the scholar is NEVER counted.
- Context (must-read): the 1142Z re-measure (evidence/2026-11-10/sim-capstoneready-remeasure-b.md, seeds 140201–140208) and band 2 (evidence/2026-11-10/sim-capstoneready-remeasure2-b.md, seeds 140209–140216) observed the drain without quantifying it: 15 of 21 wave-4 kills on band 1 were made by the scholar at kill time; both ready windows closed when the pair's members took the scholar's seat; Valeria Quispe killed FOUR wave-4 beasts d90–112 on 140210 and the tribute counter never moved. THIS run is the quantification those two censuses called for. It decides nothing: succession vs scholar exemption vs killer protection stays a design question.

## Verdict: DIAG-GO (primary metric, judged strictly)

- **Primary metric: living-veteran-days lost to succession vs lost to death, named on 8/8 seeds (GO needed 8/8). DIAG-GO.**
- Both numbers are named on every seed, including the no-killer seed 140221 (0/0, flagged `no-killers`). No sample-vs-fate killer-set discrepancy on any seed.

## Per-seed table

| seed | days | end | maxWave | peak ladder stage | peak scale | killers | w4+ kills (scholar) | veteran-days counted / succ / death | ready windows | peak living vets (daily / kill-time) | scholar successions (promoted killer) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 140217 | 146 | village-lost | 5 | 3 | regional | 4 | 5 (3) | 67 / 14 / 130 | 1 (closed succession) | 2 / 2 | 13 (3) |
| 140218 | 150 | survived | 4 | 3 | regional | 2 | 2 (1) | 5 / 0 / 67 | 0 | 1 / 1 | 10 (0) |
| 140219 | 150 | survived | 4 | 3 | regional | 3 | 3 (2) | 10 / 14 / 119 | 0 | 1 / 1 | 10 (2) |
| 140220 | 86 | village-lost | 4 | 3 | regional | 1 | 1 (1) | 0 / 13 / 24 | 0 | 0 / 0 | 12 (1) |
| 140221 | 84 | village-lost | 4 | 3 | village | 0 | 0 (0) | 0 / 0 / 0 | 0 | 0 / 0 | 6 (0) |
| 140222 | 89 | village-lost | 4 | 3 | regional | 2 | 2 (1) | 2 / 5 / 6 | 0 | 1 / 1 | 4 (0) |
| 140223 | 150 | survived | 4 | 3 | regional | 2 | 2 (0) | 19 / 7 / 0 | 0 | 1 / 1 | 4 (1) |
| 140224 | 120 | village-lost | 4 | 3 | regional | 2 | 2 (2) | 0 / 8 / 46 | 0 | 0 / 0 | 8 (1) |

## The drain, quantified (pooled 8 seeds)

- **Veteran-days after a first wave-4 kill: 556 recorded days. Counted toward the tribute: 103 (18.5%). Lost to succession: 61 (11.0%). Lost to death: 392 (70.5%).**
- **Death is the bigger drain by 6.4×** (392 vs 61 death-days). Succession's share of all lost veteran-days is 0.135. The drain is mostly that killers die, not that they get promoted — but succession is the drain that bites exactly when it matters (see Ready windows).
- **Kills made as scholar: 10 of 17 (0.588).** Ten kills never counted toward the tribute the moment they happened. Band 1 measured 15/21 (0.714); pooled across the two directly-measured bands, 25 of 38 wave-4+ kills (0.658) were the scholar's.
- **10 of the 16 killers were scholar for at least one of their kills.** 7 were already scholar when they made their first wave-4 kill (Fatima Hassan, Pablo Lorenz, Jovan Milic, Paul Aguilar, Ruby Callaghan, Ruth Goldstein, Asher Niu); 2 more took the seat the same day they killed (Carla Ricci, Dale Hoffman — their kills landed after that day's snapshot, so the seat shows on the next day's row); only 3 of 16 never held the seat at all (Yati Tanuwijaya, Ashley Reynolds, Lucia Cannavaro).
- **Time from kill to scholar seat (13 killers who ever took it): median 0 days.** Seven took it at kill time (0), two within a day (1), then 10, 16, 30, 37 days (Tânia Aguiar, Wei Chen, Ursula Weber, Emma Larsen). The seat does not wait: 9 of 13 seat-taking killers held it on their kill day or the day after.
- **Killers alive at the end: 4 of 16 — and only 1 of the 4 counted.** Tânia Aguiar and Wei Chen are alive holding the seat; Ruth Goldstein is alive holding the seat; only Lucia Cannavaro (killed d149, two days before the horizon) is alive as a counted non-scholar veteran. Every other killer is dead.
- **Scholar turnover: 73 successions across 8 seeds (4–13 per seed, plus the initial scholar each).** Every succession in the corpus followed a scholar death (all recorded changes have `fromAlive: false` — no alive handover was observed on any seed). 8 of the 73 successions promoted a wave-4+ killer. And 77 of the 106 villager deaths in the corpus were scholar deaths (73%): the scholar is the one out dying.
- **Peak living veterans: 2 on one seed (140217), 1 on four seeds, 0 on three.** Kill-time sampling agrees with the daily snapshot on every seed — no sub-day 2-veteran overlap was missed anywhere this band.

## Secondaries

1. **Kills as scholar:** 10/17 pooled (per seed: 3/5, 1/2, 2/3, 1/1, 0/0, 1/2, 0/2, 2/2). Two seeds (140220, 140224) had ALL their wave-4 kills made as scholar — their tribute counters sat at zero the whole run despite kills happening.
2. **Time to seat:** median 0 days (above); full list in the per-killer table below.
3. **Ready windows closed by succession vs death: 1 window total — closed by succession, 0 by death, 0 censored.** Seed 140217's window (d99–d127, 29 days) closed the day Emma Larsen took the scholar's seat. No other seed ever had 2 living veterans at once, so no other window existed to close.
4. **Peak living veterans:** daily 2 / kill-time 2 (140217 only); the other seeds peak at 1 or 0.
5. **Scholar turnover:** 73 successions; 8 promoted a killer (140217: 3, 140219: 2, 140220: 1, 140223: 1, 140224: 1).

## Per-killer table (all 16 killers, names and days)

| killer (seed) | kills (scholar) | first kill | days to seat | death | veteran-days counted / succ / death |
|---|---|---|---|---|---|
| Carla Ricci (140217) | 1 (1) | d73 | 1 (seat same day; kill after snapshot) | d80 the wild, as scholar | 0 / 6 / 67 |
| Emma Larsen (140217) | 1 (0) | d91 | 37 | d128 the wild, as scholar | 37 / 1 / 18 |
| Ursula Weber (140217) | 2 (1) | d99 | 30 (2nd kill d129 as scholar) | d136 contest, as scholar | 30 / 7 / 11 |
| Fatima Hassan (140217) | 1 (1) | d113 | 0 (scholar at kill) | d113 the arena, as scholar | 0 / 0 / 34 |
| Pablo Lorenz (140218) | 1 (1) | d95 | 0 (scholar at kill) | d95 the wild, as scholar | 0 / 0 / 57 |
| Yati Tanuwijaya (140218) | 1 (0) | d137 | never | d142 monster | 5 / 0 / 10 |
| Jovan Milic (140219) | 1 (1) | d85 | 0 (scholar at kill) | d86 the wild, as scholar | 0 / 1 / 66 |
| Paul Aguilar (140219) | 1 (1) | d87 | 0 (scholar at kill) | d98 dehydration, as scholar | 0 / 12 / 53 |
| Tânia Aguiar (140219) | 1 (0) | d141 | 10 | alive (scholar at end) | 10 / 1 / 0 |
| Ruby Callaghan (140220) | 1 (1) | d50 | 0 (scholar at kill) | d63 contest, as scholar | 0 / 13 / 24 |
| Ashley Reynolds (140222) | 1 (0) | d81 | never | d83 the wild, as scholar | 2 / 0 / 6 |
| Ruth Goldstein (140222) | 1 (1) | d84 | 0 (scholar at kill) | alive (scholar at end) | 0 / 5 / 0 |
| Wei Chen (140223) | 1 (0) | d129 | 16 | alive (scholar at end) | 16 / 7 / 0 |
| Lucia Cannavaro (140223) | 1 (0) | d149 | never | alive (counted at end) | 3 / 0 / 0 |
| Asher Niu (140224) | 1 (1) | d75 | 0 (scholar at kill) | d77 a stranger, as scholar | 0 / 3 / 44 |
| Dale Hoffman (140224) | 1 (1) | d114 | 1 (seat same day; kill after snapshot) | d119 dehydration, as scholar | 0 / 5 / 2 |

Notes on the table: "days to seat" counts from the first kill to the first recorded day the killer holds the seat; 0 means scholar at kill time. A killer who kills and dies the same day (Fatima Hassan, Pablo Lorenz) counts that day as lost-to-death — they were never a living veteran on any recorded day. "Death as scholar" is from the death telemetry (`player: true`); Ashley Reynolds died as scholar two days after her kill, having taken the seat in between (her 2 counted days are d81–d82).

## Sense-test: what the village looked like (seed 140217, read day by day)

Haven climbs fast — National ladder stage early, regional scale — and the scholar's seat turns over thirteen times in 146 days, every single time because the bearer died. The fighting story is four people, and the seat eats three of them. Carla Ricci kills a wave-4 Eulogy on day 73, the same day she takes the seat after Patricia Contreras dies; she kills as scholar, so the kill never counts, and she dies in the wild on day 80, still holding the seat. Emma Larsen kills on day 91 as a companion and stands as the village's only counted veteran for 37 days — the longest any killer on this band ever counted. Ursula Weber kills on day 99, and the next morning the tribute reads ready for the first time on this band: two living veterans, Emma and Ursula, standing together. They stand together for 29 days while the village holds — and nothing is delivered, because no one in bot play tries to deliver it. Fatima Hassan takes the seat on day 99, kills a Congregation on day 113 as scholar, and dies the same day in the arena, still holding the seat — a kill that added nothing and a seat that turned over within hours. On day 128 Elif Demir dies and Emma takes the seat; the tribute window closes that same day, exactly as both prior bands' windows closed — not because anyone died, but because the veteran became the scholar. Emma dies the same day in the wild, as scholar. Ursula takes the seat on day 129, kills a wave-5 Network Note that day as scholar — the band's only wave-5-adjacent kill, uncounted — and dies on day 136 in a contest, as scholar. The village dies on day 146 with one person left. It is a village that did the hard thing — two living veterans at once, for a month — and then watched the scholar's seat eat them one by one, in the same order, on the same days, as the two bands before it.

The other seeds tell the same story in miniature. On 140220, Ruby Callaghan is the village's only wave-4 killer, and she kills as scholar — the village's tribute counter sits at zero for all 86 days while its one killer holds the seat for 13 days and dies in a contest. On 140224, both killers kill as scholar (Asher Niu d75, Dale Hoffman d114) — two kills, zero counted veteran-days on the whole seed. On 140221, the village dies on day 84 having never killed a wave-4 beast at all. Nothing here reads robotic: people fight, take the seat, die in the wild, and are succeeded, exactly as the game asks them to. The incoherence is in the deed, as before: the work is done from the scholar's seat, and the seat never counts.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 2/8 (140217, 140223)
- Median survival: 133 days (result days sorted: 84, 86, 89, 120, 146, 150, 150, 150)
- Villager deaths per seed: 106 total; top causes: the wild (65), monster (12), starvation (8), sickness (6), the arena (5). 77 of the 106 villager deaths were scholar deaths.
- Pooled across all four capstone censuses (32 seeds: baseline 140101–140108, band 1 140201–140208, band 2 140209–140216, this band 140217–140224): tribute ever-ready 3/32 (baseline 0/8, band 1: 2/8, band 2: 0/8, this band: 1/8); scholar kills 25/38 on the two directly-measured bands (band 1: 15/21, this band: 10/17).

## Metric review

- **The primary metric works, but the naming bar is weak in exactly the way the prereg predicted.** "Both numbers named on 8/8" certifies the table is complete — the analyzer computed both drain numbers for every seed, including the 0/0 no-killer seed — not that the drain is large. The quantification's force is in the pooled shares reported alongside (18.5% counted, 11.0% succession-lost, 70.5% death-lost; succession share of lost 0.135), not in the GO itself. Do not re-score this run under any other rule — the DIAG-GO stands as registered. Proposed revision for the next measurement: judge on the pooled shares with a bar (e.g. succession share of lost veteran-days named to ±0.05 on a 16-seed pooled band), and treat a no-killer seed as excluded from the naming count rather than named-vacuous, so a band with no kills cannot pass on zeros.
- **Instrument notes.** (a) Kill-day snapshot lag: a kill that lands after that day's snapshot first appears in the next day's `killerFates` row (Carla Ricci d73, Dale Hoffman d114 — both took the seat the same day they killed, so the seat shows a row late and `daysToSeat` reads 1, not 0). The window counts recorded rows only, so the kill day itself is never counted for those killers — a ≤1-day undercount of counted days per affected killer, conservative in the tribute's favor (it can only shrink the counted share, never inflate it). (b) Rows run to scholar-day 151 on surviving villages (the final end-state row lands one day past the 150d horizon; `resultDays` 150, `gameDays` 151). The extra day is uniform across surviving seeds and is counted in veteran-days wherever a killer was alive then (e.g. Tânia Aguiar's single succession day is d151). (c) A killer who kills and dies the same day counts that day as lost-to-death (Fatima Hassan, Pablo Lorenz) — they were never a living veteran on any recorded day; the convention is stated in the prereg and applied uniformly. (d) `daysToSeat` reads the first recorded isScholar row at/after the kill; combined with (a), a same-day seat-taking after the snapshot reads 1. The narrative above names the two affected killers explicitly rather than letting the number stand alone. (e) No sample-vs-fate discrepancy on any seed: the kill-time samples and the daily fate tables agree on all 16 killers.
- **No metric re-scoring.** The GO is the naming bar as registered; the movement signal is the pooled shares and the per-killer table.

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-scholardrain-b/scholardrain-b-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0 — identical to all three prior capstone censuses.
- Investigation: NOT a game finding. (a) Regime artifact, stated in the baseline's own `_regime` note (verified by the prior arms by reading the file): the scale-wall baseline is the winseat full win-side stack (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT, SEATDRIVE, 180d, 16/16 wins) and its note says verbatim "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This census is exactly such a substrate (plain competent, no seat-drive, no capstone delivery). (b) Schema absence: the per-seed census files carry no `nationalEver` or `table` fields (they record peak scaleRank and `won`), so national/table read 0 by absence, not by measurement. The `wins` 0/8 is measured (won=false on all 8) and is the expected value for this regime. No action; a regime-segregated readiness baseline is a coordinator call, not this arm's.

## What this means for the design question (not a verdict, a pointer)

- The drain has two ends and they are not equal. Death took 392 veteran-days; succession took 61. A build aimed only at succession (don't promote veterans, or exempt the scholar) can recover at most the 61 succession-days plus the 10 scholar kills that never counted — real, but a minority of the loss. A build aimed at keeping killers alive after the kill addresses the 392 — the bigger end by 6.4×. Neither half alone recovers the 103 counted days into a durable pair: the tribute needs TWO killers alive AND non-scholar AT ONCE, and this band produced exactly one such moment (29 days on 140217).
- Succession still matters out of proportion to its days, because it closes windows: the only ready window on this band closed by succession, as did both windows on band 1. And the seat takes killers fast — median 0 days from kill to seat, 9 of 13 seat-takers holding it on their kill day or the day after. A succession-shaped fix would not need to save many days to save the windows; a survivability-shaped fix would need to save many days to make the pairs.
- The shape stays a design question. The numbers now say, for whoever decides it: death 392, succession 61, counted 103, scholar kills 10/17, median kill-to-seat 0 days, one window closed by succession.

## Files

- Prereg: evidence/2026-11-10/sim-scholardrain-b-prereg.md (`9bf99e61a`)
- Evidence (this file): evidence/2026-11-10/sim-scholardrain-b.md
- Corpus: evidence/2026-11-10/perseed-scholardrain-b/scholardrain-b-s14021{7..24}.json (8 seeds, 1,008 daily rows, 0 recorder errors)
- Driver: scripts/scholardrain-b-driver.js (new)
- Analyzer: scripts/scholardrain-b-analyze.js (new)
- Proof: scripts/test-scholardrain-b.js (all legs pass at 30d and 150d)
- Zero src/js changes. Zero findings appended to the backlog from this arm (the drain quantification is this arm's own finding, recorded here).
