# sim-bisect-r5-cut1-a — survival-collapse bisect ROUND 5, tertile cut 1 (Loop A)

- **Run:** fleshout-20261112T0915Z, arm sim-bisect-r5-cut1-a
- **Prereg:** `evidence/2026-11-12/sim-bisect-r5-cut1-a-prereg.md` (committed `af0b5dbf9` before any judged sim; proof require-path fix `95e9c7a0`, also pre-sim)
- **Base:** `6dc7f8162` ("sim-tenddrive-a candidate corpus", 2026-11-08 20:04) — the 131st commit in the window `d229b58f5..203a32775` (393 commits; verified: `git rev-list --count d229b58f5..6dc7f8162` returns 131, `git rev-list --count d229b58f5..203a32775` returns 393, `6dc7f8162` is a descendant of `d229b58f5` and an ancestor of `203a32775`); `git rev-parse HEAD` is `6dc7f8162`, tree clean at run start)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`; untracked scratch in this worktree, deleted before finishing per the prereg) + `scripts/bisect-r5-cut1-driver-20261112.js`, `scripts/bisect-r5-cut1-analyze-20261112.js`, `scripts/test-bisect-r5-cut1-a.js` (committed `af0b5dbf9` + `95e9c7a0`, **63/63 green** before any judged sim and again after the band)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, the anchors, the merge, the first parent, the reconciled, the origin, and the merge-base legs (a control/bisect cut re-runs the same seeds; stated in the prereg), competent verbatim (sha256 `a7ff5c516440…`, byte-identical to both window ends), SINGLE leg, mode `fix` only, with the r131 roster-check fix swapped in uncommitted (see the fix-swap note below)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: readiness reads living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-r5-cut1-a/` — 8 per-seed JSONs; summary `evidence/2026-11-12/bisect-r5-cut1-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The driver took ~9 min for all 8 seeds (~40–115s/seed), all 8 files landing first-try, 0 instrument errors on every seed. The leg guard (ROSTER CHECK marker + exact fix sha `f8fda4295a99`) held for every seed (`standingFix: true`, `standingSha: f8fda4295a99` in every per-seed JSON). The prereg commit hit the known index-clobber pattern (committed files showing staged-deleted + untracked while byte-identical to HEAD); repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified with `git status` + `git diff HEAD`. The require-fix commit hit the clobber a second time in its `MM` form on the single file; same repair, same verification. One worktree heartbeat sent mid-run (~10:07Z). Telemetry check attempted and refused by the tool (see §7).

## The fix-swap (this base predates the roster-check fix)

At `6dc7f8162`, `src/js/standing.js` is the PRE-FIX version (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d` — byte-identical to the merge-base's pre-fix file, verified on THIS base). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base, so the fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as the prereg prescribes and as vetphantom-b / origin-a / mergebase-a did. `standingSha` = `f8fda4295a99` is recorded per seed in the corpus. The swapped file was never committed; it was restored byte-identical afterwards (sha256 `98c8bfad70d7…` + `cmp` clean + `git status` showing no `src/js` modification — see §9).

Two swap notes, both verified, not assumed (prereg): the fix file's BLOODED block rides along but is INERT on this base — no file in `src/js` calls `villageBlooded` / `bloodedCfg` / `bloodedLine`, and the fix `standing.js` itself never calls `this.villageBlooded()` — so the only live behavioral delta the swap introduces is the roster check, and the driver's end-of-run `blooded` read is a report field only. And this base's ladder is a THIRD scholar rule in the bisect (LEG 3: the scholar is NEVER counted — `vid === this.villagerId` returns false), differing from the merge-base's old inline rule (scholar counts as always living) and from `5157782a4`/master's shared `countLivingVeterans` (scholar counts via the roster check) — the proof detects the loaded rule from `_ladderLivingVeterans` source and asserts the matching count, including a scholar-only kill (ladder 0 on this base, readiness + instrument 1); the survival read comes from the harness end state, not the ladder.

## Verdict: CUT1_COLLAPSED + REGIONAL_INTACT — the split

