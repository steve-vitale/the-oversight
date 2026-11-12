# sim-cut2confirm-b — confirm duty: bisect round-5 cut 2 on a fresh 16-seed band

- **Run:** fleshout-20261112T1130Z, Loop B, arm sim-cut2confirm-b (CONFIRM DUTY on Loop A's most recent landed lever)
- **Prereg:** `evidence/2026-11-12/sim-cut2confirm-b-prereg.md` (committed `2ab1ab1df` before any judged sim; proof `scripts/test-cut2confirm-b.js` **66/66 green** before any judged sim and again after the band)
- **Base:** `2215e22d4` ("journey-establishment r117 (adoption closeout of dead 1445Z run)", 2026-11-09 17:48 — the 262nd commit in the window, verified: `git rev-list --count d229b58f5..2215e22d4` returns 262). The worktree was registered at master tip `ce89f2b77`; master moved to `f1e603219` before any commit, so the branch was fast-forwarded onto `f1e603219` (clean, no unique commits yet). The sims ran with the tree checked out at `2215e22d4` (detached HEAD, exactly as the r5 cut-2 and r6 cut arms ran), with the four committed files copied back in as uncommitted scratch plus the instrument as untracked scratch; see the prereg's run-mechanics section and §9.
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`; untracked scratch in this worktree, deleted before finishing per the prereg) + `scripts/cut2confirm-b-driver-20261112.js`, `scripts/cut2confirm-b-analyze-20261112.js`, `scripts/test-cut2confirm-b.js` (committed `2ab1ab1df`)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), FRESH seeds 190601–190616 (verified unused across all 778 dated preregs, all dated md under evidence/, and the named contaminated bands 99201–99208 / 99009–99024 — see the prereg), competent verbatim, SINGLE leg, mode `fix` only, with the r131 roster-check fix swapped in uncommitted (see the fix-swap note below)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: readiness reads living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). docs/MEASUREMENT.md §§9–12, 14–15 read before the prereg. No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-12/perseed-cut2confirm-b/` — 16 per-seed JSONs; summary `evidence/2026-11-12/cut2confirm-b-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The driver took ~53 min for all 16 seeds under heavy box load (load average 7.5–14; sibling Loop A sims running concurrently) — seeds ran ~2–9 min each, all 16 files landing first-try, 0 instrument errors on every seed. The leg guard (ROSTER CHECK marker + exact fix sha `f8fda4295a99`) held for every seed (`standingFix: true`, `standingSha: f8fda4295a99` in every per-seed JSON). The prereg commit hit the known index-clobber pattern (committed files showing staged-deleted + untracked); repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified with `git status` + `git diff HEAD`. The branch switch back from the detached base checkout carried the scratch deletions over as worktree deletes of the four committed files; restored with `git restore`, verified clean. Master moved again during the band (to `78d39f56e`, a Loop B sibling landing); the branch was rebased onto it after the band with the proof re-run green — see §9. Telemetry check attempted and refused by the tool (see §7). Three worktree heartbeats sent across the run.

## The fix-swap (this base predates the roster-check fix)

At `2215e22d4`, `src/js/standing.js` is the PRE-FIX version (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d` — byte-identical to the merge-base / origin pre-fix file). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base, so the fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as the prereg prescribes and as vetphantom-b / origin-a / mergebase-a / r5-cut2-a did. `standingSha` = `f8fda4295a99` is recorded per seed in the corpus. The swapped file was never committed; it was restored byte-identical afterwards (sha256 `98c8bfad70d7…` + `cmp` clean + `git status` showing no `src/js` modification — see §9).

