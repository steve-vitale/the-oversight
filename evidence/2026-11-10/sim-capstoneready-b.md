# sim-capstoneready-b — ladder capstone-deed readiness census (DIAG ONLY, zero src/js)

- Arm: sim-capstoneready-b (Loop B, run fleshout-loop-b-20261110T1030Z, axis scale-onramp / winnability chain)
- Branch: sim-capstoneready-b; base anchor `53185abea` (worktree `~/workspace/worktrees/sim-capstoneready-b`)
- Prereg: evidence/2026-11-10/sim-capstoneready-b-prereg.md (written before any scored seed)
- Instrument: scripts/capstoneready-b-driver.js (daily recorder, pure reads, wrapped around plain competent `daily()`); proof: scripts/test-capstoneready-b.js (17 legs, all pass at 30d and at the full 150d horizon — determinism, classification, neutrality); analyzer: scripts/capstoneready-b-analyze.js
- Corpus: evidence/2026-11-10/perseed-capstoneready-b/capstoneready-b-s14010{1..8}.json (8 seeds, 736 daily rows total, 0 recorder errors)
- Seeds: 140101–140108, fresh band (0 hits per seed in evidence `*.md`, evidence filenames, scripts/, and `~/memory/`; checked in both this worktree and the main tree at the same anchor)
- Policy: plain competent (`scripts/policies/competent.js`, no env arms). Horizon: 150d, death-aware (all 8 villages died before d150).
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it").
- Context (must-read): journey-endgame r162 pass B (evidence/2026-11-09/journey-endgame-r162.md) found 1 eligible seed (89704, deedGateFirstOk d77), 0 delivered, 14 none-ready attempts. THIS run is the readiness decomposition on current master BEFORE Loop A's in-flight answermail (link seasoning) and wave5kill (veteran supply) land — the pre-answermail / pre-wave5kill baseline. Do not treat later movement as this run's verdict.

## Verdict: NO-GO (primary metric, judged strictly)

- **Primary metric: binding blocker named on 0/8 seeds (GO needed >=7/8). NO-GO.**
- Per-deed ever-ready: military_tribute 0/8, trade_charter 0/8, feast_embassy 0/8. No deed was ready on any recorded day on any seed.
- Blocked deed-days: exactly tied — `veterans-short` 736, `no-sealed-charter` 736, `no-bundle-feast` 736 (of 736 rows x 3 deeds). Every deed was blocked every day, so the pooled top-reason share is 0.333 on all 8 seeds, below the 0.5 naming bar. See Metric review: the tie is structural, and the census finding (three simultaneous walls, not one) stands regardless of the metric's verdict.

## Per-seed table

| seed | days | end | maxWave | peak ladder stage (first d) | peak scale | peak living vets | ever ready M/T/F | binding blocker (share) |
|---|---|---|---|---|---|---|---|---|
| 140101 | 100 | village-lost | 5 | 3 (d39) | regional | 1 | ././. | veterans-short (0.333) |
| 140102 | 138 | village-lost | 4 | 3 (d33) | regional | 0 | ././. | veterans-short (0.333) |
| 140103 | 81 | village-lost | 4 | 3 (d37) | regional | 0 | ././. | veterans-short (0.333) |
| 140104 | 80 | village-lost | 4 | 3 (d58) | regional | 1 | ././. | veterans-short (0.333) |
| 140105 | 62 | village-lost | 4 | 3 (d28) | regional | 0 | ././. | veterans-short (0.333) |
| 140106 | 123 | village-lost | 4 | 3 (d52) | regional | 0 | ././. | veterans-short (0.333) |
| 140107 | 93 | village-lost | 4 | 3 (d29) | regional | 1 | ././. | veterans-short (0.333) |
| 140108 | 78 | village-lost | 4 | 3 (d32) | regional | 0 | ././. | veterans-short (0.333) |

## Readiness decomposition (the census result)

Three simultaneous walls, one per deed — no single binding blocker, which is itself the finding:

