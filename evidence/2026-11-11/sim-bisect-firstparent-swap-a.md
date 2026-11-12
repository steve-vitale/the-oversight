# sim-bisect-firstparent-swap-a — survival-collapse bisect FIRST-PARENT POLICY-SWAP leg (Loop A)

- **Run:** fleshout-20261112T0332Z, arm sim-bisect-firstparent-swap-a
- **Prereg:** `evidence/2026-11-11/sim-bisect-firstparent-swap-a-prereg.md` (committed `402e98d9f` before any judged sim)
- **Base:** `203a32775` (the merge's first parent: "sim-wave5kill-a: blooded damage/survivability lever for wave-5 kills")
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (copied from master as untracked scratch — it does not exist at this base — sha256 `311f105b…`, deleted before finishing per the prereg) + `scripts/bisect-firstparent-swap-driver-20261111.js`, `scripts/bisect-firstparent-swap-analyze-20261111.js`, `scripts/test-bisect-firstparent-swap-a.js` (committed `5d8fe4e8c`, **51/51 green** before the band and again after it)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, anchor-a, anchor2-a, merge-a, and policyswap-a (a control/bisect leg re-runs the same seeds; stated in the prereg), competent as of `5157782a4` verbatim (swapped in uncommitted) + the r131 roster-check fix swapped in uncommitted (see the swaps note below), SINGLE leg, mode `fix` only
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: `Game.waveCombatReadiness(w)` reads four named bars from LIVE village state — never a policy lever, never a fake number) and Steve's 2026-11-10 scholar-counts ruling (the scholar counts as a villager; their kills count toward the living-veteran bar). No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-firstparent-swap-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-firstparent-swap-a-summary.json`
- **Run notes (infrastructure):** the 8 seeds ran one per node process, sequentially, in ~8 min total (04:56–05:04Z), all 8 files landing first-try, 0 instrument errors on every seed. The driver refused the unswapped file live first (exit 2, "Refusing to run unswapped") before the swaps were performed. Both swaps restored byte-identical afterwards (see §9). The host write flap (see §9 + metric review) struck repeatedly through the run — the proof needed its full 15-min retry window once, and the instrument commit hit the safe-commit index clobber (repaired, no work lost). The proof file was truncated to 0 bytes by a python `open('w')` repair attempt during the flap and rebuilt from deterministic source (see §9).

## The swaps (this base predates BOTH the fix and the vetphantom policy)