The analyzer (`scripts/bisect-r5-cut1-analyze-20261112.js`, exit 0) classifies **2/8 survived** under the prereg survival rule (≤2/8 → CUT1_COLLAPSED) and **8/8 regional** under the pre-registered rank rule (≥5/8 → REGIONAL_INTACT). The collapse is in the first third of the window — and the rank stall is NOT: it lifts between the merge-base and this cut, while the collapse persists through it.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → CUT1_HEALTHY | not met |
| ≤2/8 survive → CUT1_COLLAPSED | **MET: 2/8** |
| 3–4/8 → INCONCLUSIVE | not met |
| ≥5/8 regional → REGIONAL_INTACT | **MET: 8/8** |
| ≤2/8 regional → RANK_STALL | not met |
| 3–4/8 regional → RANK_INCONCLUSIVE | not met |

**Read §8 before quoting the verdict's gloss.** The count verdicts stand — this cut collapses, and every village on it reaches regional. The split is the finding: on the merge-base the two verdicts coincided (collapsed + stall); on the merge they split the other way round the same axis (collapsed + regional-intact, 7/8). The survival collapse and the rank stall are separable defects with different windows, and this cut separates them.

## §1 The cut-1 table — collapse persists, rank restores

| Seed | Vetphantom fix leg (`5157782a4`) | This cut-1 leg (`6dc7f8162`) | Merge-a (`e4dbe581b`) | Firstparent (`203a32775`) | Reconciled (`743e07d87`) | Origin-a (`a628aeaf3`) | Mergebase-a (`d229b58f5`) |
|---|---|---|---|---|---|---|---|
| 190391 | 150d survived, 199, 4, 109 deaths | **139d, 199, 4, 116** | 103d, 165, 4, 87 | 86d, 199, 4, 88 | 103d, 165, 4, 87 | 66d, 135, 4, 50 | 95d, 199, 4, 76 |
| 190392 | 150d survived, 199, 4, 102 | **110d, 270, 5, 66** | 150d SURVIVED, 199, 4, 70 | 144d, 199, 4, 77 | 126d, 199, 4, 73 | 90d, 150, 4, 46 | 150d SURVIVED, 199, 4, 79 |
| 190393 | 150d survived, 325, 5, 66 | **84d, 199, 4, 84** | 115d, 395, 5, 76 | 150d SURVIVED, 325, 5, 66 | 149d, 199, 4, 80 | 71d, 199, 4, 59 | 112d, 199, 4, 79 |
| 190394 | 150d survived, 199, 4, 89 | **84d, 199, 4, 73** | 140d, 199, 4, 100 | 43d, 150, 4, 52 | 91d, 199, 4, 80 | 150d SURVIVED, 520, 5, 98 | 139d, 199, 4, 135 |
| 190395 | 109d village-lost, 199, 4, 94 | **150d SURVIVED, 199, 4, 125** | 76d, 199, 4, 53 | 150d SURVIVED, 199, 4, 96 | 65d, 199, 4, 51 | 89d, 199, 4, 65 | 86d, 199, 4, 87 |
| 190396 | 85d village-lost, 199, 4, 81 | **150d SURVIVED, 199, 4, 104** | 126d, 199, 4, 93 | 87d, 199, 4, 80 | 150d SURVIVED, 360, 5, 98 | 89d, 195, 4, 44 | 102d, 199, 4, 91 |
| 190397 | 150d survived, 325, 5, 88 | **102d, 275, 5, 67** | 115d, 199, 4, 72 | 150d SURVIVED, 275, 5, 74 | 142d, 370, 5, 87 | 150d SURVIVED, 199, 4, 103 | 83d, 199, 4, 71 |
| 190398 | 150d survived, 375, 5, 78 | **90d, 199, 4, 74** | 136d, 265, 5, 70 | 150d SURVIVED, 199, 4, 96 | 103d, 199, 4, 59 | 95d, 199, 4, 54 | 62d, 145, 4, 51 |
| **band** | **6/8 survived, median 150d, deaths 707** | **2/8 survived, median 110d, deaths 709** | **1/8, median 126d, deaths 621** | **4/8, median 150d, deaths 629** | **1/8, median 126d, deaths 615** | **2/8, median 90d, deaths 519** | **1/8, median 102d, deaths 669** |