Two swap notes, both verified, not assumed (prereg): the fix file's BLOODED block rides along but is INERT on this base — no file in `src/js` calls `villageBlooded` / `bloodedCfg` / `bloodedLine`, and the fix `standing.js` itself never calls `this.villageBlooded()` — so the only live behavioral delta the swap introduces is the roster check, and the driver's end-of-run `blooded` read is a report field only. And this base's ladder is the old inline rule with the LEG 3 scholar fix layered on — the scholar is NEVER counted (`vid === this.villagerId) return false`), where the merge-base counted the scholar as always living; LEG 3 landed somewhere between the merge-base and this cut. The proof detects the loaded scholar rule and asserts the matching count (a scholar wave-3 kill reads 1 in the swapped-in readiness gate and the instrument, 0 in this base's ladder); the survival read comes from the harness end state, not the ladder.

## Verdict: CONFIRMED + REGIONAL_INTACT

The analyzer (`scripts/cut2confirm-b-analyze-20261112.js`, exit 0) classifies **2/16 survived** under the prereg survival rule (≤4/16 → CONFIRMED) and **14/16 regional** under the pre-registered rank rule (≥11/16 → REGIONAL_INTACT). The collapse generalizes: on seeds nobody has ever run, the same base loses 14 of 16 villages. The rank verdict generalizes too, with a wrinkle — two fresh seeds never leave village rank, where the r5 band reached regional on all 8.

| Rule (prereg) | Result |
|---|---|
| ≤4/16 survive → CONFIRMED | **MET: 2/16** |
| ≥12/16 survive → REFUTED | not met |
| 5–11/16 → INCONCLUSIVE | not met |
| ≥11/16 regional → REGIONAL_INTACT | **MET: 14/16** |
| ≤4/16 regional → RANK_STALL | not met |
| 5–10/16 regional → RANK_INCONCLUSIVE | not met |

## §1 The confirm table — two survivors, seven wave-5 unlocks, regional almost everywhere

| Seed | Days | End | Standing | Scale | MaxWave | Deaths |
|---|---|---|---|---|---|---|
| 190601 | 149d | village-lost | 350 | regional | 5 | 104 |
| 190602 | 51d | village-lost | 145 | regional | 4 | 72 |
| 190603 | 128d | village-lost | 199 | regional | 4 | 110 |
| 190604 | 142d | village-lost | 199 | regional | 4 | 73 |
| 190605 | 145d | village-lost | 425 | regional | 5 | 106 |
| 190606 | 150d | **SURVIVED** | 199 | regional | 4 | 89 |
| 190607 | 95d | village-lost | 199 | village | 4 | 74 |
| 190608 | 129d | village-lost | 199 | regional | 4 | 95 |
| 190609 | 142d | village-lost | 500 | regional | 5 | 116 |
| 190610 | 124d | village-lost | 435 | regional | 5 | 104 |
| 190611 | 116d | village-lost | 320 | regional | 5 | 87 |
| 190612 | 130d | village-lost | 199 | regional | 4 | 111 |
| 190613 | 128d | village-lost | 199 | regional | 4 | 82 |
| 190614 | 61d | village-lost | 135 | village | 4 | 61 |
| 190615 | 129d | village-lost | 265 | regional | 5 | 97 |
| 190616 | 150d | **SURVIVED** | 490 | regional | 5 | 112 |
| **band** | **median 129d** | **2/16 survived** | **135–500** | **regional 14/16** | **wave5 7/16** | **1493** |

The two survivors are 190606 (wave 4 only, standing pinned at 199, roster 3 at end) and 190616 (wave 5, standing 490 — the second-highest end standing in the band — roster 3 at end). Both end with a living wave-4+ veteran pair counted 1-of-2 toward tribute (ready5 veterans 1, need 2) — the closest any seed comes to tribute-ready. The early deaths are 190602 (51d) and 190614 (61d); 190614 is also one of the two village-rank seeds, the other being 190607 (95d). Seven seeds end at exactly 199 standing — the t4-1 hold again (see §3).

## §2 Fresh band vs r5 band — the same collapse, a little softer at the edges

