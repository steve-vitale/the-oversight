# sim-capstoneready-remeasure2-b — ladder capstone-deed readiness re-measure, band 2 (DIAG ONLY, zero src/js)

- Arm: sim-capstoneready-remeasure2-b (Loop B, run fleshout-loop-b-20261110T1142Z, axis scale-onramp / winnability chain)
- Branch: sim-capstoneready-remeasure2-b; base anchor `57547c8dd` (worktree `~/workspace/worktrees/sim-capstoneready-remeasure2-b`)
- Base verification (before any scored seed): `git merge-base --is-ancestor 203a32775 HEAD` PASS (wave5kill-a in base); `git merge-base --is-ancestor 5db4f6fef HEAD` PASS (answermail-a in base). Both levers whose effect this re-measure tests are therefore IN the base, unlike the 1030Z baseline which was pre-answermail / pre-wave5kill.
- Prereg: evidence/2026-11-10/sim-capstoneready-remeasure2-b-prereg.md (written before any scored seed; committed as `7c18a51d5` after rebase — see Commit history below)
- Instrument: scripts/capstoneready-b-driver.js + scripts/capstoneready-b-analyze.js, REVISED by the sibling arm (landed on master as `75f376185`: scholarId per daily row, kill-time veteran sampling, per-deed blocker metric). This arm's corpus was recorded with the PRE-revision driver, so its rows carry no scholarId and no kill-time samples — the revised analyzer handles the old format (backward-compat leg passes) and reports kill-time fields as n/a. Proof: scripts/test-capstoneready-b.js — ALL LEGS PASS on the rebased branch (re-run this arm after the rebase onto `75f376185`, exit 0).
- Corpus: evidence/2026-11-10/perseed-capstoneready-remeasure2-b/capstoneready-b-s14020{9..16}.json (8 seeds, 836 daily rows total, 0 recorder errors; committed as `90515d8bd` after rebase)
- Seeds: 140209–140216, fresh band (0 hits per seed in evidence `*.md`, evidence filenames, scripts/, and `~/memory/`; checked in both this worktree and the main tree at prereg time). Pooled with the sibling arm sim-capstoneready-remeasure-b (band 1, seeds 140201–140208) to 16 seeds.
- Policy: plain competent (`scripts/policies/competent.js`, no env arms). Horizon: 150d, death-aware (7 villages died before d150; 1 survived the full horizon).
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it").
- Context (must-read): the 1030Z census (evidence/2026-11-10/sim-capstoneready-b.md, base `53185abea`, seeds 140101–140108) is the PRE-answermail / PRE-wave5kill baseline: 0/8 ever-ready on all three deeds, peak 1 living veteran, 0 charters, 0 bundles, scale never national, median survival 87d. The sibling band 1 (evidence/2026-11-10/sim-capstoneready-remeasure-b.md, seeds 140201–140208, same base as this arm) is the first re-measure: tribute ever-ready 2/8, kills 10 → 21, median survival 87 → 125.5d, charter/bundle still 0/8. THIS run is band 2 of the same re-measure, on the same base, judged ONLY on its own output against its own prereg. Do not re-judge the sibling arm.

## Verdict: GO (primary metric, judged strictly)

- **Primary metric: per-deed binding blocker named on 8/8 seeds for ALL THREE deeds (GO needed >=7/8 per deed). GO.**
  - military_tribute: named on 8/8 seeds; blocker `veterans-short` on 8/8; shares [1,1,1,1,1,1,1,1]
  - trade_charter: named on 8/8 seeds; blocker `no-sealed-charter` on 8/8; shares [1,1,1,1,1,1,1,1]
  - feast_embassy: named on 8/8 seeds; blocker `no-bundle-feast` on 8/8; shares [1,1,1,1,1,1,1,1]
