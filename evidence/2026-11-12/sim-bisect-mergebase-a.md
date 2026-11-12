# sim-bisect-mergebase-a — survival-collapse bisect MERGE-BASE leg (Loop A)

- **Run:** fleshout-20261112T0815Z, arm sim-bisect-mergebase-a (ADOPTION of the dead 0715Z run; this arm never started there, so the full leg runs fresh)
- **Prereg:** `evidence/2026-11-12/sim-bisect-mergebase-a-prereg.md` (committed `789ba4ac8` before any judged sim)
- **Base:** `d229b58f5` ("Version bump 2294ef815-20261108-112829 (batch ship)", the Nov-8 merge-base of `5157782a4` and `a628aeaf3` — verified: `git merge-base 5157782a4 a628aeaf3` returns `d229b58f5`; `git rev-parse HEAD` is `d229b58f5`, tree clean at run start)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`; untracked scratch in this worktree, deleted before finishing per the prereg) + `scripts/bisect-mergebase-driver-20261111.js`, `scripts/bisect-mergebase-analyze-20261111.js`, `scripts/test-bisect-mergebase-a.js` (committed `789ba4ac8`, **60/60 green** before any judged sim and again after the band)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, the anchors, the merge, the first parent, the reconciled, and the origin legs (a control/bisect cut re-runs the same seeds; stated in the prereg), competent verbatim, SINGLE leg, mode `fix` only, with the r131 roster-check fix swapped in uncommitted (see the fix-swap note below)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: readiness reads living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-mergebase-a/` — 8 per-seed JSONs; summary `evidence/2026-11-12/bisect-mergebase-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The driver took ~10 min for all 8 seeds (~40–115s/seed), all 8 files landing first-try, 0 instrument errors on every seed. The leg guard (ROSTER CHECK marker + exact fix sha `f8fda4295a99`) held for every seed (`standingFix: true`, `standingSha: f8fda4295a99` in every per-seed JSON). The prereg + driver + analyzer + proof commit hit the known index-clobber pattern (committed files showing staged-deleted + untracked while byte-identical to HEAD); repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified with `git status` + `git diff HEAD`. Telemetry check attempted and refused by the tool (see §7). One worktree heartbeat sent mid-run (08:36Z).

## The fix-swap (this base predates the roster-check fix)

At `d229b58f5`, `src/js/standing.js` is the PRE-FIX version (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d` — byte-identical to the origin base's pre-fix file). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base, so the fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as the prereg prescribes and as vetphantom-b / origin-a did. `standingSha` = `f8fda4295a99` is recorded per seed in the corpus. The swapped file was never committed; it was restored byte-identical afterwards (sha256 `98c8bfad70d7…` + `cmp` clean + `git status` showing no `src/js` modification — see §9).

Two swap notes, both verified, not assumed (prereg): the fix file's BLOODED block rides along but is INERT on this base — no file in `src/js` calls `villageBlooded` / `bloodedCfg` / `bloodedLine`, and the fix `standing.js` itself never calls `this.villageBlooded()` — so the only live behavioral delta the swap introduces is the roster check, and the driver's end-of-run `blooded` read is a report field only. And the merge-base's ladder counts the scholar as always living (old inline rule, same as the origin base) while the merge base's ladder never counts the scholar (LEG 3) — the proof detects the loaded rule and asserts the matching count; the survival read comes from the harness end state, not the ladder.

## Verdict: MERGEBASE_COLLAPSED + RANK_STALL

The analyzer (`scripts/bisect-mergebase-analyze-20261111.js`, exit 0) classifies **1/8 survived** under the prereg survival rule (≤2/8 → MERGEBASE_COLLAPSED) and **0/8 regional** under the pre-registered rank rule (≤2/8 → RANK_STALL). The collapse AND the rank stall are both already written in the base BEFORE Cursor's PR stack #118–121.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → MERGEBASE_HEALTHY | not met |
| ≤2/8 survive → MERGEBASE_COLLAPSED | **MET: 1/8** |
| 3–4/8 → INCONCLUSIVE | not met |
| ≥5/8 regional → REGIONAL_INTACT | not met |
| ≤2/8 regional → RANK_STALL | **MET: 0/8** |
| 3–4/8 regional → RANK_INCONCLUSIVE | not met |