1. **Military tribute (needs 2 living non-scholar wave-4 veterans): 0/8 ever ready.** Wave-4 kills per seed: 140101: 2, 140102: 0, 140103: 0, 140104: 2, 140105: 1, 140106: 1, 140107: 2, 140108: 2 (10 kills total, 9 distinct killers — Deirdre Kaplan on 140107 killed twice). Peak living veterans: [0,0,0,0,0,1,1,1] — never 2 at once on any recorded day, and 0 alive at the end on every seed. Every veteran died within ~2–23 days of their kill, 7 of 8 "the wild" (the 8th, Fariza Esenova on 140101, "monster"). Three seeds never produced a single non-scholar wave-4 killer in any recorded row (140102 and 140103 had zero wave-4 kills at all; 140105's single wave-4 kill was the scholar's, so it never counted toward the tribute).
2. **Trade charter (needs a sealed charter + national scale): 0/8 ever ready.** Ever chartered trade links: 0 on all 8 seeds; peak scaleRank regional on all 8 (never national, never global). The charter ingredient and the scale ingredient are both absent — the deed is doubly blocked, and the scale half is the same scale wall as ever (see Scale-wall numbers).
3. **Feast embassy (needs feast bundle + National ladder stage): 0/8 ever ready.** The stage half was MET on 8/8 seeds (National reached d28–d58); the bundle half was never met (0 feast-bundle flags on all 736 rows). The bundle flag is leg 2's write (game.js feastPlan/hostFeast) — the census cannot tell whether the bundle is unattempted, unaffordable, or unwritten by the policy; it can only say no bundle ever completed in competent bot play.

## The ladder climbs; the scale doesn't (decoupling)

- Peak ladder stage 3 (National) on 8/8 seeds, first reached d28–d58. On 140101 the climb to National (d39) was carried by Forage 14 / Craft 8 / Explore 15 / Talk 3 / Fight 1 — breadth (codex 67) and field/craft XP, almost no fighting. The ladder is a village-XP/breadth meter; it climbs while the village still lives.
- Peak scaleRank regional on 8/8, first sampled d60–d90. Ladder National and scale national are different things: the ladder counts work, the scale counts links/network. A village can be ladder-National for 60 days and never leave regional scale.
- The ladder is the LIVING village's strength and it decays as people die: on 140101 counted points peaked at 71 (d74) and fell to 43 by d98 as the roster collapsed 11 → 0. The stage marker remembers the climb (stage stayed 3); the counted total does not.

## Sense-test: what the village looked like (seed 140101, read day by day)

Haven starts with 11 people and climbs fast — Village Standing by day 2, Regional by day 23, National by day 39, on foraging, crafting, and learning new things (breadth 67 by day 39) while barely fighting (Fight 1). The scale lags behind: still "village" until about day 60, then regional, never national. Nobody is building links — the link count sits at 0–1 all run, no charter is ever sealed, no feast bundle is ever completed.

The fighting story is two men and women who each, alone, kill a wave-4 beast and then die almost immediately. Aki Tanaka kills one on day 74 — the village's first wave-4 kill — and for three weeks he is the only veteran Haven has. He becomes the scholar somewhere along the way (the previous bearers keep dying in the wild; the story passes from hand to hand nine times in this run) and dies on day 98, out in the wild, as the scholar. Fariza Esenova kills a second beast on day 97 and dies the next day, killed by a monster. They were never both standing as veterans on the same recorded day: Aki was already dead by the morning Fariza's kill was counted. The village itself dies on day 100 with no one left — 88 deaths in 100 days, the top causes expedition (33), villager combat (21), and combat (17). It is not a village that failed to climb; it is a village that climbed the ladder, bled out in the wild, and never once had two living veterans, a sealed charter, or a feast bundle at the same time.

The sharpest pattern in the whole census: **7 of the 8 non-scholar wave-4 killers in the census table died as the scholar** (only Fariza died as a plain villager; the 9th killer, the scholar on 140105, never entered the non-scholar count at all). The people strong enough to kill a wave-4 beast keep getting promoted to scholar because the scholar keeps dying — and the scholar never counts toward the tribute (the Leg 3 rule, working as designed). Veteran supply is drained from both ends: killers die fast in the wild, and the survivors get promoted out of the count. Any veteran-supply follow-up (wave5kill) that only makes more kills without keeping killers alive AND non-scholar will not move the tribute number.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 1/8 (140101 only)
- Median survival: 87 days (result days sorted: 62, 78, 80, 81, 93, 100, 123, 138; middle two 81/93)
- Deaths per seed: 56–88 (telemetry deaths); top causes across seeds: expedition, villager combat, combat, the wild.