- Per-deed ever-ready: military_tribute **0/8**, trade_charter **0/8**, feast_embassy **0/8**. No deed was ready on any recorded day on any seed.
- The pooled-share metric (baseline's, comparison only) still names 0/8, as the baseline predicted it always would.
- **Read the GO honestly (prereg verdict rule): this is a census, not a lever.** GO means the per-deed decomposition is solid enough to aim the next build at the named blockers; it does not claim any deed is reachable. On this band the levers have NOT moved readiness: ever-ready is 0/8 on all three deeds, the same as the 1030Z baseline — while the sibling band on the same base got tribute 2/8. The two bands disagree on readiness, and the reason is visible in the kill supply (13 kills here vs 21 there) and in where the kills landed (see The scholar drain, band 2). Say so plainly: the decomposition is GO, the winnability signal on this band is flat.

## Per-seed table

| seed | days | end | maxWave | peak ladder stage (first d) | peak scale | peak living vets (daily / kill-time) | ever ready M/T/F | per-deed blockers (M/T/F) |
|---|---|---|---|---|---|---|---|---|
| 140209 | 69 | village-lost | 4 | 3 (d34) | regional | 0 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140210 | 142 | village-lost | 4 | 3 (d41) | regional | 1 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140211 | 126 | village-lost | 4 | 3 (d59) | regional | 0 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140212 | 72 | village-lost | 4 | 3 (d32) | regional | 1 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140213 | 70 | village-lost | 4 | 3 (d33) | regional | 0 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140214 | 150 | survived | 4 | 3 (d32) | regional | 1 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140215 | 100 | village-lost | 4 | 3 (d46) | village | 0 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |
| 140216 | 126 | village-lost | 4 | 3 (d47) | regional | 0 / n/a | ././. | veterans-short / no-sealed-charter / no-bundle-feast |

Kill-time peak is n/a on all 8 seeds: this corpus was recorded with the pre-revision driver (no kill-time samples). The daily-snapshot "never 2 living veterans" claim is exact; "never 2 living veterans at any moment" is NOT proven on this band — the sibling band's kill-time sampling is the instrument that closes that gap, and it found no missed overlap there.

## Readiness decomposition — before/after vs the 1030Z baseline AND vs the sibling band

| ingredient | baseline 1030Z (140101–140108) | sibling band 1 (140201–140208) | this band 2 (140209–140216) | pooled 16 seeds |
|---|---|---|---|---|
| military_tribute ever-ready | 0/8 | **2/8** (32 + 3 ready days) | 0/8 | **2/16** |
| trade_charter ever-ready | 0/8 | 0/8 | 0/8 | 0/16 |
| feast_embassy ever-ready | 0/8 | 0/8 | 0/8 | 0/16 |
| wave-4 kills (total) | 10 | **21** | 13 | 34 |
| peak living non-scholar wave-4 veterans | 1 (never 2) | **2** (on 2 seeds; kill-time agrees) | 1 (never 2 in daily snapshots) | 2 |
| kill-time ever-2-veterans | n/a (no samples) | 2/8 | n/a (old corpus) | — |
| ever sealed charters | 0 | 0 | 0 | 0 |
| ever feast bundles | 0 | 0 | 0 | 0 |
| peak scaleRank | regional 8/8 | regional 8/8 | regional 7/8, village 1/8 | regional 15/16 |
| median survival | 87d | **125.5d** | **113d** (69, 70, 72, 100, 126, 126, 142, 150) | 121.5d pooled |
| villages surviving the 150d horizon | 0/8 | 2/8 | 1/8 (140214) | 3/16 |
| wave-5 unlocked | 1/8 | 1/8 | **0/8** | 1/16 |
| wave-5 kills | — | 0/8 | 0/8 | 0/16 |

1. **Military tribute (needs 2 living non-scholar wave-4 veterans): 0/8 ever ready on this band.** Wave-4 kills per seed: 140209: 1, 140210: 7, 140211: 0, 140212: 1, 140213: 0, 140214: 3, 140215: 1, 140216: 0 (13 total, 10 distinct killers). Peak living veterans [0,0,0,0,0,1,1,1] by daily snapshot — never 2 at once on any recorded day, and 0 alive at the end on every seed. Three seeds never produced a single wave-4 kill at all (140211, 140213, 140216). The kills that did happen were concentrated in one village (140210: 7 of the 13) and, on that seed, in one person (Valeria Quispe: 4 of the 7) — and that person was the scholar, so none of the four counted. The band-to-band swing (sibling 21 kills → 2 ready windows; this band 13 kills → 0) is a kill-supply swing, not a rule change: with ~13 kills spread across 8 villages, the tribute needs two killers alive at once in the same village, and this band never had them.
2. **Trade charter (needs a sealed charter + national scale): 0/8 ever ready, unchanged on all three bands.** Ever chartered trade links: 0 on all 8 seeds; peak scaleRank regional on 7/8, village on 140215 (never national, never global). Both ingredients still at zero. The answermail lever did not move the charter ingredient on these seeds either: no sealed charter appeared in competent bot play on any of the 16 re-measure seeds.
3. **Feast embassy (needs feast bundle + National ladder stage): 0/8 ever ready, unchanged on all three bands.** The stage half was MET on 8/8 seeds (National reached d32–d59); the bundle half was never met (0 feast-bundle flags on all 836 rows). Across the pooled 16 re-measure seeds the bundle has now never completed in 1,768 daily rows of competent play.

## The scholar drain, band 2 — observed through the old instrument's keyhole

This band's corpus has no scholarId rows, so scholar-at-kill-time is not directly observable the way the sibling band observed it. What IS observable is decisive in the one place it matters:

- **All four of seed 140210's killers died as the scholar.** The death telemetry flags scholar deaths (`player=true`): Jorge Silva d76 (the arena), Nadia Khoury d90 (the wild), Valeria Quispe d113 (the wild), Fatima Hassan d140 (the wild) — 4 of the seed's 14 scholar deaths. The scholar's seat changed hands 14 times in 142 days on that seed.
- **Valeria Quispe killed FOUR wave-4 beasts (d90–d112) and the tribute counter never moved off zero.** The daily rows show `livingVeterans=0` on every day d88–d113, and Valeria never appears in a daily veterans-alive list at all — she enters the veterans table only on d114, already dead. The only consistent reading of the rows is that she held the scholar's seat through her whole killing streak (she took it when Nadia died as scholar on d90, and died as scholar herself on d113), so all four kills were the scholar's and none counted. Four kills, zero tribute progress — the drain in its purest form, visible even without scholarId rows.
- **On 140214, two of the three killers died as scholar:** Mara Vasquez (kill d105, stood alone as the only living veteran d105–118, died d119 as scholar, the wild) and Katana Kibe (kill d120, died d127 as scholar, the wild). The third, Shu Rong, killed d102 and died the same day to a monster — never counted in any daily snapshot. Note the same-day double scholar death on 140214 d119 (Benoit Lambert AND Mara Vasquez both flagged scholar): the seat turned over twice within one day.
- **Veteran fates (analyzer table, all 10 distinct killers, 0 alive at end):** Leo Martin 140209 (1 kill d68, died d68, the wild); Jorge Silva 140210 (d58, died d76, the arena); Nadia Khoury 140210 (d79, died d90, the wild); Valeria Quispe 140210 (4 kills d90–112, died d113, the wild); Fatima Hassan 140210 (d132, died d140, the wild); Meera Reddy 140212 (d55, died d59, the wild); Shu Rong 140214 (d102, died d102, monster); Mara Vasquez 140214 (d105, died d119, the wild); Katana Kibe 140214 (d120, died d127, the wild); Rosa Mendez 140215 (d88, died d88, the wild). Killers die fast (same-day to ~23 days after the kill) and the survivors get promoted into the seat where their kills stop counting — the same two-ended drain the baseline inferred and the sibling band observed directly.
- **The wild is the killer of veterans and villages alike:** 71 of this band's 118 villager deaths were "the wild" (15 monster, 10 sickness, 4 "a wound that wouldn't close"). On 140214, 10 of 13 villager deaths were the wild; on 140210, 12 of 20.

## The ladder climbs; the scale doesn't (decoupling persists, third band running)

- Peak ladder stage 3 (National) on 8/8 seeds, first reached d32–d59 (baseline d28–d58, sibling d22–d45). The ladder is still a village-XP/breadth meter that climbs while the village lives — on 140214 it was carried late by Explore 34 / Talk 14 / breadth 140 with Fight only 5.
- Peak scaleRank regional on 7/8, village on 140215 — the only seed in either re-measure band that never left village scale. Ladder National and scale national are still different things: the ladder counts work, the scale counts links/network. 140215 was ladder-National from d46 and village-scale at death on d100, with 6 sickness deaths in the count.
- Survival improved vs the baseline (median 87d → 113d; 1 village alive at the horizon) while the scale wall did not move at all: national 0/8, table 0/8, wins 0/8.

## Sense-test: what the village looked like (seeds 140214 and 140210, read day by day)

**140214 — the survivor that did everything except the hard thing.** Haven starts with 12 people and climbs fast — Village Standing by day 5, Regional by day 20, National by day 32 — on foraging, crafting, and learning, while the roster quietly bleeds: 12 → 11 → 10 → 7 → 4. Thirteen villagers die, ten of them out in the wild. The fighting story is three people, each alone. Shu Rong kills a wave-4 beast on day 102 and dies the same day, killed by a monster — no daily snapshot ever counts him. Mara Vasquez kills one on day 105 and stands alone as the village's only veteran for fourteen days, the closest this seed ever comes; she takes the scholar's seat, and dies in the wild on day 119, the same day the seat turns over twice. Katana Kibe kills one on day 120, takes the seat, and dies in the wild on day 127. The village survives to day 150 with four people left, ladder-National the whole back half, scale regional, one active link, no charter ever sealed, no feast bundle ever completed, and never once two living veterans at the same time. It is a village that did everything the ladder asks except produce two living veterans at once — and the ladder, on its own, does not care.

**140210 — the village whose best fighter killed four beasts and counted for nothing.** Twelve people, National by day 41, roster holding at 8–12 through day 90. Then the scholar's seat starts turning over — fourteen scholar deaths in 142 days, the seat changing hands on days 44, 76, 78, 79, 88, 90, 113, 116, and four times in the final four days. Jorge Silva kills a wave-4 beast on day 58 and dies on day 76, in the arena, as scholar. Nadia Khoury kills one on day 79, stands alone as the village's only veteran for nine days, and dies on day 90, in the wild, as scholar. Valeria Quispe takes the seat and then does the most remarkable fighting in either re-measure band: four wave-4 kills between day 90 and day 112, while the village's counted veterans sit at zero the entire time — every kill hers was the scholar's, and the scholar never counts. She dies on day 113, in the wild, as scholar. Fatima Hassan kills one on day 132, stands alone for eight days, and dies on day 140, in the wild, as scholar. The village dies on day 142 with no one left, twenty villager deaths behind it, the wild the top cause (12). Nothing about this village was robotic or incoherent — people fought, took the seat, died in the wild, and were succeeded, exactly as the game asks them to. The incoherence is in the deed: the village's strongest fighter did the deed's work four times over and the deed never noticed, because the work was done from the scholar's seat.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 0/8
- Median survival: 113 days (result days sorted: 69, 70, 72, 100, 126, 126, 142, 150)
- Villager deaths per seed: 11–20 (118 total); top causes across seeds: the wild (71), monster (15), sickness (10).
- Pooled 16 re-measure seeds (bands 1+2): national 0/16, table 0/16, wins 0/16, wave-5 unlocked 1/16, tribute ever-ready 2/16, median survival 121.5d, 3 villages alive at the horizon.

## Metric review

- **The revised primary metric works as designed, and the verdict is GO — with the same caveat the sibling band recorded.** Per-deed modal blockers are named on 8/8 seeds for all three deeds (each deed's modal share is 1.0 on every seed — each deed has exactly one blocking reason all run). The revision fixed the baseline's structural flaw. But with shares of 1.0 everywhere, the naming bar is nearly tautological — the metric certifies that the decomposition is complete (three walls, one reason each), not that the game improved. The movement signal lives in the ever-ready rates and ingredient peaks, which are reported alongside, not inside, the metric. On this band those rates are flat (0/8, 0/8, 0/8) while the metric is GO — the metric and the game moved in opposite directions, and the evidence says so in both places. Do not re-score this run under any other rule — the GO stands as registered.
- **Instrument gap, specific to this band:** the corpus is old-format (pre-revision driver) — no scholarId rows, no kill-time samples. The analyzer's kill-time fields are all n/a, so the "never 2 veterans at any moment" claim is unproven here (daily snapshots only), and scholar-at-kill-time is inferred from death-tele player flags plus the Valeria zero-count streak, not directly observed. The sibling band's revised driver is the instrument that closes both gaps; the next census should record with it. This does not weaken the verdict: the per-deed blockers are computed from daily deed reasons, which the old format records identically.
- **Band-to-band variance is now a measured quantity, not a suspicion.** Same base, same policy, same horizon, same instrument family: band 1 got 21 kills and 2 ready windows; band 2 got 13 kills and none. The tribute's readiness is a tail event on kill supply — a 16-seed pooled rate (2/16) is the honest number to carry forward, not either band's alone. A future lever aimed at the tribute should be judged on the pooled band, not on a single 8-seed draw.
- **Proposed revision for the next run:** none to the metric itself — it did its job twice. The next step is a build, not a better ruler: the named blockers are veterans-short (needs killers alive AND non-scholar), no-sealed-charter, and no-bundle-feast, and the pooled 16-seed numbers say the tribute is the nearest, the charter the farthest, the bundle entirely unmeasured (unattempted vs unaffordable vs unwritten by the policy — still unknown after 1,768 rows).

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-capstoneready-remeasure2-b/capstoneready-b-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0 — identical to the baseline run and the sibling band.
- Investigation: NOT a game finding. (a) Regime artifact, stated in the baseline's own `_regime` note (verified this run by reading the file): the scale-wall baseline is the winseat full win-side stack (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT, SEATDRIVE, 180d, 16/16 wins) and its note says verbatim "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This census is exactly such a substrate (plain competent, no seat-drive, no capstone delivery). (b) Schema absence: the per-seed census files carry no `nationalEver` or `table` fields (they record peak scaleRank and `won`), so national/table read 0 by absence, not by measurement. The `wins` 0/8 is measured (won=false on all 8) and is the expected value for this regime. No action; a regime-segregated readiness baseline is a coordinator call, not this arm's.

## What this means for the next build (not a verdict, a pointer)

- The tribute moved on the pooled band (0/8 → 2/16) but not on this band (0/8): kill supply is the swing variable, and the scholar drain is the constant. The next lever on this deed is still not more kills but keeping killers alive AND non-scholar (survivability after the kill, succession that does not promote the veteran) — Valeria's four uncounted kills are the cleanest exhibit yet.
- The charter did not move on any band: 0 sealed charters, scale never national on 24/24 seeds across all three censuses. The charter ingredient, not the seasoning rate, is the next question.
- The embassy is still half-built by the game itself: National ladder stage 24/24 seeds, fast — the missing half is entirely the feast bundle, which has never completed in competent play across 24 seeds and 2,504 daily rows (736 + 932 + 836).

## Commit history (this arm)

- `7c18a51d5` — prereg + band-B corpus note (rebased): "sim-capstoneready-remeasure2-b: prereg + band-B corpus (140209-140216, 8 seeds, 150d, competent)"
- `90515d8bd` — band-B corpus: "sim-capstoneready-remeasure2-b: band-B corpus (140209-140216, 8 seeds, 836 daily rows, 0 recorder errors)"
- Rebased onto explicit master SHA `75f376185` (read from the main tree immediately before rebasing; master had not moved past it). Rebase was clean, no quirk stop.
- Infrastructure note: `scripts/safe-commit.sh` does not accept directory paths (known lesson) — the first commit took only the prereg file, and both safe-commits triggered the known main-index clobber (committed files showing staged-as-deleted in the worktree index). Repaired both times with the documented pipe (`git ls-tree HEAD -r -- <paths> | git update-index --add --index-info`, `-r` required for the directory), verified byte-identical blobs (`hash-object` vs HEAD) and `git status --short` empty + `git diff HEAD` empty after each repair. The commits themselves were correct throughout.

## Files

- Prereg: evidence/2026-11-10/sim-capstoneready-remeasure2-b-prereg.md
- Evidence (this file): evidence/2026-11-10/sim-capstoneready-remeasure2-b.md
- Corpus: evidence/2026-11-10/perseed-capstoneready-remeasure2-b/capstoneready-b-s14020{9..16}.json
- Driver/analyzer/proof: scripts/capstoneready-b-driver.js, scripts/capstoneready-b-analyze.js, scripts/test-capstoneready-b.js (revised by the sibling arm, landed as `75f376185`; re-run green on this rebased branch)
- Zero src/js changes. Zero findings appended to the backlog from this arm (the scholar drain, charter absence, and bundle absence are this arm's own findings, recorded here; the instrument notes above are recorded in Metric review for the next census, not chased mid-run).