**Read §8 before quoting the verdict's gloss.** The count verdicts stand — the base collapses and never leaves village rank. The prereg's gloss ("the bisect steps further back, before Nov 8") is the next step, and §8 names it precisely, including which earlier cut the merge-base result now constrains.

## §1 The merge-base table — the base collapses, on its own trajectory

| Seed | Vetphantom fix leg (`5157782a4`) | This merge-base leg (`d229b58f5`) | Merge-a (`e4dbe581b`) | Firstparent (`203a32775`) | Reconciled (`743e07d87`) | Origin-a (`a628aeaf3`) |
|---|---|---|---|---|---|---|
| 190391 | 150d survived, 199, 4, 109 deaths | **95d, 199, 4, 76** | 103d, 165, 4, 87 | 86d, 199, 4, 88 | 103d, 165, 4, 87 | 66d, 135, 4, 50 |
| 190392 | 150d survived, 199, 4, 102 | **150d SURVIVED, 199, 4, 79** | 150d SURVIVED, 199, 4, 70 | 144d, 199, 4, 77 | 126d, 199, 4, 73 | 90d, 150, 4, 46 |
| 190393 | 150d survived, 325, 5, 66 | **112d, 199, 4, 79** | 115d, 395, 5, 76 | 150d SURVIVED, 325, 5, 66 | 149d, 199, 4, 80 | 71d, 199, 4, 59 |
| 190394 | 150d survived, 199, 4, 89 | **139d, 199, 4, 135** | 140d, 199, 4, 100 | 43d, 150, 4, 52 | 91d, 199, 4, 80 | 150d SURVIVED, 520, 5, 98 |
| 190395 | 109d village-lost, 199, 4, 94 | **86d, 199, 4, 87** | 76d, 199, 4, 53 | 150d SURVIVED, 199, 4, 96 | 65d, 199, 4, 51 | 89d, 199, 4, 65 |
| 190396 | 85d village-lost, 199, 4, 81 | **102d, 199, 4, 91** | 126d, 199, 4, 93 | 87d, 199, 4, 80 | 150d SURVIVED, 360, 5, 98 | 89d, 195, 4, 44 |
| 190397 | 150d survived, 325, 5, 88 | **83d, 199, 4, 71** | 115d, 199, 4, 72 | 150d SURVIVED, 275, 5, 74 | 142d, 370, 5, 87 | 150d SURVIVED, 199, 4, 103 |
| 190398 | 150d survived, 375, 5, 78 | **62d, 145, 4, 51** | 136d, 265, 5, 70 | 150d SURVIVED, 199, 4, 96 | 103d, 199, 4, 59 | 95d, 199, 4, 54 |
| **band** | **6/8 survived, median 150d, deaths 707** | **1/8 survived, median 102d, deaths 669** | **1/8, median 126d, deaths 621** | **4/8, median 150d, deaths 629** | **1/8, median 126d, deaths 615** | **2/8, median 90d, deaths 519** |

(Columns read days, standing, maxWave, deaths. The merge-base's sole survivor is 190392 — the same seed the merge leg kept alive, and one of the vetphantom leg's six. Every other seed dies earlier here than on the vetphantom leg, and 190398's 62d is the earliest death for that seed on ANY leg (vetphantom/firstparent both 150d, merge 136d, reconciled 103d, origin 95d). 190394's 135 deaths is the highest single-seed death count on any leg in the bisect — its village fights the longest losing war in the band, 139 days, and still empties.)

## §2 Trajectory identity — a sixth trajectory, diverging on day 2–7

A field-by-field comparison of this corpus against the vetphantom FIX corpus, the merge corpus, the firstparent corpus, the reconciled corpus, and the origin corpus on master (read-only; per-day signature = vetsW3 count, vetsW4 count, waveKillLog length, roster length, deaths-so-far):

| Seed | vs vetphantom fix leg | vs merge-a | vs firstparent | vs reconciled | vs origin-a |
|---|---|---|---|---|---|
| 190391 | day 4 | day 4 | day 4 | day 4 | day 6 |
| 190392 | day 4 | day 7 | day 4 | day 7 | day 5 |
| 190393 | day 4 | day 4 | day 4 | day 4 | day 4 |
| 190394 | day 5 | day 5 | day 5 | day 5 | day 6 |
| 190395 | day 4 | day 5 | day 4 | day 5 | day 5 |
| 190396 | day 6 | day 4 | day 6 | day 4 | day 4 |
| 190397 | day 2 | day 2 | day 2 | day 2 | day 2 |
| 190398 | day 4 | day 5 | day 4 | day 5 | day 5 |

