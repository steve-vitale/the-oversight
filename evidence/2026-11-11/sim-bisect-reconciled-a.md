# sim-bisect-reconciled-a — survival-collapse bisect RECONCILED-MASTER leg (Loop A)

- **Run:** fleshout-20261112T0332Z, Loop A, axis scale-onramp / survival-collapse bisect ROUND 3 (confirmatory leg)
- **Prereg:** `evidence/2026-11-11/sim-bisect-reconciled-a-prereg.md` (committed `ca3f1130f` before any judged sim; proof 50/50 green on the branch and again on the target base before the band)
- **Base:** `743e07d87` (the SHIPPED reconciled master — "Merge-forward master (3daa1a9b6) into reconcile-divergence (fresh pin-comparison base)"; the merge-forward of master into reconcile-divergence, the thing that would actually ship)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`; restored from the branch as untracked scratch for the run since it does not exist at `743e07d87`, exactly as merge-a did at `e4dbe581b`) + `scripts/bisect-reconciled-driver-20261111.js`, `scripts/bisect-reconciled-analyze-20261111.js`, `scripts/test-bisect-reconciled-a.js` (committed `ca3f1130f`, **50/50 green** before any judged sim, again on the target base with the fix swapped in, and the count re-verified after the band — see §9)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, the anchors, merge-a, and policyswap-a (a control/bisect cut re-runs the same seeds; stated in the prereg), competent verbatim from `743e07d87` itself (NO policy swap — sha256 `3c40151e8dd4…`, identical to current HEAD's competent.js), SINGLE leg, mode `fix` only, with the r131 roster-check fix swapped in uncommitted (see the fix-swap note below)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: readiness reads living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-reconciled-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-reconciled-a-summary.json`
- **Run notes (infrastructure):** the band took ~8 min for 8 seeds (~60s/seed — the machine was loaded; sibling legs were running), 0 instrument errors on every seed, `standingSha` = the fix sha on every seed. The checkout dance followed the merge-a pattern exactly: worktree checked out `743e07d87` detached, driver/analyzer/proof/instrument restored as untracked scratch via `git show <branch>`, fix standing.js swapped in, proof re-run green on the target base, band run, standing.js restored byte-identical (sha `75762cb2259d…`), branch checked back out. One checkout-back hiccup: `git checkout <branch>` refused while the untracked scratch copies of the tracked tool files were present ("move or remove them before you switch branches") — the scratch copies were deleted (content safe in commit `ca3f1130f`) and the checkout then succeeded. A host write flap (EPERM bursts) struck repeatedly during proof runs — see §9 for the diagnosis and the hardening it forced. Heartbeats landed on the tree throughout.

## The fix-swap (this base predates the roster-check fix)

