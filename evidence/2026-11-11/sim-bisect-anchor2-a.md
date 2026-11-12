# sim-bisect-anchor2-a — survival-collapse bisect TRUE ANCHOR leg (Loop B)

- **Run:** fleshout-20261111T2317Z, arm sim-bisect-anchor2-a
- **Prereg:** `evidence/2026-11-11/sim-bisect-anchor2-a-prereg.md` (committed `fae00a0d5` before any judged sim)
- **Base:** `5157782a4` (the TRUE vetphantom measurement base — verified from vetphantom-b's evidence header and corpus, not from the brief; see §8 of anchor-a for why the distinction matters)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`) + `scripts/bisect-anchor2-driver-20261111.js`, `scripts/bisect-anchor2-analyze-20261111.js`, `scripts/test-bisect-anchor2-a.js` (committed `d73ceb374`, **41/41 green**)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, and anchor-a (a control/bisect anchor re-runs the same seeds; stated in the prereg), competent verbatim, SINGLE leg, mode `fix` only (the roster-check fix is on this base, verified present at standing.js:239, sha256 `f8fda4295a99` recorded per seed — the same sha the vetphantom fix leg recorded)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar) and Steve's 2026-11-10 scholar-counts ruling. No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-anchor2-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-anchor2-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The driver took ~35 min for 8 seeds (vs anchor-a's ~10 min — machine contention; individual seeds took 2–4.5 min, all 8 files landing first-try, 0 instrument errors on every seed). The heartbeat script took ~2 min at run start (slow, as survivalcontrol-b and anchor-a also found). The `safe-commit.sh` index-clobber struck on BOTH commits in this arm (prereg + instrument); repaired both times with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe, verified `git status --short` empty + `git diff HEAD` empty. No work lost.

## Verdict: ANCHOR_REPRODUCES

The analyzer (`scripts/bisect-anchor2-analyze-20261111.js`, exit 0) classifies **6/8 survived** under the prereg decision rule (≥5/8 → ANCHOR REPRODUCES). The TRUE base `5157782a4` reproduces the vetphantom fix leg's 6/8 exactly — not just the headline count, but every per-seed headline number (§1) and, per §2, the full trajectories.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → ANCHOR REPRODUCES | **MET: 6/8** |
| ≤2/8 survive → ANCHOR DOES NOT REPRODUCE | not met |
| 3–4/8 → INCONCLUSIVE | not met |

## §1 The anchor table — the TRUE base is the vetphantom base, seed for seed

| Seed | Vetphantom fix leg (`5157782a4`) | This anchor (`5157782a4`) | Anchor-a / survivalcontrol (`3f136f07e` / `d33ca69f9`) |
|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4, deaths 109 | **150d survived, 199, 4, 109 — identical** | 103d, 165, 4, 87 |
| 190392 | 150d survived, standing 199, maxWave 4, deaths 102 | **150d survived, 199, 4, 102 — identical** | 126d, 199, 4, 73 |
| 190393 | 150d survived, standing 325, maxWave 5, deaths 66 | **150d survived, 325, 5, 66 — identical** | 149d, 199, 4, 80 |
| 190394 | 150d survived, standing 199, maxWave 4, deaths 89 | **150d survived, 199, 4, 89 — identical** | 91d, 199, 4, 80 |
| 190395 | 109d village-lost, standing 199, maxWave 4, deaths 94 | **109d village-lost, 199, 4, 94 — identical** | 65d, 199, 4, 51 |
| 190396 | 85d village-lost, standing 199, maxWave 4, deaths 81 | **85d village-lost, 199, 4, 81 — identical** | 150d SURVIVED, 360, 5, 98 |
| 190397 | 150d survived, standing 325, maxWave 5, deaths 88 | **150d survived, 325, 5, 88 — identical** | 142d, 370, 5, 87 |
| 190398 | 150d survived, standing 375, maxWave 5, deaths 78 | **150d survived, 375, 5, 78 — identical** | 103d, 199, 4, 59 |
| **band** | **6/8 survived, median 150d, deaths 707** | **6/8 survived, median 150d, deaths 707 — identical** | **1/8, median 126d, deaths 615** |

Every headline number on this anchor matches the vetphantom fix leg exactly — days, standing, maxWave, death counts. §2 proves it is the same trajectory, not a resemblance.

## §2 The anchor IS the vetphantom fix leg, seed for seed

A field-by-field comparison of this corpus against the vetphantom FIX corpus on master (`evidence/2026-11-11/perseed-vetphantom-b/`, `vetphantom-s<seed>-vetphantom-pilot-fix.json`, read-only):

| Seed | Head fields | Deaths list | Daily snapshots | vetSays count |
|---|---|---|---|---|
| 190391–190398 (all 8) | identical | identical | **sha256-identical** | identical (51/47/155/38/34/16/71/36) |

Daily-snapshot hashes match on all 8 seeds. Two runs on the same base (`5157782a4`) produce **deterministically identical trajectories** — the anchor reproduces the vetphantom fix leg exactly, which is what an anchor is for. Combined with anchor-a §2 (the `3f136f07e` corpus is sha-identical to survivalcontrol's), the picture is now complete on both sides:

- `5157782a4` → 6/8, median 150d, deaths 707 (this arm, = vetphantom fix leg)
- `3f136f07e` → 1/8, median 126d, deaths 615 (anchor-a, = survivalcontrol)

**The collapse sits inside `5157782a4..3f136f07e`.** The bisect's search window is confirmed, not merely hypothesized: the anchor reproduces on the true measurement base, and the later base collapses on the same seeds. The next arm bisects that range (§8).

## §3 Wall numbers — the wall is the vetphantom wall

| | Vetphantom fix leg | This anchor | Anchor-a / survivalcontrol |
|---|---|---|---|
| Survived | 6/8 | **6/8** | 1/8 |
| Median survival | 150d | **150d** | 126d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **3/8** | 2/8 |
| Wave-4 unlocks | 8/8 | 8/8 | 8/8 |
| Deaths (band) | 707 | **707** | 615 |
| Standing range | 199–375 | **199–375** | 165–370 |
| Blooded | 5/8 | **5/8 (190392, 190393, 190395, 190397, 190398 — from the summary JSON)** | 1/8 (190398 only) |

Blooded is read from the summary JSON (`bisect-anchor2-a-summary.json`, `wall.blooded: 5`), per the prereg — not eyeballed from text. It agrees with the vetphantom fix leg's 5/8 (anchor-a §3) and with the vetphantom-b summary's own per-seed fix-leg rows.

## §4 Death causes — identical lists, not just the same shape

707 deaths, all 8 seeds: villager combat 282, combat 177, expedition 122, the wild 81 — **662/707 (94%) combat / expedition / wild**. Monster 28, the arena 6, ambush 3, contest 3, Spool 2, a stranger 1, a wound that wouldn't close 1, lockjaw 1. Starvation 0, sickness 0, thirst 0. These are not merely the same profile as the vetphantom fix leg — the death lists themselves are JSON-identical (§2), so the cause counts are necessarily identical to the vetphantom leg's. Villages die fighting, not hungry, on the TRUE base exactly as measured. What changed between bases is not *how* villages die but *how soon* — and that change sits after `5157782a4`.

## §5 Veteran bars — the fix holds, and on one seed it does visible work

- **Phantom days: 0 on all 8 seeds** (engine ready vs instrument recomputation, every daily snapshot). The vetphantom roster-check fix holds on its own measurement base — and this arm's independent recomputation agrees with the vetphantom-b summary's own `phantomDaysFix: 0`.
- **Shadow-prevented days: 112, all on seed 190394 (d40–d151).** The old rule (no roster check) would have counted 3 wave-3 veterans there while the fixed engine counts 2 — one wave-3 killer is off-roster but alive in the vp record, and the fix correctly excludes them for 112 days. This arm's independent count agrees exactly with the vetphantom-b summary's `shadowPreventedFix: 112` (same seed, same day list d40–d151). The fix is not a no-op on this base: it is doing real work on 190394. It changes no survival outcome here (190394's ready4 veterans are 2 either way against a demand of 1), but the discrepancy is live and measurable — which is why the anchor-a corpus (0 shadow days on `3f136f07e`) and this corpus differ: the trajectories differ, and so does the phantom's footprint.
- **First veteran day:** d28–d48 across seeds — same range as survivalcontrol (d28–d45) and anchor-a. Veterans still form on schedule.
- **Living veterans at end (engine ready counts):** ready4 veterans 1/2/3/2/1/0/3/1, ready5 veterans 0/1/2/0/1/0/2/1 across seeds 190391–190398. The exception pattern matches the vetphantom fix leg's own end counts (vetphantom-b summary fix rows: endReady4 1/2/3/2/1/0/3/1, endReady5 0/1/2/0/1/0/2/1 — identical).
- **Tribute:** ready at end on **2/8 seeds** (190393, 190397 — veterans 2, payable 1, need 2, reason "ready"); the other 6 are `veterans-short`. This differs from anchor-a (0/8 at end on `3f136f07e`) — on the TRUE base two villages end the run holding a payable tribute pair. Nobody pays it within the horizon (no tribute delivery is recorded in the corpus), so the tribute stays voiceless (§6) — but the pair exists here, which it did not on the later base.
- **Blooded:** 5/8 (from the summary JSON — see §3).

The veteran pipeline is intact at the front (first kills land on time) and holds at the back on this base (6/8 villages survive to d150 with veterans banked). On the later base the back breaks (1/8). The collapse is downstream of the veteran pipeline's front end.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

448 captured veteran-filtered lines across all 8 seeds. The capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains — 121 lines, same instrument quirk flagged in survivalcontrol-b §5 and anchor-a §6; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera:

> 🍽️ Kurt leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190391 d5)
> 🛡️ Lulwa, Leo, Raj, Meera and Ingrid met them at the door — 4 put down, 1 driven off. Lulwa, Leo, Raj, Meera, Ingrid are hurt. (190391 d13)
> 💧 A man, maybe 30s, with a scarred cheek returns with water: +2 clean. (190394 d1)
> 👂 "You haven't earned that yet," A woman, maybe 30s, with a burn-scarred forearm says. (Trust too low.) (190397 d2)
> 🍲 A man, maybe 30s, with a scarred cheek had the day of their life — 1478 kcal. Two days of food from one person. (190394 d1)

And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, or the wave door (0 tribute / 0 table / 0 wave-door mentions in the full vetSays capture). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, still open) — now with a sharper edge: on this base two villages end the run tribute-ready (190393, 190397) and still nothing is said about it. One mild repetition note: the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs verbatim across seeds and villagers — a scripted routine line, not incoherent, but the same sentence wearing different names. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: ANCHOR_REPRODUCES (6/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 6/8 falls squarely in the ≥5/8 band, and no secondary metric was consulted to soften or strengthen it. The secondaries agree exactly (median 150d vs 150d; deaths 707 vs 707; wave-5 unlocks 3/8 vs 3/8; blooded 5/8 vs 5/8).
- **What the metric set covered that anchor-a's could not:** this prereg verified its base label from the prior arm's corpus (vetphantom-b's stated base + the standing sha in its per-seed JSONs) rather than from the brief — the exact failure mode anchor-a §7/§8 named. The label held: worktree tip `5157782a4`, standing sha `f8fda4295a99` on every seed, matching the vetphantom fix leg.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 112 days on 190394 — the fix does visible work). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7 and anchor-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this anchor on identical seeds, judged by the analyzer's decision rule — and here the before and after are the same trajectory. Same standing as survivalcontrol-b §7 and anchor-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, and anchor-a ("recorder-corpus input ... compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Proof:** `scripts/test-bisect-anchor2-a.js` 41/41 green before any judged sim (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8).

## §8 Follow-up owed — the bisect window is confirmed; the next arm bisects it (not this arm)

1. **The anchor reproduces.** `5157782a4` gives 6/8, median 150d, deaths 707 — the vetphantom fix leg, trajectory-identical. The bisect has a solid anchor.
2. **The collapse sits in `5157782a4..3f136f07e`.** Anchor-a proved `3f136f07e` gives 1/8, median 126d, deaths 615, trajectory-identical to survivalcontrol. The window is now bracketed on both ends with exact reproductions. Per anchor-a §8, that range contains the ENTIRE reconcile-divergence merge (`e4dbe581b`, reconcile branch merges, journey-landing r126 `3f136f07e`, Cursor PRs #118–121) — 117 files, +32,617/−669, 4,677 src/js insertions.
3. **One policy-side confound in the window (anchor-a §8, still open).** `scripts/policies/competent.js` differs across the range by one hunk in `workGarden` (the garden-keeper appointment moved before `makePlot`, OVE-160, Cursor PR #120). A garden-appointment reorder flipping 6/8 → 1/8 by itself is implausible, but deterministic chaos means any RNG-order change rerolls downstream trajectories, so it cannot be dismissed by inspection alone. **The next bisect arm must control for it** — e.g. run the `5157782a4` policy against the `3f136f07e` code (or vice versa) — before blaming game code alone.
4. **Bisect method owed:** bisect `5157782a4` → `3f136f07e` against the survived-count metric (same 8 seeds, same policy, same horizon), with the competent-policy garden hunk as an explicit bisect step. This arm does NOT attempt it — it anchors only, and the anchor it was given reproduces.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and bisect-anchor-driver.
- **Driver:** `scripts/bisect-anchor2-driver-20261111.js` (survivalcontrol-driver copied with corpus dir `perseed-bisect-anchor2-a/`, RUN `bisect-anchor2-pilot`, arm `bisect-anchor2`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker; sha `f8fda4295a99` recorded per seed — matches the vetphantom fix sha).
- **Analyzer:** `scripts/bisect-anchor2-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-anchor2-a-summary.json`).
- **Proof:** `scripts/test-bisect-anchor2-a.js`, 41/41 green.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-anchor2-a/bisect-anchor2-s19039{1..8}-bisect-anchor2-pilot-fix.json` (8 files). Summary: `evidence/2026-11-11/bisect-anchor2-a-summary.json`.
- **Files in this arm:** prereg (`fae00a0d5`), instrument (`d73ceb374`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence + corpus commit pending — coordinator merges).
- **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