At `203a32775`, `src/js/standing.js` is the PRE-FIX version (sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`, the same sha as the merge base) with NO `ROSTER CHECK` marker, and `scripts/policies/competent.js` is the base version (sha256 `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base and IS an ancestor of `5157782a4` — so the fix `standing.js` (extracted with `git show 5157782a4:src/js/standing.js`, sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) was swapped in UNCOMMITTED for the run, exactly as merge-a did; and the VETPHANTOM-BASE competent.js (extracted with `git show 5157782a4:scripts/policies/competent.js`, sha256 `0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05`, the same sha policyswap-a recorded as OLD) was swapped in UNCOMMITTED for the run, exactly as policyswap-a did. `standingSha` = `f8fda4295a99` and `policySha` = `0801abd82e52` are recorded per seed in the corpus. Neither swapped file was ever committed; both were restored byte-identical afterwards (sha256 `75762cb2259d…` + `a7ff5c516440…`, `git status` showing no `src/js` or `scripts/policies` modification — see §9).

The competent.js diff `203a32775..5157782a4` (verified fresh at run start) is exactly the COUNTER ANSWER addition (sim-counterclose-a 2026-11-10, 50 insertions / 1 deletion on the exports line): env-gated (`COUNTER_ANSWER=1`, default OFF), a pending table counter answered daily (sweeten at 1,500 kcal when the pantry holds 12,000+, else walk away). It is NOT the garden hunk — that lives in `5157782a4..3f136f07e` and is already exonerated. The `sim-harness.js` diff in the window is EMPTY; the vetfirst instrument did not exist at this base (added in the window).

## Verdict: INCONCLUSIVE

The analyzer (`scripts/bisect-firstparent-swap-analyze-20261111.js`, exit 0) classifies **4/8 survived** under the prereg decision rule (3–4/8 → INCONCLUSIVE). The first parent under the vetphantom policy survives 4/8 — between the vetphantom fix leg's 6/8 and the merge-cut's 1/8, and exactly at the top of the inconclusive band.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → FIRST_PARENT_SURVIVES | not met: 4/8 |
| ≤2/8 survive → FIRST_PARENT_COLLAPSES | not met: 4/8 |
| 3–4/8 → INCONCLUSIVE | **MET: 4/8** |

This leg alone does NOT settle whether the collapse predates the merge on the local line. That judgment needs the sibling firstparent-a leg's number (same base, own policy) — see §8 for the three-way read. What this leg DOES establish: with the policy controlled to the vetphantom base, the first parent is neither the 6/8 vetphantom base nor the 1/8 merge-cut — it sits mid-band, and one seed (190393) reproduces the vetphantom trajectory's headline exactly.

## §1 The firstparent-swap table — 4/8, median 150d, one seed headline-identical to vetphantom

| Seed | Vetphantom fix leg (`5157782a4`) | This firstparent-swap (`203a32775` + vetphantom policy) | Merge-a (`e4dbe581b`) |
|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4, deaths 109 | **86d village-lost**, standing 199, maxWave 4, deaths 88 | 103d, 165, 4, 87 |
| 190392 | 150d survived, standing 199, maxWave 4, deaths 102 | **144d village-lost**, standing 199, maxWave 4, deaths 77 | 150d SURVIVED, 199, 4, 70 |
| 190393 | 150d survived, standing 325, maxWave 5, deaths 66 | **150d SURVIVED, standing 325, maxWave 5, deaths 66 — headline-identical to vetphantom** | 115d, 395, 5, 76 |
| 190394 | 150d survived, standing 199, maxWave 4, deaths 89 | **43d village-lost**, standing 150, maxWave 4, deaths 52 | 140d, 199, 4, 100 |
| 190395 | 109d village-lost, standing 199, maxWave 4, deaths 94 | **150d SURVIVED**, standing 199, maxWave 4, deaths 96 | 76d, 199, 4, 53 |
| 190396 | 85d village-lost, standing 199, maxWave 4, deaths 81 | **87d village-lost**, standing 199, maxWave 4, deaths 80 | 126d, 199, 4, 93 |
| 190397 | 150d survived, standing 325, maxWave 5, deaths 88 | **150d SURVIVED**, standing 275, maxWave 5, deaths 74 | 115d, 199, 4, 72 |
| 190398 | 150d survived, standing 375, maxWave 5, deaths 78 | **150d SURVIVED**, standing 199, maxWave 4, deaths 96 | 136d, 199, 5, 70 |
| **band** | **6/8 survived, median 150d, deaths 707** | **4/8 survived, median 150d, deaths 629** | **1/8, median 126d, deaths 621** |

The band sits between the two anchors on every number: 4/8 survived (vetphantom 6/8, merge 1/8), median 150d (the upper-median convention on sorted days 43, 86, 87, 144, 150, 150, 150, 150 — a ceiling effect, 4/8 at the horizon, not a 150d typical run), deaths 629 (vetphantom 707, merge 621). The survivors are the same four seeds that survive most often across legs (190393, 190395, 190397, 190398); the dead are the band's usual dead (190391, 190392, 190394, 190396) with death days shuffled earlier on 190391 (86d vs 150d) and 190394 (43d — the earliest death in this band on any leg, vs 150d on vetphantom and 140d on the merge).

## §2 Trajectory identity — a fourth trajectory; 190393 tracks vetphantom to day 64

A field-by-field comparison of this corpus against the vetphantom FIX corpus and the merge-a corpus on master (read-only):

| Seed | vs vetphantom fix leg | vs merge-a |
|---|---|---|
| 190391 | daily differs (first divergence d73), deaths differ | daily differs, deaths differ |
| 190392 | daily differs (d37), deaths differ | daily differs, deaths differ |
| 190393 | **deaths list identical, headline identical** — daily diverges at d64, in `waveKills` only (w1 29 vs 26) | daily differs, deaths differ |
| 190394 | daily differs (d17), deaths differ | daily differs, deaths differ |
| 190395 | daily differs (d17), deaths differ | daily differs, deaths differ |
| 190396 | daily differs (d44), deaths differ | daily differs, deaths differ |
| 190397 | daily differs (d40), deaths differ | daily differs, deaths differ |
| 190398 | daily differs (d19), deaths differ | daily differs, deaths differ |

No seed is bit-identical to either reference — this is a fourth distinct trajectory, not a copy of either side. The one near-identity is instructive: on 190393 the firstparent-swap tracks the vetphantom trajectory through d63 (149 daily snapshots each, same length, same days 2–151), diverges at d64 in exactly one field — three more wave-1 kills — and still lands on the identical headline (150d, standing 325, maxWave 5, 66 deaths). The first parent CAN reproduce the vetphantom outcome on at least one seed; it is not uniformly collapsed.

The policy-insensitive control seeds (190392, 190394, 190396 — policyswap-a §2: bit-identical under both competent.js versions) all DIVERGE from vetphantom here (d37, d17, d44) — which is exactly what this leg is for: with the policy controlled, movement on the control seeds is attributable to game code in `203a32775..5157782a4` (or the base itself), not to the policy. The earliest divergences in the band are on 190394 and 190395 (both d17) — the first parent's game code differs from the vetphantom base early, and 190394's 43d death is the sharpest collapse signal on this base.

## §3 Wall numbers — between the vetphantom wall and the merge wall

| | Vetphantom fix leg | This firstparent-swap | Merge-a |
|---|---|---|---|
| Survived | 6/8 | **4/8** | 1/8 |
| Median survival | 150d | **150d** | 126d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** (190393, 190397) | 2/8 |
| Wave-4 unlocks | 8/8 | **8/8** | 8/8 |
| Deaths (band) | 707 | **629** | 621 |
| Standing range | 199–375 | **150–325** | 165–395 |
| Blooded | 5/8 | **4/8** (190391, 190393, 190397, 190398) | 1/8 |
| Scale at end | regional 8/8 | regional 7/8, village 1/8 (190394) | regional 7/8, village 1/8 (190395) |

The scale wall stands on this base too: nothing reaches national, the table, or a win; wave 4 unlocks everywhere and wave 5 on two seeds, but the villages that unlock it die before they can use it — except the four survivors, who end at regional with standing 199–325 and no closer to national than the dead villages. The median 150d is a ceiling artifact (half the band at the horizon), not evidence the typical village lives 150 days: the four dead villages die at 43–144d.

## §4 Death causes — the same combat-heavy profile, plus the bisect's first starvation death

629 deaths, all 8 seeds: villager combat 267, expedition 126, combat 130, the wild 74 — **597/629 (95%) combat / expedition / wild**. Monster 13, ambush 3, contest 3, a wound that wouldn't close 3, Spool 2, a stranger 2, the arena 2, the night 1, Big-Eyes 1, alien 1, **starvation 1**. The profile matches merge-a (585/621 combat/expedition/wild, starvation 0) and policyswap-a (572/609, starvation 0) with the same shape — villages die fighting, not hungry.

The one starvation death is the bisect's first: **seed 190398, day 124, the scholar starved** (kind villager, player=True). The village survived to d150 anyway via succession — the scholar's death did not end the run. It is recorded, not chased: a single starvation death on a surviving seed is a data point about late-run food pressure on the scholar, not a band signal (starvation 1/629).

## §5 Veteran bars — the fix holds, does visible work on one seed, and one village banks a tribute pair

- **Phantom days: 0 on all 8 seeds** (engine ready vs instrument recomputation, every daily snapshot). The roster-check fix holds on this base with the swap in — no phantom veteran is counted anywhere in the band.
- **Shadow-prevented days: 5 snapshots on 190394 only (d40–d43).** The old rule (no roster check) would have counted 1 extra veteran on each of those days — a fallen scholar-incarnation (Michelle Ahmed, scholar at kill time, later off-roster) that the fix correctly excludes; the engine's ready counts track the instrument (2, 1, 1, 0, 0) through those days. The fix does visible work here, unlike merge-a and policyswap-a (0 everywhere) — and on the same seed anchor2-a's fix bit (112 shadow-prevented days there; 5 here, because this trajectory dies at d43). The fix is not a no-op in general; it is a no-op on the other seven trajectories in this band.
- **First veteran day:** d28–d45 across seeds (190394 d28, 190393 d29, 190391 d31, 190398 d32, 190396 d34, 190392 d37, 190395 d37, 190397 d45) — same range as survivalcontrol (d28–d45), anchor-a, merge-a, and policyswap-a. Veterans still form on schedule; the front of the pipeline is intact.
- **Living veterans at end (engine ready counts):** ready4 veterans 1/0/3/0/1/0/4/2, ready5 veterans 1/0/2/0/0/0/2/1 across seeds 190391–190398. The survivors end with real veteran benches (190393: 3/2; 190397: 4/2; 190398: 2/1) — unlike merge-a and anchor-a, where the survivors ended veteran-poor.
- **Tribute:** ready at end on **1/8 seeds — 190397** (veterans 2, need 2, ready true). The first tribute-ready village in any post-vetphantom leg (merge-a 0/8, anchor-a 0/8, policyswap-a 0/8; anchor2-a had 2/8 on the true base). 190393 holds 1 payable veteran at end (ready 3/2, ladder 1) — one short of the pair.
- **Blooded:** 4/8 (190391, 190393, 190397, 190398, from the summary JSON) — between anchor-a's 1/8 and the vetphantom leg's 5/8.
- **Ladder divergence (old-rule read on this base):** the driver's end `ladderVets4` reads 0/0/1/0/0/0/2/0 against readiness 1/0/3/0/1/0/4/2 — the ladder at `203a32775` still has the OLD inline rule (vpOf + !vp.dead, no roster check, scholar excluded by the leg-3 rule), while readiness counts the scholar per Steve's 2026-11-10 ruling. The ladder read is reported, never judged: the tribute delivery reads through the ladder, so 190397 is the one seed where the bar and the delivery agree. The proof detects the ladder rule from loaded code and asserts accordingly (see §9).

The veteran pipeline is intact at the front (first kills land on time) and half-built at the back on this base: four villages survive, three bank veterans, one banks a tribute pair — the collapse is partial here, not total.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

405 captured veteran-filtered lines across all 8 seeds. The capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains — 121 lines, same instrument quirk flagged in survivalcontrol-b §5, anchor-a §6, merge-a §6, and policyswap-a §6; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera:

> 🍽️ Kurt leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190391 d5)
> 🛡️ Lulwa, Leo, Raj, Meera and Ingrid met them at the door — 4 put down, 1 driven off. Lulwa, Leo, Raj, Meera, Ingrid are hurt. (190391 d13)
> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Kurt just put down Ad Break... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190391 d31)
> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Ingrid just put down The Focus Group... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190391 d35)
> ◈ SYSTEM: "Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION. You've got a region; now make it a REALM. Bind fires under one head, or bend the knee t…" (190391 d55; same line on 190392, 190393, 190395, 190396)
> ⚠ This one is different — old, patient, unhurried — it has seen your kind before. A Elder veteran. (190391 d24)