The r5 band (190391–190398) read 2/8 survived, median 144d, deaths 689, wave-5 unlocks 4/8, regional 8/8, standing 199–435. The fresh band reads 2/16 survived (12.5% vs 25%), median 129d, deaths 1493 (93.3/seed vs 86.1/seed), wave-5 unlocks 7/16 (44% vs 50%), regional 14/16 (87.5% vs 100%), standing 135–500. Every headline moves in the same direction or holds: survival halves in rate but stays inside the CONFIRMED band with room to spare (2 vs the ≤4 line — two more survivors would still confirm), the median drops 15 days, and the rank verdict softens from unanimous to 14/16. Nothing in the fresh band contradicts the r5 verdict; the collapse is not a property of eight particular seeds.

Two edges are worth naming. First, the fresh band's two village-rank seeds (190607, 190614) are also its two ARC-IV-less seeds (§6) — the rank stall is not entirely gone on this base, it just shows up on 2/16 fresh seeds instead of 0/8. Second, the fresh band's survivors are stronger than r5's: 190616 ends at standing 490 with 4 wave-5 kills, where r5's survivors ended at 199. The collapse generalizes; the ceiling on the survivors does not shrink with it.

## §3 Wall numbers — the wall stands, the stall mostly lifts, wave 5 opens on seven seeds

| | Vetphantom fix leg | R5 cut-2 leg | Firstparent | **This confirm leg** |
|---|---|---|---|---|
| Survived | 6/8 | 2/8 | 4/8 | **2/16** |
| Median survival | 150d | 144d | 150d | **129d** |
| Wins | 0/8 | 0/8 | 0/8 | **0/16** |
| National | 0/8 | 0/8 | 0/8 | **0/16** |
| Table | 0/8 | 0/8 | 0/8 | **0/16** |
| Wave-5 unlocks | 3/8 | 4/8 | 2/8 | **7/16** |
| Wave-4 unlocks | 8/8 | 8/8 | 8/8 | **16/16** |
| Deaths (band) | 707 | 689 | 629 | **1493** |
| Standing range | 199–375 | 199–435 | 150–325 | **135–500** |
| Blooded | 5/8 | 0/8 | 4/8 | **7/16** |
| Scale at end | regional 8/8 | regional 8/8 | regional 7/8, village 1/8 | **regional 14/16, village 2/16** |

Median survival is the analyzer's upper-median convention (`s[floor(n/2)]` on sorted days 51, 61, 95, 116, 124, 128, 128, 129, 129, 130, 142, 142, 145, 149, 150, 150 → 129d; the lower median would also be 129d here) — the same function that produced the r5 cut-2's 144d, so the figures are directly comparable.

**The standing pin, again, on 7/16 seeds.** Standing ends at exactly **199 on 7/16 seeds** (190603, 190604, 190606, 190607, 190608, 190612, 190613); the other nine end at 135–500. 199 is the t4-1 hold: `villageStandingTotal()` holds at t4-1 while any readiness bar is short, and a dead village's emptied roster meets no bars — so the end standing parks at the hold. It is NOT a mid-run stall: mid-run (d20–d60) the bars are met on 15/16 seeds — armored 4–10 (demand 3), armed 5–12 (demand 5), tricks 5–34 (demand 3) — and wave 4 unlocks on 16/16. (190602's roster empties inside the window, so its bars read 0 at the end of it; it dies at d51.) The pin is the end state of a roster that has emptied, not evidence the villages never qualified. The nine seeds that escape the pin include all seven wave-5 unlocks.