(Columns read days, standing, maxWave, deaths. Cut 1's two survivors are 190395 and 190396 — the two seeds the vetphantom leg LOST (109d, 85d) — while six of the vetphantom leg's survivors die here. Survival on this band is not a per-seed property; the same seed lives or dies with the tree, and the flip runs both ways. Cut 1 carries the band's highest death count (709, just past the vetphantom leg's 707) because its two 150d survivors keep fighting to the horizon: 125 + 104 deaths between them.)

## §2 Trajectory identity — a seventh trajectory, except one near-identity

A field-by-field comparison of this corpus against the vetphantom FIX corpus, the merge corpus, the firstparent corpus, the reconciled corpus, the origin corpus, and the merge-base corpus on master (read-only; per-day signature = vetsW3 count, vetsW4 count, waveKillLog length, living roster length, deaths-so-far):

| Seed | vs vetphantom fix leg | vs merge-a | vs firstparent | vs reconciled | vs origin-a | vs mergebase-a |
|---|---|---|---|---|---|---|
| 190391 | day 12 | day 4 | day 12 | day 4 | day 4 | day 4 |
| 190392 | day 4 | day 8 | day 4 | day 8 | day 5 | day 7 |
| 190393 | day 4 | day 4 | day 4 | day 4 | day 4 | day 5 |
| 190394 | day 9 | day 5 | day 9 | day 5 | day 5 | day 5 |
| 190395 | day 4 | day 4 | day 4 | day 4 | day 4 | day 4 |
| 190396 | day 8 | day 4 | day 8 | day 4 | day 4 | day 6 |
| 190397 | day 12 | day 4 | day 12 | day 4 | day 4 | day 2 |
| 190398 | day 4 | day 5 | day 4 | day 5 | day 5 | **day 53** |

