# sim-bisect-merge-a — survival-collapse bisect MERGE-CUT leg (Loop B)

- **Run:** fleshout-20261111T2317Z, arm sim-bisect-merge-a (ADOPTED — the dead run died mid-band; this arm finishes its band)
- **Prereg:** `evidence/2026-11-11/sim-bisect-merge-a-prereg.md` (committed `aaa186608` before any judged sim; the 2 seeds already run by the dead run are re-verified here, not re-judged)
- **Base:** `e4dbe581b` (the reconcile-divergence merge: "Merge origin/master into local master (divergence reconciliation, Steve-approved 2026-11-10)")
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`; untracked scratch in this worktree, deleted before finishing per the prereg) + `scripts/bisect-merge-driver-20261111.js`, `scripts/bisect-merge-analyze-20261111.js`, `scripts/test-bisect-merge-a.js` (committed `07c5acef8`, **49/49 green** before any judged sim and again after the band)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, and the anchors (a control/bisect cut re-runs the same seeds; stated in the prereg), competent verbatim, SINGLE leg, mode `fix` only, with the r131 roster-check fix swapped in uncommitted (see the fix-swap note below)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: readiness reads living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-merge-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-merge-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The dead run had already completed seeds 190391 (103d, village-lost) and 190392 (150d, survived); both re-verified here as complete valid JSON with `standingSha` = the fix sha before the remaining 6 seeds ran. The driver took ~2 min for the 6 remaining seeds (fast — the machine was unloaded; individual seeds ~20s), all 6 files landing first-try, 0 instrument errors on every seed. The leg guard (ROSTER CHECK marker + exact fix sha `f8fda4295a99`) was verified before every seed run. Telemetry check attempted and refused by the tool (see §7).

## The fix-swap (this base predates the roster-check fix)

At `e4dbe581b`, `src/js/standing.js` is the PRE-FIX version (sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base, so the fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as the prereg prescribes and as vetphantom-b did. `standingSha` = `f8fda4295a99` is recorded per seed in the corpus. The swapped file was never committed; it was restored byte-identical afterwards (sha256 `75762cb2259d…` + `git status` showing no `src/js` modification — see §9).

## Verdict: COLLAPSE_INSIDE_MERGE

The analyzer (`scripts/bisect-merge-analyze-20261111.js`, exit 0) classifies **1/8 survived** under the prereg decision rule (≤2/8 → COLLAPSE_INSIDE_MERGE). The merge base collapses on the same seeds the vetphantom fix leg survived 6/8 on.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → COLLAPSE_POST_MERGE | not met |
| ≤2/8 survive → COLLAPSE_INSIDE_MERGE | **MET: 1/8** |
| 3–4/8 → INCONCLUSIVE | not met |

**But read §8 before quoting the verdict's gloss.** The count verdict stands — the merge tree collapses. The prereg's gloss ("the collapse is inside the merge, its second-parent content") is incomplete: the merge tree also LACKS 205 local-master commits present in the vetphantom base, so this leg alone cannot attribute the collapse to the merge's second-parent content. §8 names the exact next cut that settles it.

## §1 The merge-cut table — the merge collapses, seed for seed

| Seed | Vetphantom fix leg (`5157782a4`) | This merge-cut (`e4dbe581b`) | Anchor-a / survivalcontrol (`3f136f07e` / `d33ca69f9`) |
|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4, deaths 109 | **103d, 165, 4, 87 — identical to anchor-a** | 103d, 165, 4, 87 |
| 190392 | 150d survived, standing 199, maxWave 4, deaths 102 | **150d SURVIVED, 199, 4, 70** | 126d, 199, 4, 73 |
| 190393 | 150d survived, standing 325, maxWave 5, deaths 66 | **115d, 395, 5, 76** | 149d, 199, 4, 80 |
| 190394 | 150d survived, standing 199, maxWave 4, deaths 89 | **140d, 199, 4, 100** | 91d, 199, 4, 80 |
| 190395 | 109d village-lost, standing 199, maxWave 4, deaths 94 | **76d, 199, 4, 53** | 65d, 199, 4, 51 |
| 190396 | 85d village-lost, standing 199, maxWave 4, deaths 81 | **126d, 199, 4, 93** | 150d SURVIVED, 360, 5, 98 |
| 190397 | 150d survived, standing 325, maxWave 5, deaths 88 | **115d, 199, 4, 72** | 142d, 370, 5, 87 |
| 190398 | 150d survived, standing 375, maxWave 5, deaths 78 | **136d, 199, 5, 70** | 103d, 199, 4, 59 |
| **band** | **6/8 survived, median 150d, deaths 707** | **1/8 survived, median 126d, deaths 621** | **1/8, median 126d, deaths 615** |

The merge-cut band sits next to the anchor band (1/8, median 126d, deaths 621 vs 615) and far from the vetphantom band (6/8, 150d, 707). Only one seed survives the merge, and it is the seed that also comes closest to surviving everywhere else — 190392 is the band's sole survivor on the merge and the only seed whose standing (199) and maxWave (4) match the vetphantom leg exactly. Seed 190391 lands headline-identical to anchor-a/survivalcontrol (103d, 165, 87 deaths — §2 shows the trajectory behind it is near-identical too). No other seed matches any other leg's headlines: the merge-cut is its own trajectory, not a copy of either side.

## §2 Trajectory identity — a third trajectory, not a copy of either side

A field-by-field comparison of this corpus against the vetphantom FIX corpus and the survivalcontrol corpus on master (read-only):

| Seed | vs vetphantom fix leg | vs survivalcontrol |
|---|---|---|
| 190391 | daily differs, deaths differ, head differs | **deaths list identical, head identical (103d, 165, 87)** — daily diverges at d36, in `waveKills` only |
| 190392–190398 | daily differs, deaths differ, head differs on all 7 | daily differs, deaths differ, head differs on all 7 |

The merge-cut is **not** trajectory-identical to either side — unlike anchor2-a (sha-identical to the vetphantom fix leg) and anchor-a (sha-identical to survivalcontrol). The one near-identity is instructive: on 190391 the merge-cut tracks survivalcontrol's trajectory through d35 (101 daily snapshots each, same length), diverges at d36 in exactly one field — the wave-kill log — and still lands on the identical headline (103d, standing 165, 87 deaths). A single wave-kill difference at d36 rerolls the middle of the run without changing where it ends. Every other seed diverges earlier and harder. The merge tree produces a third, distinct collapse trajectory — consistent with the merge containing collapse-causing content AND lacking content the vetphantom base has (§8), rather than with the merge being a clean copy of either side.

## §3 Wall numbers — the wall is the anchor wall, not the vetphantom wall

| | Vetphantom fix leg | This merge-cut | Anchor-a / survivalcontrol |
|---|---|---|---|
| Survived | 6/8 | **1/8** | 1/8 |
| Median survival | 150d | **126d** | 126d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** (190393, 190398) | 2/8 |
| Wave-4 unlocks | 8/8 | **8/8** | 8/8 |
| Deaths (band) | 707 | **621** | 615 |
| Standing range | 199–375 | **165–395** | 165–370 |
| Blooded | 5/8 | **1/8** (190392 only) | 1/8 (190398 only) |
| Scale at end | — | regional 7/8, village 1/8 (190395) | — |

Median survival is the analyzer's upper-median convention (`s[floor(n/2)]` on sorted days 76, 103, 115, 115, 126, 136, 140, 150 → 126d) — the same function that produced anchor-a's 126d, so the two 126d figures are directly comparable. The wall numbers are the anchor wall: nothing reaches national, the table, or a win; wave 4 unlocks everywhere and wave 5 on two seeds, but the villages die before they can use either. The one survivor (190392) ends at regional with standing 199 and a 9,346 kcal pantry — alive, but no closer to national than the dead villages. The scale wall stands: the merge does not open the on-ramp, it closes the survival that the vetphantom base had.

## §4 Death causes — the same combat-heavy profile, slightly fewer deaths

621 deaths, all 8 seeds: villager combat 279, combat 122, expedition 86, the wild 98 — **585/621 (94%) combat / expedition / wild**. Monster 16, the arena 7, contest 3, a stranger 3, and one each of The Paparazzo, the night, a wound that wouldn't close, ambush, Big Loud, alien, Gavel. Starvation 0, sickness 0, thirst 0.

The profile is the survivalcontrol profile (585/615 combat/expedition/wild there, starvation 0) with the same shape and six more deaths. What changed between the vetphantom base and the merge is not *how* villages die but *how soon* — median 150d → 126d — and that change sits at or before the merge (§8). Villages die fighting, not hungry, on the merge exactly as measured on the later base.

## §5 Veteran bars — the fix holds, and does no visible work on this base

- **Phantom days: 0 on all 8 seeds** (every daily snapshot: every killer counted in `vetsW3`/`vetsW4` is a living roster member). The roster-check fix holds on the merge base with the swap in — no phantom veteran is counted anywhere in the band.
- **Shadow-prevented days: 0 on all 8 seeds.** The old rule (no roster check) would have counted no extra veterans on any day — the fix does no visible work on this base. This contrasts with anchor2-a, where the fix prevented 112 phantom days on seed 190394 alone: the trajectories differ, and on the merge's trajectories no off-roster killer ever arises for the fix to exclude. The fix is not a no-op in general (anchor2-a proves it bites); it is a no-op on this particular band.
- **First veteran day:** d28–d37 across seeds (28, 28, 30, 33, 33, 35, 37, 37) — same range as survivalcontrol (d28–d45) and anchor-a. Veterans still form on schedule; the front of the pipeline is intact.
- **Living veterans at end (engine ready counts):** ready4 veterans 0/4/2/1/0/0/0/0, ready5 veterans 0/1/0/0/0/0/0/0 across seeds 190391–190398. Only the survivor (190392) ends with a real veteran bench (4 wave-4-ready, 1 wave-5-ready); every dead village ends with 0–2 and no wave-5 veteran. The back of the pipeline breaks because the villages die, not because veterans stop forming.
- **Tribute:** ready at end on **0/8 seeds** — every seed ends `veterans-short` (0 or 1 veteran against a need of 2). This differs from anchor2-a (2/8 tribute-ready at end on the vetphantom base) and matches anchor-a (0/8). On the merge base no village ever holds a payable tribute pair.
- **Blooded:** 1/8 (190392 only, from the summary JSON).

The veteran pipeline is intact at the front (first kills land on time) and starved at the back by the collapse itself. The roster-check fix is verified working (0 phantom days) and irrelevant to the collapse (0 shadow-prevented days) — the collapse is not a phantom-veteran artifact.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

457 captured veteran-filtered lines across all 8 seeds. The capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains — 106 lines, same instrument quirk flagged in survivalcontrol-b §5 and anchor-a §6; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera:

> 📓 Codex: you've heard of Cold-Blooded. Someone, somewhere, can do this. Now you know its name. (190391 d13)
> ◈ THE SYSTEM has been watching Raj — Craft 1. Three offers; they took Cold-Blooded. Earned, chosen. (190391 d13)
> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Lulwa just put down Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190391 d33)
> 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." (190391 d42)
> ◈ ARC IV — THE INEFFICIENCY. SYSTEM: "ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating." — They finally see it. The thing they laughed at — needing to EAT — is the engine. (190391 d46)
> 🪞 You wake up somebody else. Raj Patel, 50 — a Pharmacist. His hands know different work now: Iron Stomach, Cold-Blooded, Berserker Rage. (190391 d81)

ARC IV fires, the Mirror Draft arrives, veteran kills get called out on camera by name, succession lands with a new body and a lived skill set. And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, or the wave door (0 tribute / 0 table / 0 wave-door mentions in the full vetSays capture). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, anchor2-a §6, still open) — now with a sharper edge in the other direction: on this base no village ever becomes tribute-ready, so there is nothing to announce; the silence is consistent with the state, not a separate defect. One mild repetition note: the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs verbatim across seeds and villagers — a scripted routine line, not incoherent, but the same sentence wearing different names. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: COLLAPSE_INSIDE_MERGE (1/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 1/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree (median 126d vs 150d; deaths 621 vs 707; wave-5 unlocks 2/8 vs 3/8; blooded 1/8 vs 5/8).
- **Median convention:** the analyzer's median is the upper median (`s[floor(n/2)]` = 126d on sorted days 76, 103, 115, 115, 126, 136, 140, 150; the lower median would be 115d). The same function produced anchor-a's 126d, so the merge-cut and anchor-a medians are directly comparable; the vetphantom leg's 150d is a genuine ceiling effect (6/8 at the 150d horizon), not a convention artifact.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 0 on all seeds — the fix does no visible work on this band). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7 and anchor-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this merge-cut on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7 and anchor-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, and anchor2-a ("recorder-corpus input ... compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Proof:** `scripts/test-bisect-merge-a.js` 49/49 green before any judged sim and again after the band (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8).

## §8 Follow-up owed — the verdict stands, its gloss does not; the next arm cuts the merge's first parent

1. **The merge-cut collapses.** `e4dbe581b` gives 1/8, median 126d, deaths 621 — the vetphantom fix leg's 6/8 does not survive the merge tree. The analyzer's COLLAPSE_INSIDE_MERGE count verdict stands.
2. **The ancestry twist the prereg did not state.** `5157782a4` (the vetphantom base) is NOT an ancestor of the merge — it is a *descendant* of the merge's first parent `203a32775` ("sim-wave5kill-a: blooded damage/survivability lever…"), 205 commits later. The merge was cut from a stale local master: its tree is old local master (203a32775) + origin/master (`a628aeaf3`, Cursor PRs #118–121). So the merge tree differs from the vetphantom base in BOTH directions: it ADDS origin-side content (32 src/js files, +4,916/−1,363: villager-brain +1,061, villager-objectives +613, godverbs +587, convo-wants +570, conversation +435, titans +427, bond-initiation +380, game.js 293, villager-agency +249, person-trust +233, contestEngine +221, hierarchy 217, convo-dialogue +179, fieldFights +113, godpath +110, companion-score +103, party-formal 100, ladder 95, …) AND it LACKS 205 local-master commits present in the vetphantom base (including the r131 roster-check fix — swapped in here, so controlled — plus journey-succession r181 and the sim-* arms). The prereg's gloss ("second-parent content") covers only the first direction. The collapse could be (H1) origin-side content in the merge, or (H2) a protective local commit in `203a32775..5157782a4` that the merge predates. This leg cannot distinguish them.
3. **The next bisect step — the merge's FIRST PARENT, explicitly.** Run `203a32775` on the same 8 seeds, same policy, same horizon, with the r131 fix swapped in (it predates the fix too; same swap-aware driver pattern, same guard). If `203a32775` gives ≥5/8, the collapse is in the merge's second-parent (origin) content — H1 confirmed — and the bisect steps into the origin side (PR #118 villager-brain, #119 phone-refresh, #120 garden, #121 capable-seed). If `203a32775` gives ≤2/8, the collapse predates the merge on the local line and the repair sits in `203a32775..5157782a4` — bisect that 205-commit range instead (r131 already controlled by the swap; the remaining candidates are journey-succession r181 and the sim-arm landings). This arm does NOT attempt it — it cuts at the merge only.
4. **The policy confound is still open (anchor-a §8, sharper now).** `scripts/policies/competent.js` differs on all three legs: the merge tree took the origin side's version (OVE-160 garden caretaker appointment, `91cb6fa20`, on the second-parent side), and the local line edited it again after `203a32775` (sim-counterclose-a / sim-raiserseat-a / sim-counterconfirm-a in `203a32775..5157782a4`). A garden-appointment reorder flipping 6/8 → 1/8 by itself is implausible, but deterministic chaos means any RNG-order change rerolls downstream trajectories, so it cannot be dismissed by inspection alone. **The first-parent arm must control for it** — run TWO legs on `203a32775`: its own `competent.js`, and the vetphantom-base `competent.js` swapped in (policy-side swap, same pattern as the standing.js swap) — to separate the garden hunk from game code before blaming either.
5. **A second cut is owed after the first-parent leg:** the actually-shipped reconciled tree. The final reconciled master is `743e07d87` (reconcile-divergence branch tip), not `e4dbe581b` — the merge tested here was cut from stale local master. Once the first-parent leg attributes the collapse, a confirmatory leg on `743e07d87` (same seeds, same policy) should verify the shipped tree's number; if the reconciled tree recovers to ~6/8, the collapse was a stale-base artifact of the intermediate merge, not of the shipped code.
6. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions, 0/8 tribute-ready — §6); the Elderberry `/elder/` filter quirk in the vetfirst instrument (106 noise lines here) still needs tightening by the next arm that reuses it; the scale wall stands (national 0, table 0, wins 0 — §3).

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105b…`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and the bisect-anchor drivers. Deleted from this worktree before finishing (untracked scratch per the prereg; it already exists on master).
- **Driver:** `scripts/bisect-merge-driver-20261111.js` (survivalcontrol-driver copied with corpus dir `perseed-bisect-merge-a/`, RUN `bisect-merge-pilot`, arm `bisect-merge`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker AND its sha256 is exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`).
- **Analyzer:** `scripts/bisect-merge-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-merge-a-summary.json`).
- **Proof:** `scripts/test-bisect-merge-a.js`, 49/49 green (before the band and after).
- **Corpus:** `evidence/2026-11-11/perseed-bisect-merge-a/bisect-merge-s19039{1..8}-bisect-merge-pilot-fix.json` (8 files, `standingSha` `f8fda4295a99` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-11/bisect-merge-a-summary.json`.
- **Files in this arm:** prereg (`aaa186608`), instrument (`07c5acef8`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, `src/js/standing.js` was restored byte-identical to the merge base (sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`) and `git status` shows no `src/js` modification. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