**Wave 5 was close — and opened on seven seeds.** Peak living wave-4+ veterans per seed: 2, 0, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 0, 2, 2 — and exactly the seven seeds that hold 2 at once (190601, 190605, 190609, 190610, 190611, 190615, 190616) unlock wave 5. The wave-5 choke reproduces EXACTLY on fresh seeds: a second wave-4 killer forms while the first still lives on 7/16 of the band, and where it does, the door opens. The wave-3+ bench is healthy (peak 3–6 living veterans on 15/16 seeds; 190614 peaks at 1), first wave-4+ veteran at d44–d104 on 14/16 seeds (never on 190602, 190614). Wave-5 kills land on four seeds (190609: 2, 190610: 3, 190615: 1, 190616: 4 — 10 wave-5 kills in the band) without a single win. Blooded is 7/16 — report-only on this base (the blooded block is inert here; `blooded: true` records that the seed ends with a living wave-4+ veteran under the local rule, not that any fight was blooded). It differs from r5's 0/8 because the two survivors and five of the long-lived dead seeds end with a living wave-4+ killer — on 190601 the end roster is empty but the current scholar (Farid Ahmed, wave-4 killer at d104) still counts as living.

The scale wall stands: nothing reaches national, the table, or a win; wave 4 unlocks everywhere, wave 5 on 7/16, and the villages die before they can use either — but on a base that reaches regional on 14 of 16 fresh seeds.

## §4 Death causes — the same combat-heavy profile, dying later and richer

1493 deaths, all 16 seeds: villager combat 552, expedition 358, combat 287, the wild 179, monster 68 — **1444/1493 (96.7%) combat / expedition / wild / monster**. Contest 6, the arena 5, ambush 5, a wound that wouldn't close 9, a stranger 4, the night 3, starvation 2, dehydration 2, sickness 2, alien 2, named-event causes 9 ("Choir Toad" 1, "Big Ugly" 1, "Spool" 1, "Big Loud" 1, "Gavel" 2, "The Redactor" 1, "The Focus Group" 1, "Cliffhanger" 1).

The profile is the survivalcontrol profile (585/615 combat/expedition/wild there, starvation 0) with the same shape and more deaths — because the villages live long enough to keep fighting (median 129d) and die fighting, not hungry: starvation 2, dehydration 2, sickness 2 across 1493 deaths. The scholar dies 8–17 times per seed (198 player deaths across the band: 179 "the wild", 4 a stranger, 5 the arena, 6 contest, 3 the night, 1 dehydration) and is succeeded each time; the succession itself never lands in the veteran-filtered capture (§6). End rosters across the band (last snapshot): 0 on eleven seeds, 1 on 190612, 2 on 190610, 3 on the two survivors — the villages empty out, except the survivors.

## §5 Veteran bars — the fix holds, and does visible work on one fresh seed

- **Phantom days: 0 on all 16 seeds** (every daily snapshot: every killer counted in `vetsW3`/`vetsW4` is a living roster member — scholar counts as living; end-of-run engine reads agree with the instrument on both bars on all 16 seeds). The roster-check fix holds on the fresh band with the swap in — no phantom veteran is counted anywhere.
- **Shadow-prevented days: 3 on seed 190602, 0 on the other 15.** The old rule (no roster check) would have counted extra wave-3+ veterans on 3 days of the 190602 run — the fix does visible work on this base, on fresh seeds, exactly as it did on r5's 190392 (4 days). The fix is not a no-op in general and not a no-op here.
- **First veteran day:** wave-3+ killers at d25–d55 across seeds (27, 29, 26, 37, 33, 30, 30, 33, 25, 27, 29, 31, 55, 43, 31, 32) — same range as survivalcontrol (d28–d45), r5 cut-2 (d28–d45), and the merge-base (d27–d39), with 190613 (d55) and 190614 (d43) running late. First wave-4+ veteran at d44–d104 on 14/16 seeds. Veterans still form on schedule; the front of the pipeline is intact.
- **Living veterans at end (engine ready counts):** ready4 veterans 1, 0, 0, 0, 1, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 2; ready5 veterans 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1; ladderVets4 (wave-4+ killers) 0 on all seeds except the two survivors (190606: 1, 190616: 1). The ladder-vs-readiness split is the expected bar distinction (ready counts wave-3+ killers for wave 4; the ladder counts wave-4+ killers), plus the LEG 3 scholar rule: on 190601/190605/190608/190609/190610 the ready5 veteran is the current scholar, whom this base's ladder never counts. The instrument's end counts agree with the engine on both bars on all 16 seeds.
- **Tribute:** ready at end on **0/16 seeds** — every seed ends `veterans-short` (0–1 veterans against a need of 2 wave-4+ killers). The two survivors come closest at 1 of 2. Matches r5 cut-2 (0/8), merge-a (0/8), origin-a (0/8), mergebase-a (0/8). On this base no village ever holds a payable tribute pair at end — though seven seeds held 2 wave-4+ veterans mid-run (§3), the pair never survives to the end.
- **Blooded:** 7/16 — report-only on this base: the blooded block is inert here (no callers), so `blooded: true` records that the seed ends with a living wave-4+ veteran under the local rule, not that any fight was blooded.
- **Ladder vs readiness:** end `ready4` veterans (wave-3+ killers) exceed `_ladderLivingVeterans(4)` (wave-4+ killers) exactly where the veteran is wave-3-only or the scholar — the expected bar distinction, not a disagreement.

