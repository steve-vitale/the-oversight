# sim-capstoneready-remeasure-b — ladder capstone-deed readiness re-measure (DIAG ONLY, zero src/js)

- Arm: sim-capstoneready-remeasure-b (Loop B, run fleshout-loop-b-20261110T1142Z, axis scale-onramp / winnability chain)
- Branch: sim-capstoneready-remeasure-b; base anchor `57547c8dd` (worktree `~/workspace/worktrees/sim-capstoneready-remeasure-b`)
- Base verification: `git merge-base --is-ancestor 203a32775 HEAD` PASSES (Loop A wave5kill-a, blooded damage/survivability lever for wave-5 kills); `git merge-base --is-ancestor 5db4f6fef HEAD` PASSES (Loop A answermail-a, link seasoning — seasoned 13/15 armed vs 2/15 control on fresh seeds 120101-120116). Both landings are in this base.
- Prereg: evidence/2026-11-10/sim-capstoneready-remeasure-b-prereg.md (written before any scored seed)
- Instrument: scripts/capstoneready-b-driver.js + scripts/capstoneready-b-analyze.js, REVISED by this arm per the baseline Metric review (scholarId per daily row; kill-time veteran sampling via recordWaveKill/recordPyrrhicKill wrappers; analyzer judges the new per-deed primary metric and stays backward-compatible with the old corpus). Proof: scripts/test-capstoneready-b.js (all legs pass at 30d and at the full 150d horizon — determinism, classification, neutrality, kill-time sampling, per-deed blockers, old-format backward compat). Ontology: `node scripts/validate-ontology.js` — "All 135 systems validated. Ontology matches code."
- Corpus: evidence/2026-11-10/perseed-capstoneready-remeasure-b/capstoneready-b-s14020{1..8}.json (8 seeds, 932 daily rows total, 0 recorder errors)
- Seeds: 140201–140208, fresh band (0 hits per seed in evidence `*.md`, evidence filenames, scripts/, and `~/memory/`; checked in both this worktree and the main tree at the same anchor)
- Policy: plain competent (`scripts/policies/competent.js`, no env arms). Horizon: 150d, death-aware (6 villages died before d150; 2 survived the full horizon).
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it").
- Context (must-read): the 1030Z census (evidence/2026-11-10/sim-capstoneready-b.md, base `53185abea`, seeds 140101–140108) is the PRE-answermail / PRE-wave5kill baseline: 0/8 ever-ready on all three deeds, peak 1 living veteran, 0 charters, 0 bundles, scale never national, median survival 87d. THIS run is the re-measure on current master, after both levers landed.

## Verdict: GO (primary metric, judged strictly)