No seed matches any other leg's trajectory on any leg. The merge-base diverges from all five legs on **day 2–7** — its own trajectory from the first week, like every other leg in this bisect. Six legs, six trajectories: the collapse is not one code path's story, it is what this band does on every tree except the vetphantom base. The merge-base is the harshest of the collapsed legs on the survival count (1/8, tied with merge/reconciled) but sits between the origin (median 90d) and the merge (126d) on median survival — 102d.

## §3 Wall numbers — the wall, plus a rank stall judged this time

| | Vetphantom fix leg | This merge-base leg | Origin-a | Merge-a / reconciled |
|---|---|---|---|---|
| Survived | 6/8 | **1/8** | 2/8 | 1/8 |
| Median survival | 150d | **102d** | 90d | 126d |
| Wins | 0/8 | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **0/8** | 1/8 | 2/8 |
| Wave-4 unlocks | 8/8 | **8/8** | 8/8 | 8/8 |
| Deaths (band) | 707 | **669** | 519 | 621 / 615 |
| Standing range | 199–375 | **145–199** | 135–520 | 165–395 / 165–370 |
| Blooded | 5/8 | **1/8** (190394 only) | 2/8 | 1/8 |
| Scale at end | regional 8/8 | **village 8/8** | village 8/8 | regional 7/8, village 1/8 |

Median survival is the analyzer's upper-median convention (`s[floor(n/2)]` on sorted days 62, 83, 86, 95, 102, 112, 139, 150 → 102d; the lower median would be 95d) — the same function that produced the merge's 126d, the origin's 90d, and the firstparent's 150d, so the figures are directly comparable.

**The rank stall, judged.** Regional reach is **0/8** — no seed leaves village rank, not even the 150d survivor (190392, standing 199, pantry 800 kcal). This is the second leg in a row with a 0/8 rank stall (origin-a was 0/8 too), and this leg's prereg JUDGED it: RANK_STALL. Standing does not drive rank (the origin leg's 520-standing survivor also stayed village); rank comes from links/hierarchy, and the link/regional machinery does not form the regional link on this band either. The stall is already in the merge-base — it predates the PR stack, exactly like the collapse. It does not explain the merge's collapse (the merge reaches regional on 7/8 and still collapses at 1/8), so the rank stall and the survival collapse remain two separate findings that happen to share a base.

**The standing pin.** Standing ends at exactly **199 on 7/8 seeds** (145 on 190398, which dies at 62d before reaching the hold). 199 is the t4-1 hold: `villageStandingTotal()` holds at t4-1 while any readiness bar is short, and a dead village's emptied roster meets no bars — so the end standing parks at the hold. It is NOT a mid-run stall: mid-run (d20–d60) the bars are met — armored 4–11 (demand 3), armed 6–12 (demand 5), tricks 7–34 (demand 3) — and wave 4 unlocks on 8/8. The pin is the end state of a roster that has emptied, not evidence the villages never qualified.

**Wave 5 was never close.** Peak living wave-4+ veterans per seed: 1, 1, 0, 1, 1, 1, 1, 0 — no seed ever holds 2 at once, and the wave-5 bar needs 2. The wave-3+ bench is healthy (peak 2–7 living veterans), but the wave-4 kill pipeline produces at most one living wave-4 killer at a time: a wave-4 killer forms (first wave-4+ veteran d52–d100), and dies before a second one forms. That is the wave-5 choke on this base — and with 0/8 wave-5 unlocks, this leg is the only one in the bisect with no wave-5 unlock at all.

The scale wall stands: nothing reaches national, the table, or a win; wave 4 unlocks everywhere and wave 5 nowhere, and the villages die before they can use either — on a base that never even leaves village rank.

## §4 Death causes — the same combat-heavy profile, one notch slower than the origin