And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute or the table (0 tribute / 0 table / 0 unlock mentions in the full vetSays capture). The 7 "wave" lines are all the one SYSTEM FINALES-need-a-NATION beat above — a finale announcement, not a wave-door announcement. (An earlier regex count of 100 "wave-door" hits was contaminated by the "met them at the door" fight lines; true wave-door mentions are 0.) The military tribute remains voiceless — with a sharper edge in the other direction than merge-a: here a village DOES become tribute-ready (190397), and still nothing is said about it. One mild repetition note, same as anchor2-a §6 and policyswap-a §6: the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs verbatim across seeds and villagers — a scripted routine line, not incoherent, but the same sentence wearing different names. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count on the first parent with the vetphantom policy vs the vetphantom fix leg's 6/8: INCONCLUSIVE (4/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 4/8 falls squarely in the 3–4/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree it sits mid-band (median 150d is a ceiling effect with 4/8 at the horizon; deaths 629 vs 707; wave-5 unlocks 2/8 vs 3/8; blooded 4/8 vs 5/8; standing range 150–325 vs 199–375).
- **What the metric set covered that the brief's framing did not:** the prereg promised a trajectory-identity comparison against both reference corpora, and it delivered the sharpest finding in the run (§2): no seed bit-identical to either side, but 190393 deaths-identical and headline-identical to vetphantom with a d64 waveKills-only divergence — the first parent can reproduce the vetphantom outcome on at least one seed.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 5 snapshots on 190394 — the fix does visible work on one trajectory). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, merge-a §7, and policyswap-a §7. The one starvation death (§4) is the scholar on a surviving seed, recorded as a data point.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this firstparent-swap leg on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7, anchor-a §7, merge-a §7, and policyswap-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, anchor2-a, merge-a, and policyswap-a ("recorder-corpus input … compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward on a 4/8 inconclusive corpus would be wrong.
- **Proof:** `scripts/test-bisect-firstparent-swap-a.js` 51/51 green before the band and again after it (instrument three-way agreement alive + TB-fallen + day after with the ladder rule detected from loaded code; seed-band identity; driver double leg guard live on the real vetphantom-base / first-parent competent.js texts and the pinned fix standing.js; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8; wrong-policy-sha corpus unclassifiable).