The veteran pipeline is intact at the front (first kills land on time) and starved at the back by the collapse itself — and the wave-4+ bench reaches 2 mid-run on 7/16 seeds, which is why wave 5 opens there and nowhere else. The roster-check fix is verified working (0 phantom days) and visibly load-bearing on one fresh seed (3 shadow-prevented days on 190602) — the collapse is not a phantom-veteran artifact.

## §6 Sense test — the basket flood is gone; the gate still doesn't talk, ARC IV speaks almost everywhere

678 captured veteran-filtered lines across all 16 seeds (437 distinct) — up from the r5 band's 339/201 on 8 seeds, i.e. the same density per seed. Villagers still do people things on camera:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Mateo just put down Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190601 d35)
> 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." (190601 — the Mirror Draft arrives on all 16 seeds; FINAL DRAFT on all 16 too)
> ◈ ARC IV — THE INEFFICIENCY. SYSTEM: "ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating." — They finally see it. The thing they laughed at — needing to EAT — is the engine. (190601 d49 — ARC IV fires on 14/16 seeds, d42–d67)
> 🛡️ Reagan, Elijah, Milagros, Chester and Petra met them at the door — 5 put down. Reagan, Elijah, Milagros, Chester, Petra are hurt. (190609 d14)

Veteran kills get called out on camera by name (105 "REMEMBER the name" callouts, one per seed at minimum — every seed's first veteran kill is announced), the Mirror Draft arrives everywhere (30 mentions), ARC IV fires on 14/16 seeds, identification still teaches ("IDENTIFIED: European Elder", 7 hits), and fight lines name the hurt ("Reagan, Elijah, Milagros, Chester, Petra are hurt"). And the gate still doesn't talk: across all 16 seeds, **zero** captured lines name the tribute, the table, the seat, or a readiness hold (0 tribute / 0 table / 0 seat / 0 "ready" mentions), zero door-unlock mentions (the 95 "door" hits are all the "met them at the door" fight line), and no succession line is captured (though the scholar demonstrably dies 8–17 times per seed on all 16 seeds and is succeeded — the succession happens, it just never lands in the veteran-filtered capture). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, merge-a §6, origin-a §6, mergebase-a §6, r5-cut2-a §6, still open) — with the same edge as r5: on this base no village ever becomes tribute-ready, so there is nothing to announce; the silence is consistent with the state, not a separate defect.

Two repetition notes. First, the combat line "The Pack-leader The Eater is still frozen from your scream." repeats **65 times** — the same count as r5 cut-2's 65 (there "The Scarred The Focus Group") and the merge-base's 65: the same freeze-callout family wearing a different monster's name, 65 times on every leg. Second, "(Elder Performance Review's hide absorbs 6.)" repeats **11 times**, and "Elif strikes the Elder The Static Kite." 8 times. Nothing in the corpus is robotic or incoherent; the gap is absence (no gate voice) plus repetition, not nonsense.