No seed matches any other leg's trajectory on any leg — except one. Seed 190398 on cut 1 runs the merge-base's trajectory for **52 days** before diverging on day 53: the closest trajectory match in the whole bisect, and the only leg-pair in it that stays identical past the first week. Every other comparison diverges on day 2–12, and cut 1 diverges from the vetphantom leg later than the other collapsed legs do (d4–d12, vs the merge-base's d2–d7) — this cut is nearer the healthy base in its first days and still collapses. Seven legs, seven trajectories, one near-identity: the collapse is not one code path's story, it is what this band does on every tree except the vetphantom base, and the near-identity says the first third's code moves the trajectory late, not early, on at least one seed.

## §3 Wall numbers — the wall, the split, and a refined choke

| | Vetphantom fix leg | This cut-1 leg | Mergebase-a | Origin-a | Merge-a / reconciled |
|---|---|---|---|---|---|
| Survived | 6/8 | **2/8** | 1/8 | 2/8 | 1/8 |
| Median survival | 150d | **110d** | 102d | 90d | 126d |
| Wins | 0/8 | 0/8 | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** | 0/8 | 1/8 | 2/8 |
| Wave-4 unlocks | 8/8 | **8/8** | 8/8 | 8/8 | 8/8 |
| Deaths (band) | 707 | **709** | 669 | 519 | 621 / 615 |
| Standing range | 199–375 | **199–275** | 145–199 | 135–520 | 165–395 / 165–370 |
| Blooded | 5/8 | **1/8** (190395 only) | 1/8 | 2/8 | 1/8 |
| Scale at end | regional 8/8 | **regional 8/8** | village 8/8 | village 8/8 | regional 7/8, village 1/8 |

Median survival is the analyzer's upper-median convention (`s[floor(n/2)]` on sorted days 84, 84, 90, 102, 110, 139, 150, 150 → 110d; the lower median would be 102d) — the same function that produced the merge's 126d, the origin's 90d, and the merge-base's 102d, so the figures are directly comparable.

**The rank split, judged.** Regional reach is **8/8** — every seed leaves village rank, including both 150d survivors and the 84d deaths. This is the first collapsed leg in the bisect whose rank is fully intact (the merge reaches regional on 7/8; the origin and merge-base on 0/8). The rank stall that the merge-base leg judged is already gone by this cut: moving forward from `d229b58f5` to `6dc7f8162`, rank restores completely while survival stays collapsed (1/8 → 2/8). The stall's window is now narrowed to the 131 commits between the merge-base and this cut, while the collapse's window still spans the whole window. The two defects separate here.

**The standing pin.** Standing ends at exactly **199 on 6/8 seeds** (270 on 190392, 275 on 190397 — the two wave-5 seeds, which die past the hold). 199 is the t4-1 hold: `villageStandingTotal()` holds at t4-1 while any readiness bar is short, and a dead village's emptied roster meets no bars — so the end standing parks at the hold. It is NOT a mid-run stall: mid-run (d20–d60) the wave-4 readiness bars are met on 15–36 days per seed, ready4 first true d25–d43 on all 8 seeds, and wave 4 unlocks on 8/8. The pin is the end state of a roster that has emptied, not evidence the villages never qualified.

**Wave 5 was close twice, blocked twice, and once never fired while ready.** Peak living wave-4+ veterans per seed: 1, 2, 2, 1, 2, 1, 2, 1 — FOUR seeds hold 2 at once, against the bar of 2, so the merge-base's "never two veterans" choke does NOT hold on this cut. What happens instead:
- 190392 (peak 2, ready5-true 12 days from d95) and 190397 (peak 2, ready5-true 10 days from d82) unlock wave 5 — and die at 110d / 102d anyway.
- 190395 holds the pair for **12 straight days (d138–149)** and never unlocks: the pair is there, but the weapons bar is short the whole time (armed 4 vs demand 6; armor met at 4, tricks 36). On this seed the choke is weapons, not veterans.
- 190393 meets **every** wave-5 readiness bar for 2 days (d69–70: armored 5–6, armed 6–7, tricks 23, veterans 2, short: []) and STILL never unlocks wave 5 (maxWave 4, unlockedWave 4), dying at d84. The unlock did not fire while the village was fully ready. That is an open question, not a defect claim — the corpus records the state, not the mechanism — but it is the sharpest wave-5 observation in this bisect so far, and the next cut should check whether it recurs.

The scale wall stands: nothing reaches national, the table, or a win; wave 4 unlocks everywhere and wave 5 on 2/8, and the villages die before they can use either — on a cut where every village reaches regional.

## §4 Death causes — the same combat-heavy profile, the most deaths of any leg

709 deaths, all 8 seeds: villager combat 274, expedition 181, combat 124, the wild 82 — **661/709 (93%) combat / expedition / wild**. Monster 16 more (677/709, 95.5% combat-ish). The arena 8, sickness 5, starvation 3, ambush 3, contest 3, a stranger 3, a wound that wouldn't close 3, wound_fever 2, "Hushpuppy" 1, "Big Ugly" 1.

The profile is the survivalcontrol profile (585/615 combat/expedition/wild there, starvation 0) with the same shape and the most deaths — because the villages live longer than the origin leg's (median 110d vs 90d) and keep fighting, and the two survivors fight to the horizon. What changed between the vetphantom base and this cut is not *how* villages die but *how soon* — median 150d → 110d — and that change sits in the first third of the window (§8). Villages die fighting, not hungry, on cut 1 exactly as measured on the later bases. The scholar dies 3–18 times per seed (16, 13, 13, 3, 9, 18, 12, 12) and is succeeded each time; the exception is 190394, whose scholar dies only 3 times before the village collapses at 84d with 10 people still living. End rosters across the band (last snapshot): 0, 0, 0, 10, 2, 5, 1, 0 — the villages empty out, except 190394, which still holds 10 people when it collapses at d84 (its last snapshot is d84; the collapse is sudden, not a slow emptying — the same shape as the merge-base's 190398).

## §5 Veteran bars — the fix holds, and does no visible work on this cut either