## §8 Follow-up owed — inconclusive, and what the coordinator reads next

1. **The first parent under the vetphantom policy gives 4/8 — INCONCLUSIVE.** It is neither the 6/8 vetphantom base nor the 1/8 merge-cut. The collapse is partial on this base, not total: four villages survive, three bank veterans, one banks a tribute pair, one seed reproduces the vetphantom headline exactly.
2. **The policy question on this base is NOT settled by this leg alone — it needs the sibling firstparent-a leg.** Three-way read for the coordinator:
   - If the sibling (own `203a32775` policy) also lands 3–4/8, the two legs agree: the policy is a non-factor on this base, the first parent sits mid-band on game code alone, and the bisect's next cut is INTO `203a32775..5157782a4` (H2 direction — a protective local commit the merge predates) with the merge's second-parent content still unexamined (H1).
   - If the sibling lands ≥5/8 while this leg is 4/8, the vetphantom-base policy is WORSE than the first parent's own policy on this base — the policy matters here, and the coordinator must not read the sibling leg alone.
   - If the sibling lands ≤2/8 while this leg is 4/8, the vetphantom-base policy IMPROVES the first parent — the policy is protective on this base, and the merge-cut's 1/8 reads differently again.
   - Either way: do not re-judge this leg's 4/8. A bigger band on this leg alone cannot change its verdict class without a new prereg.