One absence worth naming precisely: ARC IV does NOT fire on 190607 or 190614 — the same two seeds that never leave village rank. Every regional seed gets ARC IV; neither village-rank seed does. That correlation is new on this leg (r5's band was regional 8/8, so it could not show it) and says ARC IV tracks rank progress, not survival: the two seeds that stall at village never hear the System reclassify them.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count on fresh seeds vs r5 cut-2's 2/8: CONFIRMED (2/16).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 2/16 falls squarely in the ≤4/16 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree on the collapse (median 129d vs 144d r5; deaths 1493 vs 689 on twice the seeds; blooded 7/16 vs 0/8 is the only secondary that moves the other way, and it is a report-only end-state read, not a survival signal) while the rank verdict softens slightly (regional 14/16 vs 8/8) — which is why the rank rule earned its keep: the fresh band shows the stall is not entirely gone.
- **Rank read — regional reach: REGIONAL_INTACT (14/16).** The pre-registered rank rule did its job: the fresh band's two village-rank seeds keep the verdict honest without flipping it. The rank verdict is independent of the survival verdict (the band reaches regional on 14/16 and still collapses at 2/16), and the analyzer judges both.
- **Median convention:** the analyzer's median is the upper median (`s[floor(n/2)]` = 129d on sorted days 51, 61, 95, 116, 124, 128, 128, 129, 129, 130, 142, 142, 145, 149, 150, 150; the lower median would also be 129d here). The same function produced the r5 cut-2's 144d, so the figures are directly comparable.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 3 days on 190602 only — the fix does visible work on this band, the first nonzero shadow read on fresh seeds). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, and r5-cut2-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the r5 cut-2 leg vs this confirm leg on the same base, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, and r5-cut2-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, anchor2-a, merge-a, origin-a, mergebase-a, and r5-cut2-a ("refusing recorder-corpus input: all 16 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here."). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Proof:** `scripts/test-cut2confirm-b.js` 66/66 green before any judged sim and again after the band (instrument three-way agreement alive + TB-fallen + day after; scholar-count rule for the loaded ladder; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for survived counts 0/2/4/5/8/11/12/14/16; rank-read table for regional counts 0/2/4/5/7/10/11/13/16). The proof needed no fix after the prereg commit.
- **Metric note for the NEXT run:** the survived-count rule did its job at 2/16 and the rank rule did its job at 14/16 — and their near-split is the finding to watch: the two village-rank seeds are also the two ARC-IV-less seeds, which suggests rank and ARC IV move together. A future arm that judges rank should also pre-register the ARC IV read, so the correlation can be tested rather than noticed. The `\belder\b` filter change keeps working as preregistered (basket line 0, Elderberry line 0).

## §8 Follow-up owed — the collapse generalizes; the stall is not entirely gone; the choke is exact