669 deaths, all 8 seeds: villager combat 254, expedition 183, combat 104, the wild 83 — **624/669 (93%) combat / expedition / wild**. Monster 15 more (639/669, 95.5% combat-ish). The arena 9, sickness 8, a wound that wouldn't close 4, ambush 2, starvation 1, contest 1, a stranger 1, "The Callback" 1, "Gavel" 1, "The Loud Beast" 1, "Spool" 1.

The profile is the survivalcontrol profile (585/615 combat/expedition/wild there, starvation 0) with the same shape and more deaths — because the villages live longer than the origin leg's (median 102d vs 90d) and keep fighting. What changed between the vetphantom base and the merge-base is not *how* villages die but *how soon* — median 150d → 102d — and that change sits in the base, before the PRs (§8). Villages die fighting, not hungry, on the merge-base exactly as measured on the later bases. The scholar dies 11–15 times per seed on 7/8 seeds (mostly "the wild") and is succeeded each time; the exception is 190398, whose scholar dies once before the village collapses at 62d. End rosters across the band (last snapshot): 0, 2, 0, 0, 0, 0, 0, 8 — the villages empty out, except 190398, which still holds 8 people when it collapses at d62 (its last snapshot is d61; the collapse is sudden, not a slow emptying).

## §5 Veteran bars — the fix holds, and does no visible work on this base

- **Phantom days: 0 on all 8 seeds** (every daily snapshot: every killer counted in `vetsW3`/`vetsW4` is a living roster member — scholar counts as living; end-of-run engine reads agree with the instrument on both bars on all 8 seeds). The roster-check fix holds on the merge-base with the swap in — no phantom veteran is counted anywhere in the band.
- **Shadow-prevented days: 0 on all 8 seeds.** The old rule (no roster check) would have counted no extra veterans on any day — the fix does no visible work on this base. This matches merge-a (0 shadow days) and origin-a (0 shadow days) and contrasts with anchor2-a, where the fix prevented 112 phantom days on seed 190394 alone: the trajectories differ, and on the merge-base's trajectories no off-roster killer ever arises for the fix to exclude. The fix is not a no-op in general (anchor2-a proves it bites); it is a no-op on this particular band.
- **First veteran day:** wave-3+ killers at d27–d39 across seeds (27, 39, 34, 27, 28, 29, 27, 32) — same range as survivalcontrol (d28–d45), merge-a (d28–d37), and origin-a (d26–d36). First wave-4+ veteran at d52–d100 on 6/8 seeds; never on 190393 or 190398. Veterans still form on schedule; the front of the pipeline is intact.
- **Living veterans at end (engine ready counts):** ready4 veterans 0/0/0/1/0/1/1/2, ready5 veterans 0/0/0/1/0/0/0/0 across seeds 190391–190398. Only 190394 ends with a wave-5 veteran, and only 190398 ends with a real wave-3+ bench (2) — the back of the pipeline breaks because the villages die, not because veterans stop forming.
- **Tribute:** ready at end on **0/8 seeds** — every seed ends `veterans-short` (0–2 veterans against a need of 2 wave-4+ killers). Matches merge-a (0/8), origin-a (0/8), and anchor-a (0/8); differs from anchor2-a (2/8 tribute-ready at end on the vetphantom base). On the merge-base no village ever holds a payable tribute pair.
- **Blooded:** 1/8 (190394 only) — report-only on this base: the blooded block is inert here (no callers), so `blooded: true` records that the village *would* be blooded under the local rule, not that any fight was blooded. 190394 holds the band's only living wave-4+ killer at end and still dies at d139.
- **Ladder vs readiness:** end `ready4` veterans (wave-3+ killers) exceed `_ladderLivingVeterans(4)` (wave-4+ killers) exactly where the veteran is wave-3-only (190396, 190397, 190398) — the expected bar distinction, not a disagreement. On 190394 the two agree at 1 (the one wave-4+ killer). The instrument's end counts agree with the engine on both bars on all 8 seeds.

The veteran pipeline is intact at the front (first kills land on time) and starved at the back by the collapse itself — and the wave-4+ bench never reaches 2, which is why wave 5 never unlocks. The roster-check fix is verified working (0 phantom days) and irrelevant to the collapse (0 shadow-prevented days) — the collapse is not a phantom-veteran artifact.

## §6 Sense test — the village still feels like people; the gate still doesn't talk, and one line repeats 191 times