- **Phantom days: 0 on all 8 seeds** (every daily snapshot: every killer counted in `vetsW3`/`vetsW4` is a living roster member — scholar counts as living; end-of-run engine reads agree with the instrument on both bars on all 8 seeds). The roster-check fix holds on cut 1 with the swap in — no phantom veteran is counted anywhere in the band.
- **Shadow-prevented days: 0 on all 8 seeds.** The old rule (no roster check) would have counted no extra veterans on any day — the fix does no visible work on this cut. This matches merge-a (0 shadow days), origin-a (0 shadow days), and mergebase-a (0 shadow days) and contrasts with anchor2-a, where the fix prevented 112 phantom days on seed 190394 alone: the trajectories differ, and on cut 1's trajectories no off-roster killer ever arises for the fix to exclude. The fix is not a no-op in general (anchor2-a proves it bites); it is a no-op on this particular band.
- **First veteran day:** wave-3+ killers at d25–d43 across seeds (43, 36, 35, 25, 29, 29, 42, 32) — same range as survivalcontrol (d28–d45), merge-a (d28–d37), origin-a (d26–d36), and mergebase-a (d27–d39). First wave-4+ veteran at d51–d103 on 8/8 seeds — every seed forms one. Veterans still form on schedule; the front of the pipeline is intact.
- **Living veterans at end (engine ready counts):** ready4 veterans 0/0/0/5/2/1/0/0, ready5 veterans 0/0/0/0/1/0/0/0 across seeds 190391–190398. Only 190395 ends with a wave-5 veteran, and only 190394 ends with a real wave-3+ bench (5) — the back of the pipeline breaks because the villages die, not because veterans stop forming. 190394 is ready4-true at end (armored 8, armed 10, tricks 30, veterans 5) and still dies at d84 with 10 living: readiness is not survival.
- **Tribute:** ready at end on **0/8 seeds** — every seed ends `veterans-short` (0–1 veterans against a need of 2 wave-4+ killers). Matches merge-a (0/8), origin-a (0/8), mergebase-a (0/8), and anchor-a (0/8); differs from anchor2-a (2/8 tribute-ready at end on the vetphantom base). On cut 1 no village ever holds a payable tribute pair at end — though four seeds hold the pair mid-run (§3).
- **Blooded:** 1/8 (190395 only) — report-only on this base: the blooded block is inert here (no callers), so `blooded: true` records that the village *would* be blooded under the local rule, not that any fight was blooded. 190395 holds the band's only living wave-4+ veteran pair at end (d138–149) and still dies at the horizon with the weapons bar short.
- **Ladder vs readiness:** end `ready4` veterans (wave-3+ killers) exceed `_ladderLivingVeterans(4)` (wave-4+ killers, scholar never counted on this base) exactly where the veteran is wave-3-only or the scholar (190394: ready4 5 vs ladder 0; 190395: ready4 2 vs ladder 1; 190396: ready4 1 vs ladder 0) — the expected bar distinction under the LEG 3 rule, not a disagreement. The instrument's end counts agree with the engine on both bars on all 8 seeds.

The veteran pipeline is intact at the front (first kills land on time, every seed forms a wave-4+ killer) and starved at the back by the collapse itself — and the wave-4+ bench DOES reach 2 on half the band, which is why wave 5 unlocks twice. The roster-check fix is verified working (0 phantom days) and irrelevant to the collapse (0 shadow-prevented days) — the collapse is not a phantom-veteran artifact.

## §6 Sense test — the village still feels like people; the basket flood is gone, ARC IV speaks on every seed, and the gate still doesn't talk

252 captured veteran-filtered lines across all 8 seeds (192 distinct) — down from 412 on the merge-base leg, because the `\belder\b` tightening (vetsays fix `9a32925b3`) worked: the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs **0 times** (191/412 on the merge-base leg). The tightening has one cost worth recording: it also drops the genuine Elderberry teaching line (0 hits here, 2 on the merge-base leg — "Elderberry" has no word boundary after "Elder"), so villager-to-villager teaching is unobserved in this capture, not absent. And the Pack-leader scream line ("The Pack-leader Big-Eyes is still frozen from your scream.") is **0 times** too (65 on the merge-base leg) — a different trajectory, not a filter change; the line simply never fires on this cut.