- **Primary metric: per-deed binding blocker named on 8/8 seeds for ALL THREE deeds (GO needed >=7/8 per deed). GO.**
- Per-deed ever-ready: military_tribute **2/8** (140201 first ready d90, 32 ready days; 140208 first ready d135, 3 ready days), trade_charter 0/8, feast_embassy 0/8. The first capstone deed was ever ready in either census — the military tribute moved; the other two deeds did not.
- The pooled-share metric (baseline's, comparison only) still names 0/8, as the baseline predicted it always would.

## Per-seed table

| seed | days | end | maxWave | peak ladder stage (first d) | peak scale | peak living vets (daily / kill-time) | ever ready M/T/F | per-deed blockers (M/T/F) |
|---|---|---|---|---|---|---|---|---|
| 140201 | 138 | village-lost | 4 | 3 (d34) | regional | 2 / 2 | Y/./. (d90, 32d) | veterans-short / no-sealed-charter / no-bundle-feast |
| 140202 | 78 | village-lost | 4 | 3 (d36) | regional | 0 / 0 | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140203 | 117 | village-lost | 4 | 3 (d37) | regional | 0 / 0 | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140204 | 109 | village-lost | 4 | 3 (d30) | regional | 0 / 0 | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140205 | 150 | survived | 4 | 3 (d45) | regional | 1 / 1 | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140206 | 134 | village-lost | 4 | 3 (d22) | regional | 1 / 1 | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140207 | 75 | village-lost | 4 | 3 (d23) | regional | 0 / 0 | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140208 | 150 | survived | 5 | 3 (d40) | regional | 2 / 2 | Y/./. (d135, 3d) | veterans-short / no-sealed-charter / no-bundle-feast |

## Readiness decomposition — before/after vs the 1030Z baseline

| ingredient | baseline (140101–140108) | re-measure (140201–140208) |
|---|---|---|
| military_tribute ever-ready | 0/8 | **2/8** (32 + 3 ready days) |
| trade_charter ever-ready | 0/8 | 0/8 |
| feast_embassy ever-ready | 0/8 | 0/8 |
| wave-4 kills (total) | 10 | **21** |
| peak living non-scholar wave-4 veterans | 1 (never 2) | **2** (on 2 seeds; kill-time sampling agrees — no sub-day overlap missed) |
| kill-time ever-2-veterans | n/a (no samples) | 2/8 |
| ever sealed charters | 0 | 0 |
| ever feast bundles | 0 | 0 |
| peak scaleRank | regional 8/8 | regional 8/8 (never national) |
| median survival | 87d | **125.5d** (75, 78, 109, 117, 134, 138, 150, 150) |
| villages surviving the 150d horizon | 0/8 | 2/8 (140205, 140208) |
| wave-5 kills | — | 0/8 seeds (wave 5 unlocked on 140208, no wave-5 kill) |

1. **Military tribute (needs 2 living non-scholar wave-4 veterans): 2/8 ever ready — the movement in this re-measure.** Wave-4 kills per seed: 140201: 5, 140202: 1, 140203: 1 (+1 pyrrhic, see below), 140204: 1, 140205: 3, 140206: 2, 140207: 2, 140208: 6 (21 log entries; the waveKills counter also totals 21 but disagrees per seed — see instrument note). Peak living veterans [0,0,0,0,1,1,2,2] by daily snapshot, and the kill-time peak is IDENTICAL on every seed — the baseline's feared sub-day overlap did not occur here; the daily snapshot was not missing any 2-veteran moment. The tribute's ready windows are real but narrow and late: 140201 d90–121 (32 days), 140208 d135–137 (3 days). No delivery policy exists in bot play, so readiness is measured, not delivered — as designed for a census.
2. **Trade charter (needs a sealed charter + national scale): 0/8 ever ready, unchanged.** Ever chartered trade links: 0 on all 8 seeds; peak scaleRank regional on all 8 (never national, never global). Both ingredients still at zero. The answermail lever (seasoned 13/15 armed vs 2/15 control on its own band) did not move the charter ingredient on these seeds: no sealed charter appeared in competent bot play at all.
3. **Feast embassy (needs feast bundle + National ladder stage): 0/8 ever ready, unchanged.** The stage half was MET on 8/8 seeds (National reached d22–d45); the bundle half was never met (0 feast-bundle flags on all 932 rows). The bundle is still the entire missing half.

## The scholar drain, now directly observed (not inferred)

The baseline inferred from death-tele flags that killers kept getting promoted to scholar. This run observes it directly via per-day scholarId and kill-time scholarIdAtKill:

- **15 of the 21 wave-4+ kills were made by the scholar at kill time** (scholarIdAtKill === killer; all via the scholar's own `player` fight channel). A scholar's kill never counts toward the tribute — by design — so 15 of 21 kills contributed nothing to the deed the moment they happened.
- **13 of the 21 kills landed at a moment when ZERO living non-scholar veterans stood** (livingVeteransAtKill = 0). Only 6 kills were made by a non-scholar, and the killers of those 6 mostly became scholar afterwards: 10 of the 14 killers in the last-row tables were ever-scholar, and 3 more killers (David Kim 140202, Emma Larsen 140203, visjoin_63 140207) are visible only in the kill-time samples because the last-row table drops killers who are the current scholar at the end — 17 distinct wave-4+ killers in the log in total.
- The two ready windows show both ends of the drain. On 140201, Elena Petrova (kill d79) and Ingrid Vik (kill d89) stood as the pair for 32 days — but Jesse Cortez, who became scholar d95, killed a Reunion d107 and a Drum-Belly d116 *as scholar*, adding nothing; then Jesse died d121, Elena became scholar d122 and died d123, Ingrid became scholar d124, killed a Strike d127 as scholar (kill-time lv=0), and died d127. The window closed the day the pair's members took the scholar's seat. On 140208, Bridget Crawford killed THREE wave-4 beasts (d62, d75, d77) — all as scholar (87 scholar-days), all uncounted; the ready window only opened d135 when Pasquale Pascual (d122) and Sam Wilson (d135) stood together, and closed 3 days later when Sam died d139.
- The wave5kill-a lever doubled the kill supply (10 → 21) and the tribute moved 0/8 → 2/8 — but the drain is unchanged: killers still die within days (most within ~2–23 days of their kill; the wild is the dominant cause) and still get promoted into the scholar's seat, where their kills stop counting. "More kills" bought the first two ready windows; it did not buy durable pairs.

## The ladder climbs; the scale doesn't (decoupling persists)

- Peak ladder stage 3 (National) on 8/8 seeds, first reached d22–d45 (baseline d28–d58). The ladder is still a village-XP/breadth meter that climbs while the village lives.
- Peak scaleRank regional on 8/8, never national. Ladder National and scale national are still different things: the ladder counts work, the scale counts links/network. A village can be ladder-National for 100 days and never leave regional scale.
- Survival improved (median 87d → 125.5d; 2 villages alive at the 150d horizon) while the scale wall did not move at all.

## Sense-test: what the village looked like (seed 140201, read day by day)

Haven starts with 12 people and climbs fast — Village Standing by day 11, Regional by day 21, National by day 34 — on foraging, crafting, and learning, while the roster quietly bleeds. Days 54–58 are the worst of it: the scholar's seat changes hands five times in five days as bearers die, and the living roster falls to 3. Then the village recovers — new people arrive, the roster climbs back to 9 by day 71 — and the fighting story begins. Elena Petrova kills a wave-4 Eulogy on day 79, the same day Petra Novak dies in the wild as scholar; Elena stands alone as the village's only veteran for ten days. Ingrid Vik kills a Herald on day 89, and the next morning the tribute reads ready for the first time in either census: two living veterans, Elena and Ingrid, standing together. They stand together for 32 days while the village holds at 3–5 people — the longest the village is ever that strong — but nothing is delivered, because no one in bot play tries to deliver it; the readiness just sits there, visible in the numbers, while Jesse Cortez takes the scholar's seat on day 95 and kills two more beasts as scholar, adding nothing to the count. Jesse dies in the wild on day 121. Elena takes the seat, dies two days later; Ingrid takes it, kills a Strike as scholar on day 127, and dies the same day. The village dies on day 138 with one person left, 89 deaths behind it, the top causes villager combat (43), the wild (16), and combat (14). It is a village that finally did the hard thing — two living veterans at once — and then watched the scholar's seat eat them one by one. The pattern is not that veterans are too rare anymore; it is that the people strong enough to kill a wave-4 beast are the same people the village keeps handing the scholar's seat to, and the seat takes them out of the count.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 1/8 (140208 only)
- Median survival: 125.5 days (result days sorted: 75, 78, 109, 117, 134, 138, 150, 150)
- Deaths per seed (telemetry deaths): 68–105; top causes across seeds: villager combat, expedition, combat, the wild.

## Metric review

- **The revised primary metric works as designed, and the verdict is GO.** Per-deed modal blockers are named on 8/8 seeds for all three deeds (each deed's modal share is 1.0 on every seed — each deed has exactly one blocking reason all run: veterans-short / no-sealed-charter / no-bundle-feast). The revision fixed the baseline's structural flaw: the pooled share could never name a blocker, the per-deed rule names all three. One caveat for the next run: with shares of 1.0 everywhere, the naming bar is nearly tautological — the metric certifies that the decomposition is complete (three walls, one reason each), not that the game improved. The movement signal lives in the ever-ready rates and ingredient peaks (military 0/8 → 2/8, kills 10 → 21, peak veterans 1 → 2), which are reported alongside, not inside, the metric. Do not re-score this run under any other rule — the GO stands as registered.
- **Instrument notes for the next census.** (a) Kill-time sampling earned its keep twice: it caught the d89 Ingrid overlap a day before the daily snapshot dated the ready window (d90), and it caught the intra-day scholar succession on 140203 d109 (Lena Ruiz killed as scholar, died, and was succeeded within the same day — the daily row shows only the successor). (b) The kill log and the kill counter disagree per seed and the log is the right source for readiness: on 140203 the log holds 2 wave-4 entries but waveKills counts 1 — a pyrrhic kill (recordPyrrhicKill writes the log but never increments waveKills); on 140208 the counter says 6 but the log holds 5 — a same-day repeat the log dedupes while the counter still increments. Totals agree (21 = 21) by coincidence, not by construction. (c) The analyzer's veteran-fates table (built from the last row) drops killers who are the current scholar at the end — 3 of 17 distinct killers are missing from it (David Kim, Emma Larsen, visjoin_63); the kill-time samples are the authoritative killer list. (d) Daily rows start on scholar-day 2 (unchanged from baseline; immaterial).

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-capstoneready-remeasure-b/capstoneready-b-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0 — identical to the baseline run.
- Investigation: NOT a game finding. (a) Regime artifact, stated in the baseline's own `_regime` note (verified this run by reading the file): the scale-wall baseline is the winseat full win-side stack (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT, SEATDRIVE, 180d, 16/16 wins) and its note says verbatim "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This census is exactly such a substrate (plain competent, no seat-drive, no capstone delivery). (b) Schema absence: the per-seed census files carry no `nationalEver` or `table` fields (they record peak scaleRank and `won`), so national/table read 0 by absence, not by measurement. The `wins` 0/8 is measured (won=false on all 8) and is the expected value for this regime. No action; a regime-segregated readiness baseline is a coordinator call, not this arm's.

## What this means for the next build (not a verdict, a pointer)

- The tribute moved: 0/8 → 2/8 ever-ready, kills 10 → 21, first ready windows of 32 and 3 days. The veteran-supply lever (wave5kill-a) did what it aimed at. But the ready windows are late (d90, d135), narrow, and closed by the scholar drain both times — the next lever on this deed is not more kills but keeping killers alive AND non-scholar (survivability after the kill, succession that does not promote the veteran).
- The charter did not move at all: 0 sealed charters, scale never national on 16/16 seeds across both censuses. If answermail's seasoning works on its own band, it is not reaching a sealed charter in competent bot play — the charter ingredient, not the seasoning rate, is the next question.
- The embassy is still half-built by the game itself: National ladder stage 8/8, fast — the missing half is entirely the feast bundle, which has never completed in competent play across 16 seeds and 1,668 daily rows. Whether the bundle is unattempted, unaffordable, or unwritten by the policy is still unmeasured; the census can only say it never completed.

## Files

- Prereg: evidence/2026-11-10/sim-capstoneready-remeasure-b-prereg.md
- Evidence (this file): evidence/2026-11-10/sim-capstoneready-remeasure-b.md
- Corpus: evidence/2026-11-10/perseed-capstoneready-remeasure-b/capstoneready-b-s14020{1..8}.json
- Driver: scripts/capstoneready-b-driver.js (revised: scholarId rows + kill-time sampling)
- Proof: scripts/test-capstoneready-b.js (all legs pass at 30d and 150d)
- Analyzer: scripts/capstoneready-b-analyze.js (revised: per-deed blockers + new primary metric, backward-compatible with the old corpus — verified against perseed-capstoneready-b)
- Zero src/js changes. Zero findings appended to the backlog from this arm (the scholar drain, charter absence, and bundle absence are this arm's own findings, recorded here; the instrument notes above are recorded in Metric review for the next census, not chased mid-run).