412 captured veteran-filtered lines across all 8 seeds (232 distinct). Villagers still do people things on camera:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Ingrid just put down The Focus Group... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190391 d30)
> 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." (190391 d64 — the Mirror Draft arrives on all 8 seeds; FINAL DRAFT on all 8 too)
> 📚 Village knowledge: Meruert taught everyone about Elderberry. The Codex grows without you lifting a finger. (190392 d65)
> 🛡️ Colin, Lulwa, Leo and Jorge met them at the door — 3 put down, 1 barely walked away. Colin, Lulwa, Leo, Jorge are hurt. (190391 d28)
> 🛡️ Kayden, Leo, Raj, Jorge and Meera met them at the door — 1 put down, 2 driven off, 1 barely walked away. Leo didn't come back. (190391 d37)

Veteran kills get called out on camera by name, the Mirror Draft arrives everywhere, teaching spreads knowledge villager-to-villager, and fight lines name the dead ("Leo didn't come back"). And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, the seat, the wave door, or a readiness hold (0 tribute / 0 table mentions; the 91 "door/unlock" hits are all the foraging-basket line and fight lines — "met them at the door" — not the wave door; the only "ready" hits are the word "already" inside the Elderberry lesson). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, merge-a §6, origin-a §6, still open) — with the same edge as merge-a and origin-a: on this base no village ever becomes tribute-ready, so there is nothing to announce; the silence is consistent with the state, not a separate defect. No ARC line fires on this base (same as origin-a; merge-a had ARC IV on 190391 d46), and no succession line is captured (same as origin-a, though the scholar demonstrably dies 11–15 times per seed on 7/8 seeds and is succeeded — the succession happens, it just never lands in the veteran-filtered capture).

Two repetition notes, both louder here than on the origin leg. First, the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs **191 times — 46% of the entire 412-line capture** — the same sentence wearing different names, on every seed. It is also what the `/elder/` filter mostly catches (191 of the 193 elder-matching lines; only 2 are the genuine Elderberry teaching line), so the instrument's elder noise is really basket-line noise on this leg. Second, the Elderberry lesson itself repeats verbatim 10 times on a single seed (190393: Jesse, then Bessie, then Pilar, all "Hold on — I already showed you this one. Elderberry. You remember." across d14–d45) — a line that says "I already showed you this one" while being shown again. And the combat line "The Pack-leader Big-Eyes is still frozen from your scream." repeats **65 times**. Nothing in the corpus is robotic or incoherent; the gap is absence (no gate voice) plus repetition, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: MERGEBASE_COLLAPSED (1/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 1/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree (median 102d vs 150d; deaths 669 vs 707; wave-5 unlocks 0/8 vs 3/8; blooded 1/8 vs 5/8 — and the rank stall, village 8/8 vs regional 8/8, points the same way).
- **Rank read — regional reach: RANK_STALL (0/8).** The pre-registered rank rule did its job: the origin leg's unjudged observation is now a judged verdict on this leg. The rank verdict is independent of the survival verdict (the merge reaches regional and still collapses), and the analyzer judges both.
- **Median convention:** the analyzer's median is the upper median (`s[floor(n/2)]` = 102d on sorted days 62, 83, 86, 95, 102, 112, 139, 150; the lower median would be 95d). The same function produced the merge's 126d, the origin's 90d, and the firstparent's 150d, so the figures are directly comparable; the vetphantom leg's 150d is a genuine ceiling effect (6/8 at the 150d horizon), not a convention artifact.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 0 on all seeds — the fix does no visible work on this band). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, merge-a §7, and origin-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this merge-base leg on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7, anchor-a §7, merge-a §7, and origin-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, anchor2-a, merge-a, and origin-a ("refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here."). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Proof:** `scripts/test-bisect-mergebase-a.js` 60/60 green before any judged sim and again after the band (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8; rank-read table for regional counts 0/2/3/4/5/6/8).
- **Metric note for the NEXT run:** the survived-count rule did its job at 1/8 and the rank rule did its job at 0/8. No new metric is owed. The next cut should keep both rules — the survival verdict and the rank verdict have now split or coincided differently on every leg (merge: collapsed + regional-intact; origin/merge-base: collapsed + stall), and that split is itself the signal to watch.

