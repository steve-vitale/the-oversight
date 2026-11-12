# sim-bisect-origin-a — survival-collapse bisect ORIGIN-CUT leg (Loop A)

- **Run:** fleshout-20261112T0715Z, arm sim-bisect-origin-a
- **Prereg:** `evidence/2026-11-12/sim-bisect-origin-a-prereg.md` (committed `81c5478b9` before any judged sim)
- **Base:** `a628aeaf3` ("Merge pull request #121 from steve-vitale/cursor/ove-161-capable-seed-65", the origin/master tip merged by `e4dbe581b`; the worktree arrived at master tip `ef836057c` and was reset to the base on a clean tree — see prereg)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`; untracked scratch in this worktree, deleted before finishing per the prereg) + `scripts/bisect-origin-driver-20261111.js`, `scripts/bisect-origin-analyze-20261111.js`, `scripts/test-bisect-origin-a.js` (committed `81c5478b9`, **49/49 green** before any judged sim and again after the band)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, the anchors, the merge, the first parent, and the reconciled legs (a control/bisect cut re-runs the same seeds; stated in the prereg), competent verbatim, SINGLE leg, mode `fix` only, with the r131 roster-check fix swapped in uncommitted (see the fix-swap note below)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: readiness reads living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-origin-a/` — 8 per-seed JSONs; summary `evidence/2026-11-12/bisect-origin-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The driver took ~5 min for all 8 seeds (~40s/seed), all 8 files landing first-try, 0 instrument errors on every seed. The leg guard (ROSTER CHECK marker + exact fix sha `f8fda4295a99`) held for every seed (`standingFix: true`, `standingSha: f8fda4295a99` in every per-seed JSON). One /tmp wipe mid-run (runtime restart) deleted the /tmp pattern copies; the pattern files were re-extracted from master into durable scratch (`~/workspace/scratch-bisect-origin/`) and the adaptation redone — no sim was affected. The prereg + driver + analyzer + proof commit hit the known index-clobber pattern (committed files showing staged-deleted + untracked while byte-identical to HEAD); repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified with `git status` + `git diff HEAD`. Telemetry check attempted and refused by the tool (see §7).

## The fix-swap (this base predates the roster-check fix)

At `a628aeaf3`, `src/js/standing.js` is the PRE-FIX origin version (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base, so the fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as the prereg prescribes and as vetphantom-b did. `standingSha` = `f8fda4295a99` is recorded per seed in the corpus. The swapped file was never committed; it was restored byte-identical afterwards (sha256 `98c8bfad70d7…` + `cmp` clean + `git status` showing no `src/js` modification — see §9).

Two swap notes, both verified, not assumed (prereg): the fix file's BLOODED block rides along but is INERT on this base — no file in `src/js` calls `villageBlooded` / `bloodedCfg` / `bloodedLine`, and the fix `standing.js` itself never calls `this.villageBlooded()` — so the only live behavioral delta the swap introduces is the roster check, and the driver's end-of-run `blooded` read is a report field only. And the origin base's ladder counts the scholar as always living while the merge base's ladder never counts the scholar (LEG 3) — the proof detects the loaded rule and asserts the matching count; the survival read comes from the harness end state, not the ladder.

## Verdict: ORIGIN_COLLAPSED

The analyzer (`scripts/bisect-origin-analyze-20261111.js`, exit 0) classifies **2/8 survived** under the prereg decision rule (≤2/8 → ORIGIN_COLLAPSED). The origin side collapses on the same seeds the vetphantom fix leg survived 6/8 on.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → ORIGIN_HEALTHY | not met |
| ≤2/8 survive → ORIGIN_COLLAPSED | **MET: 2/8** |
| 3–4/8 → INCONCLUSIVE | not met |

**Read §8 before quoting the verdict's gloss.** The count verdict stands — the origin tree collapses. The prereg's gloss ("the collapse IS on the origin side — the bisect steps into PRs #118–121 next") is the next step, and §8 names it precisely, plus a second origin-side observation (no village ever leaves village rank) that the next cut must carry.

## §1 The origin-cut table — the origin side collapses, on its own trajectory

| Seed | Vetphantom fix leg (`5157782a4`) | This origin-cut (`a628aeaf3`) | Merge-a (`e4dbe581b`) | Firstparent (`203a32775`) | Reconciled (`743e07d87`) |
|---|---|---|---|---|---|
| 190391 | 150d survived, 199, 4, 109 deaths | **66d, 135, 4, 50** | 103d, 165, 4, 87 | 86d, 199, 4 | 103d, 165, 4, 87 |
| 190392 | 150d survived, 199, 4, 102 | **90d, 150, 4, 46** | 150d SURVIVED, 199, 4, 70 | 144d, 199, 4 | 126d, 199, 4, 73 |
| 190393 | 150d survived, 325, 5, 66 | **71d, 199, 4, 59** | 115d, 395, 5, 76 | 150d SURVIVED, 325, 5 | 149d, 199, 4, 80 |
| 190394 | 150d survived, 199, 4, 89 | **150d SURVIVED, 520, 5, 98** | 140d, 199, 4, 100 | 43d, 150, 4 | 91d, 199, 4, 80 |
| 190395 | 109d village-lost, 199, 4, 94 | **89d, 199, 4, 65** | 76d, 199, 4, 53 | 150d SURVIVED, 199, 4 | 65d, 199, 4, 51 |
| 190396 | 85d village-lost, 199, 4, 81 | **89d, 195, 4, 44** | 126d, 199, 4, 93 | 87d, 199, 4 | 150d SURVIVED, 360, 5, 98 |
| 190397 | 150d survived, 325, 5, 88 | **150d SURVIVED, 199, 4, 103** | 115d, 199, 4, 72 | 150d SURVIVED, 275, 5 | 142d, 370, 5, 87 |
| 190398 | 150d survived, 375, 5, 78 | **95d, 199, 4, 54** | 136d, 199, 5, 70 | 150d SURVIVED, 199, 4 | 103d, 199, 4, 59 |
| **band** | **6/8 survived, median 150d, deaths 707** | **2/8 survived, median 90d, deaths 519** | **1/8, median 126d, deaths 621** | **4/8, median 150d, deaths 629** | **1/8, median 126d, deaths 615** |

(Columns read days, standing, maxWave, deaths. The origin-cut is the harshest band yet on median survival — 90d, against 126d on the merge/reconciled legs — but with the FEWEST deaths (519), because its villages die sooner: fewer days alive means fewer deaths to accumulate. The two survivors are the band's long tail, not its center.)

The origin-cut's two survivors are new: 190394 (the only wave-5 unlock on this leg, standing 520 — the highest standing on ANY leg in the bisect) and 190397. Neither matches any other leg's survivor set: the vetphantom leg's survivors were 190391/92/93/94/97/98; the merge's sole survivor was 190392; the first parent's were 190393/95/97/98; the reconciled's was 190396. Every leg keeps a different two-to-six seeds alive — the collapse is not one seed's story, it is the whole band's.

## §2 Trajectory identity — a fourth trajectory, diverging on day 2

A field-by-field comparison of this corpus against the vetphantom FIX corpus, the merge corpus, the firstparent corpus, and the reconciled corpus on master (read-only):

| Seed | vs vetphantom fix leg | vs merge-a | vs firstparent | vs reconciled |
|---|---|---|---|---|
| 190391 | daily differs, deaths differ, head differs | daily differs, deaths differ, head differs | daily differs, deaths differ, head differs | daily differs, deaths differ, head differs |
| 190392–190398 | daily differs, deaths differ, head differs on all 7 | daily differs, deaths differ, head differs on all 7 | daily differs, deaths differ, head differs on all 7 | daily differs, deaths differ, head differs on all 7 |

No seed matches any other leg's headline on any leg. The origin-cut diverges from all four legs on **day 2–5** — day 2 in the readiness reads (`ready4`/`ready5`) against the vetphantom and firstparent legs, day 4–5 in the wave-kill log against the merge and reconciled legs. The origin tree is its own trajectory from the first days: whatever the origin side changed rerolls the run before the first week is out, and the reroll is harsher (median 90d). Like the merge-cut, this is a distinct collapse trajectory, not a copy of either side — consistent with the origin side containing collapse-causing content of its own, rather than with the origin being a clean copy of the healthy base.

## §3 Wall numbers — the wall, plus a rank stall the other legs don't have

| | Vetphantom fix leg | This origin-cut | Merge-a / reconciled |
|---|---|---|---|
| Survived | 6/8 | **2/8** | 1/8 |
| Median survival | 150d | **90d** | 126d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **1/8** (190394 only) | 2/8 |
| Wave-4 unlocks | 8/8 | **8/8** | 8/8 |
| Deaths (band) | 707 | **519** | 621 / 615 |
| Standing range | 199–375 | **135–520** | 165–395 / 165–370 |
| Blooded | 5/8 | **2/8** (190394, 190395 — report-only, inert on this base) | 1/8 |
| Scale at end | regional 8/8 | **village 8/8** | regional 7/8, village 1/8 |

Median survival is the analyzer's upper-median convention (`s[floor(n/2)]` on sorted days 66, 71, 89, 89, 90, 95, 150, 150 → 90d; the lower median would be 89d) — the same function that produced the merge's 126d and the firstparent's 150d, so the figures are directly comparable.

**The rank stall.** No seed on this leg reaches regional — not even the two 150d survivors. 190394 survives the full horizon with standing **520** (higher than any standing on any other leg) and still ends at village rank; 190397 survives with standing 199 and a 8,629 kcal pantry, also village. On the vetphantom leg, all 8 seeds end regional — including the two that died at 109d and 85d — so regional is normally reached EARLY on the local line, long before the horizon. On the origin base it is never reached at all. Standing does not drive rank (520 still reads village); rank comes from links/hierarchy, and the origin side's link/regional machinery does not form the regional link on this band. This is a second, distinct origin-side observation — it does NOT explain the merge's collapse (the merge reaches regional on 7/8 and still collapses at 1/8), so the rank stall and the survival collapse are two separate origin-side findings, and the next cut must carry both. See §8.

The scale wall stands: nothing reaches national, the table, or a win; wave 4 unlocks everywhere and wave 5 on one seed, but the villages die before they can use either — and on this base they never even leave village rank.

## §4 Death causes — the same combat-heavy profile, faster

519 deaths, all 8 seeds: villager combat 241, combat 83, expedition 92, the wild 54 — **470/519 (91%) combat / expedition / wild**. Monster 23 more (493/519, 95% combat-ish). A stranger 5, the arena 5, ambush 3, a wound that wouldn't close 3, contest 2, sickness 2, starvation 2, thirst 1, dehydration 1, "a toad like a war drum, throat swelling" 1, "Ad Break" 1.

The profile is the survivalcontrol profile (585/615 combat/expedition/wild there, starvation 0) with the same shape and fewer deaths — because the villages die sooner. What changed between the vetphantom base and the origin side is not *how* villages die but *how soon* — median 150d → 90d — and that change sits on the origin side (§8). Villages die fighting, not hungry, on the origin base exactly as measured on the later bases. The scholar dies 3–10 times per seed (mostly "the wild") and is succeeded each time; the village keeps going through new bodies until the roster empties — 190398 ends with a roster of **1** living person when it collapses. End rosters across the band: 3, 3, 5, 4, 6, 3, 7, 1. Even the survivors end nearly empty (4 and 7).

## §5 Veteran bars — the fix holds, and does no visible work on this base

- **Phantom days: 0 on all 8 seeds** (every daily snapshot: every killer counted in `vetsW3`/`vetsW4` is a living roster member; end-of-run engine reads agree with the instrument on both bars on all 8 seeds). The roster-check fix holds on the origin base with the swap in — no phantom veteran is counted anywhere in the band.
- **Shadow-prevented days: 0 on all 8 seeds.** The old rule (no roster check) would have counted no extra veterans on any day — the fix does no visible work on this base. This matches merge-a (0 shadow days) and contrasts with anchor2-a, where the fix prevented 112 phantom days on seed 190394 alone: the trajectories differ, and on the origin's trajectories no off-roster killer ever arises for the fix to exclude. The fix is not a no-op in general (anchor2-a proves it bites); it is a no-op on this particular band.
- **First veteran day:** d26–d36 across seeds (26, 27, 32, 31, 36, 32, 33, 35) — same range as survivalcontrol (d28–d45) and merge-a (d28–d37). Veterans still form on schedule; the front of the pipeline is intact.
- **Living veterans at end (engine ready counts):** ready4 veterans 0/1/1/4/1/0/2/0, ready5 veterans 0/0/0/1/1/0/0/0 across seeds 190391–190398. Only the survivors end with a real veteran bench; every dead village ends with 0–1 and at most one wave-5 veteran. The back of the pipeline breaks because the villages die, not because veterans stop forming.
- **Tribute:** ready at end on **0/8 seeds** — every seed ends `veterans-short` (0 or 1 veteran against a need of 2). Matches merge-a (0/8) and anchor-a (0/8); differs from anchor2-a (2/8 tribute-ready at end on the vetphantom base). On the origin base no village ever holds a payable tribute pair.
- **Blooded:** 2/8 (190394, 190395) — report-only on this base: the blooded block is inert here (no callers), so `blooded: true` records that the village *would* be blooded under the local rule, not that any fight was blooded. 190395 holds a living wave-4+ killer and still dies at d89.
- **Ladder vs readiness:** end `ready4` veterans (wave-3+ killers) exceed `_ladderLivingVeterans(4)` (wave-4+ killers) exactly where the veteran is wave-3-only (190392, 190393, 190397) — the expected bar distinction, not a disagreement. The instrument's end counts agree with the engine on both bars on all 8 seeds.

The veteran pipeline is intact at the front (first kills land on time) and starved at the back by the collapse itself. The roster-check fix is verified working (0 phantom days) and irrelevant to the collapse (0 shadow-prevented days) — the collapse is not a phantom-veteran artifact.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

293 captured veteran-filtered lines across all 8 seeds. The capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains — 76 lines, same instrument quirk flagged in survivalcontrol-b §5, anchor-a §6, and merge-a §6; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Meera just put down Chorus Line... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190391 d32)
> 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." (190391 d50 — the Mirror Draft arrives on all 8 seeds)
> 📚 Village knowledge: Yuki taught everyone about Ground Elder. The Codex grows without you lifting a finger. (190394 d98)
> 🛡️ Colleen, Reagan, Ayan and Fulvio met them at the door — 4 put down. Colleen, Reagan, Ayan, Fulvio are hurt. (190396 d9)

Veteran kills get called out on camera by name, the Mirror Draft arrives everywhere, teaching spreads knowledge villager-to-villager. And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, or the wave door (0 tribute / 0 table mentions; the 97 "door/unlock" hits are all the foraging-basket line — "leaves the foraging basket at the door" — and fight lines — "met them at the door" — not the wave door). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, merge-a §6, still open) — with the same edge as merge-a: on this base no village ever becomes tribute-ready, so there is nothing to announce; the silence is consistent with the state, not a separate defect. Two differences from merge-a's capture, both small: **no ARC line fires on this base** (merge-a had ARC IV on 190391 d46; here ARC 0/8), and **no succession line is captured** (merge-a quoted "You wake up somebody else. Raj Patel, 50 — a Pharmacist..."; here 0, though the scholar demonstrably dies 3–10 times per seed and is succeeded — the succession happens, it just never lands in the veteran-filtered capture). One mild repetition note, same as merge-a: the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs verbatim across seeds and villagers — a scripted routine line, not incoherent, but the same sentence wearing different names. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: ORIGIN_COLLAPSED (2/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 2/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree (median 90d vs 150d; deaths 519 vs 707; wave-5 unlocks 1/8 vs 3/8; blooded 2/8 vs 5/8 — and the rank stall, village 8/8 vs regional 8/8, points the same way).
- **Median convention:** the analyzer's median is the upper median (`s[floor(n/2)]` = 90d on sorted days 66, 71, 89, 89, 90, 95, 150, 150; the lower median would be 89d). The same function produced the merge's 126d and the firstparent's 150d, so the figures are directly comparable; the vetphantom leg's 150d is a genuine ceiling effect (6/8 at the 150d horizon), not a convention artifact.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 0 on all seeds — the fix does no visible work on this band). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, and merge-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this origin-cut on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7, anchor-a §7, and merge-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, anchor2-a, and merge-a ("refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here."). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Proof:** `scripts/test-bisect-origin-a.js` 49/49 green before any judged sim and again after the band (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8).
- **Metric note for the NEXT run:** the survived-count rule did its job at 2/8, but the band's second story — the rank stall (village 8/8, standing 520 still village) — has no pre-registered metric. A future origin-side arm should pre-register a scale-rank read (regional reach on the same band) alongside survival, so the rank finding is judged rather than merely reported.

## §8 Follow-up owed — the collapse IS on the origin side; the bisect steps into PRs #118–121

1. **The origin-cut collapses.** `a628aeaf3` gives 2/8, median 90d, deaths 519 — the vetphantom fix leg's 6/8 does not survive the origin tree. The analyzer's ORIGIN_COLLAPSED count verdict stands.
2. **The next bisect step — the origin side's PRs, explicitly.** The merge's second parent is Cursor's PR #118 (villager-brain), #119 (phone-refresh), #120 (garden), #121 (capable-seed) — the merge-a §8 candidate list. This leg confirms the collapse sits in that content (alone, on its own base — not merely in combination with the merge). The bisect should now cut inside `a628aeaf3`'s ancestry: run the same 8 seeds on the merge-base of the PR stack (e.g. the parent of the PR #118 merge, or each PR's merge in turn) with the same swap-aware driver pattern, to find which PR carries the collapse. The policy confound that merge-a §8 flagged does NOT apply to this comparison: `competent.js` is byte-identical between `a628aeaf3` and `e4dbe581b`, so origin-vs-merge differ only in game code (plus the controlled standing.js swap, identical on both legs). The remaining policy confound is only against the 6/8 reference leg (counter-answer, env-gated OFF + garden plot ordering — recorded in the prereg; a policy-swap control leg on `a628aeaf3` with the `5157782a4` competent.js would close it if the coordinator wants it closed before blaming game code).
3. **The rank stall is a second, separate origin-side finding.** 0/8 regional on the origin base vs 8/8 on the vetphantom base and 7/8 on the merge/firstparent/reconciled legs — including a 150d survivor at standing 520 still reading village. It does not explain the merge's collapse (the merge reaches regional and still dies), so it is not the collapse mechanism; but it is a real origin-side break in link/regional formation and the next cut should pre-register a regional-reach read (see §7) and check whether the same PR that carries the collapse also carries the stall, or whether they split.
4. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions, 0/8 tribute-ready — §6); the Elderberry `/elder/` filter quirk in the vetfirst instrument (76 noise lines here) still needs tightening by the next arm that reuses it; the scale wall stands (national 0, table 0, wins 0 — §3); no ARC line fires on this base (§6).
5. **What this leg does NOT re-judge:** survivalcontrol MASTER_CHANGE, anchor, mournblooded, merge-a COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled COLLAPSE_CONFIRMED — all stand. This leg adds the origin side's own verdict: ORIGIN_COLLAPSED.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105b…`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and the bisect-merge/firstparent/reconciled drivers. Deleted from this worktree before finishing (untracked scratch per the prereg; it already exists on master).
- **Driver:** `scripts/bisect-origin-driver-20261111.js` (bisect-merge-driver copied with corpus dir `perseed-bisect-origin-a/`, RUN `bisect-origin-pilot`, arm `bisect-origin`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker AND its sha256 is exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`; pre-fix sha is this base's `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`).
- **Analyzer:** `scripts/bisect-origin-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-12/bisect-origin-a-summary.json`).
- **Proof:** `scripts/test-bisect-origin-a.js`, 49/49 green (before the band and after).
- **Corpus:** `evidence/2026-11-12/perseed-bisect-origin-a/bisect-origin-s19039{1..8}-bisect-origin-pilot-fix.json` (8 files, `standingSha` `f8fda4295a99` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-12/bisect-origin-a-summary.json`.
- **Files in this arm:** prereg + driver + analyzer + proof (`81c5478b9`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, `src/js/standing.js` was restored byte-identical to the origin base (sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`, `cmp` clean) and `git status` + `git diff HEAD` show no `src/js` modification. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