The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of `743e07d87` — verified at run start (`git merge-base --is-ancestor 5d16916f4 743e07d87` fails; `743e07d87` IS a descendant of the merge-cut `e4dbe581b`). Its `src/js/standing.js` is the PRE-FIX version (sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c` — byte-identical to the merge base's pre-fix file). The fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as the prereg prescribes and as merge-a did. `standingSha` = `f8fda4295a99` is recorded per seed in the corpus. The swapped file was never committed; it was restored byte-identical afterwards (sha256 `75762cb2259d…` + `git status` showing no `src/js` modification — see §9). **The fix was present-and-controlled, never committed as a game change.**

## Verdict: COLLAPSE_CONFIRMED

The analyzer (`scripts/bisect-reconciled-analyze-20261111.js`, exit 0) classifies **1/8 survived** under the prereg decision rule (≤2/8 → COLLAPSE_CONFIRMED). The collapse reproduces on the shipped reconciled master — it was NOT an artifact of the stale merge cut.

| Rule (prereg) | Result |
|---|---|
| ≤2/8 survive → COLLAPSE_CONFIRMED | **MET: 1/8** |
| ≥5/8 survive → RECONCILED_NO_COLLAPSE | not met |
| 3–4/8 → INCONCLUSIVE | not met |

## §1 The reconciled table — the shipped master collapses, seed for seed

| Seed | Vetphantom fix leg (`5157782a4`) | Merge-cut (`e4dbe581b`) | This reconciled leg (`743e07d87`) | Anchor-a / survivalcontrol (`3f136f07e` / `d33ca69f9`) |
|---|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4, deaths 109 | 103d, 165, 4, 87 | **103d, 165, 4, 87 — identical to merge-a AND anchor-a** | 103d, 165, 4, 87 |
| 190392 | 150d survived, standing 199, maxWave 4, deaths 102 | 150d SURVIVED, 199, 4, 70 | **126d, 199, 4, 73 — identical to anchor-a** | 126d, 199, 4, 73 |
| 190393 | 150d survived, standing 325, maxWave 5, deaths 66 | 115d, 395, 5, 76 | **149d, 199, 4, 80 — identical to anchor-a** | 149d, 199, 4, 80 |
| 190394 | 150d survived, standing 199, maxWave 4, deaths 89 | 140d, 199, 4, 100 | **91d, 199, 4, 80 — identical to anchor-a** | 91d, 199, 4, 80 |
| 190395 | 109d village-lost, standing 199, maxWave 4, deaths 94 | 76d, 199, 4, 53 | **65d, 199, 4, 51 — identical to anchor-a** | 65d, 199, 4, 51 |
| 190396 | 85d village-lost, standing 199, maxWave 4, deaths 81 | 126d, 199, 4, 93 | **150d SURVIVED, 360, 5, 98 — identical to anchor-a** | 150d SURVIVED, 360, 5, 98 |
| 190397 | 150d survived, standing 325, maxWave 5, deaths 88 | 115d, 199, 4, 72 | **142d, 370, 5, 87 — identical to anchor-a** | 142d, 370, 5, 87 |
| 190398 | 150d survived, standing 375, maxWave 5, deaths 78 | 136d, 199, 5, 70 | **103d, 199, 4, 59 — identical to anchor-a** | 103d, 199, 4, 59 |
| **band** | **6/8 survived, median 150d, deaths 707** | **1/8 survived, median 126d, deaths 621** | **1/8 survived, median 126d, deaths 615** | **1/8, median 126d, deaths 615** |

The reconciled leg's band sits exactly on the anchor band (1/8, median 126d, deaths 615 vs 615) and far from the vetphantom band (6/8, 150d, 707). The merge-cut's sole survivor (190392) does NOT survive here — it dies at 126d, the anchor number. The survivor here is 190396, the anchor survivor, at the anchor's 150d/360/wave-5. No seed matches the merge-cut's headlines except 190391 (which matches both).

## §2 Trajectory identity — the reconciled master IS the anchor trajectory, not a third one

A field-by-field comparison of this corpus against the anchor-a corpus and the survivalcontrol corpus (read-only), and against the vetphantom FIX corpus:

| Seed | vs anchor-a | vs survivalcontrol | vs vetphantom fix leg |
|---|---|---|---|
| 190391 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190392 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190393 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190394 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190395 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190396 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190397 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |
| 190398 | **daily IDENTICAL, deaths identical, vetSays identical** | **daily IDENTICAL, deaths identical** | daily differs, deaths differ |

"Daily IDENTICAL" means every per-day instrument snapshot compares equal as JSON (roster, wave-kill log, veteran counts, readiness bars, shadow counts) — not just the headlines. This is stronger than the merge-cut's result: the merge-cut was a *third* trajectory, distinct from both sides. The reconciled master produces the anchor/survivalcontrol trajectory exactly, on all 8 seeds, including the captured dialogue. The collapse on the shipped reconciled master is the same collapse current master has — the merge-forward changed nothing these seeds can touch, and the stale-cut artifact hypothesis is dead: the merge-cut's 1/8 was not a stale-base fluke, it was the same collapse wearing a different trajectory (the merge-cut's own code differences rerolled the seeds without changing the count).

## §3 Wall numbers — the anchor wall, exactly

| | Vetphantom fix leg | Merge-cut | This reconciled leg | Anchor-a / survivalcontrol |
|---|---|---|---|---|
| Survived | 6/8 | 1/8 | **1/8** | 1/8 |
| Median survival | 150d | 126d | **126d** | 126d |
| Wins | 0/8 | 0/8 | **0/8** | 0/8 |
| National | 0/8 | 0/8 | **0/8** | 0/8 |
| Table | 0/8 | 0/8 | **0/8** | 0/8 |
| Wave-5 unlocks | 3/8 | 2/8 | **2/8** (190396, 190397) | 2/8 |
| Wave-4 unlocks | 8/8 | 8/8 | **8/8** | 8/8 |
| Deaths (band) | 707 | 621 | **615** | 615 |
| Standing range | 199–375 | 165–395 | **165–370** | 165–370 |
| Blooded | 5/8 | 1/8 (190392) | **1/8 (190398)** | 1/8 (190398) |
| Scale at end | — | regional 7/8, village 1/8 | **regional 7/8, village 1/8 (190395)** | — |

Median survival is the analyzer's upper-median convention (`s[floor(n/2)]` on sorted days 65, 91, 103, 103, 126, 142, 149, 150 → 126d) — the same function that produced anchor-a's 126d, so the two 126d figures are directly comparable. Nothing reaches national, the table, or a win; wave 4 unlocks everywhere and wave 5 on two seeds, but the villages die before they can use either. The one survivor (190396) ends at regional with standing 360 and a 7,902 kcal pantry — alive, wave-5 unlocked, but no closer to national than the dead villages. The scale wall stands on the shipped tree: the reconciled master does not open the on-ramp.

## §4 Death causes — the survivalcontrol profile, exactly

615 deaths, all 8 seeds: villager combat 283, combat 100, expedition 100, the wild 102 — **585/615 (95%) combat / expedition / wild**. Monster 15, the arena 7, the night 1, contest 1, ambush 1, a stranger 2, The Paparazzo 1, The Static Kite 1, Gavel 1. Starvation 0, sickness 0, thirst 0.

This is the survivalcontrol profile (585/615 combat/expedition/wild there, starvation 0) with the identical total and the identical shape — because the trajectories are identical (§2), not merely similar. Villages die fighting, not hungry, on the reconciled master exactly as measured on current master.

## §5 Veteran bars — the fix holds, and does no visible work on this base

- **Phantom days: 0 on all 8 seeds** (every daily snapshot: every killer counted in `vetsW3`/`vetsW4` is a living roster member). The roster-check fix holds on the reconciled base with the swap in — no phantom veteran is counted anywhere in the band.
- **Shadow-prevented days: 0 on all 8 seeds.** The old rule (no roster check) would have counted no extra veterans on any day — the fix does no visible work on this base. Same as the merge-cut (0/0 there too); contrasts with anchor2-a, where the fix prevented 112 phantom days on seed 190394 alone. The fix is not a no-op in general (anchor2-a proves it bites); it is a no-op on this particular band.
- **First veteran day:** d28–d45 across seeds (33, 45, 28, 28, 30, 37, 33, 35) — same range as survivalcontrol (d28–d45) and anchor-a. Veterans still form on schedule; the front of the pipeline is intact. Wave-4 readiness is met the same day as the first veteran on every seed (d28–d45); wave-5 readiness only on 190396 (d115).
- **Living veterans at end (engine ready counts):** ready4 veterans 0/0/0/0/0/0/0/3, ready5 veterans 0/0/0/0/0/0/0/1 across seeds 190391–190398. Only 190398 ends with a real veteran bench (3 wave-4-ready, 1 wave-5-ready) — and it died at d103. The sole survivor (190396) ends with ZERO living veterans: it met wave-5 readiness at d115 and then outlived its entire veteran generation before d150. The back of the pipeline breaks because the villages die — and, on the survivor, because the veterans die even when the village doesn't.
- **Tribute:** ready at end on **0/8 seeds** — every seed ends `veterans-short` (0 or 1 veteran against a need of 2; 190398 holds 1). Matches anchor-a (0/8) and the merge-cut (0/8); differs from anchor2-a (2/8 tribute-ready at end on the vetphantom base). On the reconciled base no village ever holds a payable tribute pair.
- **Blooded:** 1/8 (190398 only, from the summary JSON — the same seed as anchor-a).

The veteran pipeline is intact at the front (first kills land on time) and starved at the back by the collapse itself. The roster-check fix is verified working (0 phantom days) and irrelevant to the collapse (0 shadow-prevented days) — the collapse is not a phantom-veteran artifact.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

452 captured veteran-filtered lines across all 8 seeds. The capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains — 116 lines, same instrument quirk flagged in survivalcontrol-b §5, anchor-a §6, and merge-a §6; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera — and because the trajectories are identical to anchor-a (§2), the scenes are the anchor scenes, re-observed, not new:

> 📓 Codex: you've heard of Cold-Blooded. Someone, somewhere, can do this. Now you know its name. (190391 d13)
> ◈ THE SYSTEM has been watching Raj — Craft 1. Three offers; they took Cold-Blooded. Earned, chosen. (190391 d13)
> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Lulwa just put down Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190391 d33)
> 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." (190391 d42)
> ◈ ARC IV — THE INEFFICIENCY. SYSTEM: "ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating." — They finally see it. The thing they laughed at — needing to EAT — is the engine. (190391 d46)
> 🪞 You wake up somebody else. Raj Patel, 50 — a Pharmacist. His hands know different work now: Iron Stomach, Cold-Blooded, Berserker Rage. (190391 d81)

ARC IV fires, the Mirror Draft arrives, veteran kills get called out on camera by name, succession lands with a new body and a lived skill set. And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, or the wave door (0 tribute / 0 table / 0 wave-door mentions in the full vetSays capture). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, anchor2-a §6, merge-a §6, still open) — with the same sharp edge as merge-a: on this base no village ever becomes tribute-ready, so there is nothing to announce; the silence is consistent with the state, not a separate defect. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: COLLAPSE_CONFIRMED (1/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 1/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree (median 126d vs 150d; deaths 615 vs 707; wave-5 unlocks 2/8 vs 3/8; blooded 1/8 vs 5/8). The trajectory-identity check (§2) strengthens the verdict beyond the count: the reconciled master reproduces the anchor collapse trajectory exactly, daily-snapshot for daily-snapshot.
- **Median convention:** the analyzer's median is the upper median (`s[floor(n/2)]` = 126d on sorted days 65, 91, 103, 103, 126, 142, 149, 150; the lower median would be 103d). The same function produced anchor-a's 126d, so the reconciled and anchor-a medians are directly comparable; the vetphantom leg's 150d is a genuine ceiling effect (6/8 at the 150d horizon), not a convention artifact.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 0 on all seeds — the fix does no visible work on this band). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, and merge-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this reconciled leg on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7, anchor-a §7, merge-a §7, and policyswap-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, anchor2-a, merge-a, and policyswap-a ("recorder-corpus input … compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward on a 1/8 collapse corpus would be wrong.
- **Proof:** `scripts/test-bisect-reconciled-a.js` 50/50 green before any judged sim, again on the target base with the fix swapped in, and re-verified after the band (see §9). The proof carries one more assertion than merge-a's 49 (the writeRobust real-time backoff check, §9).

## §8 Follow-up owed — the collapse is real on the shipped tree; the bisect continues into the merge's second-parent content

1. **The collapse is confirmed on the shipped reconciled master.** `743e07d87` gives 1/8, median 126d, deaths 615 — and reproduces the anchor-a/survivalcontrol trajectory exactly (§2). The merge-cut collapse was NOT an artifact of the stale cut. The prereg's RECONCILED_NO_COLLAPSE branch (re-cut the merge) does not apply.
2. **The next bisect step is the one the prereg names: into the merge's second-parent (origin) content.** The collapse sits in `5157782a4..3f136f07e` game code (policy exonerated by policyswap-a; the fix controlled by the swap here and in merge-a). The origin side is 32 src/js files (+4,916/−1,363 vs the first parent, per merge-a §8: villager-brain +1,061, villager-objectives +613, godverbs +587, convo-wants +570, conversation +435, titans +427, bond-initiation +380, game.js 293, villager-agency +249, person-trust +233, contestEngine +221, hierarchy 217, convo-dialogue +179, fieldFights +113, godpath +110, companion-score +103, party-formal 100, ladder 95, …). The first-parent leg (`203a32775`, sibling arm sim-bisect-firstparent-a) is the complementary cut: if it gives ≥5/8, the collapse is in the origin content and the bisect steps into the PRs (#118 villager-brain, #119 phone-refresh, #120 garden, #121 capable-seed); if it gives ≤2/8, the collapse predates the merge on the local line and the repair sits in `203a32775..5157782a4`. This arm does NOT attempt either — it cuts at the reconciled master only.
3. **A note for the first-parent leg:** the reconciled leg's exact trajectory identity with anchor-a means the merge-forward's own code delta vs `3f136f07e` is behaviorally silent on these seeds. Whatever the first-parent leg finds, the reconciled master and current master now share one collapse trajectory — future legs can treat them as the same measurement.
4. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions, 0/8 tribute-ready — §6); the Elderberry `/elder/` filter quirk in the vetfirst instrument (116 noise lines here) still needs tightening by the next arm that reuses it; the scale wall stands (national 0, table 0, wins 0 — §3). The survivor-outlives-its-veterans note (§5: 190396 meets wave-5 readiness d115, ends veteran-less at d150) is a new observation for the village assessment, not a new arm — the drive/veteran-retention question belongs to the winnability program, not this bisect.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105b…`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and the bisect-anchor/merge drivers. Restored from the branch as untracked scratch for the run (it does not exist at `743e07d87`); the branch copy is the tracked file, so no deletion was needed afterwards.
- **Driver:** `scripts/bisect-reconciled-driver-20261111.js` (merge driver copied with corpus dir `perseed-bisect-reconciled-a/`, RUN `bisect-reconciled-pilot`, arm `bisect-reconciled`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker AND its sha256 is exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`).
- **Analyzer:** `scripts/bisect-reconciled-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-reconciled-a-summary.json`).
- **Proof:** `scripts/test-bisect-reconciled-a.js`, 50/50 green (before the band on the branch, on the target base with the fix swapped in, and re-verified after the band — see below).
- **Corpus:** `evidence/2026-11-11/perseed-bisect-reconciled-a/bisect-reconciled-s19039{1..8}-bisect-reconciled-pilot-fix.json` (8 files, `standingSha` `f8fda4295a99` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-11/bisect-reconciled-a-summary.json`.
- **Files in this arm:** prereg + driver + analyzer + proof (`ca3f1130f`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, `src/js/standing.js` was restored byte-identical to the reconciled base (sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`, verified in the detached checkout before checking the branch back out) and, on the branch, `src/js/standing.js` is the branch version (sha256 `1eec2c9235a8…`); `git status` shows no `src/js` modification. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
- **Proof re-run after the band:** 50/50 green on the branch after checkout-back (run as part of the rebase verification — see below).
- **Host write flap + two hardening fixes (2026-11-12, ~04:02–04:35 UTC):** a host EPERM write flap struck repeatedly while the proof was being run — bursts of minutes in which every `writeFileSync` failed (shell and node, /tmp and workspace alike), alternating with ~1-minute clear windows. Diagnosis, established by controlled tests: (a) the flap is host/burst based, NOT load-induced — a plain node process writing every 10s for 2 min went 12/12 while a game-loaded process in a parallel exec went 0/12, but the two execs land on different hosts; within one exec, a plain write went OK and a fresh plain process seconds later went FAIL, i.e. the flap flips mid-session; (b) the harness FREEZES `Date.now` (simulated game clock, +1ms per call — verified: two real 500ms sleeps apart, `Date.now` advanced 1ms then 2ms) — so the driver's `writeRobust` Date.now busy-wait backoff (inherited from merge-a) would burn all retries in ~0s of real time; observed exactly that (a 30-retry backoff exhausted in 2.3s). Fixes, both in this arm's files only, no assertion loosened: the proof's scratch writes use a `writeFileRetry` helper and the driver's `writeRobust` now backs off with `Atomics.wait` (real wall-clock sleep), and both retry budgets were raised 60→150 × 2s (5 min) to ride out a burst. The proof then passed 50/50 (its run took 106s, riding out one burst). The band itself needed no retry (0 instrument errors, all 8 files landed first-try). The write-flap skill's probe-first rule was followed throughout (probe `git update-ref refs/heads/probe HEAD`, wait for clear windows). If the flap recurs, the next arm should keep the Atomics.wait backoff and the 150-retry budget — and should NOT "fix" it by reverting to Date.now waits.
- **Safe-commit index clobber** struck on the prereg/proof commit (`ca3f1130f` — all 4 files showed staged-deleted + untracked after the commit); repaired with the `git ls-tree -r HEAD | git update-index --add --index-info` pipe; commit verified correct, `git status --short` empty + `git diff HEAD` empty afterwards. No work lost.