3. **The confirmatory leg on the shipped reconciled master `743e07d87` (merge-a §8.5) is still owed** — same seeds, same policy — to verify the shipped tree's number once the first-parent question is settled.
4. **The 190394 signal is the sharpest collapse lead on this base:** earliest divergence (d17), earliest death (43d), and the one seed where the roster-check fix does visible work (5 shadow-prevented snapshots). A game-code bisect inside `203a32775..5157782a4` should check candidates against 190394 first — and against the control seeds 190392/190396, which also move on game code alone here.
5. **Standing items carried forward, unchanged:** the tribute stays voiceless (0 mentions — now with a tribute-ready village to announce, §6); the Elderberry `/elder/` filter quirk in the vetfirst instrument (121 noise lines here) still needs tightening by the next arm that reuses it; the scale wall stands (national 0, table 0, wins 0 — §3); the foraging-basket routine line still recurs verbatim across seeds.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (copied from master as untracked scratch — byte-identical to master, sha256 `311f105b…`; deleted from this worktree before finishing per the prereg; it already exists on master) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, merge-driver, and policyswap-driver.
- **Driver:** `scripts/bisect-firstparent-swap-driver-20261111.js` (policyswap-driver copied with corpus dir `perseed-bisect-firstparent-swap-a/`, RUN `bisect-firstparent-swap-pilot`, arm `bisect-firstparent-swap`, MODE hard-coded `fix`, plus the swap-aware DOUBLE leg guard: refuses to run unless the on-disk competent.js sha256 is exactly the vetphantom-base sha `0801abd82e52…` AND the on-disk standing.js carries the ROSTER CHECK marker with exactly the fix sha `f8fda4295a99…`; `policySha` + `standingSha` recorded per seed — all 8 seeds `0801abd82e52…` / `f8fda4295a99…`).
- **Analyzer:** `scripts/bisect-firstparent-swap-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-firstparent-swap-a-summary.json`).
- **Proof:** `scripts/test-bisect-firstparent-swap-a.js`, 51/51 green (before the band and after). Section 1 detects the ladder rule from loaded code: at this base the ladder still has the old inline rule (vpOf + !vp.dead, no roster check, scholar excluded), so a TB-fallen killer still counts on the ladder read (1) while readiness and the instrument read 0 — asserted as the documented old-rule value, not a failure (findings-a hermeticity fix, adopt-round-0215 Arm 3).
- **Corpus:** `evidence/2026-11-11/perseed-bisect-firstparent-swap-a/bisect-firstparent-swap-s19039{1..8}-bisect-firstparent-swap-pilot-fix.json` (8 files, `standingSha` `f8fda4295a99` and `policySha` `0801abd82e52` on every seed, 0 instrument errors on every seed). Summary: `evidence/2026-11-11/bisect-firstparent-swap-a-summary.json`.
- **Files in this arm:** prereg (`402e98d9f`), instrument (`5d8fe4e8c`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence commit pending — coordinator merges).
- **Restore verified:** after the band, both swapped files were restored byte-identical to the `203a32775` base — `src/js/standing.js` sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c` and `scripts/policies/competent.js` sha256 `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a` — and `git status` shows no `src/js` or `scripts/policies` modification. **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
- **Infrastructure notes for the next coordinator (write flap, this run):** the host write flap (EPERM on write, `local_write_flap_response`) ran in waves the whole run — one 10-minute continuous denial window (04:21–04:31Z, 40/40 probes EPERM) plus rapid flickers. Two findings worth carrying: (a) `sim-harness.js:161` replaces `Date.now` with a monotonic counter, so any `Date.now` busy-wait retry loop "sleeps" ~0.2ms real — the driver's `writeRobust` and the proof's retry loop were both fixed to `process.hrtime` waits in this arm (retry windows raised to 15 min); any other script that retries on `Date.now` inside a harness-loaded process has the same latent bug. (b) A python `open(path,'w')` repair attempt during the flap truncated the proof file to 0 bytes (open truncates before the write, which then EPERM'd) — the file was rebuilt from deterministic source; never open-for-write as a repair step during a flap, write to a copy first. The `muse.write`/`muse.edit` file tools kept working through the flap (runtime file API, not shell writes) and were used for the rebuild. The safe-commit index clobber struck on both commits in this arm (prereg + instrument); repaired both times with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe, verified `git status --short` + `git diff HEAD` clean of anything but the swaps. The worktree heartbeat script failed once on the flap (registry write EPERM, exit 1) — the registry itself stayed valid; last successful heartbeat 03:54:26Z, re-heartbeat owed at closeout.