## §8 Follow-up owed — the collapse AND the stall are already in the base; the bisect steps further back

1. **The merge-base collapses.** `d229b58f5` gives 1/8, median 102d, deaths 669 — the vetphantom fix leg's 6/8 does not survive the merge-base. The analyzer's MERGEBASE_COLLAPSED count verdict stands.
2. **The rank stall is already in the base too.** 0/8 regional on the merge-base vs 8/8 on the vetphantom base — including a 150d survivor still reading village. Judged this time (RANK_STALL), not merely reported. The stall predates the PR stack exactly like the collapse.
3. **The next bisect step — further back, before Nov 8.** The collapse is NOT in Cursor's PR stack #118–121 as such: it is already written in the base those PRs were built on. The bisect should now cut inside `d229b58f5`'s ancestry: run the same 8 seeds on an earlier cut (e.g. the parent of the merge-base's most recent content, or the vetphantom-era ancestors between `203a32775` and `d229b58f5` — recall `203a32775` is an ANCESTOR of `5157782a4` and the firstparent leg on it gave 4/8 INCONCLUSIVE, so the window between the firstparent and the merge-base is live) with the same swap-aware driver pattern, to find where the collapse enters. The policy confound that origin-a §8 flagged does NOT apply to this comparison in the strong direction: `competent.js` is BYTE-IDENTICAL between `d229b58f5` and `203a32775` (firstparent), so merge-base-vs-firstparent differ only in game code (plus the controlled standing.js swap, identical on both legs). The remaining policy confound is only against the 6/8 reference leg (counter-answer, env-gated OFF — recorded in the prereg; a policy-swap control leg on `d229b58f5` with the `5157782a4` competent.js would close it if the coordinator wants it closed before blaming game code).
4. **The wave-5 choke is now measured on this base.** Peak living wave-4+ veterans never exceed 1 on any seed (0 on two); the wave-5 bar needs 2. Whatever the next cut finds, it should be checked against this choke: does the earlier base hold 2 wave-4+ veterans at once?
5. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions, 0/8 tribute-ready — §6); the foraging-basket line repeats 191 times and the Pack-leader Big-Eyes scream line 65 times — the vetfirst instrument's `/elder/` filter catches the basket line, not Elderberry, and the next arm reusing it should tighten it (or drop the basket line from the capture); the scale wall stands (national 0, table 0, wins 0 — §3); no ARC line fires on this base (§6).
6. **What this leg does NOT re-judge:** survivalcontrol MASTER_CHANGE, anchor, mournblooded, merge-a COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED — all stand. This leg adds the merge-base's own verdicts: MERGEBASE_COLLAPSED + RANK_STALL.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105b…`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and the bisect-merge/firstparent/reconciled/origin drivers. Deleted from this worktree before finishing (untracked scratch per the prereg; it already exists on master).
- **Driver:** `scripts/bisect-mergebase-driver-20261111.js` (bisect-origin-driver copied with corpus dir `perseed-bisect-mergebase-a/`, RUN `bisect-mergebase-pilot`, arm `bisect-mergebase`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker AND its sha256 is exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`; pre-fix sha is this base's `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`).
- **Analyzer:** `scripts/bisect-mergebase-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-12/bisect-mergebase-a-summary.json`).
- **Proof:** `scripts/test-bisect-mergebase-a.js`, 60/60 green (before the band and after).
- **Corpus:** `evidence/2026-11-12/perseed-bisect-mergebase-a/bisect-mergebase-s19039{1..8}-bisect-mergebase-pilot-fix.json` (8 files, `standingSha` `f8fda4295a99` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-12/bisect-mergebase-a-summary.json`.
- **Files in this arm:** prereg + driver + analyzer + proof (`789ba4ac8`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, `src/js/standing.js` was restored byte-identical to the merge-base (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`, `cmp` clean) and `git status` + `git diff HEAD` show no `src/js` modification. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
- **Proof re-run note (known origin-a pattern, expected not a defect):** the proof (`scripts/test-bisect-mergebase-a.js`) requires the `vetfirst-instrument-20261111.js` scratch file, which is deleted before finishing per the prereg. The proof must therefore be re-run by the coordinator AFTER rebase onto master, where the instrument exists — the proof cannot run on the un-rebased branch without the scratch file, and that is expected, not a defect.