Villagers still do people things on camera:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Victorine just put down The Callback... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190392 d61)
> 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." (190391 d61 — the Mirror Draft arrives on all 8 seeds; FINAL DRAFT on all 8 too)
> 🛡️ Lulwa, Raj and Ingrid met them at the door — 3 put down. Lulwa, Raj, Ingrid are hurt. (190391 d12)
> ⚠ This one is different — scarred, braced, waiting for your opening. A Scarred veteran. (190391 d45)
> ◈ ARC IV — THE INEFFICIENCY. SYSTEM: "ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating." — They finally see it. The thing they laughed at — needing to EAT — (190396 d42)

Veteran kills get called out on camera by name (53 "remember the name" callouts), the Mirror Draft arrives everywhere, fight lines name the hurt ("Lulwa, Raj, Ingrid are hurt"), and ARC IV — THE INEFFICIENCY fires on **all 8 seeds** (8 hits) — new against the merge-base leg, where no ARC line fired at all. The top repeats are the per-seed scripted beats, once per seed (FINAL DRAFT 8x, ARC IV 8x, Mirror Draft intro 8x, "finales need a LEGEND" 8x) — repetition by design across seeds, not within a seed. And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, the seat, the wave door, or a readiness hold (0 tribute / 0 table / 0 seat / 0 unlock mentions; the 47 "door" hits are all "met them at the door" fight lines; the only "ready" hits are the word "already" inside fire-fragment lines — "The retelling is already better than the event."). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, merge-a §6, origin-a §6, mergebase-a §6, still open) — with the same edge as merge-a and mergebase-a: on this cut no village ever becomes tribute-ready at end, so there is nothing to announce; the silence is consistent with the state, not a separate defect. No succession line is captured (same as origin-a and mergebase-a, though the scholar demonstrably dies 3–18 times per seed on all 8 seeds and is succeeded — the succession happens, it just never lands in the veteran-filtered capture).

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: CUT1_COLLAPSED (2/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 2/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree (median 110d vs 150d; deaths 709 vs 707; wave-5 unlocks 2/8 vs 3/8; blooded 1/8 vs 5/8).
- **Rank read — regional reach: REGIONAL_INTACT (8/8).** The pre-registered rank rule did its job: the merge-base leg's judged stall is gone by this cut, and the analyzer judges the restoration. The rank verdict is independent of the survival verdict (this cut collapses and still reaches regional on 8/8), and the analyzer judges both.
- **Median convention:** the analyzer's median is the upper median (`s[floor(n/2)]` = 110d on sorted days 84, 84, 90, 102, 110, 139, 150, 150; the lower median would be 102d). The same function produced the merge's 126d, the origin's 90d, the merge-base's 102d, and the firstparent's 150d, so the figures are directly comparable; the vetphantom leg's 150d is a genuine ceiling effect (6/8 at the 150d horizon), not a convention artifact.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 0 on all seeds — the fix does no visible work on this band). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7, and mergebase-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this cut-1 leg on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7, and mergebase-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, anchor2-a, merge-a, origin-a, and mergebase-a ("refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here."). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Proof:** `scripts/test-bisect-r5-cut1-a.js` 63/63 green before any judged sim and again after the band (the post-band run re-swapped the fix in temporarily and restored it byte-identical afterwards — the expected pattern, since the proof's §1 needs the roster check live; the restore is verified in §9). Coverage: instrument three-way agreement alive + TB-fallen + day after; scholar-kill ladder rule (LEG 3 at this base); seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival + rank decision-rule tables.
- **Metric note for the NEXT run:** the survived-count rule did its job at 2/8 and the rank rule did its job at 8/8 — and the two rules have now SPLIT for the first time on a collapsed leg with a fully intact rank, which is itself the signal to watch. The next cut should keep both rules. One capture note: the `\belder\b` tightening ends the basket-line flood (191 → 0) but also removes the Elderberry teaching line from the capture (2 → 0) — arms reusing this driver should know teaching spread is unobserved in the capture, not absent.

## §8 Follow-up owed — the collapse is in the first third; the stall lifts inside it

1. **Cut 1 collapses.** `6dc7f8162` gives 2/8, median 110d, deaths 709 — the vetphantom fix leg's 6/8 does not survive the first tertile cut. The analyzer's CUT1_COLLAPSED count verdict stands.
2. **The rank stall lifts inside the first third.** 8/8 regional on cut 1 vs 0/8 on the merge-base — including 84d deaths reading regional. Judged this time (REGIONAL_INTACT), not merely reported. The stall's window is now narrowed to the 131 commits between `d229b58f5` and `6dc7f8162`; the collapse's window is not narrowed by this leg (both ends of the first third collapse).
3. **The next bisect step — tertile cut 2.** The survival transition sits in the later two-thirds (cut 1's 2/8 vs the firstparent's 4/8 INCONCLUSIVE): run the same 8 seeds at the second tertile boundary (~262nd commit in `d229b58f5..203a32775`) with the same swap-aware driver pattern, to find where survival lifts. The policy confound does NOT apply in the strong direction: `competent.js` is BYTE-IDENTICAL between `6dc7f8162`, `d229b58f5`, and `203a32775`, so cut-vs-either-end comparisons differ only in game code (plus the controlled standing.js swap, identical on all legs). The remaining policy confound is only against the 6/8 reference leg (counter-answer, env-gated OFF and absent at this cut — recorded in the prereg).
4. **The wave-5 choke is refined on this cut, not just measured.** Four seeds hold the 2-veteran pair; two unlock wave 5; one (190395) holds the pair 12 days blocked only by weapons; one (190393) is fully ready for 2 days and never unlocks. The next cut should check both against its own choke: does its pair get blocked by weapons too, and does a fully-ready village unlock?
5. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions, 0/8 tribute-ready at end — §6); the scale wall stands (national 0, table 0, wins 0 — §3); no succession line is captured (§6). New: ARC IV now fires on all 8 seeds (§6) — the arc machinery reaches this cut where it did not reach the merge-base.
6. **What this leg does NOT re-judge:** survivalcontrol MASTER_CHANGE, anchor, mournblooded, merge-a COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED, mergebase-a MERGEBASE_COLLAPSED + RANK_STALL — all stand. This leg adds cut 1's own verdicts: CUT1_COLLAPSED + REGIONAL_INTACT.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105b…`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and the bisect-merge/firstparent/reconciled/origin/mergebase drivers. Deleted from this worktree before finishing (untracked scratch per the prereg; it already exists on master).
- **Driver:** `scripts/bisect-r5-cut1-driver-20261112.js` (bisect-mergebase-driver copied with corpus dir `perseed-bisect-r5-cut1-a/`, RUN `bisect-r5-cut1-pilot`, arm `bisect-r5-cut1`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker AND its sha256 is exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`; pre-fix sha is this base's `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`; SAY_RE carries the vetsays `\belder\b` tightening).
- **Analyzer:** `scripts/bisect-r5-cut1-analyze-20261112.js` (exit 0 on a classified outcome; writes `evidence/2026-11-12/bisect-r5-cut1-a-summary.json`).
- **Proof:** `scripts/test-bisect-r5-cut1-a.js`, 63/63 green (before the band and after — the post-band run re-swapped the fix in temporarily; see §7).
- **Corpus:** `evidence/2026-11-12/perseed-bisect-r5-cut1-a/bisect-r5-cut1-s19039{1..8}-bisect-r5-cut1-pilot-fix.json` (8 files, `standingSha` `f8fda4295a99` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-12/bisect-r5-cut1-a-summary.json`.
- **Files in this arm:** prereg + driver + analyzer + proof (`af0b5dbf9`, require-path fix `95e9c7a0`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, `src/js/standing.js` was restored byte-identical to cut 1 (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`, `cmp` clean) and `git status` + `git diff HEAD` show no `src/js` modification. The post-band proof re-run re-swapped the fix in and restored it again, verified the same way. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
- **Proof re-run note (known mergebase-a pattern, expected not a defect):** the proof (`scripts/test-bisect-r5-cut1-a.js`) requires the `vetfirst-instrument-20261111.js` scratch file, which is deleted before finishing per the prereg. The proof must therefore be re-run by the coordinator AFTER rebase onto master, where the instrument exists — the proof cannot run on the un-rebased branch without the scratch file, and that is expected, not a defect.