## Metric review

- **The primary metric was wrong in construction, and the verdict is still NO-GO.** The pooled-share rule (top reason's share of ALL blocked deed-days, bar 0.5) is structurally unsatisfiable when all three deeds are blocked every day: each deed contributes its own reason every day, so the split is 1/3–1/3–1/3 by construction and no blocker can ever reach 0.5. The metric cannot distinguish "three equal walls" from "no signal". The census finding does not depend on the metric: 0/8 ever-ready on all three deeds plus the per-ingredient counts (max 1 living veteran; 0 charters; 0 bundles; scale never national) is the decomposition, and it is unambiguous.
- **Proposed revision for the next run:** name the binding blocker PER DEED (each deed's modal reason over its own blocked days), and judge the census on the per-deed ever-ready rates + ingredient peaks, not on a pooled share. Alternatively, score the metric on "days with >=1 deed ready" rather than a share. Do not re-score THIS run under the revision — the NO-GO stands as registered.
- **Instrument gaps (for the next census):** (a) the recorder does not log the scholar's id per day, so the veteran-to-scholar promotion day is inferred from death-tele `player` flags, not observed directly — add `scholarId` to the daily row. (b) Daily cadence (one pre-sleep snapshot) can miss a sub-day veteran overlap: on 140101 Aki (kill d74, died d98) and Fariza (kill d97, died d99) may have overlapped for part of day 98 — the d97 snapshot predates Fariza's kill and the d98 snapshot postdates Aki's death. The "never 2 living veterans on any recorded day" claim is exact; "never 2 living veterans at any moment" is not proven. A same-day overlap would still not have made the tribute deliverable in bot play (no delivery policy exists yet), but the next census should sample the veteran count at kill time as well. (c) Daily rows start on scholar-day 2 (the first snapshot lands after depart); day 1 is unrecorded — immaterial (no kills or deeds on day 1), noted for completeness. Rows cover distinct scholar-days with ~97% coverage (frozen-clock days deduped).

## What this means for the next build (not a verdict, a pointer)

- The r162 wall is confirmed and decomposed on fresh seeds: the capstone deeds are not one wall but three, and all three stand at once. The tribute is the nearest: it needs ONE more living veteran at a time (peak 1, never 2) — but the supply is drained by fast veteran deaths and scholar succession, so "more kills" alone is unlikely to be enough; killers have to live, and have to stay non-scholar.
- The charter is the farthest: both ingredients are at zero (no sealed charter, scale never national). Link seasoning (answermail) is the aimed lever; this census is its baseline (0 charters, 0 national on 8/8).
- The embassy is half-built by the game itself: National ladder stage is reached quickly and reliably (8/8, d28–d58) — the missing half is entirely the feast bundle, which never completed in competent play.

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-capstoneready-b/capstoneready-b-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0.
- Investigation: NOT a game finding. (a) Regime artifact, stated in the baseline's own `_regime` note: the scale-wall baseline is the winseat full win-side stack (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT, SEATDRIVE, 180d, 16/16 wins) and its note says verbatim "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This census is exactly such a substrate (plain competent, no seat-drive, no capstone delivery). (b) Schema absence: the per-seed census files carry no `nationalEver` or `table` fields (they record peak scaleRank and `won`), so national/table read 0 by absence, not by measurement. The `wins` 0/8 is measured (won=false on all 8) and is the expected value for this regime. No action; a regime-segregated readiness baseline is a coordinator call, not this arm's.

## Files

- Prereg: evidence/2026-11-10/sim-capstoneready-b-prereg.md
- Evidence (this file): evidence/2026-11-10/sim-capstoneready-b.md
- Corpus: evidence/2026-11-10/perseed-capstoneready-b/capstoneready-b-s14010{1..8}.json
- Driver: scripts/capstoneready-b-driver.js
- Proof: scripts/test-capstoneready-b.js (17/17 legs pass at 30d and 150d)
- Analyzer: scripts/capstoneready-b-analyze.js
- Zero src/js changes. Zero findings appended to the backlog from this arm (the veteran-succession drain and the charter/scale absence are this arm's own findings, recorded here; the instrument gaps above are recorded in Metric review for the next census, not chased mid-run).