1. **Cut-2 collapses on fresh seeds.** `2215e22d4` gives 2/16, median 129d, deaths 1493 — the r5 cut-2 verdict was not band noise. The analyzer's CONFIRMED count verdict stands, and it was earned on seeds nobody had run before.
2. **The rank stall is not entirely gone.** 14/16 regional on fresh seeds vs 8/8 on the r5 band — judged this time (REGIONAL_INTACT), not merely reported, but the two village-rank seeds (190607, 190614) are real: the stall's transition does not sit cleanly before cut-2 on every seed. Whatever lifts villages out of village rank between the merge-base and cut-2 lifts 14 of 16 fresh villages, not all of them.
3. **The wave-5 choke is exact on fresh seeds.** Peak living wave-4+ veterans reach 2 on exactly the seven seeds that unlock wave 5 (190601, 190605, 190609, 190610, 190611, 190615, 190616) and 1 or 0 on the nine that don't. The choke is a two-veteran coincidence problem, not a pipeline problem — and it is now measured on two independent bands (r5: 4/8, confirm: 7/16, same rule). Any build that wants wave 5 opened more often has to make the second wave-4 killer form while the first still lives, or keep the first alive longer.
4. **ARC IV tracks rank, not survival.** ARC IV fires on all 14 regional seeds and neither village-rank seed. If a later arm touches rank formation, it should check whether ARC IV follows it — the correlation is clean enough here to pre-register.
5. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions, 0/16 tribute-ready — §6); the scream-freeze line repeats 65 times on its third consecutive leg with a different monster's name — the freeze callout is a fixed 65-count family, not a per-leg accident; the scale wall stands (national 0, table 0, wins 0 — §3); the two survivors end at 199 and 490 standing with 1-of-2 tribute veterans each — the closest any leg on this base has come to tribute-ready.
6. **What this leg does NOT re-judge:** survivalcontrol MASTER_CHANGE, anchor, mournblooded, merge-a COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED, mergebase-a MERGEBASE_COLLAPSED + RANK_STALL, r5-cut1 CUT1_COLLAPSED + REGIONAL_INTACT, r5-cut2 CUT2_COLLAPSED + REGIONAL_INTACT, r6-cut CUT6_COLLAPSED + REGIONAL_INTACT — all stand. This leg adds its own verdicts: CONFIRMED + REGIONAL_INTACT on fresh seeds.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105b…`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and the bisect-merge/firstparent/reconciled/origin/mergebase/r5-cut2 drivers. Deleted from this worktree before finishing (untracked scratch per the prereg; it already exists on master).
- **Driver:** `scripts/cut2confirm-b-driver-20261112.js` (bisect-r5-cut2-driver copied with corpus dir `perseed-cut2confirm-b/`, RUN `cut2confirm-b-pilot`, arm `cut2confirm-b`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker AND its sha256 is exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`; pre-fix sha is this base's `98c8bfad70d7…`). **/elder/ filter kept at `\belder\b`** per the vetsays fix (landed `9a32925b3`) — drops the foraging-basket line from the capture (0 hits) and the Elderberry teaching line with it (0 hits), as stated in the prereg.
- **Analyzer:** `scripts/cut2confirm-b-analyze-20261112.js` (exit 0 on a classified outcome; writes `evidence/2026-11-12/cut2confirm-b-summary.json`).
- **Proof:** `scripts/test-cut2confirm-b.js`, 66/66 green (before the band and after).
- **Corpus:** `evidence/2026-11-12/perseed-cut2confirm-b/cut2confirm-b-s19060{1..6}-cut2confirm-b-pilot-fix.json` (16 files, `standingSha` `f8fda4295a99` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-12/cut2confirm-b-summary.json`.
- **Files in this arm:** prereg + driver + analyzer + proof (`2ab1ab1df`), this evidence file, the summary JSON, the 16 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, `src/js/standing.js` was restored byte-identical to the cut-2 base (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`, `cmp` clean) and `git status` + `git diff HEAD` show no `src/js` modification. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
- **Rebase note:** master moved during the band to `78d39f56e` (Loop B sibling sim-mcconfirm-refresh-b landing). After the band, the branch was rebased onto `78d39f56e` — the prereg commit replayed cleanly as `cf3dd2ed7` — and the proof (`scripts/test-cut2confirm-b.js`) re-run green (66/66) on the rebased tip. The instrument exists there as a tracked file, and the proof detects the loaded scholar rule from source, so it passes on the master tree as well as on the base tree. The prereg commit's run-time sha was `2ab1ab1df`; `cf3dd2ed7` is the same commit after the rebase.
- **Run-time note:** the driver ran ~53 min under heavy box load (load average 7.5–14); seeds ran ~2–9 min each vs r5's 50–115s. The slowdown is contention (Loop A round-6 sims + reaper scans on the same box), not a driver change — the driver is a line-for-line copy of the r5 driver with only identifiers and thresholds changed.
